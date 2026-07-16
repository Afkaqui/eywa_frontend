"use client";

import { useEffect, useState } from 'react';
import { Leaf, Loader2, TrendingUp, ArrowRight, Info } from 'lucide-react';
import { DiagnosticRepository, type DiagnosticResultRow } from '@/lib/repositories/diagnostic-repository';
import {
  GENES_SCALE,
  GENES_MAX_POINTS,
  GENES_CATEGORIES,
  getGenesBand,
} from '@/lib/constants/scoring';

// Índice ESG dirigido por el diagnóstico GENES.
// El diagnóstico ES el índice: la nota global (0-5) y las 4 categorías salen del
// último resultado guardado. No hay edición manual — se recalcula al rehacer el test.

interface Props {
  /** Permite al CTA llevar al usuario a la vista de diagnóstico. */
  onNavigate?: (view: string) => void;
}

// Categorías GENES que se muestran como desglose (en orden), 'general' se omite.
const CATEGORY_ORDER = ['perfil', 'ambiental', 'social', 'economico'] as const;

const CATEGORY_COLORS: Record<string, string> = {
  perfil:    'bg-indigo-500',
  ambiental: 'bg-emerald-500',
  social:    'bg-amber-500',
  economico: 'bg-sky-500',
};

// Banda GENES → color/estilo del badge.
function bandStyle(score: number): string {
  if (score >= 61) return 'bg-emerald-100 text-emerald-700';
  if (score >= 46) return 'bg-lime-100 text-lime-700';
  if (score >= 31) return 'bg-amber-100 text-amber-700';
  return 'bg-rose-100 text-rose-700';
}

interface CategoryScore {
  key: string;
  label: string;
  avg: number;   // 0-5
  count: number; // criterios respondidos en la categoría
}

// Promedio 0-5 por categoría a partir del breakdown (cada item es un criterio 0-5).
function categoryScores(breakdown: DiagnosticResultRow['breakdown']): CategoryScore[] {
  return CATEGORY_ORDER.map((key) => {
    const items = breakdown.filter((b) => (b.category ?? 'general') === key);
    const sum = items.reduce((acc, b) => acc + (b.score ?? 0), 0);
    const avg = items.length ? sum / items.length : 0;
    return { key, label: GENES_CATEGORIES[key] ?? key, avg, count: items.length };
  }).filter((c) => c.count > 0);
}

export function EsgIndexPanel({ onNavigate }: Props) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<DiagnosticResultRow | null>(null);

  useEffect(() => {
    let alive = true;
    const repo = new DiagnosticRepository();
    repo.getLatestResult()
      .then((r) => { if (alive) setResult(r); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  // ── Sin diagnóstico aún: invitar a hacerlo ──────────────────────────────────
  if (!result) {
    return (
      <div className="border border-dashed border-gray-300 rounded-2xl p-10 text-center bg-gray-50/60">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <Leaf className="w-7 h-7 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Aún no tienes un índice ESG</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
          Tu índice ESG se calcula a partir del <strong>Diagnóstico</strong> (metodología GENES).
          Complétalo y tu nota global y por categoría aparecerán aquí automáticamente.
        </p>
        <button
          onClick={() => onNavigate?.('diagnostic')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          Hacer el diagnóstico ESG
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // score viene en escala 0-75 (GENES). Índice global 0-5 y banda.
  const index5 = (result.score / GENES_SCALE) * GENES_MAX_POINTS;
  const band = result.level || getGenesBand(result.score);
  const cats = categoryScores(result.breakdown);
  const completed = result.created_at
    ? new Date(result.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="space-y-6">
      {/* Nota global */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Leaf className="w-4 h-4 text-emerald-600" />
              Índice ESG · Diagnóstico GENES
            </div>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-light text-gray-900">{index5.toFixed(2)}</span>
              <span className="text-xl text-gray-400 mb-1.5">/ 5.00</span>
            </div>
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bandStyle(result.score)}`}>
                {band}
              </span>
              {completed && (
                <span className="text-xs text-gray-400">Actualizado el {completed}</span>
              )}
            </div>
          </div>

          {/* Anillo de progreso */}
          <div className="relative w-28 h-28 shrink-0 mx-auto md:mx-0">
            <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
              <path
                className="text-gray-100"
                stroke="currentColor" strokeWidth="3.2" fill="none"
                d="M18 2.5a15.5 15.5 0 1 1 0 31 15.5 15.5 0 0 1 0-31"
              />
              <path
                className="text-emerald-500"
                stroke="currentColor" strokeWidth="3.2" fill="none" strokeLinecap="round"
                strokeDasharray={`${(result.score / GENES_SCALE) * 97.4}, 97.4`}
                d="M18 2.5a15.5 15.5 0 1 1 0 31 15.5 15.5 0 0 1 0-31"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-semibold text-gray-800">{Math.round(result.percentage)}%</span>
              <span className="text-[10px] text-gray-400">cumplimiento</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desglose por categoría GENES */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700">Desglose por categoría</h3>
        </div>
        <div className="space-y-4">
          {cats.map((c) => (
            <div key={c.key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-600">{c.label}</span>
                <span className="text-sm font-medium text-gray-800">{c.avg.toFixed(1)} / 5</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${CATEGORY_COLORS[c.key] ?? 'bg-emerald-500'}`}
                  style={{ width: `${(c.avg / GENES_MAX_POINTS) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nota + CTA para actualizar */}
      <div className="flex items-start gap-3 bg-emerald-50/70 border border-emerald-100 rounded-xl p-4">
        <Info className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
        <div className="text-sm text-emerald-800/90">
          Este índice se recalcula cada vez que actualizas tu diagnóstico.{' '}
          <button
            onClick={() => onNavigate?.('diagnostic')}
            className="font-semibold underline underline-offset-2 hover:text-emerald-900"
          >
            Rehacer diagnóstico
          </button>
        </div>
      </div>
    </div>
  );
}
