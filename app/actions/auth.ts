'use server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

export async function signIn(email: string, password: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { success: false, error: error.message }
  return { success: true, data: undefined }
}

export async function signUp(email: string, password: string, fullName: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) return { success: false, error: error.message }
  return { success: true, data: undefined }
}

export async function signOut(): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signOut()
  if (error) return { success: false, error: error.message }
  return { success: true, data: undefined }
}

export async function sendMagicLink(email: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${process.env['NEXT_PUBLIC_APP_URL']}/auth/callback` },
  })
  if (error) return { success: false, error: error.message }
  return { success: true, data: undefined }
}
