'use client'
import { useState } from 'react'

interface RejectionFormProps {
  onConfirm: (reason?: string) => Promise<void>
  onCancel: () => void
  loading: boolean
}

export function RejectionForm({ onConfirm, onCancel, loading }: RejectionFormProps) {
  const [reason, setReason] = useState('')

  return (
    <div className="bg-bg-base border border-bg-border rounded-lg p-4 mt-3">
      <p className="text-sm font-medium text-text-primary mb-2">Rejection reason (optional)</p>
      <textarea
        className="input text-sm resize-none"
        rows={2}
        value={reason}
        onChange={e => setReason(e.target.value)}
        placeholder="e.g. Blurry, inappropriate content..."
        disabled={loading}
      />
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onConfirm(reason || undefined)}
          className="btn-danger flex-1 text-sm py-2"
          disabled={loading}
        >
          {loading ? 'Rejecting...' : 'Confirm reject'}
        </button>
        <button
          onClick={onCancel}
          className="btn-secondary text-sm py-2"
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
