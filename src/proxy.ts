// src/proxy.ts
import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

// 1. Initialize the i18n logic
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localeDetection: true
});

/**
 * Cleanly decode JWT payload for Edge Runtime
 */
function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function proxy(request: NextRequest) {
  // 2. Run i18n first to ensure getLocale() works in Layouts
  const response = intlMiddleware(request);

  const { pathname } = request.nextUrl;
  
  if (pathname === '/' || locales.some(loc => pathname === `/${loc}`)) {
    return response;
  }
  
  const token = request.cookies.get('authToken')?.value;

  // --- Your existing Auth Logic starts here ---
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/admindashboard/login' || pathname === '/admindashboard/register';
  const isDashboardStudent = pathname.startsWith('/etudashboard');
  const isDashboardAdmin = pathname.startsWith('/admindashboard');
  const isDashboardTeacher = pathname.startsWith('/profdashboard') || pathname.startsWith('/editor');
  const isProtected = isDashboardStudent || isDashboardTeacher;

  if (!token) {
    if (isProtected) {
      const loginPath = isDashboardAdmin ? '/admindashboard/login' : '/login';
      return NextResponse.redirect(new URL(loginPath, request.url));
    }
    return response; // Return intl response instead of NextResponse.next()
  }

  const payload = decodeJWT(token);
  const isExpired = payload?.exp ? Date.now() >= payload.exp * 1000 : true;

  if (!payload || isExpired) {
    if (isProtected) {
      const loginPath = isDashboardAdmin ? '/admindashboard/login' : '/login';
      const redirectRes = NextResponse.redirect(new URL(loginPath, request.url));
      redirectRes.cookies.delete('authToken');
      return redirectRes;
    }
    return response;
  }

  // Role identification
  const role = String(payload.role || '').toUpperCase();
  const isAdmin = role.includes('ADMIN');
  const isTeacher = role.includes('TEACHER') || role.includes('PROFESSOR');
  const isStudent = role.includes('STUDENT');

  let dashboard = '/etudashboard';
  if (isAdmin) dashboard = '/admindashboard';
  else if (isTeacher) dashboard = '/profdashboard';

  // Redirected authenticated users away from Login/Register
  if (isAuthPage) {
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  // Role-based protection
  if (isDashboardStudent && !isStudent) {
    return NextResponse.redirect(new URL('/profdashboard', request.url));
  }

  if (isDashboardTeacher && !isTeacher && !isAdmin) {
    return NextResponse.redirect(new URL('/etudashboard', request.url));
  }

  // Admin dashboard protection removed - anyone can access
  // if (isDashboardAdmin && !isAdmin) {
  //   return NextResponse.redirect(new URL('/admindashboard/login', request.url));
  // }

  return response;
}

export const config = {
  matcher: [
    '/', 
    '/(fr|en)/:path*',
    '/etudashboard/:path*',
    '/admindashboard/:path*',
    '/profdashboard/:path*',
    '/editor/:path*',
    '/login',
    '/register',
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ],
};
