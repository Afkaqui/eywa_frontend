'use client';

import { useEffect, useState } from 'react';
import { UserX, ArrowLeft, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { BRAND } from '@/lib/brand';

// Página PÚBLICA: solicitar la baja (eliminación) de la cuenta — derecho de
// cancelación de la Ley 29733. No borra nada al enviarse: un superadmin revisa la
// solicitud y elimina la cuenta o la rechaza; en ambos casos se avisa por correo.
// El backend responde siempre lo mismo, exista o no la cuenta (no revela qué
// correos están registrados).
export default function BajaPage() {
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [motivo, setMotivo] = useState('');
  const [confirmo, setConfirmo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Con sesión iniciada, el correo viene precargado (se puede cambiar).
  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(s => {
      if (s?.user?.email) setEmail(s.user.email);
      if (s?.user?.name) setNombre(s.user.name);
    }).catch(() => {});
  }, []);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true); setError('');
    try {
      const r = await fetch('/api/proxy/bajas', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nombre: nombre || null, motivo: motivo || null, confirmo }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d?.error ?? 'No se pudo enviar la solicitud');
      setListo(d?.mensaje ?? 'Recibimos tu solicitud.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la solicitud');
    } finally {
      setEnviando(false);
    }
  }

  const inp = 'w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BRAND.logo} alt="" className="w-10 h-10 object-contain" />
          <div>
            <div className="font-marca text-xl font-extrabold text-gray-900 tracking-tight">{BRAND.name}</div>
            <div className="text-xs text-emerald-600">{BRAND.tagline}</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          {listo ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Solicitud enviada</h1>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">{listo} Revisaremos la solicitud y te avisaremos por correo cuando la cuenta se elimine.</p>
              <a href="/" className="inline-flex items-center gap-2 text-sm text-emerald-700 font-medium"><ArrowLeft className="w-4 h-4" /> Volver al inicio</a>
            </div>
          ) : (
            <>
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Solicitar la baja de tu cuenta</h1>
              <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                Eliminaremos tu cuenta con sus organizaciones, documentos del dataroom, diagnósticos y proyectos.
                Un administrador revisa cada solicitud y te escribe al correo de la cuenta.
              </p>

              <form onSubmit={enviar} className="space-y-4">
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 mb-1.5">Correo de la cuenta *</span>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" className={inp} />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 mb-1.5">Nombre (opcional)</span>
                  <input value={nombre} onChange={e => setNombre(e.target.value)} maxLength={150} className={inp} />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 mb-1.5">¿Por qué te vas? (opcional)</span>
                  <textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={3} maxLength={2000} className={`${inp} resize-none`} placeholder="Nos ayuda a mejorar" />
                </label>

                <div className="flex gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-900">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={confirmo} onChange={e => setConfirmo(e.target.checked)} className="mt-0.5 accent-emerald-600" />
                    <span>Entiendo que la baja es <b>definitiva</b> y que no se podrán recuperar mis datos.</span>
                  </label>
                </div>

                {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

                <button
                  type="submit" disabled={enviando || !email || !confirmo}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-full transition-colors flex items-center justify-center gap-2"
                >
                  {enviando ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando…</> : 'Solicitar la baja'}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-gray-200 text-center">
                <a href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"><ArrowLeft className="w-4 h-4" /> Volver sin hacer nada</a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
