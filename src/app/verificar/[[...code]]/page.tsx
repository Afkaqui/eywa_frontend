"use client";

import { useEffect, useState, use, useCallback } from 'react';
import {
  ShieldCheck, ShieldX, Loader2, Search, ArrowRight, GraduationCap, Calendar, User,
} from 'lucide-react';

// Verificación PÚBLICA de certificados de la Academia EYWA por código.
// /verificar            → formulario para escribir el código
// /verificar/EYWA-XXXX  → verifica directo (enlace del PDF)

interface VerifyResult {
  valid: boolean;
  code?: string;
  holder_name?: string;
  course_title?: string;
  instructor?: string | null;
  percentage?: number;
  issued_at?: string;
}

type State =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'done'; result: VerifyResult }
  | { status: 'error' };

export default function VerificarCertificadoPage({ params }: { params: Promise<{ code?: string[] }> }) {
  const { code: codeParam } = use(params);
  const initialCode = codeParam?.[0] ? decodeURIComponent(codeParam[0]) : '';

  const [code, setCode] = useState(initialCode);
  const [state, setState] = useState<State>({ status: 'idle' });

  const verify = useCallback(async (c: string) => {
    const clean = c.trim().toUpperCase();
    if (!clean) return;
    setState({ status: 'checking' });
    try {
      const res = await fetch(`/api/proxy/certificates/verify/${encodeURIComponent(clean)}`);
      if (res.status === 404) { setState({ status: 'done', result: { valid: false } }); return; }
      if (!res.ok) { setState({ status: 'error' }); return; }
      const data = (await res.json()) as VerifyResult;
      setState({ status: 'done', result: data });
    } catch {
      setState({ status: 'error' });
    }
  }, []);

  // Enlace directo: verifica automáticamente
  useEffect(() => {
    if (initialCode) verify(initialCode);
  }, [initialCode, verify]);

  const result = state.status === 'done' ? state.result : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Marca EYWA */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 md:gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="EYWA Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
            <div>
              <div className="text-gray-900 font-bold text-base md:text-xl tracking-tight">EYWA</div>
              <div className="text-emerald-600 text-[10px] md:text-xs tracking-wider hidden sm:block">ORQUESTACIÓN DE ECOSISTEMAS</div>
            </div>
          </a>
          <a href="/" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            Ir a la plataforma <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-8 py-12">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-7 h-7 text-emerald-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-light text-gray-900 mb-2">Verificación de certificados</h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Ingresa el código que aparece en el certificado de la Academia EYWA para comprobar su autenticidad.
          </p>
        </div>

        {/* Formulario */}
        <form
          onSubmit={(e) => { e.preventDefault(); verify(code); }}
          className="flex gap-2 mb-8"
        >
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Código de verificación (ej. EYWA-XXXXXXXX)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
          <button
            type="submit"
            disabled={state.status === 'checking' || !code.trim()}
            className="px-5 py-3 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {state.status === 'checking' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Verificar
          </button>
        </form>

        {/* Resultado */}
        {state.status === 'error' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center text-sm text-amber-800">
            No se pudo consultar en este momento. Intenta de nuevo en unos segundos.
          </div>
        )}

        {result && !result.valid && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center">
            <ShieldX className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Certificado no válido</h2>
            <p className="text-sm text-gray-600">
              El código ingresado no corresponde a ningún certificado emitido por la Academia EYWA.
              Revisa que esté escrito exactamente como aparece en el documento.
            </p>
          </div>
        )}

        {result && result.valid && (
          <div className="bg-white border border-emerald-200 rounded-2xl overflow-hidden">
            <div className="bg-emerald-600 px-6 py-4 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-white" />
              <div>
                <h2 className="text-white font-semibold">Certificado auténtico</h2>
                <p className="text-emerald-100 text-xs">Emitido por la Academia EYWA</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-500">Titular</div>
                  <div className="text-sm font-semibold text-gray-900">{result.holder_name}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <GraduationCap className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-500">Curso</div>
                  <div className="text-sm font-semibold text-gray-900">{result.course_title}</div>
                  {result.instructor && <div className="text-xs text-gray-500 mt-0.5">Instructor: {result.instructor}</div>}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-500">Emisión</div>
                  <div className="text-sm text-gray-900">
                    {result.issued_at && new Date(result.issued_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {typeof result.percentage === 'number' && (
                      <span className="ml-2 text-emerald-600 font-medium">· Calificación {result.percentage}%</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100 text-xs font-mono text-gray-400">
                {result.code}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
