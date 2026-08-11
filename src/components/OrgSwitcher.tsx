'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Building2, User, ChevronDown, Plus, Check, Loader2 } from 'lucide-react';
import {
  OrganizationRepository, setOrgActivaId, resolverOrgActiva,
  type OrgListado, type OrgResumen,
} from '@/lib/repositories/organization-repository';

// Selector de organización activa.
//
// Solo aparece cuando el usuario tiene MÁS DE UNA, o cuando puede agregar otra.
// Con una sola empresa —el caso de todos los usuarios actuales— la interfaz se
// ve exactamente igual que antes: no se le agrega un control a quien no lo necesita.

interface Props {
  /** Se llama al cambiar de organización, para que la vista recargue sus datos. */
  onChange?: (orgId: string) => void;
  /** Abrir el formulario de nueva organización. */
  onAdd?: () => void;
}

function iconoDe(o: OrgResumen) {
  return o.type === 'persona_natural' ? User : Building2;
}

function etiquetaDe(o: OrgResumen) {
  // El nombre comercial es como la conoce la gente; la razón social va debajo.
  return o.trade_name?.trim() || o.name;
}

export function OrgSwitcher({ onChange, onAdd }: Props) {
  const repo = useMemo(() => new OrganizationRepository(), []);
  const [lista, setLista]   = useState<OrgListado | null>(null);
  const [activa, setActiva] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  const cargar = useCallback(() => {
    repo.getAll()
      .then(l => { setLista(l); setActiva(resolverOrgActiva(l)); })
      .catch(() => setLista(null));
  }, [repo]);

  useEffect(() => { cargar(); }, [cargar]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    if (!abierto) return;
    const fn = (e: MouseEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [abierto]);

  if (!lista) {
    return <div className="h-9 w-40 rounded-lg bg-gray-100 animate-pulse" />;
  }

  // Con una sola organización y sin margen para agregar, el selector no aporta nada.
  if (lista.organizations.length <= 1 && !lista.can_add) {
    const o = lista.organizations[0];
    if (!o) return null;
    const Icono = iconoDe(o);
    return (
      <div className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700">
        <Icono className="w-4 h-4 text-gray-400" />
        <span className="font-medium">{etiquetaDe(o)}</span>
      </div>
    );
  }

  const actual = lista.organizations.find(o => o.id === activa) ?? lista.organizations[0];
  const Icono = actual ? iconoDe(actual) : Building2;

  function elegir(id: string) {
    setActiva(id);
    setOrgActivaId(id);
    setAbierto(false);
    onChange?.(id);
  }

  return (
    <div className="relative" ref={caja}>
      <button
        onClick={() => setAbierto(!abierto)}
        className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg
                   text-sm hover:bg-gray-50 transition-colors max-w-[260px]"
      >
        <Icono className="w-4 h-4 text-gray-400 shrink-0" />
        <span className="font-medium text-gray-900 truncate">
          {actual ? etiquetaDe(actual) : 'Sin organización'}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
      </button>

      {abierto && (
        <div className="absolute z-50 mt-1 w-[300px] bg-white border border-gray-200 rounded-xl shadow-lg p-1.5">
          <div className="px-2.5 py-1.5 text-xs text-gray-400 uppercase tracking-wider">
            Mis organizaciones ({lista.organizations.length}/{lista.limit})
          </div>

          {lista.organizations.map(o => {
            const I = iconoDe(o);
            const esActiva = o.id === activa;
            return (
              <button
                key={o.id}
                onClick={() => elegir(o.id)}
                className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left
                            transition-colors ${esActiva ? 'bg-emerald-50' : 'hover:bg-gray-50'}`}
              >
                <I className={`w-4 h-4 mt-0.5 shrink-0 ${esActiva ? 'text-emerald-600' : 'text-gray-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 truncate">{etiquetaDe(o)}</div>
                  {/* Si hay nombre comercial, la razón social va debajo para no perderla */}
                  {o.trade_name?.trim() && (
                    <div className="text-xs text-gray-500 truncate">{o.name}</div>
                  )}
                  <div className="text-xs text-gray-400">
                    {o.ruc ?? 'RUC pendiente'}
                    {o.type === 'persona_natural' && ' · persona natural'}
                  </div>
                </div>
                {esActiva && <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              </button>
            );
          })}

          <div className="border-t border-gray-100 mt-1.5 pt-1.5">
            {lista.can_add ? (
              <button
                onClick={() => { setAbierto(false); onAdd?.(); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left
                           text-sm text-emerald-700 hover:bg-emerald-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Agregar organización
              </button>
            ) : (
              // Se dice el motivo en vez de mostrar un botón que no haría nada.
              <div className="px-2.5 py-2 text-xs text-gray-400 leading-relaxed">
                Llegaste al máximo de {lista.limit} organizaciones por cuenta.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
