'use client'
import { useState, useEffect, useCallback } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { getRealtimeAccessToken } from '@/app/actions/auth'
import type { Photo } from '@/types'

// How often to re-fetch a fresh access token and re-authenticate the open Realtime socket.
// Access tokens are short-lived (~1hr); refreshing well before that keeps a dashboard left
// open from silently losing its live feed. A brief resubscribe is an acceptable trade for
// never handing the browser a long-lived credential.
const TOKEN_REFRESH_MS = 45 * 60 * 1000

export function useModerationQueue(roomId: string, initialQueue: Photo[] = []) {
  const [queue, setQueue] = useState<Photo[]>(initialQueue)

  const handleInsert = useCallback((photo: Photo) => {
    if (photo.status !== 'pending') return
    setQueue(prev => {
      if (prev.some(p => p.id === photo.id)) return prev
      return [photo, ...prev]
    })
  }, [])

  const handleUpdate = useCallback((photo: Photo) => {
    if (photo.status === 'pending') {
      setQueue(prev => {
        if (prev.some(p => p.id === photo.id)) return prev
        return [photo, ...prev]
      })
    } else {
      // Removed from pending queue
      setQueue(prev => prev.filter(p => p.id !== photo.id))
    }
  }, [])

  const handleDelete = useCallback((photoId: string) => {
    setQueue(prev => prev.filter(p => p.id !== photoId))
  }, [])

  useEffect(() => {
    let cancelled = false
    let client: ReturnType<typeof createClient> | null = null
    let channel: RealtimeChannel | null = null

    async function connect() {
      const token = await getRealtimeAccessToken()
      if (cancelled || !token) return

      client = createClient(token)
      client.realtime.setAuth(token)

      channel = client
        .channel(`moderation-queue-${roomId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'photos', filter: `room_id=eq.${roomId}` },
          (payload) => handleInsert(payload.new as Photo)
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'photos', filter: `room_id=eq.${roomId}` },
          (payload) => handleUpdate(payload.new as Photo)
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'photos', filter: `room_id=eq.${roomId}` },
          (payload) => {
            const old = payload.old as { id: string }
            if (old.id) handleDelete(old.id)
          }
        )
        .subscribe()
    }

    function teardown() {
      if (client && channel) client.removeChannel(channel)
      client = null
      channel = null
    }

    connect()
    const refreshInterval = setInterval(() => { teardown(); connect() }, TOKEN_REFRESH_MS)

    return () => {
      cancelled = true
      clearInterval(refreshInterval)
      teardown()
    }
  }, [roomId, handleInsert, handleUpdate, handleDelete])

  return queue
}
