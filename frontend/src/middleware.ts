import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/booking', '/owner', '/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth token in cookies (Firebase sets this)
  // NOTE: Ensure your client-side login code sets this cookie via document.cookie
  // or an API route. Without this cookie, Middleware cannot verify auth state.
  const session = request.cookies.get('auth-token');
  const authToken = session?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/booking/:path*', '/owner/:path*', '/admin/:path*'],
};
