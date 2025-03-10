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
  '/admin-check',
  '/direct-admin',
  '/admin',      // Temporarily making admin pages public to bypass the issue
  '/admin-fix',  // Admin fix page
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
  
  // Always refresh the session for all routes
  try {
    await supabase.auth.getSession();
  } catch (error) {
    console.error('Error refreshing session in middleware:', error);
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
  
  const isAdminRoute = pathWithoutLocale.includes('/admin') || pathWithoutLocale.includes('/direct-admin');
  
  // For now, we're allowing all admin routes to pass through without blocking
  // This is temporary until we resolve the admin access issues
  if (isAdminRoute) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Admin route detected, allowing access:', pathname);
    }
    return response;
  }
  
  // For non-public pages, check if the user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
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