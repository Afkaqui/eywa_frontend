"use client";

import { useState } from 'react';
import {
  Book, ChevronRight, ChevronDown, ArrowLeft,
  UserPlus, LogIn, Stethoscope, BarChart3, GraduationCap,
  Shield, Users, Database, Settings, CheckCircle,
  Layers, Server, Lock, Code, Leaf
} from 'lucide-react';
import Link from 'next/link';

type SectionId =
  | 'intro' | 'registro' | 'login' | 'dashboard'
  | 'diagnostico' | 'validador' | 'portfolio' | 'academia'
  | 'gestor' | 'admin' | 'superadmin'
  | 'arquitectura' | 'seguridad' | 'roles' | 'vision';

interface DocSection {
  id: SectionId;
  title: string;
  icon: typeof Book;
  category: 'general' | 'usuario' | 'administracion' | 'tecnico';
}

const sections: DocSection[] = [
  { id: 'intro', title: 'Introducción a EYWA', icon: Leaf, category: 'general' },
  { id: 'vision', title: 'Visión y Misión', icon: Leaf, category: 'general' },
  { id: 'registro', title: 'Registro de Cuenta', icon: UserPlus, category: 'usuario' },
  { id: 'login', title: 'Inicio de Sesión', icon: LogIn, category: 'usuario' },
  { id: 'dashboard', title: 'Panel Principal', icon: Layers, category: 'usuario' },
  { id: 'diagnostico', title: 'Diagnóstico Integral', icon: Stethoscope, category: 'usuario' },
  { id: 'validador', title: 'Validador de Proyectos', icon: CheckCircle, category: 'usuario' },
  { id: 'portfolio', title: 'Portfolio de Inversión', icon: BarChart3, category: 'usuario' },
  { id: 'academia', title: 'Academia (Edutech)', icon: GraduationCap, category: 'usuario' },
  { id: 'gestor', title: 'Panel de Gestor', icon: Database, category: 'administracion' },
  { id: 'admin', title: 'Panel de Administrador', icon: Users, category: 'administracion' },
  { id: 'superadmin', title: 'Panel de Super Admin', icon: Shield, category: 'administracion' },
  { id: 'roles', title: 'Sistema de Roles', icon: Lock, category: 'tecnico' },
  { id: 'arquitectura', title: 'Arquitectura Técnica', icon: Code, category: 'tecnico' },
  { id: 'seguridad', title: 'Seguridad y Permisos', icon: Server, category: 'tecnico' },
];

const categoryLabels: Record<string, string> = {
  general: 'General',
  usuario: 'Guía del Usuario',
  administracion: 'Administración',
  tecnico: 'Documentación Técnica',
};

function SectionContent({ sectionId }: { sectionId: SectionId }) {
  switch (sectionId) {
    case 'intro':
      return (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>EYWA</strong> es una plataforma digital de orquestación ecosistémica diseñada para
            catalizar el desarrollo sostenible y regenerativo en la región andino-amazónica. Funciona como
            un <em>Ecosistema como Servicio (EaaS)</em>, conectando gobierno, empresas, inversores, academia
            y sociedad civil en un único flujo de trabajo colaborativo basado en datos verificables.
          </p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <h3 className="font-semibold text-emerald-800 mb-2">Propósito Central</h3>
            <p className="text-emerald-700 text-sm">
              Resolver la crisis de confianza que paraliza la inversión de impacto, transformando datos
              territoriales en información estandarizada, verificable y auditable que el capital global
              pueda interpretar y actuar sobre ella.
            </p>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mt-6">Componentes Principales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Motor de IA', desc: 'Diagnóstico automatizado y puntuación ASG (Ambiental, Social y Gobernanza) basada en modelos de aprendizaje automático.' },
              { title: 'Cadena de Impacto Verificable', desc: 'Trazabilidad blockchain para verificar el impacto real desde la inversión hasta el resultado territorial.' },
              { title: 'Plataforma de Inversión', desc: 'Pipeline de oportunidades curado y pre-calificado para inversores de impacto con deal-flow inteligente.' },
              { title: 'Academia Regenerativa', desc: 'Módulo educativo con cursos en agrotech, ESG, banca sostenible y más para capacitación continua.' },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'vision':
      return (
        <div className="space-y-6">
          <div className="bg-gray-900 text-white rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-3 text-emerald-400">Misión</h3>
            <p className="text-gray-300 leading-relaxed">
              Conectar y orquestar los ecosistemas de gobierno, empresas, inversores y sociedad civil a
              través de una plataforma inteligente de gestión de datos para impulsar la sostenibilidad
              medible y el desarrollo territorial regenerativo.
            </p>
          </div>
          <div className="bg-gray-900 text-white rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-3 text-emerald-400">Visión</h3>
            <p className="text-gray-300 leading-relaxed">
              Ser la infraestructura crítica de tecnología climática (Climate Tech) para Latinoamérica,
              automatizando la confianza en la inversión de impacto y catalizando la transición hacia una
              economía sostenible alineada con la Visión Perú 2050.
            </p>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Modelo Ecosistémico: Quíntuple Hélice</h3>
          <p className="text-gray-700">
            EYWA articula cinco actores fundamentales del desarrollo sostenible:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { actor: 'Gobierno', rol: 'Políticas públicas basadas en evidencia y planificación territorial.' },
              { actor: 'Industria', rol: 'Emprendimientos regenerativos con acceso a capital y mentoría.' },
              { actor: 'Academia', rol: 'Investigación con datos reales y programas de formación enfocados.' },
              { actor: 'Sociedad Civil', rol: 'Verificación social del impacto y participación comunitaria.' },
              { actor: 'Entorno Natural', rol: 'Monitoreo ambiental y trazabilidad de métricas ecológicas.' },
            ].map((item, i) => (
              <div key={i} className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                <div className="font-medium text-emerald-800 text-sm">{item.actor}</div>
                <div className="text-xs text-emerald-600 mt-1">{item.rol}</div>
              </div>
            ))}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mt-4">Modelo de Negocio</h3>
          <p className="text-gray-700 text-sm">
            La plataforma opera como un <strong>B2B SaaS / EaaS</strong> con un modelo de ingresos basado
            en suscripciones Premium para inversores y contratos B2G (Business-to-Government). Los
            emprendedores acceden de forma gratuita al diagnóstico básico, mientras que los inversores
            pagan por acceso al pipeline de oportunidades curado, datos ASG verificados y herramientas
            avanzadas de debida diligencia.
          </p>
        </div>
      );

    case 'registro':
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Cómo Registrarse</h3>
          <ol className="space-y-4">
            {[
              { step: 'Accede a la página principal', detail: 'Haz clic en "Comenzar Ahora" o "Iniciar Sesión" desde la página de inicio.' },
              { step: 'Selecciona "Registrarse"', detail: 'En la pantalla de login, cambia al modo de registro.' },
              { step: 'Completa el formulario', detail: 'Ingresa tu nombre completo, correo electrónico, empresa (opcional) y una contraseña segura.' },
              { step: 'Verifica tu correo', detail: 'Recibirás un email de verificación. Haz clic en el enlace para activar tu cuenta.' },
              { step: 'Accede a la plataforma', detail: 'Una vez verificado, inicia sesión con tus credenciales. Se te asignará automáticamente el rol de "Usuario" con plan "Gratuito".' },
            ].map((item, i) => (
              <li key={i} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{item.step}</div>
                  <div className="text-sm text-gray-600 mt-0.5">{item.detail}</div>
                </div>
              </li>
            ))}
          </ol>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-amber-800">
              <strong>Nota:</strong> Tu perfil se crea automáticamente con rol <code className="bg-amber-100 px-1 rounded">user</code> y
              plan <code className="bg-amber-100 px-1 rounded">free</code>. Un administrador puede actualizar tu rol o plan posteriormente.
            </p>
          </div>
        </div>
      );

    case 'login':
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Inicio de Sesión</h3>
          <p className="text-gray-700">
            Para acceder a la plataforma, introduce tu correo electrónico y contraseña en la página de login.
            La autenticación se gestiona de forma segura a través de Supabase Auth.
          </p>
          <h4 className="font-medium text-gray-900">Proceso de Autenticación</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              Se valida tu sesión con tokens JWT seguros.
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              Tu perfil (rol, plan, datos personales) se carga automáticamente.
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              La navegación se adapta según tu rol asignado.
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              La sesión persiste entre recargas de página gracias al middleware de refresco.
            </li>
          </ul>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Sesión segura:</strong> Los tokens se refrescan automáticamente en cada request a través
              del middleware de Next.js, garantizando que tu sesión no expire mientras uses la plataforma.
            </p>
          </div>
        </div>
      );

    case 'dashboard':
      return (
        <div className="space-y-6">
          <p className="text-gray-700">
            El Panel Principal es tu vista central al ingresar a EYWA. Muestra un resumen de tu estado
            en la plataforma, incluyendo tu resultado de diagnóstico más reciente con su sello de
            sostenibilidad.
          </p>
          <h3 className="text-lg font-semibold text-gray-900">Elementos del Panel</h3>
          <div className="space-y-3">
            {[
              { title: 'Sello de Sostenibilidad', desc: 'Indicador visual basado en tu última evaluación diagnóstica. Los niveles van desde "Emergente" hasta "Excelente" según el porcentaje obtenido.' },
              { title: 'Puntuación ASG', desc: 'Visualización de tu puntuación en las dimensiones Ambiental, Social y de Gobernanza.' },
              { title: 'Barra de Navegación', desc: 'Panel lateral con acceso a todas las secciones según tu rol: diagnóstico, validador, portfolio, academia y paneles administrativos.' },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 text-sm">{item.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
          <h4 className="font-medium text-gray-900">Niveles de Sello</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-4 font-medium text-gray-600">Porcentaje</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-600">Nivel</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-600">Sello</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { pct: '80% - 100%', nivel: 'Excelente', sello: 'Sello Oro' },
                  { pct: '60% - 79%', nivel: 'Bueno', sello: 'Sello Plata' },
                  { pct: '40% - 59%', nivel: 'Moderado', sello: 'Sello Bronce' },
                  { pct: '0% - 39%', nivel: 'Emergente', sello: 'En Desarrollo' },
                ].map((row, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="py-2 px-4 text-gray-700">{row.pct}</td>
                    <td className="py-2 px-4 text-gray-700">{row.nivel}</td>
                    <td className="py-2 px-4 text-gray-700">{row.sello}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'diagnostico':
      return (
        <div className="space-y-6">
          <p className="text-gray-700">
            El módulo de Diagnóstico Integral es el corazón de la evaluación de EYWA. Permite a los
            emprendimientos completar un cuestionario estructurado que evalúa su madurez, sostenibilidad
            y preparación para la inversión.
          </p>
          <h3 className="text-lg font-semibold text-gray-900">Cómo Funciona</h3>
          <ol className="space-y-3">
            {[
              'Accede al módulo "Diagnóstico" desde la barra de navegación lateral.',
              'Responde las preguntas del cuestionario. Cada pregunta tiene opciones con puntajes ponderados.',
              'Al completar todas las preguntas, haz clic en "Finalizar Diagnóstico".',
              'El sistema calcula automáticamente tu puntuación y genera un resultado con recomendaciones.',
              'Tu resultado se guarda y se muestra en el Panel Principal como sello de sostenibilidad.',
            ].map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h4 className="font-medium text-emerald-800 text-sm mb-1">Dimensiones Evaluadas</h4>
            <p className="text-sm text-emerald-700">
              Las preguntas cubren áreas como gobernanza corporativa, impacto ambiental, modelo de negocio,
              cumplimiento normativo, gestión social y visión de crecimiento, alineadas con métricas IRIS+
              y estándares internacionales ASG.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 text-sm mb-1">Gestión de Preguntas</h4>
            <p className="text-sm text-gray-600">
              Las preguntas y opciones del diagnóstico son configurables desde el Panel de Gestor.
              Los gestores pueden agregar, editar o eliminar preguntas y sus opciones con puntajes.
            </p>
          </div>
        </div>
      );

    case 'validador':
      return (
        <div className="space-y-6">
          <p className="text-gray-700">
            El Validador de Proyectos permite evaluar la viabilidad y alineación de proyectos con
            criterios de sostenibilidad. Funciona como una herramienta de pre-evaluación rápida.
          </p>
          <h3 className="text-lg font-semibold text-gray-900">Funcionalidades</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              Evaluación rápida de proyectos contra criterios ASG predefinidos.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              Identificación de fortalezas y áreas de mejora del proyecto.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              Generación de recomendaciones basadas en los resultados.
            </li>
          </ul>
        </div>
      );

    case 'portfolio':
      return (
        <div className="space-y-6">
          <p className="text-gray-700">
            La sección de Portfolio muestra las empresas de la cartera del fondo de inversión.
            Es una vista pública para todos los usuarios autenticados que permite explorar
            las empresas y sus métricas de impacto.
          </p>
          <h3 className="text-lg font-semibold text-gray-900">Información Disponible</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { field: 'Nombre de la empresa', desc: 'Identificación de cada empresa del portfolio.' },
              { field: 'Sector', desc: 'Área de operación (Agro, Turismo, Economía Circular, etc.).' },
              { field: 'Descripción', desc: 'Resumen del modelo de negocio y propuesta de valor.' },
              { field: 'Métricas de impacto', desc: 'Indicadores clave de rendimiento social y ambiental.' },
              { field: 'Sitio web', desc: 'Enlace al sitio web de la empresa.' },
              { field: 'Logo', desc: 'Identidad visual de cada empresa del portfolio.' },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="font-medium text-gray-900 text-sm">{item.field}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Los datos del portfolio son gestionados por los usuarios con rol de
              Gestor desde el Panel de Gestión de Datos. Las políticas de seguridad (RLS) permiten
              lectura a todos los usuarios autenticados, pero solo los gestores pueden crear, editar o eliminar empresas.
            </p>
          </div>
        </div>
      );

    case 'academia':
      return (
        <div className="space-y-6">
          <p className="text-gray-700">
            El módulo de Academia (Edutech) ofrece un catálogo de cursos de formación continua
            en temáticas relacionadas con sostenibilidad, inversión de impacto y tecnologías
            regenerativas.
          </p>
          <h3 className="text-lg font-semibold text-gray-900">Características</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <GraduationCap className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <strong>Catálogo de cursos</strong> — Explora cursos filtrados por categoría, nivel y búsqueda de texto.
            </li>
            <li className="flex items-start gap-2">
              <GraduationCap className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <strong>Inscripción</strong> — Inscríbete en los cursos que te interesen con un solo clic.
            </li>
            <li className="flex items-start gap-2">
              <GraduationCap className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <strong>Seguimiento de progreso</strong> — Visualiza tu avance en cada curso con barras de progreso.
            </li>
            <li className="flex items-start gap-2">
              <GraduationCap className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <strong>Estadísticas</strong> — Panel de resumen con cursos inscritos, completados y horas de estudio.
            </li>
          </ul>
          <h4 className="font-medium text-gray-900 mt-4">Categorías de Cursos</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Agrotech', color: 'bg-green-100 text-green-700' },
              { label: 'Edutech', color: 'bg-blue-100 text-blue-700' },
              { label: 'Banca Sostenible', color: 'bg-amber-100 text-amber-700' },
              { label: 'ESG', color: 'bg-purple-100 text-purple-700' },
              { label: 'General', color: 'bg-gray-100 text-gray-700' },
            ].map((cat, i) => (
              <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium ${cat.color}`}>
                {cat.label}
              </span>
            ))}
          </div>
          <h4 className="font-medium text-gray-900 mt-4">Niveles</h4>
          <div className="flex gap-2">
            {['Básico', 'Intermedio', 'Avanzado'].map((level, i) => (
              <span key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {level}
              </span>
            ))}
          </div>
        </div>
      );

    case 'gestor':
      return (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Acceso requerido:</strong> Rol de <code className="bg-blue-100 px-1 rounded">gestor</code>,{' '}
              <code className="bg-blue-100 px-1 rounded">admin</code> o{' '}
              <code className="bg-blue-100 px-1 rounded">superadmin</code>.
            </p>
          </div>
          <p className="text-gray-700">
            El Panel de Gestor permite administrar los datos fundamentales de la plataforma:
            las empresas del portfolio y las preguntas del diagnóstico.
          </p>
          <h3 className="text-lg font-semibold text-gray-900">Gestión de Portfolio</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <strong>Agregar empresas</strong> — Crea nuevas entradas con nombre, sector, descripción, métricas, sitio web y logo.
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <strong>Editar empresas</strong> — Actualiza la información de empresas existentes.
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <strong>Eliminar empresas</strong> — Remueve empresas del portfolio con confirmación.
            </li>
          </ul>
          <h3 className="text-lg font-semibold text-gray-900 mt-4">Gestión de Preguntas del Diagnóstico</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <strong>Crear preguntas</strong> — Define nuevas preguntas con su texto, orden y categoría.
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <strong>Gestionar opciones</strong> — Configura las opciones de respuesta con sus puntajes asociados.
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <strong>Ordenar preguntas</strong> — Establece el orden en que aparecen en el diagnóstico.
            </li>
          </ul>
        </div>
      );

    case 'admin':
      return (
        <div className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-800">
              <strong>Acceso requerido:</strong> Rol de <code className="bg-purple-100 px-1 rounded">admin</code> o{' '}
              <code className="bg-purple-100 px-1 rounded">superadmin</code>.
            </p>
          </div>
          <p className="text-gray-700">
            El Panel de Administrador permite gestionar los usuarios de la plataforma y sus planes
            de suscripción.
          </p>
          <h3 className="text-lg font-semibold text-gray-900">Funcionalidades</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <strong>Lista de usuarios</strong> — Visualiza todos los usuarios registrados con sus datos.
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <strong>Búsqueda</strong> — Filtra usuarios por nombre o correo electrónico.
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <strong>Cambio de plan</strong> — Actualiza el plan de un usuario entre Gratuito y Premium.
            </li>
          </ul>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Limitación:</strong> Los administradores pueden cambiar planes, pero NO roles.
              Solo los Super Administradores pueden modificar roles de usuario.
            </p>
          </div>
        </div>
      );

    case 'superadmin':
      return (
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Acceso requerido:</strong> Rol de <code className="bg-red-100 px-1 rounded">superadmin</code> exclusivamente.
            </p>
          </div>
          <p className="text-gray-700">
            El Panel de Super Administración ofrece control total sobre la plataforma: usuarios,
            roles y planes.
          </p>
          <h3 className="text-lg font-semibold text-gray-900">Funcionalidades</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <strong>Gestión completa de usuarios</strong> — Ve todos los usuarios con estadísticas globales.
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <strong>Cambio de roles</strong> — Asigna cualquier rol: Usuario, Gestor, Administrador o Super Admin.
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <strong>Cambio de planes</strong> — Actualiza planes entre Gratuito y Premium.
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <strong>Dashboard de estadísticas</strong> — Total de usuarios, administradores, premium y gestores.
            </li>
          </ul>
          <h4 className="font-medium text-gray-900 mt-4">Crear el Primer Super Admin</h4>
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm">
            <p className="text-gray-500">-- En el SQL Editor de Supabase:</p>
            <p>UPDATE public.profiles</p>
            <p>SET role = &apos;superadmin&apos;</p>
            <p>WHERE email = &apos;tu@email.com&apos;;</p>
          </div>
        </div>
      );

    case 'roles':
      return (
        <div className="space-y-6">
          <p className="text-gray-700">
            EYWA implementa un sistema jerárquico de 4 roles con permisos crecientes. Cada usuario
            tiene exactamente un rol y un plan asignados.
          </p>
          <h3 className="text-lg font-semibold text-gray-900">Jerarquía de Roles</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Rol</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Permisos</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Acceso</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { rol: 'superadmin', permisos: 'Todo: gestionar usuarios, roles, planes, datos', acceso: 'Todas las vistas + Panel Super Admin' },
                  { rol: 'admin', permisos: 'Gestionar usuarios y planes (no roles)', acceso: 'Todas las vistas + Panel Admin + Panel Gestor' },
                  { rol: 'gestor', permisos: 'CRUD portfolio + preguntas diagnóstico', acceso: 'Todas las vistas + Panel Gestor' },
                  { rol: 'user', permisos: 'Dashboard, diagnóstico, validador, portfolio, academia (solo lectura)', acceso: 'Vistas base únicamente' },
                ].map((row, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="py-3 px-4">
                      <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">{row.rol}</code>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{row.permisos}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{row.acceso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mt-4">Planes de Suscripción</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">Gratuito</span>
              </div>
              <p className="text-sm text-gray-600">Acceso básico a la plataforma: diagnóstico, portfolio de lectura y academia.</p>
            </div>
            <div className="bg-white border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">Premium</span>
              </div>
              <p className="text-sm text-gray-600">Acceso completo: funcionalidades avanzadas, reportes detallados y prioridad en soporte.</p>
            </div>
          </div>
        </div>
      );

    case 'arquitectura':
      return (
        <div className="space-y-6">
          <p className="text-gray-700">
            EYWA está construida con una arquitectura limpia (Clean Architecture) que separa responsabilidades
            en capas bien definidas, facilitando el mantenimiento y la escalabilidad.
          </p>
          <h3 className="text-lg font-semibold text-gray-900">Stack Tecnológico</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { tech: 'Next.js 15', desc: 'Framework React con App Router' },
              { tech: 'TypeScript', desc: 'Tipado estático para seguridad' },
              { tech: 'Supabase', desc: 'Backend: Auth, PostgreSQL, RLS' },
              { tech: 'Tailwind CSS', desc: 'Estilos utilitarios' },
              { tech: 'Lucide React', desc: 'Iconografía' },
              { tech: 'Vercel', desc: 'Despliegue y hosting' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="font-medium text-gray-900 text-sm">{item.tech}</div>
                <div className="text-xs text-gray-500">{item.desc}</div>
              </div>
            ))}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mt-4">Estructura de Capas</h3>
          <div className="bg-gray-900 text-gray-300 rounded-lg p-5 font-mono text-xs leading-relaxed">
            <pre>{`src/
├── app/                    # Presentación (Routes)
│   ├── page.tsx            # Página principal
│   ├── docs/               # Documentación
│   └── api/admin/          # API Routes
├── components/             # Presentación (UI)
│   ├── HeroDashboard.tsx
│   ├── DiagnosticInterface.tsx
│   ├── EdutechDashboard.tsx
│   ├── NavigationSidebar.tsx
│   └── ...
├── contexts/               # Estado global
│   └── AuthContext.tsx
└── lib/
    ├── constants/           # Reglas de negocio
    │   ├── scoring.ts       # Umbrales y cálculos
    │   └── roles.ts         # Roles, permisos, rutas
    ├── repositories/        # Acceso a datos
    │   ├── profile-repository.ts
    │   ├── diagnostic-repository.ts
    │   ├── portfolio-repository.ts
    │   └── course-repository.ts
    ├── services/            # Lógica de negocio
    │   ├── diagnostic-service.ts
    │   └── course-service.ts
    ├── supabase/            # Infraestructura
    │   ├── client.ts
    │   ├── server.ts
    │   ├── admin.ts
    │   └── use-supabase.ts
    └── types/               # Tipos TypeScript
        └── database.ts`}</pre>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mt-4">Flujo de Datos</h3>
          <div className="flex items-center gap-2 flex-wrap text-sm">
            {['Componente (UI)', 'Servicio (Lógica)', 'Repositorio (Datos)', 'Supabase (DB)'].map((layer, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-medium text-xs">
                  {layer}
                </span>
                {i < 3 && <ChevronRight className="w-4 h-4 text-gray-400" />}
              </span>
            ))}
          </div>
        </div>
      );

    case 'seguridad':
      return (
        <div className="space-y-6">
          <p className="text-gray-700">
            La seguridad en EYWA opera en múltiples capas: autenticación JWT con Supabase Auth,
            Row Level Security (RLS) en PostgreSQL, y validación de roles en API Routes del servidor.
          </p>
          <h3 className="text-lg font-semibold text-gray-900">Capas de Seguridad</h3>
          <div className="space-y-3">
            {[
              {
                title: 'Autenticación (Supabase Auth)',
                desc: 'Tokens JWT con refresco automático vía middleware de Next.js. Las sesiones se almacenan en cookies seguras HttpOnly.',
              },
              {
                title: 'Row Level Security (RLS)',
                desc: 'Políticas a nivel de base de datos que aseguran que cada usuario solo acceda a los datos permitidos según su rol. Incluso si se bypasea el frontend, la base de datos rechaza accesos no autorizados.',
              },
              {
                title: 'API Routes Protegidas',
                desc: 'Las rutas administrativas (/api/admin/*) verifican el rol del usuario en el servidor usando el cliente service_role de Supabase antes de ejecutar operaciones sensibles.',
              },
              {
                title: 'Middleware de Sesión',
                desc: 'El middleware de Next.js intercepta cada request para refrescar tokens expirados, manteniendo la sesión activa de forma segura.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 text-sm">{item.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mt-4">Políticas RLS Principales</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Tabla</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Operación</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Quién</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { tabla: 'profiles', op: 'SELECT propio', quien: 'Todos los usuarios' },
                  { tabla: 'profiles', op: 'SELECT todos', quien: 'Admin / Superadmin' },
                  { tabla: 'profiles', op: 'UPDATE plan', quien: 'Admin / Superadmin' },
                  { tabla: 'profiles', op: 'UPDATE rol', quien: 'Superadmin' },
                  { tabla: 'portfolio_companies', op: 'SELECT', quien: 'Todos autenticados' },
                  { tabla: 'portfolio_companies', op: 'INSERT/UPDATE/DELETE', quien: 'Gestor / Admin / Superadmin' },
                  { tabla: 'diagnostic_questions', op: 'SELECT', quien: 'Todos autenticados' },
                  { tabla: 'courses', op: 'SELECT publicados', quien: 'Todos autenticados' },
                  { tabla: 'course_enrollments', op: 'SELECT/INSERT propios', quien: 'Cada usuario' },
                ].map((row, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="py-2 px-3 font-mono text-gray-700">{row.tabla}</td>
                    <td className="py-2 px-3 text-gray-700">{row.op}</td>
                    <td className="py-2 px-3 text-gray-600">{row.quien}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    default:
      return <p className="text-gray-500">Contenido no disponible.</p>;
  }
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('intro');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    general: true,
    usuario: true,
    administracion: true,
    tecnico: true,
  });

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const activeData = sections.find(s => s.id === activeSection);
  const categories = ['general', 'usuario', 'administracion', 'tecnico'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Book className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Documentación EYWA</h1>
              <p className="text-xs text-gray-500">Guía de usuario y documentación técnica</p>
            </div>
          </div>
          <span className="text-xs text-gray-400 hidden md:block">v1.0</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <aside className="w-64 lg:w-72 flex-shrink-0 border-r border-gray-200 bg-white min-h-[calc(100vh-65px)] hidden md:block sticky top-[65px] overflow-y-auto" style={{ maxHeight: 'calc(100vh - 65px)' }}>
          <nav className="p-4 space-y-1">
            {categories.map(cat => {
              const catSections = sections.filter(s => s.category === cat);
              const isExpanded = expandedCategories[cat];
              return (
                <div key={cat}>
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    {categoryLabels[cat]}
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  </button>
                  {isExpanded && (
                    <div className="space-y-0.5 mb-3">
                      {catSections.map(section => {
                        const Icon = section.icon;
                        const isActive = activeSection === section.id;
                        return (
                          <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                            <span className="truncate">{section.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden w-full bg-white border-b border-gray-200 overflow-x-auto">
          <div className="flex gap-1 p-2">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activeSection === section.id
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 p-6 md:p-10 max-w-4xl">
          {activeData && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <activeData.icon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-light text-gray-900">{activeData.title}</h2>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{categoryLabels[activeData.category]}</p>
                </div>
              </div>
              <div className="prose-sm">
                <SectionContent sectionId={activeSection} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
