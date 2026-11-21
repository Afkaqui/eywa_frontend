import { ImageResponse } from 'next/og';

// Imagen para compartir (Open Graph) con la identidad UNANCHA: fondo cacao,
// estandarte con franjas bosque y el verde solo como acento.
export const runtime = 'edge';
export const alt = 'UNANCHA - Plataforma de Orquestación Ecosistémica y Sostenibilidad';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const CACAO = '#2B1A10';
const BOSQUE = '#1E7A4C';
const BROTE = '#DCEFE3';

function Estandarte({ alto }: { alto: number }) {
  const s = alto / 260;
  const r = (x: number, y: number, w: number, h: number, c: string) => (
    <div style={{ position: 'absolute', left: x * s, top: y * s, width: w * s, height: h * s, background: c, display: 'flex' }} />
  );
  return (
    <div style={{ position: 'relative', width: 160 * s, height: alto, display: 'flex' }}>
      {r(6, 5, 12, 247, '#FFFFFF')}
      {r(26, 20, 130, 28, BOSQUE)}
      {r(26, 56, 130, 21, BOSQUE)}
      {r(26, 85, 130, 21, BOSQUE)}
      {/* Punta en V: bloque con un triángulo cacao recortado abajo */}
      {r(26, 114, 130, 51, BOSQUE)}
      <div style={{
        position: 'absolute', left: 26 * s, top: 140 * s, width: 0, height: 0, display: 'flex',
        borderLeft: `${65 * s}px solid transparent`, borderRight: `${65 * s}px solid transparent`,
        borderBottom: `${25 * s}px solid ${CACAO}`,
      }} />
    </div>
  );
}

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ background: CACAO, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 90px', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <Estandarte alto={170} />
          <div style={{ fontSize: 110, fontWeight: 800, color: 'white', letterSpacing: '-2px', display: 'flex' }}>UNANCHA</div>
        </div>
        <div style={{ marginTop: 44, fontSize: 40, fontWeight: 700, color: 'white', display: 'flex' }}>
          Evidencia verificable de impacto y de origen
        </div>
        <div style={{ marginTop: 14, fontSize: 28, color: BROTE, display: 'flex' }}>
          Diagnóstico ESG · Dataroom con sello verificable · Fondos · Trazabilidad agro
        </div>
      </div>
    ),
    { ...size },
  );
}
