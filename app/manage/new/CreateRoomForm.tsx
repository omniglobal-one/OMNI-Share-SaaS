'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createRoom } from '@/app/actions/rooms'

export function CreateRoomForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [maxUploads, setMaxUploads] = useState(50)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await createRoom({
      name,
      ...(description ? { description } : {}),
      maxUploadsPerUser: maxUploads,
    })
    setLoading(false)
    if (!result.success) {
      setError(result.error)
    } else {
      router.push(`/manage/${result.data}`)
    }
  }

  return (
    <div className="card p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="label" htmlFor="name">Room name *</label>
          <input
            id="name"
            type="text"
            className="input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Summer Wedding 2026"
            required
            maxLength={100}
          />
        </div>

        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea
            id="description"
            className="input resize-none"
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Tell guests what this room is for..."
          />
        </div>

        <div>
          <label className="label" htmlFor="maxUploads">Max uploads per user</label>
          <input
            id="maxUploads"
            type="number"
            className="input"
            value={maxUploads}
            onChange={e => setMaxUploads(parseInt(e.target.value, 10) || 50)}
            min={1}
            max={1000}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex-1" disabled={loading || !name.trim()}>
            {loading ? 'Creating...' : 'Create room'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
