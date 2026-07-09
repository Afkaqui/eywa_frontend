"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  AcademyRepository,
  type CourseContent,
  type ExamData,
  type ExamResult,
} from '@/lib/repositories/academy-repository';
import { CourseRepository } from '@/lib/repositories/course-repository';
import { generateCertificatePdf } from '@/lib/certificate-pdf';
import {
  ArrowLeft, CheckCircle, ChevronDown, ChevronUp, Clock, Award, Lock,
  PlayCircle, FileText, Link2, MessagesSquare, GraduationCap, Users,
  BookOpen, Download, AlertTriangle, RotateCcw, PartyPopper,
} from 'lucide-react';
import type { Course } from '@/lib/types/database';

// Convierte cualquier URL de YouTube (watch, youtu.be, shorts) a formato embed
function toYouTubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    let id = '';
    if (u.hostname.includes('youtu.be')) id = u.pathname.slice(1).split('/')[0];
    else if (u.pathname.startsWith('/embed/')) id = u.pathname.split('/')[2];
    else if (u.pathname.startsWith('/shorts/')) id = u.pathname.split('/')[2];
    else id = u.searchParams.get('v') ?? '';
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

const RESOURCE_CONFIG = {
  pdf:   { icon: FileText,       label: 'PDF',   color: 'text-red-600',    bg: 'bg-red-50 border-red-200' },
  link:  { icon: Link2,          label: 'Enlace', color: 'text-blue-600',  bg: 'bg-blue-50 border-blue-200' },
  forum: { icon: MessagesSquare, label: 'Foro',  color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
} as const;

interface CourseViewerProps {
  course: Course;
  onBack: () => void;
}

type ViewMode = 'content' | 'exam' | 'result';

export function CourseViewer({ course, onBack }: CourseViewerProps) {
  const { profile } = useAuth();
  const academyRepo = useMemo(() => new AcademyRepository(), []);
  const courseRepo  = useMemo(() => new CourseRepository(), []);

  const [content, setContent] = useState<CourseContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [marking, setMarking] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewMode>('content');
  const [exam, setExam] = useState<ExamData | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  const holderName = profile?.fullName || profile?.email || 'Participante EYWA';

  const loadContent = useCallback(async () => {
    try {
      setError(null);
      const data = await academyRepo.getCourseContent(course.id);
      setContent(data);
      // abre la primera sección incompleta por defecto
      const firstPending = data.sections.find(s => !s.completed);
      setExpanded(firstPending?.id ?? data.sections[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el contenido');
    } finally {
      setLoading(false);
    }
  }, [academyRepo, course.id]);

  useEffect(() => { loadContent(); }, [loadContent]);

  const handleMarkComplete = useCallback(async (sectionId: string) => {
    setMarking(sectionId);
    try {
      await academyRepo.completeSection(sectionId);
      // actualiza en memoria y avanza a la siguiente sección pendiente
      setContent(prev => {
        if (!prev) return prev;
        const sections = prev.sections.map(s => (s.id === sectionId ? { ...s, completed: true } : s));
        const done = sections.filter(s => s.completed).length;
        const total = sections.length;
        const next = sections.find(s => !s.completed);
        setExpanded(next?.id ?? null);
        return {
          ...prev,
          sections,
          progress: {
            completed_sections: done,
            total_sections: total,
            percentage: total > 0 ? Math.round((done / total) * 100) : 0,
          },
          exam: { ...prev.exam, unlocked: done === total && prev.exam.questions_count > 0 },
        };
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo marcar la sección');
    } finally {
      setMarking(null);
    }
  }, [academyRepo]);

  const handleStartExam = useCallback(async () => {
    try {
      setError(null);
      const data = await academyRepo.getExam(course.id);
      setExam(data);
      setAnswers({});
      setMode('exam');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo cargar el examen');
    }
  }, [academyRepo, course.id]);

  const handleSubmitExam = useCallback(async () => {
    if (!exam || submitting) return;
    setSubmitting(true);
    try {
      const res = await academyRepo.submitExam(course.id, answers);
      setResult(res);
      setMode('result');
      if (res.passed) await loadContent(); // refresca certificado/estado
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo enviar el examen');
    } finally {
      setSubmitting(false);
    }
  }, [academyRepo, course.id, exam, answers, submitting, loadContent]);

  const handleDownloadCert = useCallback(async (code: string, percentage: number, issuedAt: string) => {
    await generateCertificatePdf({
      holderName,
      courseTitle: course.title,
      instructor: course.instructor,
      percentage,
      code,
      issuedAt,
    });
  }, [holderName, course.title, course.instructor]);

  const handleEnroll = useCallback(async () => {
    setEnrolling(true);
    try {
      await courseRepo.enroll('', course.id);
    } catch { /* idempotente */ }
    setEnrolling(false);
  }, [courseRepo, course.id]);

  // ══ Vista: EXAMEN ══════════════════════════════════════════════════════════
  if (mode === 'exam' && exam) {
    const answered = Object.keys(answers).length;
    const totalQ = exam.questions.length;
    const allAnswered = answered === totalQ;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto p-4 md:p-8">
          <button onClick={() => setMode('content')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Volver al curso</span>
          </button>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Examen final</h1>
                <p className="text-sm text-gray-500">{exam.course_title}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-4">
              <span>{totalQ} preguntas</span>
              <span>·</span>
              <span>Mínimo para aprobar: <strong className="text-gray-900">{exam.pass_threshold}%</strong></span>
              <span className="ml-auto font-semibold text-emerald-600">{answered}/{totalQ} respondidas</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
              <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${totalQ ? (answered / totalQ) * 100 : 0}%` }} />
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {exam.questions.map((q, qi) => (
              <div key={q.id} className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    answers[q.id] !== undefined ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {qi + 1}
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-900">{q.question}</h3>
                </div>
                <div className="space-y-2 ml-10">
                  {q.options.map((opt, oi) => (
                    <label
                      key={oi}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        answers[q.id] === oi
                          ? 'bg-emerald-50 border-emerald-400'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={answers[q.id] === oi}
                        onChange={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                        className="accent-emerald-600"
                      />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmitExam}
            disabled={!allAnswered || submitting}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {submitting ? 'Calificando...' : allAnswered ? 'Enviar examen' : `Responde las ${totalQ - answered} preguntas restantes`}
          </button>
        </div>
      </div>
    );
  }

  // ══ Vista: RESULTADO ═══════════════════════════════════════════════════════
  if (mode === 'result' && result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className={`bg-white rounded-3xl border-2 p-8 text-center ${result.passed ? 'border-emerald-300' : 'border-amber-300'}`}>
            <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${result.passed ? 'bg-emerald-100' : 'bg-amber-100'}`}>
              {result.passed
                ? <PartyPopper className="w-10 h-10 text-emerald-600" />
                : <AlertTriangle className="w-10 h-10 text-amber-600" />}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {result.passed ? '¡Felicidades, aprobaste!' : 'No alcanzaste el mínimo'}
            </h2>
            <p className="text-gray-500 mb-6">
              Obtuviste <strong className={result.passed ? 'text-emerald-600' : 'text-amber-600'}>{result.percentage}%</strong>
              {' '}({result.score} de {result.total} correctas) · mínimo requerido: {result.pass_threshold}%
            </p>

            {result.passed && result.certificate ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
                <Award className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-emerald-900 mb-1">Certificado emitido</div>
                <div className="text-xs text-emerald-700 font-mono mb-4">{result.certificate.code}</div>
                <button
                  onClick={() => handleDownloadCert(result.certificate!.code, result.certificate!.percentage, result.certificate!.issued_at)}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Descargar certificado (PDF)
                </button>
              </div>
            ) : !result.passed && (
              <button
                onClick={handleStartExam}
                className="w-full py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-semibold flex items-center justify-center gap-2 mb-4"
              >
                <RotateCcw className="w-4 h-4" />
                Intentar de nuevo
              </button>
            )}

            <button
              onClick={() => { setMode('content'); setResult(null); }}
              className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Volver al curso
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══ Vista: CONTENIDO (secciones) ═══════════════════════════════════════════
  const progress = content?.progress;
  const examState = content?.exam;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Volver a cursos</span>
        </button>

        {/* Header del curso */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
          <p className="text-gray-600 mb-4">{course.description}</p>
          <div className="flex flex-wrap gap-5 text-sm text-gray-500">
            <span className="flex items-center gap-2"><Users className="w-4 h-4" />{course.instructor}</span>
            <span className="flex items-center gap-2"><Clock className="w-4 h-4" />{course.duration_hours}h de contenido</span>
            <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" />{progress?.total_sections ?? course.lessons_count} secciones</span>
          </div>

          {progress && progress.total_sections > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Progreso del contenido</span>
                <span className={`text-sm font-bold ${progress.percentage === 100 ? 'text-emerald-600' : 'text-blue-600'}`}>
                  {progress.completed_sections}/{progress.total_sections} · {progress.percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${progress.percentage === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Cargando contenido...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <p className="text-red-700 mb-3">{error}</p>
            <button onClick={() => { setLoading(true); loadContent(); }} className="text-emerald-600 font-medium">Reintentar</button>
          </div>
        ) : !content || content.sections.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Contenido en preparación</h3>
            <p className="text-sm text-gray-400 mb-6">El material de este curso estará disponible pronto.</p>
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold disabled:opacity-50"
            >
              {enrolling ? 'Inscribiendo...' : 'Inscribirme para recibir novedades'}
            </button>
          </div>
        ) : (
          <>
            {/* Secciones */}
            <div className="space-y-4 mb-6">
              {content.sections.map((section, i) => {
                const isOpen = expanded === section.id;
                const embed = section.video_url ? toYouTubeEmbed(section.video_url) : null;

                return (
                  <div key={section.id} className={`bg-white rounded-2xl border overflow-hidden transition-colors ${section.completed ? 'border-emerald-200' : 'border-gray-200'}`}>
                    {/* Cabecera de sección */}
                    <button
                      onClick={() => setExpanded(isOpen ? null : section.id)}
                      className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        section.completed ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {section.completed ? <CheckCircle className="w-5 h-5" /> : i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm md:text-base font-bold text-gray-900">{section.title}</h3>
                        {section.description && <p className="text-xs text-gray-500 truncate">{section.description}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {section.video_url && <PlayCircle className="w-4 h-4 text-red-500" />}
                        {section.resources.length > 0 && (
                          <span className="text-xs text-gray-400">{section.resources.length} recurso{section.resources.length > 1 ? 's' : ''}</span>
                        )}
                        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>
                    </button>

                    {/* Contenido expandido */}
                    {isOpen && (
                      <div className="border-t border-gray-100 p-5 space-y-5">
                        {section.description && (
                          <p className="text-sm text-gray-600 leading-relaxed">{section.description}</p>
                        )}

                        {embed && (
                          <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ paddingBottom: '56.25%' }}>
                            <iframe
                              src={embed}
                              title={section.title}
                              className="absolute inset-0 w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )}

                        {section.resources.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Material de la sección</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {section.resources.map(res => {
                                const cfg = RESOURCE_CONFIG[res.type] ?? RESOURCE_CONFIG.link;
                                const Icon = cfg.icon;
                                return (
                                  <a
                                    key={res.id}
                                    href={res.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-3 p-3 rounded-xl border ${cfg.bg} hover:shadow-sm transition-all`}
                                  >
                                    <Icon className={`w-5 h-5 flex-shrink-0 ${cfg.color}`} />
                                    <div className="min-w-0">
                                      <div className="text-sm font-medium text-gray-900 truncate">{res.title}</div>
                                      <div className={`text-xs ${cfg.color}`}>{cfg.label}</div>
                                    </div>
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {!section.completed ? (
                          <button
                            onClick={() => handleMarkComplete(section.id)}
                            disabled={marking === section.id}
                            className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {marking === section.id ? 'Guardando...' : 'Marcar sección como completada'}
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-2 py-2 text-emerald-600 text-sm font-semibold">
                            <CheckCircle className="w-4 h-4" /> Sección completada
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Examen final */}
            {examState && examState.questions_count > 0 && (
              <div className={`rounded-2xl border-2 p-6 md:p-8 ${
                examState.passed
                  ? 'bg-emerald-50 border-emerald-300'
                  : examState.unlocked
                  ? 'bg-white border-amber-300'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    examState.passed ? 'bg-emerald-500' : examState.unlocked ? 'bg-amber-100' : 'bg-gray-200'
                  }`}>
                    {examState.passed
                      ? <Award className="w-6 h-6 text-white" />
                      : examState.unlocked
                      ? <GraduationCap className="w-6 h-6 text-amber-600" />
                      : <Lock className="w-6 h-6 text-gray-400" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {examState.passed ? 'Curso aprobado' : 'Examen final'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {examState.passed
                        ? `Aprobaste con ${examState.certificate?.percentage}%. Tu certificado está listo.`
                        : examState.unlocked
                        ? `${examState.questions_count} preguntas · necesitas ${examState.pass_threshold}% para aprobar y obtener tu certificado.`
                        : `Completa todo el contenido del curso para desbloquear el examen (${examState.questions_count} preguntas, mínimo ${examState.pass_threshold}%).`}
                    </p>

                    {examState.last_attempt && !examState.passed && (
                      <p className="text-xs text-amber-700 mb-3">
                        Último intento: {examState.last_attempt.percentage}% — puedes volver a intentarlo.
                      </p>
                    )}

                    {examState.passed && examState.certificate ? (
                      <button
                        onClick={() => handleDownloadCert(examState.certificate!.code, examState.certificate!.percentage, examState.certificate!.issued_at)}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Descargar certificado (PDF)
                      </button>
                    ) : (
                      <button
                        onClick={handleStartExam}
                        disabled={!examState.unlocked}
                        className="px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {examState.unlocked ? <GraduationCap className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        {examState.unlocked ? 'Rendir examen' : 'Examen bloqueado'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
