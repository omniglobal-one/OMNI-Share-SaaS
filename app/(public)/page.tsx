import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">

      {/* Navbar */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-center max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="" className="w-6 h-6 rounded" />
          </div>
          <span className="text-lg font-bold text-text-primary">OMNI Share</span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-16 pb-32">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -top-20 -right-40 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-bg-border shadow-sm text-text-secondary px-4 py-1.5 rounded-full text-xs font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Real-time • No account needed • Free to join
          </div>

          {/* Headline */}
          <h1 className="text-6xl sm:text-7xl font-extrabold text-text-primary leading-[1.05] tracking-tight mb-6">
            Your event,
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 text-primary">on the wall.</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 8.5C60 3 120 2 150 2C180 2 240 3 298 8.5" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" opacity="0.3"/>
              </svg>
            </span>
          </h1>

          <p className="text-xl text-text-secondary leading-relaxed mb-10 max-w-xl mx-auto">
            Guests upload photos, you approve them, everyone sees them live on a big screen. Perfect for weddings, conferences, and every moment worth sharing.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/join"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-primary/25"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Join with a code
            </Link>
            <p className="text-text-tertiary text-sm">Enter the 6-letter code from your host</p>
          </div>
        </div>

        {/* Mock wall preview */}
        <div className="relative mt-20 max-w-4xl w-full mx-auto">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white z-10 pointer-events-none" style={{top: '60%'}} />
          <div className="bg-white border border-bg-border rounded-2xl shadow-2xl shadow-gray-200 overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-bg-border bg-bg-base">
              <div className="w-3 h-3 rounded-full bg-red-300" />
              <div className="w-3 h-3 rounded-full bg-yellow-300" />
              <div className="w-3 h-3 rounded-full bg-green-300" />
              <div className="flex-1 mx-4 bg-bg-border rounded-md h-5 flex items-center px-3">
                <span className="text-text-tertiary text-xs font-mono">wall.omnidesk.one/room/tech-summit/wall</span>
              </div>
            </div>
            {/* Fake photo wall */}
            <div className="p-4 bg-gray-950">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { h: 'h-28', bg: 'bg-gradient-to-br from-blue-400 to-blue-600' },
                  { h: 'h-36', bg: 'bg-gradient-to-br from-purple-400 to-pink-500' },
                  { h: 'h-24', bg: 'bg-gradient-to-br from-amber-400 to-orange-500' },
                  { h: 'h-32', bg: 'bg-gradient-to-br from-emerald-400 to-teal-600' },
                  { h: 'h-32', bg: 'bg-gradient-to-br from-rose-400 to-red-500' },
                  { h: 'h-24', bg: 'bg-gradient-to-br from-indigo-400 to-blue-600' },
                  { h: 'h-36', bg: 'bg-gradient-to-br from-yellow-400 to-amber-500' },
                  { h: 'h-28', bg: 'bg-gradient-to-br from-cyan-400 to-sky-600' },
                ].map((tile, i) => (
                  <div key={i} className={`${tile.h} ${tile.bg} rounded-lg flex items-center justify-center opacity-90`}>
                    <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 px-1">
                <span className="text-white/40 text-xs font-medium">Tech Summit 2026 — Live Wall</span>
                <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  24 guests online
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24 max-w-5xl mx-auto w-full">
        <div className="text-center mb-14">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-4xl font-bold text-text-primary">Three steps, zero friction</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* connector line */}
          <div className="hidden md:block absolute top-7 left-1/3 right-1/3 h-px bg-bg-border" />
          {[
            {
              step: '01',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
              title: 'Join with a code',
              body: 'Your host shares a 6-character code. Enter it on your phone — no account, no app download.',
            },
            {
              step: '02',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z" />,
              title: 'Upload your photos',
              body: 'Take a shot or pick from your gallery. Drag and drop or tap to upload — up to 10 at once.',
            },
            {
              step: '03',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
              title: 'See it on the wall',
              body: 'Once approved, your photo appears live on the big screen for everyone to enjoy.',
            },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">{s.icon}</svg>
                </div>
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-white border border-bg-border rounded-full text-[10px] font-bold text-text-tertiary flex items-center justify-center">{i + 1}</span>
              </div>
              <h3 className="font-bold text-text-primary text-lg mb-2">{s.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features strip */}
      <section className="bg-white px-6 py-20">
        <div className="max-w-5xl mx-auto bg-gray-950 text-white rounded-3xl overflow-hidden border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5">
            {[
              {
                accent: 'text-blue-400',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
                title: 'Instant, real-time',
                body: 'Photos appear on the wall within seconds of being approved. No refreshing, no waiting.',
              },
              {
                accent: 'text-amber-400',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
                title: 'Moderated & safe',
                body: 'Every photo goes through approval before it hits the wall. Full control for your event.',
              },
              {
                accent: 'text-green-400',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2v-6a2 2 0 00-2-2H8a2 2 0 00-2 2v6a2 2 0 002 2zM8 3h.01M12 3h.01M16 3h.01M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01" />,
                title: 'Any screen, any room',
                body: 'Cast to a TV, projector, or monitor. Designed for massive screens and tiny pockets alike.',
              },
            ].map((f, i) => (
              <div key={i} className="bg-gray-950 px-8 py-10">
                <svg className={`w-6 h-6 ${f.accent} mb-5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">{f.icon}</svg>
                <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-4xl font-bold text-text-primary mb-4">Ready to join?</h2>
          <p className="text-text-secondary mb-8">Get your code from the event host and start sharing in seconds.</p>
          <Link
            href="/join"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-primary/20"
          >
            Enter your room code
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-bg-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.png" alt="" className="w-4 h-4 rounded" />
            </div>
            <span className="text-sm font-semibold text-text-secondary">OMNI Share</span>
          </div>
          <p className="text-text-tertiary text-sm">© {new Date().getFullYear()} OMNI Share. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
