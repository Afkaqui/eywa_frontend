// Genera el PDF del informe de Diagnóstico ESG (cliente, jsPDF — A4 vertical).
// Metodología GENES: nota 0-5, banda, desglose por categoría y por criterio.
import { jsPDF } from 'jspdf';
import { GENES_SCALE, GENES_MAX_POINTS, getGenesBand } from '@/lib/constants/scoring';

export interface DiagnosticReportData {
  companyName?: string | null;
  holderName?: string | null;
  score: number; // escala GENES 0-75
  completedAt: string; // ISO
  categories: { label: string; avg: number }[]; // avg 0-5
  criteria: { category: string; title: string; points: number; answer: string }[];
}

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch('/logo.png');
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateDiagnosticReportPdf(data: DiagnosticReportData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const H = 297;
  const M = 18; // margen
  const CW = W - 2 * M; // ancho útil

  const TEAL: [number, number, number]  = [6, 95, 70];
  const GREEN: [number, number, number] = [16, 185, 129];
  const GREY: [number, number, number]  = [107, 114, 128];
  const DARK: [number, number, number]  = [17, 24, 39];
  const LIGHT: [number, number, number] = [243, 244, 246];

  let y = 16;

  // ── Cabecera de marca ──
  const logo = await loadLogoDataUrl();
  if (logo) {
    try { doc.addImage(logo, 'PNG', M, y, 14, 14); } catch { /* sin logo */ }
  }
  doc.setTextColor(...TEAL);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('EYWA', logo ? M + 18 : M, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...GREY);
  doc.text('ORQUESTACIÓN DE ECOSISTEMAS · PLATAFORMA DE SOSTENIBILIDAD', logo ? M + 18 : M, y + 11);

  const fecha = new Date(data.completedAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.setFontSize(8.5);
  doc.text(fecha, W - M, y + 6, { align: 'right' });

  y += 22;
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.6);
  doc.line(M, y, W - M, y);
  y += 10;

  // ── Título ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...DARK);
  doc.text('Informe de Diagnóstico ESG', M, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...GREY);
  doc.text('Autoevaluación de sostenibilidad · Metodología GENES Perú (14 criterios ponderados)', M, y);
  y += 6;
  if (data.companyName || data.holderName) {
    doc.setFontSize(11);
    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'bold');
    doc.text(data.companyName || data.holderName || '', M, y + 2);
    y += 8;
  }
  y += 4;

  // ── Bloque de nota ──
  const index5 = (data.score / GENES_SCALE) * GENES_MAX_POINTS;
  const pct = Math.round((data.score / GENES_SCALE) * 100);
  const band = getGenesBand(data.score);

  doc.setFillColor(...LIGHT);
  doc.roundedRect(M, y, CW, 30, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...TEAL);
  doc.text(`${index5.toFixed(2)} / 5.00`, M + 8, y + 14);
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text(band, M + 8, y + 23);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GREY);
  doc.text(`Puntaje GENES: ${data.score} de ${GENES_SCALE}  ·  ${pct}% de cumplimiento`, W - M - 8, y + 14, { align: 'right' });
  doc.text('Bandas: 0-30 No cumple · 31-45 Mínimamente · 46-60 Parcialmente · 61-75 Plenamente', W - M - 8, y + 23, { align: 'right' });
  y += 40;

  // ── Desglose por categoría (barras) ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.text('Desglose por categoría', M, y);
  y += 7;

  const barW = CW - 55;
  for (const cat of data.categories) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text(cat.label, M, y + 3.5);
    // pista
    doc.setFillColor(229, 231, 235);
    doc.roundedRect(M + 52, y, barW - 14, 4.5, 2, 2, 'F');
    // valor
    const w = Math.max(((cat.avg / GENES_MAX_POINTS) * (barW - 14)), 2);
    doc.setFillColor(...GREEN);
    doc.roundedRect(M + 52, y, w, 4.5, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setTextColor(...GREY);
    doc.text(`${cat.avg.toFixed(1)} / 5`, W - M, y + 3.5, { align: 'right' });
    y += 9;
  }
  y += 6;

  // ── Detalle por criterio (agrupado por categoría) ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.text('Detalle por criterio', M, y);
  y += 8;

  const ensureSpace = (needed: number) => {
    if (y + needed > H - 22) {
      doc.addPage();
      y = 20;
    }
  };

  let lastCategory = '';
  for (const cr of data.criteria) {
    if (cr.category !== lastCategory) {
      ensureSpace(14);
      lastCategory = cr.category;
      doc.setFillColor(...TEAL);
      doc.roundedRect(M, y - 4, CW, 7, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(cr.category.toUpperCase(), M + 3, y + 0.8);
      y += 8;
    }
    const answerLines = doc.splitTextToSize(cr.answer, CW - 40) as string[];
    const rowH = 5 + answerLines.length * 4 + 3;
    ensureSpace(rowH);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text(cr.title, M, y);
    doc.setTextColor(...(cr.points >= 4 ? GREEN : cr.points >= 2 ? [217, 119, 6] as [number, number, number] : [225, 29, 72] as [number, number, number]));
    doc.text(`${cr.points} / ${GENES_MAX_POINTS}`, W - M, y, { align: 'right' });
    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...GREY);
    doc.text(answerLines, M + 3, y);
    y += answerLines.length * 4 + 3;
  }

  // ── Pie ──
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(7.5);
    doc.setTextColor(...GREY);
    doc.text(
      'Autoevaluación generada en la plataforma EYWA con la metodología GENES Perú. No constituye una auditoría ni una certificación de terceros.',
      M, H - 12
    );
    doc.text(`Página ${p} de ${pages}`, W - M, H - 12, { align: 'right' });
  }

  doc.save(`EYWA_Diagnostico_ESG_${new Date(data.completedAt).toISOString().slice(0, 10)}.pdf`);
}
