import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from './types/supabase'
import { defaultLocale, locales, type Locale } from './config/i18n'

// Define protected routes that require authentication
const PROTECTED_ROUTES = ['/profile', '/admin']
const AUTH_ROUTES = ['/auth/login', '/auth/register']

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const supabase = createMiddlewareClient<Database>({ req: request, res: NextResponse.next() })

  // Check if the pathname starts with a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // Get locale from pathname or use default
  const pathnameParts = pathname.split('/')
  const potentialLocale = pathnameParts[1]
  const currentLocale: Locale = pathnameHasLocale && locales.includes(potentialLocale as Locale)
    ? potentialLocale as Locale
    : defaultLocale

  // Get path without locale
  const pathWithoutLocale = pathnameHasLocale 
    ? `/${pathnameParts.slice(2).join('/')}` 
    : pathname

  // Handle session
  const { data: { session } } = await supabase.auth.getSession()

  // Redirect if no locale is present
  if (!pathnameHasLocale) {
    return NextResponse.redirect(
      new URL(
        `/${defaultLocale}${pathname === '/' ? '' : pathname}${search}`,
        request.url
      )
    )
  }

  // Validate locale
  if (pathnameHasLocale && !locales.includes(potentialLocale as Locale)) {
    return NextResponse.redirect(
      new URL(
        `/${defaultLocale}${pathWithoutLocale}${search}`,
        request.url
      )
    )
  }

  // Handle protected routes
  if (PROTECTED_ROUTES.some(route => pathWithoutLocale.startsWith(route))) {
    if (!session) {
      const searchParams = new URLSearchParams({
        next: `/${currentLocale}${pathWithoutLocale}`,
      })
      return NextResponse.redirect(
        new URL(`/${currentLocale}/auth/login?${searchParams}`, request.url)
      )
    }

    // Special handling for admin routes
    if (pathWithoutLocale.startsWith('/admin')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        return NextResponse.redirect(
          new URL(`/${currentLocale}`, request.url)
        )
      }
    }
  }

  // Redirect authenticated users away from auth routes
  if (AUTH_ROUTES.some(route => pathWithoutLocale.startsWith(route)) && session) {
    return NextResponse.redirect(
      new URL(`/${currentLocale}`, request.url)
    )
  }

  // Handle parallel routes for admin section
  if (pathWithoutLocale.startsWith('/admin')) {
    const response = NextResponse.next()
    response.headers.set('x-middleware-cache', 'no-cache')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static assets and api routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
