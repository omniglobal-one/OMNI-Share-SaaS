'use server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { insertAuditLog } from '@/lib/audit'
import type { ActionResult } from '@/types'

export async function assignModerator(roomId: string, username: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const admin = createServiceRoleClient()

  // Lookup profile by username
  const { data: target } = await admin.from('profiles').select('id').eq('username', username).single()
  if (!target) return { success: false, error: 'User not found' }

  const { error } = await admin.from('room_moderators').insert({
    room_id: roomId,
    moderator_id: target.id,
    assigned_by: user.id,
  })

  if (error) {
    if (error.code === '23505') return { success: false, error: 'User is already a moderator' }
    return { success: false, error: error.message }
  }

  await insertAuditLog({ actorId: user.id, action: 'moderator.assign', targetType: 'room', targetId: roomId, metadata: { username } })

  return { success: true, data: undefined }
}

export async function removeModerator(roomId: string, moderatorId: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const admin = createServiceRoleClient()
  const { error } = await admin.from('room_moderators').delete().eq('room_id', roomId).eq('moderator_id', moderatorId)
  if (error) return { success: false, error: error.message }

  await insertAuditLog({ actorId: user.id, action: 'moderator.remove', targetType: 'room', targetId: roomId, metadata: { moderatorId } })

  return { success: true, data: undefined }
}
