import { NextRequest, NextResponse } from 'next/server';

// Proxy PÚBLICO para registrar visitas (la landing no tiene sesión).
const API_URL = process.env.BACKEND_URL ?? 'http://localhost:4001';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  // IMPRESCINDIBLE reenviar la IP y el user-agent del visitante: sin esto el
  // backend vería siempre la IP del servidor de Vercel y TODAS las visitas
  // caerían en el mismo hash, dando "1 visitante único" para siempre.
  // (El backend no guarda ninguno de los dos en claro: solo su hash diario.)
  const ip =
    req.headers.get('x-forwarded-for') ??
    req.headers.get('x-real-ip') ??
    '';

  try {
    await fetch(`${API_URL}/api/stats/visit`, {
      method: 'POST',
      headers: {
        'Content-Type':    'application/json',
        'x-forwarded-for': ip,
        'user-agent':      req.headers.get('user-agent') ?? '',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Contar una visita jamás debe afectar a quien está navegando.
  }

  return new NextResponse(null, { status: 204 });
}
