'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { signOut } from '@/app/actions/auth'
import type { Profile } from '@/types'

interface NavbarProps {
  profile?: Profile | null
  roomName?: string
}

export function Navbar({ profile, roomName }: NavbarProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function toggleDark() {
    const html = document.documentElement
    const isDark = html.classList.toggle('dark')
    try { localStorage.setItem('theme', isDark ? 'dark' : 'light') } catch {}
  }

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  return (
    <header className="h-14 bg-bg-card dark:bg-dark-bg-card border-b border-bg-border dark:border-dark-bg-border flex items-center px-4 gap-4 sticky top-0 z-40">
      {/* Logo */}
      <Link href="/rooms" className="flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <span className="font-semibold text-text-primary dark:text-dark-text-primary">OMNI Share</span>
      </Link>

      {/* Room context */}
      {roomName && (
        <>
          <span className="text-text-tertiary dark:text-dark-text-tertiary">/</span>
          <span className="text-text-secondary dark:text-dark-text-secondary text-sm font-medium truncate max-w-xs">{roomName}</span>
        </>
      )}

      <div className="ml-auto flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="p-2 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-bg-border dark:hover:bg-dark-bg-border transition-colors"
          aria-label="Toggle dark mode"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        {/* User menu */}
        {profile && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-bg-border dark:hover:bg-dark-bg-border transition-colors"
            >
              <Avatar avatarUrl={profile.avatar_url} fullName={profile.full_name} size="sm" />
              <span className="text-sm text-text-secondary dark:text-dark-text-secondary hidden sm:block">
                {profile.full_name ?? profile.username ?? 'User'}
              </span>
              <svg className="w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 card shadow-lg py-1 z-50">
                <Link
                  href="/rooms"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-bg-base dark:hover:bg-dark-bg-base transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  My Rooms
                </Link>
                <div className="border-t border-bg-border dark:border-dark-bg-border my-1" />
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-bg-base dark:hover:bg-dark-bg-base w-full transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
