import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { dbConnect } from '@/lib/db';
import { User } from '@/models/User';
import { comparePassword } from '@/lib/auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Missing credentials');
          return null;
        }

        try {
          await dbConnect();
          console.log('[Auth] Looking for user:', credentials.email);
          
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase() 
          }).select('_id email passwordHash firstName lastName role userCode accountStatus');

          if (!user) {
            console.log('[Auth] User not found');
            return null;
          }

          console.log('[Auth] User found:', {
            id: user._id,
            email: user.email,
            role: user.role,
            status: user.accountStatus
          });

          // Check if account is active
          if (user.accountStatus === 'inactive') {
            console.log('[Auth] Account is inactive');
            return null;
          }

          const isPasswordValid = await comparePassword(
            credentials.password,
            user.passwordHash
          );

          if (!isPasswordValid) {
            console.log('[Auth] Invalid password');
            return null;
          }

          console.log('[Auth] Login successful');

          return {
            id: user._id.toString(),
            email: user.email,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
            role: user.role,
            userCode: user.userCode,
          };
        } catch (error) {
          console.error('[Auth] Error during authorization:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.userCode = (user as any).userCode;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        (session.user as any).userCode = token.userCode;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// ============================================
// FILE 3: src/middleware.ts (Fixed)
// ============================================
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('[Middleware] Processing:', pathname);

  // Public routes that don't need authentication
  const publicRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/password-reset',
    '/about-us',
    '/contact',
    '/track',
    '/',
    '/api/auth',
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
    console.log('[Middleware] Public route, allowing');
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // For protected routes, check authentication
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    console.log('[Middleware] Token:', token ? 'present' : 'missing');

    // If no token and trying to access protected route, redirect to login
    if (!token) {
      console.log('[Middleware] No token, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = token.role as string;
    console.log('[Middleware] User role:', userRole);

    // Role-based access control
    
    // Admin routes - only admins can access
    if (pathname.startsWith('/admin')) {
      if (userRole !== 'admin') {
        console.log('[Middleware] Not admin, redirecting');
        const dashboardUrl = userRole === 'warehouse' 
          ? new URL('/warehouse', request.url)
          : new URL('/customer/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
      }
      return NextResponse.next();
    }

    // Warehouse routes - only warehouse staff can access
    if (pathname.startsWith('/warehouse')) {
      if (userRole !== 'warehouse') {
        console.log('[Middleware] Not warehouse, redirecting');
        const dashboardUrl = userRole === 'admin'
          ? new URL('/admin', request.url)
          : new URL('/customer/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
      }
      return NextResponse.next();
    }

    // Customer routes - only customers can access
    if (pathname.startsWith('/customer') || pathname.startsWith('/dashboard')) {
      if (userRole !== 'customer') {
        console.log('[Middleware] Not customer, redirecting');
        const dashboardUrl = userRole === 'admin'
          ? new URL('/admin', request.url)
          : new URL('/warehouse', request.url);
        return NextResponse.redirect(dashboardUrl);
      }
      return NextResponse.next();
    }

    // Default: allow access if authenticated
    return NextResponse.next();
    
  } catch (error) {
    console.error('[Middleware] Error:', error);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|fonts).*)',
  ],
};
