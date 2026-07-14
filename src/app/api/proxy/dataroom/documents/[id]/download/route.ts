import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.BACKEND_URL ?? 'http://localhost:4001';

// Proxy de DESCARGA: devuelve el binario tal cual (proxyToBackend hace .json()
// y corrompería el archivo).
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const token = await getToken({
    req,
    secret:       process.env.AUTH_SECRET!,
    secureCookie: process.env.NODE_ENV === 'production',
  });
  if (!token?.backendToken) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_URL}/api/dataroom/documents/${id}/download`, {
      headers: { Authorization: `Bearer ${token.backendToken}` },
      signal:  AbortSignal.timeout(60000),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error al descargar' }));
      return NextResponse.json(err, { status: res.status });
    }

    return new NextResponse(res.body, {
      status: 200,
      headers: {
        'Content-Type':        res.headers.get('Content-Type') ?? 'application/octet-stream',
        'Content-Disposition': res.headers.get('Content-Disposition') ?? 'attachment',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Error de conexión' }, { status: 502 });
  }
}
