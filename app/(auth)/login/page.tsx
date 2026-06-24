import { Suspense } from 'react'
import Link from 'next/link'
import { LoginClient } from './LoginClient'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.png" alt="" className="w-6 h-6 rounded" />
            </div>
            <span className="text-xl font-bold text-text-primary">OMNI Share</span>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary">Welcome back</h1>
          <p className="text-text-secondary mt-1">Sign in to your account to continue</p>
        </div>

        <div className="card p-6">
          <Suspense fallback={null}>
            <LoginClient />
          </Suspense>
        </div>

        <p className="hidden text-center text-text-tertiary text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-text-primary font-medium hover:underline">Create one</Link>
        </p>
        <p className="text-center text-text-tertiary text-sm mt-2">OMNI Share — Real-time photo sharing platform</p>
        <p className="text-center text-xs text-text-tertiary mt-2">
          <Link href="/privacy" className="hover:underline">Privacy Policy &amp; Terms of Use</Link>
        </p>
      </div>
    </div>
  )
}
