'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { UserPlus, Mail, Loader2, X, CheckCircle2, Clock, Ban, AlertTriangle } from 'lucide-react';
import {
  DataroomRepository,
  type Invitation,
  type InvitationStatus,
} from '@/lib/repositories/dataroom-repository';

// Panel de invitaciones del dataroom (solo lo ve el DUEÑO).
// El invitado NO necesita crear cuenta: recibe un enlace con token, ve el
// dataroom en solo lectura y cada descarga suya queda en la bitácora.

const ESTADO: Record<InvitationStatus, { label: string; cls: string; Icon: typeof Clock }> = {
  enviada:  { label: 'Enviada · sin abrir', cls: 'bg-blue-100 text-blue-700',     Icon: Mail },
  activa:   { label: 'Abierta',             cls: 'bg-emerald-100 text-emerald-700', Icon: CheckCircle2 },
  vencida:  { label: 'Vencida',             cls: 'bg-amber-100 text-amber-800',   Icon: Clock },
  revocada: { label: 'Revocada',            cls: 'bg-gray-200 text-gray-600',     Icon: Ban },
};

function fecha(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function DataroomInvitations() {
  const repo = useMemo(() => new DataroomRepository(), []);
  const [list, setList]     = useState<Invitation[] | null>(null);
  const [email, setEmail]   = useState('');
  const [name, setName]     = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError]   = useState('');
  const [ok, setOk]         = useState('');

  const load = useCallback(() => {
    repo.getInvitations().then(setList).catch(() => setList([]));
  }, [repo]);

  useEffect(() => { load(); }, [load]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSending(true); setError(''); setOk('');
    try {
      const inv = await repo.invite(email.trim(), name.trim());
      setOk(`Invitación enviada a ${inv.email}`);
      setEmail(''); setName('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la invitación');
    } finally {
      setSending(false);
    }
  }

  async function handleRevoke(inv: Invitation) {
    const quien = inv.name || inv.email;
    if (!confirm(`¿Revocar el acceso de ${quien}?\n\nEl enlace dejará de funcionar de inmediato. Los documentos que ya haya descargado siguen en su poder — esto no los recupera.`)) return;
    try {
      await repo.revokeInvitation(inv.id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo revocar');
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <UserPlus className="w-4 h-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-700">Invitar a revisar el dataroom</h2>
      </div>
      <p className="text-xs text-gray-500 mb-5 leading-relaxed">
        Comparte tu documentación con inversores o auditores. Reciben un enlace por
        correo y <strong>no necesitan crear cuenta</strong>. Pueden ver y descargar,
        nunca modificar.
      </p>

      {/* Aviso honesto: esto NO es la mini-landing */}
      <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900 leading-relaxed">
          El invitado ve tu dataroom <strong>completo</strong>, no solo lo que marcaste
          como público. Incluye documentos sensibles (tributarios, financieros,
          planillas). Invita únicamente a quien deba verlos.
        </p>
      </div>

      <form onSubmit={handleInvite} className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 mb-6">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@inversor.com"
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                     focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre o empresa (opcional)"
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                     focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
        />
        <button
          type="submit"
          disabled={sending || !email}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700
                     disabled:bg-gray-300 text-white font-semibold px-5 py-2.5 rounded-lg
                     transition-colors text-sm whitespace-nowrap"
        >
          {sending ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando…</> : 'Enviar invitación'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}
      {ok && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-800 mb-4">
          {ok}
        </div>
      )}

      {list === null ? (
        <div className="py-6 text-center"><Loader2 className="w-5 h-5 text-gray-300 mx-auto animate-spin" /></div>
      ) : list.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">
          Todavía no has invitado a nadie.
        </p>
      ) : (
        <div className="border-t border-gray-200 pt-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">
            Invitaciones ({list.length})
          </div>
          <div className="space-y-2">
            {list.map(inv => {
              const st = ESTADO[inv.status];
              const vigente = inv.status === 'enviada' || inv.status === 'activa';
              return (
                <div key={inv.id} className="flex items-center gap-3 flex-wrap p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1 min-w-[180px]">
                    <div className="text-sm text-gray-900">{inv.name || inv.email}</div>
                    {inv.name && <div className="text-xs text-gray-500">{inv.email}</div>}
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st.cls}`}>
                    <st.Icon className="w-3.5 h-3.5" />
                    {st.label}
                  </span>
                  <div className="text-xs text-gray-400 whitespace-nowrap">
                    {inv.status === 'activa' && inv.last_access_at
                      ? `Abrió el ${fecha(inv.last_access_at)}`
                      : `Vence el ${fecha(inv.expires_at)}`}
                  </div>
                  {vigente && (
                    <button
                      onClick={() => handleRevoke(inv)}
                      title="Revocar acceso"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
