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

// Estandarte (blanco y bosque) como SVG: el mismo dibujo de public/logo-invertido.svg.
const ESTANDARTE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 260"><rect x="6" y="5" width="12" height="247" fill="#FFFFFF"/><rect x="26" y="20" width="130" height="28" fill="${BOSQUE}"/><rect x="26" y="56" width="130" height="21" fill="${BOSQUE}"/><rect x="26" y="85" width="130" height="21" fill="${BOSQUE}"/><polygon points="26,114 156,114 156,165 91,140 26,165" fill="${BOSQUE}"/></svg>`;

function Estandarte({ alto }: { alto: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`data:image/svg+xml,${encodeURIComponent(ESTANDARTE_SVG)}`} width={(160 * alto) / 260} height={alto} alt="" />;
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
