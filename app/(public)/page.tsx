import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      {/* Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-bg-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="" className="w-6 h-6 rounded" />
          </div>
          <span className="text-xl font-bold text-text-primary">OMNI Wall</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="btn-secondary text-sm">Sign in</Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Real-time photo sharing
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-6 leading-tight">
            Share the moment.{' '}
            <span className="text-primary">Instantly.</span>
          </h1>
          <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
            Join an event, upload photos, see them appear on the wall in real time.
            Perfect for weddings, conferences, parties, and every moment worth sharing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/join" className="btn-primary text-base px-8 py-3 rounded-xl">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Join a Room
            </Link>
            <Link href="/login" className="btn-secondary text-base px-8 py-3 rounded-xl">
              Sign in
            </Link>
          </div>
        </div>
      </main>

      {/* Feature callouts */}
      <section className="px-6 py-16 bg-bg-card border-t border-bg-border">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-text-primary mb-2 text-lg">Instant sharing</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Upload a photo and watch it appear on the wall within seconds. No delays, no waiting.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-text-primary mb-2 text-lg">Curated wall</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Moderation keeps the wall clean. Approve the best shots, keep the vibe right.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-text-primary mb-2 text-lg">Any screen</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Designed for mobile uploads and big-screen display. Works on TV, projector, any screen.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-bg-border text-center">
        <p className="text-text-tertiary text-sm">
          © {new Date().getFullYear()} OMNI Wall. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
