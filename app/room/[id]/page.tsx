import { redirect, notFound } from 'next/navigation'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { RoomTabs } from './RoomTabs'
import Link from 'next/link'
import type { Profile, Room, Photo } from '@/types'

export default async function RoomPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Use service role for data queries — RLS can be unreliable for anonymous sessions
  const admin = createServiceRoleClient()

  const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/join')

  // Get room
  const { data: room } = await admin.from('rooms').select('*').eq('id', params.id).single()
  if (!room) notFound()

  // Explicit membership check (replaces RLS)
  const isAdmin = (profile as Profile).role === 'admin'
  if (!isAdmin) {
    const { data: member } = await admin
      .from('room_members')
      .select('id')
      .eq('room_id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!member) {
      redirect(`/join?code=${room.join_code}`)
    }
  }

  // Load approved photos for wall
  const { data: approvedPhotos } = await admin
    .from('photos')
    .select('*')
    .eq('room_id', params.id)
    .eq('status', 'approved')
    .order('uploaded_at', { ascending: false })

  // Load user's own photos
  const { data: myPhotos } = await admin
    .from('photos')
    .select('*')
    .eq('room_id', params.id)
    .eq('uploader_id', user.id)
    .order('uploaded_at', { ascending: false })

  return (
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
  )
}
