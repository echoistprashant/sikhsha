import { request } from './httpClient';

export interface AnalyticsSummary {
  totalUsers: number;
  activeUsers: number;
  totalDecks: number;
  totalActivities: number;
  totalDoubts: number;
  aiCostTotal: number;
  aiCostThisMonth: number;
}

export interface UsageMetric {
  feature: string;
  usage: number | string;
  users: number | string;
}

export interface PopularTopic {
  topic: string;
  subject: string;
  count: number | string;
}

export interface AICostRow {
  feature: string;
  model: string;
  total_tokens: number | string;
  total_cost: number | string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'student' | 'admin';
  school_id?: string | null;
  status?: string;
  last_active?: string | null;
  created_at?: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string | null;
  date: string;
  status: 'present' | 'absent' | 'late';
  method: string;
  latitude?: number | null;
  longitude?: number | null;
  marked_by?: string | null;
  created_at?: string;
  student_name?: string;
  student_email?: string;
}

export interface AttendanceStats {
  records: AttendanceRecord[];
  statistics: {
    total: number;
    present: number;
    absent: number;
    late: number;
    attendanceRate: number | string;
  };
}

export interface School {
  id: string;
  name: string;
  address?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  created_at?: string;
}

export async function getAnalyticsSummary(token: string): Promise<AnalyticsSummary> {
  return request<AnalyticsSummary>('/admin/analytics/summary', { token });
}

export async function getUsageMetrics(token: string): Promise<UsageMetric[]> {
  return request<UsageMetric[]>('/admin/analytics/usage', { token });
}

export async function getPopularTopics(token: string): Promise<PopularTopic[]> {
  return request<PopularTopic[]>('/admin/analytics/popular-topics', { token });
}

export async function getAICosts(
  token: string,
  params?: { startDate?: string; endDate?: string },
): Promise<AICostRow[]> {
  const search = new URLSearchParams();
  if (params?.startDate && params.endDate) {
    search.append('startDate', params.startDate);
    search.append('endDate', params.endDate);
  }
  const query = search.toString() ? `?${search.toString()}` : '';

  return request<AICostRow[]>(`/admin/analytics/ai-costs${query}`, { token });
}

export async function getUsers(
  token: string,
  filters?: { role?: 'teacher' | 'student' | 'admin'; status?: string },
): Promise<AdminUser[]> {
  const search = new URLSearchParams();
  if (filters?.role) search.append('role', filters.role);
  if (filters?.status) search.append('status', filters.status);
  const query = search.toString() ? `?${search.toString()}` : '';

  const response = await request<{ users: AdminUser[]; totalCount: number; page: number; limit: number }>(`/admin/users${query}`, { token });
  return response.users;
}

export async function getUserById(token: string, id: string): Promise<AdminUser> {
  return request<AdminUser>(`/admin/users/${id}`, { token });
}

export async function createUser(
  token: string,
  payload: { email: string; name: string; role: 'teacher' | 'student' | 'admin'; schoolId?: string },
): Promise<{ user: AdminUser; tempPassword: string }> {
  return request<{ user: AdminUser; tempPassword: string }>('/admin/users', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function updateUser(
  token: string,
  id: string,
  payload: Partial<{ name: string; role: 'teacher' | 'student' | 'admin'; status: string; schoolId: string }>,
): Promise<AdminUser> {
  return request<AdminUser>(`/admin/users/${id}`, {
    method: 'PUT',
    token,
    body: payload,
  });
}

export async function deleteUser(token: string, id: string): Promise<void> {
  await request(`/admin/users/${id}`, {
    method: 'DELETE',
    token,
  });
}

export async function markAttendance(
  token: string,
  payload: { students: { id: string; status: 'present' | 'absent' | 'late' }[]; date: string; classId: string },
): Promise<{ message: string; records: AttendanceRecord[] }> {
  return request<{ message: string; records: AttendanceRecord[] }>('/admin/attendance', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function getAttendanceByDate(
  token: string,
  date: string,
): Promise<AttendanceRecord[]> {
  return request<AttendanceRecord[]>(`/admin/attendance/${date}`, { token });
}

export async function getStudentAttendance(
  token: string,
  studentId: string,
  params?: { startDate?: string; endDate?: string },
): Promise<AttendanceStats> {
  const search = new URLSearchParams();
  if (params?.startDate && params.endDate) {
    search.append('startDate', params.startDate);
    search.append('endDate', params.endDate);
  }
  const query = search.toString() ? `?${search.toString()}` : '';

  return request<AttendanceStats>(`/admin/attendance/student/${studentId}${query}`, {
    token,
  });
}

export async function updateAttendance(
  token: string,
  id: string,
  status: 'present' | 'absent' | 'late',
): Promise<AttendanceRecord> {
  return request<AttendanceRecord>(`/admin/attendance/${id}`, {
    method: 'PUT',
    token,
    body: { status },
  });
}

export async function getSchools(token: string): Promise<School[]> {
  return request<School[]>('/admin/schools', { token });
}

export async function createSchool(
  token: string,
  payload: { name: string; address?: string; contactEmail?: string; contactPhone?: string },
): Promise<School> {
  return request<School>('/admin/school', {
    method: 'POST',
    token,
    body: payload,
  });
}
