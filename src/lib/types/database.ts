export type UserRole = 'superadmin' | 'admin' | 'gestor' | 'user';
export type UserPlan = 'free' | 'premium';

export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  company: string | null;
  role: UserRole;
  plan: UserPlan;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioCompany {
  id: string;
  name: string;
  sector: string;
  score: number;
  status: string;
  carbon: string | null;
  trend: string | null;
  lastAudit: string | null;
  risk: 'bajo' | 'medio' | 'alto';
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DiagnosticQuestion {
  id: string;
  sort_order: number;
  title: string;
  description: string;
  context_title: string | null;
  context_description: string | null;
  context_impact: string | null;
  context_image: string | null;
  diagnostic_options: DiagnosticOption[];
}

export interface DiagnosticOption {
  id: string;
  question_id: string;
  label: string;
  value: string;
  score: number;
  sort_order: number;
}

export interface DiagnosticResult {
  score: number;
  maxScore: number;
  breakdown: { label: string; score: number; maxScore: number }[];
  completedAt: string;
}

// ── Organization ──

export interface Organization {
  id: string;
  userId: string;
  type: string;
  name: string;
  description: string | null;
  phone: string | null;
  website: string | null;
  country: string | null;
  foundedYear: number | null;
  sector: string | null;
  employees: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Simbiocreacion ──

export interface Simbiocreacion {
  id: string;
  userId: string;
  nombre: string;
  privado: boolean;
  lugar: string | null;
  fecha: string | null;
  horaInicio: string | null;
  descripcion: string | null;
  link: string | null;
  tags: string[];
  extraUrls: string[];
  ods: number[];
  createdAt: string;
  updatedAt: string;
}

// ── Edutech ──

export type CourseLevel = 'basico' | 'intermedio' | 'avanzado';
export type CourseCategory = 'agrotech' | 'edutech' | 'banca_sostenible' | 'esg' | 'general';

export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  duration_hours: number;
  image_url: string | null;
  instructor: string;
  lessons_count: number;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  completed: boolean;
  enrolled_at: string;
  completed_at: string | null;
}
