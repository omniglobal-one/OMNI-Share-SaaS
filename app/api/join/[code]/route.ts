import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getClientIp } from '@/lib/security'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const supabase = createServiceRoleClient()

  // Rate limit: this endpoint is a room-existence + metadata oracle (404 vs 200+name/
  // description) for an unauthenticated caller — without a limit it's a clean brute-force
  // target for the 6-character join code.
  const ip = getClientIp(request.headers)
  const { data: allowed } = await supabase.rpc('check_rate_limit', {
    p_key: `join_lookup:${ip}`, p_max_count: 20, p_window_seconds: 60,
  })
  if (allowed === false) {
    return NextResponse.json({ error: 'Too many attempts. Please wait a minute and try again.' }, { status: 429 })
  }

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
