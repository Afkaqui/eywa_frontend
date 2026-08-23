import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

// Invitaciones del dataroom (el backend exige ser DUEÑO de la organización).
export async function GET(req: NextRequest) {
  // El dataroom es POR EMPRESA: sin reenviar el orgId el backend opera siempre
  // sobre la organización predeterminada de la cuenta.
  const qs = req.nextUrl.search;
  return proxyToBackend(req, `/api/dataroom/invitations${qs}`);
}

export async function POST(req: NextRequest) {
  return proxyToBackend(req, '/api/dataroom/invitations');
}
