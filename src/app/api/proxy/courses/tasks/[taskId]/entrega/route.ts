import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.BACKEND_URL ?? 'http://localhost:4001';

// Entrega de una tarea de la Academia (multipart: texto y/o archivo).
// Reenvía el FormData tal cual; el boundary lo pone fetch.
export async function POST(req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  const token = await getToken({ req, secret: process.env.AUTH_SECRET!, secureCookie: process.env.NODE_ENV === 'production' });
  if (!token?.backendToken) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const form = await req.formData();
    const res = await fetch(`${API_URL}/api/courses/tasks/${encodeURIComponent(taskId)}/entrega`, {
      method: 'POST', headers: { Authorization: `Bearer ${token.backendToken}` }, body: form,
      signal: AbortSignal.timeout(60000),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'No se pudo enviar la entrega' }, { status: 502 });
  }
}
