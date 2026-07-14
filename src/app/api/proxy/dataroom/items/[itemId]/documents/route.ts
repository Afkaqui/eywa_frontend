import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.BACKEND_URL ?? 'http://localhost:4001';

// Proxy de SUBIDA (multipart). No usa proxyToBackend porque ese serializa JSON;
// aquí hay que reenviar el FormData tal cual, sin tocar el Content-Type (el
// boundary lo pone fetch).
export async function POST(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;

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
    const res = await fetch(`${API_URL}/api/dataroom/items/${itemId}/documents`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${token.backendToken}` },
      body:    form,
      signal:  AbortSignal.timeout(60000), // archivos grandes
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Error al subir el archivo' }, { status: 502 });
  }
}
