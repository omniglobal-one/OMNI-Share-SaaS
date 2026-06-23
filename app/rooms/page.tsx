import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { RoomCard } from '@/components/rooms/RoomCard'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Room, Profile, Role } from '@/types'

async function getRoomsForUser(userId: string, role: Role) {
  const admin = createServiceRoleClient()
  let rooms: Room[] = []

  if (role === 'admin') {
    const { data } = await admin.from('rooms').select('*').order('created_at', { ascending: false })
    rooms = data ?? []
  } else if (role === 'manager') {
    const { data } = await admin.from('rooms').select('*').eq('owner_id', userId).order('created_at', { ascending: false })
    rooms = data ?? []
  } else if (role === 'moderator') {
    const { data } = await admin
      .from('room_moderators')
      .select('rooms(*)')
      .eq('moderator_id', userId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rooms = (data ?? []).flatMap((r: any) => (r.rooms ? [r.rooms as Room] : []))
  } else {
    const { data } = await admin
      .from('room_members')
      .select('rooms(*)')
      .eq('user_id', userId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rooms = (data ?? []).flatMap((r: any) => (r.rooms ? [r.rooms as Room] : []))
  }

  return rooms
}

export default async function RoomsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()
  const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const role = (profile as Profile).role
  const rooms = await getRoomsForUser(user.id, role)
  const isManagerOrAdmin = role === 'admin' || role === 'manager'

  return (
    <DashboardShell sidebar={
      <Sidebar
        role={role}
        userEmail={user.email ?? ''}
        userName={(profile as Profile).full_name}
      />
    }>
      <Topbar
        title="My Rooms"
        subtitle={`${rooms.length} room${rooms.length !== 1 ? 's' : ''}`}
        actions={
          <div className="flex gap-2">
            <Link href="/join" className="btn-secondary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Join a room
            </Link>
            {isManagerOrAdmin && (
              <Link href="/manage/new" className="btn-primary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create room
              </Link>
            )}
          </div>
        }
      />
      <div className="p-4 sm:p-6 lg:p-8">
        {rooms.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            }
            title="No rooms yet"
            description={isManagerOrAdmin ? "Create your first room to get started." : "Enter a join code to join a room."}
            cta={
              isManagerOrAdmin
                ? <Link href="/manage/new" className="btn-primary">Create room</Link>
                : <Link href="/join" className="btn-primary">Join a room</Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map(room => (
              <RoomCard key={room.id} room={room} role={role} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
