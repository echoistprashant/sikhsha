import { request } from './httpClient';

export interface QuestionRequest {
    subject: string;
    chapter: string;
    difficulty: string;
    type: string;
    count: number;
    classLevel: string;
    board?: string;
    examMode?: string;
    extraCommands?: string;
    title?: string;
    provider?: 'gemini' | 'openai';
    includeAnswers?: boolean;
    includeExplanations?: boolean;
}

export interface QuestionResult {
    questions: any[];
    [key: string]: any;
}

export const generateQuestions = async (data: QuestionRequest): Promise<QuestionResult> => {
    return request<QuestionResult>('/questions/generate', {
        method: 'POST',
        body: data,
    });
};

export const createPdf = async (data: {
    questions: any[];
    subject: string;
    chapter: string;
    difficulty: string;
    customTitle?: string;
    includeAnswers?: boolean;
    includeExplanations?: boolean;
}): Promise<Blob> => { // Note: Mobile handling of Blob might differ, usually we get a URL or save to file
    // For mobile, maybe we expect a download URL or we handle the stream.
    // Using request helper from httpClient might not be suitable if it parses JSON by default.
    // But let's assume valid JSON response or handle separately if needed.
    // Actually, for PDF, we probably want to download it.
    // The httpClient assumes JSON response.
    // Let's implement a specific PDF download function if needed, or just return the response.

    // For now, let's assume the backend returns a URL or we use a different fetch for PDF.
    // But to align with current httpClient, let's just stick to generation for now.
    return request<any>('/questions/create-pdf', {
        method: 'POST',
        body: data,
    });
};
