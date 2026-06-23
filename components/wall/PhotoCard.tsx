'use client'
import Image from 'next/image'
import type { Photo } from '@/types'

interface PhotoCardProps {
  photo: Photo
  onSelect: (photo: Photo) => void
}

export function PhotoCard({ photo, onSelect }: PhotoCardProps) {
  return (
    <div
      className="break-inside-avoid mb-3 cursor-pointer group overflow-hidden rounded-lg"
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
    </div>
  )
}
