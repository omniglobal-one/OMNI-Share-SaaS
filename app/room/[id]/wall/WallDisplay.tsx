'use client'
import { useState, useEffect, useRef } from 'react'
import { PhotoGrid } from '@/components/wall/PhotoGrid'
import { SlideshowPlayer } from '@/components/wall/SlideshowPlayer'
import { NewPhotoToast } from '@/components/wall/NewPhotoToast'
import { WallGate } from '@/components/wall/WallGate'
import { usePhotoWall } from '@/hooks/usePhotoWall'
import type { Room, Photo, WallColors, SocialLink } from '@/types'

const DEFAULT_COLORS: WallColors = { bg: '#000000', text: '#FFFFFF', accent: '#2563EB' }

interface WallDisplayProps {
  room: Room
  initialPhotos: Photo[]
}

function WallContent({ room, initialPhotos }: WallDisplayProps) {
  const [slideshowActive, setSlideshowActive] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const photos = usePhotoWall(room.id, initialPhotos)
  const prevCountRef = useRef(initialPhotos.length)
  const colors = room.wall_colors ?? DEFAULT_COLORS
  const links: SocialLink[] = room.social_links ?? []

  useEffect(() => {
    if (photos.length > prevCountRef.current) {
      prevCountRef.current = photos.length
      setShowToast(true)
    }
  }, [photos.length])

  return (
    <div className="min-h-screen" style={{ background: colors.bg }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: `${colors.text}20` }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: colors.text }}>{room.name}</h1>
          <p className="font-mono text-sm tracking-widest" style={{ color: colors.accent }}>{room.join_code}</p>
        </div>
        <div className="flex items-center gap-3">
          {links.length > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              {links.slice(0, 4).map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 rounded-full border font-medium hover:opacity-80 transition-opacity"
                  style={{ color: colors.accent, borderColor: `${colors.accent}50` }}>
                  {link.label}
                </a>
              ))}
            </div>
          )}
          <span className="text-sm" style={{ color: `${colors.text}80` }}>
            {photos.length} photo{photos.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setSlideshowActive(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-opacity hover:opacity-80"
            style={{ background: colors.accent, color: '#fff' }}
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

      {slideshowActive && (
        <SlideshowPlayer
          photos={photos}
          roomName={room.name}
          joinCode={room.join_code}
          colors={colors}
          onExit={() => setSlideshowActive(false)}
        />
      )}

      <NewPhotoToast show={showToast} onDismiss={() => setShowToast(false)} />
    </div>
  )
}

export function WallDisplay({ room, initialPhotos }: WallDisplayProps) {
  return (
    <WallGate joinCode={room.join_code} roomName={room.name}>
      <WallContent room={room} initialPhotos={initialPhotos} />
    </WallGate>
  )
}
