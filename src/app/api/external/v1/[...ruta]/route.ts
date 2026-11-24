import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.BACKEND_URL ?? 'http://localhost:4001';

// Puerta HTTPS de la API externa (§15).
//
// El backend escucha en HTTP plano (PENDIENTES: "Backend en HTTP plano"). Para el
// navegador no importa porque nunca lo toca, pero un sistema de terceros sí lo
// tocaría, y mandaría su clave sin cifrar. Por eso la API se publica aquí, bajo el
// dominio con TLS de Vercel, y esta ruta reenvía tal cual.
//
// No pasa por la sesión de NextAuth ni por proxyToBackend: quien llama no es un
// usuario, se identifica con X-Api-Key, y el backend es quien la valida.

async function reenviar(req: NextRequest, ruta: string[]) {
  const destino = `${API_URL}/api/external/v1/${ruta.map(encodeURIComponent).join('/')}${req.nextUrl.search}`;

  const cabeceras: Record<string, string> = { Accept: 'application/json' };
  const clave = req.headers.get('x-api-key');
  if (clave) cabeceras['X-Api-Key'] = clave;
  const tipo = req.headers.get('content-type');
  if (tipo) cabeceras['Content-Type'] = tipo;

  let res: Response;
  try {
    res = await fetch(destino, {
      method:  req.method,
      headers: cabeceras,
      body:    req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.text(),
      signal:  AbortSignal.timeout(30000),
      cache:   'no-store',
    });
  } catch {
    return NextResponse.json({ error: 'EYWA no está disponible en este momento. Reintenta más tarde.' }, { status: 502 });
  }

  // Se reenvían las cabeceras que el cliente necesita para gestionar el límite.
  const salida = new Headers({ 'Content-Type': res.headers.get('Content-Type') ?? 'application/json' });
  for (const h of ['Retry-After', 'X-RateLimit-Limit', 'X-RateLimit-Remaining']) {
    const v = res.headers.get(h);
    if (v) salida.set(h, v);
  }
  return new NextResponse(await res.text(), { status: res.status, headers: salida });
}

type Ctx = { params: Promise<{ ruta: string[] }> };

export async function GET(req: NextRequest, { params }: Ctx)  { return reenviar(req, (await params).ruta); }
export async function POST(req: NextRequest, { params }: Ctx) { return reenviar(req, (await params).ruta); }
