import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.BACKEND_URL ?? 'http://localhost:4001';

// Subida del avatar del usuario (multipart). Reenvía el FormData tal cual.
export async function POST(req: NextRequest) {
  const token = await getToken({
    req,
    secret:       process.env.AUTH_SECRET!,
    secureCookie: process.env.NODE_ENV === 'production',
  });
  if (!token?.backendToken) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const res = await fetch(`${API_URL}/api/media/profile/avatar`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${token.backendToken}` },
      body:    form,
      signal:  AbortSignal.timeout(30000),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Error al subir la imagen' }, { status: 502 });
  }
}
