import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

export async function GET(req: NextRequest) {
  // El diagnóstico es por empresa: hay que reenviar el orgId o el backend
  // devolvería siempre el de la organización predeterminada.
  const orgId = req.nextUrl.searchParams.get('orgId');
  return proxyToBackend(req, `/api/diagnostic/results/me${orgId ? `?orgId=${encodeURIComponent(orgId)}` : ''}`);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return proxyToBackend(req, '/api/diagnostic/results', { method: 'POST', body });
}
