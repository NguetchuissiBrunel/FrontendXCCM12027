// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/', '/login', '/register']

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Log obligatoire pour voir si le middleware s'exécute
  console.log('Middleware →', pathname)

  const isPublic = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  const token = request.cookies.get('access_token')?.value

  if (!isPublic && !token) {
    console.log('BLOCKED → redirect to /login')
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// LE MATCHER QUI NE PEUT PAS RATER (officiel Next.js 14/15)
export const config = {
  matcher: '/:path*'   // ← C’EST CETTE LIGNE QUI CHANGE TOUT
}