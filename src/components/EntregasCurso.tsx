"use client";

// Revisión de entregas de las tareas de un curso (gestor/admin/superadmin).
// "Revisada" la da por buena; "Por corregir" exige un comentario y el alumno la
// ve marcada para volver a enviarla.

import { useCallback, useEffect, useState } from 'react';
import { Inbox, Paperclip, Loader2, CheckCircle2, AlertTriangle, ChevronDown } from 'lucide-react';

interface Entrega {
  id: string; texto: string | null; estado: 'enviada' | 'revisada' | 'por_corregir'; comentario: string | null;
  archivo: { nombre: string; url: string } | null; enviada_at: string; revisada_at: string | null; revisada_por: string | null;
  alumno: { nombre: string | null; email: string; empresa: string | null }; tarea: string; seccion: string;
}

const ETQ: Record<Entrega['estado'], string> = { enviada: 'Por revisar', revisada: 'Revisada', por_corregir: 'Por corregir' };
const CLS: Record<Entrega['estado'], string> = {
  enviada: 'bg-amber-50 text-amber-800', revisada: 'bg-emerald-50 text-emerald-800', por_corregir: 'bg-red-50 text-red-800',
};

export function EntregasCurso({ courseId }: { courseId: string }) {
  const [lista, setLista] = useState<Entrega[] | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [notas, setNotas] = useState<Record<string, string>>({});
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const r = await fetch(`/api/proxy/courses/${courseId}/entregas`, { credentials: 'include' });
    const d = await r.json().catch(() => ({}));
    setLista(r.ok ? d.entregas ?? [] : []);
  }, [courseId]);
  useEffect(() => { cargar(); }, [cargar]);

  const revisar = async (e: Entrega, estado: 'revisada' | 'por_corregir') => {
    setOcupado(e.id); setError(null);
    try {
      const r = await fetch(`/api/proxy/courses/entregas/${e.id}/revision`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado, comentario: (notas[e.id] ?? e.comentario ?? '').trim() || null }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d?.error ?? 'No se pudo guardar');
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setOcupado(null);
    }
  };

  if (!lista) return null;
  const pendientes = lista.filter((e) => e.estado === 'enviada').length;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl mb-6">
      <button onClick={() => setAbierto((v) => !v)} className="w-full flex items-center gap-3 p-4 text-left">
        <Inbox className="w-5 h-5 text-emerald-700" />
        <div className="flex-1">
          <div className="font-semibold text-gray-900">
            Entregas de tareas {pendientes > 0 && <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">{pendientes} por revisar</span>}
          </div>
          <div className="text-xs text-gray-500">{lista.length} entrega{lista.length === 1 ? '' : 's'} · solo lo ven gestores y administradores</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>

      {abierto && (
        <div className="px-4 pb-4 space-y-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {lista.length === 0 && <p className="text-sm text-gray-500">Aún no hay entregas.</p>}
          {lista.map((e) => (
            <div key={e.id} className="border border-gray-200 rounded-xl p-3 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900">{e.alumno.nombre ?? e.alumno.email}{e.alumno.empresa ? <span className="text-gray-500 font-normal"> · {e.alumno.empresa}</span> : null}</div>
                  <div className="text-xs text-gray-500">{e.seccion} · {e.tarea} · {new Date(e.enviada_at).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full ${CLS[e.estado]}`}>{ETQ[e.estado]}</span>
              </div>
              {e.texto && <p className="mt-2 text-gray-700 whitespace-pre-line bg-gray-50 rounded-lg p-2.5">{e.texto}</p>}
              {e.archivo && (
                <a href={e.archivo.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-emerald-700 hover:underline">
                  <Paperclip className="w-4 h-4" /> {e.archivo.nombre}
                </a>
              )}
              <textarea
                value={notas[e.id] ?? e.comentario ?? ''} onChange={(ev) => setNotas((n) => ({ ...n, [e.id]: ev.target.value }))}
                rows={2} maxLength={4000} placeholder="Comentario para el alumno (obligatorio si debe corregir)"
                className="mt-2 w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button onClick={() => revisar(e, 'revisada')} disabled={ocupado === e.id}
                        className="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1 disabled:opacity-50">
                  {ocupado === e.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Marcar revisada
                </button>
                <button onClick={() => revisar(e, 'por_corregir')} disabled={ocupado === e.id}
                        className="px-3 py-1.5 rounded-full border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-1 disabled:opacity-50">
                  <AlertTriangle className="w-3.5 h-3.5" /> Pedir corrección
                </button>
                {e.revisada_por && <span className="text-xs text-gray-400">Revisó: {e.revisada_por}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
