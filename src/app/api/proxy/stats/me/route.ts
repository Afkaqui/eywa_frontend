import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

export async function GET(req: NextRequest) {
  // El panel es de una empresa concreta: hay que reenviar el orgId.
  const qs = req.nextUrl.search;
  return proxyToBackend(req, `/api/stats/me${qs}`);
}
