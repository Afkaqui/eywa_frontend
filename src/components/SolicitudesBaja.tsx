"use client";

// Solicitudes de baja de cuenta (Ley 29733). Solo superadmin. Eliminar borra la
// cuenta con todo lo suyo y le avisa por correo; rechazar exige una nota que
// también se le envía. Nada se borra solo por pedirlo.

import { useCallback, useEffect, useState } from 'react';
import { UserX, Trash2, X, Loader2, ChevronDown, Mail } from 'lucide-react';

interface Solicitud {
  id: string; email: string; nombre: string | null; motivo: string | null;
  estado: 'pendiente' | 'eliminada' | 'rechazada'; nota: string | null;
  resuelta_por: string | null; resuelta_at: string | null; created_at: string;
  cuenta: null | {
    id: string; email: string; nombre: string | null; rol: string; plan: string;
    ultimo_acceso: string | null; creada: string; organizaciones: number; proyectos: number;
  };
}

const f = (s: string | null) => s ? new Date(s).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

export function SolicitudesBaja() {
  const [lista, setLista] = useState<Solicitud[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [rechazando, setRechazando] = useState<string | null>(null);
  const [nota, setNota] = useState('');
  const [verResueltas, setVerResueltas] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const r = await fetch('/api/proxy/bajas', { credentials: 'include' });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d?.error ?? 'No se pudo cargar');
      setLista(d.solicitudes ?? []);
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cargar'); setLista([]); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const accion = async (s: Solicitud, tipo: 'eliminar' | 'rechazar') => {
    if (tipo === 'eliminar' && !confirm(`¿Eliminar DEFINITIVAMENTE la cuenta ${s.cuenta?.email}?\n\nSe borran sus ${s.cuenta?.organizaciones ?? 0} organizaciones (con dataroom y diagnósticos), sus ${s.cuenta?.proyectos ?? 0} proyectos y sus archivos. No se puede deshacer. Se le enviará un correo.`)) return;
    setOcupado(s.id); setError(null); setAviso(null);
    try {
      const r = await fetch(`/api/proxy/bajas/${s.id}/${tipo}`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tipo === 'rechazar' ? { nota } : {}),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d?.error ?? 'No se pudo completar');
      setAviso(`${tipo === 'eliminar' ? 'Cuenta eliminada' : 'Solicitud rechazada'}.${d.correo_enviado ? ' Se envió el correo.' : ' Ojo: el correo no se pudo enviar.'}`);
      setRechazando(null); setNota('');
      await cargar();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo completar'); }
    finally { setOcupado(null); }
  };

  if (!lista) return null;
  const pendientes = lista.filter(s => s.estado === 'pendiente');
  const resueltas = lista.filter(s => s.estado !== 'pendiente');

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 mb-8">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0"><UserX className="w-5 h-5 text-red-600" /></div>
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">Solicitudes de baja {pendientes.length > 0 && <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">{pendientes.length} pendiente{pendientes.length === 1 ? '' : 's'}</span>}</h2>
          <p className="text-xs text-gray-500">Llegan desde <a href="/baja" target="_blank" className="underline">/baja</a>. Revisa que la cuenta corresponda antes de eliminar; en ambos casos se avisa al correo de la cuenta.</p>
        </div>
      </div>

      {error && <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</div>}
      {aviso && <div className="mb-3 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">{aviso}</div>}
      {pendientes.length === 0 && <p className="text-sm text-gray-500">No hay solicitudes pendientes.</p>}

      <div className="space-y-3">
        {pendientes.map(s => (
          <div key={s.id} className="border border-gray-200 rounded-2xl p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-gray-900 flex items-center gap-1.5"><Mail className="w-4 h-4 text-gray-400" />{s.email}{s.nombre ? <span className="text-gray-500 font-normal"> · {s.nombre}</span> : null}</div>
                <div className="text-xs text-gray-500 mt-0.5">Pedida el {f(s.created_at)}</div>
                {s.motivo && <p className="text-sm text-gray-700 mt-2 italic">«{s.motivo}»</p>}
              </div>
              <div className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 min-w-[14rem]">
                {s.cuenta ? <>
                  <div className="font-semibold text-gray-800">Cuenta encontrada</div>
                  <div className="text-gray-600">{s.cuenta.nombre ?? '—'} · {s.cuenta.rol} · {s.cuenta.plan}</div>
                  <div className="text-gray-600">{s.cuenta.organizaciones} organizaciones · {s.cuenta.proyectos} proyectos</div>
                  <div className="text-gray-500">Último acceso: {f(s.cuenta.ultimo_acceso)}</div>
                </> : <div className="text-amber-700">No hay ninguna cuenta con este correo.</div>}
              </div>
            </div>

            {rechazando === s.id ? (
              <div className="mt-3">
                <textarea value={nota} onChange={e => setNota(e.target.value)} rows={3} maxLength={2000}
                  placeholder="Motivo del rechazo (se envía por correo a la cuenta)"
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <div className="flex gap-2 mt-2">
                  <button onClick={() => accion(s, 'rechazar')} disabled={ocupado === s.id || nota.trim().length < 5}
                    className="px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-medium disabled:opacity-40 flex items-center gap-1.5">
                    {ocupado === s.id && <Loader2 className="w-4 h-4 animate-spin" />} Rechazar y avisar
                  </button>
                  <button onClick={() => { setRechazando(null); setNota(''); }} className="px-4 py-2 rounded-full border border-gray-200 text-sm">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-3">
                <button onClick={() => accion(s, 'eliminar')} disabled={!s.cuenta || ocupado === s.id}
                  className="px-4 py-2 rounded-full bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-40 flex items-center gap-1.5">
                  {ocupado === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Eliminar cuenta y avisar
                </button>
                <button onClick={() => setRechazando(s.id)} disabled={ocupado === s.id}
                  className="px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-1.5">
                  <X className="w-4 h-4" /> Rechazar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {resueltas.length > 0 && (
        <div className="mt-4">
          <button onClick={() => setVerResueltas(v => !v)} className="text-sm text-gray-600 flex items-center gap-1">
            <ChevronDown className={`w-4 h-4 transition-transform ${verResueltas ? 'rotate-180' : ''}`} /> Resueltas ({resueltas.length})
          </button>
          {verResueltas && (
            <div className="mt-2 divide-y divide-gray-100 text-sm">
              {resueltas.map(s => (
                <div key={s.id} className="py-2 flex flex-wrap gap-x-3 gap-y-0.5">
                  <span className="font-medium text-gray-800">{s.email}</span>
                  <span className={s.estado === 'eliminada' ? 'text-red-700' : 'text-gray-600'}>{s.estado === 'eliminada' ? 'Eliminada' : 'Rechazada'}</span>
                  <span className="text-gray-500">{f(s.resuelta_at)} · {s.resuelta_por}</span>
                  {s.nota && <span className="text-gray-500 italic w-full">«{s.nota}»</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
