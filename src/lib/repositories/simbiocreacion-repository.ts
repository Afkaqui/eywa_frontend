import type { Simbiocreacion } from '@/lib/types/database';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', ...init });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err?.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export class SimbiocreacionRepository {
  async getAll(): Promise<Simbiocreacion[]> {
    const data = await apiFetch<{ simbiocreaciones?: Simbiocreacion[] }>('/api/proxy/simbiocreacion');
    return Array.isArray(data.simbiocreaciones) ? data.simbiocreaciones : [];
  }

  async create(payload: Omit<Simbiocreacion, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Simbiocreacion> {
    const data = await apiFetch<{ simbiocreacion: Simbiocreacion }>('/api/proxy/simbiocreacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return data.simbiocreacion;
  }

  async update(id: string, payload: Partial<Omit<Simbiocreacion, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    await apiFetch<void>(`/api/proxy/simbiocreacion/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  async delete(id: string): Promise<void> {
    await apiFetch<void>(`/api/proxy/simbiocreacion/${id}`, {
      method: 'DELETE',
    });
  }
}
