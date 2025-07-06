import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('__session');
  const { pathname } = request.nextUrl;

  const publicPaths = ['/login', '/', '/blog', '/proyectos', '/api/auth/session'];
  
  const isPublicPath = publicPaths.some(path => 
    pathname === path || (path !== '/' && pathname.startsWith(path + '/'))
  );

  // If trying to access a protected route without a session, redirect to login
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there is a session and the user is trying to access the login page, redirect to dashboard
  if (session && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
