"use client";

import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Activity, Landmark, Award, ArrowRight, User, Mail, Briefcase, Crown, Sparkles, Stethoscope, FolderLock, AlertCircle } from 'lucide-react';
import { ProfessionalTrustGauge } from './ProfessionalTrustGauge';
import { useAuth } from '@/contexts/AuthContext';
import { calculatePercentage, getGenesBand, getGenesBandClasses } from '@/lib/constants/scoring';
import { StatsRepository, type UserStats } from '@/lib/repositories/stats-repository';
import type { DiagnosticResult } from '@/lib/types/database';

const logo = "/logo.png";

interface HeroDashboardProps {
  diagnosticResult?: DiagnosticResult | null;
  onStartDiagnostic?: () => void;
}

export function HeroDashboard({ diagnosticResult, onStartDiagnostic }: HeroDashboardProps) {
  const { profile } = useAuth();
  const accountPlan = profile?.plan || 'free';
  const userEmail = profile?.email || '';

  // KPIs REALES (2026-07-18). Antes había 4 tarjetas "Pendiente" esperando datos
  // que nadie captura (carbono, gap IMI, auditorías). Ahora se muestra lo que la
  // plataforma sí sabe; si algo no aplica todavía, se dice explícitamente.
  const statsRepo = useMemo(() => new StatsRepository(), []);
  const [stats, setStats] = useState<UserStats | null>(null);
  useEffect(() => { statsRepo.me().then(setStats); }, [statsRepo]);

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
            backgroundImage: `url('https://images.unsplash.com/photo-1705998989555-87ed424a269d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbWF6b24lMjByYWluZm9yZXN0JTIwYWVyaWFsfGVufDF8fHx8MTc2OTEwMTY4NHww&ixlib=rb-4.1.0&q=80&w=1080')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-white"></div>
          {/* Subtle noise texture overlay */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Header Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-12">
          {/* User Info Card - Top Right */}
          <div className="flex justify-end mb-4 md:mb-6">
            <div className={`backdrop-blur-xl rounded-xl border-2 p-3 md:p-4 shadow-2xl ${
              accountPlan === 'premium'
                ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-amber-400/50'
                : 'bg-white/10 border-white/20'
            }`}>
              <div className="flex items-center gap-3 md:gap-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${
                  accountPlan === 'premium'
                    ? 'bg-gradient-to-br from-amber-400 to-yellow-500'
                    : 'bg-gradient-to-br from-emerald-500 to-emerald-700'
                }`}>
                  {accountPlan === 'premium' ? (
                    <Crown className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  ) : (
                    <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs md:text-sm font-semibold text-white">{profile?.fullName || 'Usuario'}</span>
                    {accountPlan === 'premium' && (
                      <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-amber-300" />
                    )}
                  </div>
                  <div className="text-xs text-white/70 flex items-center gap-1.5 mb-1">
                    <Mail className="w-3 h-3" />
                    <span className="hidden sm:inline">{userEmail}</span>
                    <span className="sm:hidden">Admin</span>
                  </div>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
                    accountPlan === 'premium'
                      ? 'bg-amber-400 text-amber-900'
                      : 'bg-gray-500/30 text-white border border-white/20'
                  }`}>
                    {accountPlan === 'premium' ? '✦ Premium' : 'Plan Gratuito'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page Title */}
          <div className="pt-4 md:pt-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-2 md:mb-3 tracking-tight">Centro de Control</h1>
            <p className="text-emerald-200 text-sm md:text-base lg:text-lg font-light">Orquestación de sostenibilidad y monitoreo en tiempo real</p>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-32 relative z-20 pb-8 md:pb-16">
        {/* Trust Score - Central Element */}
        <div className="mb-6 md:mb-8">
          <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl p-6 md:p-8 lg:p-12">
            {hasScore ? (
              <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-8">
                {/* Gauge */}
                <div className="flex-1 flex justify-center w-full">
                  <ProfessionalTrustGauge score={score} />
                </div>

                {/* Score Details */}
                <div className="flex-1 space-y-4 md:space-y-6 w-full lg:pl-12 lg:border-l border-gray-200">
                  <div>
                    <div className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Calificación Trust Score</div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900">{score}</span>
                      <span className="text-xl md:text-2xl text-gray-400 font-light">/100</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {diagnosticResult.score} de {diagnosticResult.maxScore} puntos GENES
                    </div>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${genesBadge}`}>
                        <Award className="w-4 h-4" />
                        Categoría {genesLevel}
                      </span>
                      <span className="text-xs text-gray-400">autoevaluación</span>
                    </div>
                  </div>

                  <div className="pt-4 md:pt-6 border-t border-gray-200">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Desglose por Categoría</div>
                    <div className="space-y-3">
                      {diagnosticResult.breakdown.map((item, i) => {
                        const pct = item.maxScore > 0 ? Math.round((item.score / item.maxScore) * 100) : 0;
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-xs md:text-sm text-gray-600 w-20 md:w-36 truncate" title={item.label}>{item.label}</span>
                            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                            <span className="text-xs md:text-sm font-semibold text-gray-900 w-10 text-right">{pct}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4 md:mt-6">
                    <button
                      onClick={onStartDiagnostic}
                      className="flex-1 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <Stethoscope className="w-4 h-4" />
                      Repetir Diagnóstico
                    </button>
                  </div>

                  <div className="text-xs text-gray-400 text-center">
                    Completado el {new Date(diagnosticResult.completedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ) : (
              /* No diagnostic yet - CTA */
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
            )}
          </div>
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
            iconBg="bg-blue-50"
            iconColor={stats?.esg?.delta != null && stats.esg.delta < 0 ? 'text-rose-600' : 'text-blue-600'}
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
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
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
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">Programa de Fortalecimiento Formativo</h3>
                    <p className="text-xs md:text-sm text-gray-600">Edutech · Capacitación Continua</p>
                  </div>
                </div>
                <p className="text-sm md:text-base text-gray-700 mb-6 leading-relaxed">
                  Programa diseñado para fortalecer las capacidades de los usuarios en tendencias de <span className="font-semibold text-blue-700">economía circular</span> y <span className="font-semibold text-blue-700">sostenibilidad</span>. 
                  Acceso a cursos especializados, webinars en vivo y material actualizado sobre las últimas prácticas y regulaciones del sector.
                </p>
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-blue-200/30">
                    <div className="text-sm md:text-base font-semibold text-gray-900 mb-1">
                      {stats ? stats.academy.enrolled : '—'}
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wider">Cursos Inscritos</div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-blue-200/30">
                    <div className="text-sm md:text-base font-semibold text-gray-900 mb-1">
                      {stats ? `${stats.academy.hours} h` : '—'}
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wider">Horas Formativas</div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-blue-200/30">
                    <div className="text-sm md:text-base font-semibold text-gray-900 mb-1">
                      {stats ? `${stats.academy.avg_progress}%` : '—'}
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wider">Progreso Promedio</div>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-auto lg:ml-8">
                <button className="w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium text-sm shadow-lg flex items-center justify-center gap-2">
                  Acceder a Cursos
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Activity & Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-lg p-6 md:p-8">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4 md:mb-6 uppercase tracking-wide text-sm">Actividad del Sistema</h3>
            <div className="space-y-4">
              {[
                { event: 'Auditoría de acreditación completada', time: 'Hace 2 horas', status: 'success', detail: 'Score: 85/100' },
                { event: 'Datos de carbono sincronizados', time: 'Hace 5 horas', status: 'info', detail: 'Fuente: Sensores IoT' },
                { event: 'Nuevo requisito de cumplimiento', time: 'Hace 1 día', status: 'warning', detail: 'Regulación EU 2024/789' },
                { event: 'Reporte para inversores generado', time: 'Hace 2 días', status: 'success', detail: 'Reporte Q4 2025' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 md:gap-4 pb-4 border-b border-gray-100 last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    item.status === 'success' ? 'bg-emerald-500' : 
                    item.status === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs md:text-sm font-medium text-gray-900 truncate">{item.event}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.detail}</div>
                  </div>
                  <div className="text-xs text-gray-400 flex-shrink-0">{item.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-lg p-6 md:p-8">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4 md:mb-6 uppercase tracking-wide text-sm">Acciones Rápidas</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all text-sm font-medium text-left">
                Iniciar Nueva Evaluación
              </button>
              <button className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-900 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium text-left">
                Generar Reporte
              </button>
              <button className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-900 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium text-left">
                Ver Análisis
              </button>
              <button className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-900 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium text-left">
                Exportar Datos
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
