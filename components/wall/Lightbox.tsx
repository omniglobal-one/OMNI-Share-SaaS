'use client'
import { useEffect, useCallback } from 'react'
import Image from 'next/image'
import type { Photo } from '@/types'

interface LightboxProps {
  photos: Photo[]
  selectedIndex: number | null
  onClose: () => void
  onNavigate: (index: number) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function Lightbox({ photos, selectedIndex, onClose, onNavigate }: LightboxProps) {
  const photo = selectedIndex !== null ? (photos[selectedIndex] ?? null) : null

  const prev = useCallback(() => {
    if (selectedIndex === null || selectedIndex <= 0) return
    onNavigate(selectedIndex - 1)
  }, [selectedIndex, onNavigate])

  const next = useCallback(() => {
    if (selectedIndex === null || selectedIndex >= photos.length - 1) return
    onNavigate(selectedIndex + 1)
  }, [selectedIndex, photos.length, onNavigate])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, prev, next])

  if (!photo) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      {/* Backdrop click closes */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Image */}
      <div className="relative z-10 max-w-5xl max-h-[90vh] mx-4 flex flex-col items-center">
        <Image
          src={photo.public_url}
          alt={photo.file_name ?? 'Event photo'}
          width={photo.width ?? 1200}
          height={photo.height ?? 800}
          className="max-h-[80vh] max-w-full object-contain rounded-lg"
          style={{ width: 'auto', height: 'auto' }}
          unoptimized
        />
        <div className="mt-3 text-center">
          <p className="text-white/80 text-sm">
            {formatDate(photo.uploaded_at)}
          </p>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 text-white/70 hover:text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Prev */}
      {selectedIndex !== null && selectedIndex > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); prev() }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white/70 hover:text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Next */}
      {selectedIndex !== null && selectedIndex < photos.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); next() }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white/70 hover:text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  )
}
