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
    pathname.startsWith('/join') ||
    pathname.startsWith('/onboarding')
  ) {
    const token = await getToken({ req, secret });
    const normalizedEmail = token?.email?.toLowerCase().trim();
    const rawPhone = token?.phone ? (token.phone as string).replace(/\D/g, '').slice(-10) : '';
    const isAdmin =
      normalizedEmail === 'bhawanimandirwale@gmail.com' ||
      rawPhone === '7499085045' ||
      rawPhone === '9923092340' ||
      token?.role === 'SUPER_ADMIN' ||
      token?.role === 'ADMIN';

    // If authenticated user visits /login
    if (token && pathname === '/login') {
      const hasBothCredentials = Boolean(rawPhone && normalizedEmail);
      const isActiveMember = token?.status === 'ACTIVE' && token?.role !== 'PENDING';

      if (isAdmin) {
        return NextResponse.redirect(new URL('/', req.url));
      } else if (!hasBothCredentials) {
        return NextResponse.redirect(new URL('/onboarding', req.url));
      } else if (isActiveMember) {
        return NextResponse.redirect(new URL('/', req.url));
      } else {
        return NextResponse.redirect(new URL('/join?pending=true', req.url));
      }
    }

    // If Adhyaksh or fully verified active user visits /onboarding, redirect to /
    if (token && pathname === '/onboarding') {
      const hasBothCredentials = Boolean(rawPhone && normalizedEmail);
      if (isAdmin) {
        return NextResponse.redirect(new URL('/', req.url));
      }
      if (hasBothCredentials) {
        const isActiveMember = token?.status === 'ACTIVE' && token?.role !== 'PENDING';
        if (isActiveMember) {
          return NextResponse.redirect(new URL('/', req.url));
        } else {
          return NextResponse.redirect(new URL('/join?pending=true', req.url));
        }
      }
    }

    return NextResponse.next();
  }

  // 3. Whitelist public API endpoints
  if (
    pathname.startsWith('/api/auth') ||
    (pathname.startsWith('/api/donations/') && req.method === 'GET') ||
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
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 6. Adhyaksh Check:
  const normalizedEmail = token?.email?.toLowerCase().trim();
  const rawPhone = token?.phone ? (token.phone as string).replace(/\D/g, '').slice(-10) : '';
  const isAdmin =
    normalizedEmail === 'bhawanimandirwale@gmail.com' ||
    rawPhone === '7499085045' ||
    rawPhone === '9923092340' ||
    token?.role === 'SUPER_ADMIN' ||
    token?.role === 'ADMIN';

  if (isAdmin) {
    return NextResponse.next();
  }

  // 7. Mandatory 1:1 Credentials Check (Must have BOTH verified Phone and Email):
  const hasBothCredentials = Boolean(rawPhone && normalizedEmail);
  if (!hasBothCredentials) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'खाते अपूर्ण आहे: कृपया मोबाईल नंबर व ईमेल दोन्ही सत्यापित करा.' },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  // 8. Strict Mandal Admission Gate:
  const isActiveMember = token?.status === 'ACTIVE' && token?.role !== 'PENDING';
  if (!isActiveMember) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'मंडळात प्रवेश नाकारला: अधिकृत मंडळ कोड किंवा अध्यक्षांची मंजुरी आवश्यक आहे.' },
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
