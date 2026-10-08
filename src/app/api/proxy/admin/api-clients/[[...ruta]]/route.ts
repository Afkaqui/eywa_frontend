import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

// Administración de clientes de la API (solo superadmin; lo valida el backend).
type Ctx = { params: Promise<{ ruta?: string[] }> };

const destino = async ({ params }: Ctx) => {
  const { ruta } = await params;
  return `/api/admin/api-clients${ruta?.length ? '/' + ruta.map(encodeURIComponent).join('/') : ''}`;
};

export async function GET(req: NextRequest, ctx: Ctx) {
  return proxyToBackend(req, await destino(ctx));
}
export async function POST(req: NextRequest, ctx: Ctx) {
  const body = await req.json().catch(() => ({}));
  return proxyToBackend(req, await destino(ctx), { method: 'POST', body });
}
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const body = await req.json().catch(() => ({}));
  return proxyToBackend(req, await destino(ctx), { method: 'PATCH', body });
}
