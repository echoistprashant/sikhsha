import { request } from './httpClient';

export interface Homework {
    id: string;
    title: string;
    subject: string;
    description: string;
    class_name: string;
    section?: string;
    due_date: string;
    status: 'active' | 'completed' | 'cancelled';
    assigned_by: string;
    assigned_by_name?: string;
    student_status?: 'pending' | 'submitted' | 'late' | 'overdue';
    submitted_at?: string;
    created_at: string;
}

export interface HomeworkSubmission {
    id: string;
    homework_id: string;
    student_id: string;
    status: 'pending' | 'submitted' | 'late';
    submitted_at?: string;
}

// ===================
// STUDENT APIs
// ===================

// Get homework for student's class
export async function getStudentHomework(token: string): Promise<Homework[]> {
    return request<Homework[]>('/student/homework', { token });
}

// Submit homework
export async function submitHomework(
    token: string,
    homeworkId: string
): Promise<{ message: string; submission: HomeworkSubmission }> {
    return request(`/student/homework/${homeworkId}/submit`, {
        method: 'PUT',
        token,
    });
}

// ===================
// TEACHER APIs
// ===================

export interface AssignHomeworkPayload {
    title: string;
    subject: string;
    description?: string;
    className: string;
    section?: string;
    dueDate: string;
}

// Assign homework
export async function assignHomework(
    token: string,
    payload: AssignHomeworkPayload
): Promise<{ message: string; homework: Homework }> {
    return request('/teacher/homework', {
        method: 'POST',
        token,
        body: payload,
    });
}

// Get teacher's homework
export async function getTeacherHomework(
    token: string,
    params?: { status?: string; className?: string }
): Promise<Homework[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.className) searchParams.append('className', params.className);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';

    return request<Homework[]>(`/teacher/homework${query}`, { token });
}

// Update homework
export async function updateHomework(
    token: string,
    id: string,
    payload: Partial<AssignHomeworkPayload & { status: string }>
): Promise<Homework> {
    return request<Homework>(`/teacher/homework/${id}`, {
        method: 'PUT',
        token,
        body: payload,
    });
}

// Delete homework
export async function deleteHomework(token: string, id: string): Promise<{ message: string }> {
    return request(`/teacher/homework/${id}`, {
        method: 'DELETE',
        token,
    });
}
