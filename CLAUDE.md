# OMNI Wall

## Status
- [x] Phase 1: Schema + RLS + Storage buckets + auth
- [x] Phase 2: Join flow + room creation + my rooms page
- [x] Phase 3: Upload flow
- [x] Phase 4: Moderation queue + approve/reject
- [x] Phase 5: Public wall + live updates (polling, see Incident Log) + slideshow
- [x] Phase 6: Manager dashboard
- [x] Phase 7: Admin dashboard
- [x] Phase 8: PWA + polish

All phases shipped as of 2026-08-13. This checklist previously showed only Phase 1 done
despite every later phase being fully built and live — kept out of date long enough to
almost cause a real mistake once already (see the audit + fix-up work below). Keep this
in sync with reality going forward.

## Architecture
Next.js 14 App Router, Supabase (Auth + DB + Storage + Realtime), TypeScript strict, Tailwind CSS.

## Environment Variables
- NEXT_PUBLIC_SUPABASE_URL — Supabase project URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY — Supabase anon key
- SUPABASE_SERVICE_ROLE_KEY — Service role (server-only)
- NEXT_PUBLIC_APP_URL — Public app URL
- ADMIN_USER_ID — UUID of the initial admin user

## Deployment Notes
- Storage buckets: `photos` (private), `room-banners` (public)
- Realtime: enabled on photos table
- Supabase Auth: email/password + magic link
- **Current Supabase ref (production, verified 2026-08-13): `ogsvcmhaelneajwulcas`** — confirmed by reading the live `NEXT_PUBLIC_SUPABASE_URL` env var in the Vercel project. Older docs/memory referencing `yqbbtxugfrmqppqfczfz` or `iocdpnddxnpeskovomng` are stale.

## Incident Log

### 2026-08-13 — Site down: MIDDLEWARE_INVOCATION_TIMEOUT (504)
**Cause:** The Supabase project backing production (`ogsvcmhaelneajwulcas`) had auto-paused (free tier inactivity). Middleware calls `supabase.auth.getUser()` on every request, which hung against the paused DB until Vercel's edge middleware timeout fired.

**First attempt failed:** Restored a different, previously-documented ref (`yqbbtxugfrmqppqfczfz`) based on stale project memory — the 504 persisted because that ref was no longer the one in use.

**Actual fix:** Read the real ref from Vercel's production env vars (`GET /v9/projects/{id}/env?decrypt=true`, key `NEXT_PUBLIC_SUPABASE_URL`), then restored that Supabase project via `POST /v1/projects/{ref}/restore` and polled `GET /v1/projects` until `status: ACTIVE_HEALTHY`. Site confirmed back to `200 OK`.

**Takeaway:** If this happens again, verify the live Vercel env var before restoring — don't trust a remembered ref.

### 2026-08-13 — Production readiness audit + fixes
A full audit found migration `002_fix_rls_policies.sql` had never actually been applied to
production (profiles + room join codes were fully readable by any authenticated/guest
session), the `photos` table's anon SELECT policy wasn't room-scoped (any approved photo in
any room was readable without the join code), and `rooms`/`room_members`/`room_moderators`
RLS policies mutually recursed (`42P17`), breaking Realtime for every logged-in/guest session.

**Fixed same day**, migrations `002` (bug-fixed: a self-referencing `id` column reference in
the moderator-profiles policy was ambiguous and had never been caught since 002 was never
run), `003`–`006`:
- `003_fix_recursive_rls.sql` — routes all cross-table RLS checks through `SECURITY DEFINER`
  helper functions (`fn_owns_room`, `fn_is_room_member`, `fn_is_room_moderator`,
  `fn_user_role`) that bypass RLS internally, breaking the recursion cycle.
- `004_scope_public_photo_access.sql` — drops the global anon `photos` SELECT policy entirely.
  Public wall access now goes exclusively through the already-correct, cookie-gated,
  service-role-backed `app/api/rooms/[id]/wall/route.ts` and `app/room/[id]/wall/page.tsx`.
  `hooks/usePhotoWall.ts` was rewritten to poll that endpoint (5s interval) instead of
  subscribing to Postgres changes directly as anon — direct anon access was the very thing
  making the leak exploitable.
- `006_fix_profiles_self_recursion.sql` — discovered *while verifying the 002 fix live*:
  `profiles`' own "admin can read all profiles" policy self-referenced `profiles` in a way
  that recurses the same way once multiple permissive policies exist on one table. Routed
  through `fn_user_role()` too. **Lesson: this self-referencing "check my own role" idiom is
  a recurring Supabase RLS trap (see mistakes.md §L1) — audit every table with more than one
  permissive policy for it, not just the two tables an audit happens to flag.**

Also fixed: manager moderation was scoped to *any* room platform-wide instead of owned/
assigned rooms only (inconsistent with every other room-management action); the two
duplicate approve/reject implementations (`app/actions/photos.ts` and
`app/actions/moderation.ts`) are now a single source of truth, with the latter as a thin
wrapper (both are genuinely used — by `ManageTabs.tsx` and `ModerationPanel.tsx`
respectively, not dead code as first suspected).

All fixes verified live against production (anon reads return empty, cross-role reads work
correctly, no more `42P17`) before being committed.
