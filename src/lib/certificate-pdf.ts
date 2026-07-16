// Genera el PDF del certificado de curso (cliente, jsPDF — A4 horizontal)
import { jsPDF } from 'jspdf';

export interface CertificatePdfData {
  holderName: string;
  courseTitle: string;
  instructor?: string | null;
  percentage: number;
  code: string;
  issuedAt: string; // ISO
}

// Carga el logo como dataURL (falla silenciosa: el PDF sale sin logo)
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

export async function generateCertificatePdf(data: CertificatePdfData): Promise<void> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = 297;
  const H = 210;
  const cx = W / 2;

  const TEAL: [number, number, number]  = [6, 95, 70];
  const GREEN: [number, number, number] = [16, 185, 129];
  const GREY: [number, number, number]  = [107, 114, 128];
  const DARK: [number, number, number]  = [17, 24, 39];

  // Fondo y marcos
  doc.setFillColor(252, 253, 253);
  doc.rect(0, 0, W, H, 'F');
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(1.6);
  doc.rect(8, 8, W - 16, H - 16);
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.4);
  doc.rect(11, 11, W - 22, H - 22);

  // Logo
  const logo = await loadLogoDataUrl();
  if (logo) {
    try { doc.addImage(logo, 'PNG', cx - 11, 17, 22, 22); } catch { /* sin logo */ }
  }

  // Encabezado
  doc.setTextColor(...TEAL);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('EYWA', cx, logo ? 47 : 34, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GREY);
  doc.text('ACADEMIA · PLATAFORMA DE SOSTENIBILIDAD', cx, logo ? 53 : 40, { align: 'center' });

  // Título
  doc.setFont('times', 'italic');
  doc.setFontSize(30);
  doc.setTextColor(...DARK);
  doc.text('Certificado de Finalización', cx, 74, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...GREY);
  doc.text('Se otorga el presente certificado a', cx, 88, { align: 'center' });

  // Nombre
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...TEAL);
  doc.text(data.holderName, cx, 102, { align: 'center' });
  const nameWidth = Math.min(doc.getTextWidth(data.holderName), 200);
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.5);
  doc.line(cx - nameWidth / 2 - 8, 106, cx + nameWidth / 2 + 8, 106);

  // Curso
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...GREY);
  doc.text('por haber completado satisfactoriamente el curso', cx, 118, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...DARK);
  const titleLines = doc.splitTextToSize(data.courseTitle, 220) as string[];
  doc.text(titleLines, cx, 128, { align: 'center' });

  const afterTitle = 128 + (titleLines.length - 1) * 7;

  // Calificación
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...GREEN);
  doc.text(`con una calificación de ${data.percentage}%`, cx, afterTitle + 11, { align: 'center' });

  // Fecha
  const fecha = new Date(data.issuedAt).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  doc.setFontSize(10);
  doc.setTextColor(...GREY);
  doc.text(`Emitido el ${fecha}`, cx, afterTitle + 19, { align: 'center' });

  // Firma
  const sigY = 175;
  doc.setDrawColor(...GREY);
  doc.setLineWidth(0.3);
  doc.line(cx - 35, sigY, cx + 35, sigY);
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'bold');
  doc.text(data.instructor || 'EYWA Academy', cx, sigY + 6, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GREY);
  doc.text('Instructor', cx, sigY + 11, { align: 'center' });

  // Código de verificación + enlace público
  const origin = typeof window !== 'undefined' ? window.location.host : 'eywa-hazel.vercel.app';
  doc.setFontSize(8.5);
  doc.setTextColor(...GREY);
  doc.text(`Código de verificación: ${data.code}`, 16, H - 16);
  doc.text(`Verifícalo en ${origin}/verificar/${data.code}`, W - 16, H - 16, { align: 'right' });

  doc.save(`EYWA_Certificado_${data.code}.pdf`);
}
