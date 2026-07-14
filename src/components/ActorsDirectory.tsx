"use client";

import { useState, useEffect, useMemo } from 'react';
import { ActorRepository, type Actor, type ActorCategory } from '@/lib/repositories/actor-repository';
import {
  Search, Filter, Globe, Building2, Landmark, Users2, Sprout, Banknote,
  MapPin, Link2, Mail, User, X, Loader2, Network, Tag, Layers,
} from 'lucide-react';

const CATEGORY_CONFIG: Record<ActorCategory, { label: string; icon: typeof Building2; color: string; bg: string; dot: string }> = {
  proveedores_capital:     { label: 'Proveedores de Capital', icon: Banknote,  color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  intermediarios:          { label: 'Intermediarios',         icon: Network,   color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',       dot: 'bg-blue-500' },
  bancos:                  { label: 'Bancos',                 icon: Landmark,  color: 'text-purple-700',  bg: 'bg-purple-50 border-purple-200',   dot: 'bg-purple-500' },
  gobierno_multilaterales: { label: 'Gobierno y Multilaterales', icon: Users2, color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',     dot: 'bg-amber-500' },
  empresa_social:          { label: 'Empresa Social',         icon: Sprout,    color: 'text-teal-700',    bg: 'bg-teal-50 border-teal-200',       dot: 'bg-teal-500' },
};

const COUNTRY_LABEL: Record<string, string> = { PE: '🇵🇪 Perú', CO: '🇨🇴 Colombia' };

const actorRepo = new ActorRepository();

export function ActorsDirectory() {
  const [actors, setActors] = useState<Actor[]>([]);
  const [canSeeContact, setCanSeeContact] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [country, setCountry] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');
  const [sector, setSector] = useState<string>('all');
  const [selected, setSelected] = useState<Actor | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await actorRepo.list({ take: 500 });
        if (cancelled) return;
        setActors(res.actors);
        setCanSeeContact(res.can_see_contact);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar actores');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Facetas derivadas de los datos cargados
  const sectors = useMemo(() => {
    const s = new Set<string>();
    actors.forEach(a => a.sectors?.forEach(x => s.add(x)));
    return [...s].sort();
  }, [actors]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return actors.filter(a => {
      if (country !== 'all' && a.country !== country) return false;
      if (category !== 'all' && a.category !== category) return false;
      if (sector !== 'all' && !(a.sectors ?? []).includes(sector)) return false;
      if (query && !(
        a.name.toLowerCase().includes(query) ||
        (a.description ?? '').toLowerCase().includes(query) ||
        (a.subcategory ?? '').toLowerCase().includes(query)
      )) return false;
      return true;
    });
  }, [actors, q, country, category, sector]);

  const byCategory = useMemo(() => {
    const m: Record<string, number> = {};
    filtered.forEach(a => { m[a.category] = (m[a.category] ?? 0) + 1; });
    return m;
  }, [filtered]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Directorio de Actores</h1>
              <p className="text-sm text-gray-500">Ecosistema de inversión de impacto · {actors.length} organizaciones</p>
            </div>
          </div>

          {/* Chips de categoría (resumen del filtrado actual) */}
          <div className="flex flex-wrap gap-2 mt-4">
            {(Object.keys(CATEGORY_CONFIG) as ActorCategory[]).map(cat => {
              const cfg = CATEGORY_CONFIG[cat];
              const active = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(active ? 'all' : cat)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                    active ? cfg.bg + ' ' + cfg.color : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                  <span className="text-gray-400">{byCategory[cat] ?? 0}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Filtros */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar por nombre, descripción o subcategoría…"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-400" />
            <select value={country} onChange={e => setCountry(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="all">Todos los países</option>
              <option value="PE">🇵🇪 Perú</option>
              <option value="CO">🇨🇴 Colombia</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select value={sector} onChange={e => setSector(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 max-w-[180px]">
              <option value="all">Todos los sectores</option>
              {sectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Resultados */}
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Loader2 className="w-8 h-8 text-teal-500 mx-auto mb-3 animate-spin" />
            <p className="text-gray-500 text-sm">Cargando directorio…</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-700">{error}</div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{filtered.length} de {actors.length} actores</p>
              {(country !== 'all' || category !== 'all' || sector !== 'all' || q) && (
                <button onClick={() => { setQ(''); setCountry('all'); setCategory('all'); setSector('all'); }} className="text-xs text-teal-600 hover:text-teal-700 font-medium">
                  Limpiar filtros
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No se encontraron actores con esos filtros.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(actor => {
                  const cfg = CATEGORY_CONFIG[actor.category];
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={actor.id}
                      onClick={() => setSelected(actor)}
                      className="bg-white border border-gray-200 rounded-xl p-5 text-left hover:shadow-lg hover:border-gray-300 transition-all flex flex-col"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                          <Icon className={`w-4 h-4 ${cfg.color}`} />
                        </div>
                        <span className="text-xs text-gray-400">{COUNTRY_LABEL[actor.country] ?? actor.country}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{actor.name}</h3>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium mb-2 ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                      </span>
                      {actor.description && (
                        <p className="text-xs text-gray-500 line-clamp-3 flex-1">{actor.description}</p>
                      )}
                      {actor.sectors?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {actor.sectors.slice(0, 3).map(s => (
                            <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px]">{s}</span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Detalle */}
      {selected && <ActorDetail actor={selected} canSeeContact={canSeeContact} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ActorDetail({ actor, canSeeContact, onClose }: { actor: Actor; canSeeContact: boolean; onClose: () => void }) {
  const cfg = CATEGORY_CONFIG[actor.category];
  const Icon = cfg.icon;
  const web = actor.website ? (actor.website.startsWith('http') ? actor.website : `https://${actor.website}`) : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
              <Icon className={`w-5 h-5 ${cfg.color}`} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{actor.name}</h2>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className={`inline-flex items-center gap-1 font-medium ${cfg.color}`}><span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}</span>
                <span className="text-gray-300">·</span>
                <span className="text-gray-500">{COUNTRY_LABEL[actor.country] ?? actor.country}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          {actor.description && <p className="text-sm text-gray-600 leading-relaxed">{actor.description}</p>}
          {actor.services && (
            <Field icon={Layers} label="Servicios"><p className="text-sm text-gray-600 whitespace-pre-line">{actor.services}</p></Field>
          )}

          <div className="grid grid-cols-2 gap-3">
            {actor.subcategory   && <MiniField icon={Tag}    label="Subcategoría" value={actor.subcategory} />}
            {actor.procedencia   && <MiniField icon={MapPin} label="Procedencia" value={actor.procedencia} />}
            {actor.geo_scope     && <MiniField icon={Globe}  label="Ámbito" value={actor.geo_scope} />}
            {actor.investment_amount && <MiniField icon={Banknote} label="Monto inversión" value={actor.investment_amount} />}
            {actor.aum           && <MiniField icon={Banknote} label="Activos bajo gestión" value={actor.aum} />}
          </div>

          {actor.sectors?.length > 0 && (
            <Field icon={Filter} label="Sectores">
              <div className="flex flex-wrap gap-1.5">{actor.sectors.map(s => <span key={s} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">{s}</span>)}</div>
            </Field>
          )}
          {actor.instruments?.length > 0 && (
            <Field icon={Layers} label="Instrumentos">
              <div className="flex flex-wrap gap-1.5">{actor.instruments.map(s => <span key={s} className="px-2 py-1 bg-teal-50 text-teal-700 rounded-lg text-xs">{s}</span>)}</div>
            </Field>
          )}

          {web && (
            <a href={web} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-teal-600 hover:underline">
              <Link2 className="w-4 h-4" />{actor.website}
            </a>
          )}

          {/* Contacto (PII) — solo gestor/admin */}
          {canSeeContact && (actor.contact_name || actor.contact_email) && (
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-2">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contacto (interno)</div>
              {actor.contact_name && <div className="flex items-center gap-2 text-sm text-gray-700"><User className="w-4 h-4 text-gray-400" />{actor.contact_name}</div>}
              {actor.contact_email && <a href={`mailto:${actor.contact_email}`} className="flex items-center gap-2 text-sm text-teal-600 hover:underline"><Mail className="w-4 h-4" />{actor.contact_email}</a>}
            </div>
          )}

          <div className="text-[11px] text-gray-300 pt-2">Fuente: {actor.source}</div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, children }: { icon: typeof Tag; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5"><Icon className="w-3.5 h-3.5" />{label}</div>
      {children}
    </div>
  );
}
function MiniField({ icon: Icon, label, value }: { icon: typeof Tag; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-2.5">
      <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5"><Icon className="w-3 h-3" />{label}</div>
      <div className="text-xs font-medium text-gray-800">{value}</div>
    </div>
  );
}
