'use client'
import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createRoom } from '@/app/actions/rooms'

export function CreateRoomForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [maxUploads, setMaxUploads] = useState(50)
  const [bannerUrl, setBannerUrl] = useState<string | null>(null)
  const [bannerUploading, setBannerUploading] = useState(false)
  const [bannerError, setBannerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerError(null)
    setBannerUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload/banner', { method: 'POST', body: fd })
    setBannerUploading(false)
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setBannerError(json.error ?? 'Banner upload failed')
      return
    }
    const json = await res.json()
    setBannerUrl(json.url)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await createRoom({
      name,
      ...(description ? { description } : {}),
      ...(bannerUrl ? { bannerUrl } : {}),
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
          <label className="label">Banner image</label>
          {bannerUrl ? (
            <div className="relative rounded-lg overflow-hidden h-32 bg-bg-subtle">
              <Image src={bannerUrl} alt="Banner preview" fill className="object-cover" unoptimized />
              <button
                type="button"
                onClick={() => { setBannerUrl(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 rounded"
              >
                Remove
              </button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-bg-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {bannerUploading ? (
                <p className="text-sm text-text-secondary">Uploading…</p>
              ) : (
                <>
                  <p className="text-sm text-text-secondary">Click to upload a banner image</p>
                  <p className="text-xs text-text-tertiary mt-1">JPEG, PNG or WebP · max 5 MB</p>
                </>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleBannerChange}
          />
          {bannerError && <p className="text-xs text-danger mt-1">{bannerError}</p>}
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
          <button type="submit" className="btn-primary flex-1" disabled={loading || !name.trim() || bannerUploading}>
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
