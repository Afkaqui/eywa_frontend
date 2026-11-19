import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

// Revisión de una entrega (gestor/admin; lo valida el backend).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  return proxyToBackend(req, `/api/courses/entregas/${encodeURIComponent(id)}/revision`, { method: 'POST', body });
}
