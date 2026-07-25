"use client";

import { useEffect, useState } from 'react';
import { Leaf, Loader2, TrendingUp, ArrowRight, Info, History } from 'lucide-react';
import {
  DiagnosticRepository,
  type DiagnosticResultRow, type DiagnosticHistoryEntry,
} from '@/lib/repositories/diagnostic-repository';
import {
  GENES_SCALE,
  GENES_MAX_POINTS,
  GENES_CATEGORIES,
  getGenesBand,
  getGenesBandClasses,
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

// Categoría GENES → color/estilo del badge (fuente única en constants/scoring).
const bandStyle = getGenesBandClasses;

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
  const [history, setHistory] = useState<DiagnosticHistoryEntry[]>([]);

  useEffect(() => {
    let alive = true;
    const repo = new DiagnosticRepository();
    Promise.all([repo.getLatestResult(), repo.getHistory()])
      .then(([r, h]) => { if (alive) { setResult(r); setHistory(h); } })
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

      {/* Evolución del índice (solo con 2+ evaluaciones: con una no hay tendencia) */}
      {history.length > 1 && <EsgHistoryChart history={history} />}

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

// ── Evolución del índice ESG en el tiempo ─────────────────────────────────────
// Sustituye al viejo "Historial" del panel manual: aquí la serie es REAL — un
// punto por cada diagnóstico GENES realizado. SVG propio (sin librerías).
function EsgHistoryChart({ history }: { history: DiagnosticHistoryEntry[] }) {
  const W = 600, H = 160, PAD = 28;
  const pts = history.map((h, i) => {
    const x = PAD + (i / Math.max(history.length - 1, 1)) * (W - PAD * 2);
    const idx5 = (h.score / GENES_SCALE) * GENES_MAX_POINTS; // 0-5
    const y = H - PAD - (idx5 / GENES_MAX_POINTS) * (H - PAD * 2);
    return { x, y, h, idx5 };
  });
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${H - PAD} L ${pts[0].x.toFixed(1)} ${H - PAD} Z`;

  const first = pts[0].idx5;
  const last = pts[pts.length - 1].idx5;
  const delta = last - first;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700">Evolución de tu índice</h3>
        </div>
        <div className="text-xs">
          <span className="text-gray-400">{history.length} evaluaciones · </span>
          <span className={delta > 0 ? 'text-emerald-600 font-semibold' : delta < 0 ? 'text-rose-600 font-semibold' : 'text-gray-500'}>
            {delta > 0 ? '▲' : delta < 0 ? '▼' : '='} {Math.abs(delta).toFixed(2)} puntos desde la primera
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 180 }}>
        {/* Guías horizontales (0 a 5) */}
        {[0, 1, 2, 3, 4, 5].map((v) => {
          const y = H - PAD - (v / GENES_MAX_POINTS) * (H - PAD * 2);
          return (
            <g key={v}>
              <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#f3f4f6" strokeWidth="1" />
              <text x={PAD - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#9ca3af">{v}</text>
            </g>
          );
        })}

        <path d={area} fill="#10b981" fillOpacity="0.08" />
        <path d={line} fill="none" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {pts.map((p, i) => (
          <g key={p.h.id}>
            <circle cx={p.x} cy={p.y} r={i === pts.length - 1 ? 5 : 3.5} fill="#fff" stroke="#059669" strokeWidth="2" />
            <title>
              {`${new Date(p.h.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })} · ${p.idx5.toFixed(2)}/5 · ${p.h.level}`}
            </title>
          </g>
        ))}
      </svg>

      <div className="flex justify-between text-[10px] text-gray-400 px-6">
        <span>{new Date(history[0].created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
        <span>{new Date(history[history.length - 1].created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
      </div>
    </div>
  );
}
