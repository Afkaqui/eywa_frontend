import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get('orgId');
  return proxyToBackend(req, `/api/diagnostic/results/history${orgId ? `?orgId=${encodeURIComponent(orgId)}` : ''}`);
}
