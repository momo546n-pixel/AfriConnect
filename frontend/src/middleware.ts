// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = publicRoutes.some(r => pathname.startsWith(r));

  // Lire le store Zustand depuis localStorage n'est pas possible côté serveur
  // On utilise un cookie qu'on va setter après le login
  const token = request.cookies.get('accessToken')?.value;

  if (!isPublic && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (isPublic && token) {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};