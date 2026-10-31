import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

// Definición del problema y Máximo Producto Posible de un proyecto (PLAN C1, C2).
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  return proxyToBackend(req, `/api/validator/plans/${id}/estructura`, { method: 'PUT', body });
}
