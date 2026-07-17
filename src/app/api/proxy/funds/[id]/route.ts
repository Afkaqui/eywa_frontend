import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  return proxyToBackend(req, `/api/funds/${id}`, { method: 'PATCH', body });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToBackend(req, `/api/funds/${id}`, { method: 'DELETE' });
}
