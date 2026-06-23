'use client'
import React, { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { UploadProgressBar } from './UploadProgressBar'
import type { UploadFile } from '@/types'

interface UploadPreviewProps {
  files: UploadFile[]
  roomId: string
  onRemove: (index: number) => void
  onAddMore: (files: UploadFile[]) => void
  onSuccess: () => void
}

type FileStatus = 'pending' | 'uploading' | 'done' | 'error'

interface FileProgress {
  progress: number
  status: FileStatus
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
const MAX_FILE_SIZE = 10 * 1024 * 1024

function loadDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url) }
    img.onerror = () => { resolve({ width: 0, height: 0 }); URL.revokeObjectURL(url) }
    img.src = url
  })
}

async function processFileList(fileList: FileList): Promise<UploadFile[]> {
  return Promise.all(Array.from(fileList).map(async file => {
    const previewUrl = URL.createObjectURL(file)
    let error: string | undefined
    if (!ACCEPTED_TYPES.includes(file.type)) error = 'Unsupported type'
    else if (file.size > MAX_FILE_SIZE) error = 'Too large (max 10MB)'
    const { width, height } = await loadDimensions(file)
    const result: UploadFile = { file, previewUrl, width, height }
    if (error) result.error = error
    return result
  }))
}

export function UploadPreview({ files, roomId, onRemove, onAddMore, onSuccess }: UploadPreviewProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<FileProgress[]>([])
  const [allDone, setAllDone] = useState(false)
  const addMoreRef = useRef<HTMLInputElement>(null)

  const validFiles = files.filter(f => !f.error)

  const handleUpload = useCallback(async () => {
    if (validFiles.length === 0) return
    setUploading(true)
    setAllDone(false)
    setProgress(files.map(() => ({ progress: 0, status: 'pending' as FileStatus })))

    let successCount = 0
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file || file.error) {
        setProgress(prev => {
          const next = [...prev]
          const cur = next[i]
          if (cur) next[i] = { ...cur, progress: 100, status: 'error' }
          return next
        })
        continue
      }

      setProgress(prev => {
        const next = [...prev]
        const cur = next[i]
        if (cur) next[i] = { ...cur, status: 'uploading', progress: 10 }
        return next
      })

      try {
        const formData = new FormData()
        formData.append('file', file.file)
        formData.append('width', String(file.width))
        formData.append('height', String(file.height))

        setProgress(prev => {
          const next = [...prev]
          const cur = next[i]
          if (cur) next[i] = { ...cur, progress: 50 }
          return next
        })

        const res = await fetch(`/api/upload/${roomId}`, { method: 'POST', body: formData })

        setProgress(prev => {
          const next = [...prev]
          const cur = next[i]
          if (cur) next[i] = { ...cur, progress: 100, status: res.ok ? 'done' : 'error' }
          return next
        })
        if (res.ok) successCount++
      } catch {
        setProgress(prev => {
          const next = [...prev]
          const cur = next[i]
          if (cur) next[i] = { ...cur, progress: 100, status: 'error' }
          return next
        })
      }
    }

    setUploading(false)
    if (successCount > 0) setAllDone(true)
  }, [files, validFiles.length, roomId])

  async function handleAddMoreChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return
    const processed = await processFileList(e.target.files)
    onAddMore(processed)
    e.target.value = ''
  }

  if (allDone) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-semibold text-text-primary text-xl mb-2">Photos uploaded!</h3>
        <p className="text-text-secondary mb-6">
          Your photos are pending review. Approved photos will appear on the wall.
        </p>
        <button onClick={onSuccess} className="btn-primary">Done</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Preview grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {files.map((f, i) => (
          <div key={i} className="relative rounded-lg overflow-hidden bg-bg-border aspect-square">
            <Image src={f.previewUrl} alt={f.file.name} fill className="object-cover" unoptimized />
            {f.error && (
              <div className="absolute inset-0 bg-danger/80 flex items-center justify-center">
                <p className="text-white text-xs px-2 text-center">{f.error}</p>
              </div>
            )}
            {!uploading && (
              <button
                onClick={() => onRemove(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
              <p className="text-white text-xs truncate">{f.file.name}</p>
              <p className="text-white/70 text-xs">
                {formatSize(f.file.size)}
                {f.width > 0 ? ` · ${f.width}×${f.height}` : ''}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bars during upload */}
      {uploading && progress.length > 0 && (
        <div className="space-y-3">
          {files.map((f, i) => {
            const p = progress[i]
            return p ? (
              <UploadProgressBar
                key={i}
                filename={f.file.name}
                size={formatSize(f.file.size)}
                progress={p.progress}
                status={p.status}
              />
            ) : null
          })}
        </div>
      )}

      {/* Actions */}
      {!uploading && (
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => addMoreRef.current?.click()}
            className="btn-secondary flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add more
          </button>
          <input
            ref={addMoreRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            multiple
            className="hidden"
            onChange={handleAddMoreChange}
          />
          <button
            onClick={handleUpload}
            className="btn-primary flex-1"
            disabled={validFiles.length === 0}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload {validFiles.length} photo{validFiles.length !== 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  )
}
