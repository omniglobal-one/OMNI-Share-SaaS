'use client'
import { useState } from 'react'
import { PhotoCard } from './PhotoCard'
import { Lightbox } from './Lightbox'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Photo } from '@/types'

interface PhotoGridProps {
  photos: Photo[]
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (photos.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
        title="No photos yet"
        description="Approved photos will appear here in real time."
      />
    )
  }

  return (
    <>
      {/* CSS Masonry grid using columns */}
      <div className="masonry-grid">
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            onSelect={() => setSelectedIndex(index)}
          />
        ))}
      </div>

      <Lightbox
        photos={photos}
        selectedIndex={selectedIndex}
        onClose={() => setSelectedIndex(null)}
        onNavigate={setSelectedIndex}
      />
    </>
  )
}
