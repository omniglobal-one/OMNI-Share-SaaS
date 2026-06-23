'use client'
import { useState } from 'react'
import { QRCode } from './QRCode'
import { regenerateJoinCode } from '@/app/actions/rooms'
import { Modal } from '@/components/ui/Modal'

interface JoinCodeCardProps {
  roomId: string
  joinCode: string
  appUrl: string
}

export function JoinCodeCard({ roomId, joinCode, appUrl }: JoinCodeCardProps) {
  const [code, setCode] = useState(joinCode)
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const joinUrl = `${appUrl}/join?code=${code}`

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRegenerate() {
    setRegenerating(true)
    setError(null)
    const result = await regenerateJoinCode(roomId)
    setRegenerating(false)
    setShowConfirm(false)
    if (!result.success) {
      setError(result.error)
    } else {
      setCode(result.data)
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">Join Code</h3>
        <button onClick={() => setShowQr(!showQr)} className="btn-secondary text-sm py-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          QR Code
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <span className="font-mono text-4xl font-bold tracking-[0.3em] text-text-primary">
          {code}
        </span>
        <button onClick={handleCopy} className="btn-secondary py-2">
          {copied ? (
            <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <p className="text-text-tertiary text-sm mb-4 font-mono">
        {joinUrl}
      </p>

      {error && <p className="text-danger text-sm mb-3">{error}</p>}

      <button
        onClick={() => setShowConfirm(true)}
        className="btn-secondary text-sm"
        disabled={regenerating}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {regenerating ? 'Regenerating...' : 'Regenerate code'}
      </button>

      {showQr && (
        <div className="mt-4 pt-4 border-t border-bg-border flex justify-center">
          <QRCode value={joinUrl} size={180} />
        </div>
      )}

      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Regenerate join code?"
        size="sm"
      >
        <p className="text-text-secondary text-sm mb-4">
          The old code will stop working immediately. Anyone with the old link won&apos;t be able to join.
        </p>
        <div className="flex gap-2">
          <button onClick={handleRegenerate} className="btn-danger flex-1" disabled={regenerating}>
            {regenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
          <button onClick={() => setShowConfirm(false)} className="btn-secondary">Cancel</button>
        </div>
      </Modal>
    </div>
  )
}
