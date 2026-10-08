"use client";

import { useState, useEffect, useCallback } from 'react';
import { KeyRound, Plus, RefreshCw, Ban, Copy, Check, Loader2, AlertTriangle, X } from 'lucide-react';

// Clientes de la API externa (§15) — proceso de claves sin tocar la BD a mano.
//
// La clave en claro solo existe en la respuesta de "emitir" o "rotar": EYWA guarda
// su sha256. Por eso se muestra en un recuadro aparte con aviso explícito, y al
// cerrarlo se pierde. Si alguien la pierde, se ROTA (mismo cliente, mismas
// empresas), no se emite un cliente nuevo.

const BASE = '/api/proxy/admin/api-clients';

interface Cliente {
  id: string;
  nombre: string;
  prefijo: string;
  permisos: string[];
  activo: boolean;
  revocado: string | null;
  limite_por_hora: number;
  peticiones: number;
  empresas: number;
  creado: string;
  ultimo_uso: string | null;
}
interface Permiso { clave: string; descripcion: string }

async function llamar<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json' } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Error ${res.status}`);
  return data as T;
}

const fecha = (s: string | null) => (s ? new Date(s).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }) : '—');

export function ApiClientsPanel() {
  const [clientes, setClientes] = useState<Cliente[] | null>(null);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [error, setError]       = useState<string | null>(null);
  const [ocupado, setOcupado]   = useState<string | null>(null);
  const [nueva, setNueva]       = useState<{ nombre: string; clave: string; nota: string } | null>(null);
  const [creando, setCreando]   = useState(false);

  const cargar = useCallback(async () => {
    try {
      const d = await llamar<{ clientes: Cliente[]; permisos_disponibles: Permiso[] }>(BASE);
      setClientes(d.clientes);
      setPermisos(d.permisos_disponibles);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los clientes');
      setClientes([]);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const actualizar = (c: Cliente) => setClientes((xs) => (xs ?? []).map((x) => (x.id === c.id ? c : x)));

  const accion = async (c: Cliente, tipo: 'rotar' | 'revocar') => {
    const mensaje = tipo === 'rotar'
      ? `Se emitirá una clave nueva para "${c.nombre}" y la actual (${c.prefijo}…) dejará de funcionar en el acto. ¿Continuar?`
      : `"${c.nombre}" perderá el acceso de inmediato. Sus empresas se conservan y se puede reactivar rotando la clave. ¿Revocar?`;
    if (!window.confirm(mensaje)) return;
    setOcupado(c.id); setError(null);
    try {
      const d = await llamar<{ cliente: Cliente; clave?: string; nota?: string }>(`${BASE}/${c.id}/${tipo}`, { method: 'POST', body: '{}' });
      actualizar(d.cliente);
      if (d.clave) setNueva({ nombre: c.nombre, clave: d.clave, nota: d.nota ?? '' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo completar la acción');
    } finally {
      setOcupado(null);
    }
  };

  const cambiarPermiso = async (c: Cliente, permiso: string) => {
    const lista = c.permisos.includes(permiso) ? c.permisos.filter((p) => p !== permiso) : [...c.permisos, permiso];
    if (!lista.length) { setError('Una clave necesita al menos un permiso. Para cortar el acceso, revócala.'); return; }
    setOcupado(c.id); setError(null);
    try {
      const d = await llamar<{ cliente: Cliente }>(`${BASE}/${c.id}`, { method: 'PATCH', body: JSON.stringify({ permisos: lista }) });
      actualizar(d.cliente);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron guardar los permisos');
    } finally {
      setOcupado(null);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mt-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
            <KeyRound className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Clientes de la API</h2>
            <p className="text-xs text-gray-500">
              Sistemas de terceros que usan la API externa. Cada uno con su clave, sus permisos y su límite por hora.
            </p>
          </div>
        </div>
        <button
          onClick={() => setCreando(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
        >
          <Plus className="w-3.5 h-3.5" /> Emitir clave
        </button>
      </div>

      {error && (
        <div className="flex gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{error}</span>
        </div>
      )}

      {nueva && <ClaveNueva {...nueva} onCerrar={() => setNueva(null)} />}

      {clientes === null ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-gray-400 animate-spin" /></div>
      ) : clientes.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">Todavía no hay clientes de la API.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                <th className="text-left py-2.5 px-3">Cliente</th>
                <th className="text-left py-2.5 px-3">Permisos</th>
                <th className="text-left py-2.5 px-3">Uso</th>
                <th className="text-left py-2.5 px-3">Estado</th>
                <th className="text-right py-2.5 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 align-top">
                  <td className="py-3 px-3">
                    <div className="font-medium text-gray-900">{c.nombre}</div>
                    <div className="text-xs text-gray-500 font-mono">{c.prefijo}…</div>
                    <div className="text-xs text-gray-400">Emitida {fecha(c.creado)}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col gap-1">
                      {permisos.map((p) => (
                        <label key={p.clave} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer" title={p.descripcion}>
                          <input
                            type="checkbox"
                            className="accent-emerald-600"
                            checked={c.permisos.includes(p.clave)}
                            disabled={ocupado === c.id || !c.activo}
                            onChange={() => cambiarPermiso(c, p.clave)}
                          />
                          <code className="text-[11px]">{p.clave}</code>
                        </label>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-xs text-gray-600">
                    <div><strong>{c.peticiones}</strong> peticiones</div>
                    <div><strong>{c.empresas}</strong> empresa{c.empresas === 1 ? '' : 's'} dadas de alta</div>
                    <div className="text-gray-400">Último uso: {fecha(c.ultimo_uso)}</div>
                    <div className="text-gray-400">Límite: {c.limite_por_hora}/hora</div>
                  </td>
                  <td className="py-3 px-3">
                    {c.activo
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Activa</span>
                      : <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200" title={`Revocada ${fecha(c.revocado)}`}>Revocada</span>}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col items-end gap-1.5">
                      <button
                        onClick={() => accion(c, 'rotar')}
                        disabled={ocupado === c.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-700 border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                        title={c.activo ? 'Clave nueva; la actual deja de funcionar' : 'Reactivar con una clave nueva'}
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> {c.activo ? 'Rotar' : 'Reactivar'}
                      </button>
                      {c.activo && (
                        <button
                          onClick={() => accion(c, 'revocar')}
                          disabled={ocupado === c.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-red-700 border border-red-200 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Ban className="w-3.5 h-3.5" /> Revocar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creando && (
        <EmitirDialog
          permisos={permisos}
          onCerrar={() => setCreando(false)}
          onEmitida={(c, clave, nota) => {
            setClientes((xs) => [c, ...(xs ?? [])]);
            setNueva({ nombre: c.nombre, clave, nota });
            setCreando(false);
          }}
        />
      )}
    </div>
  );
}

function ClaveNueva({ nombre, clave, nota, onCerrar }: { nombre: string; clave: string; nota: string; onCerrar: () => void }) {
  const [copiada, setCopiada] = useState(false);
  return (
    <div className="border border-amber-300 bg-amber-50 rounded-xl p-4 mb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm text-amber-900">
          <strong>Clave de {nombre}.</strong> {nota} Cópiala ahora y entrégala por un canal distinto al de la documentación.
        </div>
        <button onClick={onCerrar} className="text-amber-700 hover:text-amber-900" title="Ya la guardé">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <code className="flex-1 text-xs font-mono bg-white border border-amber-200 rounded-lg px-3 py-2 break-all">{clave}</code>
        <button
          onClick={() => navigator.clipboard.writeText(clave).then(() => { setCopiada(true); setTimeout(() => setCopiada(false), 2000); })}
          className="p-2 text-amber-700 hover:text-amber-900" title="Copiar clave"
        >
          {copiada ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function EmitirDialog({ permisos, onCerrar, onEmitida }: {
  permisos: Permiso[];
  onCerrar: () => void;
  onEmitida: (c: Cliente, clave: string, nota: string) => void;
}) {
  const [nombre, setNombre]     = useState('');
  const [elegidos, setElegidos] = useState<string[]>(permisos.map((p) => p.clave));
  const [limite, setLimite]     = useState(120);
  const [enviando, setEnviando] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const puede = nombre.trim().length >= 2 && elegidos.length > 0 && limite >= 1 && !enviando;

  const emitir = async () => {
    setEnviando(true); setError(null);
    try {
      const d = await llamar<{ cliente: Cliente; clave: string; nota: string }>(BASE, {
        method: 'POST',
        body:   JSON.stringify({ nombre: nombre.trim(), permisos: elegidos, limite_por_hora: limite }),
      });
      onEmitida(d.cliente, d.clave, d.nota);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo emitir la clave');
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onCerrar}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Emitir clave de API</h3>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>

        <label className="block text-xs font-medium text-gray-700 mb-1">Cliente</label>
        <input
          value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre de la organización o sistema"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <div className="text-xs font-medium text-gray-700 mb-1">Permisos</div>
        <div className="space-y-1.5 mb-4">
          {permisos.map((p) => (
            <label key={p.clave} className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox" className="mt-1 accent-emerald-600"
                checked={elegidos.includes(p.clave)}
                onChange={() => setElegidos((xs) => (xs.includes(p.clave) ? xs.filter((x) => x !== p.clave) : [...xs, p.clave]))}
              />
              <span><code className="text-xs">{p.clave}</code> <span className="text-gray-500 text-xs">— {p.descripcion}</span></span>
            </label>
          ))}
        </div>

        <label className="block text-xs font-medium text-gray-700 mb-1">Límite de peticiones por hora</label>
        <input
          type="number" min={1} max={10000} value={limite} onChange={(e) => setLimite(Number(e.target.value))}
          className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-2 mb-3">{error}</p>}

        <button
          onClick={emitir} disabled={!puede}
          className="w-full py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 inline-flex items-center justify-center gap-2"
        >
          {enviando && <Loader2 className="w-4 h-4 animate-spin" />} Emitir clave
        </button>
        <p className="text-xs text-gray-400 mt-2 text-center">La clave se mostrará una sola vez.</p>
      </div>
    </div>
  );
}
