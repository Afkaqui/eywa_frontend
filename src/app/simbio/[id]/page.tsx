"use client";

import { useEffect, useState, use } from 'react';
import { NetworkGraph } from '@/components/SimbiocreacionDashboard';
import type { Simbiocreacion } from '@/lib/types/database';
import { Network, MapPin, Calendar, Link2, Loader2, SearchX, ArrowRight, Lock } from 'lucide-react';

interface PublicSimbio extends Simbiocreacion {
  user?: { fullName: string | null; company: string | null } | null;
}

type State =
  | { status: 'loading' }
  | { status: 'ok'; item: PublicSimbio }
  | { status: 'notfound' }
  | { status: 'error' };

export default function SimbioPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/proxy/simbiocreacion/public/${id}`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) { setState({ status: 'notfound' }); return; }
        if (!res.ok) { setState({ status: 'error' }); return; }
        const data = await res.json();
        const item = data?.simbiocreacion as PublicSimbio | undefined;
        if (!item) { setState({ status: 'notfound' }); return; }
        setState({ status: 'ok', item });
      })
      .catch(() => { if (!cancelled) setState({ status: 'error' }); });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (state.status === 'ok') document.title = `${state.item.nombre} · EYWA Simbiocreación`;
  }, [state]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra superior con marca */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 md:gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="EYWA Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
            <div>
              <div className="text-gray-900 font-bold text-base md:text-xl tracking-tight">
                EYWA <span className="text-gray-300 font-normal">·</span> <span className="text-sm text-gray-500 font-normal">Simbiocreación</span>
              </div>
              <div className="text-emerald-600 text-[10px] md:text-xs tracking-wider hidden sm:block">ORQUESTACIÓN DE ECOSISTEMAS</div>
            </div>
          </a>
          <a href="/" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            Ir a la plataforma <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {state.status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">Cargando simbiocreación…</p>
          </div>
        )}

        {(state.status === 'notfound' || state.status === 'error') && (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
              {state.status === 'notfound'
                ? <Lock className="w-8 h-8 text-gray-400" />
                : <SearchX className="w-8 h-8 text-gray-400" />}
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              {state.status === 'notfound' ? 'Esta simbiocreación no está disponible' : 'No se pudo cargar'}
            </h1>
            <p className="text-sm text-gray-500 max-w-md mb-6">
              {state.status === 'notfound'
                ? 'El enlace puede haber cambiado, o su autor la marcó como privada.'
                : 'Ocurrió un problema al obtener el contenido. Intenta de nuevo más tarde.'}
            </p>
            <a href="/" className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
              Conocer EYWA
            </a>
          </div>
        )}

        {state.status === 'ok' && (() => {
          const item = state.item;
          const autor = item.user?.fullName || item.user?.company || null;
          return (
            <>
              {/* Encabezado del proyecto */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">Proyecto público</span>
                  {autor && <span className="text-xs text-gray-400">por {autor}</span>}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{item.nombre}</h1>
                {item.descripcion && (
                  <p className="text-gray-600 leading-relaxed mb-4">{item.descripcion}</p>
                )}
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                  {item.lugar && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{item.lugar}</span>}
                  {item.fecha && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{item.fecha}{item.horaInicio ? ` · ${item.horaInicio}` : ''}</span>}
                  {item.link && (
                    <a href={item.link.startsWith('http') ? item.link : `https://${item.link}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-emerald-600 hover:underline">
                      <Link2 className="w-4 h-4" />Más información
                    </a>
                  )}
                </div>
                {Array.isArray(item.tags) && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {item.tags.map((t, i) => (
                      <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">{t}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Grafo */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-2">
                  <Network className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-gray-700">Mapa de la simbiocreación</span>
                  <span className="ml-auto text-xs text-gray-400 hidden md:block">Arrastra para explorar · usa la rueda para acercar</span>
                </div>
                <div className="h-[60vh] min-h-[400px] bg-gray-50">
                  <NetworkGraph item={item} />
                </div>
              </div>

              {/* CTA */}
              <div className="mt-6 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 md:p-8 text-center">
                <h2 className="text-lg md:text-xl font-bold text-white mb-2">Crea y dimensiona tus propios proyectos</h2>
                <p className="text-emerald-100 text-sm mb-5 max-w-lg mx-auto">
                  EYWA te ayuda a maquetar proyectos sostenibles, mapear a sus actores y medir su impacto.
                </p>
                <a href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-50 transition-colors">
                  Empezar en EYWA <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </>
          );
        })()}
      </main>
    </div>
  );
}
