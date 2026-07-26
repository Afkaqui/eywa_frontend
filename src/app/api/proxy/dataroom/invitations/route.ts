import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

// Invitaciones del dataroom (el backend exige ser DUEÑO de la organización).
export async function GET(req: NextRequest) {
  return proxyToBackend(req, '/api/dataroom/invitations');
}

export async function POST(req: NextRequest) {
  return proxyToBackend(req, '/api/dataroom/invitations');
}
