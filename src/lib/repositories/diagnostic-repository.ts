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
      const results = await apiFetch<DiagnosticResultRow[]>('/api/proxy/diagnostic/results');
      if (!Array.isArray(results) || results.length === 0) return null;
      // Results are ordered desc by created_at on the backend
      return results[0];
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
