export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export function middleware(request: NextRequest) {
  console.log('Middleware: Processing request:', request.method, request.nextUrl.pathname);
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    console.log('Middleware: Handling OPTIONS request for:', request.nextUrl.pathname);
    const response = new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://trainer-tracker-web.onrender.com',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
    console.log('Middleware: OPTIONS response headers:', Object.fromEntries(response.headers.entries()));
    return response;
  }

  // Only protect /api routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Add CORS headers to all API responses
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', 'https://trainer-tracker-web.onrender.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Allow public endpoints without authentication
  const publicEndpoints = [
    '/api/auth/register', 
    '/api/auth/login', 
    '/api/auth/client-login',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/exercises',
    '/api/exercise-categories',
    '/api/prisma-test',
    '/api/test-db',
    '/api/simple-test'
  ];
  if (publicEndpoints.includes(request.nextUrl.pathname)) {
    return response;
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { 
      status: 401,
      headers: {
        'Access-Control-Allow-Origin': 'https://trainer-tracker-web.onrender.com',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id?: string; clientId?: string };
    
    // Handle both trainer (id) and client (clientId) tokens
    const userId = decoded.id || decoded.clientId;
    if (!userId) {
      throw new Error('No user ID found in token');
    }
    
    // Set the user ID in headers so routes can access it
    response.headers.set('x-user-id', userId);
    
    // Also set a header to distinguish between trainer and client
    if (decoded.clientId) {
      response.headers.set('x-user-type', 'client');
    } else {
      response.headers.set('x-user-type', 'trainer');
    }
    
    return response;
  } catch (err) {
    console.log('Middleware: Token verification failed for endpoint:', request.nextUrl.pathname);
    console.log('Middleware: Token verification failed:', err);
    return NextResponse.json({ error: 'Invalid token' }, { 
      status: 401,
      headers: {
        'Access-Control-Allow-Origin': 'https://trainer-tracker-web.onrender.com',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 