"use client";

// Madurez tecnológica y comercial del proyecto según la metodología del CONCYTEC.
// UNANCHA NO calcula su propia escala: la calculadora oficial (Vincúlate) se basa en
// una metodología adaptada de NYSERDA, Horizonte 2020 y la NASA y en consultorías
// del CONCYTEC. Aquí se abre la calculadora y se registra el resultado, que
// alimenta el análisis del Validador. El CONCYTEC lo presenta como referencial.

import { useState } from 'react';
import { ChevronDown, ChevronUp, Gauge, ExternalLink, Loader2 } from 'lucide-react';
import { ValidatorRepository, type ProjectPlanRow } from '@/lib/repositories/validator-repository';
import { CALCULADORA_CONCYTEC_URL, NIVELES_CONCYTEC_URL } from '@/lib/constants/concytec';

const repo = new ValidatorRepository();
const NIVELES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function MadurezConcytec({ plan, onActualizar }: { plan: ProjectPlanRow; onActualizar: (p: ProjectPlanRow) => void }) {
  const m = plan.madurez;
  const [abierto, setAbierto] = useState(false);
  const [trl, setTrl] = useState<string>(m?.trl != null ? String(m.trl) : '');
  const [crl, setCrl] = useState<string>(m?.crl != null ? String(m.crl) : '');
  const [fecha, setFecha] = useState<string>(m?.fecha ? m.fecha.slice(0, 10) : new Date().toLocaleDateString('en-CA')); // fecha LOCAL (Perú), no UTC
  const [nota, setNota] = useState<string>(m?.nota ?? '');
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);

  const guardar = async () => {
    setGuardando(true); setMsg(null);
    try {
      onActualizar(await repo.saveMadurez(plan.id, {
        trl: trl ? Number(trl) : null, crl: crl ? Number(crl) : null, fecha: fecha || null, nota: nota.trim() || null,
      }));
      setMsg({ ok: true, t: 'Guardado. Se tendrá en cuenta en el próximo análisis.' });
    } catch (e) {
      setMsg({ ok: false, t: e instanceof Error ? e.message : 'No se pudo guardar' });
    } finally {
      setGuardando(false);
    }
  };

  const sel = 'mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500';

  return (
    <div className="border border-gray-200 rounded-xl">
      <button onClick={() => setAbierto((v) => !v)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
        <Gauge className="w-4 h-4 text-emerald-600" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-900">Madurez tecnológica y comercial (CONCYTEC)</div>
          <div className="text-xs text-gray-500">
            {m && (m.trl != null || m.crl != null)
              ? `${m.trl != null ? `TRL ${m.trl}` : 'TRL —'} · ${m.crl != null ? `CRL ${m.crl}` : 'CRL —'}${m.fecha ? ` · calculado el ${new Date(m.fecha).toLocaleDateString('es-PE', { timeZone: 'UTC' })}` : ''}`
              : 'Sin calcular: usa la calculadora oficial del CONCYTEC'}
          </div>
        </div>
        {abierto ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {abierto && (
        <div className="px-4 pb-4 space-y-4">
          <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 space-y-2">
            <p>
              El nivel de madurez se calcula con la <b>escala del CONCYTEC para el SINACYT</b> (R. P. 020-2022-CONCYTEC-P):
              el <b>TRL</b> va de 1 a 9 (investigación básica → aplicada → desarrollo tecnológico → innovación) y el
              <b>CRL</b>, también de 1 a 9, es un complemento <b>opcional</b> para emprendimientos con un TRL elevado
              e información de mercado. Su resultado es orientador y referencial.{' '}
              <a href={NIVELES_CONCYTEC_URL} target="_blank" rel="noopener noreferrer" className="underline text-emerald-700">Ver los niveles</a>
            </p>
            <ol className="list-decimal ml-4 space-y-0.5">
              <li>Abre la calculadora, registra tu proyecto y responde sus preguntas.</li>
              <li>Anota aquí el TRL y el CRL que te dio.</li>
            </ol>
            <a href={CALCULADORA_CONCYTEC_URL} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 text-white font-medium hover:bg-emerald-700">
              Abrir la calculadora del CONCYTEC <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-gray-700">TRL obtenido</span>
              <select value={trl} onChange={(e) => setTrl(e.target.value)} className={sel}>
                <option value="">—</option>
                {NIVELES.map((n) => <option key={n} value={n}>TRL {n}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700">CRL obtenido</span>
              <select value={crl} onChange={(e) => setCrl(e.target.value)} className={sel}>
                <option value="">— (no aplica)</option>
                {NIVELES.map((n) => <option key={n} value={n}>CRL {n}</option>)}
              </select>
            </label>
            <label className="block col-span-2 md:col-span-1">
              <span className="text-xs font-medium text-gray-700">Fecha del cálculo</span>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={sel} />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-medium text-gray-700">Código o enlace del resultado (opcional)</span>
            <input value={nota} onChange={(e) => setNota(e.target.value)} maxLength={500}
                   placeholder="Para que el consultor pueda revisarlo" className={sel} />
          </label>

          <div className="flex items-center gap-3">
            <button onClick={guardar} disabled={guardando}
                    className="px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-medium disabled:opacity-50 flex items-center gap-1.5">
              {guardando && <Loader2 className="w-4 h-4 animate-spin" />} Guardar
            </button>
            {msg && <span className={`text-xs ${msg.ok ? 'text-emerald-700' : 'text-red-600'}`}>{msg.t}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
