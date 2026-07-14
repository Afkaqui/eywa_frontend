import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

export async function GET(req: NextRequest) {
  return proxyToBackend(req, '/api/dataroom/landing');
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  return proxyToBackend(req, '/api/dataroom/landing', { method: 'PATCH', body });
}
