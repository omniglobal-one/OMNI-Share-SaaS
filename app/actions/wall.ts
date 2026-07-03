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

  if (!room) return { success: false }

  // Constant-time comparison to prevent timing attacks on the join code
  const correct = room.join_code.toUpperCase()
  const provided = code.toUpperCase()
  let mismatch = correct.length ^ provided.length
  for (let i = 0; i < Math.max(correct.length, provided.length); i++) {
    mismatch |= (correct.charCodeAt(i % correct.length) ^ provided.charCodeAt(i % provided.length))
  }
  if (mismatch !== 0) {
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
