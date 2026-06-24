'use server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { insertAuditLog } from '@/lib/audit'
import { deletePhoto as deleteFromStorage } from '@/lib/storage'
import type { ActionResult } from '@/types'

export async function moderatePhoto(
  photoId: string,
  status: 'approved' | 'rejected',
  rejectionReason?: string
): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const admin = createServiceRoleClient()

  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (!profile) return { success: false, error: 'Not authenticated' }

  const { data: photo } = await admin.from('photos').select('id, room_id, uploader_id').eq('id', photoId).single()
  if (!photo) return { success: false, error: 'Photo not found' }

  // Must be admin, room owner, or room moderator
  const isAdmin = profile.role === 'admin' || profile.role === 'manager'
  if (!isAdmin) {
    const { data: mod } = await admin
      .from('room_moderators')
      .select('id')
      .eq('room_id', photo.room_id)
      .eq('moderator_id', user.id)
      .single()
    const { data: room } = await admin.from('rooms').select('owner_id').eq('id', photo.room_id).single()
    if (!mod && room?.owner_id !== user.id) return { success: false, error: 'Insufficient permissions' }
  }

  const { error } = await admin.from('photos').update({
    status,
    moderated_by: user.id,
    moderated_at: new Date().toISOString(),
    ...(status === 'rejected' && rejectionReason ? { rejection_reason: rejectionReason } : {}),
  }).eq('id', photoId)

  if (error) return { success: false, error: error.message }

  // Resolve uploader username for the audit log
  const { data: uploader } = await admin
    .from('profiles')
    .select('username')
    .eq('id', photo.uploader_id)
    .single()

  await insertAuditLog({
    actorId: user.id,
    action: `photo.${status}`,
    targetType: 'room',
    targetId: photo.room_id,
    metadata: {
      photoId,
      ...(uploader?.username ? { uploader: uploader.username } : {}),
      ...(status === 'rejected' && rejectionReason ? { reason: rejectionReason } : {}),
    },
  })

  return { success: true, data: undefined }
}

export async function deletePhoto(photoId: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('role, is_suspended').eq('id', user.id).single()
  if (profile?.is_suspended) return { success: false, error: 'Your account is suspended' }

  const admin = createServiceRoleClient()
  const { data: photo } = await admin
    .from('photos')
    .select('id, uploader_id, status, storage_path, room_id')
    .eq('id', photoId)
    .single()

  if (!photo) return { success: false, error: 'Photo not found' }

  const isOwner = photo.uploader_id === user.id
  const isAdmin = profile?.role === 'admin'
  const canDelete = isAdmin || (isOwner && (photo.status === 'pending' || photo.status === 'rejected'))

  if (!canDelete) {
    // Check if moderator of this room
    const { data: mod } = await admin
      .from('room_moderators')
      .select('id')
      .eq('room_id', photo.room_id)
      .eq('moderator_id', user.id)
      .single()
    if (!mod) {
      const { data: room } = await admin.from('rooms').select('owner_id').eq('id', photo.room_id).single()
      if (room?.owner_id !== user.id) {
        return { success: false, error: 'Insufficient permissions' }
      }
    }
  }

  // Delete from storage
  await deleteFromStorage(photo.storage_path)

  const { error } = await admin.from('photos').delete().eq('id', photoId)
  if (error) return { success: false, error: error.message }

  await insertAuditLog({ actorId: user.id, action: 'photo.delete', targetType: 'photo', targetId: photoId })

  return { success: true, data: undefined }
}
