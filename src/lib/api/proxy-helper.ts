import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.BACKEND_URL ?? 'http://localhost:4001';

/**
 * Extrae el backendToken del JWT de Auth.js y reenvía la petición al backend.
 * Se usa en todas las rutas /api/proxy/*.
 */
export async function proxyToBackend(
  request: NextRequest,
  backendPath: string,
  init?: { method?: string; body?: unknown }
): Promise<NextResponse> {
  // 1. Obtener el JWT de Auth.js (desencripta la cookie de sesión)
  const token = await getToken({
    req:          request,
    secret:       process.env.AUTH_SECRET!,
    secureCookie: process.env.NODE_ENV === 'production',
  });

  if (!token?.backendToken) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // 2. Reenviar al backend con el token del backend como Bearer
  try {
    const res = await fetch(`${API_URL}${backendPath}`, {
      method:  init?.method ?? 'GET',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token.backendToken}`,
      },
      body: init?.body ? JSON.stringify(init.body) : undefined,
      signal: AbortSignal.timeout(8000),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Error de conexión con el backend' }, { status: 502 });
  }
}
