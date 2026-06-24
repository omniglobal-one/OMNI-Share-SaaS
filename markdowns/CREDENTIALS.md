# OMNI Wall SaaS — Credentials

**Supabase Project:** `ogsvcmhaelneajwulcas` (eu-west-1)  
**Production URL:** https://omni-wall-saas.vercel.app  
**GitHub Repo:** omniglobal-one/omni-wall-saas

---

## Staff Accounts

All staff accounts use password: **`Omni@2026!`**

| Email | Password | Role | Name |
|-------|----------|------|------|
| admin@omniwall.co | `Omni@2026!` | admin | Jonathan Chikwanda |
| sarah@omniwall.co | `Omni@2026!` | manager | Sarah Chen |
| marcus@omniwall.co | `Omni@2026!` | manager | Marcus Ndlovu |
| emma@omniwall.co | `Omni@2026!` | moderator | Emma Wilson |
| david@omniwall.co | `Omni@2026!` | moderator | David Moyo |

---

## Demo / Regular User Accounts

All demo accounts use password: **`Omni@2026!`**

| Email | Password | Role | Name |
|-------|----------|------|------|
| alice@demo.com | `Omni@2026!` | user | Alice Zimba |
| bob@demo.com | `Omni@2026!` | user | Bob Chigumba |
| carol@demo.com | `Omni@2026!` | user | Carol Mutasa |
| dan@demo.com | `Omni@2026!` | user | Dan Mhaka |
| eve@demo.com | `Omni@2026!` | user | Eve Ncube |

---

## Anonymous / Guest Users

Guests do **not** need an account. They join via:
1. Go to `/join` (or the production URL)
2. Enter the 6-character room code shown at the event
3. Optionally enter a display name
4. They are signed in anonymously via Supabase and joined to the room

Anonymous sessions expire when the browser is closed.

---

## Role Permissions

| Role | Can do |
|------|--------|
| **admin** | Everything — all rooms, all users, create/delete anything |
| **manager** | Create rooms, manage their own rooms, approve/reject photos, view all members |
| **moderator** | Approve/reject photos in assigned rooms |
| **user** | Upload photos to rooms they've joined |
| **guest (anonymous)** | Upload photos to rooms they joined via code |

---

## Supabase Keys

| Key | Value |
|-----|-------|
| Anon Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nc3ZjbWhhZWxuZWFqd3VsY2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MjUxODAsImV4cCI6MjA5NzUwMTE4MH0.ctmu53Sbt9RneyCkst1lLYu4Aq2dKfPL-wH2Zj7Muz0` |
| Service Role Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nc3ZjbWhhZWxuZWFqd3VsY2FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTkyNTE4MCwiZXhwIjoyMDk3NTAxMTgwfQ.4OTHypCn3OfZqDawu_4TtyYEAxw2w-qzs9a6O6vRPxQ` |
