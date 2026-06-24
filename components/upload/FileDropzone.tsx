'use client'
import React, { useCallback, useRef, useState } from 'react'
import type { UploadFile } from '@/types'

interface FileDropzoneProps {
  onFiles: (files: UploadFile[]) => void
  disabled?: boolean
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILES = 10

function loadImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      resolve({ width: 0, height: 0 })
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}

async function processFiles(fileList: FileList | File[]): Promise<UploadFile[]> {
  const files = Array.from(fileList).slice(0, MAX_FILES)
  return Promise.all(files.map(async (file) => {
    const previewUrl = URL.createObjectURL(file)
    let error: string | undefined
    if (!ACCEPTED_TYPES.includes(file.type)) {
      error = 'Unsupported file type'
    } else if (file.size > MAX_FILE_SIZE) {
      error = 'File too large (max 10MB)'
    }
    const { width, height } = await loadImageDimensions(file)
    const result: UploadFile = { file, previewUrl, width, height }
    if (error) result.error = error
    return result
  }))
}

export function FileDropzone({ onFiles, disabled }: FileDropzoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const processed = await processFiles(fileList)
    onFiles(processed)
  }, [onFiles])

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length > 0) {
      await handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const onInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFiles(e.target.files)
      e.target.value = ''
    }
  }, [handleFiles])

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
        dragging
          ? 'border-primary bg-primary/5'
          : 'border-bg-border hover:border-primary/50'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragEnter={e => { e.preventDefault(); setDragging(true) }}
      onDragOver={e => { e.preventDefault() }}
      onDragLeave={e => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setDragging(false)
        }
      }}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        multiple
        className="hidden"
        onChange={onInputChange}
        disabled={disabled}
      />
      <div className="pointer-events-none">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${dragging ? 'bg-primary/20' : 'bg-primary/10'}`}>
          <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={dragging ? 2.5 : 2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <p className={`font-medium mb-1 transition-colors ${dragging ? 'text-primary' : 'text-text-primary'}`}>
          {dragging ? 'Drop your photos here' : 'Drag & drop photos here'}
        </p>
        <p className="text-text-secondary text-sm">
          {dragging ? 'Release to upload' : 'or click to browse — JPEG, PNG, WebP, HEIC · Max 10MB · Up to 10 files'}
        </p>
      </div>
    </div>
  )
}
