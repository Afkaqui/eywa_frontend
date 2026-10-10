"use client";

import { useCallback, useEffect, useState } from 'react';
import { Bot, Check, X, Pencil, ExternalLink, Loader2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

// Cola de revisión del verificador nocturno de fondos (PENDIENTES §16).
//
// El bot visita cada noche la página de cada fondo y PROPONE: fechas de cierre
// nuevas, enlaces rotos, enlaces de LinkedIn que no llevan al fondo. Nunca aplica
// una fecha por su cuenta (medido: las reglas confunden el cierre con la entrega de
// informes o con plazos de otros programas). Aquí el gestor decide, con la
// evidencia delante.

interface Pendiente {
  id: string;
  name: string;
  url: string | null;
  deadline: string | null;
  deadline_text: string | null;
  verify_status: string | null;
  verify_http: number | null;
  verified_at: string | null;
  detected_deadline: string | null;
  detected_evidence: string | null;
  review_reason: string | null;
}

interface Corrida {
  inicio: string;
  fin: string | null;
  revisados: number;
  marcados: number;
  errores: number;
}

const fecha = (s: string | null) =>
  s ? new Date(s).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '—';

export function FundsReviewPanel({ onEditar, onCambio }: {
  /** Abre el formulario de edición del fondo (para corregir la URL o la fecha a mano). */
  onEditar: (id: string) => void;
  /** Avisa al catálogo de que algo cambió y debe recargarse. */
  onCambio: () => void;
}) {
  const [datos, setDatos] = useState<{ corrida: Corrida | null; pendientes: Pendiente[] } | null>(null);
  const [abierto, setAbierto] = useState(true);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const r = await fetch('/api/proxy/funds/revision', { credentials: 'include' });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setDatos({ corrida: d.ultima_corrida ?? null, pendientes: d.pendientes ?? [] });
    } catch {
      setDatos({ corrida: null, pendientes: [] });
      setError('No se pudo cargar la cola de revisión');
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const resolver = async (p: Pendiente, accion: 'aceptar_fecha' | 'descartar') => {
    setOcupado(p.id); setError(null);
    try {
      const r = await fetch(`/api/proxy/funds/${p.id}/revision`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error ?? 'No se pudo guardar');
      setDatos((x) => x && { ...x, pendientes: x.pendientes.filter((y) => y.id !== p.id) });
      onCambio();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setOcupado(null);
    }
  };

  if (!datos) return null;
  const { corrida, pendientes } = datos;

  return (
    <div className="mb-5 border border-amber-200 bg-amber-50/50 rounded-xl">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-amber-700" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900">
            Verificador de fondos · {pendientes.length} pendiente{pendientes.length === 1 ? '' : 's'} de revisión
          </div>
          <div className="text-xs text-gray-500">
            {corrida
              ? <>Última revisión: {new Date(corrida.inicio).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })} · {corrida.revisados} fondos revisados{corrida.errores ? ` · ${corrida.errores} errores` : ''}</>
              : 'El verificador aún no ha corrido. Revisa el catálogo cada noche a las 23:00.'}
          </div>
        </div>
        {abierto ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {abierto && (
        <div className="px-4 pb-4 space-y-2">
          <p className="text-xs text-gray-500">
            El bot propone; tú decides. Ninguna fecha se aplica sin tu confirmación.
          </p>

          {error && (
            <div className="flex gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {error}
            </div>
          )}

          {pendientes.length === 0 && (
            <p className="text-sm text-gray-500 py-2">Nada pendiente. Todo lo que encontró el verificador ya está resuelto.</p>
          )}

          {pendientes.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900">{p.name}</div>
                  <div className="text-xs text-amber-800 mt-0.5">{p.review_reason}</div>
                </div>
                {p.url && (
                  <a href={p.url} target="_blank" rel="noopener noreferrer"
                     className="text-xs text-gray-500 hover:text-emerald-700 inline-flex items-center gap-1 flex-shrink-0">
                    Abrir página <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {p.detected_deadline && (
                <div className="mt-2 text-xs">
                  <div className="flex gap-4 text-gray-600">
                    <span>Registrada: <strong>{p.deadline ? fecha(p.deadline) : (p.deadline_text || 'sin fecha')}</strong></span>
                    <span>Propuesta: <strong className="text-emerald-700">{fecha(p.detected_deadline)}</strong></span>
                  </div>
                  {p.detected_evidence && (
                    <blockquote className="mt-1.5 border-l-2 border-gray-300 pl-2 text-gray-500 italic">
                      «{p.detected_evidence}»
                    </blockquote>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                {p.detected_deadline && (
                  <button
                    onClick={() => resolver(p, 'aceptar_fecha')}
                    disabled={ocupado === p.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {ocupado === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Aceptar {fecha(p.detected_deadline)}
                  </button>
                )}
                <button
                  onClick={() => onEditar(p.id)}
                  disabled={ocupado === p.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  <Pencil className="w-3.5 h-3.5" /> Corregir a mano
                </button>
                <button
                  onClick={() => resolver(p, 'descartar')}
                  disabled={ocupado === p.id}
                  title="El verificador no volverá a proponer esto"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" /> Descartar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
