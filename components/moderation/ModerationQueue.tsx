'use client'
import Image from 'next/image'
import type { Photo } from '@/types'

interface ModerationQueueProps {
  queue: Photo[]
  selectedId: string | null
  onSelect: (photo: Photo) => void
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function ModerationQueue({ queue, selectedId, onSelect }: ModerationQueueProps) {
  return (
    <div className="w-80 flex-shrink-0 bg-bg-card border-r border-bg-border flex flex-col">
      <div className="px-4 py-3 border-b border-bg-border flex items-center justify-between">
        <h2 className="font-semibold text-text-primary text-sm">Pending</h2>
        <span className="badge-pending">{queue.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {queue.length === 0 && (
          <div className="px-4 py-8 text-center text-text-tertiary text-sm">
            No photos pending review
          </div>
        )}
        {queue.map(photo => (
          <button
            key={photo.id}
            onClick={() => onSelect(photo)}
            className={`w-full flex items-center gap-3 px-4 py-3 border-b border-bg-border/50 hover:bg-bg-base transition-colors text-left ${
              selectedId === photo.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
            }`}
          >
            <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-bg-border">
              <Image
                src={photo.public_url}
                alt={photo.file_name ?? 'Photo'}
                width={40}
                height={40}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {photo.file_name ?? 'Photo'}
              </p>
              <p className="text-xs text-text-tertiary">
                {timeAgo(photo.uploaded_at)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
