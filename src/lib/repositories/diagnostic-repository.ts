import type { DiagnosticQuestion, DiagnosticOption, DiagnosticResult } from '@/lib/types/database';

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

// El backend (Prisma) devuelve camelCase y llama `options` a la relación; el frontend
// usa snake_case y el nombre heredado `diagnostic_options`. Normalizamos AQUÍ, una sola
// vez, para que ningún componente tenga que adivinar la forma (era la causa del crash
// en Gestión de Datos → Preguntas Diagnóstico: `q.diagnostic_options` venía undefined).
type RawOption = Record<string, unknown>;
type RawQuestion = Record<string, unknown>;

function pick<T>(o: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const k of keys) if (o[k] !== undefined && o[k] !== null) return o[k] as T;
  return undefined;
}

function normalizeOption(o: RawOption): DiagnosticOption {
  return {
    id:          String(o.id ?? ''),
    question_id: String(pick<string>(o, 'question_id', 'questionId') ?? ''),
    label:       String(o.label ?? ''),
    value:       String(o.value ?? ''),
    score:       Number(o.score ?? 0),
    sort_order:  Number(pick<number>(o, 'sort_order', 'sortOrder') ?? 0),
  };
}

function normalizeQuestion(q: RawQuestion): DiagnosticQuestion {
  const rawOpts = (pick<RawOption[]>(q, 'diagnostic_options', 'options') ?? []) as RawOption[];
  return {
    id:                  String(q.id ?? ''),
    sort_order:          Number(pick<number>(q, 'sort_order', 'sortOrder') ?? 0),
    category:            String(pick<string>(q, 'category') ?? 'general'),
    weight:              Number(pick<number>(q, 'weight') ?? 0),
    title:               String(q.title ?? ''),
    description:         String(q.description ?? ''),
    context_title:       pick<string>(q, 'context_title', 'contextTitle') ?? null,
    context_description: pick<string>(q, 'context_description', 'contextDescription') ?? null,
    context_impact:      pick<string>(q, 'context_impact', 'contextImpact') ?? null,
    context_image:       pick<string>(q, 'context_image', 'contextImage') ?? null,
    diagnostic_options:  (Array.isArray(rawOpts) ? rawOpts : [])
      .map(normalizeOption)
      .sort((a, b) => a.sort_order - b.sort_order),
  };
}

export class DiagnosticRepository {
  async getQuestions(): Promise<DiagnosticQuestion[]> {
    const data = await apiFetch<unknown>('/api/proxy/diagnostic/questions');
    const raw = Array.isArray(data)
      ? data
      : ((data as { questions?: unknown }).questions ?? []);
    const list = Array.isArray(raw) ? (raw as RawQuestion[]) : [];
    return list.map(normalizeQuestion).sort((a, b) => a.sort_order - b.sort_order);
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
