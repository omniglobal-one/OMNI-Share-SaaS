-- Fixes Critical Finding: infinite recursion in rooms / room_members / room_moderators / photos
-- RLS policies. rooms' SELECT policy queried room_members and room_moderators; those tables'
-- policies queried rooms right back — a mutual cycle Postgres detects as 42P17.
--
-- Fix: route every cross-table membership/ownership/role check through SECURITY DEFINER
-- helper functions. Functions created here are owned by the migration-running role (table
-- owner), so queries inside them bypass RLS on the underlying tables entirely, breaking the
-- cycle at its root instead of just moving it around.

create or replace function public.fn_owns_room(p_room_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from rooms where id = p_room_id and owner_id = p_user_id);
$$;

create or replace function public.fn_is_room_member(p_room_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from room_members where room_id = p_room_id and user_id = p_user_id);
$$;

create or replace function public.fn_is_room_moderator(p_room_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from room_moderators where room_id = p_room_id and moderator_id = p_user_id);
$$;

create or replace function public.fn_user_role(p_user_id uuid)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from profiles where id = p_user_id;
$$;

-- ── rooms ────────────────────────────────────────────────────────────────
drop policy if exists "Rooms viewable by members and managers" on rooms;
create policy "Rooms viewable by members and managers" on rooms
  for select to authenticated
  using (
    owner_id = auth.uid()
    or public.fn_is_room_member(id, auth.uid())
    or public.fn_is_room_moderator(id, auth.uid())
    or public.fn_user_role(auth.uid()) in ('admin', 'manager')
  );

-- ── room_members ─────────────────────────────────────────────────────────
drop policy if exists "Room members visible to room members and managers" on room_members;
create policy "Room members visible to room members and managers" on room_members
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.fn_owns_room(room_id, auth.uid())
    or public.fn_is_room_moderator(room_id, auth.uid())
    or public.fn_user_role(auth.uid()) in ('admin', 'manager')
  );

drop policy if exists "Members can leave or owners/admins can remove" on room_members;
create policy "Members can leave or owners/admins can remove" on room_members
  for delete to authenticated
  using (
    user_id = auth.uid()
    or public.fn_owns_room(room_id, auth.uid())
    or public.fn_user_role(auth.uid()) = 'admin'
  );

-- ── room_moderators ──────────────────────────────────────────────────────
drop policy if exists "Room moderators visible to room owners, mods, admins" on room_moderators;
create policy "Room moderators visible to room owners, mods, admins" on room_moderators
  for select to authenticated
  using (
    moderator_id = auth.uid()
    or public.fn_owns_room(room_id, auth.uid())
    or public.fn_user_role(auth.uid()) in ('admin', 'manager')
  );

drop policy if exists "Owners and admins can assign moderators" on room_moderators;
create policy "Owners and admins can assign moderators" on room_moderators
  for insert to authenticated
  with check (
    public.fn_owns_room(room_id, auth.uid())
    or public.fn_user_role(auth.uid()) = 'admin'
  );

drop policy if exists "Owners and admins can remove moderators" on room_moderators;
create policy "Owners and admins can remove moderators" on room_moderators
  for delete to authenticated
  using (
    public.fn_owns_room(room_id, auth.uid())
    or public.fn_user_role(auth.uid()) = 'admin'
  );

-- ── photos (authenticated policies — anon policy handled in 004) ───────────
drop policy if exists "Photos visible to room members and moderators" on photos;
create policy "Photos visible to room members and moderators" on photos
  for select to authenticated
  using (
    uploader_id = auth.uid()
    or public.fn_is_room_member(room_id, auth.uid())
    or public.fn_is_room_moderator(room_id, auth.uid())
    or public.fn_owns_room(room_id, auth.uid())
    or public.fn_user_role(auth.uid()) = 'admin'
  );

drop policy if exists "Members can upload photos" on photos;
create policy "Members can upload photos" on photos
  for insert to authenticated
  with check (
    uploader_id = auth.uid()
    and public.fn_is_room_member(room_id, auth.uid())
  );

drop policy if exists "Uploaders can delete their own pending/rejected photos" on photos;
create policy "Uploaders can delete their own pending/rejected photos" on photos
  for delete to authenticated
  using (
    (uploader_id = auth.uid() and status in ('pending', 'rejected'))
    or public.fn_is_room_moderator(room_id, auth.uid())
    or public.fn_owns_room(room_id, auth.uid())
    or public.fn_user_role(auth.uid()) = 'admin'
  );

drop policy if exists "Moderators can update photo status" on photos;
create policy "Moderators can update photo status" on photos
  for update to authenticated
  using (
    public.fn_is_room_moderator(room_id, auth.uid())
    or public.fn_owns_room(room_id, auth.uid())
    or public.fn_user_role(auth.uid()) in ('admin', 'manager')
  );
