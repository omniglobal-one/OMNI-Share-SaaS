'use server'
import { insertAuditLog } from '@/lib/audit'
import type { ActionResult } from '@/types'

export async function insertLog(params: {
  actorId: string
  action: string
  targetType?: string
  targetId?: string
  metadata?: Record<string, unknown>
}): Promise<ActionResult> {
  await insertAuditLog(params)
  return { success: true, data: undefined }
}
