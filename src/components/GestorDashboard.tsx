"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Database, Plus, Pencil, Trash2, X, Search, Loader2, BarChart3, FileText } from 'lucide-react';
import { PortfolioRepository } from '@/lib/repositories/portfolio-repository';
import { DiagnosticRepository } from '@/lib/repositories/diagnostic-repository';
import type { PortfolioCompany, DiagnosticQuestion, DiagnosticOption } from '@/lib/types/database';

type Tab = 'portfolio' | 'questions';

export function GestorDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('portfolio');

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-light text-gray-900">Gestión de Datos</h1>
              <p className="text-sm text-gray-500">Administra empresas del portfolio y preguntas diagnósticas</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'portfolio' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Empresas Portfolio
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'questions' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            Preguntas Diagnóstico
          </button>
        </div>

        {activeTab === 'portfolio' ? <PortfolioManager /> : <QuestionsManager />}
      </div>
    </div>
  );
}

/* ═══════════════════════ PORTFOLIO MANAGER ═══════════════════════ */

function PortfolioManager() {
  const portfolioRepo = useMemo(() => new PortfolioRepository(), []);
  const [companies, setCompanies] = useState<PortfolioCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PortfolioCompany | null>(null);
  const [form, setForm] = useState({
    name: '', sector: '', score: 0, status: 'Pendiente',
    carbon: '', trend: '', lastAudit: '', risk: 'medio' as 'bajo' | 'medio' | 'alto',
  });

  const fetchCompanies = useCallback(async () => {
    try {
      const data = await portfolioRepo.getAll();
      setCompanies(data);
    } catch { /* handle error */ }
    setLoading(false);
  }, [portfolioRepo]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', sector: '', score: 0, status: 'Pendiente', carbon: '', trend: '', lastAudit: '', risk: 'medio' });
    setShowModal(true);
  };

  const openEdit = (c: PortfolioCompany) => {
    setEditing(c);
    setForm({
      name: c.name, sector: c.sector ?? '', score: c.score ?? 0, status: c.status,
      carbon: c.carbon || '', trend: c.trend || '', lastAudit: c.lastAudit || '', risk: c.risk ?? 'medio',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await portfolioRepo.update(editing.id, form);
      } else {
        await portfolioRepo.create(form as Omit<PortfolioCompany, 'id' | 'createdAt' | 'updatedAt'>);
      }
    } catch { /* handle error */ }
    setShowModal(false);
    fetchCompanies();
  };

  const handleDelete = async (id: string) => {
    try {
      await portfolioRepo.delete(id);
    } catch { /* handle error */ }
    fetchCompanies();
  };

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.sector ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar empresa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            Agregar Empresa Externa
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Empresa</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Sector</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Score</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Riesgo</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 font-medium text-gray-900">
                        {c.name}
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${
                          c.source !== 'plataforma'
                            ? 'bg-gray-100 text-gray-500'
                            : c.incomplete
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {c.source !== 'plataforma' ? 'Externa' : c.incomplete ? 'Registro incompleto' : 'Verificada'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{c.sector || 'Pendiente'}</td>
                    <td className="py-3 px-4">
                      {c.score !== null && c.score !== undefined ? (
                        <span className={`font-semibold ${c.score >= 80 ? 'text-emerald-600' : c.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                          {c.score}
                        </span>
                      ) : (
                        <span className="text-amber-600 text-xs font-medium">Pendiente</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{c.status}</td>
                    <td className="py-3 px-4">
                      {c.risk ? (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          c.risk === 'bajo' ? 'bg-emerald-100 text-emerald-700' :
                          c.risk === 'medio' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {c.risk}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {c.source === 'plataforma' ? (
                        <span className="text-xs text-gray-400" title="Los datos de las empresas de la plataforma se gestionan desde su propio perfil y diagnóstico">
                          vía su perfil
                        </span>
                      ) : (
                        <>
                          <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors ml-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">No se encontraron empresas</div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editing ? 'Editar Empresa' : 'Nueva Empresa'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                  <input value={form.sector} onChange={e => setForm({...form, sector: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Score (0-100)</label>
                  <input type="number" min="0" max="100" value={form.score} onChange={e => setForm({...form, score: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option>Pendiente</option>
                    <option>Verificado</option>
                    <option>En Revision</option>
                    <option>Auditoria Pendiente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Riesgo</label>
                  <select value={form.risk} onChange={e => setForm({...form, risk: e.target.value as 'bajo' | 'medio' | 'alto'})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="bajo">Bajo</option>
                    <option value="medio">Medio</option>
                    <option value="alto">Alto</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carbono</label>
                  <input value={form.carbon} onChange={e => setForm({...form, carbon: e.target.value})} placeholder="1,204t"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tendencia</label>
                  <input value={form.trend} onChange={e => setForm({...form, trend: e.target.value})} placeholder="+5%"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Última Auditoría</label>
                  <input value={form.lastAudit} onChange={e => setForm({...form, lastAudit: e.target.value})} placeholder="Hace 2 dias"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                Cancelar
              </button>
              <button onClick={handleSave}
                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all">
                {editing ? 'Guardar Cambios' : 'Crear Empresa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════ QUESTIONS MANAGER ═══════════════════════ */

function QuestionsManager() {
  const diagnosticRepo = useMemo(() => new DiagnosticRepository(), []);
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DiagnosticQuestion | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', sort_order: 0,
    context_title: '', context_description: '', context_impact: '', context_image: '',
  });
  const [options, setOptions] = useState<{ label: string; value: string; score: number; sort_order: number }[]>([]);

  const fetchQuestions = useCallback(async () => {
    try {
      const data = await diagnosticRepo.getQuestions();
      setQuestions(data);
    } catch { /* handle error */ }
    setLoading(false);
  }, [diagnosticRepo]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', sort_order: questions.length + 1, context_title: '', context_description: '', context_impact: '', context_image: '' });
    setOptions([{ label: '', value: '', score: 0, sort_order: 1 }]);
    setShowModal(true);
  };

  const openEdit = (q: DiagnosticQuestion) => {
    setEditing(q);
    setForm({
      title: q.title, description: q.description, sort_order: q.sort_order,
      context_title: q.context_title || '', context_description: q.context_description || '',
      context_impact: q.context_impact || '', context_image: q.context_image || '',
    });
    setOptions(q.diagnostic_options.map(o => ({
      label: o.label, value: o.value, score: o.score, sort_order: o.sort_order,
    })));
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, options };
      if (editing) {
        await fetch(`/api/proxy/diagnostic/questions/${editing.id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/proxy/diagnostic/questions', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
    } catch { /* handle error */ }
    setShowModal(false);
    fetchQuestions();
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/proxy/diagnostic/questions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch { /* handle error */ }
    fetchQuestions();
  };

  const addOption = () => {
    setOptions([...options, { label: '', value: '', score: 0, sort_order: options.length + 1 }]);
  };

  const updateOption = (index: number, field: string, value: string | number) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: value };
    setOptions(updated);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Preguntas del Diagnóstico</h3>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            Nueva Pregunta
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded">#{q.sort_order}</span>
                      <h4 className="font-medium text-gray-900">{q.title}</h4>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{q.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {q.diagnostic_options
                        .sort((a: DiagnosticOption, b: DiagnosticOption) => a.sort_order - b.sort_order)
                        .map((opt: DiagnosticOption) => (
                        <span key={opt.id} className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                          {opt.label} <span className="text-emerald-600 font-medium">(+{opt.score}pts)</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <button onClick={() => openEdit(q)} className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(q.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {questions.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">No hay preguntas creadas</div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editing ? 'Editar Pregunta' : 'Nueva Pregunta'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>

              {/* Context fields */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Contexto (opcional)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Título del contexto</label>
                    <input value={form.context_title} onChange={e => setForm({...form, context_title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Impacto</label>
                    <input value={form.context_impact} onChange={e => setForm({...form, context_impact: e.target.value})} placeholder="+15 puntos"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Opciones de respuesta</h4>
                  <button onClick={addOption} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Agregar opción
                  </button>
                </div>
                <div className="space-y-3">
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input value={opt.label} onChange={e => updateOption(i, 'label', e.target.value)} placeholder="Etiqueta"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      <input value={opt.value} onChange={e => updateOption(i, 'value', e.target.value)} placeholder="valor"
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      <input type="number" value={opt.score} onChange={e => updateOption(i, 'score', parseInt(e.target.value) || 0)} placeholder="pts"
                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      <button onClick={() => removeOption(i)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                Cancelar
              </button>
              <button onClick={handleSave}
                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all">
                {editing ? 'Guardar Cambios' : 'Crear Pregunta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
