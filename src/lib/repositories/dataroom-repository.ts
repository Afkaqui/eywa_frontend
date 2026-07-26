// Repository del Dataroom — /api/proxy/dataroom

export interface DataroomDoc {
  id: string;
  item_id: string;
  file_name: string;
  mime: string;
  size: number;
  is_public: boolean;
  created_at: string;
}

export interface DataroomItem {
  id: string;
  name: string;
  hint: string | null;
  completed: boolean;
  // "Completo vía plataforma": el diagnóstico GENES o los certificados de la
  // Academia cubren este ítem sin necesidad de archivo (carpeta ASG).
  platform_complete?: boolean;
  platform_note?: string | null;
  documents: DataroomDoc[];
}

export interface DataroomFolder {
  id: string;
  key: string;
  name: string;
  description: string | null;
  items: DataroomItem[];
  completed_items: number;
  total_items: number;
  percentage: number;
}

export interface DataroomData {
  has_organization: boolean;
  organization: { id: string; name: string } | null;
  read_only?: boolean; // vista delegada (gestor/superadmin): solo ver y descargar
  folders: DataroomFolder[];
  completeness: { completed_items: number; total_items: number; percentage: number };
}

export interface DataroomGrant {
  id: string;
  organization: { id: string; name: string };
  gestor: { id: string; email: string; name: string | null };
  created_at: string;
}

export interface AccessLogEntry {
  id: string;
  file_name: string;
  action: 'download' | 'download_public';
  user: string;
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

export class DataroomRepository {
  async get(orgId?: string): Promise<DataroomData> {
    const qs = orgId ? `?orgId=${encodeURIComponent(orgId)}` : '';
    return apiFetch<DataroomData>(`/api/proxy/dataroom${qs}`);
  }

  async upload(itemId: string, file: File): Promise<DataroomDoc> {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`/api/proxy/dataroom/items/${itemId}/documents`, {
      method: 'POST',
      credentials: 'include',
      body: form, // sin Content-Type: el navegador pone el boundary
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error al subir' }));
      throw new Error(err?.error ?? 'Error al subir el archivo');
    }
    const data = await res.json();
    return data.document;
  }

  async remove(docId: string): Promise<void> {
    await apiFetch<void>(`/api/proxy/dataroom/documents/${docId}`, { method: 'DELETE' });
  }

  async setPublic(docId: string, isPublic: boolean): Promise<DataroomDoc> {
    const data = await apiFetch<{ document: DataroomDoc }>(`/api/proxy/dataroom/documents/${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_public: isPublic }),
    });
    return data.document;
  }

  downloadUrl(docId: string): string {
    return `/api/proxy/dataroom/documents/${docId}/download`;
  }

  // ── Mini-landing pública ────────────────────────────────────────────────────
  async getLanding(): Promise<LandingState> {
    return apiFetch<LandingState>('/api/proxy/dataroom/landing');
  }

  async setLanding(enabled: boolean): Promise<LandingState> {
    return apiFetch<LandingState>('/api/proxy/dataroom/landing', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
  }

  // ── Permisos delegados (superadmin) ─────────────────────────────────────────
  async getGrants(): Promise<{
    grants: DataroomGrant[];
    organizations: { id: string; name: string }[];
    gestores: { id: string; email: string; fullName: string | null; role: string }[];
  }> {
    return apiFetch('/api/proxy/dataroom/grants');
  }

  async createGrant(organizationId: string, gestorId: string): Promise<void> {
    await apiFetch('/api/proxy/dataroom/grants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organization_id: organizationId, gestor_id: gestorId }),
    });
  }

  async deleteGrant(id: string): Promise<void> {
    await apiFetch(`/api/proxy/dataroom/grants/${id}`, { method: 'DELETE' });
  }

  // Datarooms que me delegaron (gestor/admin) o todos (superadmin)
  async getGranted(): Promise<{ id: string; name: string; sector?: string | null }[]> {
    const data = await apiFetch<{ organizations: { id: string; name: string; sector?: string | null }[] }>(
      '/api/proxy/dataroom/granted'
    );
    return data.organizations ?? [];
  }

  // ── Bitácora de accesos (dueño / superadmin) ────────────────────────────────
  async getAccessLog(orgId?: string): Promise<AccessLogEntry[]> {
    const qs = orgId ? `?orgId=${encodeURIComponent(orgId)}` : '';
    const data = await apiFetch<{ logs: AccessLogEntry[] }>(`/api/proxy/dataroom/access-log${qs}`);
    return data.logs ?? [];
  }

  // ── Invitaciones (solo el dueño) ────────────────────────────────────────────
  async getInvitations(): Promise<Invitation[]> {
    const data = await apiFetch<{ invitations: Invitation[] }>('/api/proxy/dataroom/invitations');
    return data.invitations ?? [];
  }

  async invite(email: string, name?: string): Promise<Invitation> {
    const data = await apiFetch<{ invitation: Invitation }>('/api/proxy/dataroom/invitations', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, name: name || null }),
    });
    return data.invitation;
  }

  async revokeInvitation(id: string): Promise<void> {
    await apiFetch<void>(`/api/proxy/dataroom/invitations/${id}`, { method: 'DELETE' });
  }
}

// Estado ya resuelto por el backend, para que la UI no reimplemente el vencimiento.
export type InvitationStatus = 'enviada' | 'activa' | 'vencida' | 'revocada';

export interface Invitation {
  id: string;
  email: string;
  name: string | null;
  created_at?: string;
  expires_at: string;
  last_access_at?: string | null;
  revoked?: boolean;
  status: InvitationStatus;
}

// ── Vista del invitado (sin sesión, con token del correo) ─────────────────────
export interface InvitedDataroom {
  organization: { id: string; name: string; sector: string | null };
  invited_as:   { email: string; name: string | null };
  expires_at:   string;
  read_only:    true;
  folders:      DataroomFolder[];
  completeness: { completed_items: number; total_items: number; percentage: number };
}

export async function getInvitedDataroom(token: string): Promise<InvitedDataroom> {
  const res = await fetch(`/api/proxy/dataroom/invited/${encodeURIComponent(token)}`, {
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? 'Invitación no válida o expirada');
  return data as InvitedDataroom;
}

export function invitedDownloadUrl(token: string, docId: string): string {
  return `/api/proxy/dataroom/invited/${encodeURIComponent(token)}/documents/${docId}/download`;
}

export interface LandingState {
  enabled: boolean;
  slug: string | null;
}

// ── Datos de la landing pública (sin sesión) ──────────────────────────────────
export interface PublicOrg {
  id: string;
  name: string;
  type: string;
  description: string | null;
  sector: string | null;
  country: string | null;
  website: string | null;
  externalLinks: string[];
  has_logo: boolean;
}

export interface PublicDoc {
  id: string;
  file_name: string;
  mime: string;
  size: number;
  folder: string;
  item: string;
  created_at: string;
}

export interface PublicLandingData {
  organization: PublicOrg;
  completeness: { completed_items: number; total_items: number; percentage: number };
  documents: PublicDoc[];
}

export function publicDownloadUrl(docId: string): string {
  return `/api/proxy/dataroom/public/documents/${docId}/download`;
}
