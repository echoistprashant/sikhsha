import { request } from './httpClient';

// ===================
// TYPES
// ===================

export interface Exam {
    id: string;
    title: string;
    subject: string;
    exam_type: 'Unit Test' | 'Mid-Term' | 'Final Exam' | 'Quiz' | 'Practical';
    class_name: string;
    section?: string;
    total_marks: number;
    exam_date?: string;
    created_by: string;
    created_at: string;
    results_count?: number;
}

export interface Result {
    id: string;
    exam_id: string;
    exam_title?: string;
    student_id?: string;
    student_name?: string;
    student_email?: string;
    subject?: string;
    exam_type?: string;
    marks_obtained: number;
    total_marks?: number;
    percentage: number;
    exam_date?: string;
    remarks?: string;
    created_at: string;
}

export interface StudentForResult {
    id: string;
    name: string;
    email: string;
    grade_level: string;
    section?: string;
}

// ===================
// STUDENT APIs
// ===================

export interface StudentResultsResponse {
    results: Result[];
    summary: {
        totalExams: number;
        averagePercentage: string | number;
    };
}

// Get student's own results
export async function getStudentResults(
    token: string,
    params?: { subject?: string; examType?: string }
): Promise<StudentResultsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.subject) searchParams.append('subject', params.subject);
    if (params?.examType) searchParams.append('examType', params.examType);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';

    return request<StudentResultsResponse>(`/student/results${query}`, { token });
}

// ===================
// TEACHER APIs
// ===================

export interface CreateExamPayload {
    title: string;
    subject: string;
    examType: 'Unit Test' | 'Mid-Term' | 'Final Exam' | 'Quiz' | 'Practical';
    className: string;
    section?: string;
    totalMarks: number;
    examDate?: string;
}

// Create exam
export async function createExam(
    token: string,
    payload: CreateExamPayload
): Promise<{ message: string; exam: Exam }> {
    return request('/teacher/exam', {
        method: 'POST',
        token,
        body: payload,
    });
}

// Get teacher's exams
export async function getTeacherExams(
    token: string,
    params?: { className?: string; subject?: string }
): Promise<Exam[]> {
    const searchParams = new URLSearchParams();
    if (params?.className) searchParams.append('className', params.className);
    if (params?.subject) searchParams.append('subject', params.subject);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';

    return request<Exam[]>(`/teacher/exams${query}`, { token });
}

// Get students for result entry
export async function getStudentsForResults(
    token: string,
    className: string,
    section?: string
): Promise<StudentForResult[]> {
    const searchParams = new URLSearchParams();
    searchParams.append('className', className);
    if (section) searchParams.append('section', section);

    return request<StudentForResult[]>(`/teacher/students?${searchParams.toString()}`, { token });
}

export interface AddResultPayload {
    examId: string;
    studentId: string;
    marksObtained: number;
    remarks?: string;
}

// Add/update student result
export async function addResult(
    token: string,
    payload: AddResultPayload
): Promise<{ message: string; result: Result; percentage: string }> {
    return request('/teacher/result', {
        method: 'POST',
        token,
        body: payload,
    });
}

export interface ExamResultsResponse {
    exam: Exam;
    results: Result[];
    stats: {
        totalStudents: number;
        avgMarks: string | number;
        highestMarks: number;
        lowestMarks: number;
    };
}

// Get all results for an exam
export async function getExamResults(
    token: string,
    examId: string
): Promise<ExamResultsResponse> {
    return request<ExamResultsResponse>(`/teacher/results/${examId}`, { token });
}
