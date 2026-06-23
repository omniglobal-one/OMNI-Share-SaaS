import { createServiceRoleClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { WallDisplay } from './WallDisplay'
import type { Photo, Room } from '@/types'

export default async function WallPage({ params }: { params: { id: string } }) {
  const supabase = createServiceRoleClient()

  const { data: room } = await supabase
    .from('rooms')
    .select('id, name, join_code, status')
    .eq('id', params.id)
    .single()

  if (!room) notFound()

  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('room_id', params.id)
    .eq('status', 'approved')
    .order('uploaded_at', { ascending: false })

  return (
    <WallDisplay
      room={room as Room}
      initialPhotos={(photos ?? []) as Photo[]}
    />
  )
}
