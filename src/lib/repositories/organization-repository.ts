import type { Organization } from '@/lib/types/database';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', ...init });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err?.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Una cuenta puede tener VARIAS personas jurídicas (§13) ─────────────────────
// Un RUC 10 (persona natural, uno solo) y varios RUC 20. El límite lo impone el
// backend y llega en `limit`/`can_add`: la UI no lo reimplementa.

export interface OrgResumen {
  id: string;
  name: string;              // razón social
  trade_name: string | null; // nombre comercial
  ruc: string | null;
  type: string;              // empresa | persona_natural | inversor…
  sector: string | null;
  country: string | null;
  has_logo: boolean;
  public_slug: string | null;
  created_at: string;
}

export interface OrgListado {
  organizations: OrgResumen[];
  limit: number;
  can_add: boolean;
  default_id: string | null;
}

export interface OrgImpacto {
  organization: OrgResumen;
  se_perderia: { documentos: number; diagnosticos: number; invitaciones_activas: number };
}

export type OrgPayload = Partial<{
  name: string; tradeName: string | null; ruc: string | null;
  type: string; institutionType: string | null; description: string | null;
  phone: string | null; website: string | null; externalLinks: string[];
  country: string | null; sector: string | null;
}>;

export class OrganizationRepository {
  /** La organización PREDETERMINADA (la más antigua). */
  async get(): Promise<Organization | null> {
    const data = await apiFetch<{ organization: Organization | null }>('/api/proxy/organization');
    return data.organization ?? null;
  }

  /** Todas las del usuario, con el límite y si puede agregar más. */
  async getAll(): Promise<OrgListado> {
    return apiFetch<OrgListado>('/api/proxy/organization/all');
  }

  /** Guarda la PREDETERMINADA (compatibilidad con el formulario actual). */
  async save(payload: OrgPayload): Promise<Organization> {
    const data = await apiFetch<{ organization: Organization }>('/api/proxy/organization', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return data.organization;
  }

  async create(payload: OrgPayload): Promise<OrgResumen> {
    const data = await apiFetch<{ organization: OrgResumen }>('/api/proxy/organization', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return data.organization;
  }

  async update(id: string, payload: OrgPayload): Promise<OrgResumen> {
    const data = await apiFetch<{ organization: OrgResumen }>(`/api/proxy/organization/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return data.organization;
  }

  /** Qué se perdería al borrarla. Consultar ANTES de confirmar. */
  async impacto(id: string): Promise<OrgImpacto> {
    return apiFetch<OrgImpacto>(`/api/proxy/organization/${id}/impacto`);
  }

  async remove(id: string): Promise<void> {
    await apiFetch<void>(`/api/proxy/organization/${id}`, { method: 'DELETE' });
  }
}

// ── Organización activa ─────────────────────────────────────────────────────────
// Cuál de las empresas está mirando el usuario. Vive en localStorage y no en el
// servidor a propósito: es una preferencia de vista, no un dato del negocio, y así
// cada pestaña puede quedarse donde estaba sin sincronizar nada.
const CLAVE_ACTIVA = 'eywa.org_activa';

export function getOrgActivaId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(CLAVE_ACTIVA);
}

export function setOrgActivaId(id: string | null): void {
  if (typeof window === 'undefined') return;
  if (id) window.localStorage.setItem(CLAVE_ACTIVA, id);
  else window.localStorage.removeItem(CLAVE_ACTIVA);
}

/**
 * Resuelve la organización activa contra la lista real.
 * Si la guardada ya no existe (se borró, o es de otra cuenta en el mismo
 * navegador), cae a la predeterminada en vez de dejar la vista en blanco.
 */
export function resolverOrgActiva(lista: OrgListado): string | null {
  const guardada = getOrgActivaId();
  if (guardada && lista.organizations.some(o => o.id === guardada)) return guardada;
  const fallback = lista.default_id ?? lista.organizations[0]?.id ?? null;
  setOrgActivaId(fallback);
  return fallback;
}
