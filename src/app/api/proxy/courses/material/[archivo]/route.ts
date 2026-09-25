import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

// Material de curso servido desde el VPS. Se pasa por el proxy para que el
// token viaje del lado servidor: el <a href> del navegador no puede añadirlo.
export async function GET(req: NextRequest, { params }: { params: Promise<{ archivo: string }> }) {
  const { archivo } = await params;
  return proxyToBackend(req, `/api/courses/material/${encodeURIComponent(archivo)}`);
}
