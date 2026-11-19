"use client";

// Revisión del consultor (el "30% humano", reunión con Eduardo del 2026-10-08).
// Gestor/admin ven todos los proyectos del Validador y dejan observaciones
// internas: lo que la máquina no ve. La empresa dueña del proyecto NO las ve.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Save, Lock, FileText, ChevronDown, Loader2 } from 'lucide-react';

interface Problema { actor?: string; dolor?: string; causa_raiz?: string; urgencia?: string; consecuencia?: string; unidad_validacion?: string }
interface PlanRevision {
  id: string; name: string; type: string; description: string | null;
  status: string; etapa: string | null; budget: number | null; duration: string | null;
  problema: Problema | null; mpp: { insumo?: string; subproductos?: { nombre: string }[] } | null;
  documentos: number; analizado: boolean; createdAt: string;
  madurez?: { trl: number | null; crl: number | null; fecha: string | null } | null;
  autor: { nombre: string | null; email: string; empresa: string | null };
  consultor: { notas: string | null; at: string | null; por: string | null };
}

const CAMPOS_PROBLEMA: [keyof Problema, string][] = [
  ['actor', 'Actor'], ['dolor', 'Dolor'], ['causa_raiz', 'Causa raíz'],
  ['urgencia', 'Urgencia'], ['consecuencia', 'Consecuencia'], ['unidad_validacion', 'Unidad de validación'],
];

export function RevisionConsultor() {
  const [planes, setPlanes] = useState<PlanRevision[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [filtro, setFiltro] = useState<'todos' | 'sin' | 'con'>('todos');
  const [abierto, setAbierto] = useState<string | null>(null);
  const [borradores, setBorradores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      const r = await fetch('/api/proxy/validator/revision', { credentials: 'include' });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d?.error ?? 'No se pudo cargar');
      setPlanes(d.plans ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar');
    } finally {
      setCargando(false);
    }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const guardar = async (p: PlanRevision) => {
    setGuardando(p.id);
    try {
      const r = await fetch(`/api/proxy/validator/revision/${p.id}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notas: borradores[p.id] ?? p.consultor.notas ?? '' }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d?.error ?? 'No se pudo guardar');
      setPlanes(ps => ps.map(x => x.id === p.id ? { ...x, consultor: d.consultor } : x));
      setBorradores(b => { const n = { ...b }; delete n[p.id]; return n; });
    } catch (e) {
      alert(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setGuardando(null);
    }
  };

  const visibles = useMemo(() => planes.filter(p => {
    const t = `${p.name} ${p.autor.nombre ?? ''} ${p.autor.email} ${p.autor.empresa ?? ''}`.toLowerCase();
    if (q && !t.includes(q.toLowerCase())) return false;
    if (filtro === 'sin') return !p.consultor.notas;
    if (filtro === 'con') return !!p.consultor.notas;
    return true;
  }), [planes, q, filtro]);

  const sinRevisar = planes.filter(p => !p.consultor.notas).length;

  return (
    <div className="px-8 py-6">
      <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 flex gap-2">
        <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <b>Observaciones internas del consultor.</b> Aquí va lo que el análisis automático no ve
          (el 30% humano). Solo las ven gestores y administradores; <b>la empresa no las ve</b>.
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Buscar por proyecto, persona o empresa"
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-full p-1 text-sm">
          {([['todos', `Todos ${planes.length}`], ['sin', `Sin revisar ${sinRevisar}`], ['con', `Revisados ${planes.length - sinRevisar}`]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setFiltro(k)}
              className={`px-3 py-1.5 rounded-full ${filtro === k ? 'bg-white shadow-sm text-gray-900 font-medium' : 'text-gray-500'}`}>{l}</button>
          ))}
        </div>
      </div>

      {cargando && <div className="py-12 text-center text-gray-400 text-sm"><Loader2 className="w-5 h-5 animate-spin inline mr-2" />Cargando proyectos…</div>}
      {error && <div className="py-6 text-center text-rose-600 text-sm">{error}</div>}
      {!cargando && !error && visibles.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">No hay proyectos con ese filtro.</div>}

      <div className="space-y-3">
        {visibles.map(p => {
          const open = abierto === p.id;
          const borrador = borradores[p.id] ?? p.consultor.notas ?? '';
          const cambiado = borrador.trim() !== (p.consultor.notas ?? '').trim();
          const camposProblema = p.problema ? CAMPOS_PROBLEMA.filter(([k]) => p.problema?.[k]) : [];
          return (
            <div key={p.id} className="bg-white border border-gray-200 rounded-2xl">
              <button onClick={() => setAbierto(open ? null : p.id)} className="w-full flex items-center gap-3 p-4 text-left">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{p.name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {p.autor.empresa || p.autor.nombre || p.autor.email} · {new Date(p.createdAt).toLocaleDateString('es-PE')} · {p.documentos} doc.
                    {p.etapa ? ` · ${p.etapa}` : ''}
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.consultor.notas ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {p.consultor.notas ? 'Revisado' : 'Sin revisar'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>

              {open && (
                <div className="px-4 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                  <div className="space-y-3 text-sm">
                    {p.description && <p className="text-gray-700">{p.description}</p>}
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Definición del problema</div>
                      {camposProblema.length ? (
                        <dl className="space-y-1">
                          {camposProblema.map(([k, l]) => (
                            <div key={k}><dt className="inline font-medium text-gray-800">{l}: </dt><dd className="inline text-gray-600">{p.problema?.[k]}</dd></div>
                          ))}
                        </dl>
                      ) : <p className="text-gray-400">La empresa aún no la completó.</p>}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Madurez (calculadora CONCYTEC)</div>
                      {p.madurez ? (
                        <p className="text-gray-600">{p.madurez.trl != null ? `TRL ${p.madurez.trl}` : 'TRL —'} · {p.madurez.crl != null ? `CRL ${p.madurez.crl}` : 'CRL —'}</p>
                      ) : <p className="text-gray-400">Sin calcular.</p>}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Máximo Producto Posible</div>
                      {p.mpp?.insumo ? (
                        <p className="text-gray-600"><b className="text-gray-800">{p.mpp.insumo}</b>{p.mpp.subproductos?.length ? ` → ${p.mpp.subproductos.map(s => s.nombre).join(', ')}` : ''}</p>
                      ) : <p className="text-gray-400">Sin completar.</p>}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {p.autor.nombre ?? '—'} · {p.autor.email} · {p.analizado ? 'con análisis' : 'sin análisis'}</div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Observaciones del consultor</label>
                    <textarea
                      value={borrador}
                      onChange={e => setBorradores(b => ({ ...b, [p.id]: e.target.value }))}
                      rows={7} maxLength={8000}
                      placeholder="Ej.: la causa raíz está mal identificada; falta contrapartida; el fondo B de ProInnóvate encaja mejor…"
                      className="mt-1 w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-xs text-gray-400">
                        {p.consultor.at ? `Última edición: ${p.consultor.por ?? ''} · ${new Date(p.consultor.at).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })}` : 'Sin observaciones aún'}
                      </span>
                      <button
                        onClick={() => guardar(p)} disabled={!cambiado || guardando === p.id}
                        className="px-4 py-2 bg-emerald-700 text-white rounded-full text-sm font-medium flex items-center gap-1.5 disabled:opacity-40"
                      >
                        {guardando === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
