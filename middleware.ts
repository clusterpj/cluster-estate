// middleware.ts
import createMiddleware from 'next-intl/middleware';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLocale, locales, type Locale } from './config/i18n';

// Define public pages that don't require authentication
const publicPages = [
  '/', 
  '/properties', 
  '/about', 
  '/contact', 
  '/auth/login', 
  '/auth/register',
  '/properties/[id]',
  '/blog',       
  '/locations',
  '/activities',  // Added activities page as public
  '/admin-check',
  '/direct-admin',
  // '/admin',      // Re-commenting admin routes for proper checks
  // '/admin-fix',  // Re-commenting admin routes for proper checks
  '/api/admin-fix', // Admin fix API
  '/api/admin-check' // Admin check API
];

// Auth-related paths that should never redirect to themselves
const authPaths = ['/auth/login', '/auth/register', '/auth/callback', '/auth/logout'];

// Create next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true
});

export default async function middleware(req: NextRequest) {
  // Get the pathname from the URL
  const { pathname } = req.nextUrl;
  
  // Extract the path without locale prefix for easier matching
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?:\/|$)/, '/');
  
  // Log middleware access for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware accessed for path:', pathname, 'Without locale:', pathWithoutLocale);
  }
  
  // Get response from intl middleware first
  const response = intlMiddleware(req);
  
  // Create Supabase client
  const supabase = createMiddlewareClient({ req, res: response });
  
  // Always refresh the session AND get the initial session state
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('Error getting session in middleware:', sessionError);
    // Handle potential errors during session retrieval if necessary
    // For now, logging the error might suffice, depending on required behavior
  }

  // Log the session status for debugging (optional)
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware session status:', session ? 'Authenticated' : 'Not Authenticated');
  }
  
  // Check if the current path is an auth path (login/register)
  // Never redirect auth paths to themselves to avoid loops
  const isAuthPath = authPaths.some(path => 
    pathWithoutLocale.startsWith(path) || pathWithoutLocale === path
  );
  
  if (isAuthPath) {
    return response;
  }
  
  // Check if this is a public page or an admin-related route
  const isPublicPage = publicPages.some(page => {
    // Handle exact matches
    if (page === pathWithoutLocale) return true;
    
    // Handle dynamic routes with parameters
    if (page.includes('[') && page.includes(']')) {
      const pagePattern = page.replace(/\[.*?\]/g, '[^/]+');
      const regex = new RegExp(`^${pagePattern}$`);
      return regex.test(pathWithoutLocale);
    }
    
    // Handle root path
    if (page === '/' && (pathWithoutLocale === '/' || pathWithoutLocale === '')) return true;
    
    return false;
  });
  
  // If it's a public page, allow access without authentication check
  if (isPublicPage) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Public page detected, allowing access:', pathname);
    }
    return response;
  }
  
  // Re-enable admin route protection check
  const isAdminRoute = pathWithoutLocale.startsWith('/admin');

  // Protect admin routes - require authentication
  if (isAdminRoute && !session) {
     // Redirect to login if not authenticated for admin routes
    const locale = req.nextUrl.pathname.split('/')[1] || defaultLocale;
    const redirectUrl = new URL(`/${locale}/auth/login`, req.url);
    redirectUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    if (process.env.NODE_ENV === 'development') {
      console.log('Redirecting unauthenticated user from admin route to login:', redirectUrl.toString());
    }
    return NextResponse.redirect(redirectUrl);
  }

  // --- Removed temporary bypass for admin routes ---

  // For other non-public, non-admin pages, check if the user is authenticated using the session we already fetched
  if (!isAdminRoute && !session) {
    // Redirect to login if not authenticated
    // Make sure we're redirecting to the localized login page
    const locale = req.nextUrl.pathname.split('/')[1] || defaultLocale;
    const redirectUrl = new URL(`/${locale}/auth/login`, req.url);
    
    // Only set callbackUrl if it's not an auth path itself
    if (!isAuthPath) {
      redirectUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Redirecting unauthenticated user to login:', redirectUrl.toString());
    }
    return NextResponse.redirect(redirectUrl);
  }
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};