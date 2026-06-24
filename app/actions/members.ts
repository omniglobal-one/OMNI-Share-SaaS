'use server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { insertAuditLog } from '@/lib/audit'
import type { ActionResult } from '@/types'

export async function guestJoinRoom(code: string, displayName?: string): Promise<ActionResult<string>> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const admin = createServiceRoleClient()

  // Ensure profile exists — anonymous sign-in may not trigger the DB hook in time
  const { data: existingProfile } = await admin.from('profiles').select('id').eq('id', user.id).single()
  if (!existingProfile) {
    await admin.from('profiles').insert({
      id: user.id,
      ...(displayName ? { full_name: displayName } : {}),
      role: 'user',
      is_suspended: false,
    })
  } else if (displayName) {
    await admin.from('profiles').update({ full_name: displayName }).eq('id', user.id)
  }

  const { data: room } = await admin
    .from('rooms')
    .select('id, status')
    .eq('join_code', code.toUpperCase())
    .single()

  if (!room) return { success: false, error: "That code doesn't match any active room." }
  if (room.status === 'archived') return { success: false, error: 'This event has ended.' }

  const { data: existing } = await admin
    .from('room_members')
    .select('id')
    .eq('room_id', room.id)
    .eq('user_id', user.id)
    .single()

  if (existing) return { success: true, data: room.id }

  const { error } = await admin.from('room_members').insert({ room_id: room.id, user_id: user.id })
  if (error) return { success: false, error: error.message }

  await insertAuditLog({ actorId: user.id, action: 'room.join', targetType: 'room', targetId: room.id })

  return { success: true, data: room.id }
}

export async function joinRoom(code: string): Promise<ActionResult<string>> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('is_suspended').eq('id', user.id).single()
  if (profile?.is_suspended) return { success: false, error: 'Your account is suspended' }

  const admin = createServiceRoleClient()

  // Find room by join code
  const { data: room } = await admin
    .from('rooms')
    .select('id, status')
    .eq('join_code', code.toUpperCase())
    .single()

  if (!room) return { success: false, error: 'That code doesn\'t match any active room.' }
  if (room.status === 'archived') return { success: false, error: 'This event has ended.' }

  // Check already a member
  const { data: existing } = await admin
    .from('room_members')
    .select('id')
    .eq('room_id', room.id)
    .eq('user_id', user.id)
    .single()

  if (existing) return { success: true, data: room.id }

  const { error } = await admin.from('room_members').insert({
    room_id: room.id,
    user_id: user.id,
  })
  if (error) return { success: false, error: error.message }

  await insertAuditLog({ actorId: user.id, action: 'room.join', targetType: 'room', targetId: room.id })

  return { success: true, data: room.id }
}

export async function removeMember(roomId: string, userId: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const admin = createServiceRoleClient()

  // Only the room owner, an admin, or the member themselves may remove a membership
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'
  const isSelf = user.id === userId
  if (!isAdmin && !isSelf) {
    const { data: room } = await admin.from('rooms').select('owner_id').eq('id', roomId).single()
    if (room?.owner_id !== user.id) return { success: false, error: 'Insufficient permissions' }
  }

  const { error } = await admin
    .from('room_members')
    .delete()
    .eq('room_id', roomId)
    .eq('user_id', userId)

  if (error) return { success: false, error: error.message }

  await insertAuditLog({ actorId: user.id, action: 'room.remove_member', targetType: 'room', targetId: roomId, metadata: { userId } })

  return { success: true, data: undefined }
}
