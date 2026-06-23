'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Photo } from '@/types'

export function usePhotoWall(roomId: string, initialPhotos: Photo[] = []) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)

  const handleInsert = useCallback((photo: Photo) => {
    setPhotos(prev => {
      if (prev.some(p => p.id === photo.id)) return prev
      return [photo, ...prev]
    })
  }, [])

  const handleDelete = useCallback((photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId))
  }, [])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`room-wall-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'photos',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const photo = payload.new as Photo
          if (photo.status === 'approved') {
            handleInsert(photo)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'photos',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const photo = payload.new as Photo
          if (photo.status === 'approved') {
            handleInsert(photo)
          } else {
            handleDelete(photo.id)
          }
        }
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
  }, [roomId, handleInsert, handleDelete])

  return photos
}
