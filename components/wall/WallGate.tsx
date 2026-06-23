'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

const INACTIVITY_MS = 5 * 60 * 1000 // 5 minutes

interface WallGateProps {
  joinCode: string
  roomName: string
  /** If true, skip the gate entirely (e.g. for staff with a proper login) */
  bypass?: boolean
  children: React.ReactNode
}

export function WallGate({ joinCode, roomName, bypass = false, children }: WallGateProps) {
  const storageKey = `wall_access_${joinCode}`
  const [unlocked, setUnlocked] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [mounted, setMounted] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const lock = useCallback(() => {
    sessionStorage.removeItem(storageKey)
    setUnlocked(false)
    setInput('')
    setError(false)
  }, [storageKey])

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(lock, INACTIVITY_MS)
  }, [lock])

  // Start inactivity timer once unlocked
  useEffect(() => {
    if (!unlocked || bypass) return
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }))
    resetTimer()
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [unlocked, bypass, resetTimer])

  useEffect(() => {
    setMounted(true)
    if (bypass || sessionStorage.getItem(storageKey) === '1') {
      setUnlocked(true)
    }
  }, [storageKey, bypass])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input.toUpperCase().trim() === joinCode.toUpperCase()) {
      sessionStorage.setItem(storageKey, '1')
      setUnlocked(true)
    } else {
      setError(true)
      setInput('')
    }
  }

  if (!mounted) return null
  if (unlocked) return <>{children}</>

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-12">
        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="" className="w-7 h-7 rounded-lg" />
        </div>
        <span className="text-white text-xl font-bold">OMNI Wall</span>
      </div>

      <div className="w-full max-w-sm text-center">
        <h1 className="text-white text-2xl font-bold mb-2">{roomName}</h1>
        <p className="text-white/50 text-sm mb-8">Enter the room code to continue</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={input}
            onChange={e => {
              setInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))
              setError(false)
            }}
            placeholder="XXXXXX"
            maxLength={6}
            autoFocus
            autoCapitalize="characters"
            spellCheck={false}
            className={`w-full text-center text-3xl font-mono tracking-[0.5em] py-4 px-4 rounded-xl bg-white/5 border-2 text-white placeholder-white/20 focus:outline-none transition-colors ${
              error
                ? 'border-red-500 bg-red-500/10'
                : input.length === 6
                  ? 'border-primary bg-primary/10'
                  : 'border-white/10 focus:border-white/30'
            }`}
          />

          {error && (
            <p className="text-red-400 text-sm">Incorrect code. Try again.</p>
          )}

          <button
            type="submit"
            disabled={input.length !== 6}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </form>

        <p className="text-white/25 text-xs mt-8">
          Get the code from your event host
        </p>
      </div>
    </div>
  )
}
