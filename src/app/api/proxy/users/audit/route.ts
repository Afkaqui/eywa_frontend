import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

// Auditoría de la plataforma (el backend exige rol superadmin).
export async function GET(req: NextRequest) {
  const logs = req.nextUrl.searchParams.get('logs');
  return proxyToBackend(req, `/api/users/audit${logs ? `?logs=${encodeURIComponent(logs)}` : ''}`);
}
