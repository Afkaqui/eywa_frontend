import type { Course, CourseEnrollment } from '@/lib/types/database';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', ...init });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err?.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

// El backend responde envuelto ({ courses }, { enrollments }, { enrollment });
// toleramos también arrays crudos por compatibilidad.
function unwrap<T>(data: unknown, key: string): T {
  if (Array.isArray(data)) return data as T;
  const obj = data as Record<string, unknown>;
  return (obj?.[key] ?? data) as T;
}

export class CourseRepository {
  async getPublished(): Promise<Course[]> {
    const data = await apiFetch<unknown>('/api/proxy/courses');
    const courses = unwrap<Course[]>(data, 'courses');
    return (Array.isArray(courses) ? courses : []).filter((c) => c.is_published);
  }

  async getAll(): Promise<Course[]> {
    const data = await apiFetch<unknown>('/api/proxy/courses');
    const courses = unwrap<Course[]>(data, 'courses');
    return Array.isArray(courses) ? courses : [];
  }

  // userId kept for API compatibility; backend resolves current user from JWT
  async getUserEnrollments(_userId?: string): Promise<CourseEnrollment[]> {
    const data = await apiFetch<unknown>('/api/proxy/courses/enrollments');
    const enrollments = unwrap<CourseEnrollment[]>(data, 'enrollments');
    return Array.isArray(enrollments) ? enrollments : [];
  }

  // userId kept for API compatibility; backend resolves from JWT
  async enroll(_userId: string, courseId: string): Promise<CourseEnrollment> {
    const data = await apiFetch<unknown>(`/api/proxy/courses/${courseId}/enroll`, {
      method: 'POST',
    });
    return unwrap<CourseEnrollment>(data, 'enrollment');
  }

  async updateProgress(enrollmentId: string, progress: number, completed: boolean): Promise<void> {
    await apiFetch<void>(`/api/proxy/courses/enrollments/${enrollmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        progress: Math.min(progress, 100),
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      }),
    });
  }
}
