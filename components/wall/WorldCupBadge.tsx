'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'

// FIFA World Cup 2026 — Final: July 19, 2026.
// To remove early, set WORLD_CUP_END to a past date.
const WORLD_CUP_END = new Date('2026-07-20T00:00:00Z')

function isLight(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5
}

interface Props {
  bgColor: string
  /** sm — compact header badge   md — prominent slideshow badge */
  size?: 'sm' | 'md'
}

export function WorldCupBadge({ bgColor, size = 'md' }: Props) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    setActive(new Date() < WORLD_CUP_END)
  }, [])

  if (!active) return null

  const light    = isLight(bgColor)
  const logoSrc  = light ? '/fifa-b.png' : '/fifa-w.png'
  const gold     = light ? '#92400e' : '#fbbf24'
  const goldDim  = light ? '#b45309' : '#fcd34d'
  const border   = light ? 'rgba(146,64,14,0.35)'  : 'rgba(251,191,36,0.30)'
  const bg       = light ? 'rgba(146,64,14,0.07)'  : 'rgba(251,191,36,0.06)'

  if (size === 'sm') {
    return (
      <div
        className="flex items-center gap-2 rounded-full"
        style={{ padding: '5px 12px 5px 8px', border: `1px solid ${border}`, background: bg }}
      >
        <Image src={logoSrc} alt="" width={22} height={22} />
        <div className="flex flex-col leading-none">
          <span style={{ fontSize: 9,  fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: gold }}>FIFA World Cup</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: goldDim, marginTop: 2 }}>2026™</span>
        </div>
        <span className="animate-pulse rounded-full flex-shrink-0" style={{ width: 6, height: 6, background: gold }} />
      </div>
    )
  }

  // md — used in the slideshow bottom bar, centred between room name and photo counter
  return (
    <div
      className="flex flex-col items-center gap-2"
      style={{
        padding: '10px 20px',
        borderRadius: 12,
        border: `1px solid ${border}`,
        background: bg,
        minWidth: 140,
      }}
    >
      <Image src={logoSrc} alt="FIFA World Cup 2026" width={56} height={56} />
      <div className="flex flex-col items-center leading-none gap-1">
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: gold }}>
          FIFA World Cup
        </span>
        <div className="flex items-center gap-1.5">
          <span className="animate-pulse rounded-full flex-shrink-0" style={{ width: 5, height: 5, background: gold }} />
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.06em', color: goldDim }}>2026™</span>
          <span className="animate-pulse rounded-full flex-shrink-0" style={{ width: 5, height: 5, background: gold }} />
        </div>
      </div>
    </div>
  )
}
