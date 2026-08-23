import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

export async function GET(req: NextRequest) {
  // El dataroom es POR EMPRESA: sin reenviar el orgId el backend opera siempre
  // sobre la organización predeterminada de la cuenta.
  const qs = req.nextUrl.search;
  return proxyToBackend(req, `/api/dataroom/grants${qs}`);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const qs = req.nextUrl.search;
  return proxyToBackend(req, `/api/dataroom/grants${qs}`, { method: 'POST', body });
}
