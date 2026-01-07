// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Cleanly decode JWT payload for Edge Runtime
 */
function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('authToken')?.value;

  // Route categories
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/admin/login' || pathname === '/admin/register';
  const isDashboardStudent = pathname.startsWith('/etudashboard');
  const isDashboardAdmin = pathname.startsWith('/admindashboard');
  const isDashboardTeacher = pathname.startsWith('/profdashboard') || pathname.startsWith('/editor');
  // Admin dashboard is no longer protected - removed from isProtected check
  const isProtected = isDashboardStudent || isDashboardTeacher;

  // 1. No token case
  if (!token) {
    if (isProtected) {
      const loginPath = isDashboardAdmin ? '/admin/login' : '/login';
      const loginUrl = new URL(loginPath, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. Token case: Validate and Route
  const payload = decodeJWT(token);
  const isExpired = payload?.exp ? Date.now() >= payload.exp * 1000 : true;

  if (!payload || isExpired) {
    if (isProtected) {
      const loginPath = isDashboardAdmin ? '/admin/login' : '/login';
      const response = NextResponse.redirect(new URL(loginPath, request.url));
      response.cookies.delete('authToken');
      return response;
    }
    return NextResponse.next();
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
  //   return NextResponse.redirect(new URL('/admin/login', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
