import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

// Qué se perdería al borrar una organización. Se consulta ANTES de confirmar.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToBackend(req, `/api/organization/${id}/impacto`);
}
