// src/middleware.ts
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't need authentication
  const publicRoutes = [
    '/login', 
    '/register', 
    '/forgot-password',
    '/password-reset',
    '/about-us',
    '/contact',
    '/track',
    '/'
  ];
  
  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Allow all API routes to handle their own auth
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // For protected routes, check authentication
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    // If no token and trying to access protected route, redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based access control
    const userRole = token.role as string;

    // Admin routes - only admins can access
    if (pathname.startsWith('/admin')) {
      if (userRole !== 'admin') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    // Warehouse routes - only warehouse staff can access
    if (pathname.startsWith('/warehouse')) {
      if (userRole !== 'warehouse') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    // Customer routes - only customers can access
    if (pathname.startsWith('/customer') || pathname.startsWith('/dashboard')) {
      if (userRole !== 'customer') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth (NextAuth API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|fonts|api/auth).*)',
  ],
};