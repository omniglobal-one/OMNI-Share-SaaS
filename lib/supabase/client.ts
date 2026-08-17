'use client'
import { createBrowserClient } from '@supabase/ssr'

// This client never reads or writes the session cookie — persistSession/autoRefreshToken are
// off so it can't touch it even by accident, keeping the real (httpOnly) session cookie
// server-only. Anything the browser needs — a short-lived access token for Realtime channel
// auth or an authenticated REST call — is fetched explicitly via a server action
// (getRealtimeAccessToken in app/actions/auth.ts) and passed in here per-use.
export function createClient(accessToken?: string) {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      ...(accessToken ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } } : {}),
    }
  )
}
