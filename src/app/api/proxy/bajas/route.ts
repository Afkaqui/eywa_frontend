import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

const API_URL = process.env.BACKEND_URL ?? 'http://localhost:4001';

// GET: lista para el superadmin (lleva la sesión; el backend exige el rol).
export async function GET(req: NextRequest) {
  return proxyToBackend(req, '/api/bajas');
}

// POST: solicitud de baja PÚBLICA (sin sesión). Se reenvía la IP para el límite.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  try {
    const r = await fetch(`${API_URL}/api/bajas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': req.headers.get('x-forwarded-for') ?? '',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    const d = await r.json().catch(() => ({}));
    return NextResponse.json(d, { status: r.status });
  } catch {
    return NextResponse.json({ error: 'No pudimos conectar con el servidor. Intenta de nuevo.' }, { status: 502 });
  }
}
