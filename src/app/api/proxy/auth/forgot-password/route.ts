import { NextRequest, NextResponse } from 'next/server';

// Proxy PÚBLICO (sin sesión): quien olvidó su contraseña no puede iniciar sesión.
const API_URL = process.env.BACKEND_URL ?? 'http://localhost:4001';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
