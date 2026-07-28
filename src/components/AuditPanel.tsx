'use client';

import { useState, useEffect } from 'react';
import {
  ShieldAlert, Clock, KeyRound, Download, UserCheck, Loader2,
  AlertTriangle, ExternalLink, Users,
} from 'lucide-react';

// Panel de control y auditoría — EXCLUSIVO de superadmin.
// El backend revalida el rol: ocultar esto en la UI no impediría llamar la API.

interface AuditUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  plan: string;
  created_at: string;
  last_login_at: string | null;
  password_changed_at: string | null;
  organization: string | null;
}

interface AuditData {
  tracking_since: string;
  summary: {
    users: number; organizations: number; never_logged_in: number;
    staff: number; external_access: number; pending_resets: number;
  };
  users: AuditUser[];
  access_log: {
    id: string; action: string; file_name: string;
    organization: string | null; who: string; created_at: string;
  }[];
  external_access: {
    id: string; email: string; name: string | null; organization: string;
    expires_at: string; last_access_at: string | null;
  }[];
}

const ROL_CLS: Record<string, string> = {
  superadmin: 'bg-red-100 text-red-700',
  admin:      'bg-purple-100 text-purple-700',
  gestor:     'bg-blue-100 text-blue-700',
  user:       'bg-gray-100 text-gray-600',
};

function fechaHora(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

// "hace 3 días" — más útil que una fecha absoluta para detectar cuentas dormidas
function haceCuanto(iso: string | null) {
  if (!iso) return null;
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (dias === 0) return 'hoy';
  if (dias === 1) return 'ayer';
  if (dias < 30) return `hace ${dias} días`;
  const meses = Math.floor(dias / 30);
  return meses === 1 ? 'hace 1 mes' : `hace ${meses} meses`;
}

// Dato que aún no existe: se dice, no se inventa.
function SinRegistro({ nota }: { nota: string }) {
  return <span className="text-gray-300 italic" title={nota}>Sin registro</span>;
}

export function AuditPanel() {
  const [data, setData]   = useState<AuditData | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab]     = useState<'usuarios' | 'accesos' | 'externos'>('usuarios');

  useEffect(() => {
    fetch('/api/proxy/users/audit?logs=100', { credentials: 'include' })
      .then(async r => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d?.error ?? 'No se pudo cargar la auditoría');
        setData(d);
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Error'));
  }, []);

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="text-sm text-red-600">{error}</div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <Loader2 className="w-5 h-5 text-gray-300 mx-auto animate-spin" />
      </div>
    );
  }

  const desde = new Date(data.tracking_since).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const TABS = [
    { id: 'usuarios' as const, label: 'Usuarios',          n: data.users.length },
    { id: 'accesos'  as const, label: 'Descargas',         n: data.access_log.length },
    { id: 'externos' as const, label: 'Accesos externos',  n: data.external_access.length },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <ShieldAlert className="w-4 h-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-700">Control y auditoría</h2>
      </div>
      <p className="text-xs text-gray-500 mb-5">
        Quién entra, quién cambia su contraseña y quién se lleva documentos.
      </p>

      {/* Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
        {[
          { label: 'Usuarios',            value: data.summary.users,           Icon: Users },
          { label: 'Equipo interno',      value: data.summary.staff,           Icon: UserCheck },
          { label: 'Nunca ingresaron',    value: data.summary.never_logged_in, Icon: Clock },
          { label: 'Accesos externos',    value: data.summary.external_access, Icon: ExternalLink },
          { label: 'Recuperaciones vivas',value: data.summary.pending_resets,  Icon: KeyRound },
        ].map(s => (
          <div key={s.label}>
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <s.Icon className="w-3.5 h-3.5" />
              <span className="text-xs">{s.label}</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">{s.value}</div>
          </div>
        ))}
      </div>

      {/* El dato empezó a registrarse en una fecha: decirlo evita leer mal el panel */}
      <div className="flex gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 mb-5">
        <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-900 leading-relaxed">
          La última sesión y el último cambio de contraseña se registran desde el{' '}
          <strong>{desde}</strong>. Las cuentas anteriores aparecen como
          &ldquo;Sin registro&rdquo; hasta que vuelvan a entrar o cambien su clave:
          no se rellenan con datos estimados.
        </p>
      </div>

      <div className="flex gap-2 mb-4 border-b border-gray-200">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label} <span className="text-xs text-gray-400">({t.n})</span>
          </button>
        ))}
      </div>

      {tab === 'usuarios' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <th className="pb-2 pr-3 font-medium">Usuario</th>
                <th className="pb-2 pr-3 font-medium">Rol</th>
                <th className="pb-2 pr-3 font-medium">Última sesión</th>
                <th className="pb-2 pr-3 font-medium">Contraseña</th>
                <th className="pb-2 font-medium">Registrado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.users.map(u => (
                <tr key={u.id} className="align-top">
                  <td className="py-2.5 pr-3">
                    <div className="text-gray-900">{u.name || u.email}</div>
                    {u.name && <div className="text-xs text-gray-500">{u.email}</div>}
                    {u.organization && <div className="text-xs text-gray-400">{u.organization}</div>}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${ROL_CLS[u.role] ?? ROL_CLS.user}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 whitespace-nowrap">
                    {u.last_login_at ? (
                      <>
                        <div className="text-gray-700">{haceCuanto(u.last_login_at)}</div>
                        <div className="text-xs text-gray-400">{fechaHora(u.last_login_at)}</div>
                      </>
                    ) : <SinRegistro nota={`No ha iniciado sesión desde el ${desde}`} />}
                  </td>
                  <td className="py-2.5 pr-3 whitespace-nowrap">
                    {u.password_changed_at ? (
                      <>
                        <div className="text-gray-700">{haceCuanto(u.password_changed_at)}</div>
                        <div className="text-xs text-gray-400">{fechaHora(u.password_changed_at)}</div>
                      </>
                    ) : <SinRegistro nota={`No la ha cambiado desde el ${desde}`} />}
                  </td>
                  <td className="py-2.5 text-xs text-gray-500 whitespace-nowrap">
                    {fechaHora(u.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'accesos' && (
        data.access_log.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            Todavía nadie ha descargado documentos del dataroom.
          </p>
        ) : (
          <div className="space-y-1.5">
            {data.access_log.map(l => (
              <div key={l.id} className="flex items-center gap-3 flex-wrap text-sm py-2 border-b border-gray-50">
                <Download className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="text-gray-900 flex-1 min-w-[160px] truncate">{l.file_name}</span>
                {l.organization && <span className="text-xs text-gray-400">{l.organization}</span>}
                <span className="text-xs text-gray-600">{l.who}</span>
                <span className="text-xs text-gray-400 whitespace-nowrap">{fechaHora(l.created_at)}</span>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'externos' && (
        data.external_access.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            Nadie externo tiene acceso a un dataroom en este momento.
          </p>
        ) : (
          <>
            <p className="text-xs text-gray-500 mb-3">
              Personas sin cuenta en EYWA que ahora mismo pueden abrir el dataroom
              completo de una empresa. Solo el dueño de cada dataroom puede revocarlas.
            </p>
            <div className="space-y-2">
              {data.external_access.map(e => (
                <div key={e.id} className="flex items-center gap-3 flex-wrap p-3 border border-gray-200 rounded-lg text-sm">
                  <div className="flex-1 min-w-[180px]">
                    <div className="text-gray-900">{e.name || e.email}</div>
                    {e.name && <div className="text-xs text-gray-500">{e.email}</div>}
                  </div>
                  <span className="text-xs text-gray-600">{e.organization}</span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {e.last_access_at ? `Abrió ${haceCuanto(e.last_access_at)}` : 'Sin abrir'}
                  </span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    Vence {fechaHora(e.expires_at)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )
      )}
    </div>
  );
}
