// ════════════════════════════════════════
// Constantes de negocio: Roles & Planes
// ════════════════════════════════════════

import type { UserRole, UserPlan } from '@/lib/types/database';

export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  admin: 'Administrador',
  gestor: 'Gestor',
  user: 'Usuario',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  superadmin: 'bg-red-100 text-red-700',
  admin: 'bg-purple-100 text-purple-700',
  gestor: 'bg-blue-100 text-blue-700',
  user: 'bg-gray-100 text-gray-700',
};

export const PLAN_LABELS: Record<UserPlan, string> = {
  free: 'Free',
  premium: 'Premium',
};

export const PLAN_COLORS: Record<UserPlan, string> = {
  free: 'bg-gray-100 text-gray-700',
  premium: 'bg-amber-100 text-amber-700',
};

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  superadmin: 4,
  admin: 3,
  gestor: 2,
  user: 1,
};

export function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export const API_ROUTES = {
  ADMIN_USERS: '/api/proxy/users',
  ADMIN_USER_ROLE: (id: string) => `/api/proxy/users/${id}/role`,
  ADMIN_USER_PLAN: (id: string) => `/api/proxy/users/${id}/plan`,
  ADMIN_USER_PASSWORD: (id: string) => `/api/proxy/users/${id}/password`,
} as const;
