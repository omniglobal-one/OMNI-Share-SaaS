import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? '',
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ?? '',
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as never)
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
    return response
  }

  // API routes for public data
  if (pathname.startsWith('/api/rooms/') && pathname.endsWith('/wall')) {
    return response
  }
  if (pathname.startsWith('/api/join/')) {
    return response
  }

  // Explicitly public paths
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return response
  }

  // Root: redirect based on auth
  if (pathname === '/') {
    if (user) {
      return NextResponse.redirect(new URL('/rooms', request.url))
    }
    return response
  }

  // Login/register: redirect to rooms if already authed
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    if (user) {
      const raw = request.nextUrl.searchParams.get('redirect') ?? '/rooms'
      // Only allow same-origin redirects — strip anything that looks absolute
      const redirectTo = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/rooms'
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
    return response
  }

  // All other routes require auth
  if (!user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname + request.nextUrl.search)
    return NextResponse.redirect(redirectUrl)
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
    return NextResponse.redirect(new URL('/suspended', request.url))
  }

  const role = profile?.role ?? 'user'

  // Admin routes
  if (pathname.startsWith('/admin')) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/rooms', request.url))
    }
    return response
  }

  // Manage routes — manager or admin
  if (pathname.startsWith('/manage')) {
    if (role !== 'admin' && role !== 'manager') {
      return NextResponse.redirect(new URL('/rooms', request.url))
    }
    return response
  }

  // Moderate routes — moderator, manager, or admin
  if (pathname.startsWith('/moderate')) {
    if (role !== 'admin' && role !== 'manager' && role !== 'moderator') {
      return NextResponse.redirect(new URL('/rooms', request.url))
    }
    return response
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
