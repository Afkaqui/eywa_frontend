import type { EsgScore, EsgHistory, EsgScores } from '@/lib/types/database';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', ...init });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err?.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export class EsgRepository {
  async get(): Promise<{ esgScore: EsgScore | null; history: EsgHistory[] }> {
    const data = await apiFetch<{ esgScore: EsgScore | null; history: EsgHistory[] }>('/api/proxy/esg');
    return { esgScore: data.esgScore ?? null, history: data.history ?? [] };
  }

  async save(scores: EsgScores): Promise<EsgScore> {
    const data = await apiFetch<{ esgScore: EsgScore }>('/api/proxy/esg', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scores }),
    });
    return data.esgScore;
  }
}
