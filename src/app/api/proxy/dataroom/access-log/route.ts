import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

export async function GET(req: NextRequest) {
  const qs = req.nextUrl.search; // conserva ?orgId= (superadmin)
  return proxyToBackend(req, `/api/dataroom/access-log${qs}`);
}
