import { createServiceRoleClient } from '@/lib/supabase/server'

export async function insertAuditLog(params: {
  actorId: string
  action: string
  targetType?: string
  targetId?: string
  metadata?: Record<string, unknown>
}) {
  const supabase = createServiceRoleClient()
  await supabase.from('audit_logs').insert({
    actor_id: params.actorId,
    action: params.action,
    ...(params.targetType ? { target_type: params.targetType } : {}),
    ...(params.targetId ? { target_id: params.targetId } : {}),
    ...(params.metadata ? { metadata: params.metadata } : {}),
  })
}
