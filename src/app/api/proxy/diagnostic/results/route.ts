import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

export async function GET(req: NextRequest) {
  return proxyToBackend(req, '/api/diagnostic/results/me');
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return proxyToBackend(req, '/api/diagnostic/results', { method: 'POST', body });
}
