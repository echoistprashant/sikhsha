import { request } from './httpClient';

export interface CurriculumSubject {
    id: string;
    name: string;
}

export interface CurriculumTopicsResponse {
    topics: string[];
    subject: string;
    classLevel: string;
}

/**
 * Get all available classes
 */
export async function getClasses(token: string): Promise<string[]> {
    const response = await request<{ classes: string[] }>('/questions/curriculum/classes', {
        method: 'GET',
        token,
    });
    return response.classes;
}

/**
 * Get subjects for a specific class
 */
export async function getSubjects(
    token: string,
    classLevel: string,
): Promise<CurriculumSubject[]> {
    const response = await request<{ subjects: CurriculumSubject[] }>(`/questions/curriculum/subjects?class=${classLevel}`, {
        method: 'GET',
        token,
    });
    return response.subjects;
}

/**
 * Get topics for a specific class and subject
 */
export async function getTopics(
    token: string,
    classLevel: string,
    subject: string,
): Promise<CurriculumTopicsResponse> {
    return request<CurriculumTopicsResponse>(`/questions/curriculum/topics?class=${classLevel}&subject=${subject}`, {
        method: 'GET',
        token,
    });
}
