import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { BRAND } from '@/lib/brand';

const API_URL = process.env.BACKEND_URL ?? 'http://localhost:4001';

// Entrada única UNANCHA → UNANCHA Agro.
// Con sesión de UNANCHA: pide al backend un código de un solo uso (60 s) y redirige
// a Agro con él en el FRAGMENTO (#c=…): no viaja a ningún servidor ni queda en
// logs, y Agro lo canjea por su token. Sin sesión: manda a iniciar sesión en
// UNANCHA y, al entrar, page.tsx vuelve aquí (destino 'agro' de ?vista=).
export async function GET(req: NextRequest) {
  // Solo rutas internas de Agro (evita usar esto como redirección abierta).
  const pedido = req.nextUrl.searchParams.get('a') ?? '/';
  const destino = /^\/(?!\/)[\w\-/]*$/.test(pedido) ? pedido : '/';

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET!,
    secureCookie: process.env.NODE_ENV === 'production',
  });
  if (!token?.backendToken) {
    return NextResponse.redirect(new URL('/?vista=agro', req.nextUrl));
  }

  try {
    const r = await fetch(`${API_URL}/api/auth/sso/codigo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.backendToken}` },
      signal: AbortSignal.timeout(8000),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d?.codigo) throw new Error(d?.error ?? `HTTP ${r.status}`);
    const url = `${BRAND.agroUrl}/sso#c=${encodeURIComponent(d.codigo)}&a=${encodeURIComponent(destino)}`;
    const res = NextResponse.redirect(url);
    res.headers.set('Cache-Control', 'no-store');
    res.headers.set('Referrer-Policy', 'no-referrer');
    return res;
  } catch {
    return NextResponse.redirect(`${BRAND.agroUrl}/entrar?sso=error`);
  }
}
