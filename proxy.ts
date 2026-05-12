import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CONFIG } from './lib/config';

export function proxy(request: NextRequest) {
  const isMaintenanceMode = CONFIG.IS_MAINTENANCE_MODE;
  const { pathname } = request.nextUrl;

  // If maintenance mode is ON and the user is NOT already on the maintenance page
  // and NOT requesting static assets or API routes (optional)
  if (
    isMaintenanceMode &&
    !pathname.startsWith('/maintenance') &&
    !pathname.startsWith('/_next') && // static assets
    !pathname.startsWith('/api') &&   // api routes
    !pathname.includes('.')           // files (favicon, etc)
  ) {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  // If maintenance mode is OFF and the user tries to access /maintenance
  if (!isMaintenanceMode && pathname.startsWith('/maintenance')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
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
