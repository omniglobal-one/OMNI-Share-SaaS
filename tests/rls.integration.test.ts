// Integration/RLS regression tests — run against a local Supabase stack (`supabase start`,
// requires Docker). These replicate the exploit checks that were done manually, by hand,
// against production during the 2026-08-17 security assessment — turning "I verified this
// once with a live curl command" into something that reruns automatically and would fail
// loudly if a future migration or policy change reintroduced any of these holes.
//
// Run with: npm run test:integration  (requires `supabase start` to be running first)
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'
const ANON_KEY = process.env.SUPABASE_ANON_KEY
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!ANON_KEY || !SERVICE_ROLE_KEY) {
  throw new Error(
    'SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are not set. Run `supabase status` after ' +
    '`supabase start` and export them (see package.json test:integration script) before running this suite.'
  )
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })

function anonClient(): SupabaseClient {
  return createClient(SUPABASE_URL, ANON_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function clientAs(email: string, password: string): Promise<SupabaseClient> {
  const client = anonClient()
  const { error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`sign-in failed for ${email}: ${error.message}`)
  return client
}

const PASSWORD = 'Test@2026!Integration'
const RUN_ID = Date.now().toString(36) // unique-ish per run so reruns don't collide on emails

const emails = {
  ownerA: `owner-a-${RUN_ID}@test.local`,
  ownerB: `owner-b-${RUN_ID}@test.local`,
  member: `member-${RUN_ID}@test.local`,
}

let ownerAId: string, ownerBId: string, memberId: string
let roomAId: string, roomBId: string
let pendingPhotoInRoomBId: string

beforeAll(async () => {
  // Two managers, each owning their own room, plus a regular member of room A. This mirrors
  // the exact shape used to manually verify the audit_logs/photos-UPDATE scoping fixes in
  // production: two accounts with no relationship to each other's rooms.
  for (const [key, email] of Object.entries(emails)) {
    const { data, error } = await admin.auth.admin.createUser({ email, password: PASSWORD, email_confirm: true })
    if (error) throw error
    if (key === 'ownerA') ownerAId = data.user.id
    if (key === 'ownerB') ownerBId = data.user.id
    if (key === 'member') memberId = data.user.id
  }

  await admin.from('profiles').update({ role: 'manager' }).in('id', [ownerAId, ownerBId])

  const { data: roomA, error: roomAErr } = await admin.from('rooms')
    .insert({ name: `Room A ${RUN_ID}`, join_code: `A${RUN_ID}`.slice(0, 6).toUpperCase(), owner_id: ownerAId, created_by: ownerAId, status: 'active' })
    .select('id').single()
  if (roomAErr) throw roomAErr
  roomAId = roomA.id

  const { data: roomB, error: roomBErr } = await admin.from('rooms')
    .insert({ name: `Room B ${RUN_ID}`, join_code: `B${RUN_ID}`.slice(0, 6).toUpperCase(), owner_id: ownerBId, created_by: ownerBId, status: 'active' })
    .select('id').single()
  if (roomBErr) throw roomBErr
  roomBId = roomB.id

  await admin.from('room_members').insert({ room_id: roomAId, user_id: memberId })

  const { data: photo, error: photoErr } = await admin.from('photos')
    .insert({ room_id: roomBId, uploader_id: ownerBId, storage_path: `rooms/${roomBId}/test.jpg`, public_url: 'https://example.test/x.jpg', status: 'pending' })
    .select('id').single()
  if (photoErr) throw photoErr
  pendingPhotoInRoomBId = photo.id

  await admin.from('audit_logs').insert({ actor_id: ownerBId, action: 'room.create', target_type: 'room', target_id: roomBId })
})

afterAll(async () => {
  // Best-effort cleanup — service role bypasses RLS entirely, so this always succeeds
  // regardless of what the tests below found broken.
  await admin.from('photos').delete().eq('room_id', roomBId)
  await admin.from('audit_logs').delete().eq('target_id', roomBId)
  await admin.from('room_members').delete().eq('room_id', roomAId)
  await admin.from('rooms').delete().in('id', [roomAId, roomBId])
  for (const id of [ownerAId, ownerBId, memberId]) {
    if (id) await admin.auth.admin.deleteUser(id)
  }
})

describe('profiles RLS — Critical fix (002/006)', () => {
  it('a regular member can only read their own profile, not the whole directory', async () => {
    const client = await clientAs(emails.member, PASSWORD)
    const { data, error } = await client.from('profiles').select('id')
    expect(error).toBeNull()
    expect(data?.map(r => r.id)).toEqual([memberId])
  })
})

describe('rooms / room_members RLS — Critical fix, recursion (003)', () => {
  it('a member can query rooms without hitting 42P17 infinite recursion', async () => {
    const client = await clientAs(emails.member, PASSWORD)
    const { error } = await client.from('rooms').select('id')
    expect(error).toBeNull()
  })

  it('a member can query room_members without hitting 42P17 infinite recursion', async () => {
    const client = await clientAs(emails.member, PASSWORD)
    const { error } = await client.from('room_members').select('id')
    expect(error).toBeNull()
  })
})

describe('photos RLS — Critical fix, anon access (004)', () => {
  it('anon has no direct read access to photos at all', async () => {
    const client = anonClient()
    const { data, error } = await client.from('photos').select('id')
    // Either an empty result (policy denies with no error) or an explicit error is acceptable
    // — what must NOT happen is anon seeing another room's photo.
    expect(error === null ? data?.length : 0).toBe(0)
  })
})

describe('audit_logs RLS — High fix (008)', () => {
  it('a manager cannot read audit log entries for a room they do not own', async () => {
    const client = await clientAs(emails.ownerA, PASSWORD)
    const { data, error } = await client.from('audit_logs').select('id, target_id').eq('target_id', roomBId)
    expect(error).toBeNull()
    expect(data ?? []).toHaveLength(0)
  })
})

describe('photos UPDATE RLS — Medium fix, manager cross-room scoping (008)', () => {
  it('a manager cannot update a photo in a room they do not own or moderate', async () => {
    const client = await clientAs(emails.ownerA, PASSWORD)
    const { data, error } = await client
      .from('photos')
      .update({ status: 'rejected' })
      .eq('id', pendingPhotoInRoomBId)
      .select('id')
    expect(error).toBeNull()
    expect(data ?? []).toHaveLength(0) // zero rows affected — the update was rejected by RLS

    const { data: stillPending } = await admin.from('photos').select('status').eq('id', pendingPhotoInRoomBId).single()
    expect(stillPending?.status).toBe('pending')
  })

  it('the actual owner CAN update their own room\'s photo (sanity check the policy isn\'t just broken)', async () => {
    const client = await clientAs(emails.ownerB, PASSWORD)
    const { data, error } = await client
      .from('photos')
      .update({ status: 'approved' })
      .eq('id', pendingPhotoInRoomBId)
      .select('id')
    expect(error).toBeNull()
    expect(data ?? []).toHaveLength(1)
  })
})

describe('rate_limits RPC — High fix, execute grant lockdown (007)', () => {
  it('check_rate_limit is not callable by an authenticated user', async () => {
    const client = await clientAs(emails.member, PASSWORD)
    const { error } = await client.rpc('check_rate_limit', { p_key: 'test', p_max_count: 5, p_window_seconds: 60 })
    expect(error).not.toBeNull()
  })

  it('check_rate_limit is not callable by anon', async () => {
    const client = anonClient()
    const { error } = await client.rpc('check_rate_limit', { p_key: 'test', p_max_count: 5, p_window_seconds: 60 })
    expect(error).not.toBeNull()
  })
})

describe('upload cap trigger — Medium fix, atomic enforcement (009)', () => {
  it('rejects an insert once max_uploads_per_user is reached for that room/uploader', async () => {
    const { data: room } = await admin.from('rooms')
      .insert({ name: `Cap room ${RUN_ID}`, join_code: `C${RUN_ID}`.slice(0, 6).toUpperCase(), owner_id: ownerAId, created_by: ownerAId, status: 'active', max_uploads_per_user: 1 })
      .select('id').single()
    const capRoomId = room!.id

    const first = await admin.from('photos').insert({
      room_id: capRoomId, uploader_id: memberId,
      storage_path: `rooms/${capRoomId}/1.jpg`, public_url: 'https://example.test/1.jpg', status: 'pending',
    })
    expect(first.error).toBeNull()

    const second = await admin.from('photos').insert({
      room_id: capRoomId, uploader_id: memberId,
      storage_path: `rooms/${capRoomId}/2.jpg`, public_url: 'https://example.test/2.jpg', status: 'pending',
    })
    expect(second.error).not.toBeNull()
    expect(second.error?.message).toContain('upload_cap_exceeded')

    await admin.from('photos').delete().eq('room_id', capRoomId)
    await admin.from('rooms').delete().eq('id', capRoomId)
  })
})
