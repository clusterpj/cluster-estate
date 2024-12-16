import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register', '/about']
const AUTH_ROUTES = ['/auth/login', '/auth/register']

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req: request, res })
  
  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname

  // Handle locale paths by removing the locale prefix for route checking
  const pathWithoutLocale = path.replace(/^\/[a-z]{2}(?:\/|$)/, '/')
  
  // Check if the path (without locale) is in our route arrays
  const isPublicRoute = PUBLIC_ROUTES.includes(pathWithoutLocale)
  const isAuthRoute = AUTH_ROUTES.includes(pathWithoutLocale)

  // Redirect authenticated users away from auth routes
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Redirect unauthenticated users away from protected routes
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/auth/login', request.url)
    // Add the attempted URL as a query parameter to redirect back after login
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
