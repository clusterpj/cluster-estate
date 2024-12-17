import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'
import { defaultLocale, locales } from './config/i18n'

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register', '/about']
const AUTH_ROUTES = ['/auth/login', '/auth/register']
const ADMIN_ROUTES = ['/admin']

export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient<Database>({ req: request, res: NextResponse.next() })
  const { pathname, search } = request.nextUrl
  
  // Check if the pathname starts with a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // Get locale from pathname or use default
  const currentLocale = pathnameHasLocale ? pathname.split('/')[1] : defaultLocale

  // Get path without locale
  const pathWithoutLocale = pathnameHasLocale ? pathname.substring(currentLocale.length + 1) : pathname

  // Handle auth status
  const { data: { session } } = await supabase.auth.getSession()

  // Redirect if no locale is present
  if (!pathnameHasLocale) {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}${search}`, request.url)
    )
  }

  // Validate locale
  if (!locales.includes(currentLocale)) {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname.substring(3)}${search}`, request.url)
    )
  }

  // Handle admin routes
  if (pathWithoutLocale.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/${currentLocale}/auth/login?next=${encodeURIComponent(pathname)}`, request.url)
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Handle auth routes
  if (AUTH_ROUTES.includes(pathWithoutLocale) && session) {
    return NextResponse.redirect(new URL(`/${currentLocale}/`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}
