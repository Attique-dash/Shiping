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

// Force dynamic rendering to prevent static generation
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
