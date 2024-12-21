import createMiddleware from 'next-intl/middleware';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLocale, locales } from './config/i18n';

// Define public and protected routes
const publicPages = ['/', '/properties', '/about', '/contact', '/auth/login', '/auth/register'];
const protectedPages = ['/admin', '/profile', '/favorites'];

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

  // Check if the page is protected
  const isProtectedPage = protectedPages.some(route => 
    pathWithoutLocale.startsWith(route)
  );

  // Only redirect if trying to access protected pages without session
  if (isProtectedPage && !session) {
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
