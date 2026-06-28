import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // El análisis con IA puede tardar; ampliamos el timeout del proxy a 60s.
  return proxyToBackend(req, `/api/validator/plans/${id}/analyze`, { method: 'POST', timeoutMs: 60_000 });
}
