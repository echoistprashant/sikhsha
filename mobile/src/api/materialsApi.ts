import { request } from './httpClient';

// ===================
// TYPES
// ===================

export interface StudyMaterial {
    id: string;
    name: string;
    file_type: 'pdf' | 'doc' | 'image' | 'video' | 'other';
    subject: string;
    file_url: string;
    file_size?: string;
    class_name: string;
    section?: string;
    description?: string;
    uploaded_by: string;
    uploaded_by_name?: string;
    created_at: string;
}

// ===================
// STUDENT APIs
// ===================

// Get materials for student's class
export async function getStudentMaterials(
    token: string,
    params?: { subject?: string; fileType?: string }
): Promise<StudyMaterial[]> {
    const searchParams = new URLSearchParams();
    if (params?.subject) searchParams.append('subject', params.subject);
    if (params?.fileType) searchParams.append('fileType', params.fileType);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';

    return request<StudyMaterial[]>(`/student/materials${query}`, { token });
}

// ===================
// TEACHER APIs
// ===================

export interface UploadMaterialPayload {
    name: string;
    fileType: 'pdf' | 'doc' | 'image' | 'video' | 'other';
    subject: string;
    fileUrl: string;
    fileSize?: string;
    className: string;
    section?: string;
    description?: string;
}

// Upload study material
export async function uploadMaterial(
    token: string,
    payload: UploadMaterialPayload
): Promise<{ message: string; material: StudyMaterial }> {
    return request('/teacher/materials', {
        method: 'POST',
        token,
        body: payload,
    });
}

// Get teacher's materials
export async function getTeacherMaterials(
    token: string,
    params?: { subject?: string; className?: string; fileType?: string }
): Promise<StudyMaterial[]> {
    const searchParams = new URLSearchParams();
    if (params?.subject) searchParams.append('subject', params.subject);
    if (params?.className) searchParams.append('className', params.className);
    if (params?.fileType) searchParams.append('fileType', params.fileType);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';

    return request<StudyMaterial[]>(`/teacher/materials${query}`, { token });
}

// Update material
export async function updateMaterial(
    token: string,
    id: string,
    payload: Partial<Omit<UploadMaterialPayload, 'fileType' | 'fileUrl'>>
): Promise<StudyMaterial> {
    return request<StudyMaterial>(`/teacher/materials/${id}`, {
        method: 'PUT',
        token,
        body: payload,
    });
}

// Delete material
export async function deleteMaterial(
    token: string,
    id: string
): Promise<{ message: string; id: string; name: string }> {
    return request(`/teacher/materials/${id}`, {
        method: 'DELETE',
        token,
    });
}
