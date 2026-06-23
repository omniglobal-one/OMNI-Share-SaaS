import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { AdminTabs } from './AdminTabs'
import type { Profile, Room, AuditLog } from '@/types'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()

  const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')
  if ((profile as Profile).role !== 'admin') redirect('/rooms')

  const [{ data: users }, { data: rooms }, { data: auditLogs }] = await Promise.all([
    admin.from('profiles').select('*').order('created_at', { ascending: false }),
    admin.from('rooms').select('*').order('created_at', { ascending: false }),
    admin.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100),
  ])

  return (
    <DashboardShell sidebar={
      <Sidebar
        role={(profile as Profile).role}
        userEmail={user.email ?? ''}
        userName={(profile as Profile).full_name}
      />
    }>
      <Topbar title="Admin Dashboard" subtitle="Manage users, rooms, and audit logs" />
      <AdminTabs
        users={(users ?? []) as Profile[]}
        rooms={(rooms ?? []) as Room[]}
        auditLogs={(auditLogs ?? []) as AuditLog[]}
        currentUserId={user.id}
      />
    </DashboardShell>
  )
}
