import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

// Cola de revisión del verificador nocturno de fondos (gestor+; lo valida el backend).
export async function GET(req: NextRequest) {
  return proxyToBackend(req, '/api/funds/revision');
}
