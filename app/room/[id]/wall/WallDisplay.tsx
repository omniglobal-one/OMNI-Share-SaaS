'use client'
import { useState, useEffect, useRef } from 'react'
import { PhotoGrid } from '@/components/wall/PhotoGrid'
import { SlideshowPlayer } from '@/components/wall/SlideshowPlayer'
import { NewPhotoToast } from '@/components/wall/NewPhotoToast'
import { usePhotoWall } from '@/hooks/usePhotoWall'
import type { Room, Photo } from '@/types'

interface WallDisplayProps {
  room: Room
  initialPhotos: Photo[]
}

export function WallDisplay({ room, initialPhotos }: WallDisplayProps) {
  const [slideshowActive, setSlideshowActive] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const photos = usePhotoWall(room.id, initialPhotos)
  const prevCountRef = useRef(initialPhotos.length)

  useEffect(() => {
    if (photos.length > prevCountRef.current) {
      prevCountRef.current = photos.length
      setShowToast(true)
    }
  }, [photos.length])

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
        <div>
          <h1 className="text-xl font-bold text-text-primary">{room.name}</h1>
          <p className="font-mono text-text-tertiary text-sm tracking-widest">{room.join_code}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-secondary">
            {photos.length} photo{photos.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setSlideshowActive(true)}
            className="btn-primary"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Slideshow
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="p-6">
        <PhotoGrid photos={photos} />
      </div>

      {/* Slideshow */}
      {slideshowActive && (
        <SlideshowPlayer
          photos={photos}
          roomName={room.name}
          joinCode={room.join_code}
          onExit={() => setSlideshowActive(false)}
        />
      )}

      {/* Toast */}
      <NewPhotoToast show={showToast} onDismiss={() => setShowToast(false)} />
    </div>
  )
}
