'use server'
import { headers } from 'next/headers'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getClientIp } from '@/lib/security'
import type { ActionResult } from '@/types'

export async function signIn(email: string, password: string): Promise<ActionResult> {
  // Rate limit: 10 login attempts per IP per minute. Supabase Auth has its own platform-level
  // limits, but this app previously had zero backstop of its own against credential stuffing.
  const ip = getClientIp(await headers())
  const admin = createServiceRoleClient()
  const { data: allowed } = await admin.rpc('check_rate_limit', {
    p_key: `sign_in:${ip}`, p_max_count: 10, p_window_seconds: 60,
  })
  if (allowed === false) return { success: false, error: 'Too many attempts. Please wait a minute and try again.' }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { success: false, error: 'Invalid email or password. Please try again.' }
  return { success: true, data: undefined }
}

export async function signUp(email: string, password: string, fullName: string): Promise<ActionResult> {
  if (fullName && fullName.length > 120) return { success: false, error: 'Name must be 120 characters or fewer.' }
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) return { success: false, error: 'Could not create account. Please check your details and try again.' }
  return { success: true, data: undefined }
}

export async function signOut(): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signOut()
  if (error) return { success: false, error: 'Sign out failed. Please try again.' }
  return { success: true, data: undefined }
}

// Hands the browser client a short-lived access token for Realtime channel auth / authenticated
// REST calls, without ever exposing the refresh token (which stays in the httpOnly session
// cookie, server-only). getSession() (not getUser()) is used deliberately here — it's the only
// call that returns the raw token string; the caller only uses it for outbound requests that
// Supabase itself will authorize, so a non-revalidated read is fine.
export async function getRealtimeAccessToken(): Promise<string | null> {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

export async function sendMagicLink(email: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${process.env['NEXT_PUBLIC_APP_URL']}/auth/callback` },
  })
  // Always return success-like message to prevent email enumeration
  if (error) return { success: false, error: 'If that email is registered, you\'ll receive a sign-in link shortly.' }
  return { success: true, data: undefined }
}
