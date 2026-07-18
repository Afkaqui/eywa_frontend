"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search, Loader2, Landmark, ExternalLink, ChevronDown, ChevronUp,
  Lock, CalendarClock, Globe2, MapPin, Plus, Pencil, Trash2, X, Target,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Fund } from '@/lib/types/database';

// Catálogo de Fondos (matriz Neo) — solo Premium o gestor+.
// Los free ven un teaser honesto con los conteos reales (GET /summary).

// Etiquetas temáticas (taxonomía EYWA). Espejo de lib/sector-tags.ts del backend.
const TAG_LABELS: Record<string, string> = {
  clima: 'Clima y carbono', ambiente: 'Medio ambiente y biodiversidad', agua: 'Agua y océanos',
  agro: 'Agro y alimentación', energia: 'Energía', circular: 'Economía circular',
  salud: 'Salud', educacion: 'Educación', tecnologia: 'Tecnología e IA',
  finanzas: 'Finanzas e inclusión financiera', emprendimiento: 'Emprendimiento y MYPE',
  innovacion: 'Ciencia e innovación', genero: 'Género', inclusion: 'Inclusión social y derechos',
  gobernanza: 'Gobernanza y transparencia', movilidad: 'Turismo y movilidad',
  cultura: 'Cultura y creatividad', multisectorial: 'Multisectorial',
};
const TAG_KEYS = Object.keys(TAG_LABELS);

type State =
  | { status: 'loading' }
  | { status: 'ok'; funds: Fund[]; myTags: string[]; mySector: string | null }
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
  const [tag, setTag] = useState('todos');
  const [onlyMine, setOnlyMine] = useState(false); // solo los que encajan con mi sector
  const [hideClosed, setHideClosed] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // CRUD del catálogo (solo gestor/admin/superadmin)
  const { profile } = useAuth();
  const canManage = ['gestor', 'admin', 'superadmin'].includes(profile?.role ?? '');
  const [editing, setEditing] = useState<Fund | 'new' | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/proxy/funds', { credentials: 'include' });
      if (res.status === 403) {
        // Sin premium: teaser con conteos reales
        const s = await fetch('/api/proxy/funds/summary', { credentials: 'include' })
          .then(r => (r.ok ? r.json() : null)).catch(() => null);
        setState({
          status: 'forbidden',
          total: s?.total ?? 0,
          nacionales: s?.nacionales ?? 0,
          internacionales: s?.internacionales ?? 0,
        });
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setState({
        status: 'ok',
        funds:  Array.isArray(data?.funds) ? data.funds : [],
        myTags: Array.isArray(data?.my_tags) ? data.my_tags : [],
        mySector: data?.my_sector ?? null,
      });
    } catch {
      setState({ status: 'error' });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (f: Fund) => {
    if (!confirm(`¿Eliminar "${f.name}" del catálogo?`)) return;
    setBusyId(f.id);
    try {
      const res = await fetch(`/api/proxy/funds/${f.id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error();
      await load();
    } catch {
      alert('No se pudo eliminar el fondo');
    } finally {
      setBusyId(null);
    }
  };

  const tipos = useMemo(() => {
    if (state.status !== 'ok') return [];
    return Array.from(new Set(state.funds.map(f => f.instrument_type))).sort();
  }, [state]);

  // ¿Este fondo encaja con mi industria? (match exacto por etiquetas;
  // los multisectoriales aplican a todos)
  const matchesMe = useCallback((f: Fund, myTags: string[]) => {
    if (!myTags.length) return false;
    return (f.sector_tags ?? []).some(t => myTags.includes(t) || t === 'multisectorial');
  }, []);

  const filtered = useMemo(() => {
    if (state.status !== 'ok') return [];
    const q = search.toLowerCase();
    return state.funds.filter(f => {
      if (scope !== 'todos' && f.scope !== scope) return false;
      if (tipo !== 'todos' && f.instrument_type !== tipo) return false;
      if (tag !== 'todos' && !(f.sector_tags ?? []).includes(tag)) return false;
      if (onlyMine && !matchesMe(f, state.myTags)) return false;
      if (hideClosed && fmtDeadline(f).closed) return false;
      if (q && !(
        f.name.toLowerCase().includes(q) ||
        (f.sectors ?? '').toLowerCase().includes(q) ||
        (f.sector_tags ?? []).some(t => (TAG_LABELS[t] ?? t).toLowerCase().includes(q)) ||
        (f.eligible_profile ?? '').toLowerCase().includes(q) ||
        f.instrument_type.toLowerCase().includes(q)
      )) return false;
      return true;
    });
  }, [state, search, scope, tipo, tag, onlyMine, hideClosed, matchesMe]);

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
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="todos">Tema: todos</option>
          {TAG_KEYS.filter(k => state.funds.some(f => (f.sector_tags ?? []).includes(k)))
            .map(k => <option key={k} value={k}>{TAG_LABELS[k]}</option>)}
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
        {canManage && (
          <button
            onClick={() => setEditing('new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar fondo
          </button>
        )}
      </div>

      {/* Match con mi industria (solo si la organización tiene sector definido) */}
      {state.myTags.length > 0 && (
        <button
          onClick={() => setOnlyMine(v => !v)}
          className={`w-full mb-4 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm transition-colors text-left ${
            onlyMine
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          <Target className={`w-4 h-4 flex-shrink-0 ${onlyMine ? 'text-emerald-600' : 'text-gray-400'}`} />
          <span className="flex-1">
            <strong>{state.funds.filter(f => matchesMe(f, state.myTags)).length}</strong> fondos
            encajan con tu industria{state.mySector ? ` (${state.mySector})` : ''}
            <span className="text-xs text-gray-400 ml-1.5">
              · temas: {state.myTags.map(t => TAG_LABELS[t] ?? t).join(', ')}
            </span>
          </span>
          <span className={`text-xs font-semibold ${onlyMine ? 'text-emerald-700' : 'text-gray-400'}`}>
            {onlyMine ? 'Mostrando solo estos' : 'Ver solo estos'}
          </span>
        </button>
      )}

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
                  <div className="flex items-center gap-1.5 flex-wrap mt-1">
                    {(f.sector_tags ?? []).map(t => {
                      const mine = state.myTags.includes(t) || t === 'multisectorial' && state.myTags.length > 0;
                      return (
                        <span
                          key={t}
                          title={mine ? 'Coincide con tu industria' : undefined}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            mine ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {TAG_LABELS[t] ?? t}
                        </span>
                      );
                    })}
                    {(f.sector_tags ?? []).length === 0 && (
                      <span className="text-xs text-gray-400 truncate">{f.sectors || 'Sin tema'}</span>
                    )}
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
                  {f.sectors && (
                    <p><span className="font-medium text-gray-700">Sectores (fuente):</span>{' '}
                      <span className="text-gray-600">{f.sectors}</span></p>
                  )}
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
                  <div className="flex items-center gap-4 pt-1">
                    {f.url && (
                      <a
                        href={f.url.startsWith('http') ? f.url : `https://${f.url}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Ir a la convocatoria <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {canManage && (
                      <>
                        <button
                          onClick={() => setEditing(f)}
                          disabled={busyId === f.id}
                          className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800 disabled:opacity-50"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Editar
                        </button>
                        <button
                          onClick={() => handleDelete(f)}
                          disabled={busyId === f.id}
                          className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Eliminar
                        </button>
                      </>
                    )}
                  </div>
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

      {editing && (
        <FundFormModal
          fund={editing === 'new' ? null : editing}
          existingTypes={tipos}
          onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await load(); }}
        />
      )}
    </div>
  );
}

// ── Modal de crear/editar fondo (gestor+) ─────────────────────────────────────
function FundFormModal({ fund, existingTypes, onClose, onSaved }: {
  fund: Fund | null;
  existingTypes: string[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    scope:            fund?.scope ?? 'nacional',
    name:             fund?.name ?? '',
    instrument_type:  fund?.instrument_type ?? '',
    eligible_profile: fund?.eligible_profile ?? '',
    sectors:          fund?.sectors ?? '',
    sector_tags:      (fund?.sector_tags ?? []) as string[],
    amounts:          fund?.amounts ?? '',
    deadline:         fund?.deadline ? fund.deadline.slice(0, 10) : '',
    deadline_text:    fund?.deadline_text ?? '',
    checklist:        fund?.checklist ?? '',
    url:              fund?.url ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));
  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1';

  const save = async () => {
    if (!form.name.trim() || !form.instrument_type.trim()) {
      setError('Nombre y tipo de instrumento son obligatorios');
      return;
    }
    setSaving(true); setError(null);
    try {
      const payload = {
        scope:            form.scope,
        name:             form.name,
        instrument_type:  form.instrument_type,
        eligible_profile: form.eligible_profile || null,
        sectors:          form.sectors || null,
        sector_tags:      form.sector_tags,
        amounts:          form.amounts || null,
        deadline:         form.deadline || null,
        deadline_text:    form.deadline_text || null,
        checklist:        form.checklist || null,
        url:              form.url || null,
      };
      const res = await fetch(fund ? `/api/proxy/funds/${fund.id}` : '/api/proxy/funds', {
        method: fund ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'No se pudo guardar');
      await onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {fund ? 'Editar fondo' : 'Agregar fondo al catálogo'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Ámbito *</label>
              <select value={form.scope} onChange={e => set('scope', e.target.value)} className={inputCls}>
                <option value="nacional">Nacional</option>
                <option value="internacional">Internacional</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Tipo de instrumento *</label>
              <input
                list="fund-types" value={form.instrument_type}
                onChange={e => set('instrument_type', e.target.value)}
                placeholder="Fondo/Grant, Fellowship, Venture…" className={inputCls}
              />
              <datalist id="fund-types">
                {existingTypes.map(t => <option key={t} value={t} />)}
              </datalist>
            </div>
          </div>

          <div>
            <label className={labelCls}>Nombre del fondo / convocatoria *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Perfil elegible</label>
            <textarea value={form.eligible_profile} onChange={e => set('eligible_profile', e.target.value)} rows={2} className={`${inputCls} resize-none`} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Sectores</label>
              <input value={form.sectors} onChange={e => set('sectors', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Montos</label>
              <input value={form.amounts} onChange={e => set('amounts', e.target.value)} placeholder="USD 50,000 / Asistencia técnica…" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Cierre (fecha concreta)</label>
              <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Cierre (texto, si no hay fecha)</label>
              <input value={form.deadline_text} onChange={e => set('deadline_text', e.target.value)} placeholder="Por convocatoria, Abierto…" className={inputCls} disabled={Boolean(form.deadline)} />
              {form.deadline && <p className="text-[10px] text-gray-400 mt-1">Se usa la fecha; borra la fecha para usar texto.</p>}
            </div>
          </div>

          {/* Etiquetas temáticas: son la base del match con las empresas */}
          <div>
            <label className={labelCls}>
              Temas <span className="font-normal text-gray-400">— con esto se hace el match con las empresas</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {TAG_KEYS.map(k => {
                const active = form.sector_tags.includes(k);
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setForm(p => ({
                      ...p,
                      sector_tags: active ? p.sector_tags.filter(t => t !== k) : [...p.sector_tags, k],
                    }))}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'
                    }`}
                  >
                    {TAG_LABELS[k]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className={labelCls}>Checklist (evidencia Gate 0)</label>
            <textarea value={form.checklist} onChange={e => set('checklist', e.target.value)} rows={2} className={`${inputCls} resize-none`} />
          </div>

          <div>
            <label className={labelCls}>URL de la convocatoria</label>
            <input value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://…" className={inputCls} />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
          <button onClick={onClose} disabled={saving} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-white disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={save} disabled={saving} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {fund ? 'Guardar cambios' : 'Agregar fondo'}
          </button>
        </div>
      </div>
    </div>
  );
}
