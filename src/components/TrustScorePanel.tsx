"use client";

// Panel del Trust Score (propuestas A–F, validadas en la maqueta).
//  A · gauge + escala de categorías GENES + puntos que faltan para subir
//  B · desglose agrupado por categoría, con peso, promedio y barras por color
//  C · "Dónde mejorar": top 3 por impacto (peso × lo que falta)
//  D · "Ver mi sello" como acción principal, "Repetir diagnóstico" secundaria
//  E · tarjeta blanca sólida (sin el degradado lechoso)
//  F · comparación con el diagnóstico anterior, SOLO si existe

import { useEffect, useMemo, useState } from 'react';
import { Award, ChevronDown, Stethoscope, ArrowRight, Upload, TrendingUp, TrendingDown, BadgeCheck } from 'lucide-react';
import { ProfessionalTrustGauge } from './ProfessionalTrustGauge';
import { calculatePercentage, getGenesBand, getGenesBandClasses, GENES_BANDS, GENES_CATEGORIES, GENES_SCALE } from '@/lib/constants/scoring';
import { DiagnosticRepository, type DiagnosticHistoryEntry } from '@/lib/repositories/diagnostic-repository';
import type { DiagnosticResult } from '@/lib/types/database';

// Respaldo si las preguntas no cargan: pesos de criterios_GENES.json por título.
const PESOS_GENES: Record<string, number> = {
  'formalización legal': .03, 'liderazgo femenino': .04, 'segmento de clientes': .07,
  'potencial de crecimiento': .10, 'sistema de m&e': .10, 'insumos sostenibles': .10,
  'huella ecológica': .03, 'certificación': .03, 'comercio justo': .08,
  'inclusión laboral': .07, 'reconocimientos': .10, 'economía circular': .07,
  'apoyo financiero': .03, 'viabilidad económica': .15,
};
const norm = (s: string) => s.trim().toLowerCase();
function pesoRespaldo(label: string): number {
  const l = norm(label);
  for (const [k, v] of Object.entries(PESOS_GENES)) if (l.startsWith(k) || l.includes(k)) return v;
  return 0;
}

const ORDEN_CAT = ['perfil', 'ambiental', 'social', 'economico', 'general'];
// Bandas de menor a mayor para la escala visual.
const BANDAS = [...GENES_BANDS].reverse();
const BANDA_COLOR: Record<string, string> = {
  'Marrón': 'bg-stone-300', 'Verde': 'bg-emerald-300', 'Plata': 'bg-slate-300', 'Oro': 'bg-amber-300', 'Fénix': 'bg-orange-600',
};

function colorBarra(pct: number) {
  if (pct >= 80) return 'bg-emerald-600';
  if (pct >= 50) return 'bg-amber-500';
  return 'bg-gray-300';
}

interface Props {
  result: DiagnosticResult;
  onRepeat?: () => void;
  onOpenDataroom?: () => void;
}

export function TrustScorePanel({ result, onRepeat, onOpenDataroom }: Props) {
  const repo = useMemo(() => new DiagnosticRepository(), []);
  const [pesos, setPesos] = useState<Record<string, number>>({});
  const [historia, setHistoria] = useState<DiagnosticHistoryEntry[]>([]);
  const [abiertas, setAbiertas] = useState<Record<string, boolean>>({});
  const [listo, setListo] = useState(false);

  useEffect(() => {
    let vivo = true;
    repo.getQuestions()
      .then(qs => { if (vivo) setPesos(Object.fromEntries(qs.map(q => [norm(q.title), q.weight]))); })
      .catch(() => {});
    repo.getHistory().then(h => { if (vivo) setHistoria(h); });
    const t = setTimeout(() => setListo(true), 60); // dispara la animación de las barras
    return () => { vivo = false; clearTimeout(t); };
  }, [repo]);

  const score = calculatePercentage(result.score, result.maxScore);
  const genes = result.score; // escala 0-75
  const banda = getGenesBand(genes);
  const idxBanda = BANDAS.findIndex(b => b.label === banda);
  const siguiente = BANDAS[idxBanda + 1];
  const faltan = siguiente ? Math.max(0, Math.ceil(siguiente.min - genes)) : 0;

  const items = useMemo(() => result.breakdown.map(it => {
    const pct = it.maxScore > 0 ? Math.round((it.score / it.maxScore) * 100) : 0;
    const peso = pesos[norm(it.label)] ?? pesoRespaldo(it.label);
    return { ...it, pct, peso, cat: it.category || 'general' };
  }), [result.breakdown, pesos]);

  const grupos = useMemo(() => {
    const m = new Map<string, typeof items>();
    for (const it of items) { if (!m.has(it.cat)) m.set(it.cat, []); m.get(it.cat)!.push(it); }
    return [...m.entries()]
      .sort((a, b) => ORDEN_CAT.indexOf(a[0]) - ORDEN_CAT.indexOf(b[0]))
      .map(([cat, its]) => ({
        cat,
        nombre: GENES_CATEGORIES[cat] ?? cat,
        peso: its.reduce((s, i) => s + i.peso, 0),
        prom: Math.round(its.reduce((s, i) => s + i.pct, 0) / its.length),
        its,
      }));
  }, [items]);

  // Impacto en puntos GENES (0-75) si el criterio llegara a 5/5.
  const mejoras = useMemo(() => items
    .map(it => ({ ...it, gana: it.peso * ((100 - it.pct) / 100) * GENES_SCALE }))
    .filter(it => it.gana >= 0.5)
    .sort((a, b) => b.gana - a.gana)
    .slice(0, 3), [items]);

  // F: diagnóstico anterior (la historia viene de antiguo a reciente).
  const anterior = historia.length >= 2 ? historia[historia.length - 2] : null;
  const delta = anterior ? Math.round((genes - anterior.score) * 10) / 10 : null;

  const fecha = new Date(result.completedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 md:p-8 lg:p-10">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 lg:gap-10">
        {/* A · Resumen */}
        <div className="flex flex-col items-center lg:items-start">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 self-start">Trust Score</div>
          <div className="w-full flex justify-center">
            <ProfessionalTrustGauge score={score} />
          </div>
          <div className="w-full mt-2">
            <div className="text-sm text-gray-500 text-center lg:text-left"><b className="text-gray-900">{score}/100</b> · {genes} de {GENES_SCALE} puntos GENES · autoevaluación</div>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${getGenesBandClasses(genes)}`}>
                <Award className="w-4 h-4" /> Categoría {banda}
              </span>
              {delta !== null && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${delta >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  {delta >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {delta >= 0 ? '+' : ''}{delta} vs. anterior
                </span>
              )}
            </div>

            {/* Escala de categorías */}
            <div className="mt-6">
              <div className="relative">
                <div className="flex gap-1 h-2.5">
                  {BANDAS.map(b => (
                    <div key={b.label} className={`flex-1 rounded-full ${b.label === banda ? BANDA_COLOR[b.label] : 'bg-gray-100'}`} />
                  ))}
                </div>
                <div
                  className="absolute -top-1 w-4 h-4 rounded-full bg-white border-2 border-emerald-700 shadow transition-all duration-700"
                  style={{ left: `calc(${Math.min(100, (genes / GENES_SCALE) * 100)}% - 8px)` }}
                  aria-hidden
                />
              </div>
              <div className="flex mt-2">
                {BANDAS.map(b => (
                  <span key={b.label} className={`flex-1 text-[11px] text-center ${b.label === banda ? 'font-semibold text-gray-900' : 'text-gray-400'}`}>{b.label}</span>
                ))}
              </div>
              <p className="mt-3 text-sm text-gray-600">
                {siguiente
                  ? <>Te faltan <b className="text-gray-900">{faltan} punto{faltan === 1 ? '' : 's'}</b> para llegar a <b className="text-gray-900">{siguiente.label}</b>.</>
                  : <>Estás en la categoría más alta.</>}
              </p>
            </div>

            {/* D · Acciones */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button onClick={onOpenDataroom} className="flex-1 px-5 py-3 bg-emerald-700 text-white rounded-full hover:bg-emerald-800 transition-all font-medium text-sm flex items-center justify-center gap-2">
                <BadgeCheck className="w-4 h-4" /> Ver mi sello
              </button>
              <button onClick={onRepeat} className="flex-1 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition-all font-medium text-sm flex items-center justify-center gap-2">
                <Stethoscope className="w-4 h-4" /> Repetir diagnóstico
              </button>
            </div>
            <div className="mt-3 text-xs text-gray-400">Completado el {fecha}{anterior ? ` · anterior: ${anterior.score} pts` : ''}</div>
          </div>
        </div>

        {/* B + C */}
        <div className="lg:pl-10 lg:border-l border-gray-100 min-w-0">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Desglose por categoría</div>
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl">
            {grupos.map(g => {
              const abierta = abiertas[g.cat] ?? false;
              return (
                <div key={g.cat}>
                  <button
                    onClick={() => setAbiertas(a => ({ ...a, [g.cat]: !abierta }))}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50/70 transition-colors"
                    aria-expanded={abierta}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-gray-900">{g.nombre}</span>
                        {g.peso > 0 && <span className="text-xs text-gray-400">peso {Math.round(g.peso * 100)}%</span>}
                      </div>
                      <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${colorBarra(g.prom)} transition-all duration-1000 ease-out`} style={{ width: listo ? `${g.prom}%` : 0 }} />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-10 text-right">{g.prom}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${abierta ? 'rotate-180' : ''}`} />
                  </button>
                  {abierta && (
                    <div className="px-4 pb-3 space-y-2.5">
                      {g.its.map((it, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 flex-1 min-w-0">
                            {it.label}
                            {it.peso > 0 && <span className="text-xs text-gray-400"> · {Math.round(it.peso * 100)}%</span>}
                          </span>
                          <div className="w-24 md:w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                            <div className={`h-full rounded-full ${colorBarra(it.pct)}`} style={{ width: `${it.pct}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-gray-700 w-8 text-right">{it.score}/{it.maxScore}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex gap-4 text-[11px] text-gray-400">
            <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-emerald-600" /> 80+</span>
            <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-amber-500" /> 50–79</span>
            <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-gray-300" /> &lt;50</span>
          </div>

          {mejoras.length > 0 && (
            <div className="mt-6">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Dónde mejorar</div>
              <div className="space-y-2">
                {mejoras.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <span className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{m.label}</div>
                      <div className="text-xs text-gray-500">Hoy {m.score}/{m.maxScore} · hasta <b className="text-emerald-700">+{m.gana.toFixed(1)} pts</b> GENES</div>
                    </div>
                    <button onClick={onOpenDataroom} className="text-xs font-medium text-emerald-700 hover:text-emerald-900 flex items-center gap-1 flex-shrink-0">
                      <Upload className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Subir evidencia</span> <ArrowRight className="w-3.5 h-3.5 sm:hidden" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
