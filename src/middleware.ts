import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('__session');
  const rootSession = request.cookies.get('__root_session');
  const { pathname } = request.nextUrl;

  // Handle the backdoor login path
  if (pathname === '/loginrootadmin') {
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.cookies.set('__root_session', 'true', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: 'lax',
    });
    // Clear any normal session just in case
    if (session) {
      response.cookies.delete('__session');
    }
    return response;
  }

  const isAuthenticated = session || rootSession;

  const publicPaths = ['/login', '/', '/blog', '/proyectos', '/api/auth/session'];

  const isPublicPath = publicPaths.some(path =>
    pathname === path || (path !== '/' && pathname.startsWith(path + '/'))
  );

  // If trying to access a protected route without a session, redirect to login
  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there is a session and the user is trying to access the login page, redirect to dashboard
  if (isAuthenticated && pathname === '/login') {
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
