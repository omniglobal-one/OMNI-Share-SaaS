import { redirect, notFound } from 'next/navigation'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { ModerationClient } from './ModerationClient'
import type { Profile, Room, Photo } from '@/types'

export default async function ModeratePage({ params }: { params: Promise<{ room_id: string }> }) {
  const { room_id } = await params

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()

  const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const role = (profile as Profile).role
  const canModerate = role === 'admin' || role === 'manager' || role === 'moderator'
  if (!canModerate) redirect('/rooms')

  const [{ data: room }, { data: pendingPhotos }] = await Promise.all([
    admin.from('rooms').select('*').eq('id', room_id).single(),
    admin.from('photos').select('*').eq('room_id', room_id).eq('status', 'pending').order('uploaded_at', { ascending: true }),
  ])

  if (!room) notFound()

  return (
    <DashboardShell sidebar={
      <Sidebar
        role={role}
        userEmail={user.email ?? ''}
        userName={(profile as Profile).full_name}
      />
    }>
      <Topbar
        title="Moderate"
        subtitle={`${room.name} — ${(pendingPhotos ?? []).length} pending`}
      />
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-4rem)]">
        <ModerationClient
          room={room as Room}
          initialQueue={(pendingPhotos ?? []) as Photo[]}
        />
      </div>
    </DashboardShell>
  )
}
