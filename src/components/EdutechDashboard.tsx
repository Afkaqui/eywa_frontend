"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CourseRepository } from '@/lib/repositories/course-repository';
import { CourseService } from '@/lib/services/course-service';
import { AcademyRepository, type CertificateRow } from '@/lib/repositories/academy-repository';
import { CourseViewer } from './CourseViewer';
import { generateCertificatePdf } from '@/lib/certificate-pdf';
import {
  BookOpen,
  Clock,
  Award,
  Play,
  CheckCircle,
  Search,
  Filter,
  ChevronRight,
  GraduationCap,
  Leaf,
  TrendingUp,
  Globe,
  BarChart3,
  Download,
} from 'lucide-react';
import type { Course, CourseEnrollment, CourseCategory, CourseLevel } from '@/lib/types/database';

const CATEGORY_CONFIG: Record<CourseCategory, { label: string; icon: typeof Leaf; color: string; bg: string }> = {
  agrotech: { label: 'Agrotech', icon: Leaf, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  edutech: { label: 'Edutech', icon: GraduationCap, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  banca_sostenible: { label: 'Banca Sostenible', icon: TrendingUp, color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  esg: { label: 'ESG', icon: Globe, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  general: { label: 'General', icon: BookOpen, color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' },
};

const LEVEL_CONFIG: Record<CourseLevel, { label: string; color: string }> = {
  basico: { label: 'Basico', color: 'bg-green-100 text-green-700' },
  intermedio: { label: 'Intermedio', color: 'bg-yellow-100 text-yellow-700' },
  avanzado: { label: 'Avanzado', color: 'bg-red-100 text-red-700' },
};

export function EdutechDashboard() {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | 'all'>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [refreshTick, setRefreshTick] = useState(0); // fuerza recarga al volver del visor

  const courseService = useMemo(
    () => new CourseService(new CourseRepository()),
    []
  );
  const academyRepo = useMemo(() => new AcademyRepository(), []);
  const profileName = profile?.fullName || profile?.email || 'Participante EYWA';

  // Load courses, enrollments and certificates via service
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [coursesData, enrollData, certsData] = await Promise.all([
          courseService.getPublishedCourses(),
          courseService.getUserEnrollments(user.id),
          academyRepo.getMyCertificates().catch(() => [] as CertificateRow[]),
        ]);
        if (!cancelled) {
          setCourses(coursesData);
          setEnrollments(enrollData);
          setCertificates(certsData);
        }
      } catch {
        // tables may not exist yet
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();

    return () => { cancelled = true; };
  }, [user, courseService, academyRepo, refreshTick]);

  const getEnrollment = (courseId: string) => enrollments.find(e => e.course_id === courseId);

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchesSearch = !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchQuery, selectedCategory]);

  // Stats via service
  const stats = useMemo(
    () => CourseService.calculateStats(courses, enrollments),
    [courses, enrollments]
  );

  // ── Course Detail View (visor real: secciones + examen + certificado) ──
  if (selectedCourse) {
    return (
      <CourseViewer
        course={selectedCourse}
        onBack={() => {
          setSelectedCourse(null);
          setRefreshTick(t => t + 1); // recarga inscripciones y certificados
        }}
      />
    );
  }

  // ── Main Course List View ──
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Academia EYWA</h1>
              <p className="text-sm text-gray-500">Capacitacion para emprendedores sostenibles</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalCourses}</div>
                <div className="text-xs text-gray-500">Cursos disponibles</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.enrolled}</div>
                <div className="text-xs text-gray-500">Inscritos</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.avgProgress}%</div>
                <div className="text-xs text-gray-500">Progreso promedio</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
                <div className="text-xs text-gray-500">Completados</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cursos, instructores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === 'all' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Todos
              </button>
              {(Object.keys(CATEGORY_CONFIG) as CourseCategory[]).map(cat => {
                const config = CATEGORY_CONFIG[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === cat ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* My Courses in Progress */}
        {enrollments.filter(e => !e.completed).length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-blue-600" />
              Mis cursos en progreso
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrollments.filter(e => !e.completed).map(enrollment => {
                const course = courses.find(c => c.id === enrollment.course_id);
                if (!course) return null;
                const catConfig = CATEGORY_CONFIG[course.category];
                const CatIcon = catConfig.icon;

                return (
                  <button
                    key={enrollment.id}
                    onClick={() => setSelectedCourse(course)}
                    className="bg-white rounded-xl border border-blue-200 p-4 text-left hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg ${catConfig.bg} border flex items-center justify-center flex-shrink-0`}>
                        <CatIcon className={`w-5 h-5 ${catConfig.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-xs text-gray-500">{course.instructor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-blue-600">{enrollment.progress}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Mis Certificados */}
        {certificates.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              Mis certificados
              <span className="text-sm font-normal text-gray-400">({certificates.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.map(cert => (
                <div key={cert.id} className="bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-200 p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{cert.course_title ?? 'Curso EYWA'}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {cert.percentage}% · {new Date(cert.issued_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-[11px] font-mono text-emerald-700 mt-1">{cert.code}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => generateCertificatePdf({
                      holderName: profileName,
                      courseTitle: cert.course_title ?? 'Curso EYWA',
                      instructor: cert.instructor,
                      percentage: cert.percentage,
                      code: cert.code,
                      issuedAt: cert.issued_at,
                    })}
                    className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Course Catalog */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gray-600" />
            {selectedCategory === 'all' ? 'Todos los cursos' : `Cursos de ${CATEGORY_CONFIG[selectedCategory].label}`}
            <span className="text-sm font-normal text-gray-400">({filteredCourses.length})</span>
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                  <div className="h-32 bg-gray-100 rounded-xl mb-4" />
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {courses.length === 0 ? 'No hay cursos disponibles' : 'Sin resultados'}
              </h3>
              <p className="text-sm text-gray-400">
                {courses.length === 0
                  ? 'Los cursos seran publicados proximamente.'
                  : 'Intenta cambiar los filtros de busqueda.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map(course => {
                const catConfig = CATEGORY_CONFIG[course.category];
                const levelConfig = LEVEL_CONFIG[course.level];
                const CatIcon = catConfig.icon;
                const enrollment = getEnrollment(course.id);

                return (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course)}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden text-left hover:shadow-lg hover:border-gray-300 transition-all group"
                  >
                    {/* Card Header */}
                    <div className={`h-32 ${catConfig.bg} border-b flex items-center justify-center relative overflow-hidden`}>
                      {course.image_url ? (
                        <img src={course.image_url} alt={course.title} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <CatIcon className={`w-12 h-12 ${catConfig.color} opacity-20`} />
                      )}
                      {enrollment?.completed && (
                        <div className="absolute top-3 right-3 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                      {enrollment && !enrollment.completed && (
                        <div className="absolute top-3 right-3 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                          {enrollment.progress}%
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${levelConfig.color}`}>
                          {levelConfig.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${catConfig.bg} ${catConfig.color}`}>
                          {catConfig.label}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-4 line-clamp-2">{course.description}</p>

                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {course.duration_hours}h
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {course.lessons_count} lecciones
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
