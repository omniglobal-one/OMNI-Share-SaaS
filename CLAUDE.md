# OMNI Wall

## Status
- [x] Phase 1: Schema + RLS + Storage buckets + auth
- [ ] Phase 2: Join flow + room creation + my rooms page
- [ ] Phase 3: Upload flow
- [ ] Phase 4: Moderation queue + approve/reject
- [ ] Phase 5: Public wall + Realtime + slideshow
- [ ] Phase 6: Manager dashboard
- [ ] Phase 7: Admin dashboard
- [ ] Phase 8: Dark mode + polish

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
