import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === '/admin/login';

  if (!isLoginPage && !req.auth) {
    return NextResponse.redirect(new URL('/admin/login', req.nextUrl.origin));
  }
});

export const config = {
  matcher: ['/admin/:path*'],
};
