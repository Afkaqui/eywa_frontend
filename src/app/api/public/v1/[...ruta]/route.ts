import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.BACKEND_URL ?? 'http://localhost:4001';

// Capa PÚBLICA de la API (§9): sin clave, solo lectura de lo que ya es público.
//
// A diferencia de /api/external/v1, esta la llama el NAVEGADOR de un tercero (el
// sello que una empresa pega en su web), así que necesita CORS abierto. Es seguro
// porque no hay sesión ni cookies de por medio y solo devuelve datos públicos.
//
// El backend marca las respuestas como cacheables (Cache-Control con s-maxage):
// Vercel las sirve desde su CDN y una web con tráfico no golpea el VPS en cada
// visita.

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age':       '86400',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ ruta: string[] }> }) {
  const { ruta } = await params;
  const destino = `${API_URL}/api/public/v1/${ruta.map(encodeURIComponent).join('/')}${req.nextUrl.search}`;

  // La IP real del visitante, para el límite por IP del backend. Sin esto, todas
  // las peticiones llegarían con la IP de Vercel y compartirían un solo límite.
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim();

  let res: Response;
  try {
    res = await fetch(destino, {
      headers: { Accept: 'application/json', ...(ip ? { 'X-Forwarded-For': ip } : {}) },
      signal:  AbortSignal.timeout(15000),
      cache:   'no-store',
    });
  } catch {
    return NextResponse.json({ error: 'EYWA no está disponible en este momento' }, { status: 502, headers: CORS });
  }

  const salida = new Headers({ ...CORS, 'Content-Type': res.headers.get('Content-Type') ?? 'application/json' });
  for (const h of ['Cache-Control', 'Retry-After']) {
    const v = res.headers.get(h);
    if (v) salida.set(h, v);
  }
  return new NextResponse(await res.text(), { status: res.status, headers: salida });
}
