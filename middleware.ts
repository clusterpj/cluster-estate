import createMiddleware from 'next-intl/middleware';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLocale, locales } from './config/i18n';

// Define route access levels
const publicPages = ['/', '/properties', '/about', '/contact', '/auth/login', '/auth/register'];
const protectedPages = ['/profile', '/favorites'];
const adminPages = ['/admin'];

// Create next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export default async function middleware(req: NextRequest) {
  const response = await intlMiddleware(req);

  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req, res: response });

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get the pathname of the request
  const { pathname } = req.nextUrl;

  // Get path without locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  const pathWithoutLocale = pathnameHasLocale
    ? pathname.slice(pathname.indexOf('/', 1))
    : pathname;

  // Check page access level
  const isProtectedPage = protectedPages.some(route => 
    pathWithoutLocale.startsWith(route)
  );
  const isAdminPage = adminPages.some(route => 
    pathWithoutLocale.startsWith(route)
  );

  // Get user role from session
  const userRole = session?.user?.user_metadata?.role || 'user';

  // Enhanced access control with role verification
  const hasAccess = async () => {
    if (!session) return false
    
    // Admin pages require admin role
    if (isAdminPage && userRole !== 'admin') return false
    
    // Protected pages require authenticated user
    if (isProtectedPage && !session) return false
    
    return true
  }

  if (!(await hasAccess())) {
    // Get locale from pathname
    const locale = pathnameHasLocale ? pathname.split('/')[1] : defaultLocale;
    
    // Redirect to login page with callback URL
    const redirectUrl = new URL(`/${locale}/auth/login`, req.url);
    redirectUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // For all other routes, proceed normally
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
