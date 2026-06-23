'use client'
import { useState, useEffect, useCallback } from 'react'
import { ModerationQueue } from '@/components/moderation/ModerationQueue'
import { ModerationPanel } from '@/components/moderation/ModerationPanel'
import { useModerationQueue } from '@/hooks/useModerationQueue'
import type { Room, Photo } from '@/types'

interface ModerationClientProps {
  room: Room
  initialQueue: Photo[]
}

export function ModerationClient({ room, initialQueue }: ModerationClientProps) {
  const queue = useModerationQueue(room.id, initialQueue)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedPhoto = queue.find(p => p.id === selectedId) ?? (queue[0] ?? null)

  // Auto-select first in queue
  useEffect(() => {
    if (queue.length > 0 && !selectedId) {
      const first = queue[0]
      if (first) setSelectedId(first.id)
    }
  }, [queue, selectedId])

  const currentIndex = queue.findIndex(p => p.id === selectedPhoto?.id)

  const goNext = useCallback(() => {
    if (currentIndex < queue.length - 1) {
      const next = queue[currentIndex + 1]
      if (next) setSelectedId(next.id)
    } else if (queue.length > 0) {
      const first = queue[0]
      if (first) setSelectedId(first.id)
    }
  }, [queue, currentIndex])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      const prev = queue[currentIndex - 1]
      if (prev) setSelectedId(prev.id)
    }
  }, [queue, currentIndex])

  // Keyboard shortcuts: arrow keys for navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea') return

      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goPrev, goNext])
  // Note: A and R shortcuts are handled inside ModerationPanel

  function handleModerated() {
    // Move to next photo after moderation
    goNext()
    if (selectedPhoto && selectedId === selectedPhoto.id) {
      const filtered = queue.filter(p => p.id !== selectedPhoto.id)
      if (filtered.length > 0) {
        const next = filtered[Math.min(currentIndex, filtered.length - 1)]
        if (next) setSelectedId(next.id)
      } else {
        setSelectedId(null)
      }
    }
  }

  return (
    <>
      <ModerationQueue
        queue={queue}
        selectedId={selectedPhoto?.id ?? null}
        onSelect={photo => setSelectedId(photo.id)}
      />
      <ModerationPanel
        photo={selectedPhoto}
        roomId={room.id}
        onModerated={handleModerated}
      />
    </>
  )
}
