'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { unlockWall } from '@/app/actions/wall'

const INACTIVITY_MS = 5 * 60 * 1000 // 5 minutes

interface WallGateProps {
  roomId: string
  roomName: string
  /** If true, skip the gate entirely (e.g. caller is already a verified staff/member session) */
  bypass?: boolean
  children: React.ReactNode
}

// The real join code is never sent to this component or compared client-side — both would
// leak it into the page's initial HTML/RSC payload before the visitor proves they know it.
// Every attempt is verified exclusively by the unlockWall server action (rate-limited),
// which sets an httpOnly cookie on success; router.refresh() then re-runs the parent server
// component, which reveals real data only once it sees that cookie itself.
export function WallGate({ roomId, roomName, bypass = false, children }: WallGateProps) {
  const router = useRouter()
  const [unlocked, setUnlocked] = useState(bypass)
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const lock = useCallback(() => {
    setUnlocked(false)
    setInput('')
    setError(null)
  }, [])

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(lock, INACTIVITY_MS)
  }, [lock])

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input.length !== 6 || submitting) return
    setSubmitting(true)
    setError(null)
    const result = await unlockWall(roomId, input)
    setSubmitting(false)
    if (result.success) {
      setUnlocked(true)
      router.refresh()
    } else {
      setError(result.error ?? 'Incorrect code. Try again.')
      setInput('')
    }
  }

  if (unlocked) return <>{children}</>

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-12">
        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="" className="w-7 h-7 rounded-lg" />
        </div>
        <span className="text-white text-xl font-bold">OMNI Share</span>
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
              setError(null)
            }}
            placeholder="XXXXXX"
            maxLength={6}
            autoFocus
            autoCapitalize="characters"
            spellCheck={false}
            disabled={submitting}
            className={`w-full text-center text-3xl font-mono tracking-[0.5em] py-4 px-4 rounded-xl bg-white/5 border-2 text-white placeholder-white/20 focus:outline-none transition-colors ${
              error
                ? 'border-red-500 bg-red-500/10'
                : input.length === 6
                  ? 'border-primary bg-primary/10'
                  : 'border-white/10 focus:border-white/30'
            }`}
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={input.length !== 6 || submitting}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {submitting ? 'Checking...' : 'Continue'}
          </button>
        </form>

        <p className="text-white/25 text-xs mt-8">
          Get the code from your event host
        </p>
      </div>
    </div>
  )
}
