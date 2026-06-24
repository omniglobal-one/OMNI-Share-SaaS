import { redirect, notFound } from 'next/navigation'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { RoomTabs } from './RoomTabs'
import { WallGate } from '@/components/wall/WallGate'
import Link from 'next/link'
import type { Profile, Room, Photo } from '@/types'

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()

  const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/join')

  const { data: room } = await admin.from('rooms').select('*').eq('id', id).single()
  if (!room) notFound()

  const isAdmin = (profile as Profile).role === 'admin'
  if (!isAdmin) {
    const { data: member } = await admin
      .from('room_members')
      .select('id')
      .eq('room_id', id)
      .eq('user_id', user.id)
      .single()

    if (!member) {
      redirect(`/join?code=${room.join_code}`)
    }
  }

  const { data: approvedPhotos } = await admin
    .from('photos')
    .select('*')
    .eq('room_id', id)
    .eq('status', 'approved')
    .order('uploaded_at', { ascending: false })

  const { data: myPhotos } = await admin
    .from('photos')
    .select('*')
    .eq('room_id', id)
    .eq('uploader_id', user.id)
    .order('uploaded_at', { ascending: false })

  // Staff (non-anonymous) bypass the code gate — anonymous guests must enter it
  const isAnonymous = user.is_anonymous ?? false
  const staffRoles = ['admin', 'manager', 'moderator']
  const bypassGate = !isAnonymous || staffRoles.includes((profile as Profile).role)

  return (
    <WallGate joinCode={room.join_code} roomName={room.name} bypass={bypassGate}>
      <DashboardShell sidebar={
        <Sidebar
          role={(profile as Profile).role}
          userEmail={user.email ?? 'Guest'}
          userName={(profile as Profile).full_name ?? 'Guest'}
        />
      }>
        <Topbar
          title={room.name}
          subtitle={room.description ?? undefined}
          actions={
            <Link
              href={`/room/${room.id}/wall`}
              target="_blank"
              className="btn-secondary text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open wall
            </Link>
          }
        />
        <RoomTabs
          room={room as Room}
          userId={user.id}
          approvedPhotos={(approvedPhotos ?? []) as Photo[]}
          myPhotos={(myPhotos ?? []) as Photo[]}
        />
      </DashboardShell>
    </WallGate>
  )
}
