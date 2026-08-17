'use server'
import { cookies, headers } from 'next/headers'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { constantTimeEqualsUpperCase, getClientIp } from '@/lib/security'

export async function unlockWall(roomId: string, code: string): Promise<{ success: boolean; error?: string }> {
  const admin = createServiceRoleClient()

  // Rate limit: 8 attempts per IP per minute per room, closing the join-code brute-force gap
  // (6 chars from a 32-char alphabet is ~1B combinations but was previously unthrottled).
  const ip = getClientIp(await headers())
  const { data: allowed } = await admin.rpc('check_rate_limit', {
    p_key: `unlock_wall:${ip}:${roomId}`, p_max_count: 8, p_window_seconds: 60,
  })
  if (allowed === false) return { success: false, error: 'Too many attempts. Please wait a minute and try again.' }

  const { data: room } = await admin
    .from('rooms')
    .select('join_code')
    .eq('id', roomId)
    .single()

  if (!room) return { success: false, error: 'Incorrect code. Try again.' }

  if (!constantTimeEqualsUpperCase(room.join_code, code)) {
    return { success: false, error: 'Incorrect code. Try again.' }
  }

  const cookieStore = await cookies()
  cookieStore.set(`wall_${roomId}`, code.toUpperCase(), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return { success: true }
}
