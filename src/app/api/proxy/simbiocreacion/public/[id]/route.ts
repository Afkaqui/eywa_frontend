import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.BACKEND_URL ?? 'http://localhost:4001';

// Proxy PÚBLICO (sin sesión) para el visor de enlaces compartidos.
// No usa proxyToBackend porque ese exige backendToken; aquí no hay login.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const res = await fetch(`${API_URL}/api/simbiocreacion/public/${id}`, {
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Error de conexión con el backend' }, { status: 502 });
  }
}
