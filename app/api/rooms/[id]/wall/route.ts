import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceRoleClient, createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = createServiceRoleClient()

  // Allow authenticated managers/admins through without a cookie check
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  let isAuthorised = false

  if (user) {
    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile && ['admin', 'manager', 'moderator'].includes(profile.role)) {
      isAuthorised = true
    }
    // Also allow any room member
    if (!isAuthorised) {
      const { data: member } = await admin
        .from('room_members')
        .select('id')
        .eq('room_id', id)
        .eq('user_id', user.id)
        .single()
      if (member) isAuthorised = true
    }
  }

  // For unauthenticated visitors (e.g. TV display), require the server-side wall cookie
  if (!isAuthorised) {
    const { data: room } = await admin
      .from('rooms')
      .select('join_code')
      .eq('id', id)
      .single()

    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })

    const cookieStore = await cookies()
    const wallCookie = cookieStore.get(`wall_${id}`)?.value
    if (wallCookie?.toUpperCase() !== room.join_code.toUpperCase()) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }
    isAuthorised = true
  }

  const { data, error } = await admin
    .from('photos')
    .select('id, public_url, width, height, uploaded_at')
    .eq('room_id', id)
    .eq('status', 'approved')
    .order('uploaded_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to load photos' }, { status: 500 })

  return NextResponse.json({ photos: data ?? [] })
}
