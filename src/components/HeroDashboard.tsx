"use client";

import { useEffect, useMemo, useState } from 'react';
import { getOrgActivaId } from '@/lib/repositories/organization-repository';
import { TrendingUp, TrendingDown, Activity, Landmark, Award, ArrowRight, User, Mail, Briefcase, Crown, Sparkles, Stethoscope, FolderLock, AlertCircle } from 'lucide-react';
import { ProfessionalTrustGauge } from './ProfessionalTrustGauge';
import { TrustScorePanel } from './TrustScorePanel';
import { useAuth } from '@/contexts/AuthContext';
import { calculatePercentage, getGenesBand, getGenesBandClasses } from '@/lib/constants/scoring';
import { StatsRepository, type UserStats } from '@/lib/repositories/stats-repository';
import type { DiagnosticResult } from '@/lib/types/database';

const logo = "/logo.png";

interface HeroDashboardProps {
  diagnosticResult?: DiagnosticResult | null;
  onStartDiagnostic?: () => void;
  onOpenDataroom?: () => void;
  onOpenAcademia?: () => void;
}

export function HeroDashboard({ diagnosticResult, onStartDiagnostic, onOpenDataroom, onOpenAcademia }: HeroDashboardProps) {
  const { profile } = useAuth();
  const accountPlan = profile?.plan || 'free';
  const userEmail = profile?.email || '';

  // KPIs REALES (2026-07-18). Antes había 4 tarjetas "Pendiente" esperando datos
  // que nadie captura (carbono, gap IMI, auditorías). Ahora se muestra lo que la
  // plataforma sí sabe; si algo no aplica todavía, se dice explícitamente.
  const statsRepo = useMemo(() => new StatsRepository(), []);
  const [stats, setStats] = useState<UserStats | null>(null);
  // El panel muestra los datos de la empresa activa, no de la más antigua.
  useEffect(() => { statsRepo.me(getOrgActivaId()).then(setStats); }, [statsRepo]);

  const hasScore = diagnosticResult !== null && diagnosticResult !== undefined;
  const score = hasScore ? calculatePercentage(diagnosticResult.score, diagnosticResult.maxScore) : 0;
  // La categoría sale del puntaje GENES (0-75), NO del porcentaje: es la misma
  // escala del Diagnóstico y del Validador. Antes este panel usaba getScoreLevel/
  // getSealLabel — una tercera escala que se contradecía con GENES (53 puntos era
  // "Oro" en el diagnóstico y "Silver Seal" aquí, dos metales para el mismo dato).
  const genesLevel = hasScore ? getGenesBand(diagnosticResult.score) : '';
  const genesBadge = hasScore ? getGenesBandClasses(diagnosticResult.score) : '';
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header with Background Image */}
      <div className="relative h-[300px] md:h-[400px] overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1769794305664-cfb57957246f?auto=format&fit=crop&w=1600&q=75')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/85 via-emerald-950/70 to-white"></div>
          {/* Subtle noise texture overlay */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Header Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-12">
          {/* Page Title */}
          <div className="pt-10 md:pt-16">
            <h1 className="ey-blur-in text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-2 md:mb-3 tracking-tight" style={{ textShadow: '0 2px 18px rgba(0,0,0,.45)' }}>Centro de Control</h1>
            <p className="text-emerald-100 text-sm md:text-base lg:text-lg font-medium" style={{ textShadow: '0 1px 12px rgba(0,0,0,.5)' }}>Tu impacto medido con la metodología GENES</p>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-32 relative z-20 pb-8 md:pb-16">
        {/* Trust Score - Central Element */}
        <div className="mb-6 md:mb-8">
            {hasScore ? (
              <TrustScorePanel result={diagnosticResult} onRepeat={onStartDiagnostic} onOpenDataroom={onOpenDataroom} />
            ) : (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 md:p-8 lg:p-12">
              {/* Sin diagnóstico aún: CTA */}
              <div className="flex flex-col items-center text-center py-8">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                  <ProfessionalTrustGauge score={0} />
                </div>
                <h3 className="text-2xl md:text-3xl font-light text-gray-900 mb-3">Sin diagnóstico aún</h3>
                <p className="text-gray-500 mb-8 max-w-md">
                  Completa el cuestionario de diagnóstico ESG para obtener tu Trust Score y descubrir tu nivel de sostenibilidad.
                </p>
                <button
                  onClick={onStartDiagnostic}
                  className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all font-medium text-sm flex items-center gap-2 shadow-lg"
                >
                  <Stethoscope className="w-4 h-4" />
                  Iniciar Diagnóstico
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
          </div>
            )}
        </div>

        {/* Data Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* KPI 1: mayor brecha ESG (la categoría GENES más baja) */}
          <KpiCard
            icon={AlertCircle}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            label="Tu mayor brecha"
            value={stats?.esg?.weakest ? stats.esg.weakest.label : '—'}
            hint={
              stats?.esg?.weakest
                ? `${stats.esg.weakest.avg.toFixed(1)} / 5 · ${stats.esg.zero_criteria} criterio${stats.esg.zero_criteria === 1 ? '' : 's'} en cero`
                : 'Haz tu diagnóstico para identificarla'
            }
          />

          {/* KPI 2: evolución del índice vs. la evaluación anterior */}
          <KpiCard
            icon={stats?.esg?.delta != null && stats.esg.delta < 0 ? TrendingDown : TrendingUp}
            iconBg="bg-emerald-50"
            iconColor={stats?.esg?.delta != null && stats.esg.delta < 0 ? 'text-rose-600' : 'text-emerald-600'}
            label="Evolución del índice"
            value={
              stats?.esg?.delta != null
                ? `${stats.esg.delta >= 0 ? '+' : ''}${stats.esg.delta.toFixed(2)}`
                : stats?.esg ? 'Primera medición' : '—'
            }
            hint={
              stats?.esg?.delta != null
                ? 'puntos vs. tu evaluación anterior'
                : stats?.esg ? 'Rehaz el diagnóstico para comparar' : 'Sin diagnóstico aún'
            }
          />

          {/* KPI 3: dataroom */}
          <KpiCard
            icon={FolderLock}
            iconBg="bg-lime-50"
            iconColor="text-lime-600"
            label="Dataroom completo"
            value={stats?.dataroom ? `${stats.dataroom.percentage}%` : '—'}
            hint={
              stats?.dataroom
                ? `${stats.dataroom.completed} de ${stats.dataroom.total} documentos`
                : 'Crea tu organización para habilitarlo'
            }
          />

          {/* KPI 4: fondos que cierran pronto */}
          <KpiCard
            icon={Landmark}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            label="Fondos por cerrar"
            value={stats ? String(stats.funds.closing_soon) : '—'}
            hint={
              stats?.funds.next_closing
                ? `Próximo: ${stats.funds.next_closing.name.slice(0, 28)}${stats.funds.next_closing.name.length > 28 ? '…' : ''}`
                : stats ? `${stats.funds.open_total} convocatorias vigentes` : 'Cargando…'
            }
          />
        </div>

        {/* Edutech Program Highlight */}
        <div className="mb-6 md:mb-8">
          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-6 md:p-8">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">Programa de Fortalecimiento Formativo</h3>
                    <p className="text-xs md:text-sm text-gray-600">Edutech · Capacitación Continua</p>
                  </div>
                </div>
                <p className="text-sm md:text-base text-gray-700 mb-6 leading-relaxed">
                  Programa diseñado para fortalecer las capacidades de los usuarios en tendencias de <span className="font-semibold text-emerald-700">economía circular</span> y <span className="font-semibold text-emerald-700">sostenibilidad</span>. 
                  Acceso a cursos especializados, webinars en vivo y material actualizado sobre las últimas prácticas y regulaciones del sector.
                </p>
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-emerald-200/30">
                    <div className="text-sm md:text-base font-semibold text-gray-900 mb-1">
                      {stats ? stats.academy.enrolled : '—'}
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wider">Cursos Inscritos</div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-emerald-200/30">
                    <div className="text-sm md:text-base font-semibold text-gray-900 mb-1">
                      {stats ? `${stats.academy.hours} h` : '—'}
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wider">Horas Formativas</div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-emerald-200/30">
                    <div className="text-sm md:text-base font-semibold text-gray-900 mb-1">
                      {stats ? `${stats.academy.avg_progress}%` : '—'}
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wider">Progreso Promedio</div>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-auto lg:ml-8">
                <button onClick={onOpenAcademia} className="w-full lg:w-auto px-6 py-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all font-semibold text-sm flex items-center justify-center gap-2">
                  Acceder a Cursos
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Activity & Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* En desarrollo. Antes aquí había un feed de "Actividad del Sistema" con
              eventos INVENTADOS (auditoría completada, carbono desde sensores IoT…).
              Regla de la reunión 2026-10-08: lo que no existe se dice "en desarrollo". */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex items-baseline justify-between gap-3 mb-4 md:mb-6">
              <h3 className="font-semibold text-gray-900 uppercase tracking-wide text-sm">En desarrollo</h3>
              <span className="text-xs text-gray-400">Lo que viene, con lo que necesita para salir</span>
            </div>
            <div className="space-y-4">
              {[
                { t: 'Índice de Madurez Industrial (IMI) y TRL/CRL', d: 'Reporte de madurez por empresa dentro del diagnóstico', espera: 'Criterios y escala de Eduardo' },
                { t: 'Nota conceptual asistida (70/30)', d: 'Borrador a partir del problema, el MPP y el diagnóstico; el consultor completa el 30%', espera: 'En construcción' },
                { t: 'Tablero de objetivos (OKR)', d: 'Objetivos y resultados clave por organización', espera: 'Diseño con Eduardo' },
                { t: 'Indicadores de economía circular (PRODUCE)', d: 'Conexión con la calculadora y las hojas de ruta sectoriales', espera: 'Aún no conectado' },
              ].map((item) => (
                <div key={item.t} className="flex items-start gap-3 md:gap-4 pb-4 border-b border-gray-100 last:border-0">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-amber-400" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{item.t}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.d}</div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 flex-shrink-0 whitespace-nowrap">{item.espera}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-lg p-6 md:p-8">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4 md:mb-6 uppercase tracking-wide text-sm">Acciones Rápidas</h3>
            <div className="space-y-3">
              {/* "Generar Reporte", "Ver Análisis" y "Exportar Datos" se retiraron: no
                  hacían nada (PLAN B3). El informe PDF se descarga al terminar el diagnóstico. */}
              <button
                onClick={onStartDiagnostic}
                className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all text-sm font-medium text-left"
              >
                {diagnosticResult ? 'Repetir diagnóstico (el informe PDF sale al terminar)' : 'Iniciar Nueva Evaluación'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// Tarjeta de KPI del dashboard. Si el dato aún no aplica, el `hint` explica por qué
// en vez de mostrar un "Pendiente" mudo.
function KpiCard({ icon: Icon, iconBg, iconColor, label, value, hint }: {
  icon: typeof Activity; iconBg: string; iconColor: string;
  label: string; value: string; hint: string;
}) {
  const empty = value === '—';
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-lg p-4 md:p-6">
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <div className="text-xs md:text-sm text-gray-500 uppercase tracking-wider mb-2">{label}</div>
      <div className={`text-base md:text-lg font-semibold mb-1 ${empty ? 'text-gray-400' : 'text-gray-900'}`}>
        {value}
      </div>
      <div className="text-xs text-gray-400">{hint}</div>
    </div>
  );
}
