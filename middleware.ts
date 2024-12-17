import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'
import { defaultLocale, locales } from './config/i18n'

// Define routes without locale prefix
const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register', '/about']
const AUTH_ROUTES = ['/auth/login', '/auth/register']

export async function middleware(request: NextRequest) {
  // Clone the URL
  const { pathname, search } = request.nextUrl
  
  // Check if the pathname starts with a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // Get the locale from the pathname or use default
  const currentLocale = pathnameHasLocale ? pathname.split('/')[1] as (typeof locales)[number] : defaultLocale

  // Validate the locale
  if (pathnameHasLocale && !locales.includes(currentLocale)) {
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname.substring(3)}${search}`, request.url))
  }

  // Redirect to default locale if no locale is present
  if (!pathnameHasLocale) {
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}${search}`, request.url))
  }

  // Continue with normal middleware operations
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req: request, res })
  
  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Handle locale paths by removing the locale prefix for route checking
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?:\/|$)/, '/')
  
  // Check if the path (without locale) is in our route arrays
  const isPublicRoute = PUBLIC_ROUTES.includes(pathWithoutLocale)
  const isAuthRoute = AUTH_ROUTES.includes(pathWithoutLocale)

  // Redirect authenticated users away from auth routes
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL(`/${currentLocale}/`, request.url))
  }

  // Redirect unauthenticated users away from protected routes
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL(`/${currentLocale}/auth/login`, request.url)
    // Add the attempted URL as a query parameter to redirect back after login
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    // Match all pathnames except those starting with:
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}
