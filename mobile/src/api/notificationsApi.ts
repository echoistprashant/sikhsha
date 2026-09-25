import { request } from './httpClient';

// ===================
// TYPES
// ===================

export interface Announcement {
    id: string;
    title: string;
    content: string;
    target_audience: 'all' | 'students' | 'teachers' | 'class_specific';
    class_name?: string;
    section?: string;
    created_by: string;
    created_by_name?: string;
    school_id: string;
    is_active: boolean;
    expires_at?: string;
    created_at: string;
}

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message?: string;
    notification_type: 'announcement' | 'homework' | 'result' | 'general';
    reference_id?: string;
    reference_type?: string;
    is_read: boolean;
    created_at: string;
}

// ===================
// ANNOUNCEMENTS
// ===================

export interface CreateAnnouncementPayload {
    title: string;
    content: string;
    targetAudience: 'all' | 'students' | 'teachers' | 'class_specific';
    className?: string;
    section?: string;
    expiresAt?: string;
}

// Create announcement (Teacher/Admin)
export async function createAnnouncement(
    token: string,
    payload: CreateAnnouncementPayload
): Promise<{ message: string; announcement: Announcement }> {
    return request('/announcements', {
        method: 'POST',
        token,
        body: payload,
    });
}

// Get announcements
export async function getAnnouncements(
    token: string,
    params?: { page?: number; limit?: number }
): Promise<Announcement[]> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';

    return request<Announcement[]>(`/announcements${query}`, { token });
}

// Delete announcement (Admin)
export async function deleteAnnouncement(
    token: string,
    id: string
): Promise<{ message: string }> {
    return request(`/announcements/${id}`, {
        method: 'DELETE',
        token,
    });
}

// ===================
// NOTIFICATIONS
// ===================

// Get user's notifications
export async function getNotifications(
    token: string,
    params?: { isRead?: boolean; type?: string; page?: number; limit?: number }
): Promise<Notification[]> {
    const searchParams = new URLSearchParams();
    if (params?.isRead !== undefined) searchParams.append('isRead', params.isRead.toString());
    if (params?.type) searchParams.append('type', params.type);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';

    return request<Notification[]>(`/notifications${query}`, { token });
}

// Get unread count
export async function getUnreadCount(token: string): Promise<{ unreadCount: number }> {
    return request<{ unreadCount: number }>('/notifications/unread-count', { token });
}

// Mark notification as read
export async function markAsRead(token: string, id: string): Promise<{ message: string }> {
    return request(`/notifications/${id}/read`, {
        method: 'PUT',
        token,
    });
}

// Mark all notifications as read
export async function markAllAsRead(token: string): Promise<{ message: string }> {
    return request('/notifications/read-all', {
        method: 'PUT',
        token,
    });
}
