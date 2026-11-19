import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.BACKEND_URL ?? 'http://localhost:4001';

// Archivo de una entrega (lo ve su autor o un gestor). Pasa el cuerpo tal cual.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getToken({ req, secret: process.env.AUTH_SECRET!, secureCookie: process.env.NODE_ENV === 'production' });
  if (!token?.backendToken) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const res = await fetch(`${API_URL}/api/courses/entregas/${encodeURIComponent(id)}/archivo`, {
    headers: { Authorization: `Bearer ${token.backendToken}` }, signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'No se pudo abrir el archivo' }));
    return NextResponse.json(err, { status: res.status });
  }
  const headers = new Headers();
  for (const h of ['content-type', 'content-length', 'content-disposition']) {
    const v = res.headers.get(h); if (v) headers.set(h, v);
  }
  headers.set('Cache-Control', 'private, no-store');
  return new NextResponse(res.body, { status: 200, headers });
}
