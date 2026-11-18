import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

// Revisión del consultor: todos los proyectos (solo gestor/admin; lo valida el backend).
export async function GET(req: NextRequest) {
  return proxyToBackend(req, '/api/validator/revision');
}
