import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'

// Check if Supabase is properly configured
function hasValidSupabaseConfig(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return false
  if (url.includes('placeholder') || key.includes('placeholder')) return false
  if (url === 'https://placeholder.supabase.co') return false

  return true
}

// Check if path is an admin route
function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/dashboard') ||
         pathname.startsWith('/leads') ||
         pathname.startsWith('/estimates') ||
         pathname.startsWith('/rate-management') ||
         pathname.startsWith('/macros') ||
         pathname.startsWith('/customers') ||
         pathname.startsWith('/settings') ||
         pathname.startsWith('/line-items') ||
         pathname.startsWith('/team') ||
         pathname.startsWith('/tasks') ||
         pathname.startsWith('/templates') ||
         pathname.startsWith('/workflows') ||
         pathname.startsWith('/seo-strategy') ||
         pathname.startsWith('/content-strategy') ||
         pathname.startsWith('/features') ||
         pathname.startsWith('/communications') ||
         pathname.startsWith('/invoices') ||
         pathname.startsWith('/messages')
}

// Check if path is a customer portal route
function isCustomerPortalRoute(pathname: string): boolean {
  return pathname.startsWith('/portal')
}

// Check if path is a customer auth route
function isCustomerAuthRoute(pathname: string): boolean {
  return pathname === '/customer/login' || pathname === '/customer/register'
}

// Check if path is an API route
function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/')
}

// Check if path is an auth API route
function isAuthApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/auth/') ||
         pathname.startsWith('/api/customer/register') ||
         pathname.startsWith('/api/customer/login')
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const pathname = request.nextUrl.pathname

  // Rate limiting for API routes
  if (isApiRoute(pathname)) {
    const clientIP = getClientIP(request)
    const limitType = isAuthApiRoute(pathname) ? 'auth' : 'api'
    const rateLimitResult = checkRateLimit(clientIP, limitType)

    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining))
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(rateLimitResult.resetTime / 1000)))
  }

  // Skip auth checks if Supabase is not configured (mock mode)
  if (!hasValidSupabaseConfig()) {
    // Block API routes when auth is not available
    if (isApiRoute(pathname) && !isAuthApiRoute(pathname)) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      )
    }
    // In mock mode, protect admin routes
    if (isAdminRoute(pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }
    // In mock mode, protect customer portal routes
    if (isCustomerPortalRoute(pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = '/customer/login'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }
    // Allow auth pages to render
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - this updates cookies automatically
  const { data: { session } } = await supabase.auth.getSession()

  // If session exists but is close to expiry (within 60 seconds), refresh it
  if (session?.expires_at) {
    const expiresAt = session.expires_at * 1000 // Convert to ms
    const now = Date.now()
    const bufferMs = 60 * 1000 // 60 seconds buffer

    if (expiresAt - now < bufferMs) {
      await supabase.auth.refreshSession()
    }
  }

  // Get user after potential refresh
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if accessing admin routes
  if (isAdminRoute(pathname)) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }

    // Verify user is an admin (not just authenticated)
    const isAdmin =
      user.user_metadata?.role === 'admin' ||
      user.app_metadata?.role === 'admin' ||
      user.user_metadata?.is_admin === true ||
      user.app_metadata?.is_admin === true

    if (!isAdmin) {
      // Non-admin user trying to access admin routes - redirect to home
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // Check if accessing customer portal routes
  if (isCustomerPortalRoute(pathname)) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/customer/login'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Redirect logged-in users away from admin login page
  if (pathname === '/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users away from customer auth pages
  if (isCustomerAuthRoute(pathname) && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/portal'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    // API routes (for rate limiting)
    '/api/:path*',
    // Admin routes
    '/dashboard/:path*',
    '/leads/:path*',
    '/estimates/:path*',
    '/rate-management/:path*',
    '/macros/:path*',
    '/customers/:path*',
    '/settings/:path*',
    '/line-items/:path*',
    '/team/:path*',
    '/tasks/:path*',
    '/templates/:path*',
    '/workflows/:path*',
    '/seo-strategy/:path*',
    '/content-strategy/:path*',
    '/features/:path*',
    '/communications/:path*',
    '/invoices/:path*',
    '/messages/:path*',
    '/login',
    // Customer portal routes
    '/portal/:path*',
    '/customer/login',
    '/customer/register',
  ],
}
