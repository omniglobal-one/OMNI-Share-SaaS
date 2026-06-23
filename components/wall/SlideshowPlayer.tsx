'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
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
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onExit])

  const photo = photos[currentIndex]

  if (!photo || photos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50" onClick={onExit}>
        <p className="text-white/50 text-xl">No photos to display</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" onClick={onExit}>
      <Image
        src={photo.public_url}
        alt={photo.file_name ?? 'Slideshow photo'}
        fill
        className="object-contain"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 400ms ease-in-out',
        }}
        unoptimized
      />
      {/* Room info overlay */}
      <div className="absolute bottom-6 left-6 z-10 select-none">
        <p className="text-white font-bold text-3xl leading-none">{roomName}</p>
        <p className="text-white/60 font-mono text-xl tracking-widest mt-1">{joinCode}</p>
      </div>
      {/* Exit hint */}
      <div className="absolute top-4 right-4 z-10">
        <p className="text-white/40 text-sm">Press Esc or click to exit</p>
      </div>
      {/* Counter */}
      <div className="absolute bottom-6 right-6 z-10">
        <p className="text-white/40 text-sm">{currentIndex + 1} / {photos.length}</p>
      </div>
    </div>
  )
}
