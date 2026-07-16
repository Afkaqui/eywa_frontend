import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.BACKEND_URL ?? 'http://localhost:4001';

// Subida de documento del Validador (multipart). Reenvía el FormData tal cual;
// el boundary lo pone fetch (no tocar el Content-Type).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const form = await req.formData();
    const res = await fetch(`${API_URL}/api/validator/plans/${id}/documents`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${token.backendToken}` },
      body:    form,
      signal:  AbortSignal.timeout(60000),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Error al subir el archivo' }, { status: 502 });
  }
}
