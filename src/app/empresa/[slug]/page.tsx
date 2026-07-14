"use client";

import { useEffect, useState, use } from 'react';
import { publicDownloadUrl, type PublicLandingData } from '@/lib/repositories/dataroom-repository';
import {
  Leaf, MapPin, Layers, Link2, Download, FileText, ShieldCheck,
  Loader2, SearchX, ArrowRight, Building2,
} from 'lucide-react';

type State =
  | { status: 'loading' }
  | { status: 'ok'; data: PublicLandingData }
  | { status: 'notfound' }
  | { status: 'error' };

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function EmpresaLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/proxy/dataroom/public/${slug}`)
      .then(async res => {
        if (cancelled) return;
        if (res.status === 404) { setState({ status: 'notfound' }); return; }
        if (!res.ok) { setState({ status: 'error' }); return; }
        const data = (await res.json()) as PublicLandingData;
        if (!data?.organization) { setState({ status: 'notfound' }); return; }
        setState({ status: 'ok', data });
      })
      .catch(() => { if (!cancelled) setState({ status: 'error' }); });
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (state.status === 'ok') document.title = `${state.data.organization.name} · EYWA`;
  }, [state]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Marca EYWA */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">EYWA</span>
          </a>
          <a href="/" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            Ir a la plataforma <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {state.status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">Cargando…</p>
          </div>
        )}

        {(state.status === 'notfound' || state.status === 'error') && (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
              <SearchX className="w-8 h-8 text-gray-400" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Esta empresa no está disponible</h1>
            <p className="text-sm text-gray-500 max-w-md mb-6">
              El enlace puede haber cambiado, o su perfil público fue desactivado.
            </p>
            <a href="/" className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
              Conocer EYWA
            </a>
          </div>
        )}

        {state.status === 'ok' && (() => {
          const { organization: org, completeness, documents } = state.data;
          const pct = completeness.percentage;

          return (
            <>
              {/* Encabezado de la empresa */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{org.name}</h1>
                    {org.description && (
                      <p className="text-gray-600 leading-relaxed mb-4">{org.description}</p>
                    )}
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                      {org.sector  && <span className="flex items-center gap-1.5"><Layers className="w-4 h-4" />{org.sector}</span>}
                      {org.country && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{org.country}</span>}
                      {org.website && (
                        <a href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
                           target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-1.5 text-emerald-600 hover:underline">
                          <Link2 className="w-4 h-4" />Sitio web
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sello de transparencia */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    pct === 100 ? 'bg-emerald-100' : pct >= 50 ? 'bg-amber-100' : 'bg-gray-100'
                  }`}>
                    <ShieldCheck className={`w-6 h-6 ${
                      pct === 100 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xl font-bold text-gray-900">{pct}%</span>
                      <span className="text-sm text-gray-500">de dataroom completo</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${pct === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Documentación corporativa organizada y verificable en EYWA.
                    </p>
                  </div>
                </div>
              </div>

              {/* Documentos públicos */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-700">
                    Documentos públicos
                    <span className="ml-2 text-xs font-normal text-gray-400">{documents.length}</span>
                  </h2>
                </div>

                {documents.length === 0 ? (
                  <div className="p-10 text-center">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Esta empresa aún no ha publicado documentos.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {documents.map(doc => (
                      <a
                        key={doc.id}
                        href={publicDownloadUrl(doc.id)}
                        className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{doc.item}</div>
                          <div className="text-xs text-gray-400 truncate">
                            {doc.folder} · {doc.file_name} · {formatSize(doc.size)}
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-gray-300 group-hover:text-emerald-600 transition-colors flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="mt-6 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 md:p-8 text-center">
                <h2 className="text-lg md:text-xl font-bold text-white mb-2">Ordena tu empresa y ábrele la puerta a la inversión</h2>
                <p className="text-emerald-100 text-sm mb-5 max-w-lg mx-auto">
                  Con EYWA organizas tu documentación, mides tu impacto ESG y generas confianza ante inversores y bancos.
                </p>
                <a href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-50 transition-colors">
                  Crear mi dataroom <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </>
          );
        })()}
      </main>
    </div>
  );
}
