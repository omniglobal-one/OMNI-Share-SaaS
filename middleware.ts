import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

function buildCsp(nonce: string, frameAncestors: string): string {
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? ''
  const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : '*.supabase.co'
  const supabaseWss = `wss://${supabaseHost}`

  return [
    "default-src 'self'",
    // 'strict-dynamic' lets Next.js's own nonce'd runtime/chunk scripts load further scripts
    // without each needing its own nonce. 'unsafe-eval' is dropped from the shipped policy —
    // it was previously present even in production despite only being needed for dev/HMR.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    // Inline style ATTRIBUTES (React's style={{...}}, used throughout for per-room color
    // customization) cannot be nonce'd — CSP nonces only apply to <style>/<script> elements,
    // not the style="" attribute — so this stays unsafe-inline; only script-src changed.
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://${supabaseHost} https://picsum.photos https://fastly.picsum.photos`,
    "font-src 'self'",
    `connect-src 'self' https://${supabaseHost} ${supabaseWss}`,
    "worker-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors ${frameAncestors}`,
  ].join('; ')
}

export async function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isWallRoute = /^\/room\/[^/]+\/wall/.test(request.nextUrl.pathname)
  const csp = buildCsp(nonce, isWallRoute ? "'self'" : "'none'")

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  // Next.js's own renderer reads the nonce back out of the CSP header on the *request* object
  // (not just the response) to know what nonce to stamp onto its own script tags — without
  // this, the response's CSP would demand a nonce that no script tag actually carries, and
  // every script on the site would be blocked.
  requestHeaders.set('Content-Security-Policy', csp)

  let response = NextResponse.next({ request: { headers: requestHeaders } })

  function withCsp(res: NextResponse): NextResponse {
    res.headers.set('Content-Security-Policy', csp)
    res.headers.set('X-Frame-Options', isWallRoute ? 'SAMEORIGIN' : 'DENY')
    return res
  }

  const supabase = createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? '',
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ?? '',
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: requestHeaders } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, { ...options, secure: true } as never)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Public routes that never need auth
  const publicPaths = [
    '/join',
    '/suspended',
    '/auth/callback',
  ]

  // Wall page is always public
  if (pathname.match(/^\/room\/[^/]+\/wall/)) {
    return withCsp(response)
  }

  // API routes for public data
  if (pathname.startsWith('/api/rooms/') && pathname.endsWith('/wall')) {
    return withCsp(response)
  }
  if (pathname.startsWith('/api/join/')) {
    return withCsp(response)
  }

  // Explicitly public paths
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return withCsp(response)
  }

  // Root: redirect based on auth
  if (pathname === '/') {
    if (user) {
      return withCsp(NextResponse.redirect(new URL('/rooms', request.url)))
    }
    return withCsp(response)
  }

  // Login/register: redirect to rooms if already authed
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    if (user) {
      const raw = request.nextUrl.searchParams.get('redirect') ?? '/rooms'
      // Only allow same-origin redirects — strip anything that looks absolute
      const redirectTo = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/rooms'
      return withCsp(NextResponse.redirect(new URL(redirectTo, request.url)))
    }
    return withCsp(response)
  }

  // All other routes require auth
  if (!user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname + request.nextUrl.search)
    return withCsp(NextResponse.redirect(redirectUrl))
  }

  // Fetch profile using service role so anonymous users aren't blocked by RLS
  const serviceSupabase = createClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? '',
    process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { data: profile } = await serviceSupabase
    .from('profiles')
    .select('role, is_suspended')
    .eq('id', user.id)
    .single()

  // Suspended check
  if (profile?.is_suspended && !pathname.startsWith('/suspended')) {
    return withCsp(NextResponse.redirect(new URL('/suspended', request.url)))
  }

  const role = profile?.role ?? 'user'

  // Admin routes
  if (pathname.startsWith('/admin')) {
    if (role !== 'admin') {
      return withCsp(NextResponse.redirect(new URL('/rooms', request.url)))
    }
    return withCsp(response)
  }

  // Manage routes — manager or admin
  if (pathname.startsWith('/manage')) {
    if (role !== 'admin' && role !== 'manager') {
      return withCsp(NextResponse.redirect(new URL('/rooms', request.url)))
    }
    return withCsp(response)
  }

  // Moderate routes — moderator, manager, or admin
  if (pathname.startsWith('/moderate')) {
    if (role !== 'admin' && role !== 'manager' && role !== 'moderator') {
      return withCsp(NextResponse.redirect(new URL('/rooms', request.url)))
    }
    return withCsp(response)
  }

  return withCsp(response)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
