'use client';

import { useState, useEffect, useMemo } from 'react';
import { Eye } from 'lucide-react';
import { StatsRepository, type SiteVisits } from '@/lib/repositories/stats-repository';

/* ═══════════════════════ VISITAS A LA WEB ═══════════════════════ */
// Cuánta gente llega, antes del embudo de activación. Los bots se muestran
// APARTE porque, si se sumaran, "visitas" dejaría de significar personas.
// Privacidad: sin cookies. El backend no guarda IP ni user-agent en claro, solo
// un seudónimo que rota cada día — por eso los "únicos" son únicos POR DÍA.

export function VisitsPanel() {
  const repo = useMemo(() => new StatsRepository(), []);
  const [data, setData] = useState<SiteVisits | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    repo.visits(days).then(d => { setData(d); setLoading(false); });
  }, [repo, days]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="text-sm text-gray-400">Cargando visitas…</div>
      </div>
    );
  }
  if (!data) return null;

  const maxDia = Math.max(1, ...data.by_day.map(d => d.visits));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <div className="flex items-start justify-between gap-4 mb-1 flex-wrap">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Visitas a la web</h2>
        </div>
        <div className="flex gap-1">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                days === d ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-5">
        Conteo propio, sin cookies ni datos personales.
      </p>

      {data.total === 0 ? (
        <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
          Aún no hay visitas registradas. El conteo empieza desde que se desplegó
          esta versión; no hay datos anteriores porque antes no se medía.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-2xl font-semibold text-gray-900">{data.period.toLocaleString('es-PE')}</div>
              <div className="text-xs text-gray-500">visitas · {days} días</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">{data.unique_visitors.toLocaleString('es-PE')}</div>
              <div className="text-xs text-gray-500">visitantes únicos</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">{data.total.toLocaleString('es-PE')}</div>
              <div className="text-xs text-gray-500">visitas históricas</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-400">{data.bots.toLocaleString('es-PE')}</div>
              <div className="text-xs text-gray-500">bots (no contados arriba)</div>
            </div>
          </div>

          {data.by_day.length > 0 && (
            <div className="mb-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Por día</div>
              <div className="flex items-end gap-1 h-24">
                {data.by_day.map(d => (
                  <div
                    key={d.day}
                    className="flex-1 bg-emerald-500 rounded-t min-h-[2px] hover:bg-emerald-600 transition-colors"
                    style={{ height: `${(d.visits / maxDia) * 100}%` }}
                    title={`${d.day}: ${d.visits} visitas · ${d.unique} únicos`}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Páginas más vistas</div>
              {data.top_paths.length === 0 ? (
                <div className="text-xs text-gray-400">Sin datos</div>
              ) : (
                <div className="space-y-1.5">
                  {data.top_paths.map(p => (
                    <div key={p.path} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-gray-700 truncate font-mono text-xs" title={p.path}>{p.path}</span>
                      <span className="text-gray-500 tabular-nums">{p.visits}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">De dónde llegan</div>
              {data.top_referrers.length === 0 ? (
                <div className="text-xs text-gray-400">
                  Sin referentes: llegan directo o el navegador no lo informa.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {data.top_referrers.map(r => (
                    <div key={r.host ?? '—'} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-gray-700 truncate">{r.host ?? '—'}</span>
                      <span className="text-gray-500 tabular-nums">{r.visits}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
