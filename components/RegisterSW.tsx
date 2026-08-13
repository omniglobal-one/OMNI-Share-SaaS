'use client'

import { useEffect } from 'react'

// This app has never had a working service worker — no PWA build step has ever generated a
// real /sw.js, so registering one always fails (the request falls through to the app router
// and returns page HTML with the wrong MIME type, which the browser rejects). If an earlier
// version of this file DID briefly succeed in registering something, that installation is now
// permanently stuck: a service worker can only self-update by re-fetching its own script, and
// since that now returns invalid content, the browser keeps the stale worker forever, silently
// serving whatever it cached from before — including outdated CSP-blocked image behavior.
// Actively unregister any such leftover worker instead of trying to register a new one.
export function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then(regs => regs.forEach(reg => reg.unregister()))
        .catch(() => {})
    }
  }, [])
  return null
}
