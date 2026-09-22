import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Whitelist static files, public assets, and PWA icons
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname === '/icon.svg' ||
    pathname === '/manifest.json'
  ) {
    return NextResponse.next();
  }

  // 2. Whitelist public pages
  if (
    pathname === '/login' ||
    pathname.startsWith('/receipt') ||
    pathname.startsWith('/join')
  ) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    // If authenticated user visits /login, redirect to /
    if (token && pathname === '/login') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // 3. Whitelist public API endpoints
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/donations/') ||
    pathname === '/api/mandal' ||
    pathname === '/api/mandal/join'
  ) {
    return NextResponse.next();
  }

  // 4. Check NextAuth JWT token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = Boolean(token);

  // 5. If not authenticated, redirect to /login with callbackUrl
  if (!isAuthenticated) {
    // For protected API endpoints, return 401 JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.svg, manifest.json
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.json).*)',
  ],
};
