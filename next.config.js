/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
  async headers() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : '*.supabase.co'
    const supabaseWss = `wss://${supabaseHost}`

    // A nonce-based CSP (dropping 'unsafe-inline' from script-src) was attempted and reverted:
    // Next.js's automatic nonce-application to its own framework scripts could not be verified
    // as actually working in this environment (no browser available to confirm hydration
    // wasn't broken by 'strict-dynamic' rejecting un-nonced script tags), and shipping an
    // unverifiable change with site-wide-breakage blast radius was judged worse than leaving
    // this specific low-severity, no-active-sink finding only partially addressed. 'unsafe-eval'
    // — which IS safe to drop unconditionally, no nonce required — is removed from production.
    const cspBase = [
      "default-src 'self'",
      process.env.NODE_ENV === 'development'
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob: https://${supabaseHost} https://picsum.photos https://fastly.picsum.photos`,
      "font-src 'self'",
      `connect-src 'self' https://${supabaseHost} ${supabaseWss}`,
      "worker-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ]

    const baseHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    ]

    return [
      {
        source: '/(.*)',
        headers: [
          ...baseHeaders,
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: [...cspBase, "frame-ancestors 'none'"].join('; ') },
        ],
      },
      {
        source: '/room/:id/wall',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: [...cspBase, "frame-ancestors 'self'"].join('; ') },
        ],
      },
    ]
  },
}

module.exports = nextConfig
