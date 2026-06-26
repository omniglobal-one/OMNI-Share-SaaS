'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import type { Photo, WallColors } from '@/types'

function isLightBg(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5
}

interface SlideshowPlayerProps {
  photos: Photo[]
  roomName: string
  joinCode: string
  colors?: WallColors
  onExit: () => void
}

export function SlideshowPlayer({ photos, roomName, joinCode, colors, onExit }: SlideshowPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  const bg = colors?.bg ?? '#000000'
  const textColor = colors?.text ?? '#FFFFFF'
  const accent = colors?.accent ?? '#2563EB'
  const fifaLogo = isLightBg(bg) ? '/fifa-b.png' : '/fifa-w.png'

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
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: bg }} onClick={onExit}>
        <p className="text-xl" style={{ color: `${textColor}60` }}>No photos to display</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: bg }} onClick={onExit}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 pt-6 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-medium" style={{ color: `${textColor}60` }}>Live wall</span>
        </div>
        <p className="text-sm" style={{ color: `${textColor}40` }}>Press Esc or click to exit</p>
      </div>

      {/* Image area */}
      <div className="flex-1 flex items-center justify-center px-16 py-6 min-h-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={photo.id}
          src={photo.public_url}
          alt={photo.file_name ?? ''}
          className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
          style={{ opacity: visible ? 1 : 0, transition: 'opacity 400ms ease-in-out' }}
        />
      </div>

      {/* Bottom info bar */}
      <div className="flex items-end justify-between px-8 pt-2 pb-6 flex-shrink-0">
        <div className="flex items-end gap-4">
          <div>
            <p className="font-bold text-2xl leading-tight" style={{ color: textColor }}>{roomName}</p>
            <p className="font-mono text-base tracking-widest mt-0.5" style={{ color: accent }}>{joinCode}</p>
          </div>
          <Image src={fifaLogo} alt="FIFA World Cup" width={56} height={56} className="opacity-80 mb-0.5" />
        </div>
        <p className="text-sm pb-1" style={{ color: `${textColor}40` }}>{currentIndex + 1} / {photos.length}</p>
      </div>
    </div>
  )
}
