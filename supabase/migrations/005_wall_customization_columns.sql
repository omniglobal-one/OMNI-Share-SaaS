-- Documents columns that were previously added directly against production without a
-- matching migration file (Finding: schema drift). Both already exist live; this migration
-- is a no-op there and exists purely so the repo's migration history reproduces the real
-- schema going forward.
alter table rooms add column if not exists wall_colors jsonb;
alter table rooms add column if not exists social_links jsonb default '[]'::jsonb;
