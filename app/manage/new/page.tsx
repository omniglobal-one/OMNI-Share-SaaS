import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { CreateRoomForm } from './CreateRoomForm'
import type { Profile } from '@/types'

export default async function NewRoomPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()
  const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const role = (profile as Profile).role
  if (role !== 'admin' && role !== 'manager') redirect('/rooms')

  return (
    <DashboardShell sidebar={
      <Sidebar
        role={role}
        userEmail={user.email ?? ''}
        userName={(profile as Profile).full_name}
      />
    }>
      <Topbar title="Create Room" subtitle="Set up a new event photo room" />
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
        <CreateRoomForm />
      </div>
    </DashboardShell>
  )
}
