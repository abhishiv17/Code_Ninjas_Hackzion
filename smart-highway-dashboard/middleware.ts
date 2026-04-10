import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get pathname from the request
  const pathname = request.nextUrl.pathname;

  // Public pages that don't require authentication
  const publicPages = ['/login', '/api'];
  const isPublicPage = publicPages.some((page) => pathname.startsWith(page));

  if (isPublicPage) {
    return NextResponse.next();
  }

  // Check if user is authenticated (this is client-side check, for server-side use cookies/sessions)
  // For now, we'll rely on client-side authentication
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
