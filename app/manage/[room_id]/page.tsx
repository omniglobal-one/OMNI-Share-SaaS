import { redirect, notFound } from 'next/navigation'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { ManageTabs } from './ManageTabs'
import type { Profile, Room, Photo, AuditLog } from '@/types'

export default async function ManageRoomPage({ params }: { params: { room_id: string } }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()

  const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const role = (profile as Profile).role
  if (role !== 'admin' && role !== 'manager') redirect('/rooms')

  const { data: room } = await admin.from('rooms').select('*').eq('id', params.room_id).single()
  if (!room) notFound()

  const [{ data: photos }, { data: mods }, { count: memberCount }, { data: auditLogs }] = await Promise.all([
    admin.from('photos').select('*, moderator:profiles!moderated_by(id, full_name)').eq('room_id', params.room_id).order('uploaded_at', { ascending: false }),
    admin.from('room_moderators').select('*, profiles(*)').eq('room_id', params.room_id),
    admin.from('room_members').select('id', { count: 'exact', head: true }).eq('room_id', params.room_id),
    admin.from('audit_logs').select('*').eq('target_id', params.room_id).order('created_at', { ascending: false }).limit(20),
  ])

  const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'

  return (
    <DashboardShell sidebar={
      <Sidebar
        role={role}
        userEmail={user.email ?? ''}
        userName={(profile as Profile).full_name}
      />
    }>
      <Topbar
        title={room.name}
        subtitle="Room management"
      />
      <ManageTabs
        room={room as Room}
        photos={(photos ?? []) as Photo[]}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        moderators={(mods ?? []) as any}
        memberCount={memberCount ?? 0}
        auditLogs={(auditLogs ?? []) as AuditLog[]}
        userRole={role}
        appUrl={appUrl}
      />
    </DashboardShell>
  )
}
