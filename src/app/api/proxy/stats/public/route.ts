import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.BACKEND_URL ?? 'http://localhost:4001';

// Conteos agregados para la landing PÚBLICA (sin sesión).
export async function GET(_req: NextRequest) {
  try {
    const res = await fetch(`${API_URL}/api/stats/public`, {
      signal: AbortSignal.timeout(10000),
      // La landing puede cachear unos minutos: son conteos, no datos en vivo
      next: { revalidate: 300 },
    });
    if (!res.ok) return NextResponse.json({}, { status: res.status });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({}, { status: 502 });
  }
}
