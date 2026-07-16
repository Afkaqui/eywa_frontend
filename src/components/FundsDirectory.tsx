"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  Search, Loader2, Landmark, ExternalLink, ChevronDown, ChevronUp,
  Lock, CalendarClock, Globe2, MapPin,
} from 'lucide-react';
import type { Fund } from '@/lib/types/database';

// Catálogo de Fondos (matriz Neo) — solo Premium o gestor+.
// Los free ven un teaser honesto con los conteos reales (GET /summary).

type State =
  | { status: 'loading' }
  | { status: 'ok'; funds: Fund[] }
  | { status: 'forbidden'; total: number; nacionales: number; internacionales: number }
  | { status: 'error' };

function fmtDeadline(f: Fund): { label: string; closed: boolean } {
  if (f.deadline) {
    const d = new Date(f.deadline);
    const closed = d.getTime() < Date.now() - 24 * 3600 * 1000;
    return {
      label: d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }),
      closed,
    };
  }
  return { label: f.deadline_text || 'Sin fecha', closed: false };
}

export function FundsDirectory({ embedded = false }: { embedded?: boolean }) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState<'todos' | 'nacional' | 'internacional'>('todos');
  const [tipo, setTipo] = useState('todos');
  const [hideClosed, setHideClosed] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/proxy/funds', { credentials: 'include' });
        if (res.status === 403) {
          // Sin premium: teaser con conteos reales
          const s = await fetch('/api/proxy/funds/summary', { credentials: 'include' })
            .then(r => (r.ok ? r.json() : null)).catch(() => null);
          if (alive) setState({
            status: 'forbidden',
            total: s?.total ?? 0,
            nacionales: s?.nacionales ?? 0,
            internacionales: s?.internacionales ?? 0,
          });
          return;
        }
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (alive) setState({ status: 'ok', funds: Array.isArray(data?.funds) ? data.funds : [] });
      } catch {
        if (alive) setState({ status: 'error' });
      }
    })();
    return () => { alive = false; };
  }, []);

  const tipos = useMemo(() => {
    if (state.status !== 'ok') return [];
    return Array.from(new Set(state.funds.map(f => f.instrument_type))).sort();
  }, [state]);

  const filtered = useMemo(() => {
    if (state.status !== 'ok') return [];
    const q = search.toLowerCase();
    return state.funds.filter(f => {
      if (scope !== 'todos' && f.scope !== scope) return false;
      if (tipo !== 'todos' && f.instrument_type !== tipo) return false;
      if (hideClosed && fmtDeadline(f).closed) return false;
      if (q && !(
        f.name.toLowerCase().includes(q) ||
        (f.sectors ?? '').toLowerCase().includes(q) ||
        (f.eligible_profile ?? '').toLowerCase().includes(q) ||
        f.instrument_type.toLowerCase().includes(q)
      )) return false;
      return true;
    });
  }, [state, search, scope, tipo, hideClosed]);

  if (state.status === 'loading') {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  // ── Teaser para usuarios free ────────────────────────────────────────────────
  if (state.status === 'forbidden') {
    return (
      <div className="border border-dashed border-gray-300 rounded-2xl p-10 text-center bg-gray-50/60">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Catálogo de Fondos · Plan Premium</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-5">
          {state.total > 0
            ? <>Accede a <strong>{state.total} oportunidades de financiamiento</strong> curadas
              ({state.nacionales} nacionales y {state.internacionales} internacionales): grants,
              fellowships, blended finance y venture, con perfil elegible, montos y fechas de cierre.</>
            : 'Accede al catálogo curado de oportunidades de financiamiento.'}
        </p>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium">
          Disponible con Plan Premium
        </span>
      </div>
    );
  }

  if (state.status === 'error') {
    return <div className="text-center py-12 text-sm text-gray-500">No se pudo cargar el catálogo. Intenta de nuevo.</div>;
  }

  return (
    <div className={embedded ? '' : 'bg-white border border-gray-200 rounded-xl p-6'}>
      {/* Filtros */}
      <div className="flex flex-col lg:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar fondo, sector, perfil…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value as typeof scope)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="todos">Ámbito: todos</option>
          <option value="nacional">Nacional</option>
          <option value="internacional">Internacional</option>
        </select>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="todos">Instrumento: todos</option>
          {tipos.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600 px-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hideClosed}
            onChange={(e) => setHideClosed(e.target.checked)}
            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          Ocultar cerrados
        </label>
      </div>

      <div className="text-xs text-gray-400 mb-3">
        {filtered.length} de {state.funds.length} fondos
      </div>

      {/* Listado */}
      <div className="space-y-2">
        {filtered.map((f) => {
          const dl = fmtDeadline(f);
          const isOpen = expanded === f.id;
          return (
            <div key={f.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : f.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <Landmark className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900">{f.name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide flex items-center gap-1 ${
                      f.scope === 'nacional' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                    }`}>
                      {f.scope === 'nacional' ? <MapPin className="w-2.5 h-2.5" /> : <Globe2 className="w-2.5 h-2.5" />}
                      {f.scope}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                      {f.instrument_type}
                    </span>
                    {dl.closed && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-gray-200 text-gray-500">
                        Cerrado
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-0.5">
                    {f.sectors || 'Sectores no especificados'}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <div className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                    <CalendarClock className="w-3.5 h-3.5" />
                    <span className={dl.closed ? 'line-through text-gray-400' : ''}>{dl.label}</span>
                  </div>
                  {f.amounts && <div className="text-xs font-medium text-gray-700 mt-0.5 max-w-[180px] truncate">{f.amounts}</div>}
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-gray-100 bg-gray-50/50 text-sm space-y-2">
                  {f.eligible_profile && (
                    <p><span className="font-medium text-gray-700">Perfil elegible:</span>{' '}
                      <span className="text-gray-600">{f.eligible_profile}</span></p>
                  )}
                  {f.amounts && (
                    <p><span className="font-medium text-gray-700">Montos:</span>{' '}
                      <span className="text-gray-600">{f.amounts}</span></p>
                  )}
                  {f.checklist && (
                    <p><span className="font-medium text-gray-700">Checklist (Gate 0):</span>{' '}
                      <span className="text-gray-600">{f.checklist}</span></p>
                  )}
                  {f.url && (
                    <a
                      href={f.url.startsWith('http') ? f.url : `https://${f.url}`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Ir a la convocatoria <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-sm text-gray-500">
            Ningún fondo coincide con los filtros.
          </div>
        )}
      </div>
    </div>
  );
}
