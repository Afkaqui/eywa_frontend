"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import {
  useSession,
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from 'next-auth/react';
import type { Profile, UserRole, UserPlan } from '@/lib/types/database';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  image?: string | null;
  role: UserRole;
  plan: UserPlan;
  company: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    metadata: { full_name: string; company: string }
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// ── Contexto ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();

  const loading = status === 'loading';

  // Construye AuthUser desde la sesión de Auth.js
  const user = useMemo<AuthUser | null>(() => {
    if (!session?.user) return null;
    const s = session.user;
    return {
      id:      s.id,
      email:   s.email ?? '',
      name:    s.name  ?? null,
      image:   s.image ?? null,
      role:    s.role  ?? 'user',
      plan:    s.plan  ?? 'free',
      company: s.company ?? null,
    };
  }, [session]);

  // Construye Profile desde la sesión (evita un fetch extra)
  const profile = useMemo<Profile | null>(() => {
    if (!user) return null;
    return {
      id:         user.id,
      email:      user.email,
      full_name:  user.name,
      company:    user.company,
      role:       user.role,
      plan:       user.plan,
      created_at: '',
      updated_at: '',
    };
  }, [user]);

  // ── signIn con Credentials ─────────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) return { error: 'Credenciales incorrectas' };
      return { error: null };
    } catch {
      return { error: 'Error al iniciar sesión' };
    }
  }, []);

  // ── signUp: llama al backend via proxy y luego inicia sesión ──────────────
  const signUp = useCallback(async (
    email: string,
    password: string,
    metadata: { full_name: string; company: string }
  ) => {
    try {
      const res = await fetch('/api/proxy/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          full_name: metadata.full_name,
          company:   metadata.company,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { error: data?.error ?? 'Error al registrarse' };
      }

      // Registro exitoso → iniciar sesión automáticamente
      const loginResult = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (loginResult?.error) return { error: 'Registro exitoso, pero no se pudo iniciar sesión' };
      return { error: null };
    } catch {
      return { error: 'Error de red al registrarse' };
    }
  }, []);

  // ── signOut ───────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await nextAuthSignOut({ redirect: false });
  }, []);

  // ── refreshProfile: fuerza actualización de la sesión ─────────────────────
  const refreshProfile = useCallback(async () => {
    await update();
  }, [update]);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
