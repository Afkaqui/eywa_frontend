import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

export async function POST(req: NextRequest) {
  const body = await req.json();
  return proxyToBackend(req, '/api/users/me/password', { method: 'POST', body });
}
