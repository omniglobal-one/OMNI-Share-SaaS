'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'

// FIFA World Cup 2026 — Final: July 19, 2026.
// Badge auto-hides the day after the final. To remove early, set WORLD_CUP_END to a past date.
const WORLD_CUP_END = new Date('2026-07-20T00:00:00Z')

function isLight(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5
}

interface Props {
  bgColor: string
  size?: 'sm' | 'md'
}

export function WorldCupBadge({ bgColor, size = 'md' }: Props) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    setActive(new Date() < WORLD_CUP_END)
  }, [])

  if (!active) return null

  const light = isLight(bgColor)
  const logoSrc = light ? '/fifa-b.png' : '/fifa-w.png'
  const logoSize = size === 'sm' ? 24 : 32

  return (
    <div
      className="flex items-center gap-2 rounded-full"
      style={{
        padding: size === 'sm' ? '5px 12px 5px 8px' : '7px 16px 7px 10px',
        border: `1px solid ${light ? 'rgba(161,110,0,0.45)' : 'rgba(251,191,36,0.35)'}`,
        background: light ? 'rgba(161,110,0,0.08)' : 'rgba(251,191,36,0.07)',
      }}
    >
      <Image src={logoSrc} alt="" width={logoSize} height={logoSize} />
      <div className="flex flex-col leading-none">
        <span
          className="font-extrabold tracking-widest uppercase"
          style={{ fontSize: size === 'sm' ? 9 : 10, color: light ? '#78350f' : '#fbbf24' }}
        >
          FIFA World Cup
        </span>
        <span
          className="font-bold tracking-wide"
          style={{ fontSize: size === 'sm' ? 12 : 14, color: light ? '#92400e' : '#fcd34d', marginTop: 2 }}
        >
          2026™
        </span>
      </div>
      <span
        className="rounded-full animate-pulse flex-shrink-0"
        style={{
          width: size === 'sm' ? 6 : 7,
          height: size === 'sm' ? 6 : 7,
          background: light ? '#d97706' : '#fbbf24',
        }}
      />
    </div>
  )
}
