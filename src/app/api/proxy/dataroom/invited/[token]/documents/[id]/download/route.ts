import { NextRequest, NextResponse } from 'next/server';

// Descarga de un documento por parte del invitado (público, con token).
// Se hace streaming del binario tal cual: nada de re-serializar el archivo.
const API_URL = process.env.BACKEND_URL ?? 'http://localhost:4001';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string; id: string }> },
) {
  const { token, id } = await params;
  const res = await fetch(
    `${API_URL}/api/dataroom/invited/${encodeURIComponent(token)}/documents/${encodeURIComponent(id)}/download`,
    { cache: 'no-store' },
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'No se pudo descargar' }));
    return NextResponse.json(data, { status: res.status });
  }

  return new NextResponse(res.body, {
    status: 200,
    headers: {
      'Content-Type':        res.headers.get('content-type') ?? 'application/octet-stream',
      'Content-Disposition': res.headers.get('content-disposition') ?? 'attachment',
    },
  });
}
