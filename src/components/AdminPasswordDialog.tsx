"use client";

import { useState } from 'react';
import { X, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { API_ROUTES } from '@/lib/constants/roles';
import type { Profile } from '@/lib/types/database';

// Fijar la contraseña de otra persona desde el panel de superadmin.
//
// Decisión del usuario (2026-08-22): el superadmin escribe la contraseña él
// mismo en vez de enviar un enlace de restablecimiento. Es lo más directo para
// dar de alta a quien no puede recibir el correo, pero implica que el
// administrador PASA A CONOCER la clave de esa cuenta.
//
// Por eso el diálogo lo dice sin adornos en vez de tratarlo como un ajuste más:
// quien lo usa debe saber lo que implica. El backend, por su parte, deja
// constancia de quién la fijó y avisa al dueño por correo.

interface Props {
  usuario: Profile;
  onCerrar: () => void;
}

export function AdminPasswordDialog({ usuario, onCerrar }: Props) {
  const [clave, setClave]       = useState('');
  const [repetir, setRepetir]   = useState('');
  const [ver, setVer]           = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [listo, setListo]       = useState<{ notificado: boolean } | null>(null);

  const corta    = clave.length > 0 && clave.length < 6;
  const dispares = repetir.length > 0 && clave !== repetir;
  const puede    = clave.length >= 6 && clave === repetir && !enviando;

  const guardar = async () => {
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch(API_ROUTES.ADMIN_USER_PASSWORD(usuario.id), {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ new_password: clave }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'No se pudo cambiar la contraseña');
      setListo({ notificado: !!data.notificado });
    } catch (e) {
      // Se muestra el mensaje REAL del backend, no un genérico.
      setError(e instanceof Error ? e.message : 'No se pudo cambiar la contraseña');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-900">Fijar contraseña</h3>
            <p className="text-sm text-gray-500 mt-0.5">{usuario.fullName || usuario.email}</p>
          </div>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 p-1" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        {listo ? (
          <div className="p-5 space-y-4">
            <div className="flex gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-sm text-emerald-900 leading-relaxed">
                Contraseña cambiada. Entrégasela por un medio seguro y pídele que la
                cambie desde <em>Configuración</em> al entrar.
              </div>
            </div>

            {!listo.notificado && (
              // Si el correo no salió hay que decirlo: el dueño de la cuenta no se enteró.
              <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900 leading-relaxed">
                  <strong>No se pudo avisar por correo.</strong> El cambio se hizo igual,
                  pero {usuario.email} no se enteró: díselo tú.
                </div>
              </div>
            )}

            <button
              onClick={onCerrar}
              className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900 leading-relaxed">
                Vas a conocer la contraseña de <strong>{usuario.email}</strong> y podrás
                entrar como esa persona. Queda registrado que la fijaste tú, y se le avisa
                por correo.
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Contraseña nueva
              </label>
              <div className="flex gap-2">
                <input
                  type={ver ? 'text' : 'password'}
                  value={clave}
                  onChange={e => setClave(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setVer(!ver)}
                  className="px-3 rounded-xl border border-gray-200 text-xs text-gray-600 hover:bg-gray-50"
                >
                  {ver ? 'Ocultar' : 'Ver'}
                </button>
              </div>
              {corta && <p className="text-xs text-red-600 mt-1.5">Debe tener al menos 6 caracteres</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Repetir
              </label>
              <input
                type={ver ? 'text' : 'password'}
                value={repetir}
                onChange={e => setRepetir(e.target.value)}
                autoComplete="new-password"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {dispares && <p className="text-xs text-red-600 mt-1.5">Las contraseñas no coinciden</p>}
            </div>

            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={onCerrar}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={!puede}
                className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium
                           hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed
                           inline-flex items-center justify-center gap-2"
              >
                {enviando && <Loader2 className="w-4 h-4 animate-spin" />}
                Cambiar contraseña
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
