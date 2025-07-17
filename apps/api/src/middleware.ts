export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export function middleware(request: NextRequest) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Only protect /api routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Add CORS headers to all API responses
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Allow public endpoints without authentication
  const publicEndpoints = [
    '/api/auth/register', 
    '/api/auth/login', 
    '/api/auth/client-login',
    '/api/exercises',
    '/api/exercise-categories',
    '/api/prisma-test'
  ];
  if (publicEndpoints.includes(request.nextUrl.pathname)) {
    return response;
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { 
      status: 401,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }

  const token = authHeader.replace('Bearer ', '');
  console.log('Middleware: Received token:', token);
  console.log('Middleware: Token length:', token.length);
  console.log('Middleware: Token starts with:', token.substring(0, 20) + '...');
  console.log('Middleware: Token ends with:', '...' + token.substring(token.length - 20));
  console.log('Middleware: JWT_SECRET:', JWT_SECRET);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    // Set the user ID in headers so routes can access it
    response.headers.set('x-user-id', decoded.id);
    return response;
  } catch (err) {
    console.log('Middleware: Token verification failed:', err);
    return NextResponse.json({ error: 'Invalid token' }, { 
      status: 401,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}

export const config = {
  matcher: ['/api/:path*'],
}; 