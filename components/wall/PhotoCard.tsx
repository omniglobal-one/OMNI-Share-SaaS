'use client'
import Image from 'next/image'
import type { Photo } from '@/types'

interface PhotoCardProps {
  photo: Photo
  onSelect: (photo: Photo) => void
}

export function PhotoCard({ photo, onSelect }: PhotoCardProps) {
  function handleReport(e: React.MouseEvent) {
    e.stopPropagation()
    const subject = encodeURIComponent('Content Report — OMNI Share')
    const body = encodeURIComponent(
      `I would like to report the following photo as inappropriate or in violation of the Terms of Use.\n\nPhoto URL: ${photo.public_url}\n\nPlease describe the issue:\n`
    )
    window.open(`mailto:omniglobal.one@gmail.com?subject=${subject}&body=${body}`)
  }

  return (
    <div
      className="break-inside-avoid mb-3 cursor-pointer group overflow-hidden rounded-lg relative"
      onClick={() => onSelect(photo)}
    >
      <Image
        src={photo.public_url}
        alt={photo.file_name ?? 'Event photo'}
        width={photo.width ?? 600}
        height={photo.height ?? 400}
        className="w-full h-auto object-cover group-hover:opacity-90 transition-opacity"
        style={{ display: 'block' }}
        unoptimized
      />
      <button
        onClick={handleReport}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 rounded"
        title="Report this photo"
        aria-label="Report this photo"
      >
        Report
      </button>
    </div>
  )
}
