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
  folders: DataroomFolder[];
  completeness: { completed_items: number; total_items: number; percentage: number };
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
  async get(): Promise<DataroomData> {
    return apiFetch<DataroomData>('/api/proxy/dataroom');
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
