'use client'
import { useEffect, useRef } from 'react'
import * as QRCodeLib from 'qrcode'

interface QRCodeProps {
  value: string
  size?: number
  printCardHref?: string
  printCardDownloadName?: string
}

export function QRCode({ value, size = 200, printCardHref, printCardDownloadName }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    QRCodeLib.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: { dark: '#111827', light: '#FFFFFF' },
    }).catch(() => {})
  }, [value, size])

  function handleDownload() {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = 'room-qr.png'
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  const downloadIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} className="rounded-lg" />
      {printCardHref ? (
        <a
          href={printCardHref}
          download={printCardDownloadName ?? 'room-card.png'}
          className="btn-secondary text-sm flex items-center gap-1.5"
        >
          {downloadIcon}
          Download Print Card
        </a>
      ) : (
        <button onClick={handleDownload} className="btn-secondary text-sm flex items-center gap-1.5">
          {downloadIcon}
          Download QR
        </button>
      )}
    </div>
  )
}
