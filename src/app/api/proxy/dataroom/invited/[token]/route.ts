import { NextRequest, NextResponse } from 'next/server';

// Proxy PÚBLICO: el invitado llega con el token del correo y NO tiene sesión.
// No usa proxyToBackend porque ese inyecta el Bearer del usuario logueado.
const API_URL = process.env.BACKEND_URL ?? 'http://localhost:4001';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const res = await fetch(`${API_URL}/api/dataroom/invited/${encodeURIComponent(token)}`, {
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
