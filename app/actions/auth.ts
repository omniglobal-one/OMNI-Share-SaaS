'use server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

export async function signIn(email: string, password: string): Promise<ActionResult> {
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
