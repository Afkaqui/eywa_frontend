import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.BACKEND_URL ?? 'http://localhost:4001';

// Material de curso servido desde el VPS.
//
// No usa proxyToBackend: ese hace .json() y corrompería el archivo. Aquí el
// cuerpo pasa tal cual.
//
// Y reenvía la cabecera Range: sin ella el reproductor no puede adelantar un
// vídeo y tendría que descargar el archivo entero antes de empezar. Con clases
// de 566 MB eso no es viable.
export async function GET(req: NextRequest, { params }: { params: Promise<{ archivo: string }> }) {
  const { archivo } = await params;

  const token = await getToken({
    req,
    secret:       process.env.AUTH_SECRET!,
    secureCookie: process.env.NODE_ENV === 'production',
  });
  if (!token?.backendToken) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const rango = req.headers.get('range');

  try {
    const res = await fetch(`${API_URL}/api/courses/material/${encodeURIComponent(archivo)}`, {
      headers: {
        Authorization: `Bearer ${token.backendToken}`,
        ...(rango ? { Range: rango } : {}),
      },
      signal: AbortSignal.timeout(120000), // vídeos grandes
    });

    if (!res.ok && res.status !== 206) {
      const err = await res.json().catch(() => ({ error: 'No se pudo abrir el material' }));
      return NextResponse.json(err, { status: res.status });
    }

    const cabeceras: Record<string, string> = {
      'Content-Type':        res.headers.get('Content-Type') ?? 'application/octet-stream',
      'Content-Disposition': res.headers.get('Content-Disposition') ?? 'inline',
      'Accept-Ranges':       res.headers.get('Accept-Ranges') ?? 'bytes',
    };
    // En una respuesta parcial estas dos son obligatorias para el reproductor.
    const cr = res.headers.get('Content-Range');
    const cl = res.headers.get('Content-Length');
    if (cr) cabeceras['Content-Range'] = cr;
    if (cl) cabeceras['Content-Length'] = cl;

    return new NextResponse(res.body, { status: res.status, headers: cabeceras });
  } catch {
    return NextResponse.json({ error: 'Error de conexión' }, { status: 502 });
  }
}
