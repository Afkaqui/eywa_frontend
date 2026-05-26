"use client";

import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Edit3, Save, X, TrendingUp, BarChart2, Leaf, Users, Scale, Lightbulb, Link2 } from 'lucide-react';
import { EsgRepository } from '@/lib/repositories/esg-repository';
import type { EsgScores, EsgHistory } from '@/lib/types/database';

// ─── Data definitions ─────────────────────────────────────────────────────────

const DEFAULT_SCORES: EsgScores = {
  emisiones: 1, energia: 1, agua: 1,
  comunidad: 1, empleados: 1, seguridad: 1,
  cumplimiento: 1, transparencia: 1, etica: 1,
  tecnologia: 1, id: 1, capacitacion: 1,
  materiales: 1, logistica: 1, proveedores: 1,
};

type DimensionId = 'ambiental' | 'social' | 'gobernanza' | 'innovacion' | 'cadena';

interface SubDim {
  key: keyof EsgScores;
  label: string;
}

interface Dimension {
  id: DimensionId;
  label: string;
  Icon: React.ElementType;
  color: string;
  bgColor: string;
  subDimensions: SubDim[];
}

const DIMENSIONS: Dimension[] = [
  {
    id: 'ambiental',
    label: 'GESTIÓN AMBIENTAL',
    Icon: Leaf,
    color: '#10B981',
    bgColor: '#D1FAE5',
    subDimensions: [
      { key: 'emisiones', label: 'Emisiones' },
      { key: 'energia', label: 'Energía' },
      { key: 'agua', label: 'Agua / Residuos' },
    ],
  },
  {
    id: 'social',
    label: 'GESTIÓN SOCIAL',
    Icon: Users,
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    subDimensions: [
      { key: 'comunidad', label: 'Comunidad' },
      { key: 'empleados', label: 'Empleados' },
      { key: 'seguridad', label: 'Seguridad' },
    ],
  },
  {
    id: 'gobernanza',
    label: 'GOBERNANZA',
    Icon: Scale,
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    subDimensions: [
      { key: 'cumplimiento', label: 'Cumplimiento' },
      { key: 'transparencia', label: 'Transparencia' },
      { key: 'etica', label: 'Ética' },
    ],
  },
  {
    id: 'innovacion',
    label: 'GESTIÓN DE INNOVACIÓN',
    Icon: Lightbulb,
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    subDimensions: [
      { key: 'tecnologia', label: 'Tecnología Verde' },
      { key: 'id', label: 'I+D' },
      { key: 'capacitacion', label: 'Capacitación' },
    ],
  },
  {
    id: 'cadena',
    label: 'CADENA DE VALOR',
    Icon: Link2,
    color: '#EF4444',
    bgColor: '#FEE2E2',
    subDimensions: [
      { key: 'materiales', label: 'Materiales' },
      { key: 'logistica', label: 'Logística' },
      { key: 'proveedores', label: 'Proveedores' },
    ],
  },
];

// ─── Helper functions ─────────────────────────────────────────────────────────

function dimensionAvg(scores: EsgScores, dim: Dimension): number {
  const vals = dim.subDimensions.map((s) => scores[s.key] ?? 1);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function overallScore(scores: EsgScores): number {
  const all = Object.values(scores) as number[];
  return all.reduce((a, b) => a + b, 0) / all.length;
}

// ─── Radar Chart ─────────────────────────────────────────────────────────────

interface RadarChartProps {
  scores: EsgScores;
  compareScores?: EsgScores | null;
}

function RadarChart({ scores, compareScores }: RadarChartProps) {
  const cx = 160;
  const cy = 160;
  const maxR = 110;
  const levels = 5;

  // Angles: top = -90°, then +72° each (pentagon)
  const angles = DIMENSIONS.map((_, i) => ((-90 + i * 72) * Math.PI) / 180);

  function point(angle: number, r: number) {
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  function polygon(values: number[], opacity = 1) {
    const pts = values.map((v, i) => {
      const r = ((v - 1) / 4) * maxR;
      return point(angles[i], r);
    });
    return pts.map((p) => `${p.x},${p.y}`).join(' ');
  }

  const dimValues = DIMENSIONS.map((d) => dimensionAvg(scores, d));
  const compareValues = compareScores ? DIMENSIONS.map((d) => dimensionAvg(compareScores, d)) : null;

  return (
    <svg viewBox="0 0 320 320" className="w-full max-w-[300px] mx-auto">
      {/* Grid circles */}
      {Array.from({ length: levels }).map((_, i) => {
        const r = ((i + 1) / levels) * maxR;
        const pts = angles.map((a) => point(a, r));
        const d = pts.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
        return <path key={i} d={d} fill="none" stroke="#E5E7EB" strokeWidth="1" />;
      })}

      {/* Axis lines */}
      {angles.map((a, i) => {
        const outer = point(a, maxR);
        return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="#E5E7EB" strokeWidth="1" />;
      })}

      {/* Compare polygon */}
      {compareValues && (
        <polygon
          points={polygon(compareValues)}
          fill="rgba(59,130,246,0.15)"
          stroke="#3B82F6"
          strokeWidth="1.5"
          strokeDasharray="4 2"
        />
      )}

      {/* User polygon */}
      <polygon
        points={polygon(dimValues)}
        fill="rgba(16,185,129,0.2)"
        stroke="#10B981"
        strokeWidth="2"
      />

      {/* Axis dots */}
      {dimValues.map((v, i) => {
        const r = ((v - 1) / 4) * maxR;
        const p = point(angles[i], r);
        return <circle key={i} cx={p.x} cy={p.y} r="4" fill={DIMENSIONS[i].color} />;
      })}

      {/* Labels */}
      {DIMENSIONS.map((dim, i) => {
        const p = point(angles[i], maxR + 20);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fontWeight="600"
            fill="#6B7280"
          >
            {dim.id === 'ambiental' ? 'Ambiental' :
             dim.id === 'social' ? 'Social' :
             dim.id === 'gobernanza' ? 'Gobernanza' :
             dim.id === 'innovacion' ? 'Innovación' : 'Cadena'}
          </text>
        );
      })}

      {/* Level labels */}
      {[1, 2, 3, 4, 5].map((lvl) => {
        const r = ((lvl - 1) / 4) * maxR;
        return (
          <text key={lvl} x={cx + 4} y={cy - r + 3} fontSize="8" fill="#9CA3AF">
            {lvl}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Line Chart ──────────────────────────────────────────────────────────────

interface LineChartProps {
  history: EsgHistory[];
  visibleSeries: Set<string>;
}

const SERIES_COLORS: Record<string, string> = {
  total: '#10B981',
  ambiental: '#10B981',
  social: '#3B82F6',
  gobernanza: '#8B5CF6',
  innovacion: '#F59E0B',
  cadena: '#EF4444',
};

function LineChart({ history, visibleSeries }: LineChartProps) {
  const W = 560;
  const H = 220;
  const padL = 40;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Aún no hay historial guardado. Edita tus valores para comenzar.
      </div>
    );
  }

  function seriesValues(id: string): number[] {
    return history.map((h) => {
      if (id === 'total') return overallScore(h.scores);
      const dim = DIMENSIONS.find((d) => d.id === id);
      return dim ? dimensionAvg(h.scores, dim) : 0;
    });
  }

  const n = history.length;
  const xStep = n > 1 ? chartW / (n - 1) : chartW;

  function toPath(values: number[]) {
    return values
      .map((v, i) => {
        const x = padL + (n > 1 ? i * xStep : chartW / 2);
        const y = padT + chartH - ((v - 1) / 4) * chartH;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }

  const seriesIds = ['total', ...DIMENSIONS.map((d) => d.id)];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Grid */}
      {[1, 2, 3, 4, 5].map((lvl) => {
        const y = padT + chartH - ((lvl - 1) / 4) * chartH;
        return (
          <g key={lvl}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#F3F4F6" strokeWidth="1" />
            <text x={padL - 6} y={y + 4} fontSize="9" fill="#9CA3AF" textAnchor="end">
              {lvl}
            </text>
          </g>
        );
      })}

      {/* X axis dates */}
      {history.map((h, i) => {
        const x = padL + (n > 1 ? i * xStep : chartW / 2);
        const date = new Date(h.createdAt).toLocaleDateString('es', { month: 'short', day: 'numeric' });
        return (
          <text key={i} x={x} y={H - 8} fontSize="8" fill="#9CA3AF" textAnchor="middle">
            {date}
          </text>
        );
      })}

      {/* Series lines */}
      {seriesIds.map((id) => {
        if (!visibleSeries.has(id)) return null;
        const values = seriesValues(id);
        const color = id === 'total' ? '#10B981' : SERIES_COLORS[id];
        return (
          <g key={id}>
            <path
              d={toPath(values)}
              fill="none"
              stroke={color}
              strokeWidth={id === 'total' ? 2.5 : 1.5}
              strokeDasharray={id === 'total' ? undefined : '4 2'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {values.map((v, i) => {
              const x = padL + (n > 1 ? i * xStep : chartW / 2);
              const y = padT + chartH - ((v - 1) / 4) * chartH;
              return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
            })}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Slider ───────────────────────────────────────────────────────────────────

interface SliderRowProps {
  label: string;
  value: number;
  color: string;
  editing: boolean;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, color, editing, onChange }: SliderRowProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-32 text-sm text-gray-600 font-medium flex-shrink-0">{label}</div>
      <div className="flex-1 relative">
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          disabled={!editing}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer disabled:cursor-default"
          style={{
            background: editing
              ? `linear-gradient(to right, ${color} 0%, ${color} ${((value - 1) / 4) * 100}%, #E5E7EB ${((value - 1) / 4) * 100}%, #E5E7EB 100%)`
              : `linear-gradient(to right, #9CA3AF 0%, #9CA3AF ${((value - 1) / 4) * 100}%, #E5E7EB ${((value - 1) / 4) * 100}%, #E5E7EB 100%)`,
          }}
        />
      </div>
      <div className="w-6 text-sm font-semibold text-gray-700 text-right flex-shrink-0">{value}</div>
    </div>
  );
}

// ─── Accordion ────────────────────────────────────────────────────────────────

interface AccordionProps {
  dim: Dimension;
  scores: EsgScores;
  editing: boolean;
  open: boolean;
  onToggle: () => void;
  onChange: (key: keyof EsgScores, v: number) => void;
}

function Accordion({ dim, scores, editing, open, onToggle, onChange }: AccordionProps) {
  const avg = dimensionAvg(scores, dim);
  const Icon = dim.Icon;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: dim.bgColor }}>
            <Icon className="w-4 h-4" style={{ color: dim.color }} />
          </div>
          <span className="text-xs font-bold tracking-wider text-gray-700">{dim.label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold" style={{ color: dim.color }}>
            {avg.toFixed(1)}
          </span>
          {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-4 bg-white border-t border-gray-100">
          {dim.subDimensions.map((sub) => (
            <SliderRow
              key={sub.key}
              label={sub.label}
              value={scores[sub.key] ?? 1}
              color={dim.color}
              editing={editing}
              onChange={(v) => onChange(sub.key, v)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const esgRepo = new EsgRepository();

type TabId = 'indice' | 'historial';

export function EsgDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('indice');
  const [scores, setScores] = useState<EsgScores>(DEFAULT_SCORES);
  const [editingScores, setEditingScores] = useState<EsgScores>(DEFAULT_SCORES);
  const [editing, setEditing] = useState(false);
  const [history, setHistory] = useState<EsgHistory[]>([]);
  const [openDims, setOpenDims] = useState<Set<DimensionId>>(new Set(['ambiental']));
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visibleSeries, setVisibleSeries] = useState<Set<string>>(new Set(['total']));

  // Load from backend
  useEffect(() => {
    esgRepo
      .get()
      .then(({ esgScore, history }) => {
        if (esgScore?.scores) {
          const s = { ...DEFAULT_SCORES, ...esgScore.scores } as EsgScores;
          setScores(s);
          setEditingScores(s);
        }
        setHistory(history);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const score = useMemo(() => overallScore(scores), [scores]);
  const editScore = useMemo(() => overallScore(editingScores), [editingScores]);

  function handleStartEdit() {
    setEditingScores({ ...scores });
    setEditing(true);
    // Open all accordions in edit mode
    setOpenDims(new Set(DIMENSIONS.map((d) => d.id)));
  }

  function handleCancel() {
    setEditingScores({ ...scores });
    setEditing(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await esgRepo.save(editingScores);
      setScores({ ...editingScores });
      // Refresh history
      const { history: newHistory } = await esgRepo.get();
      setHistory(newHistory);
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function handleSliderChange(key: keyof EsgScores, v: number) {
    setEditingScores((prev) => ({ ...prev, [key]: v }));
  }

  function toggleDim(id: DimensionId) {
    setOpenDims((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSeries(id: string) {
    setVisibleSeries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const displayScores = editing ? editingScores : scores;
  const displayScore = editing ? editScore : score;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Cargando Índice ESG…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Índice de Madurez ESG</h1>
            <p className="text-sm text-gray-500 mt-0.5">Evalúa y mejora el desempeño sostenible de tu organización</p>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {([['indice', 'Mi Índice', BarChart2], ['historial', 'Historial', TrendingUp]] as const).map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* ─── MI ÍNDICE TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'indice' && (
          <div>
            {/* Score Banner */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Tu Índice ESG</div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-light text-gray-900">
                      {displayScore.toFixed(2)}
                    </span>
                    <span className="text-xl text-gray-400">/ 5.00</span>
                    <span
                      className="px-3 py-1 rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor:
                          displayScore >= 4 ? '#D1FAE5' :
                          displayScore >= 3 ? '#FEF3C7' :
                          displayScore >= 2 ? '#DBEAFE' : '#FEE2E2',
                        color:
                          displayScore >= 4 ? '#065F46' :
                          displayScore >= 3 ? '#92400E' :
                          displayScore >= 2 ? '#1E40AF' : '#991B1B',
                      }}
                    >
                      {displayScore >= 4 ? 'Avanzado' :
                       displayScore >= 3 ? 'Intermedio' :
                       displayScore >= 2 ? 'En desarrollo' : 'Inicial'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!editing ? (
                    <button
                      onClick={handleStartEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Editar valores
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancelar
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60"
                      >
                        {saving ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {saving ? 'Guardando…' : 'Guardar cambios'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Accordions */}
              <div className="space-y-3">
                {DIMENSIONS.map((dim) => (
                  <Accordion
                    key={dim.id}
                    dim={dim}
                    scores={displayScores}
                    editing={editing}
                    open={openDims.has(dim.id)}
                    onToggle={() => toggleDim(dim.id)}
                    onChange={handleSliderChange}
                  />
                ))}
              </div>

              {/* Right: Radar + comparison */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">Perfil ESG</h3>
                  <RadarChart scores={displayScores} />

                  {/* Dimension breakdown */}
                  <div className="mt-4 space-y-2">
                    {DIMENSIONS.map((dim) => {
                      const avg = dimensionAvg(displayScores, dim);
                      const pct = ((avg - 1) / 4) * 100;
                      return (
                        <div key={dim.id} className="flex items-center gap-3">
                          <div className="w-20 text-xs text-gray-500 flex-shrink-0 capitalize">
                            {dim.id === 'ambiental' ? 'Ambiental' :
                             dim.id === 'social' ? 'Social' :
                             dim.id === 'gobernanza' ? 'Gobernanza' :
                             dim.id === 'innovacion' ? 'Innovación' : 'Cadena'}
                          </div>
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: dim.color }}
                            />
                          </div>
                          <div className="w-7 text-xs font-semibold text-right" style={{ color: dim.color }}>
                            {avg.toFixed(1)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ESG Scale explanation */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Escala de madurez</h3>
                  <div className="space-y-2">
                    {[
                      { lvl: '1 – Inicial', desc: 'Prácticas ESG inexistentes o no formalizadas', color: '#EF4444' },
                      { lvl: '2 – En desarrollo', desc: 'Primeros pasos e iniciativas aisladas', color: '#3B82F6' },
                      { lvl: '3 – Intermedio', desc: 'Procesos definidos, aplicación parcial', color: '#F59E0B' },
                      { lvl: '4 – Avanzado', desc: 'Sistema integrado y medible', color: '#10B981' },
                      { lvl: '5 – Líder', desc: 'Referente sectorial, innovación continua', color: '#065F46' },
                    ].map((item) => (
                      <div key={item.lvl} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <div>
                          <span className="text-xs font-semibold text-gray-800">{item.lvl}</span>
                          <span className="text-xs text-gray-500"> — {item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── HISTORIAL TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'historial' && (
          <div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Historial ESG</h2>
              <p className="text-sm text-gray-500 mb-6">Evolución de tu puntaje a lo largo del tiempo</p>

              <div className="overflow-x-auto">
                <LineChart history={history} visibleSeries={visibleSeries} />
              </div>

              {/* Series toggles */}
              <div className="flex flex-wrap gap-3 mt-4 border-t border-gray-100 pt-4">
                {[
                  { id: 'total', label: 'ESG Total', color: '#10B981' },
                  ...DIMENSIONS.map((d) => ({
                    id: d.id,
                    label: d.id === 'ambiental' ? 'Ambiental' :
                           d.id === 'social' ? 'Social' :
                           d.id === 'gobernanza' ? 'Gobernanza' :
                           d.id === 'innovacion' ? 'Innovación' : 'Cadena de Valor',
                    color: d.color,
                  })),
                ].map((series) => (
                  <button
                    key={series.id}
                    onClick={() => toggleSeries(series.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      visibleSeries.has(series.id)
                        ? 'border-transparent text-white'
                        : 'border-gray-200 text-gray-500 bg-white'
                    }`}
                    style={
                      visibleSeries.has(series.id)
                        ? { backgroundColor: series.color }
                        : {}
                    }
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: visibleSeries.has(series.id) ? 'white' : series.color }}
                    />
                    {series.label}
                  </button>
                ))}
              </div>

              {/* History table */}
              {history.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Registros</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left text-xs font-medium text-gray-400 py-2 pr-4">Fecha</th>
                          <th className="text-right text-xs font-medium text-gray-400 py-2 px-2">Total</th>
                          {DIMENSIONS.map((d) => (
                            <th key={d.id} className="text-right text-xs font-medium py-2 px-2" style={{ color: d.color }}>
                              {d.id === 'ambiental' ? 'Amb.' :
                               d.id === 'social' ? 'Soc.' :
                               d.id === 'gobernanza' ? 'Gov.' :
                               d.id === 'innovacion' ? 'Inn.' : 'Cad.'}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...history].reverse().slice(0, 10).map((h) => (
                          <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-2 pr-4 text-gray-500 text-xs">
                              {new Date(h.createdAt).toLocaleDateString('es', {
                                year: 'numeric', month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </td>
                            <td className="py-2 px-2 text-right font-semibold text-emerald-600">
                              {overallScore(h.scores).toFixed(2)}
                            </td>
                            {DIMENSIONS.map((d) => (
                              <td key={d.id} className="py-2 px-2 text-right text-gray-600">
                                {dimensionAvg(h.scores, d).toFixed(1)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
