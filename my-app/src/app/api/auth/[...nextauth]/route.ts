import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Replace this with your actual authentication logic
        // This is just a placeholder example
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Example: Check against your database
        // const user = await prisma.user.findUnique({
        //   where: { email: credentials.email }
        // });

        // For demo purposes only - REMOVE IN PRODUCTION
        if (
          credentials.email === "demo@example.com" &&
          credentials.password === "password123"
        ) {
          return {
            id: "1",
            email: credentials.email,
            name: "Demo User",
          };
        }

        // If authentication fails
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };