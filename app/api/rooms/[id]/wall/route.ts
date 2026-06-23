import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('room_id', params.id)
    .eq('status', 'approved')
    .order('uploaded_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ photos: data ?? [] })
}
