type Status = 'pending' | 'uploading' | 'done' | 'error'

interface UploadProgressBarProps {
  filename: string
  size: string
  progress: number
  status: Status
}

const statusColors: Record<Status, string> = {
  pending: 'bg-text-tertiary',
  uploading: 'bg-primary',
  done: 'bg-success',
  error: 'bg-danger',
}

export function UploadProgressBar({ filename, size, progress, status }: UploadProgressBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-text-primary truncate">{filename}</span>
          <span className="text-xs text-text-tertiary ml-2 flex-shrink-0">{size}</span>
        </div>
        <div className="h-1.5 bg-bg-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${statusColors[status]}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {status === 'error' && (
          <p className="text-danger text-xs mt-0.5">Upload failed</p>
        )}
      </div>
      {status === 'done' && (
        <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {status === 'error' && (
        <svg className="w-5 h-5 text-danger flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </div>
  )
}
