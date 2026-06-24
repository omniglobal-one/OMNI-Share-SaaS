import { redirect, notFound } from 'next/navigation'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { ManageTabs } from './ManageTabs'
import { Badge } from '@/components/ui/Badge'
import type { Profile, Room, Photo, AuditLog } from '@/types'

type ManageTab = 'overview' | 'photos' | 'moderators' | 'settings'

const subNavIcons = {
  overview: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  photos: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  moderators: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  settings: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
}

export default async function ManageRoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ room_id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { room_id } = await params
  const { tab } = await searchParams

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()

  const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const role = (profile as Profile).role
  if (role !== 'admin' && role !== 'manager') redirect('/rooms')

  const { data: room } = await admin.from('rooms').select('*').eq('id', room_id).single()
  if (!room) notFound()

  const activeTab = (['overview', 'photos', 'moderators', 'settings'].includes(tab ?? '')
    ? tab
    : 'overview') as ManageTab

  const [{ data: photos }, { data: mods }, { count: memberCount }, { data: auditLogs }] = await Promise.all([
    admin.from('photos').select('*, moderator:profiles!moderated_by(id, full_name)').eq('room_id', room_id).order('uploaded_at', { ascending: false }),
    admin.from('room_moderators').select('*, profiles(*)').eq('room_id', room_id),
    admin.from('room_members').select('id', { count: 'exact', head: true }).eq('room_id', room_id),
    admin.from('audit_logs').select('*').eq('target_id', room_id).order('created_at', { ascending: false }).limit(20),
  ])

  // Resolve actor names for audit log entries
  const actorIdSet: Record<string, true> = {}
  ;(auditLogs ?? []).forEach(l => { if (l.actor_id) actorIdSet[l.actor_id] = true })
  const actorIds = Object.keys(actorIdSet)
  const { data: actorProfiles } = actorIds.length > 0
    ? await admin.from('profiles').select('id, full_name, username').in('id', actorIds)
    : { data: [] }
  const actorMap: Record<string, string> = Object.fromEntries(
    (actorProfiles ?? []).map(p => [p.id, (p.full_name ?? p.username ?? null)]).filter(([, v]) => v)
  )

  const baseUrl = `/manage/${room_id}`
  const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'

  const subNavItems = [
    { label: 'Overview', href: baseUrl, tab: 'overview', icon: subNavIcons.overview },
    { label: 'Photos', href: `${baseUrl}?tab=photos`, tab: 'photos', icon: subNavIcons.photos },
    { label: 'Moderators', href: `${baseUrl}?tab=moderators`, tab: 'moderators', icon: subNavIcons.moderators },
    { label: 'Settings', href: `${baseUrl}?tab=settings`, tab: 'settings', icon: subNavIcons.settings },
  ]

  return (
    <DashboardShell sidebar={
      <Sidebar
        role={role}
        userEmail={user.email ?? ''}
        userName={(profile as Profile).full_name}
        subNavLabel={room.name}
        subNavItems={subNavItems}
      />
    }>
      <Topbar
        title={room.name}
        subtitle={<><span className="text-text-secondary text-sm">Room management</span><Badge variant={room.status as 'active' | 'archived'} /></>}
      />
      <ManageTabs
        room={room as Room}
        photos={(photos ?? []) as Photo[]}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        moderators={(mods ?? []) as any}
        memberCount={memberCount ?? 0}
        auditLogs={(auditLogs ?? []) as AuditLog[]}
        actorMap={actorMap}
        userRole={role}
        appUrl={appUrl}
        activeTab={activeTab}
      />
    </DashboardShell>
  )
}
