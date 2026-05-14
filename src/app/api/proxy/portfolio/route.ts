import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

export async function GET(req: NextRequest) {
  return proxyToBackend(req, '/api/portfolio');
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return proxyToBackend(req, '/api/portfolio', { method: 'POST', body });
}
