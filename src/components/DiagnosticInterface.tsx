"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Check, CheckCircle2, Loader2, RefreshCw, TrendingUp, Award, FileText, Building2, AlertTriangle } from 'lucide-react';
import { DiagnosticRepository } from '@/lib/repositories/diagnostic-repository';
import { GENES_SCALE, GENES_MAX_POINTS, GENES_CATEGORIES, getGenesBand, getGenesBandClasses } from '@/lib/constants/scoring';
import { generateDiagnosticReportPdf } from '@/lib/diagnostic-pdf';
import { useAuth } from '@/contexts/AuthContext';
import {
  OrganizationRepository, setOrgActivaId, resolverOrgActiva,
  type OrgListado,
} from '@/lib/repositories/organization-repository';
import type { DiagnosticQuestion } from '@/lib/types/database';

const logo = "/logo.png";

// Fallback questions for when DB is empty or unavailable
const fallbackQuestions = [
  {
    title: 'Estado de Certificación Orgánica',
    category: 'general',
    weight: 0,
    description: 'Seleccione el estado actual de certificación orgánica de su empresa.',
    options: [
      { label: 'Certificación Orgánica', value: 'yes', score: 15 },
      { label: 'Sin Certificación', value: 'no', score: 0 },
      { label: 'En Progreso', value: 'progress', score: 10 },
      { label: 'Aplicación Reciente', value: 'applied', score: 8 },
    ],
    context: { title: 'Certificación Orgánica', description: 'La certificación orgánica valida prácticas agrícolas sostenibles.', impact: '+15 puntos', image: '' }
  },
  {
    title: 'Gestión de Emisiones de Carbono',
    category: 'general',
    weight: 0,
    description: 'Indique el nivel de implementación de sistemas de medición y reducción de emisiones.',
    options: [
      { label: 'Sistema Completo Implementado', value: 'complete', score: 20 },
      { label: 'Sistema Parcial', value: 'partial', score: 12 },
      { label: 'En Fase de Planificación', value: 'planning', score: 6 },
      { label: 'Sin Sistema Actual', value: 'none', score: 0 },
    ],
    context: { title: 'Emisiones de Carbono', description: 'La medición precisa de emisiones es fundamental para operaciones carbono-neutral.', impact: '+20 puntos', image: '' }
  },
  {
    title: 'Prácticas de Gobernanza Social',
    category: 'general',
    weight: 0,
    description: 'Evalúe las prácticas de gobernanza y responsabilidad social de su organización.',
    options: [
      { label: 'Gobernanza Completa', value: 'complete', score: 15 },
      { label: 'Parcialmente Implementada', value: 'partial', score: 10 },
      { label: 'En Desarrollo', value: 'developing', score: 5 },
      { label: 'Sin Prácticas Formales', value: 'none', score: 0 },
    ],
    context: { title: 'Gobernanza Social', description: 'Las prácticas de gobernanza social son indicadores clave de sostenibilidad.', impact: '+15 puntos', image: '' }
  },
];

interface DiagnosticInterfaceProps {
  onScoreComplete?: (result: {
    score: number;
    maxScore: number;
    breakdown: { label: string; score: number; maxScore: number; category?: string }[];
    completedAt: string;
  }) => void;
}

export function DiagnosticInterface({ onScoreComplete }: DiagnosticInterfaceProps) {
  const diagnosticRepo = useMemo(() => new DiagnosticRepository(), []);
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [diagnosticQuestions, setDiagnosticQuestions] = useState<typeof fallbackQuestions>([]);
  // Sin organización no hay a quién atribuir el diagnóstico (ver barra abajo).
  const [sinOrganizacion, setSinOrganizacion] = useState(false);

  const fetchQuestions = useCallback(async () => {
    try {
      const data = await diagnosticRepo.getQuestions();

      if (data && data.length > 0) {
        setDiagnosticQuestions(data.map((q: DiagnosticQuestion) => {
          // Backend (Prisma) returns camelCase `options`; legacy shape uses `diagnostic_options`
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const opts: DiagnosticQuestion['diagnostic_options'] = (q as any).options ?? q.diagnostic_options ?? [];
          return {
            title: q.title,
            description: q.description,
            category: q.category ?? 'general',
            weight: q.weight ?? 0,
            options: [...opts]
              .sort((a, b) => (a.sort_order ?? (a as any).sortOrder ?? 0) - (b.sort_order ?? (b as any).sortOrder ?? 0))
              .map(o => ({ label: o.label, value: o.value, score: o.score })),
            context: {
              title: (q as any).contextTitle ?? q.context_title ?? q.title,
              description: (q as any).contextDescription ?? q.context_description ?? '',
              impact: (q as any).contextImpact ?? q.context_impact ?? '',
              image: (q as any).contextImage ?? q.context_image ?? '',
            },
          };
        }));
      } else {
        setDiagnosticQuestions(fallbackQuestions);
      }
    } catch {
      // Network error or parse failure → use built-in questions
      setDiagnosticQuestions(fallbackQuestions);
    } finally {
      setLoadingQuestions(false);
    }
  }, [diagnosticRepo]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const totalSteps = diagnosticQuestions.length;

  const progress = totalSteps > 0 ? ((currentQuestion + 1) / totalSteps) * 100 : 0;

  if (loadingQuestions || totalSteps === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  const currentQ = diagnosticQuestions[currentQuestion];
  const selectedAnswer = answers[currentQuestion];
  const isCompleted = currentQuestion === totalSteps;

  // Puntaje PONDERADO (metodología GENES): cada criterio se puntúa 0-5 y aporta
  // (puntos × peso); los pesos suman 1.0, así que el ponderado va de 0 a 5 y se
  // lleva a la escala 0-75 de las bandas. Si no hay pesos (fallback), usa el máximo.
  const calculateScore = () => {
    const totalWeight = diagnosticQuestions.reduce((s, q) => s + (q.weight ?? 0), 0);
    if (totalWeight > 0) {
      const weighted = diagnosticQuestions.reduce((s, q, i) => {
        const sel = q.options.find(o => o.value === answers[i]);
        return s + (sel?.score ?? 0) * (q.weight ?? 0);
      }, 0) / totalWeight; // 0..5
      return Math.round(weighted * (GENES_SCALE / GENES_MAX_POINTS)); // 0..75
    }
    // Fallback (sin pesos): normaliza por el máximo a la escala 0-75.
    let sum = 0, max = 0;
    diagnosticQuestions.forEach((q, i) => {
      const sel = q.options.find(o => o.value === answers[i]);
      sum += sel?.score ?? 0;
      max += Math.max(...q.options.map(o => o.score), 0);
    });
    return max > 0 ? Math.round((sum / max) * GENES_SCALE) : 0;
  };

  // Categorías GENES sobre la escala 0-75. La etiqueta y el color salen de la
  // fuente única (lib/constants/scoring); aquí solo se añade la descripción.
  const getDiagnosticScoreLevel = (score: number) => {
    const level = getGenesBand(score);
    const badge = getGenesBandClasses(score);
    const description =
      score >= 61 ? 'Nivel Fénix: su empresa lidera en los criterios de sostenibilidad evaluados'
      : score >= 46 ? 'Nivel Oro: cumplimiento alto, con margen de mejora en criterios puntuales'
      : score >= 31 ? 'Nivel Plata: cumplimiento intermedio; hay áreas claras de mejora identificadas'
      : score >= 16 ? 'Nivel Verde: primeros avances; se requiere mayor inversión en sostenibilidad'
      : 'Nivel Marrón: punto de partida, con oportunidad significativa de desarrollo';
    return { level, badge, description };
  };

  const handleNext = () => {
    if (selectedAnswer && currentQuestion < totalSteps - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (selectedAnswer && currentQuestion === totalSteps - 1) {
      setCurrentQuestion(totalSteps); // Completion screen
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSelectAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleProcessResults = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowResults(true);

      // Send result to parent
      if (onScoreComplete) {
        const totalScore = calculateScore(); // ya en escala GENES (0-75)
        const breakdown = diagnosticQuestions.map((q, i) => {
          const selected = q.options.find(opt => opt.value === answers[i]);
          return {
            label: q.title,
            score: selected?.score ?? 0,
            maxScore: GENES_MAX_POINTS,
            category: q.category ?? 'general',
          };
        });
        onScoreComplete({
          score: totalScore,
          maxScore: GENES_SCALE,
          breakdown,
          completedAt: new Date().toISOString(),
        });
      }
    }, 3000);
  };

  const handleRectify = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setIsProcessing(false);
  };

  // Processing Screen
  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <Loader2 className="w-24 h-24 text-emerald-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-light text-white mb-4">
            Procesando Diagnóstico
          </h1>
          <p className="text-lg text-emerald-200 mb-8">
            Analizando sus respuestas y calculando el puntaje de sostenibilidad...
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-emerald-100 text-sm">Validando datos</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-emerald-100 text-sm">Calculando puntajes</span>
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-100/50 text-sm">Generando informe</span>
              <div className="w-5 h-5 border-2 border-emerald-400/30 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results Screen
  if (showResults) {
    const totalScore = calculateScore(); // escala GENES (0-75)
    const maxScore = GENES_SCALE;
    const scorePercentage = (totalScore / maxScore) * 100;
    const scoreLevel = getDiagnosticScoreLevel(totalScore);

    // Desglose por categoría GENES (promedio 0-5 de los criterios respondidos)
    const CATEGORY_ORDER = ['perfil', 'ambiental', 'social', 'economico', 'general'];
    const CATEGORY_BAR: Record<string, string> = {
      perfil: 'bg-indigo-500', ambiental: 'bg-emerald-500', social: 'bg-amber-500',
      economico: 'bg-sky-500', general: 'bg-gray-400',
    };
    const categories = CATEGORY_ORDER.map((key) => {
      const qs = diagnosticQuestions
        .map((q, i) => ({ q, i }))
        .filter(({ q }) => (q.category ?? 'general') === key);
      if (!qs.length) return null;
      const sum = qs.reduce((s, { q, i }) => s + (q.options.find(o => o.value === answers[i])?.score ?? 0), 0);
      return { key, label: GENES_CATEGORIES[key] ?? key, avg: sum / qs.length, questions: qs };
    }).filter((c): c is NonNullable<typeof c> => c !== null);

    const handleDownloadReport = () => {
      generateDiagnosticReportPdf({
        companyName: user?.company ?? null,
        holderName:  user?.name ?? null,
        score:       totalScore,
        completedAt: new Date().toISOString(),
        categories:  categories.map(c => ({ label: c.label, avg: c.avg })),
        criteria: categories.flatMap(c => c.questions.map(({ q, i }) => {
          const sel = q.options.find(o => o.value === answers[i]);
          return { category: c.label, title: q.title, points: sel?.score ?? 0, answer: sel?.label ?? 'Sin respuesta' };
        })),
      }).catch(() => alert('No se pudo generar el informe'));
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">Diagnóstico Completado</div>
                <h1 className="text-3xl font-light text-gray-900">Resultados de Sostenibilidad</h1>
              </div>
              <img src={logo} alt="EYWA" className="h-10" />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-8 py-12">
          {/* Main Score Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 mb-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 mb-6 relative">
                <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-emerald-600">{totalScore}</div>
                    <div className="text-xs text-gray-500">de {maxScore}</div>
                  </div>
                </div>
              </div>
              <div className={`inline-block px-4 py-2 rounded-full font-semibold mb-3 ${scoreLevel.badge}`}>
                {scoreLevel.level}
              </div>
              <h2 className="text-2xl font-light text-gray-900 mb-2">
                Puntaje de Sostenibilidad
              </h2>
              <p className="text-gray-600">
                {scoreLevel.description}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700 transition-all duration-1000 ease-out"
                  style={{ width: `${scorePercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>0</span>
                <span>{scorePercentage.toFixed(0)}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Desglose por categoría GENES */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Desglose por categoría</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                {categories.map((c) => (
                  <div key={c.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-600">{c.label}</span>
                      <span className="text-sm font-semibold text-gray-800">{c.avg.toFixed(1)} / 5</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${CATEGORY_BAR[c.key] ?? 'bg-emerald-500'}`}
                        style={{ width: `${(c.avg / GENES_MAX_POINTS) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Criterios agrupados por categoría */}
            <div className="space-y-8 mb-8">
              {categories.map((c) => (
                <div key={c.key}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${CATEGORY_BAR[c.key] ?? 'bg-emerald-500'}`} />
                    <h4 className="text-sm font-semibold text-gray-800">{c.label}</h4>
                    <span className="text-xs text-gray-400">{c.questions.length} criterio{c.questions.length === 1 ? '' : 's'}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {c.questions.map(({ q, i }) => {
                      const selectedOption = q.options.find(opt => opt.value === answers[i]);
                      const pts = selectedOption?.score ?? 0;
                      return (
                        <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                          <div className="text-sm font-medium text-gray-900 mb-2">{q.title}</div>
                          <div className="flex items-baseline gap-2">
                            <div className={`text-2xl font-bold ${pts >= 4 ? 'text-emerald-600' : pts >= 2 ? 'text-amber-600' : 'text-rose-600'}`}>
                              {pts}
                            </div>
                            <div className="text-xs text-gray-500">de {GENES_MAX_POINTS} puntos</div>
                          </div>
                          <div className="mt-2 text-xs text-gray-600">{selectedOption?.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRectify}
                className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Rectificar Respuestas
              </button>
              <button
                onClick={handleDownloadReport}
                className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg"
              >
                <FileText className="w-4 h-4" />
                Descargar Informe (PDF)
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">¿Qué pasa con tu resultado?</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Tu resultado ya actualizó automáticamente tu <strong>Índice ESG</strong> (Mi Organización),
                  tu ficha en el <strong>portfolio</strong> ante inversionistas y el ítem &quot;Reporte de
                  sostenibilidad&quot; de tu <strong>Dataroom</strong>. Puedes rehacer la evaluación cuando
                  mejores tus prácticas: la nueva reemplaza a la anterior.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Completion Screen
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 p-12 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-4xl font-light text-gray-900 mb-4">
              Diagnóstico Completado
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Gracias por completar el cuestionario de diagnóstico de sostenibilidad. Sus respuestas serán procesadas para generar un informe detallado.
            </p>
            <div className="bg-emerald-50 rounded-xl p-6 mb-8">
              <div className="text-sm text-gray-600 mb-2">Preguntas Respondidas</div>
              <div className="text-3xl font-semibold text-emerald-600">
                {totalSteps} / {totalSteps}
              </div>
            </div>
            <button
              onClick={handleProcessResults}
              className="px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all shadow-md"
            >
              Ver Resultados
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-gray-100 z-50">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700 transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="flex min-h-screen">
        {/* Left Side: Form */}
        <div className="flex-1 p-16 flex flex-col">
          {/* A QUÉ EMPRESA se está evaluando. GENES evalúa criterios de empresa
              (RUC, CEO mujer, insumos sostenibles), así que sin decir cuál el
              resultado no significa nada — y con varias empresas era ambiguo. */}
          <DiagnosticoOrgBar
            onSinOrganizacion={setSinOrganizacion}
            onChange={() => {
              // Las respuestas son de la empresa anterior: se descartan. Antes esto
              // recargaba la pagina, lo que ademas devolvia al Panel Principal y
              // obligaba a volver a entrar a Diagnostico.
              setAnswers({});
              setCurrentQuestion(0);
              setShowResults(false);
            }}
          />

          {/* Sin empresa el cuestionario ni se ofrece: dejarlo visible permitia
              completarlo entero y guardar un diagnostico sin dueno. */}
          {sinOrganizacion ? null : (
          <>
          {/* Header */}
          <div className="mb-12">
            <div className="text-sm text-gray-500 mb-2 uppercase tracking-wider">
              Pregunta {currentQuestion + 1} de {totalSteps}
            </div>
            <h1 className="text-5xl font-light text-gray-900 mb-4 leading-tight">
              {currentQ.title}
            </h1>
            <p className="text-lg text-gray-500 font-light">
              {currentQ.description}
            </p>
          </div>

          {/* Question Options - Elegant List */}
          <div className="flex-1 space-y-3 max-w-2xl">
            {currentQ.options.map((option, index) => {
              const isSelected = selectedAnswer === option.value;
              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(option.value)}
                  className={`w-full px-6 py-5 border rounded-lg transition-all text-left flex items-center justify-between group ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'border-emerald-600 bg-emerald-600' 
                        : 'border-gray-300 group-hover:border-gray-400'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`font-medium ${
                      isSelected ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {option.label}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="text-xs text-emerald-600 font-medium uppercase tracking-wider">
                      Seleccionado
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
            <button 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                currentQuestion === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pregunta Anterior
            </button>
            <button
              onClick={handleNext}
              disabled={!selectedAnswer}
              className={`px-8 py-3 rounded-lg font-medium text-sm transition-all ${
                selectedAnswer
                  ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-md'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {currentQuestion === totalSteps - 1 ? 'Finalizar Diagnóstico' : 'Continuar a Siguiente Pregunta'}
            </button>
          </div>
          </>
          )}
        </div>

        {/* Right Side: Context Image */}
        <div className="w-[40%] relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-500"
            style={{
              backgroundImage: `url('${currentQ.context.image}')`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-emerald-900/20 to-emerald-900/40"></div>
          </div>

          {/* Overlay Info Card */}
          <div className="absolute bottom-8 left-8 right-8">
            <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-xl p-6 shadow-2xl">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Contexto</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{currentQ.context.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {currentQ.context.description}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Impacto en Score</span>
                  <span className="font-semibold text-emerald-600">{currentQ.context.impact}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ EMPRESA EVALUADA ═══════════════════ */
// El diagnóstico GENES es POR EMPRESA (§13). Esta barra dice cuál se está
// evaluando y permite cambiarla ANTES de empezar; cambiarla a mitad reiniciaría
// las respuestas, así que solo se ofrece el cambio desde aquí y recarga la vista.

function DiagnosticoOrgBar(
  { onChange, onSinOrganizacion }:
  { onChange: (orgId: string) => void; onSinOrganizacion: (sin: boolean) => void },
) {
  const repo = useMemo(() => new OrganizationRepository(), []);
  const [lista, setLista] = useState<OrgListado | null>(null);
  const [activa, setActiva] = useState<string | null>(null);

  useEffect(() => {
    repo.getAll()
      .then(l => {
        setLista(l);
        setActiva(resolverOrgActiva(l));
        onSinOrganizacion(l.organizations.length === 0);
      })
      .catch(() => setLista(null));
  }, [repo, onSinOrganizacion]);

  if (!lista) return null;

  // Sin organización no se puede diagnosticar: GENES evalúa a una empresa.
  if (lista.organizations.length === 0) {
    return (
      <div className="mb-8 flex gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900 leading-relaxed">
          <strong>Primero registra tu organización.</strong> El diagnóstico GENES evalúa
          a una empresa —su formalización, su equipo, sus insumos—, así que necesita
          saber a cuál se refiere. Ve a <em>Mi Organización</em> y vuelve.
        </div>
      </div>
    );
  }

  const actual = lista.organizations.find(o => o.id === activa) ?? lista.organizations[0];
  const nombre = actual.trade_name?.trim() || actual.name;

  return (
    <div className="mb-8 flex items-center gap-3 flex-wrap bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5">
      <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
      <div className="text-sm text-gray-600">
        Evaluando a <strong className="text-gray-900">{nombre}</strong>
        {actual.ruc && <span className="text-gray-400"> · {actual.ruc}</span>}
      </div>

      {lista.organizations.length > 1 && (
        <select
          value={actual.id}
          onChange={(e) => {
            // setActiva tambien: sin esto la barra seguia mostrando la empresa
            // anterior mientras el resto ya trabajaba con la nueva.
            setActiva(e.target.value);
            setOrgActivaId(e.target.value);
            onChange(e.target.value);
          }}
          className="ml-auto text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white
                     focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
        >
          {lista.organizations.map(o => (
            <option key={o.id} value={o.id}>{o.trade_name?.trim() || o.name}</option>
          ))}
        </select>
      )}
    </div>
  );
}
