import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { comparePassword } from '@/lib/auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password');
        }

        try {
          // Check for admin credentials first
          const adminEmail = process.env.ADMIN_EMAIL;
          const adminPassword = process.env.ADMIN_PASSWORD;

          if (adminEmail && adminPassword && 
              credentials.email === adminEmail && 
              credentials.password === adminPassword) {
            
            // Try to find admin in database
            const admin = await prisma.admin.findUnique({ 
              where: { email: adminEmail } 
            });

            return {
              id: admin?.id || 'admin',
              email: adminEmail,
              name: admin?.name || 'Admin',
              role: 'admin'
            };
          }

          // Check regular user
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user) {
            throw new Error('Invalid email or password');
          }

          // Verify password
          const isPasswordValid = await comparePassword(
            credentials.password, 
            user.password
          );

          if (!isPasswordValid) {
            throw new Error('Invalid email or password');
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { updatedAt: new Date() }
          }).catch(err => console.warn('Failed to update last login:', err));

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: 'customer',
            isVerified: user.isVerified
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error('Invalid email or password');
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
      }
      
      // Update token on session update
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isVerified = token.isVerified as boolean;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
