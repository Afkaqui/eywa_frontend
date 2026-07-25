// ════════════════════════════════════════
// Constantes de negocio: Scoring & Niveles
// ════════════════════════════════════════

export const SCORE_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 60,
  MODERATE: 40,
} as const;

export const SCORE_LEVELS = {
  EXCELLENT: 'Excelente',
  GOOD: 'Bueno',
  MODERATE: 'Moderado',
  INITIAL: 'Inicial',
} as const;

export const SEAL_LABELS = {
  GOLD: 'Gold Seal',
  SILVER: 'Silver Seal',
  BRONZE: 'Bronze Seal',
  NONE: 'Sin Certificación',
} as const;

export function getScoreLevel(percentage: number): string {
  if (percentage >= SCORE_THRESHOLDS.EXCELLENT) return SCORE_LEVELS.EXCELLENT;
  if (percentage >= SCORE_THRESHOLDS.GOOD) return SCORE_LEVELS.GOOD;
  if (percentage >= SCORE_THRESHOLDS.MODERATE) return SCORE_LEVELS.MODERATE;
  return SCORE_LEVELS.INITIAL;
}

export function getSealLabel(percentage: number): string {
  if (percentage >= SCORE_THRESHOLDS.EXCELLENT) return SEAL_LABELS.GOLD;
  if (percentage >= SCORE_THRESHOLDS.GOOD) return SEAL_LABELS.SILVER;
  if (percentage >= SCORE_THRESHOLDS.MODERATE) return SEAL_LABELS.BRONZE;
  return SEAL_LABELS.NONE;
}

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
