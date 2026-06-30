import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { renderRoomJoinCardPng } from '@/lib/qr-card-renderer'

export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ room_id: string }> }
) {
  try {
    const { room_id } = await params

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createServiceRoleClient()

    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
    const role = (profile as { role: string } | null)?.role
    if (!role || !['admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: room } = await admin
      .from('rooms')
      .select('id, name, join_code')
      .eq('id', room_id)
      .single()
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://share.omnidesk.one'

    const png = await renderRoomJoinCardPng({
      roomName: (room as { name: string }).name,
      joinCode: (room as { join_code: string }).join_code,
      appUrl,
    })

    return new Response(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${room_id}-join-card.png"`,
        'Cache-Control': 'private, max-age=0',
      },
    })
  } catch (err) {
    console.error('[QR room join route]', err)
    return NextResponse.json({ error: 'Failed to generate QR card' }, { status: 500 })
  }
}
