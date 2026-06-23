'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Photo } from '@/types'

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
    const supabase = createClient()

    const channel = supabase
      .channel(`photo-status-${roomId}-${uploaderId}`)
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
  }, [roomId, uploaderId, handleInsert, handleUpdate, handleDelete])

  return { photos, setPhotos }
}
