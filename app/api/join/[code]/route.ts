import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('rooms')
    .select('id, name, status, join_code, banner_url, description')
    .eq('join_code', code.toUpperCase())
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  if (data.status === 'archived') {
    return NextResponse.json({ error: 'This event has ended.' }, { status: 410 })
  }

  // Omit join_code from response — caller already has it; no need to echo it back
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { join_code: _omit, ...roomData } = data
  return NextResponse.json({ room: roomData })
}
