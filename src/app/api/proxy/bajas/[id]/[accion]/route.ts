import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

// Resolver una solicitud de baja (solo superadmin; lo valida el backend).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; accion: string }> }) {
  const { id, accion } = await params;
  if (accion !== 'eliminar' && accion !== 'rechazar') return NextResponse.json({ error: 'Acción inválida' }, { status: 400 });
  const body = await req.json().catch(() => ({}));
  return proxyToBackend(req, `/api/bajas/${encodeURIComponent(id)}/${accion}`, { method: 'POST', body, timeoutMs: 30000 });
}
