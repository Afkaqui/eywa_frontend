// KPIs reales — /api/proxy/stats

export interface UserStats {
  esg: {
    index5: number;
    level: string;
    delta: number | null; // variación vs. la evaluación anterior
    weakest: { key: string; label: string; avg: number } | null;
    zero_criteria: number;
  } | null;
  dataroom: { completed: number; total: number; percentage: number } | null;
  academy: {
    enrolled: number; completed: number; hours: number;
    avg_progress: number; certificates: number;
  };
  projects: { total: number; analyzed: number; pending: number };
  funds: {
    open_total: number;
    matching: number;      // aproximado: los sectores de fondos son texto libre
    closing_soon: number;  // cierran en 30 días
    next_closing: { name: string; deadline: string } | null;
  };
  has_organization: boolean;
}

// Visitas a la web. Los bots van APARTE de las cifras de personas a propósito:
// si un crawler pasa 300 veces, "visitas" dejaría de significar gente.
export interface SiteVisits {
  days: number;
  total: number;            // histórico completo (sin bots)
  period: number;           // visitas dentro del rango
  unique_visitors: number;  // únicos del rango (seudónimo diario)
  bots: number;
  by_day: { day: string; visits: number; unique: number }[];
  top_paths: { path: string; visits: number }[];
  top_referrers: { host: string | null; visits: number }[];
}

export interface ActivationStep {
  key: string;
  label: string;
  value: number;
  percentage: number;
  drop_from_previous: number;
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: 'include' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err?.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export class StatsRepository {
  async me(orgId?: string | null): Promise<UserStats | null> {
    try {
      const qs = orgId ? `?orgId=${encodeURIComponent(orgId)}` : '';
      return await apiFetch<UserStats>(`/api/proxy/stats/me${qs}`);
    } catch {
      return null; // el dashboard degrada a "—" en vez de romperse
    }
  }

  async activation(): Promise<{ steps: ActivationStep[]; registered: number } | null> {
    try {
      return await apiFetch<{ steps: ActivationStep[]; registered: number }>('/api/proxy/stats/activation');
    } catch {
      return null;
    }
  }

  async visits(days = 30): Promise<SiteVisits | null> {
    try {
      return await apiFetch<SiteVisits>(`/api/proxy/stats/visits?days=${days}`);
    } catch {
      return null;
    }
  }
}
