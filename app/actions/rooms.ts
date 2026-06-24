'use server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { generateJoinCode } from '@/lib/join-code'
import { insertAuditLog } from '@/lib/audit'
import { deleteBanner } from '@/lib/storage'
import type { ActionResult } from '@/types'

async function generateUniqueJoinCode(supabase: ReturnType<typeof createServiceRoleClient>): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generateJoinCode()
    const { data } = await supabase.from('rooms').select('id').eq('join_code', code).single()
    if (!data) return code
  }
  throw new Error('Failed to generate unique join code after 10 attempts')
}

export async function createRoom(formData: {
  name: string
  description?: string
  bannerUrl?: string
  maxUploadsPerUser?: number
}): Promise<ActionResult<string>> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('role, is_suspended').eq('id', user.id).single()
  if (!profile) return { success: false, error: 'Profile not found' }
  if (profile.is_suspended) return { success: false, error: 'Your account is suspended' }
  if (profile.role !== 'admin' && profile.role !== 'manager') {
    return { success: false, error: 'Insufficient permissions' }
  }

  const admin = createServiceRoleClient()
  const joinCodeResult = await generateUniqueJoinCode(admin).catch(() => null)
  if (!joinCodeResult) return { success: false, error: 'Failed to generate join code' }

  const insertData: Record<string, unknown> = {
    name: formData.name,
    join_code: joinCodeResult,
    owner_id: user.id,
    created_by: user.id,
    ...(formData.description ? { description: formData.description } : {}),
    ...(formData.bannerUrl ? { banner_url: formData.bannerUrl } : {}),
    ...(formData.maxUploadsPerUser !== undefined ? { max_uploads_per_user: formData.maxUploadsPerUser } : {}),
  }

  const { data: room, error } = await admin.from('rooms').insert(insertData).select('id').single()
  if (error || !room) return { success: false, error: error?.message ?? 'Failed to create room' }

  await insertAuditLog({ actorId: user.id, action: 'room.create', targetType: 'room', targetId: room.id, metadata: { name: formData.name } })

  return { success: true, data: room.id }
}

async function assertRoomOwner(userId: string, roomId: string, role: string): Promise<boolean> {
  if (role === 'admin') return true
  const admin = createServiceRoleClient()
  const { data: room } = await admin.from('rooms').select('owner_id').eq('id', roomId).single()
  return room?.owner_id === userId
}

export async function updateRoom(roomId: string, formData: {
  name?: string
  description?: string
  bannerUrl?: string
  maxUploadsPerUser?: number
  wallColors?: { bg: string; text: string; accent: string }
  socialLinks?: Array<{ platform: string; label: string; url: string; display_order: number }>
}): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('role, is_suspended').eq('id', user.id).single()
  if (!profile) return { success: false, error: 'Profile not found' }
  if (profile.is_suspended) return { success: false, error: 'Your account is suspended' }
  if (!await assertRoomOwner(user.id, roomId, profile.role)) {
    return { success: false, error: 'Insufficient permissions' }
  }

  const updateData: Record<string, unknown> = {}
  if (formData.name !== undefined) updateData['name'] = formData.name
  if (formData.description !== undefined) updateData['description'] = formData.description
  if (formData.bannerUrl !== undefined) updateData['banner_url'] = formData.bannerUrl
  if (formData.maxUploadsPerUser !== undefined) updateData['max_uploads_per_user'] = formData.maxUploadsPerUser
  if (formData.wallColors !== undefined) updateData['wall_colors'] = formData.wallColors
  if (formData.socialLinks !== undefined) updateData['social_links'] = formData.socialLinks

  const admin = createServiceRoleClient()
  const { error } = await admin.from('rooms').update(updateData).eq('id', roomId)
  if (error) return { success: false, error: 'Failed to update room' }

  await insertAuditLog({ actorId: user.id, action: 'room.update', targetType: 'room', targetId: roomId })

  return { success: true, data: undefined }
}

export async function archiveRoom(roomId: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile) return { success: false, error: 'Profile not found' }
  if (!await assertRoomOwner(user.id, roomId, profile.role)) {
    return { success: false, error: 'Insufficient permissions' }
  }

  const admin = createServiceRoleClient()
  const { error } = await admin.from('rooms').update({ status: 'archived' }).eq('id', roomId)
  if (error) return { success: false, error: 'Failed to archive room' }

  await insertAuditLog({ actorId: user.id, action: 'room.archive', targetType: 'room', targetId: roomId })

  return { success: true, data: undefined }
}

export async function deleteRoom(roomId: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { success: false, error: 'Only admins can delete rooms' }

  const admin = createServiceRoleClient()

  // Get room to delete banner
  const { data: room } = await admin.from('rooms').select('banner_url').eq('id', roomId).single()
  if (room?.banner_url) {
    await deleteBanner(room.banner_url)
  }

  const { error } = await admin.from('rooms').delete().eq('id', roomId)
  if (error) return { success: false, error: error.message }

  await insertAuditLog({ actorId: user.id, action: 'room.delete', targetType: 'room', targetId: roomId })

  return { success: true, data: undefined }
}

export async function regenerateJoinCode(roomId: string): Promise<ActionResult<string>> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile) return { success: false, error: 'Profile not found' }
  if (!await assertRoomOwner(user.id, roomId, profile.role)) {
    return { success: false, error: 'Insufficient permissions' }
  }

  const admin = createServiceRoleClient()
  const newCode = await generateUniqueJoinCode(admin).catch(() => null)
  if (!newCode) return { success: false, error: 'Failed to generate join code' }

  const { error } = await admin.from('rooms').update({ join_code: newCode }).eq('id', roomId)
  if (error) return { success: false, error: 'Failed to regenerate join code' }

  await insertAuditLog({ actorId: user.id, action: 'room.regenerate_code', targetType: 'room', targetId: roomId })

  return { success: true, data: newCode }
}
