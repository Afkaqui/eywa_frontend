// ════════════════════════════════════════
// Constantes de negocio: Scoring & Niveles
// ════════════════════════════════════════
//
// La escala oficial de UNANCHA es GENES (más abajo). Aquí vivía además una escala
// genérica —`getScoreLevel` (Excelente/Bueno/Moderado) y `getSealLabel`
// (Gold/Silver/Bronze Seal)— que se contradecía con ella: un mismo puntaje era
// "Oro" en el Diagnóstico y "Silver Seal" en el dashboard. Se eliminó junto con
// el fix del Trust Score (2026-07-25); esto es la limpieza del código que quedó
// sin uso. **No reintroducir una segunda escala de calificación.**

export function calculatePercentage(score: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
}

// ── Metodología GENES (ponderada) ────────────────────────────────────────────
// Cada criterio se puntúa 0-5 y aporta (puntos × peso); los pesos suman 1.0, así
// que el ponderado va de 0 a 5. Se lleva a la escala 0-75 de las bandas GENES.
export const GENES_MAX_POINTS = 5;
export const GENES_SCALE = 75;

// Categorías GENES (definidas por Eduardo, 2026-07-25): 5 niveles de menor a
// mayor sobre la escala 0-75, en tramos iguales de 15 puntos. Sustituyen a las 4
// bandas anteriores; los cortes 31/46/61 se conservan y el antiguo 0-30 se parte.
//
// OJO: las clases de Tailwind van COMPLETAS y estáticas a propósito. Construirlas
// dinámicamente (`bg-${color}-100`) hace que el purgador las elimine del CSS y el
// badge sale sin color — ya nos pasó con el badge de banda del diagnóstico.
// Las categorías son un RANKING, así que el color codifica también el rango: sube
// la intensidad con el nivel y Fénix es el único relleno (es la cima). Sin esto,
// Marrón y Plata se veían casi idénticos (ambos gris) y Fénix salía MÁS pálido
// que Oro — el nivel más alto pareciendo el más apagado.
export const GENES_BANDS = [
  { min: 61, label: 'Fénix',  badge: 'bg-orange-700 text-white'        }, // 61-75
  { min: 46, label: 'Oro',    badge: 'bg-amber-200 text-amber-900'     }, // 46-60
  { min: 31, label: 'Plata',  badge: 'bg-slate-300 text-slate-800'     }, // 31-45
  { min: 16, label: 'Verde',  badge: 'bg-emerald-100 text-emerald-700' }, // 16-30
  { min: 0,  label: 'Marrón', badge: 'bg-stone-200 text-stone-700'     }, // 0-15
] as const;

export function getGenesBand(genesScore: number): string {
  for (const b of GENES_BANDS) if (genesScore >= b.min) return b.label;
  return 'Marrón';
}

// Clases del badge para una puntuación GENES. Fuente única: si cambian los cortes
// o la paleta, se toca SOLO aquí (antes estaba copiado a mano en 4 componentes).
export function getGenesBandClasses(genesScore = 0): string {
  for (const b of GENES_BANDS) if (genesScore >= b.min) return b.badge;
  return GENES_BANDS[GENES_BANDS.length - 1].badge;
}

// Leyenda de rangos, para el PDF y las pantallas de resultados.
export const GENES_BANDS_LEGEND = '0-15 Marrón · 16-30 Verde · 31-45 Plata · 46-60 Oro · 61-75 Fénix';

export const GENES_CATEGORIES: Record<string, string> = {
  perfil:    'Perfil de Emprendimiento',
  ambiental: 'Ambiental',
  social:    'Social',
  economico: 'Económico',
  general:   'General',
};

// Pesos oficiales de los 14 criterios GENES (criterios_GENES.json), por título.
// Respaldo cuando no se tienen las preguntas cargadas: el breakdown guardado no
// trae el peso. Fuente ÚNICA para el Panel y el resumen del Diagnóstico, que antes
// promediaban distinto (uno simple, otro ponderado) y mostraban cifras diferentes.
const PESOS_GENES: Record<string, number> = {
  'formalización legal': .03, 'liderazgo femenino': .04, 'segmento de clientes': .07,
  'potencial de crecimiento': .10, 'sistema de m&e': .10, 'sistema de monitoreo': .10,
  'insumos sostenibles': .10, 'huella ecológica': .03, 'certificación': .03,
  'comercio justo': .08, 'inclusión laboral': .07, 'reconocimientos': .10,
  'economía circular': .07, 'apoyo financiero': .03, 'viabilidad económica': .15,
};
export function pesoGenes(label: string): number {
  const l = label.trim().toLowerCase();
  for (const [k, v] of Object.entries(PESOS_GENES)) if (l.includes(k)) return v;
  return 0;
}

/** Promedio (0-100) de una categoría, ponderado por el peso de cada criterio. */
export function promedioPonderado(items: { label: string; score: number; maxScore: number; peso?: number }[]): number {
  if (!items.length) return 0;
  const pct = (i: { score: number; maxScore: number }) => (i.maxScore > 0 ? (i.score / i.maxScore) * 100 : 0);
  const w = items.reduce((s, i) => s + (i.peso ?? pesoGenes(i.label)), 0);
  return Math.round(w > 0
    ? items.reduce((s, i) => s + (i.peso ?? pesoGenes(i.label)) * pct(i), 0) / w
    : items.reduce((s, i) => s + pct(i), 0) / items.length);
}

/** Color de barra según desempeño: verde ≥80, ámbar 50-79, gris <50. */
export function colorDesempeno(pct: number): string {
  return pct >= 80 ? 'bg-emerald-600' : pct >= 50 ? 'bg-amber-500' : 'bg-gray-300';
}
