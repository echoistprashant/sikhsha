import { request } from './httpClient';

export interface Student {
    id: string;
    name: string;
    email: string;
    section: string;
    grade_level: string;
}

export interface AttendanceRecord {
    studentId: string;
    status: 'present' | 'absent';
}

export interface AttendanceSubmission {
    date: string;
    attendance: AttendanceRecord[];
}

export interface AttendanceSummary {
    message: string;
    summary: {
        total: number;
        present: number;
        absent: number;
        date: string;
    };
}

export interface ClassInfo {
    class: string;
    section: string;
    total_students: number;
}

export interface AttendanceHistoryRecord {
    id: string;
    student_id: string;
    student_name: string;
    student_email: string;
    status: string;
    marked_at: string;
}

export interface AttendanceHistoryResponse {
    date: string;
    class: string;
    section: string;
    records: AttendanceHistoryRecord[];
}

// Get teacher's assigned class students
export async function getMyStudents(token: string): Promise<{
    class: string;
    section: string;
    students: Student[];
}> {
    return request('/attendance/teacher/students', {
        method: 'GET',
        token,
    });
}

// Mark attendance
export async function markAttendance(
    token: string,
    data: AttendanceSubmission,
): Promise<AttendanceSummary> {
    return request('/attendance/teacher/attendance', {
        method: 'POST',
        token,
        body: data,
    });
}

// Get all classes (for viewing)
export async function getAllClasses(token: string): Promise<{
    classes: ClassInfo[];
}> {
    return request('/attendance/teacher/attendance/classes', {
        method: 'GET',
        token,
    });
}

// Get attendance for a specific class/date
export async function getClassAttendance(
    token: string,
    params: {
        date: string;
        class?: string;
        section?: string;
    },
): Promise<AttendanceHistoryResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('date', params.date);
    if (params.class) queryParams.append('class', params.class);
    if (params.section) queryParams.append('section', params.section);

    return request(`/attendance/teacher/attendance?${queryParams.toString()}`, {
        method: 'GET',
        token,
    });
}
