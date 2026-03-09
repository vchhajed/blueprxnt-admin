import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { adminAuth } from '@/lib/firebase-admin';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password?.trim();

        if (!email || !password) return null;

        try {
          // Verify credentials against Firebase Auth
          // Firebase Admin SDK doesn't have a direct password verify method,
          // so we use the Firebase Auth REST API
          const apiKey = process.env.FIREBASE_API_KEY;
          const res = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                password,
                returnSecureToken: true,
              }),
            }
          );

          const data = await res.json();

          if (!res.ok) {
            console.log('Firebase auth failed:', data.error?.message);
            return null;
          }

          // Get user details from Firebase Admin
          const firebaseUser = await adminAuth.getUserByEmail(email);

          // Check if user has admin custom claim
          const customClaims = firebaseUser.customClaims || {};
          if (!customClaims.admin) {
            console.log('User is not an admin:', email);
            return null;
          }

          return {
            id: firebaseUser.uid,
            email: firebaseUser.email || email,
            name: firebaseUser.displayName || 'Admin',
            role: 'admin',
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
