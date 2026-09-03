"use client";

import { useState } from 'react';
import { Send, Loader2, ExternalLink, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ValidatorRepository, type ProjectPlanRow } from '@/lib/repositories/validator-repository';

const repo = new ValidatorRepository();

// Envío de un proyecto a la cartera de ARS LAB para su prevalidación MAVII.
//
// El envío manda a un TERCERO el nombre, correo, teléfono, organización y RUC de
// quien presenta el proyecto. Por eso la casilla no es un trámite: mientras no
// esté marcada, el botón no existe. El backend además comprueba el consentimiento
// registrado y no se fía de lo que llegue en la petición.

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
  const [acepta, setAcepta]     = useState(!!mavi?.consentido);
  const [guardando, setGuard]   = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const yaEnviado = !!mavi?.id_proyecto;

  const marcar = async (v: boolean) => {
    setAcepta(v); setGuard(true); setError(null);
    try {
      await repo.setMaviConsent(plan.id, v);
    } catch {
      setAcepta(!v); // no se pudo registrar: la casilla vuelve donde estaba
      setError('No se pudo guardar tu autorización');
    } finally {
      setGuard(false);
    }
  };

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
            Prevalidación automática de ARS LAB. El dictamen final lo emite su equipo.
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
            es lo que cita al escribirle a ARS. */}
        {mavi?.id_proyecto && (
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Referencia en ARS LAB
            </div>
            <code className="text-xs font-mono text-gray-700 bg-gray-100 rounded-lg px-2.5 py-1.5 inline-block break-all">
              {mavi.id_proyecto}
            </code>
          </div>
        )}

        {/* El enlace que devuelve ARS NO lleva al proyecto: redirige a la portada
            de su intranet y pide una cuenta de ARS LAB, que quien presenta el
            proyecto no tiene. Se deja, pero diciendo lo que es: llamarlo "ver en
            la cartera" hacía creer que se podía entrar. */}
        {mavi?.seguimiento && (
          <a
            href={mavi.seguimiento} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 hover:underline"
          >
            Panel interno de ARS LAB (requiere cuenta suya)
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  }

  // ── Todavía no enviado ─────────────────────────────────────────────────────
  return (
    <div className="border border-gray-200 rounded-2xl p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900">Enviar a ARS LAB</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          Su metodología MAVII prevalida el proyecto y te dice si es postulable.
        </p>
      </div>

      <label className="flex gap-3 items-start cursor-pointer bg-gray-50 border border-gray-200 rounded-xl p-4">
        <input
          type="checkbox"
          checked={acepta}
          disabled={guardando}
          onChange={e => marcar(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-emerald-600 shrink-0"
        />
        <span className="text-sm text-gray-700 leading-relaxed">
          Autorizo a EYWA a compartir con <strong>ARS LAB</strong> los datos de este
          proyecto y mis datos de contacto —nombre, correo, teléfono, organización
          y RUC— para su evaluación. Puedo retirar esta autorización mientras el
          proyecto no se haya enviado.
        </span>
      </label>

      {error && (
        <div className="flex gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={enviar}
        disabled={!acepta || enviando || guardando}
        className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium
                   hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed
                   inline-flex items-center justify-center gap-2"
      >
        {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {enviando ? 'Enviando…' : 'Enviar a MAVI'}
      </button>

      {!acepta && (
        <p className="text-xs text-gray-400 text-center">
          Marca la autorización para poder enviarlo.
        </p>
      )}
    </div>
  );
}
