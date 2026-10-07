import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  if ((path.startsWith('/dashboard') || path.startsWith('/officer')) && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if ((path.startsWith('/auth/login') || path.startsWith('/auth/register')) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/officer/:path*', '/auth/:path*'],
};
