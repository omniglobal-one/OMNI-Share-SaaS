'use client'
import { useState, useEffect, useCallback } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { getRealtimeAccessToken } from '@/app/actions/auth'
import type { Photo } from '@/types'

// See useModerationQueue.ts for why this refresh loop exists.
const TOKEN_REFRESH_MS = 45 * 60 * 1000

export function usePhotoStatus(roomId: string, uploaderId: string, initialPhotos: Photo[] = []) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)

  const handleUpdate = useCallback((photo: Photo) => {
    if (photo.uploader_id !== uploaderId) return
    setPhotos(prev => prev.map(p => p.id === photo.id ? photo : p))
  }, [uploaderId])

  const handleInsert = useCallback((photo: Photo) => {
    if (photo.uploader_id !== uploaderId) return
    setPhotos(prev => {
      if (prev.some(p => p.id === photo.id)) return prev
      return [photo, ...prev]
    })
  }, [uploaderId])

  const handleDelete = useCallback((photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId))
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
        .channel(`photo-status-${roomId}-${uploaderId}`)
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
  }, [roomId, uploaderId, handleInsert, handleUpdate, handleDelete])

  return { photos, setPhotos }
}
