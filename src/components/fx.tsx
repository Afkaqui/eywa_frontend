"use client";

// Componentes animados de la identidad v2, inspirados en Magic UI / Aceternity UI
// (mismos patrones, implementados sin dependencias nuevas). Respetan
// prefers-reduced-motion: ver las clases fx-* en globals.css.

import { useEffect, useRef, useState, type ReactNode } from 'react';

/** Insignia con borde en degradado animado y brillo que recorre el texto. */
export function AnimatedBadge({ children, href, icon }: { children: ReactNode; href?: string; icon?: ReactNode }) {
  const contenido = (
    <span className="fx-badge group relative inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium sm:text-sm">
      {icon}
      <span className="fx-shine">{children}</span>
      {href && <span className="text-emerald-700 transition-transform group-hover:translate-x-0.5">→</span>}
    </span>
  );
  return href
    ? <a href={href} target="_blank" rel="noopener noreferrer" className="w-fit">{contenido}</a>
    : contenido;
}

/** Palabra que cambia cada pocos segundos con un fundido desenfocado. */
export function RotatingText({ words, className = '', interval = 2600 }: { words: string[]; className?: string; interval?: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI(n => (n + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);
  return (
    <span className={`relative inline-grid ${className}`} aria-live="polite">
      {/* Reserva el ancho de la palabra más larga para que el titular no salte */}
      {words.map(w => <span key={w} className="invisible col-start-1 row-start-1" aria-hidden="true">{w}</span>)}
      <span key={i} className="fx-rotate col-start-1 row-start-1">{words[i]}</span>
    </span>
  );
}

/** Haz de luz que recorre el borde del contenedor. El padre debe ser relative + rounded. */
export function BorderBeam({ radius = '2.75rem' }: { radius?: string }) {
  return <span aria-hidden="true" className="fx-beam pointer-events-none absolute inset-0" style={{ borderRadius: radius }} />;
}

/** Número que cuenta hasta su valor cuando entra en pantalla. */
export function NumberTicker({ value, className = '' }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(value); return; }
    let raf = 0;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const t0 = performance.now(), dur = 1400;
      const paso = (t: number) => {
        const k = Math.min(1, (t - t0) / dur);
        setN(Math.round(value * (1 - Math.pow(1 - k, 3))));
        if (k < 1) raf = requestAnimationFrame(paso);
      };
      raf = requestAnimationFrame(paso);
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => { obs.disconnect(); cancelAnimationFrame(raf); };
  }, [value]);
  return <span ref={ref} className={`tabular-nums ${className}`}>{n.toLocaleString('es-PE')}</span>;
}

/** Foco de luz verde que sigue al cursor dentro de una sección. */
export function Spotlight({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={`fx-spot relative ${className}`}
      onPointerMove={e => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        ref.current!.style.setProperty('--fx-x', `${e.clientX - r.left}px`);
        ref.current!.style.setProperty('--fx-y', `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </div>
  );
}

/** Cinta continua (logos), con bordes difuminados y pausa al pasar el cursor. */
export function Marquee({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`fx-marquee-mask overflow-hidden ${className}`}>
      <div className="ey-marquee items-center">
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}

/** Línea de tiempo de pasos: la línea se llena con el scroll y cada paso se
 *  enciende al alcanzarlo (funciona en todos los navegadores, sin dependencias). */
export function StepsTimeline({ items }: { items: [string, string][] }) {
  const ref = useRef<HTMLOListElement>(null);
  const [activos, setActivos] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const medir = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // progreso 0→1 mientras la lista cruza el 70 % de la pantalla
      const p = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / r.height));
      el.style.setProperty('--p', String(p));
      const pasos = el.querySelectorAll<HTMLElement>('[data-paso]');
      let n = 0;
      pasos.forEach(li => { if (li.getBoundingClientRect().top < vh * 0.78) n++; });
      setActivos(n);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(medir); };
    medir();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, []);
  return (
    <ol ref={ref} className="fx-steps relative flex flex-col gap-4 pl-14">
      <span aria-hidden="true" className="fx-steps-line"><i /></span>
      {items.map(([t, d], i) => (
        <li key={t} data-paso className={`fx-step ey-lift relative flex flex-col gap-2 rounded-3xl border border-gray-200 bg-white p-7 ${i < activos ? 'is-in' : ''}`}>
          <span className="fx-step-num absolute -left-14 top-7 flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-200 bg-white font-bold text-gray-500">{i + 1}</span>
          <h3 className="text-lg font-semibold">{t}</h3>
          <p className="text-gray-500">{d}</p>
        </li>
      ))}
    </ol>
  );
}

/** Número de paso que se enciende (verde + pulso) al entrar en pantalla. */
export function StepNumber({ n }: { n: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); obs.disconnect(); } }, { rootMargin: '0px 0px -25% 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <span ref={ref} className={`fx-num flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 font-semibold ${on ? 'is-in' : ''}`}>{n}</span>;
}

/** Órbitas de puntos que giran en sentidos opuestos (hero "vivo"). Determinista:
 *  mismos puntos en servidor y cliente. Decorativo: aria-hidden. */
const ORBIT_COLORS = ['#2A8F5C', '#86C9A3', '#18643E', '#fbbf24', '#4FAA7A', '#134F31', '#a7f3d0'];
export function Orbits({ size = 560, rings = 4, className = '' }: { size?: number; rings?: number; className?: string }) {
  const anillos = Array.from({ length: rings }, (_, k) => {
    const radio = size / 2 - k * (size / (rings * 2.6));
    const n = Math.round((2 * Math.PI * radio) / 26);
    return { radio, n, dur: 70 + k * 25, dir: k % 2 ? 'reverse' : 'normal' };
  });
  return (
    <div aria-hidden="true" className={`fx-orbits pointer-events-none absolute ${className}`} style={{ width: size, height: size }}>
      {anillos.map(({ radio, n, dur, dir }, k) => (
        <div key={k} className="fx-orbit absolute left-1/2 top-1/2" style={{ width: radio * 2, height: radio * 2, marginLeft: -radio, marginTop: -radio, animationDuration: `${dur}s`, animationDirection: dir }}>
          {Array.from({ length: n }, (_, i) => {
            const t = (i / n) * 2 * Math.PI;
            const s = 4 + ((i * 7 + k * 3) % 4);
            return (
              <span key={i} className="fx-dot absolute rounded-full" style={{
                width: s, height: s,
                left: Math.round((radio + radio * Math.cos(t) - s / 2) * 10) / 10, top: Math.round((radio + radio * Math.sin(t) - s / 2) * 10) / 10,
                background: ORBIT_COLORS[(i * 3 + k) % ORBIT_COLORS.length],
                animationDelay: `${((i * 37 + k * 11) % 40) / 10}s`,
              }} />
            );
          })}
        </div>
      ))}
    </div>
  );
}
