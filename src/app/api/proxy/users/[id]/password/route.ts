import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

// Fijar la contraseña de otro usuario. El backend exige rol superadmin: aquí no
// se comprueba nada, para que la regla viva en un solo sitio.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  return proxyToBackend(req, `/api/users/${id}/password`, { method: 'POST', body });
}
