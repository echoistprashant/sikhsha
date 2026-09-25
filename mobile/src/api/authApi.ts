import { request } from './httpClient';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: 'teacher' | 'student' | 'admin';
  school_id?: string | null;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function refreshToken(token: string): Promise<{ token: string }> {
  return request<{ token: string }>('/auth/refresh', {
    method: 'POST',
    body: { token },
  });
}
