import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helper';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const { id, docId } = await params;
  return proxyToBackend(req, `/api/validator/plans/${id}/documents/${docId}`, { method: 'DELETE' });
}
