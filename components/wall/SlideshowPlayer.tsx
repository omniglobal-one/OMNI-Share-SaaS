'use client'
import { useState, useEffect, useCallback } from 'react'
import { WorldCupBadge } from '@/components/wall/WorldCupBadge'
import type { Photo, WallColors } from '@/types'

const SLIDE_MS = 7000

interface SlideshowPlayerProps {
  photos: Photo[]
  roomName: string
  joinCode: string
  colors?: WallColors
  onExit: () => void
}

export function SlideshowPlayer({ photos, roomName, joinCode, colors, onExit }: SlideshowPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fading, setFading] = useState(false)

  const bg       = colors?.bg    ?? '#000000'
  const textColor = colors?.text  ?? '#FFFFFF'
  const accent    = colors?.accent ?? '#2563EB'

  const advance = useCallback(() => {
    if (photos.length <= 1) return
    setFading(true)
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % photos.length)
      setFading(false)
    }, 600)
  }, [photos.length])

  useEffect(() => {
    const t = setInterval(advance, SLIDE_MS)
    return () => clearInterval(t)
  }, [advance])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onExit()
      if (e.key === 'ArrowRight') advance()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onExit, advance])

  const photo = photos[currentIndex]

  if (!photo || photos.length === 0) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ background: bg }}
        onClick={onExit}
      >
        <p className="text-xl" style={{ color: `${textColor}60` }}>No photos to display</p>
      </div>
    )
  }

  return (
    <>
      {/* Keyframes for Ken Burns zoom and progress bar fill */}
      <style>{`
        @keyframes ss-kb  { from { transform: scale(1.0); } to { transform: scale(1.08); } }
        @keyframes ss-bar { from { transform: scaleX(0); } to  { transform: scaleX(1);   } }
      `}</style>

      <div
        className="fixed inset-0 z-50 overflow-hidden"
        style={{ background: bg }}
        onClick={onExit}
      >
        {/* ── Photo layer ─────────────────────────────────────────── */}
        {/* overflow-hidden clips the Ken Burns scale so it never bleeds */}
        <div className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={photo.id}
            src={photo.public_url}
            alt={photo.file_name ?? ''}
            className="w-full h-full object-contain"
            style={{
              opacity: fading ? 0 : 1,
              transition: 'opacity 600ms ease-in-out',
              animation: `ss-kb ${SLIDE_MS + 600}ms ease-out forwards`,
            }}
          />
        </div>

        {/* ── Gradient overlays ───────────────────────────────────── */}
        {/* Top: makes Live / counter readable over any photo */}
        <div
          className="absolute inset-x-0 top-0 pointer-events-none"
          style={{
            height: '28%',
            background: `linear-gradient(to bottom, ${bg}EE 0%, transparent 100%)`,
          }}
        />
        {/* Bottom: makes room name + join code readable over any photo */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: '60%',
            background: `linear-gradient(to top, ${bg} 35%, ${bg}CC 58%, transparent 100%)`,
          }}
        />

        {/* ── Progress bar ────────────────────────────────────────── */}
        <div
          className="absolute top-0 inset-x-0 overflow-hidden"
          style={{ height: 2, background: `${textColor}15` }}
        >
          <div
            key={currentIndex}
            className="h-full w-full"
            style={{
              background: accent,
              transformOrigin: 'left',
              animation: `ss-bar ${SLIDE_MS}ms linear forwards`,
            }}
          />
        </div>

        {/* ── Top chrome ──────────────────────────────────────────── */}
        <div className="absolute top-0 inset-x-0 flex items-center justify-between px-8 py-7">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-semibold" style={{ color: `${textColor}70` }}>
              Live
            </span>
          </div>
          <span
            className="text-sm tabular-nums font-medium"
            style={{ color: `${textColor}45` }}
          >
            {currentIndex + 1} / {photos.length}
          </span>
        </div>

        {/* ── Bottom chrome ───────────────────────────────────────── */}
        <div className="absolute bottom-0 inset-x-0 px-10 pb-10 flex items-end justify-between gap-8">

          {/* Left: room identity — the most important info for anyone in the room */}
          <div className="min-w-0">
            <p
              className="font-black tracking-tight leading-none mb-3 truncate"
              style={{
                fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                color: textColor,
              }}
            >
              {roomName}
            </p>
            <p
              className="font-mono font-bold tracking-[0.45em] uppercase"
              style={{
                fontSize: 'clamp(0.85rem, 1.5vw, 1.15rem)',
                color: accent,
              }}
            >
              {joinCode}
            </p>
          </div>

          {/* Right: commemorative badge + exit hint */}
          <div className="flex flex-col items-end gap-4 flex-shrink-0">
            <WorldCupBadge bgColor={bg} size="sm" />
            <p className="text-xs" style={{ color: `${textColor}28` }}>Esc to exit</p>
          </div>
        </div>
      </div>
    </>
  )
}
