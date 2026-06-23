'use server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { insertAuditLog } from '@/lib/audit'
import type { ActionResult, Role } from '@/types'

async function isAdmin(userId: string): Promise<boolean> {
  const admin = createServiceRoleClient()
  const { data } = await admin.from('profiles').select('role').eq('id', userId).single()
  return data?.role === 'admin'
}

export async function createUser(email: string, password: string, fullName: string, role: Role): Promise<ActionResult<string>> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  if (!await isAdmin(user.id)) return { success: false, error: 'Admin only' }

  const admin = createServiceRoleClient()
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (error || !data.user) return { success: false, error: error?.message ?? 'Failed to create user' }

  // Set role
  await admin.from('profiles').update({ role, full_name: fullName }).eq('id', data.user.id)

  await insertAuditLog({ actorId: user.id, action: 'user.create', targetType: 'user', targetId: data.user.id })

  return { success: true, data: data.user.id }
}

export async function changeRole(targetUserId: string, role: Role): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  if (!await isAdmin(user.id)) return { success: false, error: 'Admin only' }

  const admin = createServiceRoleClient()
  const { error } = await admin.from('profiles').update({ role }).eq('id', targetUserId)
  if (error) return { success: false, error: error.message }

  await insertAuditLog({ actorId: user.id, action: 'user.change_role', targetType: 'user', targetId: targetUserId, metadata: { role } })

  return { success: true, data: undefined }
}

export async function suspendUser(targetUserId: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  if (!await isAdmin(user.id)) return { success: false, error: 'Admin only' }

  const admin = createServiceRoleClient()
  const { error } = await admin.from('profiles').update({ is_suspended: true }).eq('id', targetUserId)
  if (error) return { success: false, error: error.message }

  await insertAuditLog({ actorId: user.id, action: 'user.suspend', targetType: 'user', targetId: targetUserId })

  return { success: true, data: undefined }
}

export async function unsuspendUser(targetUserId: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  if (!await isAdmin(user.id)) return { success: false, error: 'Admin only' }

  const admin = createServiceRoleClient()
  const { error } = await admin.from('profiles').update({ is_suspended: false }).eq('id', targetUserId)
  if (error) return { success: false, error: error.message }

  await insertAuditLog({ actorId: user.id, action: 'user.unsuspend', targetType: 'user', targetId: targetUserId })

  return { success: true, data: undefined }
}

export async function deleteUser(targetUserId: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  if (!await isAdmin(user.id)) return { success: false, error: 'Admin only' }

  const admin = createServiceRoleClient()
  const { error } = await admin.auth.admin.deleteUser(targetUserId)
  if (error) return { success: false, error: error.message }

  await insertAuditLog({ actorId: user.id, action: 'user.delete', targetType: 'user', targetId: targetUserId })

  return { success: true, data: undefined }
}
