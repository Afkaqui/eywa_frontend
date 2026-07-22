"use client";

import { useEffect, useState } from 'react';
import {
  Server, Database, ShieldCheck, FileCheck2, Users, Landmark, GraduationCap,
  Sprout, MapPin, Package, WifiOff, QrCode, Cpu, Link2, ArrowRight, CircleCheck,
  CircleDashed, Clock,
} from 'lucide-react';

// Página PÚBLICA de infraestructura — soporte de sustentación (EINCUS-1-P-233-26).
//
// Regla que gobierna esta página (documento de sustentación, secciones 7 y 8):
//   1. OPERATIVO   → solo lo que está desplegado y es demostrable hoy.
//   2. POR DESARROLLAR → los módulos agro que financia el proyecto. Nunca se
//      muestran como existentes.
//   3. ROADMAP     → IA y blockchain, condicionados al dataset del piloto.
// Se dice "desplegado y operativo", NO "en producción" (pendiente de confirmación
// técnica). No se exponen IPs, puertos ni nombres de contenedores.

interface PublicStats {
  organizations: number; diagnostics: number; actors: number;
  funds: number; certificates: number; documents: number;
}

type Estado = 'operativo' | 'desarrollo' | 'roadmap';

const ESTADO_CFG: Record<Estado, { label: string; cls: string; Icon: typeof CircleCheck }> = {
  operativo:  { label: 'Desplegado y operativo', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CircleCheck },
  desarrollo: { label: 'Entregable del proyecto', cls: 'bg-amber-50 text-amber-700 border-amber-200',      Icon: CircleDashed },
  roadmap:    { label: 'Roadmap condicionado',    cls: 'bg-gray-100 text-gray-600 border-gray-200',        Icon: Clock },
};

const NUCLEO = [
  { Icon: ShieldCheck, t: 'Autenticación y roles',      d: 'Control de acceso por perfil (usuario, gestor, administrador) con permisos diferenciados.' },
  { Icon: Users,       t: 'Organizaciones',              d: 'Perfil institucional: identidad, sector, país y vínculos, con imagen propia.' },
  { Icon: FileCheck2,  t: 'Dataroom documental',         d: '10 carpetas y 50 documentos requeridos, con porcentaje de completitud, permisos delegados y registro de accesos.' },
  { Icon: Database,    t: 'Motor de evidencia',          d: 'Diagnóstico ponderado (14 criterios, 4 categorías) que genera un índice trazable e informe descargable.' },
  { Icon: GraduationCap, t: 'Certificados verificables', d: 'Emisión con código único y verificación pública por terceros, sin necesidad de cuenta.' },
  { Icon: Landmark,    t: 'Directorio y financiamiento', d: 'Actores del ecosistema y catálogo de convocatorias con etiquetado temático.' },
];

const AGRO = [
  { Icon: Sprout,  t: 'Registro de productores', d: 'Alta y gestión de productores vinculados a la organización.' },
  { Icon: MapPin,  t: 'Parcelas',                d: 'Registro y georreferenciación de unidades productivas.' },
  { Icon: Package, t: 'Lotes y trazabilidad',    d: 'Trazabilidad del lote asociada a origen, prácticas y documentación de respaldo.' },
  { Icon: WifiOff, t: 'Captura en campo',        d: 'Registro offline/online para zonas con conectividad limitada.' },
  { Icon: QrCode,  t: 'Pasaporte digital',       d: 'Identificador único y código QR sobre registro verificable convencional.' },
];

const ROADMAP = [
  { Icon: Cpu,   t: 'Inteligencia artificial', d: 'Analítica sobre los datos del piloto, condicionada a volumen y calidad suficientes.' },
  { Icon: Link2, t: 'Anclaje blockchain',      d: 'Incorporación cuando el volumen de datos justifique el valor agregado. El PDE Cusco lo señala como tecnología esperada para trazabilidad.' },
];

function Badge({ estado }: { estado: Estado }) {
  const { label, cls, Icon } = ESTADO_CFG[estado];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

function Bloque({ estado, titulo, bajada, items }: {
  estado: Estado; titulo: string; bajada: string;
  items: { Icon: typeof Server; t: string; d: string }[];
}) {
  const operativo = estado === 'operativo';
  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{titulo}</h2>
        <Badge estado={estado} />
      </div>
      <p className="text-sm text-gray-500 mb-5 max-w-3xl">{bajada}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(({ Icon, t, d }) => (
          <div
            key={t}
            className={`rounded-xl border p-5 ${
              operativo ? 'bg-white border-gray-200' : 'bg-gray-50/60 border-dashed border-gray-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
              operativo ? 'bg-emerald-50' : 'bg-gray-100'
            }`}>
              <Icon className={`w-4 h-4 ${operativo ? 'text-emerald-600' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-sm font-semibold mb-1 ${operativo ? 'text-gray-900' : 'text-gray-600'}`}>{t}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function InfraestructuraPage() {
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    fetch('/api/proxy/stats/public')
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d && typeof d.actors === 'number') setStats(d); })
      .catch(() => {});
  }, []);

  // Solo cifras que la plataforma calcula de su propia base — nada declarativo.
  const metricas = [
    { v: stats ? String(stats.actors) : '—',       l: 'Actores del ecosistema' },
    { v: stats ? String(stats.funds) : '—',        l: 'Convocatorias catalogadas' },
    { v: stats ? String(stats.organizations) : '—', l: 'Organizaciones registradas' },
    { v: stats ? String(stats.certificates) : '—', l: 'Certificados emitidos' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Marca */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-2 md:gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="EYWA Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
            <div>
              <div className="text-gray-900 font-bold text-base md:text-xl tracking-tight">EYWA</div>
              <div className="text-emerald-600 text-[10px] md:text-xs tracking-wider hidden sm:block">
                ORQUESTACIÓN DE ECOSISTEMAS
              </div>
            </div>
          </a>
          <a href="/" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            Ir a la plataforma <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-14">
        {/* Encabezado */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
            </span>
            Núcleo digital desplegado y operativo
          </div>
          <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-3">Estado de la infraestructura</h1>
          <p className="text-gray-600 max-w-3xl leading-relaxed">
            Esta página distingue con precisión <strong>qué está desplegado hoy</strong>, qué constituye
            un <strong>entregable del proyecto</strong> y qué pertenece al <strong>roadmap</strong>.
            Las cifras se leen en vivo de la base de datos de la plataforma.
          </p>
        </div>

        {/* Métricas reales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {metricas.map(m => (
            <div key={m.l} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className={`text-3xl font-light mb-1 ${m.v === '—' ? 'text-gray-300' : 'text-gray-900'}`}>{m.v}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">{m.l}</div>
            </div>
          ))}
        </div>

        <Bloque
          estado="operativo"
          titulo="Núcleo digital"
          bajada="Capa transversal ya construida y en funcionamiento. Es la base sobre la que se desarrollan los módulos agro: reduce el riesgo tecnológico del proyecto porque no se parte de cero."
          items={NUCLEO}
        />

        <Bloque
          estado="desarrollo"
          titulo="Módulos agropecuarios"
          bajada="Verticalización que financia el capital semilla. Son entregables previstos del proyecto: hoy no están desarrollados y cualquier representación visual corresponde a diseño proyectado."
          items={AGRO}
        />

        <Bloque
          estado="roadmap"
          titulo="Roadmap tecnológico"
          bajada="Incorporación posterior, condicionada a que el piloto genere volumen y calidad de datos suficientes para demostrar valor real. Durante el piloto, el pasaporte opera sobre registro verificable convencional."
          items={ROADMAP}
        />

        {/* Arquitectura */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Arquitectura</h2>
          <p className="text-sm text-gray-500 mb-5 max-w-3xl">
            Backend, base de datos y almacenamiento operan sobre infraestructura propia; la capa
            de presentación se sirve mediante hosting gestionado con despliegue continuo.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { Icon: Server,      t: 'Aplicación',      d: 'Next.js · React · TypeScript' },
              { Icon: Cpu,         t: 'API',             d: 'Node.js · Hono · validación por esquema' },
              { Icon: Database,    t: 'Base de datos',   d: 'PostgreSQL con ORM y migraciones versionadas' },
              { Icon: ShieldCheck, t: 'Operación',       d: 'Contenedores, despliegue continuo y respaldos automáticos' },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="bg-white border border-gray-200 rounded-xl p-5">
                <Icon className="w-5 h-5 text-gray-400 mb-3" />
                <div className="text-sm font-semibold text-gray-900 mb-1">{t}</div>
                <div className="text-xs text-gray-500">{d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Cierre */}
        <div className="bg-white border border-emerald-200 rounded-2xl p-6 md:p-8">
          <p className="text-gray-700 leading-relaxed">
            Este es el núcleo digital desplegado sobre el cual se construirán los módulos agro de campo:
            registro de productores, parcelas y lotes, trazabilidad y pasaporte digital.
            <strong className="text-gray-900"> El capital semilla financia precisamente esta verticalización
            y su validación en una cadena productiva real.</strong>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-10">
          EYWA Agro · Proyecto EINCUS-1-P-233-26 · Cifras leídas en vivo de la plataforma
        </p>
      </main>
    </div>
  );
}
