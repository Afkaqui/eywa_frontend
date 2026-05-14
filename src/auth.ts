import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import type { UserRole, UserPlan } from '@/lib/types/database';

const API_URL = process.env.BACKEND_URL ?? 'http://localhost:4001';

// ── Extensiones de tipos de Auth.js ───────────────────────────────────────────
declare module 'next-auth' {
  interface User {
    role?:         UserRole;
    plan?:         UserPlan;
    company?:      string | null;
    backendToken?: string; // JWT firmado por el backend
  }
  interface Session {
    user: {
      id:       string;
      email:    string;
      name?:    string | null;
      role:     UserRole;
      plan:     UserPlan;
      company?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?:         UserRole;
    plan?:         UserPlan;
    company?:      string | null;
    backendToken?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt' },

  providers: [
    // ── Email + Password ───────────────────────────────────────────────────────
    Credentials({
      credentials: {
        email:    { label: 'Email',      type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Llama /api/auth/login que retorna { token, user }
          const res = await fetch(`${API_URL}/api/auth/login`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
              email:    credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) return null;

          const { token, user } = await res.json();

          return {
            id:           user.id,
            email:        user.email,
            name:         user.name  ?? null,
            role:         user.role,
            plan:         user.plan,
            company:      user.company ?? null,
            backendToken: token, // ← guardamos el JWT del backend
          };
        } catch {
          return null;
        }
      },
    }),

    // ── Google OAuth ───────────────────────────────────────────────────────────
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    // jwt: enriquece el token de Auth.js con los datos del backend
    async jwt({ token, user, account }) {
      // Login inicial con Credentials → user tiene backendToken
      if (user) {
        token.sub          = user.id;
        token.role         = user.role    ?? 'user';
        token.plan         = user.plan    ?? 'free';
        token.company      = user.company ?? null;
        token.backendToken = user.backendToken;
      }

      // Login con Google → sincronizar con el backend y obtener token
      if (account?.provider === 'google' && user?.email) {
        try {
          const res = await fetch(`${API_URL}/api/auth/oauth-sync`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
              email:    user.email,
              name:     user.name,
              provider: 'google',
            }),
          });
          if (res.ok) {
            const { token: bt, user: synced } = await res.json();
            token.sub          = synced.id;
            token.role         = synced.role;
            token.plan         = synced.plan;
            token.company      = synced.company;
            token.backendToken = bt;
          }
        } catch { /* usa defaults */ }
      }

      return token;
    },

    // session: expone los datos al cliente via useSession()
    session({ session, token }) {
      if (token.sub) {
        session.user.id      = token.sub;
        session.user.role    = token.role    ?? 'user';
        session.user.plan    = token.plan    ?? 'free';
        session.user.company = token.company ?? null;
      }
      return session;
    },
  },

  pages: {
    signIn: '/',
    error:  '/',
  },
});
