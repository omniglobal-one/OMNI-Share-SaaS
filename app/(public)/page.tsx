import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Navbar */}
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="" className="w-6 h-6 rounded" />
          </div>
          <span className="text-lg font-bold text-text-primary">OMNI Wall</span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto">

          {/* Pill */}
          <div className="inline-flex items-center gap-1.5 bg-primary/8 text-primary px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
            Live photo sharing
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl font-bold text-text-primary leading-[1.1] tracking-tight mb-5">
            Share the moment.
            <br />
            <span className="text-primary">Instantly.</span>
          </h1>

          {/* Sub */}
          <p className="text-lg text-text-secondary leading-relaxed mb-10 max-w-lg mx-auto">
            Upload photos at any event and watch them appear on the wall in real time — weddings, conferences, parties, and more.
          </p>

          {/* CTA */}
          <Link href="/join" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Join a Room
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="px-6 py-20 bg-bg-base">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                color: 'bg-primary/10 text-primary',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                ),
                title: 'Instant sharing',
                body: 'Upload a photo and watch it appear on the wall within seconds. No delays, no waiting.',
              },
              {
                color: 'bg-amber-100 text-amber-600',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ),
                title: 'Curated wall',
                body: 'Moderation keeps the wall clean. Approve the best shots, keep the vibe right.',
              },
              {
                color: 'bg-green-100 text-green-600',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                ),
                title: 'Any screen',
                body: 'Designed for mobile uploads and big-screen display. Works on TV, projector, any device.',
              },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-xl border border-bg-border p-6">
                <div className={`w-11 h-11 ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{f.icon}</svg>
                </div>
                <h3 className="font-semibold text-text-primary mb-1.5">{f.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-5 border-t border-bg-border text-center">
        <p className="text-text-tertiary text-sm">© {new Date().getFullYear()} OMNI Wall. All rights reserved.</p>
      </footer>
    </div>
  )
}
