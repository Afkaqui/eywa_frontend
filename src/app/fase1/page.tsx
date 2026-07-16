"use client";

import { useState, useEffect, useRef } from 'react';
import {
  Stethoscope, Network, BarChart2, BarChart3,
  GraduationCap, Building2, CheckCircle2, Leaf,
  ArrowRight, ChevronDown, ChevronUp, Zap,
  Target, Users, TrendingUp, Globe, Shield,
  CheckCheck, Clock, Rocket, Copy, Check,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Tool {
  id: string;
  icon: React.ElementType;
  color: string;
  name: string;
  tagline: string;
  what: string;
  how: string[];
  why: string;
  forWho: string;
}

// ── Content ───────────────────────────────────────────────────────────────────

const TOOLS: Tool[] = [
  {
    id: 'diagnostic',
    icon: Stethoscope,
    color: '#10b981',
    name: 'Diagnóstico ESG',
    tagline: 'Autoevaluación con metodología GENES Perú',
    what: 'Autoevaluación basada en la metodología GENES Perú: 14 criterios ponderados en 4 categorías (Perfil de Emprendimiento, Ambiental, Social y Económico), con escala 0-5 y bandas de cumplimiento oficiales.',
    how: [
      'Responde los 14 criterios con opciones adaptadas a cada uno (binarias, rangos, madurez)',
      'El sistema pondera cada respuesta con los pesos oficiales de la metodología',
      'Recibes tu nota global (0-5), tu banda de cumplimiento y el desglose por categoría',
      'El resultado ES tu Índice ESG: alimenta Mi Organización y el portfolio automáticamente',
    ],
    why: 'Sin saber dónde estás, no puedes saber hacia dónde ir. El diagnóstico revela brechas concretas con una metodología real de evaluación de emprendimientos sostenibles.',
    forWho: 'Empresas, cooperativas, pymes e instituciones que quieran conocer su punto de partida en sostenibilidad.',
  },
  {
    id: 'simbiocreacion',
    icon: Network,
    color: '#ec4899',
    name: 'Simbiocreación',
    tagline: 'Mapea y documenta sesiones de co-creación',
    what: 'Herramienta para registrar y visualizar sesiones de innovación colaborativa. Cada sesión se representa como un grafo interactivo que conecta participantes, grupos e ideas.',
    how: [
      'Crea una sesión con nombre, fecha, lugar y objetivos',
      'Define los ODS (Objetivos de Desarrollo Sostenible) relacionados',
      'Construye el grafo: nodos de categorías, grupos y personas participantes',
      'Agrega ideas y etiquetas que nacen de la sesión',
      'Comparte el grafo públicamente o mantenlo privado',
    ],
    why: 'La innovación colaborativa pierde valor si no se documenta. Simbiocreación convierte una sesión efímera en un mapa visual permanente que puede compartirse, replicarse y analizarse.',
    forWho: 'Facilitadores, consultores de innovación, universidades y organizaciones que realizan talleres de co-creación.',
  },
  {
    id: 'esg',
    icon: Leaf,
    color: '#0ea5e9',
    name: 'Índice ESG',
    tagline: 'Tu nota de sostenibilidad, derivada del diagnóstico',
    what: 'El índice ESG de cada organización se calcula directamente de su diagnóstico GENES: nota global 0-5, banda de cumplimiento y desglose por las 4 categorías. Sin edición manual — el dato nace de la metodología.',
    how: [
      'Completa el Diagnóstico ESG (metodología GENES)',
      'El índice se calcula automáticamente: nota 0-5, % de cumplimiento y banda',
      'Se muestra en Mi Organización y ante inversionistas en el portfolio',
      'Rehaz la evaluación cuando mejores prácticas: el índice se actualiza solo',
    ],
    why: 'Los compromisos ESG sin métricas son solo intenciones. Un índice trazable a una metodología real es auditable y comparable — esencial para reportes e inversionistas.',
    forWho: 'Áreas de sostenibilidad, responsables ESG, inversionistas de impacto y organismos reguladores.',
  },
  {
    id: 'portfolio',
    icon: BarChart3,
    color: '#f59e0b',
    name: 'Portfolio de Inversión',
    tagline: 'Empresas reales, actores del ecosistema y fondos',
    what: 'Vista consolidada del ecosistema: las empresas de la plataforma (con su score ESG del diagnóstico GENES), empresas externas curadas por el gestor, el Directorio de Actores (320 organizaciones del ecosistema de impacto de Perú y Colombia) y el catálogo de Fondos (146 oportunidades de financiamiento).',
    how: [
      'Las empresas verificadas entran solas al registrarse: score, banda y riesgo salen de su diagnóstico',
      'El gestor puede sumar empresas externas al portafolio',
      'Explora actores por país y categoría, con favoritos personales',
      'Filtra fondos por ámbito, instrumento y fecha de cierre (catálogo Premium)',
    ],
    why: 'Los capitales se mueven hacia activos sostenibles. Una visión consolidada de empresas con scores trazables, actores y financiamiento disponible permite mejores decisiones de inversión.',
    forWho: 'Fondos de inversión, family offices, bancas de desarrollo e instituciones financieras con mandato ESG.',
  },
  {
    id: 'edutech',
    icon: GraduationCap,
    color: '#8b5cf6',
    name: 'Academia',
    tagline: 'Cursos con examen y certificados verificables',
    what: 'Plataforma de cursos por secciones (video + recursos) con progreso guardado, examen final corregido en servidor y certificado con código único de verificación pública.',
    how: [
      'Explora el catálogo e inscríbete en los cursos de tu interés',
      'Avanza sección por sección: el progreso se guarda automáticamente',
      'Al completar todo el contenido se desbloquea el examen final',
      'Aprueba y descarga tu certificado en PDF, verificable por su código',
    ],
    why: 'El conocimiento es la base de cualquier transformación. Un certificado verificable convierte la formación en una credencial real ante terceros.',
    forWho: 'Profesionales, equipos organizacionales, estudiantes y cualquier persona que quiera profundizar en sostenibilidad.',
  },
  {
    id: 'organization',
    icon: Building2,
    color: '#3b82f6',
    name: 'Mi Organización',
    tagline: 'Perfil, índice ESG, dataroom y mini-landing pública',
    what: 'El centro de la empresa en EYWA: perfil completo con logo, su Índice ESG (del diagnóstico), y un Dataroom con 10 carpetas y 50 documentos requeridos con % de completitud — el sello de confianza ante inversores. Puede activar una mini-landing pública en /empresa/[slug].',
    how: [
      'Completa el perfil de tu organización y sube tu logo',
      'Organiza tu documentación corporativa en el Dataroom (todo nace privado)',
      'Publica documento por documento lo que quieras mostrar',
      'Activa tu mini-landing pública para compartir con inversores y bancos',
    ],
    why: 'Una empresa ordenada y verificable genera confianza. El dataroom con completitud medible le abre la puerta a inversión y financiamiento.',
    forWho: 'Cualquier organización que use EYWA: el perfil es el punto de partida.',
  },
  {
    id: 'validator',
    icon: CheckCircle2,
    color: '#06b6d4',
    name: 'Validador de Proyectos',
    tagline: 'Registra y estructura tus proyectos de impacto',
    what: 'Herramienta para registrar proyectos con su descripción y documentación, listos para ser evaluados. El análisis con inteligencia artificial está en integración y se habilitará próximamente.',
    how: [
      'Crea tu proyecto con nombre, descripción y objetivos',
      'Adjunta la documentación de respaldo',
      'Tus proyectos quedan listados con su estado',
      'Próximamente: análisis con IA (viabilidad, ODS y áreas de mejora)',
    ],
    why: 'Muchas buenas ideas fracasan por falta de claridad o estructura. Registrar y documentar el proyecto es el primer paso; el análisis automatizado llegará encima de esa base.',
    forWho: 'Emprendedores, equipos de innovación, ONGs y cualquier equipo que desarrolle proyectos de impacto.',
  },
];

// ── Ecosystem Graph (SVG, static radial) ─────────────────────────────────────

function EcosystemGraph() {
  const svgRef  = useRef<SVGSVGElement>(null);
  const [dims, setDims] = useState({ w: 600, h: 420 });
  const animRef = useRef<number>(0);
  const tRef    = useRef(0);
  const [, setTick] = useState(0);
  const [hov, setHov] = useState<string | null>(null);

  useEffect(() => {
    const el = svgRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      setDims({ w: e.contentRect.width, h: Math.max(340, e.contentRect.height) });
    });
    ro.observe(el);
    setDims({ w: el.clientWidth, h: Math.max(340, el.clientHeight) });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const step = () => { tRef.current += 0.01; setTick(t => t + 1); animRef.current = requestAnimationFrame(step); };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const cx = dims.w / 2;
  const cy = dims.h / 2;
  const R  = Math.min(dims.w, dims.h) * 0.33;

  const nodes = TOOLS.map((t, i) => {
    const angle = (2 * Math.PI * i) / TOOLS.length - Math.PI / 2;
    return { ...t, x: cx + Math.cos(angle) * R, y: cy + Math.sin(angle) * R, angle };
  });

  const rootR = 48 + Math.sin(tRef.current) * 2;

  return (
    <svg ref={svgRef} width={dims.w} height={dims.h} className="w-full select-none">
      <defs>
        <filter id="glow2">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id="rootGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#14b8a6"/>
          <stop offset="100%" stopColor="#059669"/>
        </radialGradient>
      </defs>

      {/* Connections */}
      {nodes.map(n => {
        const active  = hov === n.id;
        const opacity = active ? 0.9 : 0.35 + Math.sin(tRef.current + n.angle) * 0.12;
        return (
          <line key={`l-${n.id}`}
            x1={cx} y1={cy} x2={n.x} y2={n.y}
            stroke={n.color}
            strokeWidth={active ? 2.5 : 1.5}
            strokeOpacity={opacity}
            strokeDasharray={active ? '0' : '5 5'}
          />
        );
      })}

      {/* Tool nodes */}
      {nodes.map(n => {
        const active = hov === n.id;
        const pulse  = 1 + (active ? 0.1 : Math.sin(tRef.current * 0.8 + n.angle * 2) * 0.025);
        const r = 30 * pulse;
        const Icon = n.icon;
        const words = n.name.split(' ');
        return (
          <g key={n.id} style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHov(n.id)}
            onMouseLeave={() => setHov(null)}>
            {active && <circle cx={n.x} cy={n.y} r={r + 10} fill={n.color} fillOpacity={0.12}/>}
            <circle cx={n.x} cy={n.y} r={r}
              fill={n.color} fillOpacity={active ? 1 : 0.85}
              stroke="white" strokeWidth={2}
              filter={active ? 'url(#glow2)' : undefined}/>
            <text textAnchor="middle" fill="white" fontWeight="600" style={{ pointerEvents: 'none' }}>
              {words.map((w, wi) => (
                <tspan key={wi} x={n.x}
                  dy={wi === 0 ? (words.length > 1 ? -5 : 0) : 11}
                  fontSize={7.5}>
                  {w}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}

      {/* Root */}
      <g>
        <circle cx={cx} cy={cy} r={rootR + 12} fill="#059669" fillOpacity={0.08}/>
        <circle cx={cx} cy={cy} r={rootR}
          fill="url(#rootGrad)"
          stroke="white" strokeWidth={3}
          filter="url(#glow2)"/>
        <text x={cx} y={cy - 7} textAnchor="middle" fill="white" fontSize={15} fontWeight="800">EYWA</text>
        <text x={cx} y={cy + 9} textAnchor="middle" fill="white" fontSize={8} opacity={0.85}>Plataforma</text>
        <text x={cx} y={cy + 20} textAnchor="middle" fill="white" fontSize={8} opacity={0.85}>Sostenible</text>
      </g>
    </svg>
  );
}

// ── Tool Card ─────────────────────────────────────────────────────────────────

function ToolCard({ tool }: { tool: Tool }) {
  const [open, setOpen] = useState(false);
  const Icon = tool.icon;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-5 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: tool.color + '18' }}>
          <Icon className="w-6 h-6" style={{ color: tool.color }}/>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-gray-900">{tool.name}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{tool.tagline}</p>
            </div>
            <button onClick={() => setOpen(o => !o)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 text-gray-400">
              {open ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
            </button>
          </div>
          {/* Qué es */}
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">{tool.what}</p>
        </div>
      </div>

      {/* Expandable detail */}
      {open && (
        <div className="px-5 pb-5 space-y-5 border-t border-gray-50 pt-4">

          {/* Cómo funciona */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" style={{ color: tool.color }}/> Cómo funciona
            </p>
            <ol className="space-y-2">
              {tool.how.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: tool.color }}>
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-600 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Por qué importa */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" style={{ color: tool.color }}/> Por qué importa
            </p>
            <p className="text-sm text-gray-600 leading-relaxed pl-5 border-l-2" style={{ borderColor: tool.color + '60' }}>
              {tool.why}
            </p>
          </div>

          {/* Para quién */}
          <div className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3">
            <Users className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5"/>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-0.5">Para quién</p>
              <p className="text-sm text-gray-600">{tool.forWho}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="inline-flex items-center gap-2 text-sm font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors">
      <span>{url}</span>
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600"/> : <Copy className="w-3.5 h-3.5 text-emerald-500"/>}
    </button>
  );
}

export default function ResumenPage() {
  const url = 'https://eywa-hazel.vercel.app';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── FASE 1 BANNER ── */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wider">
              FASE 1
            </span>
            <span className="text-sm font-medium opacity-90">MVP funcional · Plataforma EYWA en producción</span>
          </div>
          <CopyButton url={url}/>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <Globe className="w-3.5 h-3.5"/> Plataforma de Sostenibilidad
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            ¿Qué es <span className="text-emerald-600">EYWA</span>?
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8">
            EYWA es una plataforma integrada que acompaña a organizaciones en su camino hacia la sostenibilidad.
            Combina diagnóstico, medición, colaboración, formación y gestión de impacto en un solo ecosistema digital.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: Shield,       label: 'Basado en estándares ESG',    color: '#0ea5e9' },
              { icon: TrendingUp,   label: 'Medición continua',           color: '#10b981' },
              { icon: Users,        label: 'Colaboración y co-creación',  color: '#ec4899' },
              { icon: GraduationCap, label: 'Formación especializada',    color: '#8b5cf6' },
            ].map(({ icon: Icon, label, color }) => (
              <span key={label} className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl">
                <Icon className="w-4 h-4" style={{ color }}/>{label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-14">

        {/* ── ECOSYSTEM GRAPH ── */}
        <section>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">El ecosistema EYWA</h2>
            <p className="text-gray-500 mt-1.5">7 herramientas conectadas, un único objetivo: organizaciones más sostenibles</p>
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-[400px] sm:h-[460px]">
              <EcosystemGraph/>
            </div>
            <div className="px-6 pb-6 flex flex-wrap gap-3 justify-center border-t border-gray-50 pt-4">
              {TOOLS.map(t => (
                <div key={t.id} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }}/>
                  {t.name}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT CONNECTS ── */}
        <section>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Cómo se conectan las herramientas</h2>
            <p className="text-gray-500 mt-1.5">Cada módulo alimenta y potencia a los demás</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: 'Conoce dónde estás',
                desc:  'El Diagnóstico ESG y el perfil de Organización establecen la línea base: quién eres, en qué sector operas y cuán maduro es tu enfoque sostenible.',
                icons: [Stethoscope, Building2],
                colors: ['#10b981', '#3b82f6'],
                step: '01',
              },
              {
                title: 'Mide y colabora',
                desc:  'Tu Índice ESG nace del diagnóstico y se actualiza con cada evaluación. Simbiocreación documenta el aprendizaje colectivo. El Validador estructura tus proyectos de impacto.',
                icons: [Leaf, Network, CheckCircle2],
                colors: ['#0ea5e9', '#ec4899', '#06b6d4'],
                step: '02',
              },
              {
                title: 'Crece y reporta',
                desc:  'El Portfolio conecta empresas verificadas, actores del ecosistema y fondos de financiamiento. La Academia cierra brechas de conocimiento con certificados verificables.',
                icons: [BarChart3, GraduationCap],
                colors: ['#f59e0b', '#8b5cf6'],
                step: '03',
              },
            ].map(({ title, desc, icons, colors, step }) => (
              <div key={step} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="text-5xl font-extrabold text-gray-100 mb-4">{step}</div>
                <div className="flex gap-2 mb-4">
                  {icons.map((Icon, i) => (
                    <div key={i} className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: colors[i] + '18' }}>
                      <Icon className="w-5 h-5" style={{ color: colors[i] }}/>
                    </div>
                  ))}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TOOLS DETAIL ── */}
        <section>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Las herramientas en detalle</h2>
            <p className="text-gray-500 mt-1.5">Expande cada tarjeta para ver cómo funciona y por qué importa</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TOOLS.map(tool => (
              <ToolCard key={tool.id} tool={tool}/>
            ))}
          </div>
        </section>

        {/* ── FASE 1 ENTREGABLES ── */}
        <section>
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
              <Rocket className="w-3.5 h-3.5"/> FASE 1 · MVP
            </span>
            <h2 className="text-2xl font-bold text-gray-900">Lo construido en Fase 1</h2>
            <p className="text-gray-500 mt-1.5">Frontend (Next.js 15) + Backend (Hono.js) + Base de datos (PostgreSQL + Prisma) en producción</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Completado */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <CheckCheck className="w-5 h-5 text-emerald-500"/>
                <span className="font-bold text-gray-900">Implementado</span>
                <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Listo
                </span>
              </div>
              <ul className="space-y-3">
                {[
                  { label: 'Autenticación completa',           sub: 'Registro, login, roles (user / gestor / admin / superadmin), avatar de usuario' },
                  { label: 'Diagnóstico ESG — metodología GENES', sub: '14 criterios ponderados, 4 categorías, bandas de cumplimiento' },
                  { label: 'Índice ESG derivado del diagnóstico', sub: 'Nota 0-5, banda y desglose por categoría en Mi Organización' },
                  { label: 'Mi Organización + Dataroom',        sub: 'Perfil con logo, 10 carpetas / 50 documentos, % de completitud' },
                  { label: 'Mini-landing pública por empresa',  sub: '/empresa/[slug] — logo, sello de transparencia y documentos públicos' },
                  { label: 'Portfolio híbrido',                 sub: 'Empresas verificadas (score del diagnóstico) + externas del gestor' },
                  { label: 'Directorio de Actores',             sub: '320 organizaciones del ecosistema (Perú y Colombia), filtros y favoritos' },
                  { label: 'Catálogo de Fondos (Premium)',      sub: '146 oportunidades de financiamiento con filtros y fechas de cierre' },
                  { label: 'Academia (Edutech)',                sub: 'Secciones con video, examen final y certificados con verificación pública' },
                  { label: 'Simbiocreación',                    sub: 'CRUD, grafo interactivo drag/zoom, editor completo, visor público' },
                  { label: 'Validador de Proyectos',            sub: 'Registro de proyectos y documentación (análisis IA en integración)' },
                  { label: 'Notificaciones',                    sub: 'Avisos accionables derivados del estado de la cuenta' },
                  { label: 'Dashboards por rol',                sub: 'Vistas diferenciadas para Gestor, Admin, Superadmin' },
                  { label: 'API REST en VPS + Deploy en Vercel', sub: 'Hono.js · Docker · PostgreSQL · CI/CD automático desde GitHub' },
                ].map(({ label, sub }) => (
                  <li key={label} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5"/>
                    <div>
                      <span className="text-sm font-semibold text-gray-800">{label}</span>
                      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Próximas fases */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Clock className="w-5 h-5 text-amber-500"/>
                  <span className="font-bold text-gray-900">Fase 2 · Por construir</span>
                  <span className="ml-auto text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                    Próximo
                  </span>
                </div>
                <ul className="space-y-2.5">
                  {[
                    'Análisis con IA del Validador (integración en curso)',
                    'Recuperación de contraseña e invitaciones al Dataroom (correo transaccional)',
                    'Subida de contenido de documentos en el Validador',
                    'Fórmula real de puntaje y ranking en Simbiocreación',
                    'Más casos de notificaciones (diagnóstico, dataroom, fondos por cerrar)',
                    'Módulo de reportes PDF exportables',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-200 flex-shrink-0 mt-0.5"/>
                      <span className="text-sm text-gray-500">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Rocket className="w-5 h-5 text-purple-500"/>
                  <span className="font-bold text-gray-900">Fase 3 · Visión</span>
                  <span className="ml-auto text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                    Roadmap
                  </span>
                </div>
                <ul className="space-y-2.5">
                  {[
                    'Marketplace de proyectos sostenibles',
                    'Red de co-inversión entre portafolios',
                    'Certificación ESG con blockchain',
                    'Inteligencia artificial para recomendaciones personalizadas',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full border-2 border-purple-200 flex-shrink-0 mt-0.5"/>
                      <span className="text-sm text-gray-500">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── STACK TÉCNICO ── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-500"/> Stack técnico (Fase 1)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { layer: 'Frontend',   tech: 'Next.js 15',         sub: 'React + TypeScript + Tailwind' },
              { layer: 'Backend',    tech: 'Hono.js',             sub: 'Node.js · API REST · Docker'  },
              { layer: 'Base de datos', tech: 'PostgreSQL',       sub: 'Prisma ORM · VPS propio'       },
              { layer: 'Deploy',     tech: 'Vercel + VPS',        sub: 'CI/CD GitHub · 161.132.54.226' },
            ].map(({ layer, tech, sub }) => (
              <div key={layer} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{layer}</p>
                <p className="text-sm font-bold text-gray-900">{tech}</p>
                <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-10 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-5 tracking-wider">
            FASE 1 · EN PRODUCCIÓN
          </div>
          <h2 className="text-2xl font-extrabold mb-3">Explora la plataforma</h2>
          <p className="text-emerald-100 mb-7 max-w-xl mx-auto">
            Accede al MVP funcional de EYWA. Todas las herramientas de Fase 1 están disponibles y corriendo en producción.
          </p>
          <a href="/"
            className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-7 py-3.5 rounded-2xl hover:bg-emerald-50 transition-colors shadow-lg">
            Ir a la plataforma <ArrowRight className="w-4 h-4"/>
          </a>
        </section>

        <p className="text-center text-xs text-gray-400 pb-2">
          eywa-hazel.vercel.app/fase1 · EYWA Fase 1 · 2026
        </p>
      </div>
    </div>
  );
}
