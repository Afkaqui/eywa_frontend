import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.BACKEND_URL ?? 'http://localhost:4001';

// Verificación PÚBLICA de certificados (sin sesión): cualquier tercero
// (empleador, inversor) puede validar un certificado EYWA por su código.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  try {
    const res = await fetch(`${API_URL}/api/certificates/verify/${encodeURIComponent(code)}`, {
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json().catch(() => ({ valid: false }));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Error de conexión' }, { status: 502 });
  }
}
