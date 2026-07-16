import type { Organization } from '@/lib/types/database';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', ...init });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err?.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export class OrganizationRepository {
  async get(): Promise<Organization | null> {
    const data = await apiFetch<{ organization: Organization | null }>('/api/proxy/organization');
    return data.organization ?? null;
  }

  async save(payload: Omit<Organization, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'imageUrl'> & { externalLinks?: string[] }): Promise<Organization> {
    const data = await apiFetch<{ organization: Organization }>('/api/proxy/organization', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return data.organization;
  }
}
