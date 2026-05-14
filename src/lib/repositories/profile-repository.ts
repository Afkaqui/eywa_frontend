import type { Profile } from '@/lib/types/database';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', ...init });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err?.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export class ProfileRepository {
  async getById(userId: string): Promise<Profile | null> {
    try {
      return await apiFetch<Profile>(`/api/proxy/users/${userId}`);
    } catch {
      return null;
    }
  }

  async getAll(): Promise<Profile[]> {
    return apiFetch<Profile[]>('/api/proxy/users');
  }

  async updateRole(userId: string, role: string): Promise<void> {
    await apiFetch<void>(`/api/proxy/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
  }

  async updatePlan(userId: string, plan: string): Promise<void> {
    await apiFetch<void>(`/api/proxy/users/${userId}/plan`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
  }
}
