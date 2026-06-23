'use client'
import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { RejectionForm } from './RejectionForm'
import { approvePhoto, rejectPhoto } from '@/app/actions/moderation'
import type { Photo } from '@/types'

interface ModerationPanelProps {
  photo: Photo | null
  roomId: string
  onModerated: () => void
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function ModerationPanel({ photo, roomId, onModerated }: ModerationPanelProps) {
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApprove = useCallback(async () => {
    if (!photo) return
    setError(null)
    setApproving(true)
    const result = await approvePhoto(photo.id, roomId)
    setApproving(false)
    if (!result.success) {
      setError(result.error)
    } else {
      onModerated()
    }
  }, [photo, roomId, onModerated])

  const handleReject = useCallback(async (reason?: string) => {
    if (!photo) return
    setError(null)
    setRejecting(true)
    const result = await rejectPhoto(photo.id, roomId, reason)
    setRejecting(false)
    if (!result.success) {
      setError(result.error)
    } else {
      setShowRejectForm(false)
      onModerated()
    }
  }, [photo, roomId, onModerated])

  // Keyboard shortcuts: A = approve, R = show reject form
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea') return
      if (!photo || approving || rejecting) return
      if (e.key === 'a' || e.key === 'A') handleApprove()
      if (e.key === 'r' || e.key === 'R') setShowRejectForm(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [photo, approving, rejecting, handleApprove])

  if (!photo) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-text-tertiary">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">Select a photo to review</p>
          <p className="text-xs mt-1 opacity-60">← or press A to approve, R to reject</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Image */}
      <div className="flex-1 bg-black flex items-center justify-center p-4 min-h-0">
        <Image
          src={photo.public_url}
          alt={photo.file_name ?? 'Photo'}
          width={photo.width ?? 1200}
          height={photo.height ?? 800}
          className="max-h-full max-w-full object-contain rounded"
          style={{ maxHeight: 'calc(100vh - 280px)' }}
          unoptimized
        />
      </div>

      {/* Info + Actions */}
      <div className="p-4 border-t border-bg-border bg-bg-card">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-text-primary">{photo.file_name ?? 'Photo'}</p>
            <p className="text-xs text-text-tertiary mt-0.5">
              {photo.width && photo.height ? `${photo.width} × ${photo.height}` : ''}
              {photo.file_size ? ` · ${formatBytes(photo.file_size)}` : ''}
              {photo.mime_type ? ` · ${photo.mime_type.replace('image/', '')}` : ''}
            </p>
          </div>
          <p className="text-xs text-text-tertiary flex-shrink-0">
            {new Date(photo.uploaded_at).toLocaleString()}
          </p>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger rounded px-3 py-2 text-sm mb-3">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            className="btn-success flex-1"
            disabled={approving || rejecting}
          >
            {approving ? 'Approving...' : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve <span className="opacity-60 text-xs">(A)</span>
              </>
            )}
          </button>
          <button
            onClick={() => setShowRejectForm(!showRejectForm)}
            className="btn-danger flex-1"
            disabled={approving || rejecting}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reject <span className="opacity-60 text-xs">(R)</span>
          </button>
        </div>

        {showRejectForm && (
          <RejectionForm
            onConfirm={handleReject}
            onCancel={() => setShowRejectForm(false)}
            loading={rejecting}
          />
        )}

        <p className="text-xs text-text-tertiary mt-3 text-center">
          ← → Arrow keys to navigate
        </p>
      </div>
    </div>
  )
}
