'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'omni_cookie_consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const val = localStorage.getItem(STORAGE_KEY)
    if (val !== 'accepted' && val !== 'rejected') {
      setVisible(true)
    }
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setVisible(false)
  }

  function reject() {
    localStorage.setItem(STORAGE_KEY, 'rejected')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-bg-card border-t border-bg-border shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-text-secondary flex-1">
          We use browser-based storage to remember your preferences.
          By using OMNI Share you agree to our{' '}
          <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={reject}
            className="text-sm font-medium text-text-secondary border border-bg-border px-4 py-2 rounded-lg hover:text-text-primary transition-colors"
          >
            Reject
          </button>
          <button
            onClick={accept}
            className="shrink-0 btn-primary text-sm px-4 py-2"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
