import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { CookieConsent } from '@/components/CookieConsent'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })

export const metadata: Metadata = {
  title: 'OMNI Share',
  description: 'Share the moment. Instantly. Event photo sharing for everyone.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mono.variable}`}>
      <body suppressHydrationWarning>
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}
