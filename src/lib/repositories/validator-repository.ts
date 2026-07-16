// Repository del Validador de Proyectos IA — habla con /api/proxy/validator/*

export interface ValidationReport {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  esgScores: {
    environmental: number;
    social: number;
    governance: number;
  };
  riskLevel: 'low' | 'medium' | 'high';
  viability: number;
  generatedBy?: 'ai' | 'heuristic';
}

export type ValidationStatus = 'pending' | 'analyzing' | 'analyzed' | 'failed';

// Documento REAL subido al plan (fila de plan_documents; el archivo vive en el VPS)
export interface ProjectDocument {
  id?: string;
  name: string;
  size: number;
  type: string;
  created_at?: string;
}

export interface ProjectPlanRow {
  id: string;
  name: string;
  type: string;
  description: string;
  budget: number;
  duration: number;
  carbonGoal: number;
  objectives: string | null;
  stakeholders: string | null;
  documents: ProjectDocument[];
  status: ValidationStatus;
  report: ValidationReport | null;
  analyzedAt: string | null;
  createdAt: string;
}

export interface CreatePlanPayload {
  name: string;
  type: string;
  description: string;
  budget: number;
  duration: number;
  carbonGoal: number;
  objectives?: string | null;
  stakeholders?: string | null;
  documents?: ProjectDocument[];
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', ...init });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err?.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export class ValidatorRepository {
  async listPlans(): Promise<ProjectPlanRow[]> {
    const data = await apiFetch<{ plans?: ProjectPlanRow[] }>('/api/proxy/validator/plans');
    return Array.isArray(data.plans) ? data.plans : [];
  }

  async getPlan(id: string): Promise<ProjectPlanRow | null> {
    const data = await apiFetch<{ plan?: ProjectPlanRow }>(`/api/proxy/validator/plans/${id}`);
    return data.plan ?? null;
  }

  async createPlan(payload: CreatePlanPayload): Promise<ProjectPlanRow> {
    const data = await apiFetch<{ plan: ProjectPlanRow }>('/api/proxy/validator/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return data.plan;
  }

  async analyzePlan(id: string): Promise<ProjectPlanRow> {
    const data = await apiFetch<{ plan: ProjectPlanRow }>(`/api/proxy/validator/plans/${id}/analyze`, {
      method: 'POST',
    });
    return data.plan;
  }

  async deletePlan(id: string): Promise<void> {
    await apiFetch<void>(`/api/proxy/validator/plans/${id}`, { method: 'DELETE' });
  }

  // ── Documentos reales ───────────────────────────────────────────────────────
  async uploadDocument(planId: string, file: File): Promise<ProjectDocument> {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`/api/proxy/validator/plans/${planId}/documents`, {
      method: 'POST',
      body: form,
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error ?? 'No se pudo subir el documento');
    return data.document as ProjectDocument;
  }

  async deleteDocument(planId: string, docId: string): Promise<void> {
    await apiFetch<void>(`/api/proxy/validator/plans/${planId}/documents/${docId}`, { method: 'DELETE' });
  }

  documentDownloadUrl(planId: string, docId: string): string {
    return `/api/proxy/validator/plans/${planId}/documents/${docId}/download`;
  }
}
