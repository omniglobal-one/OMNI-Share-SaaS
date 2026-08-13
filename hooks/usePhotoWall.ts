'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import type { Photo } from '@/types'

const POLL_INTERVAL_MS = 5000

interface WallPhoto {
  id: string
  room_id: string
  public_url: string
  thumbnail_url: string | null
  file_name: string | null
  width: number | null
  height: number | null
  uploaded_at: string
}

// Polls the room's authorised wall endpoint instead of subscribing to Postgres changes
// directly. The photos table has no anonymous SELECT grant (see migration
// 004_scope_public_photo_access.sql) — direct anon table access made every room's approved
// photos enumerable without the join code. app/api/rooms/[id]/wall/route.ts already does the
// correct, cookie-verified, service-role-backed fetch; this hook just re-calls it on an
// interval so the wall still feels live without needing a new realtime-authorization scheme.
export function usePhotoWall(roomId: string, initialPhotos: Photo[] = []) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const knownIds = useRef(new Set(initialPhotos.map(p => p.id)))

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/wall`, { cache: 'no-store' })
      if (!res.ok) return
      const { photos: fetched } = (await res.json()) as { photos: WallPhoto[] }

      setPhotos(prev => {
        const fetchedIds = new Set(fetched.map(p => p.id))
        // Preserve any fields the initial server-rendered payload had that the lean
        // polling payload doesn't (defensively spread over existing rows with the same id).
        const merged: Photo[] = fetched.map(f => {
          const existing = prev.find(p => p.id === f.id)
          return existing ? { ...existing, ...f } : ({ ...f, status: 'approved' } as unknown as Photo)
        })
        knownIds.current = fetchedIds
        return merged
      })
    } catch {
      // Transient network/poll failure — next interval tick will retry. No need to surface
      // this to the user; the wall just keeps showing the last-known-good state.
    }
  }, [roomId])

  useEffect(() => {
    poll()
    const interval = setInterval(poll, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [poll])

  return photos
}
