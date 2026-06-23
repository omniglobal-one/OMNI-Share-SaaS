'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Photo } from '@/types'

interface SlideshowPlayerProps {
  photos: Photo[]
  roomName: string
  joinCode: string
  onExit: () => void
}

export function SlideshowPlayer({ photos, roomName, joinCode, onExit }: SlideshowPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  const advance = useCallback(() => {
    if (photos.length <= 1) return
    setVisible(false)
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % photos.length)
      setVisible(true)
    }, 400)
  }, [photos.length])

  useEffect(() => {
    const interval = setInterval(advance, 5000)
    return () => clearInterval(interval)
  }, [advance])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onExit()
      if (e.key === 'ArrowRight') advance()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onExit, advance])

  const photo = photos[currentIndex]

  if (!photo || photos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50" onClick={onExit}>
        <p className="text-white/50 text-xl">No photos to display</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col" onClick={onExit}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 pt-6 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/40 text-sm font-medium">Live wall</span>
        </div>
        <p className="text-white/30 text-sm">Press Esc or click to exit</p>
      </div>

      {/* Image area — padded so the photo never touches the edges */}
      <div className="flex-1 flex items-center justify-center px-16 py-6 min-h-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={photo.id}
          src={photo.public_url}
          alt={photo.file_name ?? ''}
          className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 400ms ease-in-out',
          }}
        />
      </div>

      {/* Bottom info bar — clearly separated from the image */}
      <div className="flex items-end justify-between px-8 pt-2 pb-6 flex-shrink-0">
        <div>
          <p className="text-white font-bold text-2xl leading-tight">{roomName}</p>
          <p className="text-white/50 font-mono text-base tracking-widest mt-0.5">{joinCode}</p>
        </div>
        <p className="text-white/30 text-sm pb-1">{currentIndex + 1} / {photos.length}</p>
      </div>
    </div>
  )
}
