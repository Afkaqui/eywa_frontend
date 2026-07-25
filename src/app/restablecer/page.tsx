'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';

// Página PÚBLICA: el usuario llega desde el enlace del correo con ?token=…
// El token NO se muestra en pantalla ni se guarda; solo viaja en el POST.

function RestablecerForm() {
  const params = useSearchParams();
  const token  = params.get('token') ?? '';

  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [show, setShow]           = useState(false);
  const [saving, setSaving]       = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState('');

  const tooShort = password.length > 0 && password.length < 6;
  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit = password.length >= 6 && password === confirm && !saving;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/proxy/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'No se pudo actualizar la contraseña');
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado');
    } finally {
      setSaving(false);
    }
  }

  // Sin token en la URL no hay nada que hacer: se dice claro.
  if (!token) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Enlace incompleto</h1>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          Este enlace no trae el código de recuperación. Cópialo completo desde el
          correo, o solicita uno nuevo.
        </p>
        <a
          href="/recuperar"
          className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold
                     px-5 py-2.5 rounded-lg transition-colors text-sm"
        >
          Solicitar un enlace nuevo
        </a>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Contraseña actualizada</h1>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          Ya puedes iniciar sesión con tu nueva contraseña.
        </p>
        <a
          href="/"
          className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold
                     px-5 py-2.5 rounded-lg transition-colors text-sm"
        >
          Ir a iniciar sesión
        </a>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-xl font-semibold text-gray-900 mb-2">Elige tu nueva contraseña</h1>
      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
        Debe tener al menos 6 caracteres. Al guardarla se cerrarán los enlaces de
        recuperación pendientes.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
            Nueva contraseña
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="password"
              type={show ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-11 py-2.5 border border-gray-300 rounded-lg text-gray-900
                         focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {tooShort && (
            <p className="text-xs text-amber-700 mt-1.5">Faltan al menos {6 - password.length} caracteres.</p>
          )}
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1.5">
            Repite la contraseña
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="confirm"
              type={show ? 'text' : 'password'}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900
                         focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
          {mismatch && (
            <p className="text-xs text-red-700 mt-1.5">Las contraseñas no coinciden.</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {error}
            <a href="/recuperar" className="block mt-1.5 font-medium underline">
              Solicitar un enlace nuevo
            </a>
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300
                     text-white font-semibold py-2.5 rounded-lg transition-colors
                     flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando…
            </>
          ) : (
            'Guardar nueva contraseña'
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <a href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio de sesión
        </a>
      </div>
    </>
  );
}

export default function RestablecerPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="text-2xl font-bold text-gray-900 tracking-tight">EYWA</div>
          <div className="text-sm text-gray-500 mt-1">Plataforma de sostenibilidad e impacto</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          {/* useSearchParams exige Suspense en el App Router */}
          <Suspense fallback={<div className="text-center text-sm text-gray-500">Cargando…</div>}>
            <RestablecerForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
