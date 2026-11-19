import type { Metadata } from 'next';
import { BRAND } from '@/lib/brand';

// Términos y condiciones + Política de privacidad: lo que acepta quien crea una
// cuenta (único consentimiento; cubre también la evaluación con MAVI).
// Fuente: borrador "EYWA · Términos y Política de privacidad" (claude.ai doc),
// pendiente de revisión legal. Si el texto cambia, cambiar TERMINOS_VERSION.
const TERMINOS_VERSION = '2026-11-19';

export const metadata: Metadata = {
  title: 'Términos y política de privacidad',
  description: `Términos y condiciones de uso y política de privacidad de ${BRAND.name} y ${BRAND.agro}.`,
};

const Pendiente = ({ children }: { children: React.ReactNode }) => (
  <span className="bg-amber-50 text-amber-800 rounded px-1">{children}</span>
);

function Tabla({ cab, filas }: { cab: string[]; filas: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto my-4 border border-gray-200 rounded-xl">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>{cab.map((c) => <th key={c} className="px-3 py-2 font-semibold text-gray-700">{c}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filas.map((f, i) => <tr key={i}>{f.map((c, j) => <td key={j} className="px-3 py-2 align-top text-gray-700">{c}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

export default function TerminosPage() {
  const N = BRAND.name;
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <a href="/" className="flex items-center gap-3 mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BRAND.logo} alt="" className="w-10 h-10 object-contain" />
          <div>
            <div className="text-xl font-bold text-gray-900 tracking-tight">{N}</div>
            <div className="text-xs text-emerald-600">{BRAND.tagline}</div>
          </div>
        </a>

        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Versión preliminar ({TERMINOS_VERSION}), en revisión legal. Los datos marcados <Pendiente>así</Pendiente> se completarán en la versión final; te avisaremos de los cambios antes de que entren en vigor.
        </div>

        <article className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 text-[15px] leading-relaxed text-gray-700 space-y-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:tracking-tight [&_h2]:pt-4 [&_b]:text-gray-900">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Términos y condiciones y política de privacidad</h1>
          <nav className="text-sm flex gap-4">
            <a href="#terminos" className="text-emerald-700 underline">Términos y condiciones</a>
            <a href="#privacidad" className="text-emerald-700 underline">Política de privacidad</a>
          </nav>

          <h2 id="terminos">Términos y condiciones de uso</h2>
          <p><b>1. Quiénes somos.</b> {N} («la plataforma») comprende la plataforma web eywa.encsust4in4ble.earth, la aplicación {BRAND.agro} (agro.encsust4in4ble.earth) y su API.</p>
          <p><b>2. Aceptación.</b> Al crear una cuenta, la persona acepta estos términos y la política de privacidad. Una misma cuenta sirve para {N} y {BRAND.agro}.</p>
          <p><b>3. Qué ofrece la plataforma.</b></p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Diagnóstico de sostenibilidad con la metodología GENES (puntaje de 0 a 75 y categorías Marrón, Verde, Plata, Oro y Fénix).</li>
            <li>Dataroom para guardar y compartir documentos de la organización.</li>
            <li>Validador de proyectos con análisis asistido por inteligencia artificial y evaluación con MAVI, el modelo de evaluación de {N}.</li>
            <li>Catálogo de fondos y convocatorias, directorio de actores, Academia con cursos y certificados.</li>
            <li>En {BRAND.agro}: registro de productores, parcelas, cosechas y entregas, y un pasaporte público con código QR por lote o saco.</li>
          </ul>
          <p><b>4. Naturaleza de los resultados.</b> El diagnóstico GENES es una <b>autoevaluación</b> con las respuestas que declara la organización: no es una certificación ni una auditoría. El análisis del Validador y la evaluación con MAVI son orientativos y pueden generarse con inteligencia artificial; no garantizan que un fondo apruebe el proyecto. El nivel de madurez (TRL/CRL) se toma de la calculadora del CONCYTEC y es referencial. En {BRAND.agro}, la «no deforestación» es una declaración del productor con fecha; la plataforma no la verifica con imágenes satelitales. La información del catálogo de fondos se revisa de forma automática y manual, pero las bases oficiales de cada convocatoria prevalecen.</p>
          <p><b>5. Cuenta y seguridad.</b> La persona es responsable de la veracidad de los datos que registra y de mantener su contraseña en reserva. Debe avisar a <Pendiente>[correo de contacto]</Pendiente> si sospecha un uso no autorizado.</p>
          <p><b>6. Contenido de la organización.</b> Los documentos, respuestas y datos que la organización sube siguen siendo suyos. Concede a {N} la licencia necesaria para almacenarlos, procesarlos y mostrarlos según las opciones que la propia organización active (por ejemplo, la página pública o el sello web).</p>
          <p><b>7. Datos de terceros cargados por la organización.</b> Quien registra datos de otras personas (por ejemplo, una cooperativa que registra a sus productores en {BRAND.agro}) declara contar con su autorización y haberles informado, y es responsable de ese tratamiento.</p>
          <p><b>8. Uso prohibido.</b> No se permite subir contenido ilícito o que infrinja derechos de terceros, intentar acceder a cuentas o datos ajenos, extraer datos de forma masiva, ni usar la API fuera de las condiciones de su clave.</p>
          <p><b>9. Planes y pagos.</b> {N} ofrece un plan gratuito y planes de pago. El precio, la forma de pago y la duración de cada plan se informan en la plataforma antes de contratarlo. Un plan de pago no se renueva automáticamente sin autorización expresa; al vencer, la cuenta vuelve al plan gratuito sin perder sus datos. Las condiciones de cancelación y reembolso se informan al contratar y respetan la normativa de protección al consumidor. Los servicios de consultoría se contratan aparte, con su propio contrato.</p>
          <p><b>10. Disponibilidad.</b> La plataforma se ofrece «tal como está». Se procura mantenerla disponible, pero puede haber interrupciones por mantenimiento o causas ajenas.</p>
          <p><b>11. Responsabilidad.</b> {N} no responde por decisiones de financiamiento, inversión o compra tomadas con base en los resultados de la plataforma. <Pendiente>[Límite de responsabilidad]</Pendiente></p>
          <p><b>12. Baja de la cuenta.</b> La persona puede pedir la baja en cualquier momento desde <a href="/baja" className="text-emerald-700 underline">eywa.encsust4in4ble.earth/baja</a> o desde Configuración. Un administrador revisa la solicitud y avisa por correo cuando la cuenta se elimina. La plataforma puede suspender cuentas que incumplan estos términos.</p>
          <p><b>13. Cambios.</b> Los cambios en estos términos se avisarán por correo o dentro de la plataforma antes de entrar en vigor.</p>
          <p><b>14. Ley y jurisdicción.</b> Se rigen por las leyes del Perú. <Pendiente>[Jurisdicción o arbitraje]</Pendiente></p>

          <h2 id="privacidad">Política de privacidad</h2>
          <p><b>Responsable.</b> {N} es la responsable del tratamiento de los datos personales. Contacto para temas de datos personales: <Pendiente>[correo]</Pendiente>.</p>
          <p><b>Qué datos tratamos y para qué.</b></p>
          <Tabla cab={['Datos', 'De quién', 'Para qué']} filas={[
            ['Nombre, correo, contraseña (guardada cifrada, nunca en texto), foto de perfil, plan, fecha en que aceptó estos términos', 'Persona usuaria', 'Crear y proteger la cuenta, enviar avisos del servicio'],
            ['Razón social, RUC, sector, país, teléfono, web, logo', 'Organización', 'Perfil de la organización y encaje con fondos'],
            ['Respuestas del diagnóstico GENES y su puntaje', 'Organización', 'Calcular el índice de sostenibilidad y su evolución'],
            ['Documentos del dataroom', 'Organización', 'Guardarlos y compartirlos solo con quien la organización invite'],
            ['Proyectos del Validador (descripción, presupuesto, problema, nivel de madurez, documentos)', 'Organización', `Generar el análisis y, si la organización lo pide, evaluarlos con MAVI, el modelo de evaluación de ${N}, que no conserva los datos`],
            ['Nombre, DNI, comunidad, teléfono y ubicación de parcelas', `Productores registrados por una cooperativa en ${BRAND.agro}`, 'Trazabilidad de la producción y pasaporte de cada lote o saco'],
            ['Fecha del último acceso, descargas del dataroom (quién y cuándo)', 'Persona usuaria e invitados', 'Seguridad y bitácora de accesos para la organización'],
            ['Visitas a páginas públicas (conteo)', 'Visitantes', 'Estadísticas de uso'],
          ]} />
          <p><b>Qué es público.</b> Nada se publica por defecto. Solo es público lo que la organización activa expresamente: su página pública, los documentos que marque como públicos y el sello web. En {BRAND.agro}, el pasaporte de un lote o saco es público por diseño (se consulta con un QR) y muestra origen, ubicación de la parcela y la declaración de no deforestación. Por defecto el pasaporte muestra solo las iniciales del productor: su nombre completo aparece únicamente si él lo autoriza, y puede retirar esa autorización cuando quiera. Su DNI y su teléfono nunca se publican.</p>
          <p><b>Con quién compartimos datos.</b></p>
          <Tabla cab={['Tercero', 'Para qué', 'Dónde']} filas={[
            ['Vercel', 'Aloja la aplicación web', 'Estados Unidos'],
            [<Pendiente key="p">[Proveedor del servidor]</Pendiente>, 'Aloja la base de datos, los archivos y la API', <Pendiente key="q">[país]</Pendiente>],
            ['Cloudflare', 'Red y seguridad de los dominios', 'Global'],
            ['Resend', 'Envío de correos (recuperación de contraseña, invitaciones)', 'Estados Unidos'],
            ['Proveedor de inteligencia artificial del Validador', 'Analizar el texto del proyecto', <Pendiente key="r">[país]</Pendiente>],
            ['Sistemas de terceros con clave de API', <>Dar de alta organizaciones o consultar información, <b>con consentimiento registrado</b></>, 'Según el cliente'],
          ]} />
          <p>No vendemos datos personales ni los usamos para publicidad.</p>
          <p><b>Cuánto tiempo los guardamos.</b> Mientras la cuenta esté activa. Una solicitud de baja se atiende dentro de los 20 días hábiles siguientes. Al eliminarse la cuenta, sus datos desaparecen de inmediato de la plataforma y, en un plazo máximo de 60 días, también de las copias de seguridad. Solo se conserva lo que la ley obligue a guardar (por ejemplo, comprobantes de pago) y el registro de que la solicitud fue atendida.</p>
          <p><b>Derechos (ARCO).</b> La persona puede pedir acceso, rectificación, cancelación u oposición escribiendo a <Pendiente>[correo]</Pendiente>; la cancelación de la cuenta también puede pedirse en <a href="/baja" className="text-emerald-700 underline">eywa.encsust4in4ble.earth/baja</a>. Responderemos en los plazos de la Ley 29733. También puede presentar un reclamo ante la Autoridad Nacional de Protección de Datos Personales.</p>
          <p><b>Seguridad.</b> Contraseñas cifradas, conexiones HTTPS, documentos privados por defecto, accesos por rol y registro de descargas del dataroom.</p>
          <p><b>Cookies y almacenamiento local.</b> Usamos una cookie de sesión para mantener la cuenta abierta y el almacenamiento del navegador para preferencias, borradores (por ejemplo, el diagnóstico en curso) y la sesión de {BRAND.agro}. No usamos cookies de publicidad.</p>
          <p><b>Menores de edad.</b> La plataforma está dirigida a organizaciones y personas mayores de edad.</p>
        </article>

        <p className="text-center text-xs text-gray-400 mt-6">Versión {TERMINOS_VERSION}</p>
      </div>
    </div>
  );
}
