'use client'
import { useEffect, useState } from 'react'

interface NewPhotoToastProps {
  show: boolean
  onDismiss: () => void
}

export function NewPhotoToast({ show, onDismiss }: NewPhotoToastProps) {
  const [visible, setVisible] = useState(show)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onDismiss, 300)
      }, 3000)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [show, onDismiss])

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-24 opacity-0'
      }`}
    >
      <div className="bg-bg-card border border-bg-border rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-text-primary">New photo added</p>
      </div>
    </div>
  )
}
