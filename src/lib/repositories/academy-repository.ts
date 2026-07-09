// Repository de Academia — secciones, examen y certificados
// Habla con /api/proxy/courses/* y /api/proxy/certificates

export type ResourceType = 'pdf' | 'link' | 'forum';

export interface SectionResource {
  id: string;
  type: ResourceType;
  title: string;
  url: string;
}

export interface CourseSectionRow {
  id: string;
  course_id: string;
  sort_order: number;
  title: string;
  description: string | null;
  video_url: string | null;
  completed: boolean;
  resources: SectionResource[];
}

export interface CourseContent {
  sections: CourseSectionRow[];
  progress: {
    completed_sections: number;
    total_sections: number;
    percentage: number;
  };
  exam: {
    questions_count: number;
    pass_threshold: number;
    unlocked: boolean;
    passed: boolean;
    last_attempt: { percentage: number; passed: boolean; created_at: string } | null;
    certificate: { code: string; percentage: number; issued_at: string } | null;
  };
}

export interface ExamQuestionRow {
  id: string;
  question: string;
  options: string[];
}

export interface ExamData {
  course_title: string;
  pass_threshold: number;
  questions: ExamQuestionRow[];
}

export interface ExamResult {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  pass_threshold: number;
  certificate: { code: string; percentage: number; issued_at: string } | null;
}

export interface CertificateRow {
  id: string;
  course_id: string;
  code: string;
  percentage: number;
  issued_at: string;
  course_title: string | null;
  instructor: string | null;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', ...init });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err?.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export class AcademyRepository {
  async getCourseContent(courseId: string): Promise<CourseContent> {
    return apiFetch<CourseContent>(`/api/proxy/courses/${courseId}/sections`);
  }

  async completeSection(sectionId: string): Promise<{ progress: number }> {
    return apiFetch<{ progress: number }>(`/api/proxy/courses/sections/${sectionId}/complete`, {
      method: 'POST',
    });
  }

  async getExam(courseId: string): Promise<ExamData> {
    return apiFetch<ExamData>(`/api/proxy/courses/${courseId}/exam`);
  }

  async submitExam(courseId: string, answers: Record<string, number>): Promise<ExamResult> {
    return apiFetch<ExamResult>(`/api/proxy/courses/${courseId}/exam/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
  }

  async getMyCertificates(): Promise<CertificateRow[]> {
    const data = await apiFetch<{ certificates: CertificateRow[] }>('/api/proxy/certificates');
    return Array.isArray(data.certificates) ? data.certificates : [];
  }
}
