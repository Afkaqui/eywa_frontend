"use client";

import { useState } from 'react';
import { Send, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ValidatorRepository, type ProjectPlanRow } from '@/lib/repositories/validator-repository';

const repo = new ValidatorRepository();

// Evaluación del proyecto con MAVI, el modelo de evaluación de EYWA (no conserva
// los datos). El consentimiento es UNO solo: el que la persona dio al aceptar los
// términos al crear su cuenta (decisión 2026-11-19). Ya no hay casilla por proyecto.

const SEMAFORO: Record<string, { fondo: string; texto: string; etiqueta: string }> = {
  verde:    { fondo: 'bg-emerald-50 border-emerald-200', texto: 'text-emerald-800', etiqueta: 'Viable' },
  amarillo: { fondo: 'bg-amber-50 border-amber-200',     texto: 'text-amber-900',   etiqueta: 'Con reservas' },
  rojo:     { fondo: 'bg-red-50 border-red-200',         texto: 'text-red-800',     etiqueta: 'No viable' },
};

const NOMBRE_DOC: Record<string, string> = {
  plan_negocio:      'Plan de negocio',
  modelo_financiero: 'Modelo financiero',
  estudio_mercado:   'Estudio de mercado',
  legal:             'Documentación legal',
};

export function MaviPanel({ plan, onActualizar }: {
  plan: ProjectPlanRow;
  onActualizar: (p: ProjectPlanRow) => void;
}) {
  const mavi = plan.mavi;
  const [enviando, setEnviando] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const yaEnviado = !!mavi?.id_proyecto;

  const enviar = async () => {
    setEnviando(true); setError(null);
    try {
      onActualizar(await repo.sendToMavi(plan.id));
    } catch (e) {
      // El backend devuelve el detalle real del 422 de MAVI (qué campo falla),
      // que es justo lo que hay que leer para corregirlo.
      setError(e instanceof Error ? e.message : 'No se pudo enviar el proyecto');
    } finally {
      setEnviando(false);
    }
  };

  // ── Ya enviado: se muestra lo que contestó MAVI ────────────────────────────
  if (yaEnviado) {
    const s = SEMAFORO[mavi?.semaforo ?? ''] ?? {
      fondo: 'bg-gray-50 border-gray-200', texto: 'text-gray-700', etiqueta: mavi?.semaforo ?? '—',
    };
    return (
      <div className="border border-gray-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <h3 className="font-semibold text-gray-900">Enviado a MAVI</h3>
          {mavi?.enviado_at && (
            <span className="text-xs text-gray-400">
              {new Date(mavi.enviado_at).toLocaleDateString('es-ES')}
            </span>
          )}
        </div>

        <div className={`rounded-xl border p-4 ${s.fondo}`}>
          <div className="flex items-baseline gap-3">
            <span className={`text-3xl font-light ${s.texto}`}>
              {mavi?.score != null ? Math.round(mavi.score * 100) : '—'}
              <span className="text-base">/100</span>
            </span>
            <span className={`text-sm font-medium ${s.texto}`}>{s.etiqueta}</span>
          </div>
          {mavi?.decision && (
            <p className={`text-sm mt-1.5 ${s.texto}`}>
              Decisión sugerida: <strong>{mavi.decision}</strong>
            </p>
          )}
          {/* Es una prevalidación automática, no un dictamen: conviene decirlo. */}
          <p className="text-xs text-gray-500 mt-2">
            Es una prevalidación automática de MAVI, no un dictamen final.
          </p>
        </div>

        {!!mavi?.pendientes?.length && (
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Documentos que te piden
            </div>
            <div className="flex flex-wrap gap-1.5">
              {mavi.pendientes.map(d => (
                <span key={d} className="px-2.5 py-1 rounded-lg bg-gray-100 text-xs text-gray-700">
                  {NOMBRE_DOC[d] ?? d}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* La referencia es lo ÚNICO accionable para quien presenta el proyecto:
            es lo que se cita al consultar por el proyecto. */}
        {mavi?.id_proyecto && (
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Referencia en MAVI
            </div>
            <code className="text-xs font-mono text-gray-700 bg-gray-100 rounded-lg px-2.5 py-1.5 inline-block break-all">
              {mavi.id_proyecto}
            </code>
          </div>
        )}

      </div>
    );
  }

  // ── Todavía no enviado ─────────────────────────────────────────────────────
  return (
    <div className="border border-gray-200 rounded-2xl p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900">Evaluar con MAVI</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          MAVI, el modelo de evaluación de EYWA, prevalida el proyecto y te dice si es postulable.
        </p>
      </div>

      {error && (
        <div className="flex gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={enviar}
        disabled={enviando}
        className="w-full py-2.5 rounded-full bg-gray-900 text-white text-sm font-medium
                   hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed
                   inline-flex items-center justify-center gap-2"
      >
        {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {enviando ? 'Enviando…' : 'Enviar a MAVI'}
      </button>

    </div>
  );
}
