"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, Download, TrendingUp, AlertCircle, X, FileText, Calendar, CheckSquare, Loader2 } from 'lucide-react';
import { PortfolioRepository } from '@/lib/repositories/portfolio-repository';
import type { PortfolioCompany } from '@/lib/types/database';

const logo = "/logo.png";

export function InvestorPortfolio() {
  const portfolioRepo = useMemo(() => new PortfolioRepository(), []);
  const [companies, setCompanies] = useState<PortfolioCompany[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);

  const fetchCompanies = useCallback(async () => {
    try {
      const data = await portfolioRepo.getAll();
      setCompanies(data);
    } catch { /* handle error */ }
    setLoadingData(false);
  }, [portfolioRepo]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);
  const [reportForm, setReportForm] = useState({
    type: 'trimestral',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    metrics: [] as string[],
  });

  const reportTypes = [
    { id: 'trimestral', label: 'Reporte Trimestral', description: 'Analisis de metricas ESG del trimestre' },
    { id: 'anual', label: 'Reporte Anual', description: 'Revision completa de sostenibilidad del ano' },
    { id: 'esg', label: 'Reporte ESG Personalizado', description: 'Metricas ambientales, sociales y de gobernanza' },
    { id: 'carbono', label: 'Reporte de Carbono', description: 'Analisis detallado de emisiones y captura' },
  ];

  const availableMetrics = [
    'Trust Score Promedio',
    'Impacto de Carbono Total',
    'Certificaciones Activas',
    'Auditorias Completadas',
    'Tendencias de Sostenibilidad',
    'Analisis de Riesgo',
    'Cumplimiento Regulatorio',
    'Comparativa Sectorial',
  ];

  const toggleMetric = (metric: string) => {
    setReportForm(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metric)
        ? prev.metrics.filter(m => m !== metric)
        : [...prev.metrics, metric]
    }));
  };

  const handleGenerateReport = () => {
    console.log('Generando reporte:', reportForm);
    setShowReportModal(false);
    setReportForm({
      type: 'trimestral',
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      metrics: [],
    });
  };

  const portfolioStats = [
    { label: 'Valor Total del Portfolio', value: '$142.5M', change: '+12.3%' },
    { label: 'Trust Score Promedio', value: '82.8', change: '+4.2' },
    { label: 'Impacto de Carbono Total', value: '6.5kt', change: '+18%' },
    { label: 'Empresas', value: '24', change: '+3' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2">Portfolio de Inversores</h1>
              <p className="text-gray-500">Monitoreo de empresas y metricas de sostenibilidad</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all text-sm font-medium"
              >
                Nuevo Reporte
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-6">
            {portfolioStats.map((stat, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">{stat.label}</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-light text-gray-900">{stat.value}</span>
                  <span className="text-sm text-emerald-600 font-medium">{stat.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar empresas..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option>Todos los Sectores</option>
              <option>Agricultura</option>
              <option>Tecnologia</option>
              <option>Energia</option>
            </select>
            <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option>Todos los Estados</option>
              <option>Verificado</option>
              <option>Pendiente</option>
              <option>En Revision</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sector</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trust Score</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Impacto de Carbono</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tendencia</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ultima Auditoria</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Riesgo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{company.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{company.sector}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-light text-gray-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {company.score}
                      </div>
                      <div className="text-xs text-gray-400">/100</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded text-xs font-medium ${
                      company.status === 'Verificado'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : company.status === 'Auditoria Pendiente'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {company.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{company.carbon || '—'}</div>
                    <div className="text-xs text-gray-500">CO2 Capturado</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      (company.trend || '').startsWith('+') ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className="w-3 h-3" />
                      {company.trend || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{company.lastAudit}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {company.risk === 'alto' && <AlertCircle className="w-4 h-4 text-red-500" />}
                      <span className={`text-sm font-medium capitalize ${
                        company.risk === 'bajo' ? 'text-emerald-600' :
                        company.risk === 'medio' ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {company.risk}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando 1-5 de 24 empresas
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium">
              Anterior
            </button>
            <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all text-sm font-medium">
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modal Nuevo Reporte */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-light text-gray-900">Crear Nuevo Reporte</h2>
                  <p className="text-sm text-gray-500">Genera un reporte personalizado de sostenibilidad</p>
                </div>
              </div>
              <button onClick={() => setShowReportModal(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-all">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="px-8 py-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Reporte</label>
                <div className="grid grid-cols-2 gap-3">
                  {reportTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setReportForm({ ...reportForm, type: type.id })}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${
                        reportForm.type === type.id ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 mb-1">{type.label}</div>
                      <div className="text-sm text-gray-600">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titulo del Reporte</label>
                <input
                  type="text"
                  value={reportForm.title}
                  onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                  placeholder="Ej: Reporte Q1 2026 - Sostenibilidad Corporativa"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripcion</label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  placeholder="Descripcion breve del alcance y objetivos del reporte..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />Fecha Inicio</div>
                  </label>
                  <input type="date" value={reportForm.startDate} onChange={(e) => setReportForm({ ...reportForm, startDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
                  <input type="date" value={reportForm.endDate} onChange={(e) => setReportForm({ ...reportForm, endDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4" />Metricas a Incluir</div>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {availableMetrics.map((metric) => (
                    <button key={metric} onClick={() => toggleMetric(metric)}
                      className={`p-3 border-2 rounded-lg text-left transition-all flex items-center gap-3 ${
                        reportForm.metrics.includes(metric) ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        reportForm.metrics.includes(metric) ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300'
                      }`}>
                        {reportForm.metrics.includes(metric) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{metric}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-4 flex items-center justify-end gap-3">
              <button onClick={() => setShowReportModal(false)}
                className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all">
                Cancelar
              </button>
              <button onClick={handleGenerateReport}
                disabled={!reportForm.title || !reportForm.startDate || !reportForm.endDate || reportForm.metrics.length === 0}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generar Reporte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
