'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Photo } from '@/types'

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
    const supabase = createClient()

    const channel = supabase
      .channel(`moderation-queue-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'photos',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => handleInsert(payload.new as Photo)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'photos',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => handleUpdate(payload.new as Photo)
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'photos',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const old = payload.old as { id: string }
          if (old.id) handleDelete(old.id)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId, handleInsert, handleUpdate, handleDelete])

  return queue
}
