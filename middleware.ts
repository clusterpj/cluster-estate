import createMiddleware from 'next-intl/middleware';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLocale, locales } from './config/i18n';

const publicPages = ['/', '/auth/login', '/auth/register', '/about'];

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

  // Check if the page is public or protected
  const isPublicPage = publicPages.includes(pathWithoutLocale);

  // Handle protected routes
  if (!isPublicPage && !session) {
    // Get locale from pathname
    const locale = pathnameHasLocale ? pathname.split('/')[1] : defaultLocale;
    
    // Redirect to login page with callback URL
    const redirectUrl = new URL(`/${locale}/auth/login`, req.url);
    redirectUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Special handling for admin routes
  if (pathWithoutLocale.startsWith('/admin')) {
    if (!session) {
      const locale = pathnameHasLocale ? pathname.split('/')[1] : defaultLocale;
      const redirectUrl = new URL(`/${locale}/auth/login`, req.url);
      redirectUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      const locale = pathnameHasLocale ? pathname.split('/')[1] : defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}`, req.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
