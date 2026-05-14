import type { PortfolioCompany } from '@/lib/types/database';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', ...init });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err?.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export class PortfolioRepository {
  async getAll(): Promise<PortfolioCompany[]> {
    return apiFetch<PortfolioCompany[]>('/api/proxy/portfolio');
  }

  async create(company: Omit<PortfolioCompany, 'id' | 'created_at' | 'updated_at'>): Promise<PortfolioCompany> {
    return apiFetch<PortfolioCompany>('/api/proxy/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(company),
    });
  }

  async update(id: string, updates: Partial<PortfolioCompany>): Promise<void> {
    await apiFetch<void>(`/api/proxy/portfolio/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  }

  async delete(id: string): Promise<void> {
    await apiFetch<void>(`/api/proxy/portfolio/${id}`, {
      method: 'DELETE',
    });
  }
}
