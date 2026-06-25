import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { WallDisplay } from './WallDisplay'
import { WallGate } from '@/components/wall/WallGate'
import type { Photo, Room } from '@/types'

export default async function WallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceRoleClient()

  const { data: room } = await supabase
    .from('rooms')
    .select('id, name, join_code, status, wall_colors, social_links, banner_url')
    .eq('id', id)
    .single()

  if (!room) notFound()

  // Server-side gate: verify the wall cookie before loading any photo data.
  // The cookie is set by the unlockWall server action when the user passes the
  // client-side WallGate — this prevents photos from being included in the
  // initial HTML response for users who haven't entered the code.
  const cookieStore = await cookies()
  const wallCookie = cookieStore.get(`wall_${id}`)?.value
  const isUnlocked = wallCookie?.toUpperCase() === room.join_code.toUpperCase()

  if (!isUnlocked) {
    return (
      <WallGate joinCode={room.join_code} roomName={room.name} roomId={room.id}>
        {/* children only render after gate passes and router.refresh() re-runs this page */}
        <></>
      </WallGate>
    )
  }

  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('room_id', id)
    .eq('status', 'approved')
    .order('uploaded_at', { ascending: false })

  return (
    <WallDisplay
      room={room as Room}
      initialPhotos={(photos ?? []) as Photo[]}
    />
  )
}
