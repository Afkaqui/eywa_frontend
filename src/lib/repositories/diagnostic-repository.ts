import type { DiagnosticQuestion, DiagnosticResult } from '@/lib/types/database';

export interface DiagnosticResultRow {
  id: string;
  user_id: string;
  score: number;
  max_score: number;
  percentage: number;
  level: string;
  breakdown: DiagnosticResult['breakdown'];
  created_at: string;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', ...init });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err?.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export class DiagnosticRepository {
  async getQuestions(): Promise<DiagnosticQuestion[]> {
    const data = await apiFetch<{ questions?: DiagnosticQuestion[] } | DiagnosticQuestion[]>('/api/proxy/diagnostic/questions');
    if (Array.isArray(data)) return data;
    const obj = data as { questions?: DiagnosticQuestion[] };
    return Array.isArray(obj.questions) ? obj.questions : [];
  }

  // userId kept for API compatibility but the backend resolves from JWT
  async getLatestResult(_userId?: string): Promise<DiagnosticResultRow | null> {
    try {
      // El backend (GET /results/me) responde { result: row | null } y los
      // campos vienen en camelCase (Prisma). Normalizamos a snake_case y
      // toleramos también un array por compatibilidad.
      const data = await apiFetch<{ result: Record<string, unknown> | null } | Record<string, unknown>[]>(
        '/api/proxy/diagnostic/results'
      );
      const r = (Array.isArray(data) ? data[0] : data?.result) as Record<string, unknown> | undefined | null;
      if (!r) return null;
      const pick = <T,>(...keys: string[]): T => {
        for (const k of keys) if (r[k] !== undefined && r[k] !== null) return r[k] as T;
        return undefined as T;
      };
      return {
        id:         pick<string>('id'),
        user_id:    pick<string>('user_id', 'userId'),
        score:      pick<number>('score'),
        max_score:  pick<number>('max_score', 'maxScore'),
        percentage: pick<number>('percentage'),
        level:      pick<string>('level'),
        breakdown:  pick<DiagnosticResultRow['breakdown']>('breakdown') ?? [],
        created_at: pick<string>('created_at', 'createdAt'),
      };
    } catch {
      return null;
    }
  }

  async saveResult(result: Omit<DiagnosticResultRow, 'id' | 'created_at'>): Promise<void> {
    await apiFetch<void>('/api/proxy/diagnostic/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    });
  }
}
