import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

export async function GET(req: NextRequest) {
  const qs = req.nextUrl.search; // conserva los filtros (?country=&category=&q=...)
  return proxyToBackend(req, `/api/actors${qs}`);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return proxyToBackend(req, '/api/actors', { method: 'POST', body });
}
