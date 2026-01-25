import { NextRequest, NextResponse } from 'next/server';

// Parse allowed origins from env variable
const getAllowedOrigins = (): string[] => {
  const originsEnv = process.env.ALLOWED_ORIGINS;
  if (!originsEnv) {
    console.warn('ALLOWED_ORIGINS environment variable not set');
    return [];
  }

  try {
    // Try parsing as JSON first (double quotes)
    return JSON.parse(originsEnv);
  } catch {
    // If JSON parsing fails, try to parse the array format with single quotes
    // Extract values between quotes: ['url1', 'url2', ...]
    const matches = originsEnv.match(/'([^']+)'/g);
    if (matches) {
      return matches.map(match => match.slice(1, -1)); // Remove quotes
    }
    console.error('Failed to parse ALLOWED_ORIGINS:', originsEnv);
    return [];
  }
};

const ALLOWED_ORIGINS = getAllowedOrigins();

export function proxy(request: NextRequest) {
  // Only apply CORS to API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const origin = request.headers.get('origin');
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin);

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    if (!isAllowedOrigin) {
      return new NextResponse(null, { status: 403 });
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin!,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // For non-preflight requests
  if (!isAllowedOrigin && origin) {
    return new NextResponse(
      JSON.stringify({ error: 'Origin not allowed' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const response = NextResponse.next();

  // Add CORS headers to response if origin is allowed
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin!);
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
  }

  return response;
}

// Configure proxy to run only on API routes
export const config = {
  matcher: '/api/:path*',
};
