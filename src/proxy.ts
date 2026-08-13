import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/forgot-password', '/admin/reset-password'];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublicPath = PUBLIC_ADMIN_PATHS.includes(pathname);

  if (!isPublicPath && !req.auth) {
    return NextResponse.redirect(new URL('/admin/login', req.nextUrl.origin));
  }
});

export const config = {
  matcher: ['/admin/:path*'],
};
