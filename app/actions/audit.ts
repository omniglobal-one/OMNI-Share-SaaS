'use server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { insertAuditLog } from '@/lib/audit'
import type { ActionResult } from '@/types'

export async function insertLog(params: {
  actorId: string
  action: string
  targetType?: string
  targetId?: string
  metadata?: Record<string, unknown>
}): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  // Bind actorId to the authenticated user — prevents identity spoofing in the audit trail
  await insertAuditLog({ ...params, actorId: user.id })
  return { success: true, data: undefined }
}
