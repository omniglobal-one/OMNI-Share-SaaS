import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { CookieConsent } from '@/components/CookieConsent'
import { RegisterSW } from '@/components/RegisterSW'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })

export const metadata: Metadata = {
  title: 'OMNI Share',
  description: 'Share the moment. Instantly. Event photo sharing for everyone.',
  manifest: '/manifest.json',
}

// Required for the nonce-based CSP in middleware.ts to actually work: Next.js only applies a
// per-request nonce to a page's script tags when that page is dynamically rendered — a
// statically-optimized page's HTML (including script tags) is baked at build time, before any
// request-scoped nonce exists, so the two can never match. Most pages here already read
// cookies()/Supabase server sessions and were already dynamic; this closes the gap for the
// handful that weren't (login, register, join, privacy) — and is a deliberately low-cost trade
// for this app, since it's a per-user dashboard SaaS with no meaningful static-caching workload
// to lose (nothing here is public marketing content that benefits from ISR/CDN caching).
export const dynamic = 'force-dynamic'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mono.variable}`}>
      <body suppressHydrationWarning>
        {children}
        <CookieConsent />
        <RegisterSW />
      </body>
    </html>
  )
}
