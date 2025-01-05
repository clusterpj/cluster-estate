import createMiddleware from 'next-intl/middleware';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLocale, locales, type Locale } from './config/i18n';

// Define route access levels
const publicPages = [
    '/', 
    '/properties', 
    '/about', 
    '/contact', 
    '/auth/login', 
    '/auth/register',
    '/properties/[id]', // Add this to allow access to individual property pages
    '/blog',       
    '/locations'   
];
const protectedPages = ['/profile', '/favorites'];
const adminPages = ['/admin'];

// Create next-intl middleware with proper locale handling
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always', // Changed from 'as-needed' to 'always'
  localeDetection: true
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

  // Get and validate locale from path
  const pathLocale = pathname.split('/')[1];
  const pathnameHasLocale = locales.includes(pathLocale as Locale);
  
  // Redirect if invalid locale
  if (pathLocale && !pathnameHasLocale) {
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, req.url));
  }

  // Ensure locale is always present in the URL
  if (!pathnameHasLocale) {
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, req.url));
  }

  const pathWithoutLocale = pathnameHasLocale
    ? `/${pathname.split('/').slice(2).join('/')}`
    : pathname;

  // Check if current page is auth related
  const isAuthPage = pathWithoutLocale.startsWith('/auth/');

  // Check page access level
  const isProtectedPage = protectedPages.some(route => 
    pathWithoutLocale.startsWith(route)
  );
  const isAdminPage = adminPages.some(route => 
    pathWithoutLocale.startsWith(route)
  );

  // Get user role from session
  const userRole = session?.user?.user_metadata?.role || 'user';

  // If user is logged in and trying to access auth pages, redirect to home
  if (session && isAuthPage) {
    const locale = pathnameHasLocale ? pathname.split('/')[1] : defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}`, req.url));
  }

  // Enhanced access control with role verification
  const hasAccess = async () => {
    // Allow access to auth pages without session
    if (isAuthPage) return true;
    
    // Allow access to public pages without session
    if (publicPages.some(route => pathWithoutLocale.startsWith(route))) return true;
    
    // Check protected pages - require authentication
    if (isProtectedPage && !session) return false;
    
    // Check admin pages - require admin role
    if (isAdminPage && userRole !== 'admin') return false;
    
    // Default behavior: allow access
    return true;
  }

  if (!(await hasAccess())) {
    // Get locale from pathname
    const locale = pathnameHasLocale ? pathname.split('/')[1] : defaultLocale;
    
    // Store the attempted URL as the callback URL, but only if it's not an auth page
    const callbackUrl = !isAuthPage ? pathname : `/${locale}`;
    
    // Redirect to login page with callback URL
    const redirectUrl = new URL(`/${locale}/auth/login`, req.url);
    redirectUrl.searchParams.set('callbackUrl', callbackUrl);
    return NextResponse.redirect(redirectUrl);
  }

  // For all other routes, proceed normally
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
