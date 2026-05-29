"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Stethoscope, Network, BarChart2, BarChart3,
  GraduationCap, Building2, TrendingUp, Users, BookOpen,
  Leaf, RefreshCw,
} from 'lucide-react';
import { SimbiocreacionRepository } from '@/lib/repositories/simbiocreacion-repository';
import { DiagnosticRepository } from '@/lib/repositories/diagnostic-repository';
import { DiagnosticService } from '@/lib/services/diagnostic-service';

// ── EYWA Ecosystem Graph ──────────────────────────────────────────────────────

interface ENode {
  id: string; label: string; sublabel: string;
  color: string; ring: number; angle: number;
  r: number; icon?: React.ReactNode;
}

const MODULE_DEFS = [
  { id: 'diag',    label: 'Diagnóstico',    color: '#10b981', Icon: Stethoscope },
  { id: 'simbio',  label: 'Simbiocreación', color: '#ec4899', Icon: Network     },
  { id: 'esg',     label: 'ESG',            color: '#0ea5e9', Icon: Leaf         },
  { id: 'portfolio', label: 'Portfolio',    color: '#f59e0b', Icon: BarChart3   },
  { id: 'academia', label: 'Academia',      color: '#8b5cf6', Icon: GraduationCap },
  { id: 'org',     label: 'Organización',   color: '#3b82f6', Icon: Building2   },
];

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sub }:
  { icon: React.ElementType; label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '1a' }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-2xl font-extrabold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── EYWA SVG Graph ────────────────────────────────────────────────────────────
function EywaGraph({ stats }: { stats: Record<string, string> }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dims, setDims] = useState({ w: 700, h: 480 });
  const [hover, setHover] = useState<string | null>(null);
  const animRef = useRef<number>(0);
  const tRef    = useRef(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const el = svgRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      setDims({ w: e.contentRect.width, h: Math.max(380, e.contentRect.height) });
    });
    ro.observe(el);
    setDims({ w: el.clientWidth, h: Math.max(380, el.clientHeight) });
    return () => ro.disconnect();
  }, []);

  // Gentle pulse animation
  useEffect(() => {
    const step = () => {
      tRef.current += 0.012;
      setTick(t => t + 1);
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  void tick;

  const cx = dims.w / 2;
  const cy = dims.h / 2;
  const R1 = Math.min(dims.w, dims.h) * 0.28; // module ring radius
  const R2 = Math.min(dims.w, dims.h) * 0.44; // metric ring radius

  const modules = MODULE_DEFS.map((m, i) => {
    const angle = (2 * Math.PI * i) / MODULE_DEFS.length - Math.PI / 2;
    const mx = cx + Math.cos(angle) * R1;
    const my = cy + Math.sin(angle) * R1;
    // sub-node (metric)
    const sub = {
      x: cx + Math.cos(angle) * R2,
      y: cy + Math.sin(angle) * R2,
      label: stats[m.id] ?? '—',
    };
    return { ...m, x: mx, y: my, angle, sub };
  });

  // Pulse scale for root
  const rootPulse = 1 + Math.sin(tRef.current) * 0.035;
  const rootR = 52 * rootPulse;

  return (
    <svg ref={svgRef} width={dims.w} height={dims.h} className="select-none w-full">
      <defs>
        {/* Animated gradient for edges */}
        {modules.map(m => (
          <linearGradient key={m.id} id={`grad-${m.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.5" />
            <stop offset="100%" stopColor={m.color} stopOpacity="0.8" />
          </linearGradient>
        ))}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Root → module edges */}
      {modules.map(m => {
        const active = hover === m.id;
        const pulse  = active ? 1 : 0.5 + Math.sin(tRef.current + m.angle) * 0.15;
        return (
          <line key={`e-${m.id}`}
            x1={cx} y1={cy} x2={m.x} y2={m.y}
            stroke={m.color} strokeWidth={active ? 2.5 : 1.5}
            strokeOpacity={pulse}
            strokeDasharray={active ? '0' : '6 4'}
          />
        );
      })}

      {/* Module → metric edges */}
      {modules.map(m => (
        <line key={`e2-${m.id}`}
          x1={m.x} y1={m.y} x2={m.sub.x} y2={m.sub.y}
          stroke={m.color} strokeWidth={1} strokeOpacity={0.3}
          strokeDasharray="4 4"
        />
      ))}

      {/* Metric nodes (small) */}
      {modules.map(m => (
        <g key={`sub-${m.id}`}>
          <circle cx={m.sub.x} cy={m.sub.y} r={22}
            fill={m.color} fillOpacity={0.12}
            stroke={m.color} strokeWidth={1} strokeOpacity={0.4} />
          <text x={m.sub.x} y={m.sub.y - 4} textAnchor="middle" dominantBaseline="middle"
            fill={m.color} fontSize={11} fontWeight="700">
            {m.sub.label}
          </text>
          <text x={m.sub.x} y={m.sub.y + 9} textAnchor="middle"
            fill="#9ca3af" fontSize={7.5}>
            {m.id === 'diag' ? 'puntos' : m.id === 'esg' ? 'prom.' : m.id === 'portfolio' ? 'empresas' : 'items'}
          </text>
        </g>
      ))}

      {/* Module nodes */}
      {modules.map(m => {
        const isHover = hover === m.id;
        const scale   = isHover ? 1.12 : 1 + Math.sin(tRef.current * 0.7 + m.angle * 2) * 0.025;
        const r       = 32 * scale;
        return (
          <g key={m.id} style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHover(m.id)} onMouseLeave={() => setHover(null)}>
            {isHover && <circle cx={m.x} cy={m.y} r={r + 8} fill={m.color} fillOpacity={0.1} />}
            <circle cx={m.x} cy={m.y} r={r}
              fill={m.color} fillOpacity={isHover ? 0.95 : 0.82}
              stroke="white" strokeWidth={2}
              filter={isHover ? 'url(#glow)' : undefined} />
            <text x={m.x} y={m.y} textAnchor="middle" dominantBaseline="middle"
              fill="white" fontSize={8} fontWeight="600"
              style={{ pointerEvents: 'none' }}>
              {m.label.split(' ').map((w, wi) => (
                <tspan key={wi} x={m.x} dy={wi === 0 ? (m.label.includes(' ') ? -5 : 0) : 11}>{w}</tspan>
              ))}
            </text>
          </g>
        );
      })}

      {/* Root node */}
      <g>
        <circle cx={cx} cy={cy} r={rootR + 10}
          fill="#0d9488" fillOpacity={0.08} />
        <circle cx={cx} cy={cy} r={rootR}
          fill="#0d9488" fillOpacity={0.95}
          stroke="white" strokeWidth={3}
          filter="url(#glow)" />
        <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize={13} fontWeight="800">
          EYWA
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill="white" fontSize={7.5} opacity={0.8}>
          Plataforma
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" fill="white" fontSize={7.5} opacity={0.8}>
          Sostenible
        </text>
      </g>
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ResumenPage() {
  const { user, profile, loading } = useAuth();
  const router  = useRouter();
  const simbiRepo = useRef(new SimbiocreacionRepository());
  const diagSvc   = useRef(new DiagnosticService(new DiagnosticRepository()));

  const [diagScore,      setDiagScore]      = useState<number | null>(null);
  const [simbiosCount,   setSimbiosCount]   = useState<number | null>(null);
  const [simbiosTags,    setSimbiosTags]    = useState<number>(0);
  const [esgAvg,         setEsgAvg]         = useState<number | null>(null);
  const [portfolioCount, setPortfolioCount] = useState<number | null>(null);
  const [coursesCount,   setCoursesCount]   = useState<number | null>(null);
  const [orgDone,        setOrgDone]        = useState<boolean>(false);
  const [dataLoading,    setDataLoading]    = useState(true);

  const loadAll = useCallback(async (uid: string) => {
    setDataLoading(true);
    await Promise.allSettled([
      // Diagnóstico
      diagSvc.current.getLatestResult(uid)
        .then(r => { if (r) setDiagScore(Math.round((r.score / r.maxScore) * 100)); }),

      // Simbiocreaciones
      simbiRepo.current.getAll()
        .then(items => {
          setSimbiosCount(items.length);
          setSimbiosTags(items.reduce((s, i) => s + i.tags.length, 0));
        }),

      // ESG
      fetch('/api/proxy/esg', { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (!d?.esgScore?.scores) return;
          const vals = Object.values(d.esgScore.scores) as number[];
          setEsgAvg(Math.round(vals.reduce((a, b) => a + b, 0) / vals.length));
        }),

      // Portfolio
      fetch('/api/proxy/portfolio', { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(d => setPortfolioCount(d?.companies?.length ?? 0)),

      // Courses (enrollments)
      fetch('/api/proxy/courses/enrollments', { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(d => setCoursesCount(d?.enrollments?.length ?? 0)),

      // Organization
      fetch('/api/proxy/organization', { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(d => setOrgDone(!!d?.organization?.name)),
    ]);
    setDataLoading(false);
  }, []);

  useEffect(() => {
    if (user) loadAll(user.id);
  }, [user, loadAll]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <RefreshCw className="w-6 h-6 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!user) {
    router.replace('/');
    return null;
  }

  const fmt = (n: number | null, unit = '') =>
    n === null ? '…' : `${n}${unit}`;

  const graphStats: Record<string, string> = {
    diag:      diagScore     !== null ? `${diagScore}%`  : '—',
    simbio:    simbiosCount  !== null ? String(simbiosCount) : '—',
    esg:       esgAvg        !== null ? String(esgAvg)    : '—',
    portfolio: portfolioCount !== null ? String(portfolioCount) : '—',
    academia:  coursesCount  !== null ? String(coursesCount)  : '—',
    org:       orgDone ? '✓' : '—',
  };

  const name = profile?.fullName || profile?.email?.split('@')[0] || 'Usuario';
  const initials = name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── HEADER ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-4 h-14">
          <button onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <span className="font-bold text-gray-900">Resumen EYWA</span>
          <div className="ml-auto flex items-center gap-3">
            {dataLoading && <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── EYWA GRAPH ── */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 pt-6 pb-2 flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Ecosistema EYWA</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Tu huella en los 6 módulos de la plataforma
              </p>
            </div>
            <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full border border-teal-100">
              Datos en tiempo real
            </span>
          </div>
          <div className="h-[420px] sm:h-[500px]">
            <EywaGraph stats={graphStats} />
          </div>
          {/* Legend */}
          <div className="px-6 pb-6 flex flex-wrap gap-3 justify-center">
            {MODULE_DEFS.map(m => (
              <div key={m.id} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="text-xs text-gray-500">{m.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── STATS GRID ── */}
        <section>
          <h2 className="text-base font-bold text-gray-700 mb-4 uppercase tracking-wider text-xs">Métricas por módulo</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard icon={Stethoscope}   label="Diagnóstico"     value={fmt(diagScore, '%')}           color="#10b981" sub="madurez ESG" />
            <StatCard icon={Network}        label="Simbios"         value={fmt(simbiosCount)}              color="#ec4899" sub={`${simbiosTags} ideas/tags`} />
            <StatCard icon={BarChart2}      label="ESG promedio"    value={fmt(esgAvg)}                    color="#0ea5e9" sub="escala 1–10" />
            <StatCard icon={BarChart3}      label="Portfolio"       value={fmt(portfolioCount)}             color="#f59e0b" sub="empresas" />
            <StatCard icon={BookOpen}       label="Academia"        value={fmt(coursesCount)}               color="#8b5cf6" sub="cursos inscritos" />
            <StatCard icon={Building2}      label="Organización"    value={orgDone ? 'Completo' : 'Pendiente'} color="#3b82f6" sub={orgDone ? 'perfil listo' : 'sin perfil'} />
          </div>
        </section>

        {/* ── QUICK LINKS ── */}
        <section>
          <h2 className="text-xs font-bold text-gray-700 mb-4 uppercase tracking-wider">Acceso rápido</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Diagnóstico',     href: '/?view=diagnostic',     color: '#10b981', Icon: Stethoscope   },
              { label: 'Simbiocreación',  href: '/?view=simbiocreacion', color: '#ec4899', Icon: Network       },
              { label: 'ESG',             href: '/?view=hero',           color: '#0ea5e9', Icon: Leaf           },
              { label: 'Portfolio',       href: '/?view=portfolio',      color: '#f59e0b', Icon: BarChart3      },
              { label: 'Academia',        href: '/?view=edutech',        color: '#8b5cf6', Icon: GraduationCap  },
              { label: 'Organización',    href: '/?view=organization',   color: '#3b82f6', Icon: Building2      },
            ].map(({ label, href, color, Icon }) => (
              <a key={label} href={href}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: color + '1a' }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{label}</span>
              </a>
            ))}
          </div>
        </section>

        {/* ── FOOTER NOTE ── */}
        <p className="text-center text-xs text-gray-400 pb-4">
          eywa-hazel.vercel.app/resumen · actualizado al abrir la página
        </p>
      </main>
    </div>
  );
}
