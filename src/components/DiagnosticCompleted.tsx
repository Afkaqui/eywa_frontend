"use client";

import { CheckCircle2, RefreshCw, ArrowRight, Leaf } from 'lucide-react';
import type { DiagnosticResult } from '@/lib/types/database';
import {
  GENES_SCALE,
  GENES_MAX_POINTS,
  GENES_CATEGORIES,
  getGenesBand,
  getGenesBandClasses,
} from '@/lib/constants/scoring';

// Pantalla de entrada al nav "Diagnóstico" cuando el usuario YA lo completó:
// muestra su resultado y ofrece realizar una nueva evaluación (que lo reemplaza).

interface Props {
  result: DiagnosticResult;
  onRetake: () => void;
  onNavigate?: (view: string) => void;
}

const CATEGORY_ORDER = ['perfil', 'ambiental', 'social', 'economico'] as const;

const CATEGORY_COLORS: Record<string, string> = {
  perfil:    'bg-indigo-500',
  ambiental: 'bg-emerald-500',
  social:    'bg-amber-500',
  economico: 'bg-sky-500',
};

export function DiagnosticCompleted({ result, onRetake, onNavigate }: Props) {
  const index5 = (result.score / GENES_SCALE) * GENES_MAX_POINTS;
  const band = getGenesBand(result.score);
  const pct = Math.round((result.score / GENES_SCALE) * 100);
  const date = result.completedAt
    ? new Date(result.completedAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const cats = CATEGORY_ORDER.map((key) => {
    const items = (result.breakdown ?? []).filter((b) => (b.category ?? 'general') === key);
    const avg = items.length ? items.reduce((a, b) => a + (b.score ?? 0), 0) / items.length : 0;
    return { key, label: GENES_CATEGORIES[key] ?? key, avg, count: items.length };
  }).filter((c) => c.count > 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">

        {/* Encabezado: ya completado */}
        <div className="text-center mb-8 pt-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-light text-gray-900 mb-2">
            Ya completaste tu diagnóstico ESG
          </h1>
          {date && <p className="text-sm text-gray-500">Última evaluación: {date}</p>}
        </div>

        {/* Resultado */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 mb-5">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-light text-gray-900">{index5.toFixed(2)}</span>
                <span className="text-xl text-gray-400 mb-1.5">/ 5.00</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getGenesBandClasses(result.score)}`}>
                  {band}
                </span>
                <span className="text-xs text-gray-400">{pct}% de cumplimiento</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-emerald-600" />
            </div>
          </div>

          {cats.length > 0 && (
            <div className="space-y-3">
              {cats.map((c) => (
                <div key={c.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">{c.label}</span>
                    <span className="text-xs font-medium text-gray-700">{c.avg.toFixed(1)} / 5</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${CATEGORY_COLORS[c.key] ?? 'bg-emerald-500'}`}
                      style={{ width: `${(c.avg / GENES_MAX_POINTS) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRetake}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Realizar nueva evaluación
          </button>
          <button
            onClick={() => onNavigate?.('organization')}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Ver mi Índice ESG
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          La nueva evaluación reemplaza tu resultado actual y actualiza tu índice ESG y el portfolio.
        </p>
      </div>
    </div>
  );
}
