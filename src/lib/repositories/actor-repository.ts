// Repository de Actores (directorio del ecosistema) — /api/proxy/actors

export type ActorCategory =
  | 'proveedores_capital' | 'intermediarios' | 'bancos'
  | 'gobierno_multilaterales' | 'empresa_social';

export interface Actor {
  id: string;
  is_favorite: boolean;
  name: string;
  country: string;
  category: ActorCategory;
  subcategory: string | null;
  description: string | null;
  services: string | null;
  procedencia: string | null;
  geo_scope: string | null;
  instruments: string[];
  sectors: string[];
  aum: string | null;
  investment_amount: string | null;
  website: string | null;
  source: string;
  contact_name: string | null;   // solo llega para gestor/admin
  contact_email: string | null;  // solo llega para gestor/admin
}

export interface ActorListResult {
  actors: Actor[];
  total: number;
  can_see_contact: boolean;
  can_edit: boolean; // el directorio solo lo edita admin/gestor
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', ...init });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err?.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export class ActorRepository {
  async list(params?: { country?: string; category?: string; sector?: string; instrument?: string; q?: string; take?: number }): Promise<ActorListResult> {
    const qs = new URLSearchParams();
    if (params?.country)    qs.set('country', params.country);
    if (params?.category)   qs.set('category', params.category);
    if (params?.sector)     qs.set('sector', params.sector);
    if (params?.instrument) qs.set('instrument', params.instrument);
    if (params?.q)          qs.set('q', params.q);
    qs.set('take', String(params?.take ?? 500));
    const data = await apiFetch<ActorListResult>(`/api/proxy/actors?${qs.toString()}`);
    return {
      actors: Array.isArray(data.actors) ? data.actors : [],
      total: data.total ?? 0,
      can_see_contact: Boolean(data.can_see_contact),
      can_edit: Boolean(data.can_edit),
    };
  }

  // Favoritos personales (no modifican el directorio global)
  async setFavorite(id: string, favorite: boolean): Promise<void> {
    await apiFetch<void>(`/api/proxy/actors/${id}/favorite`, {
      method: favorite ? 'POST' : 'DELETE',
    });
  }

  async get(id: string): Promise<Actor> {
    const data = await apiFetch<{ actor: Actor }>(`/api/proxy/actors/${id}`);
    return data.actor;
  }

  async remove(id: string): Promise<void> {
    await apiFetch<void>(`/api/proxy/actors/${id}`, { method: 'DELETE' });
  }
}
