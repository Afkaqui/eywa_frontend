"use client";

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Search, ChevronDown, ChevronUp } from 'lucide-react';

// Glosario (PLAN C3). La fuente es la API (/api/public/v1/glosario), la misma que
// usa EYWA Agro: un término se corrige en un solo lugar.

interface Termino { termino: string; sigla?: string; categoria: string; definicion: string }

export function GlosarioPanel() {
  const [datos, setDatos] = useState<{ estado: string; terminos: Termino[] } | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    fetch('/api/public/v1/glosario').then((r) => (r.ok ? r.json() : null)).then(setDatos).catch(() => setDatos(null));
  }, []);

  const grupos = useMemo(() => {
    const t = (datos?.terminos ?? []).filter((x) =>
      !q || `${x.termino} ${x.sigla ?? ''} ${x.definicion}`.toLowerCase().includes(q.toLowerCase()));
    return t.reduce<Record<string, Termino[]>>((g, x) => ((g[x.categoria] ??= []).push(x), g), {});
  }, [datos, q]);

  if (!datos) return null;

  return (
    <div className="mt-8 bg-white border border-gray-200 rounded-xl">
      <button onClick={() => setAbierto((v) => !v)} className="w-full flex items-center gap-3 px-6 py-4 text-left">
        <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center"><BookOpen className="w-4 h-4 text-emerald-600" /></div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Glosario</div>
          <div className="text-xs text-gray-500">{datos.terminos.length} términos: MPP, IMI, TRL, quíntuple hélice, financiamiento combinado, EUDR…</div>
        </div>
        {abierto ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {abierto && (
        <div className="px-6 pb-6">
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">{datos.estado}</p>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar término…"
                   className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          {Object.entries(grupos).map(([cat, ts]) => (
            <div key={cat} className="mb-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{cat}</div>
              <dl className="space-y-3">
                {ts.map((t) => (
                  <div key={t.termino}>
                    <dt className="text-sm font-medium text-gray-900">{t.termino}{t.sigla ? <span className="text-emerald-700"> · {t.sigla}</span> : null}</dt>
                    <dd className="text-sm text-gray-600">{t.definicion}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
          {Object.keys(grupos).length === 0 && <p className="text-sm text-gray-500">Ningún término coincide.</p>}
        </div>
      )}
    </div>
  );
}
