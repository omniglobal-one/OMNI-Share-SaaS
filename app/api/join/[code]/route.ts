import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: { code: string } }
) {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('rooms')
    .select('id, name, status, join_code, banner_url, description')
    .eq('join_code', params.code.toUpperCase())
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  if (data.status === 'archived') {
    return NextResponse.json({ error: 'This event has ended.' }, { status: 410 })
  }

  return NextResponse.json({ room: data })
}
