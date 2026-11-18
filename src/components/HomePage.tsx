"use client";

import { useEffect, useState } from 'react';
import { ArrowRight, Check, ShieldCheck, FolderCheck, Search, Plus } from 'lucide-react';
import { BRAND } from '@/lib/brand';

// Foto del bosque amazónico (la misma que usaba la landing anterior).
const BOSQUE = 'https://images.unsplash.com/photo-1705998989555-87ed424a269d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600';

interface HomePageProps {
  onGetStarted: () => void;
}

interface PublicStats {
  organizations: number; diagnostics: number; actors: number;
  funds: number; certificates: number; documents: number;
}

// Respaldos reales (sin logos hasta tener permiso de uso).
const RESPALDOS = ['ProInnóvate', 'DER Cusco', 'Incuval Ventures · UNHEVAL', 'Lab to Market · UPCH', 'GENES Perú', 'ARS LAB'];

const FAQ = [
  { q: '¿Cuánto cuesta?', a: 'El diagnóstico es gratuito. Los planes para organizaciones están pendientes de publicar.' },
  { q: '¿Qué metodología usan?', a: 'La metodología GENES: 14 criterios ambientales, sociales y de gobernanza.' },
  { q: '¿Cómo verifica un fondo mi sello?', a: 'Con el enlace público del sello, que muestra el puntaje y el estado de la evidencia que lo respalda.' },
  { q: '¿Mis documentos son privados?', a: 'Sí. El contenido de tus documentos no se publica: el sello solo muestra si están verificados.' },
];

/** Palabras que entran una a una, desenfocadas (identidad v2). */
function Palabras({ texto, desde = 0, className = '' }: { texto: string; desde?: number; className?: string }) {
  return (
    <>
      {texto.split(' ').map((p, i) => (
        <span key={i} className={`ey-blur-in ${className}`} style={{ animationDelay: `${desde + i * 0.07}s` }}>
          {p}&nbsp;
        </span>
      ))}
    </>
  );
}

function Cifra({ valor, etiqueta }: { valor: number | null; etiqueta: string }) {
  return (
    <div className="ey-reveal border-t border-white/35 pt-5">
      {valor === null
        ? <div className="h-12 w-24 rounded-lg bg-white/15 animate-pulse" aria-label="Cargando" />
        : <div className="text-5xl font-semibold text-white">{valor}</div>}
      <div className="mt-1 text-sm text-emerald-100">{etiqueta}</div>
    </div>
  );
}

export function HomePage({ onGetStarted }: HomePageProps) {
  const [stats, setStats] = useState<PublicStats | null>(null);
  useEffect(() => {
    fetch('/api/proxy/stats/public')
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d && typeof d.actors === 'number') setStats(d); })
      .catch(() => {});
  }, []);
  const hoy = new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });

  const btnPrimario = 'inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3.5 text-base font-semibold text-emerald-950 transition-transform hover:-translate-y-0.5 hover:bg-emerald-400';
  const btnSecundario = 'inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3.5 text-base font-medium text-gray-900 transition-transform hover:-translate-y-0.5';

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ── Navegación ── */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="#inicio" className="flex items-center gap-2.5">
            <img src={BRAND.logo} alt={BRAND.name} className="h-9 w-9 object-contain md:h-10 md:w-10" />
            <span className="leading-tight">
              <span className="block text-lg font-bold tracking-wide">{BRAND.name}</span>
              <span className="hidden text-[10px] font-medium uppercase tracking-wider text-emerald-600 sm:block">{BRAND.tagline}</span>
            </span>
          </a>
          <div className="hidden items-center gap-1 text-sm text-gray-600 lg:flex">
            <a href="#problema" className="rounded-lg px-3 py-2 hover:text-gray-900">Beneficios</a>
            <a href="#como" className="rounded-lg px-3 py-2 hover:text-gray-900">Cómo funciona</a>
            <a href="#perfiles" className="rounded-lg px-3 py-2 hover:text-gray-900">Para quién</a>
            <a href="#faq" className="rounded-lg px-3 py-2 hover:text-gray-900">Preguntas</a>
            <a href={BRAND.agroUrl} className="rounded-lg px-3 py-2 hover:text-gray-900">{BRAND.agro}</a>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onGetStarted} className="hidden px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 sm:block">Iniciar sesión</button>
            <button onClick={onGetStarted} className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-emerald-950 transition-transform hover:-translate-y-0.5 hover:bg-emerald-400">
              Diagnóstico gratis
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section id="inicio" className="bg-gradient-to-b from-white to-gray-50">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <span className="ey-blur-in inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />Ganador ProInnóvate · Región Cusco
            </span>
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              <Palabras texto="Convierte tu impacto en" desde={0.05} />
              <Palabras texto="evidencia que financia" desde={0.35} className="text-emerald-600" />
            </h1>
            <p className="ey-blur-in max-w-xl text-lg leading-relaxed text-gray-600" style={{ animationDelay: '.6s' }}>
              {BRAND.name} diagnostica tu organización, ordena tus pruebas en un dataroom con sello verificable y te conecta con los fondos que encajan contigo.
            </p>
            <div className="ey-blur-in flex flex-col gap-3 sm:flex-row" style={{ animationDelay: '.75s' }}>
              <button onClick={onGetStarted} className={btnPrimario}>Haz tu diagnóstico gratis <ArrowRight className="h-4 w-4" /></button>
              <a href="#como" className={btnSecundario}>Cómo funciona</a>
            </div>
            <ul className="ey-blur-in grid max-w-md grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700" style={{ animationDelay: '.9s' }}>
              {['Sin tarjeta', 'Metodología GENES', 'Sello verificable', 'Resultado al terminar'].map(t => (
                <li key={t} className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" />{t}</li>
              ))}
            </ul>
          </div>

          {/* Teléfono con el sello (ilustración) */}
          <div className="relative flex justify-center py-6">
            <div className="ey-blur-in" style={{ animationDelay: '.3s' }}>
              <div className="ey-float w-[280px] -rotate-3 overflow-hidden rounded-[44px] border-[10px] border-gray-900 bg-white shadow-2xl">
                <div className="flex flex-col gap-3 p-4">
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <img src={BRAND.logo} alt="" className="h-5 w-5 object-contain" />Sello {BRAND.name}
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-2xl bg-gray-50 p-4">
                    <div className="flex h-28 w-28 items-center justify-center rounded-full" style={{ background: 'conic-gradient(#10b981 0 72%, #e5e7eb 72% 100%)' }}>
                      <div className="flex h-[86px] w-[86px] flex-col items-center justify-center rounded-full bg-white">
                        <span className="text-xs font-semibold text-gray-500">Trust Score</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">Tu organización</span>
                  </div>
                  <span className="rounded-full border border-emerald-200 px-3 py-2 text-xs text-emerald-700">✓ 14 criterios ESG evaluados</span>
                  <span className="rounded-full border border-emerald-200 px-3 py-2 text-xs text-emerald-700">✓ Evidencias en dataroom</span>
                  <span className="rounded-full bg-emerald-600 py-2.5 text-center text-xs font-semibold text-white">Ver evidencia →</span>
                </div>
              </div>
            </div>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-400">Vista de ejemplo</span>
          </div>
        </div>
      </section>

      {/* ── Marquesina de respaldos ── */}
      <section aria-label="Nos respaldan" className="overflow-hidden border-y border-gray-100 py-6">
        <div className="ey-marquee gap-14 whitespace-nowrap text-base font-semibold text-gray-400">
          {[...RESPALDOS, ...RESPALDOS].map((r, i) => <span key={i} className="px-7">{r}</span>)}
        </div>
      </section>

      {/* ── Problema ── */}
      <section id="problema" className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 py-24 sm:px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="ey-reveal-blur rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">• El problema</span>
          <h2 className="ey-reveal-blur max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
            <span className="text-gray-400">Ya hiciste el trabajo de impacto.</span> Ahora haz que cuente.
          </h2>
        </div>
        <div className="grid w-full gap-4 md:grid-cols-3">
          {[
            { icon: ShieldCheck, t: 'Un sello que se puede comprobar', d: 'Cada afirmación de impacto queda ligada a su evidencia. El evaluador no tiene que creerte: lo verifica.' },
            { icon: FolderCheck, t: 'Todo en un solo lugar', d: 'Diagnóstico, documentos y proyectos ordenados, en vez de correos y carpetas sueltas.' },
            { icon: Search, t: 'Los fondos te encuentran', d: 'Tu perfil se cruza con las convocatorias abiertas que encajan contigo.' },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="ey-lift ey-reveal flex min-h-[220px] flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-7">
              <Icon className="h-6 w-6 text-gray-900" strokeWidth={1.6} />
              <h3 className="mt-auto text-lg font-semibold">{t}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Banda de foto + cifras reales ── */}
      <section className="relative overflow-hidden bg-emerald-950">
        <img src={BOSQUE} alt="Bosque amazónico visto desde arriba" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-14 px-4 pb-16 pt-24 sm:px-6">
          <h2 className="ey-reveal-blur ml-auto max-w-2xl text-3xl font-semibold leading-tight text-white md:text-4xl">
            Los fondos ya no aceptan promesas. Si declaras impacto, tienes que poder probarlo.
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <Cifra valor={stats?.actors ?? null} etiqueta="actores del ecosistema mapeados" />
            <Cifra valor={stats?.funds ?? null} etiqueta="fondos y oportunidades activas" />
            <Cifra valor={stats?.documents ?? null} etiqueta="documentos de evidencia resguardados" />
          </div>
          <span className="text-xs text-emerald-200">● Datos en vivo de la plataforma · {hoy}</span>
        </div>
      </section>

      {/* ── Solución: filas imagen + texto ── */}
      <section className="mx-auto flex max-w-7xl flex-col gap-24 px-4 py-24 sm:px-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Nuestra solución</span>
          <h2 className="ey-reveal-blur max-w-3xl text-3xl tracking-tight md:text-4xl">
            Una plataforma para <b className="text-emerald-600">medir</b>, <b className="text-emerald-600">probar</b> y <b className="text-emerald-600">financiar</b> tu impacto
          </h2>
        </div>

        {[
          { n: 1, t: <>Hacemos tu <b className="text-emerald-600">diagnóstico</b> claro y comparable</>, d: '14 criterios ambientales, sociales y de gobernanza con la metodología GENES. Obtienes tu Trust Score y una hoja de ruta.', img: false },
          { n: 2, t: <>Guardamos tu <b className="text-emerald-600">evidencia</b> en un dataroom con sello</>, d: 'Cada documento queda ligado a lo que demuestra. Compartes un enlace y el evaluador ve el sello y su respaldo.', img: true },
          { n: 3, t: <>Te conectamos con los <b className="text-emerald-600">fondos</b> que encajan</>, d: 'ProInnóvate, Prociencia, cooperación internacional y más. Valida tu proyecto antes de postular y llega con la evidencia lista.', img: false },
        ].map(({ n, t, d, img }) => (
          <div key={n} className={`flex flex-col items-center gap-12 lg:flex-row ${n % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}>
            <div className="ey-reveal flex flex-1 flex-col gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 font-semibold">{n}</span>
              <h3 className="text-2xl leading-snug md:text-3xl">{t}</h3>
              <p className="leading-relaxed text-gray-600">{d}</p>
            </div>
            <div className="ey-reveal-pop ey-zoom relative h-72 w-full flex-1 overflow-hidden rounded-3xl bg-gray-100 md:h-80">
              {img ? (
                <>
                  <img src={BOSQUE} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-x-5 bottom-5 flex justify-between gap-3 rounded-xl bg-white/95 px-4 py-3 text-sm">
                    <span>Informe de impacto.pdf</span><span className="font-semibold text-emerald-700">✓ Verificado</span>
                  </div>
                </>
              ) : n === 1 ? (
                <div className="flex h-full flex-col justify-center gap-4 p-8">
                  {['Ambiental', 'Social', 'Gobernanza', 'Económica'].map((c, i) => (
                    <div key={c} className="text-sm">
                      <div className="flex justify-between text-gray-600"><span>{c}</span></div>
                      <div className="mt-1.5 h-2.5 rounded-full bg-white"><div className="h-2.5 rounded-full bg-emerald-500" style={{ width: `${[64, 80, 48, 56][i]}%` }} /></div>
                    </div>
                  ))}
                  <span className="text-xs text-gray-400">Vista de ejemplo</span>
                </div>
              ) : (
                <div className="flex h-full flex-col justify-center gap-3 p-6">
                  {[['Fondos no reembolsables', 'Encaje alto', 'bg-emerald-50 text-emerald-700'], ['Cooperación internacional', 'Encaje alto', 'bg-emerald-50 text-emerald-700'], ['Crédito verde', 'Encaje medio', 'bg-amber-50 text-amber-700']].map(([f, e, c]) => (
                    <div key={f} className="ey-lift flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4">
                      <span className="font-semibold">{f}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c}`}>{e}</span>
                    </div>
                  ))}
                  <span className="text-xs text-gray-400">Vista de ejemplo</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* ── Cómo funciona: columna fija + pasos ── */}
      <section id="como" className="bg-gray-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-24 sm:px-6 lg:flex-row lg:items-start">
          <div className="flex flex-col gap-4 lg:sticky lg:top-28 lg:w-[40%]">
            <span className="w-fit rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600">• Cómo funciona</span>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Del formulario al fondo en cuatro pasos</h2>
            <p className="text-gray-600"><b className="text-gray-900">Empiezas gratis.</b> Sin instalar nada y sin cambiar tus sistemas.</p>
            <button onClick={onGetStarted} className={`${btnPrimario} w-fit`}>Empezar ahora</button>
          </div>
          <div className="flex flex-1 flex-col gap-4">
            {[
              ['Crea tu cuenta y tu organización', 'Un correo y dos minutos. Invita a tu equipo cuando quieras.'],
              ['Responde el diagnóstico', 'Recibes tu Trust Score y recomendaciones al terminar.'],
              ['Sube tu evidencia', 'Cada documento queda ligado al criterio que respalda.'],
              ['Postula con el sello', 'Comparte tu enlace verificable con el fondo o inversionista.'],
            ].map(([t, d], i) => (
              <div key={t} className="ey-reveal ey-lift flex flex-col gap-2 rounded-3xl border border-gray-200 bg-white p-7">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">{i + 1}</span>
                <h3 className="text-lg font-semibold">{t}</h3>
                <p className="text-gray-500">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Antes / después ── */}
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-4 py-24 sm:px-6">
        <h2 className="ey-reveal-blur max-w-2xl text-center text-3xl font-semibold tracking-tight md:text-4xl">Un expediente que se verifica, en vez de mil archivos sueltos</h2>
        <div className="grid w-full gap-3 md:grid-cols-2">
          <div className="ey-reveal flex flex-col gap-3 rounded-2xl bg-gray-100 p-6 text-gray-600">
            <span className="pb-1 text-center font-semibold text-gray-900">Sin {BRAND.name}</span>
            {['Evidencias en correos y USB', 'Cada fondo pide lo mismo otra vez', 'Afirmaciones sin respaldo', 'Convocatorias que se pasan'].map(t => <span key={t}>✕ {t}</span>)}
          </div>
          <div className="ey-reveal flex flex-col gap-3 rounded-2xl bg-gray-900 p-6 text-white">
            <span className="pb-1 text-center font-semibold">Con {BRAND.name}</span>
            {['Un dataroom ordenado por criterio', 'Un enlace que reutilizas en cada postulación', 'Cada afirmación con su prueba', 'Fondos que encajan con tu perfil'].map(t => (
              <span key={t} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Perfiles ── */}
      <section id="perfiles" className="bg-gray-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-24 sm:px-6">
          <h2 className="ey-reveal-blur text-3xl tracking-tight md:text-4xl">Un mismo dato, <b className="text-emerald-600">tres formas</b> de usarlo</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['Emprendimientos', 'Demuestra tu impacto y llega listo a cada convocatoria', 'Empieza tu diagnóstico'],
              ['Inversionistas y fondos', 'Revisa portafolios con datos que se pueden auditar', 'Accede al portafolio'],
              ['Gremios y gobiernos', 'Mide el avance de tu red con una API abierta', 'Crea tu cuenta'],
            ].map(([k, t, c]) => (
              <button key={k} onClick={onGetStarted} className="ey-lift ey-reveal flex flex-col gap-3 rounded-3xl border border-gray-200 bg-white p-7 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">{k}</span>
                <span className="text-xl font-semibold">{t}</span>
                <span className="mt-2 text-sm font-semibold text-emerald-700">{c} →</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fondos (registro) ── */}
      <section className="bg-gray-900">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-20 sm:px-6 md:flex-row md:items-center">
          <div className="flex flex-col gap-3">
            <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs text-emerald-300">• Fondos</span>
            <h2 className="ey-reveal-blur text-3xl font-semibold text-white md:text-4xl">Encuentra tu próximo fondo</h2>
            <p className="max-w-xl text-gray-300">
              {stats ? `${stats.funds} convocatorias` : 'Convocatorias'} de ProInnóvate, Prociencia y cooperación internacional, revisadas cada noche y filtradas por tu sector y región.
            </p>
          </div>
          <button onClick={onGetStarted} className={btnPrimario}>Crea tu cuenta gratis <ArrowRight className="h-4 w-4" /></button>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-24 sm:px-6">
        <h2 className="ey-reveal-blur text-center text-3xl font-semibold tracking-tight md:text-4xl">Lo que nos preguntan primero</h2>
        <div className="flex flex-col gap-3">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group rounded-2xl border border-gray-200 bg-white px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium [&::-webkit-details-marker]:hidden">
                {q}<Plus className="h-4 w-4 shrink-0 text-gray-500 transition-transform group-open:rotate-45" />
              </summary>
              <p className="mt-3 text-gray-600">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="relative overflow-hidden bg-emerald-900">
        <img src={BOSQUE} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
          <h2 className="ey-reveal-blur text-3xl font-semibold tracking-tight text-white md:text-5xl">Haz que tu impacto sea la razón por la que te financian.</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={onGetStarted} className={btnPrimario}>Haz tu diagnóstico gratis</button>
            <a href={BRAND.agroUrl} className="inline-flex items-center justify-center rounded-full border border-white/50 px-6 py-3.5 font-medium text-white">Conoce {BRAND.agro}</a>
          </div>
        </div>
      </section>

      {/* ── Pie ── */}
      <footer className="bg-gray-950 text-gray-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm sm:px-6 md:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <img src={BRAND.logo} alt={BRAND.name} className="h-8 w-8 rounded-lg bg-white object-contain" />
            <span className="font-semibold text-white">{BRAND.name}</span>
            <span>· Sostenibilidad medible, verificable y trazable</span>
          </div>
          <span className="text-xs">&copy; {new Date().getFullYear()} {BRAND.name}. Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  );
}
