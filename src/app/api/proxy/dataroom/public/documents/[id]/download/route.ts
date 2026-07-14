import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.BACKEND_URL ?? 'http://localhost:4001';

// PÚBLICO (sin sesión): descarga de un documento que el dueño marcó como público.
// El backend valida que el doc sea público Y que la landing esté activa.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const res = await fetch(`${API_URL}/api/dataroom/public/documents/${id}/download`, {
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'No disponible' }));
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
