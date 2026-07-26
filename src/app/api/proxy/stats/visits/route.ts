import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

// Consulta de visitas (el backend exige rol gestor+).
export async function GET(req: NextRequest) {
  const days = req.nextUrl.searchParams.get('days');
  return proxyToBackend(req, `/api/stats/visits${days ? `?days=${encodeURIComponent(days)}` : ''}`);
}
