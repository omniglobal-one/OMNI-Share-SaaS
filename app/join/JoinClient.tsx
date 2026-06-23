'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { joinRoom, guestJoinRoom } from '@/app/actions/members'
import { createClient } from '@/lib/supabase/client'

export function JoinClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preCode = searchParams.get('code') ?? ''
  const [code, setCode] = useState(preCode.toUpperCase())
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authed, setAuthed] = useState<boolean | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data.user)
    })
  }, [])

  // Auto-submit if code pre-filled and user is already logged in
  useEffect(() => {
    if (preCode && authed === true && preCode.length === 6) {
      handleJoin(preCode.toUpperCase())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed])

  async function handleJoin(joinCode?: string) {
    const codeToUse = (joinCode ?? code).toUpperCase()
    if (codeToUse.length !== 6) {
      setError('Enter a 6-character code.')
      return
    }

    setError(null)
    setLoading(true)

    try {
      if (authed === false) {
        // Guest flow: sign in anonymously then join
        const supabase = createClient()
        const { error: anonError } = await supabase.auth.signInAnonymously()
        if (anonError) {
          setError('Could not start a guest session. Please try again.')
          setLoading(false)
          return
        }
        const result = await guestJoinRoom(codeToUse, displayName.trim() || undefined)
        setLoading(false)
        if (!result.success) {
          setError(result.error)
        } else {
          router.push(`/room/${result.data}`)
        }
      } else {
        // Already signed in — normal join
        const result = await joinRoom(codeToUse)
        setLoading(false)
        if (!result.success) {
          setError(result.error)
        } else {
          router.push(`/room/${result.data}`)
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center gap-2 mb-10 justify-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="" className="w-6 h-6 rounded" />
          </div>
          <span className="text-xl font-bold text-text-primary">OMNI Wall</span>
        </div>

        <h1 className="text-3xl font-bold text-text-primary mb-2">Join a room</h1>
        <p className="text-text-secondary mb-8">
          Enter the 6-character code shown at the event.
        </p>

        <div className="card p-8 text-left">
          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger rounded-lg px-4 py-3 text-sm mb-6">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="label text-center block">Room code</label>
            <input
              ref={inputRef}
              type="text"
              className="input text-center font-mono text-3xl tracking-[0.5em] uppercase py-4"
              value={code}
              onChange={e => {
                const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
                setCode(val)
                setError(null)
              }}
              onKeyDown={e => { if (e.key === 'Enter') handleJoin() }}
              placeholder="XXXXXX"
              maxLength={6}
              spellCheck={false}
              autoCapitalize="characters"
              autoFocus
            />
          </div>

          {authed === false && (
            <div className="mb-6">
              <label className="label">Your name <span className="text-text-tertiary font-normal">(optional)</span></label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Alice"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                maxLength={50}
              />
              <p className="text-xs text-text-tertiary mt-1.5">
                Helps the moderator identify your photos. You can skip this.
              </p>
            </div>
          )}

          <button
            onClick={() => handleJoin()}
            className="btn-primary w-full justify-center text-base py-3"
            disabled={loading || code.length !== 6}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Joining...
              </>
            ) : 'Join Room'}
          </button>
        </div>

      </div>
    </div>
  )
}
