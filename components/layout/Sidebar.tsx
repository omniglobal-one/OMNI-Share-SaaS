'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Role } from '@/types'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

function getRoleLabel(role: Role) {
  const labels: Record<Role, string> = {
    admin: 'Platform Admin',
    manager: 'Room Manager',
    moderator: 'Moderator',
    user: 'Member',
  }
  return labels[role] ?? role
}

function getNavItems(role: Role): NavItem[] {
  const icons = {
    rooms: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    admin: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    newRoom: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    join: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  }

  const navByRole: Record<Role, NavItem[]> = {
    admin: [
      { label: 'My Rooms', href: '/rooms', icon: icons.rooms },
      { label: 'Admin', href: '/admin', icon: icons.admin },
    ],
    manager: [
      { label: 'My Rooms', href: '/rooms', icon: icons.rooms },
      { label: 'Create Room', href: '/manage/new', icon: icons.newRoom },
    ],
    moderator: [
      { label: 'My Rooms', href: '/rooms', icon: icons.rooms },
    ],
    user: [
      { label: 'My Rooms', href: '/rooms', icon: icons.rooms },
      { label: 'Join a Room', href: '/join', icon: icons.join },
    ],
  }

  return navByRole[role] ?? []
}

interface SidebarProps {
  role: Role
  userEmail: string
  userName?: string | null
}

export function Sidebar({ role, userEmail, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const navItems = getNavItems(role)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-60 bg-bg-card border-r border-bg-border flex flex-col h-screen">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-bg-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="" className="w-5 h-5 rounded" />
          </div>
          <span className="font-bold text-text-primary text-sm">OMNI Wall</span>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 py-3 border-b border-bg-border">
        <span className="text-xs text-text-tertiary">{getRoleLabel(role)}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-border'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User info + sign out */}
      <div className="px-4 py-4 border-t border-bg-border">
        <div className="mb-3">
          <p className="text-text-primary text-sm font-medium truncate">{userName ?? 'User'}</p>
          <p className="text-text-tertiary text-xs truncate">{userEmail}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-border rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}
