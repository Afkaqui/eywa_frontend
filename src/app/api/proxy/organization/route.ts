import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

export async function GET(req: NextRequest) {
  return proxyToBackend(req, '/api/organization');
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  return proxyToBackend(req, '/api/organization', { method: 'PUT', body });
}

// Crear una organización NUEVA (el backend hace cumplir el límite y el RUC único).
export async function POST(req: NextRequest) {
  const body = await req.json();
  return proxyToBackend(req, '/api/organization', { method: 'POST', body });
}
