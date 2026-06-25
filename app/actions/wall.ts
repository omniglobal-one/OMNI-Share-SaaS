'use server'
import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function unlockWall(roomId: string, code: string): Promise<{ success: boolean }> {
  const admin = createServiceRoleClient()
  const { data: room } = await admin
    .from('rooms')
    .select('join_code')
    .eq('id', roomId)
    .single()

  if (!room || room.join_code.toUpperCase() !== code.toUpperCase()) {
    return { success: false }
  }

  const cookieStore = await cookies()
  cookieStore.set(`wall_${roomId}`, code.toUpperCase(), {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return { success: true }
}
