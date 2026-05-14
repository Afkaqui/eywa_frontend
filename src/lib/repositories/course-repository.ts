import type { Course, CourseEnrollment } from '@/lib/types/database';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', ...init });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err?.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export class CourseRepository {
  async getPublished(): Promise<Course[]> {
    const courses = await apiFetch<Course[]>('/api/proxy/courses');
    return courses.filter((c) => c.is_published);
  }

  async getAll(): Promise<Course[]> {
    return apiFetch<Course[]>('/api/proxy/courses');
  }

  // userId kept for API compatibility; backend resolves current user from JWT
  async getUserEnrollments(_userId?: string): Promise<CourseEnrollment[]> {
    return apiFetch<CourseEnrollment[]>('/api/proxy/courses/enrollments');
  }

  // userId kept for API compatibility; backend resolves from JWT
  async enroll(_userId: string, courseId: string): Promise<CourseEnrollment> {
    return apiFetch<CourseEnrollment>(`/api/proxy/courses/${courseId}/enroll`, {
      method: 'POST',
    });
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
