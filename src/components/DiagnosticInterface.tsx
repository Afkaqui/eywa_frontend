"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Check, CheckCircle2, Loader2, RefreshCw, TrendingUp, Award, FileText } from 'lucide-react';
import { DiagnosticRepository } from '@/lib/repositories/diagnostic-repository';
import { getScoreLevel } from '@/lib/constants/scoring';
import type { DiagnosticQuestion } from '@/lib/types/database';

const logo = "/logo.png";

// Fallback questions for when DB is empty or unavailable
const fallbackQuestions = [
  {
    title: 'Estado de Certificación Orgánica',
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
    breakdown: { label: string; score: number; maxScore: number }[];
    completedAt: string;
  }) => void;
}

export function DiagnosticInterface({ onScoreComplete }: DiagnosticInterfaceProps) {
  const diagnosticRepo = useMemo(() => new DiagnosticRepository(), []);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [diagnosticQuestions, setDiagnosticQuestions] = useState<typeof fallbackQuestions>([]);

  const fetchQuestions = useCallback(async () => {
    let data: DiagnosticQuestion[] = [];
    try {
      data = await diagnosticRepo.getQuestions();
    } catch { /* fallback below */ }

    if (data && data.length > 0) {
      setDiagnosticQuestions(data.map((q: DiagnosticQuestion) => ({
        title: q.title,
        description: q.description,
        options: q.diagnostic_options
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(o => ({ label: o.label, value: o.value, score: o.score })),
        context: {
          title: q.context_title || q.title,
          description: q.context_description || '',
          impact: q.context_impact || '',
          image: q.context_image || '',
        },
      })));
    } else {
      setDiagnosticQuestions(fallbackQuestions);
    }
    setLoadingQuestions(false);
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

  const calculateScore = () => {
    let totalScore = 0;
    diagnosticQuestions.forEach((question, index) => {
      const answer = answers[index];
      const selectedOption = question.options.find(opt => opt.value === answer);
      if (selectedOption) {
        totalScore += selectedOption.score;
      }
    });
    return totalScore;
  };

  const getDiagnosticScoreLevel = (score: number) => {
    if (score >= 45) return { level: 'Excelente', color: 'emerald', description: 'Su empresa demuestra un compromiso solido con la sostenibilidad' };
    if (score >= 30) return { level: 'Bueno', color: 'green', description: 'Buen progreso en sostenibilidad con areas de mejora identificadas' };
    if (score >= 15) return { level: 'Moderado', color: 'yellow', description: 'Se requiere mayor inversion en iniciativas de sostenibilidad' };
    return { level: 'Inicial', color: 'orange', description: 'Oportunidad significativa para desarrollo de practicas sostenibles' };
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
        const totalScore = calculateScore();
        const maxScore = diagnosticQuestions.reduce((max, q) => max + Math.max(...q.options.map(o => o.score)), 0);
        const breakdown = diagnosticQuestions.map((q, i) => {
          const answer = answers[i];
          const selected = q.options.find(opt => opt.value === answer);
          return {
            label: q.title,
            score: selected?.score || 0,
            maxScore: Math.max(...q.options.map(o => o.score)),
          };
        });
        onScoreComplete({
          score: totalScore,
          maxScore,
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
    const totalScore = calculateScore();
    const maxScore = diagnosticQuestions.reduce((max, q) => max + Math.max(...q.options.map(o => o.score)), 0);
    const scorePercentage = (totalScore / maxScore) * 100;
    const scoreLevel = getDiagnosticScoreLevel(totalScore);

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
              <div className={`inline-block px-4 py-2 rounded-full bg-${scoreLevel.color}-100 text-${scoreLevel.color}-700 font-semibold mb-3`}>
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

            {/* Breakdown by Question */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {diagnosticQuestions.map((question, index) => {
                const answer = answers[index];
                const selectedOption = question.options.find(opt => opt.value === answer);
                return (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                      Pregunta {index + 1}
                    </div>
                    <div className="text-sm font-medium text-gray-900 mb-3">
                      {question.title}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-bold text-emerald-600">
                        {selectedOption?.score || 0}
                      </div>
                      <div className="text-sm text-gray-500">puntos</div>
                    </div>
                    <div className="mt-3 text-xs text-gray-600">
                      {selectedOption?.label}
                    </div>
                  </div>
                );
              })}
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
                className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg"
              >
                <FileText className="w-4 h-4" />
                Descargar Informe
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
                <h3 className="font-semibold text-gray-900 mb-2">Próximos Pasos</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Nuestro equipo revisará su diagnóstico y preparará un plan de acción personalizado para mejorar 
                  su puntaje de sostenibilidad. Recibirá un informe detallado en las próximas 48 horas.
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