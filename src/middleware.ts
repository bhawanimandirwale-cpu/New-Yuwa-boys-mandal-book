import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Whitelist static files, public assets, images, and PWA icons
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    /\.(png|jpg|jpeg|svg|ico|webp)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  const secret = process.env.NEXTAUTH_SECRET || 'mandalbook_secret_key_2026_super_secure_production_token';

  // 2. Whitelist public pages
  if (
    pathname === '/login' ||
    pathname.startsWith('/receipt') ||
    pathname.startsWith('/join')
  ) {
    const token = await getToken({ req, secret });
    // If authenticated user visits /login
    if (token && pathname === '/login') {
      const normalizedEmail = token?.email?.toLowerCase().trim();
      const isAdmin = normalizedEmail === 'bhawanimandirwale@gmail.com' || token?.role === 'ADMIN';
      const isActiveMember = token?.status === 'ACTIVE' && token?.role !== 'PENDING';
      if (isAdmin || isActiveMember) {
        return NextResponse.redirect(new URL('/', req.url));
      } else {
        return NextResponse.redirect(new URL('/join?pending=true', req.url));
      }
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
    secret,
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

  // 6. Strict Mandal Admission Gate:
  // Must be Adhyaksh (bhawanimandirwale@gmail.com / ADMIN) OR have Adhyaksh approval / valid Mandal Code
  const normalizedEmail = token?.email?.toLowerCase().trim();
  const isAdmin = normalizedEmail === 'bhawanimandirwale@gmail.com' || token?.role === 'ADMIN';
  const isActiveMember = token?.status === 'ACTIVE' && token?.role !== 'PENDING';

  if (!isAdmin && !isActiveMember) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'मंडळात प्रवेश नाकारला: मंडळात प्रवेश करण्यासाठी अधिकृत मंडळ कोड किंवा अध्यक्षांची मंजुरी आवश्यक आहे.' },
        { status: 403 }
      );
    }

    const joinUrl = new URL('/join', req.url);
    joinUrl.searchParams.set('pending', 'true');
    return NextResponse.redirect(joinUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.json, sw.js, and static images
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)',
  ],
};
