-- Adds IP-based rate limiting, matching the pattern already used in OMNI Queue. Nothing in
-- this app previously throttled join-code guessing, wall unlock attempts, or login attempts —
-- the join code is 6 chars from a 32-char alphabet (~1B combinations) and was fully guessable
-- at unlimited speed with no backoff.

create table if not exists public.rate_limits (
  id         uuid primary key default gen_random_uuid(),
  key        text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_rate_limits_key_created on public.rate_limits(key, created_at);

create or replace function public.check_rate_limit(p_key text, p_max_count int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count int;
begin
  delete from public.rate_limits
    where key = p_key and created_at < now() - (p_window_seconds || ' seconds')::interval;

  select count(*) into current_count
    from public.rate_limits
    where key = p_key and created_at >= now() - (p_window_seconds || ' seconds')::interval;

  if current_count >= p_max_count then
    return false;
  end if;

  insert into public.rate_limits (key) values (p_key);
  return true;
end;
$$;

-- Server-only: never let anon/authenticated call this directly (see finding on OMNI Queue
-- where an equivalent function was left callable by anyone with the public key).
revoke execute on function public.check_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, int, int) to service_role;
