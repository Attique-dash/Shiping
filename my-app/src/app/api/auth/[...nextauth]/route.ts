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
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password');
        }

        try {
          await dbConnect();

          // Check for admin credentials first
          const adminEmail = process.env.ADMIN_EMAIL;
          const adminPassword = process.env.ADMIN_PASSWORD;

          if (adminEmail && adminPassword && 
              credentials.email === adminEmail && 
              credentials.password === adminPassword) {
            
            return {
              id: 'admin',
              email: adminEmail,
              name: 'Admin',
              role: 'admin'
            };
          }

          // Check regular user from MongoDB
          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            throw new Error('Invalid email or password');
          }

          // Verify password
          const isPasswordValid = await comparePassword(
            credentials.password, 
            user.passwordHash || user.password
          );

          if (!isPasswordValid) {
            throw new Error('Invalid email or password');
          }

          // Update last login
          user.lastLogin = new Date();
          await user.save().catch(err => console.warn('Failed to update last login:', err));

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : user.email,
            role: user.role || 'customer',
            isVerified: user.emailVerified || false
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