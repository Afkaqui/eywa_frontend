"use client";

// Tarea de una clase de la Academia: instrucciones, entrega del alumno (texto
// y/o archivo) y la revisión del docente. Volver a enviar reemplaza la entrega
// y la deja pendiente de revisión otra vez.

import { useState } from 'react';
import { ClipboardList, Paperclip, Send, Loader2, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import type { CourseTask, TaskEntrega } from '@/lib/repositories/academy-repository';

const ESTADO: Record<TaskEntrega['estado'], { t: string; cls: string; Icon: typeof Clock }> = {
  enviada:      { t: 'Enviada · pendiente de revisión', cls: 'bg-amber-50 text-amber-800 border-amber-200', Icon: Clock },
  revisada:     { t: 'Revisada',                        cls: 'bg-emerald-50 text-emerald-800 border-emerald-200', Icon: CheckCircle2 },
  por_corregir: { t: 'Por corregir',                    cls: 'bg-red-50 text-red-800 border-red-200', Icon: AlertTriangle },
};

export function TareaCurso({ tarea, onEntregada }: { tarea: CourseTask; onEntregada?: (e: TaskEntrega) => void }) {
  const [entrega, setEntrega] = useState<TaskEntrega | null>(tarea.mi_entrega);
  const [editando, setEditando] = useState(!tarea.mi_entrega);
  const [texto, setTexto] = useState(tarea.mi_entrega?.texto ?? '');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enviar = async () => {
    setEnviando(true); setError(null);
    try {
      const fd = new FormData();
      if (texto.trim()) fd.append('texto', texto.trim());
      if (archivo) fd.append('file', archivo);
      const r = await fetch(`/api/proxy/courses/tasks/${tarea.id}/entrega`, { method: 'POST', body: fd, credentials: 'include' });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d?.error ?? 'No se pudo enviar');
      setEntrega(d.entrega); setEditando(false); setArchivo(null);
      onEntregada?.(d.entrega);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar');
    } finally {
      setEnviando(false);
    }
  };

  const est = entrega ? ESTADO[entrega.estado] : null;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
      <div className="flex items-start gap-2.5">
        <ClipboardList className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Tarea</div>
          <h4 className="font-semibold text-gray-900">{tarea.titulo}</h4>
        </div>
        {est && (
          <span className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1 flex-shrink-0 ${est.cls}`}>
            <est.Icon className="w-3.5 h-3.5" /> {est.t}
          </span>
        )}
      </div>

      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{tarea.instrucciones}</p>
      {tarea.imagen_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={tarea.imagen_url} alt="" className="rounded-xl border border-gray-200 max-h-64 object-contain bg-white" />
      )}

      {entrega?.comentario && (
        <div className="rounded-xl bg-white border border-gray-200 p-3 text-sm">
          <div className="text-xs font-semibold text-gray-500 mb-1">Comentario del docente</div>
          <p className="text-gray-700 whitespace-pre-line">{entrega.comentario}</p>
        </div>
      )}

      {entrega && !editando ? (
        <div className="rounded-xl bg-white border border-gray-200 p-3 text-sm space-y-2">
          <div className="text-xs font-semibold text-gray-500">Tu entrega · {new Date(entrega.enviada_at).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })}</div>
          {entrega.texto && <p className="text-gray-700 whitespace-pre-line">{entrega.texto}</p>}
          {entrega.archivo && (
            <a href={entrega.archivo.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-emerald-700 hover:underline">
              <Paperclip className="w-4 h-4" /> {entrega.archivo.nombre}
            </a>
          )}
          <div>
            <button onClick={() => setEditando(true)} className="text-xs font-medium text-gray-600 underline">
              {entrega.estado === 'por_corregir' ? 'Corregir y volver a enviar' : 'Editar mi entrega'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {tarea.permite_texto && (
            <textarea
              value={texto} onChange={(e) => setTexto(e.target.value)} rows={5} maxLength={10000}
              placeholder="Escribe tu respuesta"
              className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          )}
          {tarea.permite_archivo && (
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <Paperclip className="w-4 h-4" />
              <input type="file" className="text-sm" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                     accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.txt" />
              <span className="text-xs text-gray-400">PDF, Word, Excel, PowerPoint o imagen · máx. 10 MB</span>
            </label>
          )}
          {entrega?.archivo && !archivo && (
            <p className="text-xs text-gray-500">Si no adjuntas otro, se conserva «{entrega.archivo.nombre}».</p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              onClick={enviar} disabled={enviando || (!texto.trim() && !archivo && !entrega?.archivo)}
              className="px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-semibold disabled:opacity-40 flex items-center gap-1.5"
            >
              {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {entrega ? 'Volver a enviar' : 'Enviar tarea'}
            </button>
            {entrega && <button onClick={() => setEditando(false)} className="text-sm text-gray-500">Cancelar</button>}
          </div>
        </div>
      )}
    </div>
  );
}
