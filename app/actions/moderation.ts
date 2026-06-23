'use server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { insertAuditLog } from '@/lib/audit'
import type { ActionResult } from '@/types'

async function canModerate(userId: string, roomId: string): Promise<boolean> {
  const admin = createServiceRoleClient()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', userId).single()
  if (profile?.role === 'admin' || profile?.role === 'manager') return true

  const { data: mod } = await admin.from('room_moderators').select('id').eq('room_id', roomId).eq('moderator_id', userId).single()
  if (mod) return true

  const { data: room } = await admin.from('rooms').select('owner_id').eq('id', roomId).single()
  return room?.owner_id === userId
}

export async function approvePhoto(photoId: string, roomId: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const allowed = await canModerate(user.id, roomId)
  if (!allowed) return { success: false, error: 'Insufficient permissions' }

  const admin = createServiceRoleClient()
  const { error } = await admin.from('photos').update({
    status: 'approved',
    moderated_by: user.id,
    moderated_at: new Date().toISOString(),
  }).eq('id', photoId)

  if (error) return { success: false, error: error.message }

  // Increment approved_count on room (best-effort)
  await Promise.resolve(admin.rpc('increment_approved_count', { room_id_param: roomId })).catch(() => {})

  await insertAuditLog({ actorId: user.id, action: 'photo.approve', targetType: 'photo', targetId: photoId, metadata: { roomId } })

  return { success: true, data: undefined }
}

export async function rejectPhoto(photoId: string, roomId: string, reason?: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const allowed = await canModerate(user.id, roomId)
  if (!allowed) return { success: false, error: 'Insufficient permissions' }

  const admin = createServiceRoleClient()
  const updateData: Record<string, unknown> = {
    status: 'rejected',
    moderated_by: user.id,
    moderated_at: new Date().toISOString(),
  }
  if (reason) updateData['rejection_reason'] = reason

  const { error } = await admin.from('photos').update(updateData).eq('id', photoId)
  if (error) return { success: false, error: error.message }

  await insertAuditLog({
    actorId: user.id,
    action: 'photo.reject',
    targetType: 'photo',
    targetId: photoId,
    metadata: { roomId, ...(reason ? { reason } : {}) },
  })

  return { success: true, data: undefined }
}
