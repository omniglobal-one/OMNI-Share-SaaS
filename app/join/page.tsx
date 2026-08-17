import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { JoinClient } from './JoinClient'

export default async function JoinPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <JoinClient initialAuthed={!!user} />
    </Suspense>
  )
}
