import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.BACKEND_URL ?? 'http://localhost:4001';

// Sirve el avatar (público, sin sesión): un <img src> no envía Authorization.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const res = await fetch(`${API_URL}/api/media/profile/${id}/avatar`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return new NextResponse(null, { status: res.status });
    return new NextResponse(res.body, {
      status: 200,
      headers: {
        'Content-Type':  res.headers.get('Content-Type') ?? 'image/jpeg',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
