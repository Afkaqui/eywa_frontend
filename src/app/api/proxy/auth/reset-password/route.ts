import { NextRequest, NextResponse } from 'next/server';

// Proxy PÚBLICO (sin sesión): el usuario llega con el token del correo.
const API_URL = process.env.BACKEND_URL ?? 'http://localhost:4001';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
