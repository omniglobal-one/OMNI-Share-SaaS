-- Fixes a TOCTOU race: app/api/upload/[room_id]/route.ts checked the per-user upload count
-- and then inserted the photo row as two separate round trips with a file upload in between,
-- with no DB-level lock — concurrent requests near the cap could all pass the check and all
-- insert, exceeding max_uploads_per_user. Enforce the cap atomically with a trigger that locks
-- the room row before counting, serializing concurrent inserts for that room.

create or replace function public.enforce_upload_cap()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count int;
  cap int;
begin
  select max_uploads_per_user into cap from rooms where id = new.room_id for update;
  if cap is null then
    return new; -- room not found; FK constraint on photos.room_id will reject the insert anyway
  end if;

  select count(*) into current_count from photos
    where room_id = new.room_id and uploader_id = new.uploader_id;

  if current_count >= cap then
    raise exception 'upload_cap_exceeded' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_upload_cap on photos;
create trigger trg_enforce_upload_cap
  before insert on photos
  for each row execute function public.enforce_upload_cap();
