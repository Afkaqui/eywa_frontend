import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

export async function POST(req: NextRequest, { params }: { params: Promise<{ sectionId: string }> }) {
  const { sectionId } = await params;
  return proxyToBackend(req, `/api/courses/sections/${sectionId}/complete`, { method: 'POST' });
}
