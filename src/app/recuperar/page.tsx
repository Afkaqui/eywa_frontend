'use client';

import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

// Página PÚBLICA: pedir el enlace de recuperación de contraseña.
// Nota de seguridad: el backend responde SIEMPRE lo mismo, exista o no la cuenta
// (no se puede sondear qué correos están registrados). La UI refleja eso: no
// promete "te enviamos un correo", dice "si el correo corresponde a una cuenta".
export default function RecuperarPage() {
  const [email, setEmail]     = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError]     = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError('');

    try {
      const res = await fetch('/api/proxy/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'No se pudo procesar la solicitud');
      setMessage(data?.message ?? '');
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="text-2xl font-bold text-gray-900 tracking-tight">EYWA</div>
          <div className="text-sm text-gray-500 mt-1">Plataforma de sostenibilidad e impacto</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          {sent ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Revisa tu correo</h1>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">{message}</p>
              <p className="text-xs text-gray-500 mb-6">
                El enlace vence en 60 minutos y solo puede usarse una vez.
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio de sesión
              </a>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Recupera tu contraseña
              </h1>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Escribe el correo con el que te registraste y te enviaremos un enlace
                para elegir una contraseña nueva.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900
                                 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending || !email}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300
                             text-white font-semibold py-2.5 rounded-lg transition-colors
                             flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando…
                    </>
                  ) : (
                    'Enviar enlace de recuperación'
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <a
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al inicio de sesión
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
