'use client';

import { use, useState, useEffect } from 'react';
import {
  FolderLock, Download, ChevronDown, ChevronRight, Loader2,
  AlertTriangle, CheckCircle2, Circle, Sparkles, Eye,
} from 'lucide-react';
import {
  getInvitedDataroom, invitedDownloadUrl,
  type InvitedDataroom, type DataroomFolder,
} from '@/lib/repositories/dataroom-repository';

// Vista PÚBLICA del invitado: llega con el token del correo, sin cuenta.
// Solo lectura — no hay subir, borrar ni publicar. Cada descarga queda en la
// bitácora de la empresa, y se le dice para que no sea una sorpresa.

function kb(size: number) {
  return size < 1024 * 1024
    ? `${Math.round(size / 1024)} KB`
    : `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function InvitacionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData]   = useState<InvitedDataroom | null>(null);
  const [error, setError] = useState('');
  const [open, setOpen]   = useState<Set<string>>(new Set());

  useEffect(() => {
    getInvitedDataroom(token)
      .then(d => { setData(d); setOpen(new Set([d.folders[0]?.id].filter(Boolean) as string[])); })
      .catch(e => setError(e instanceof Error ? e.message : 'No se pudo abrir la invitación'));
  }, [token]);

  const toggle = (id: string) =>
    setOpen(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  if (error) {
    return (
      <Shell>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Invitación no disponible</h1>
          <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
            {error}. El enlace pudo vencer o la empresa pudo retirar el acceso.
            Pídele una invitación nueva.
          </p>
        </div>
      </Shell>
    );
  }

  if (!data) {
    return (
      <Shell>
        <div className="py-12 text-center"><Loader2 className="w-6 h-6 text-gray-300 mx-auto animate-spin" /></div>
      </Shell>
    );
  }

  const vence = new Date(data.expires_at).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <Shell>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
            <FolderLock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-light text-gray-900">{data.organization.name}</h1>
            <p className="text-sm text-gray-500">
              Dataroom {data.organization.sector ? `· ${data.organization.sector}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Qué puede hacer y qué queda registrado — dicho antes de que descargue nada */}
      <div className="flex gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-6">
        <Eye className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
        <div className="text-xs text-gray-600 leading-relaxed">
          Accedes como <strong>{data.invited_as.name || data.invited_as.email}</strong> en
          modo <strong>solo lectura</strong>: puedes ver y descargar, no modificar.
          El acceso vence el {vence}.
          <br />
          Cada documento que descargues queda registrado en la bitácora de la empresa.
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Completitud de la documentación</span>
          <span className="text-lg font-semibold text-gray-900">{data.completeness.percentage}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500 transition-all duration-700"
               style={{ width: `${data.completeness.percentage}%` }} />
        </div>
        <div className="text-xs text-gray-400 mt-1.5">
          {data.completeness.completed_items} de {data.completeness.total_items} documentos requeridos
        </div>
      </div>

      <div className="space-y-3">
        {data.folders.map(f => (
          <Folder key={f.id} folder={f} token={token} open={open.has(f.id)} onToggle={() => toggle(f.id)} />
        ))}
      </div>
    </Shell>
  );
}

function Folder({ folder, token, open, onToggle }: {
  folder: DataroomFolder; token: string; open: boolean; onToggle: () => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left">
        {open ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
              : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900">{folder.name}</div>
          {folder.description && <div className="text-xs text-gray-500 truncate">{folder.description}</div>}
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {folder.completed_items}/{folder.total_items}
        </span>
        <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden shrink-0">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${folder.percentage}%` }} />
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 divide-y divide-gray-100">
          {folder.items.map(item => (
            <div key={item.id} className="px-4 py-3">
              <div className="flex items-start gap-2.5">
                {item.completed
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  : <Circle className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-800">{item.name}</div>

                  {item.platform_complete && (
                    <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs">
                      <Sparkles className="w-3 h-3" />
                      {item.platform_note ?? 'Completo vía plataforma'}
                    </div>
                  )}

                  {item.documents.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {item.documents.map(d => (
                        <a
                          key={d.id}
                          href={invitedDownloadUrl(token, d.id)}
                          className="flex items-center gap-2 text-xs text-gray-600 hover:text-emerald-700 group"
                        >
                          <Download className="w-3.5 h-3.5 shrink-0 text-gray-400 group-hover:text-emerald-600" />
                          <span className="truncate">{d.file_name}</span>
                          <span className="text-gray-300 whitespace-nowrap">{kb(d.size)}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {!item.completed && (
                    <div className="text-xs text-gray-400 mt-0.5">Sin documento</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900 tracking-tight">EYWA</span>
          <span className="text-xs text-gray-400">Acceso por invitación</span>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
