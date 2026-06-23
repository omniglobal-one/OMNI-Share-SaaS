import Link from 'next/link'

export default function SuspendedPage() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-3">Account suspended</h1>
        <p className="text-text-secondary mb-6">
          Your account has been suspended. If you believe this is a mistake, please contact support.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href="mailto:support@omniwall.app"
            className="btn-primary justify-center"
          >
            Contact support
          </a>
          <Link href="/" className="btn-secondary justify-center">
            Return home
          </Link>
        </div>
      </div>
    </div>
  )
}
