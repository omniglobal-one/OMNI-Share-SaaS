'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import type { Photo, WallColors } from '@/types'

function isLight(hex: string) {
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

  const bg        = colors?.bg     ?? '#000000'
  const textColor = colors?.text   ?? '#FFFFFF'
  const accent    = colors?.accent ?? '#2563EB'
  const fifaLogo  = isLight(bg) ? '/fifa-b.png' : '/fifa-w.png'

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

  const logoGlow = isLight(bg)
    ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))'
    : 'drop-shadow(0 0 14px rgba(251,191,36,0.45))'

  return (
    <>
    <style>{`
      @keyframes fifa-hspin {
        0%   { transform: perspective(500px) rotateY(0deg); }
        14%  { transform: perspective(500px) rotateY(360deg); }
        100% { transform: perspective(500px) rotateY(360deg); }
      }
      .fifa-spin { animation: fifa-hspin 5s ease-in-out 2s infinite; }
    `}</style>
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: bg }} onClick={onExit}>

      {/* Top bar */}
      <div className="flex items-center px-8 pt-6 pb-4 flex-shrink-0">
        {/* Left */}
        <div className="flex-1 flex items-center gap-2 self-start pt-3">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-medium" style={{ color: `${textColor}60` }}>Live wall</span>
        </div>
        {/* Centre — desktop only */}
        <div className="hidden sm:flex flex-col items-center gap-1.5">
          <Image src={fifaLogo} alt="FIFA World Cup 2026" width={72} height={72} className="fifa-spin" style={{ filter: logoGlow }} />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: isLight(bg) ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.45)' }}>
            FIFA World Cup 2026
          </span>
        </div>
        {/* Right */}
        <div className="flex-1 flex justify-end items-center gap-4 self-start pt-3">
          {/* Mobile: FIFA logo on the right */}
          <div className="sm:hidden flex flex-col items-center gap-1">
            <Image src={fifaLogo} alt="FIFA World Cup 2026" width={56} height={56} className="fifa-spin" style={{ filter: logoGlow }} />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: isLight(bg) ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.45)' }}>
              FIFA WC 2026
            </span>
          </div>
          {/* Desktop: Esc hint */}
          <p className="hidden sm:block text-sm" style={{ color: `${textColor}40` }}>Press Esc or click to exit</p>
        </div>
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
        <div>
          <p className="font-bold text-2xl leading-tight" style={{ color: textColor }}>{roomName}</p>
          <p className="font-mono text-base tracking-widest mt-0.5" style={{ color: accent }}>{joinCode}</p>
        </div>
        <p className="text-sm pb-1" style={{ color: `${textColor}40` }}>{currentIndex + 1} / {photos.length}</p>
      </div>
    </div>
    </>
  )
}
