import { ImageResponse } from 'next/og';

// Imagen para compartir (Open Graph): nombre y logo de EYWA con la paleta
// compartida (fondo cacao, verde solo como acento).
export const runtime = 'edge';
export const alt = 'EYWA - Plataforma de Orquestación Ecosistémica y Sostenibilidad';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const CACAO = '#2B1A10';
const BROTE = '#DCEFE3';

// Logo de EYWA (el árbol de public/logo.png) sobre un recuadro blanco.
const SITIO = process.env.NEXT_PUBLIC_SITE_URL || 'https://eywa.encsust4in4ble.earth';

function Logo({ lado }: { lado: number }) {
  return (
    <div style={{ width: lado, height: lado, background: '#FFFFFF', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${SITIO}/logo.png`} width={lado - 24} height={lado - 24} alt="" />
    </div>
  );
}

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ background: CACAO, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 90px', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <Logo lado={170} />
          <div style={{ fontSize: 110, fontWeight: 800, color: 'white', letterSpacing: '-2px', display: 'flex' }}>EYWA</div>
        </div>
        <div style={{ marginTop: 44, fontSize: 40, fontWeight: 700, color: 'white', display: 'flex' }}>
          Orquestación de ecosistemas: impacto que se puede verificar
        </div>
        <div style={{ marginTop: 14, fontSize: 28, color: BROTE, display: 'flex' }}>
          Diagnóstico ESG · Dataroom con sello verificable · Fondos · Trazabilidad agro
        </div>
      </div>
    ),
    { ...size },
  );
}
