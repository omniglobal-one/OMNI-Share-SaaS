-- Discovered while live-verifying migration 002: "Admins and managers can read all profiles"
-- (and the pre-existing "Admins can update/delete any profile" policies) check the caller's
-- own role via `EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() ...)` — a self-
-- referencing subquery on the same table the policy protects. With multiple permissive
-- policies on profiles, Postgres must resolve row-visibility for the inner `p` using the
-- same policy set again, which recurses (42P17), exactly like the rooms/room_members bug
-- fixed in 003. Route all of these through the existing fn_user_role() SECURITY DEFINER
-- helper (from 003), which bypasses RLS internally and terminates immediately.

drop policy if exists "Admins and managers can read all profiles" on profiles;
create policy "Admins and managers can read all profiles" on profiles
  for select to authenticated
  using (public.fn_user_role(auth.uid()) in ('admin', 'manager'));

drop policy if exists "Admins can update any profile" on profiles;
create policy "Admins can update any profile" on profiles
  for update to authenticated
  using (public.fn_user_role(auth.uid()) = 'admin');

drop policy if exists "Admins can delete profiles" on profiles;
create policy "Admins can delete profiles" on profiles
  for delete to authenticated
  using (public.fn_user_role(auth.uid()) = 'admin');
