import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? '',
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ?? '',
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            // httpOnly: this is the durable session (refresh token included) — it must never be
            // readable by JS. The browser Supabase client (lib/supabase/client.ts) no longer
            // persists or reads its own session cookie; anything the client needs (a short-lived
            // access token for Realtime/REST) is handed to it explicitly via a server action
            // instead, so it never depends on reading this cookie.
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, { ...options, secure: true, httpOnly: true } as never)
            )
          } catch {}
        },
      },
    }
  )
}

export function createServiceRoleClient() {
  return createClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? '',
    process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
