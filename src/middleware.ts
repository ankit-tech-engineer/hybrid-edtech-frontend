import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value; // Note: In client-side zustand we use localStorage, but for middleware we need cookies if we want SSR protection
  const { pathname } = request.nextUrl;

  // For this demo, we'll focus on client-side protection in components,
  // but a basic middleware can handle initial redirects.
  
  // Define protected routes
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/verify-otp') || pathname.startsWith('/set-password');
  const isTutorRoute = pathname.startsWith('/tutor');
  const isAdminRoute = pathname.startsWith('/admin');
  const isStudentRoute = pathname.startsWith('/bookings');

  // If we had the user role in cookies, we could do more robust checks here.
  // For now, we'll let the client-side handle role-based redirection as the state is in Zustand/LocalStorage.
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/tutor/:path*', '/admin/:path*', '/bookings/:path*'],
};
