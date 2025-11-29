import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  
  // Only process job detail pages
  if (pathname.startsWith('/jobs/') && pathname !== '/jobs' && pathname !== '/jobs/') {
    const url = request.nextUrl.clone();
    
    // List of tracking parameters to remove
    const trackingParams = [
      'fbclid',
      'gclid',
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'mc_cid',
      'mc_eid',
      '_ga',
      'msclkid',
      'twclid',
      'li_fat_id',
      'igshid'
    ];
    
    // Check if any tracking parameters exist
    let hasTrackingParams = false;
    trackingParams.forEach(param => {
      if (url.searchParams.has(param)) {
        url.searchParams.delete(param);
        hasTrackingParams = true;
      }
    });
    
    // If tracking params were found, redirect to clean URL
    if (hasTrackingParams) {
      return NextResponse.redirect(url, { status: 301 });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/jobs/:path*',
  ],
};
