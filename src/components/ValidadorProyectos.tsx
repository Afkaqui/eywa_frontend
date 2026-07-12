"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  ValidatorRepository,
  type ProjectPlanRow,
  type CreatePlanPayload,
} from '@/lib/repositories/validator-repository';
import { 
  Plus,
  Search, 
  Filter, 
  FileText,
  TrendingUp,
  Leaf,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Building2,
  DollarSign,
  BarChart3,
  Eye,
  Download,
  X,
  Upload,
  Lightbulb,
  Target,
  Award,
  Activity
} from 'lucide-react';

// El tipo del proyecto viene del repository (alineado con el backend)
type ProjectPlan = ProjectPlanRow;

const validatorRepo = new ValidatorRepository();

export function ValidadorProyectos() {
  const [projects, setProjects] = useState<ProjectPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectPlan | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'proyectos' | 'reportes'>('proyectos');

  const reports = projects.filter(p => p.report);
  const openReport = (project: ProjectPlan) => { setSelectedProject(project); setShowReportModal(true); };

  const loadProjects = useCallback(async () => {
    try {
      setLoadError(null);
      const plans = await validatorRepo.listPlans();
      setProjects(plans);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Error al cargar proyectos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  // Ejecuta el análisis (IA o heurístico) de un proyecto pendiente
  const handleAnalyze = useCallback(async (id: string) => {
    setAnalyzingId(id);
    try {
      const updated = await validatorRepo.analyzePlan(id);
      setProjects(prev => prev.map(p => (p.id === id ? updated : p)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo generar el análisis');
    } finally {
      setAnalyzingId(null);
    }
  }, []);

  // Filtrar proyectos
  const filteredProjects = projects.filter(project => {
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'analyzed' && project.status === 'analyzed') ||
                         (selectedStatus === 'pending' && project.status === 'pending');
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Estadísticas
  const stats = {
    total: projects.length,
    analyzed: projects.filter(p => p.status === 'analyzed').length,
    pending: projects.filter(p => p.status === 'pending').length,
    avgScore: projects.filter(p => p.report).reduce((acc, p) => acc + (p.report?.overallScore || 0), 0) / projects.filter(p => p.report).length || 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2">
                Validador de Proyectos
              </h1>
              <p className="text-gray-600">Crea tus proyectos y genera un análisis preliminar ESG (análisis con IA próximamente)</p>
            </div>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-2 font-medium shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Nuevo Proyecto
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-semibold text-blue-900">{stats.total}</span>
              </div>
              <div className="text-sm text-blue-700 font-medium">Total Proyectos</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-2xl font-semibold text-emerald-900">{stats.analyzed}</span>
              </div>
              <div className="text-sm text-emerald-700 font-medium">Analizados</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-yellow-600" />
                <span className="text-2xl font-semibold text-yellow-900">{stats.pending}</span>
              </div>
              <div className="text-sm text-yellow-700 font-medium">Pendientes</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-5 h-5 text-purple-600" />
                <span className="text-2xl font-semibold text-purple-900">{stats.avgScore.toFixed(0)}</span>
              </div>
              <div className="text-sm text-purple-700 font-medium">Score Promedio</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Proyectos | Reportes */}
      <div className="px-8 pt-6">
        <div className="flex items-center gap-1 border-b border-gray-200">
          {([['proyectos', 'Proyectos', projects.length], ['reportes', 'Reportes', reports.length]] as const).map(([id, label, count]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === id
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label} <span className="ml-1 text-xs text-gray-400">{count}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-500 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-yellow-500" />
          Los análisis son <strong>preliminares</strong> (sin IA). El análisis avanzado con IA estará disponible próximamente.
        </div>
      </div>

      {/* ── Vista: PROYECTOS ── */}
      {activeTab === 'proyectos' && (
      <div className="px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar proyectos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Todos</option>
                <option value="analyzed">Analizados</option>
                <option value="pending">Pendientes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading / error states */}
        {loading && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Activity className="w-10 h-10 text-emerald-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500">Cargando proyectos...</p>
          </div>
        )}

        {!loading && loadError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <p className="text-red-700 mb-3">{loadError}</p>
            <button
              onClick={() => { setLoading(true); loadProjects(); }}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && !loadError && (
        <div className="grid grid-cols-1 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {project.id}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      project.status === 'analyzed' 
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {project.status === 'analyzed' ? 'Análisis preliminar' : 'Sin analizar'}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{project.description}</p>

                  <div className="grid grid-cols-5 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Tipo</div>
                        <div className="text-sm font-medium text-gray-900">{project.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Presupuesto</div>
                        <div className="text-sm font-medium text-gray-900">
                          ${(project.budget / 1000).toFixed(0)}k
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Duración</div>
                        <div className="text-sm font-medium text-gray-900">{project.duration} meses</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Leaf className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Meta CO₂</div>
                        <div className="text-sm font-medium text-emerald-700">
                          {(project.carbonGoal / 1000).toFixed(1)}k t
                        </div>
                      </div>
                    </div>
                    {project.report && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                          <Award className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Score ESG</div>
                          <div className="text-sm font-bold text-gray-900">{project.report.overallScore}/100</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {project.status === 'analyzed' && project.report ? (
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setShowReportModal(true);
                      }}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-2 font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Reporte
                    </button>
                  ) : (
                    <button
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all flex items-center gap-2 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={() => handleAnalyze(project.id)}
                      disabled={analyzingId === project.id}
                      title="Genera un análisis preliminar sin IA. El análisis con IA estará disponible próximamente."
                    >
                      <Activity className={`w-4 h-4 ${analyzingId === project.id ? 'animate-spin' : ''}`} />
                      {analyzingId === project.id ? 'Analizando...' : 'Análisis preliminar'}
                    </button>
                  )}
                </div>
              </div>

              {project.report && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-500">Ambiental:</div>
                        <div className="text-sm font-semibold text-emerald-700">
                          {project.report.esgScores.environmental}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-500">Social:</div>
                        <div className="text-sm font-semibold text-blue-700">
                          {project.report.esgScores.social}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-500">Gobernanza:</div>
                        <div className="text-sm font-semibold text-purple-700">
                          {project.report.esgScores.governance}
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                      project.report.riskLevel === 'low' ? 'bg-emerald-100 text-emerald-700' :
                      project.report.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      <Shield className="w-4 h-4" />
                      <span className="text-xs font-medium">
                        Riesgo {project.report.riskLevel === 'low' ? 'Bajo' : 
                                project.report.riskLevel === 'medium' ? 'Medio' : 'Alto'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredProjects.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No se encontraron proyectos</p>
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Crear tu primer proyecto
              </button>
            </div>
          )}
        </div>
        )}
      </div>
      )}

      {/* ── Vista: REPORTES ── */}
      {activeTab === 'reportes' && (
      <div className="px-8 py-6">
        {reports.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">Aún no hay reportes</p>
            <p className="text-sm text-gray-400 mb-4">Genera un análisis preliminar desde un proyecto para ver su reporte aquí.</p>
            <button onClick={() => setActiveTab('proyectos')} className="text-emerald-600 hover:text-emerald-700 font-medium">
              Ir a proyectos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {reports.map((project) => (
              <div key={project.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-1 rounded bg-emerald-100 text-emerald-700">Análisis preliminar</span>
                      {project.analyzedAt && (
                        <span className="text-xs text-gray-400">
                          {new Date(project.analyzedAt).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-yellow-600" /><strong className="text-gray-900">{project.report!.overallScore}/100</strong></span>
                      <span className="text-gray-500">A: <strong className="text-emerald-700">{project.report!.esgScores.environmental}</strong></span>
                      <span className="text-gray-500">S: <strong className="text-blue-700">{project.report!.esgScores.social}</strong></span>
                      <span className="text-gray-500">G: <strong className="text-purple-700">{project.report!.esgScores.governance}</strong></span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        project.report!.riskLevel === 'low' ? 'bg-emerald-100 text-emerald-700' :
                        project.report!.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        Riesgo {project.report!.riskLevel === 'low' ? 'Bajo' : project.report!.riskLevel === 'medium' ? 'Medio' : 'Alto'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => openReport(project)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-2 font-medium flex-shrink-0"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Reporte
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
          onCreated={async () => { await loadProjects(); }}
        />
      )}

      {/* Report Modal */}
      {showReportModal && selectedProject && selectedProject.report && (
        <ReportModal
          project={selectedProject}
          report={selectedProject.report}
          onClose={() => {
            setShowReportModal(false);
            setSelectedProject(null);
          }}
        />
      )}
    </div>
  );
}

// New Project Modal
function NewProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => Promise<void> | void }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Energía Renovable',
    description: '',
    budget: '',
    duration: '',
    carbonGoal: '',
    objectives: '',
    stakeholders: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: number; type: string }>>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const { profile } = useAuth();
  const accountPlan = profile?.plan || 'free';
  const maxFiles = accountPlan === 'free' ? 1 : Infinity;
  const canUploadMore = uploadedFiles.length < maxFiles;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const filesArray = Array.from(files);
      const remainingSlots = maxFiles - uploadedFiles.length;
      
      // Si es cuenta gratuita y ya alcanzó el límite
      if (accountPlan === 'free' && uploadedFiles.length >= maxFiles) {
        setShowUpgradeModal(true);
        e.target.value = ''; // Reset input
        return;
      }
      
      // Limitar archivos según el plan
      const filesToAdd = accountPlan === 'free' 
        ? filesArray.slice(0, remainingSlots)
        : filesArray;
      
      const newFiles = filesToAdd.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }));
      
      setUploadedFiles([...uploadedFiles, ...newFiles]);
      
      // Si intentó subir más archivos de los permitidos
      if (accountPlan === 'free' && filesArray.length > remainingSlots) {
        setTimeout(() => setShowUpgradeModal(true), 300);
      }
    }
    e.target.value = ''; // Reset input
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // Validación mínima de campos obligatorios
    if (!formData.name || !formData.description || !formData.budget || !formData.duration || !formData.carbonGoal) {
      setSubmitError('Completa todos los campos obligatorios (*)');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload: CreatePlanPayload = {
        name:         formData.name,
        type:         formData.type,
        description:  formData.description,
        budget:       Number(formData.budget) || 0,
        duration:     Number(formData.duration) || 0,
        carbonGoal:   Number(formData.carbonGoal) || 0,
        objectives:   formData.objectives || null,
        stakeholders: formData.stakeholders || null,
        documents:    uploadedFiles,
      };
      await validatorRepo.createPlan(payload);
      // Crear NO analiza: el análisis es una acción aparte desde la lista.
      await onCreated();
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo crear el proyecto');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Nuevo Proyecto</h2>
              <p className="text-sm text-gray-600 mt-1">Ingresa los detalles de tu plan de sostenibilidad</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Nombre del Proyecto *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Implementación de Energía Solar en Oficinas"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tipo de Proyecto *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option>Energía Renovable</option>
                  <option>Captura de Carbono</option>
                  <option>Economía Circular</option>
                  <option>Gestión de Residuos</option>
                  <option>Eficiencia Energética</option>
                  <option>Agricultura Sostenible</option>
                  <option>Transporte Sostenible</option>
                  <option>Recursos Hídricos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Presupuesto (USD) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="850000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Duración (meses) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="12"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Meta de Reducción CO₂ (toneladas) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.carbonGoal}
                  onChange={(e) => setFormData({ ...formData, carbonGoal: e.target.value })}
                  placeholder="1200"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Descripción del Proyecto *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Describe tu proyecto: alcance, metodología, impacto esperado..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Objetivos Específicos
              </label>
              <textarea
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                rows={3}
                placeholder="Lista los objetivos específicos del proyecto..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Partes Interesadas / Stakeholders
              </label>
              <textarea
                value={formData.stakeholders}
                onChange={(e) => setFormData({ ...formData, stakeholders: e.target.value })}
                rows={2}
                placeholder="Identifica las partes interesadas del proyecto..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Documents Upload Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Documentos Adicionales
                </label>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${
                    uploadedFiles.length >= maxFiles ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {uploadedFiles.length} / {accountPlan === 'free' ? '1' : '∞'}
                  </span>
                  {accountPlan === 'free' && (
                    <button
                      type="button"
                      onClick={() => setShowUpgradeModal(true)}
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700 underline"
                    >
                      Mejorar Plan
                    </button>
                  )}
                </div>
              </div>

              {/* Free Plan Warning Banner */}
              {accountPlan === 'free' && uploadedFiles.length === 0 && (
                <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Plan Gratuito - Límite: 1 documento</p>
                    <p className="text-xs">
                      Actualiza a Plan Premium para subir documentos ilimitados y obtener análisis más detallados.
                    </p>
                  </div>
                </div>
              )}

              <div className={`border-2 border-dashed rounded-xl p-6 transition-colors ${
                canUploadMore 
                  ? 'border-gray-300 hover:border-emerald-400 cursor-pointer' 
                  : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
              }`}>
                <input
                  type="file"
                  id="file-upload"
                  multiple={accountPlan === 'premium'}
                  onChange={handleFileUpload}
                  disabled={!canUploadMore}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                />
                <label
                  htmlFor={canUploadMore ? "file-upload" : undefined}
                  className={`flex flex-col items-center justify-center ${canUploadMore ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    canUploadMore ? 'bg-emerald-100' : 'bg-gray-200'
                  }`}>
                    <Upload className={`w-8 h-8 ${canUploadMore ? 'text-emerald-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="text-center">
                    {canUploadMore ? (
                      <>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Haz clic para subir archivos o arrastra aquí
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, Word, Excel, PowerPoint, Imágenes (Máx. 10MB cada uno)
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Límite de archivos alcanzado
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowUpgradeModal(true)}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium underline"
                        >
                          Actualizar a Premium para más documentos
                        </button>
                      </>
                    )}
                  </div>
                </label>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Archivos cargados ({uploadedFiles.length})
                  </div>
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="w-8 h-8 rounded-lg hover:bg-red-100 flex items-center justify-center transition-colors flex-shrink-0 ml-2"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 text-xs text-gray-500">
                <strong>Documentos recomendados:</strong> Estudio de viabilidad, presupuesto detallado, 
                plan de implementación, análisis de impacto ambiental, permisos, certificaciones.
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Análisis del proyecto</p>
                <p>Una vez creado, podrás generar un <strong>análisis preliminar</strong> desde la lista de proyectos. El análisis avanzado con IA estará disponible próximamente.</p>
              </div>
            </div>
          </form>

          <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
            {submitError && (
              <div className="mb-3 text-sm text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {submitError}
              </div>
            )}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-all font-medium disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-medium flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Upload className={`w-5 h-5 ${submitting ? 'animate-pulse' : ''}`} />
                {submitting ? 'Creando...' : 'Crear Proyecto'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold">Actualiza a Premium</h3>
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-emerald-100">Desbloquea todas las funcionalidades de EYWA</p>
              </div>

              <div className="p-8">
                {/* Comparison */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {/* Free Plan */}
                  <div className="border-2 border-gray-200 rounded-xl p-6">
                    <div className="text-center mb-6">
                      <div className="text-sm font-semibold text-gray-500 uppercase mb-2">Gratuito</div>
                      <div className="text-3xl font-bold text-gray-900">$0</div>
                      <div className="text-sm text-gray-500">por mes</div>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">1 documento por proyecto</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">Análisis básico ESG</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-400">Reportes avanzados</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-400">Soporte prioritario</span>
                      </li>
                    </ul>
                  </div>

                  {/* Premium Plan */}
                  <div className="border-2 border-emerald-500 rounded-xl p-6 relative bg-gradient-to-br from-emerald-50 to-white">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        RECOMENDADO
                      </span>
                    </div>
                    <div className="text-center mb-6">
                      <div className="text-sm font-semibold text-emerald-700 uppercase mb-2">Premium</div>
                      <div className="text-3xl font-bold text-gray-900">$20</div>
                      <div className="text-sm text-gray-500">por mes</div>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 font-medium">Documentos ilimitados</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 font-medium">Análisis avanzado con IA</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 font-medium">Reportes personalizables</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 font-medium">Soporte prioritario 24/7</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 font-medium">API de integración</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                  >
                    Continuar con Plan Gratuito
                  </button>
                  <button
                    onClick={() => {
                      alert('Redirigiendo a página de pago...');
                      setShowUpgradeModal(false);
                    }}
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <Award className="w-5 h-5" />
                    Actualizar a Premium
                  </button>
                </div>

                <p className="text-xs text-center text-gray-500 mt-4">
                  Cancela en cualquier momento. Sin compromisos a largo plazo.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Report Modal
function ReportModal({ 
  project, 
  report, 
  onClose 
}: { 
  project: ProjectPlan; 
  report: NonNullable<ProjectPlan['report']>; 
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-blue-50">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded">
                {project.id}
              </span>
              <span className="text-xs font-medium px-2 py-1 rounded bg-emerald-100 text-emerald-700">
                Reporte de Análisis
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">{project.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg hover:bg-white/50 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Overall Score */}
          <div className="bg-gradient-to-r from-emerald-100 to-blue-100 border-2 border-emerald-300 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-2">Puntuación General ESG</div>
                <div className="text-5xl font-bold text-gray-900">{report.overallScore}<span className="text-2xl text-gray-500">/100</span></div>
                <div className={`text-sm font-semibold mt-2 ${
                  report.overallScore >= 80 ? 'text-emerald-700' :
                  report.overallScore >= 60 ? 'text-blue-700' :
                  'text-yellow-700'
                }`}>
                  {report.overallScore >= 80 ? '🏆 Excelente' :
                   report.overallScore >= 60 ? '✓ Bueno' : '⚠ Mejorable'}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="bg-white rounded-lg px-4 py-3 min-w-[180px]">
                  <div className="text-xs text-gray-500 mb-1">Viabilidad del Proyecto</div>
                  <div className="text-2xl font-bold text-gray-900">{report.viability}%</div>
                </div>
                <div className={`rounded-lg px-4 py-3 ${
                  report.riskLevel === 'low' ? 'bg-emerald-100' :
                  report.riskLevel === 'medium' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <div className="text-xs text-gray-600 mb-1">Nivel de Riesgo</div>
                  <div className={`font-semibold flex items-center gap-2 ${
                    report.riskLevel === 'low' ? 'text-emerald-700' :
                    report.riskLevel === 'medium' ? 'text-yellow-700' : 'text-red-700'
                  }`}>
                    <Shield className="w-4 h-4" />
                    {report.riskLevel === 'low' ? 'Bajo' :
                     report.riskLevel === 'medium' ? 'Medio' : 'Alto'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ESG Scores */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-600">Ambiental</div>
                  <div className="text-2xl font-bold text-emerald-900">{report.esgScores.environmental}</div>
                </div>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-2">
                <div 
                  className="bg-emerald-600 h-2 rounded-full"
                  style={{ width: `${report.esgScores.environmental}%` }}
                />
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-600">Social</div>
                  <div className="text-2xl font-bold text-blue-900">{report.esgScores.social}</div>
                </div>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${report.esgScores.social}%` }}
                />
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-600">Gobernanza</div>
                  <div className="text-2xl font-bold text-purple-900">{report.esgScores.governance}</div>
                </div>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${report.esgScores.governance}%` }}
                />
              </div>
            </div>
          </div>

          {/* Strengths */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Fortalezas del Proyecto</h3>
            </div>
            <ul className="space-y-2">
              {report.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Áreas de Mejora</h3>
            </div>
            <ul className="space-y-2">
              {report.weaknesses.map((weakness, i) => (
                <li key={i} className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Recomendaciones Estratégicas</h3>
            </div>
            <ul className="space-y-3">
              {report.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3 bg-white rounded-lg p-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-blue-600">{i + 1}</span>
                  </div>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-600">
            Reporte generado el {new Date(project.analyzedAt ?? project.createdAt).toLocaleDateString('es-ES', {
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div className="flex items-center gap-3">
            <button className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-all font-medium flex items-center gap-2">
              <Download className="w-4 h-4" />
              Descargar PDF
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}