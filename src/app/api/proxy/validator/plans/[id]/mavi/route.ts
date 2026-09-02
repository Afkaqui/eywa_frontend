import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

// Envía el proyecto a la cartera de ARS LAB. El backend verifica el
// consentimiento registrado antes de enviar nada.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToBackend(req, `/api/validator/plans/${id}/mavi`, { method: 'POST' });
}
