import {request} from './httpClient';

export interface Doubt {
  id: string;
  student_id: string;
  question: string;
  question_type: 'text' | 'image' | 'voice';
  image_url?: string | null;
  audio_url?: string | null;
  subject?: string | null;
  solution?: string | null;
  status: 'pending' | 'resolved';
  weak_areas?: any;
  related_concepts?: any;
  created_at?: string;
  resolved_at?: string | null;
}

export interface FollowUp {
  id: string;
  doubt_id: string;
  question: string;
  answer: string;
  created_at?: string;
}

export interface DoubtHistoryResponse {
  doubts: Doubt[];
  totalCount: number;
  page: number;
  limit: number;
}

export interface WeakArea {
  subject: string;
  frequency: string | number;
}

export async function submitTextDoubt(
  token: string,
  payload: {question: string; subject?: string},
): Promise<Doubt> {
  return request<Doubt>('/student/doubt/text', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function getDoubtHistory(
  token: string,
  params?: {page?: number; limit?: number},
): Promise<DoubtHistoryResponse> {
  const search = new URLSearchParams();
  if (params?.page) search.append('page', String(params.page));
  if (params?.limit) search.append('limit', String(params.limit));
  const query = search.toString() ? `?${search.toString()}` : '';

  return request<DoubtHistoryResponse>(`/student/doubts${query}`, {
    token,
  });
}

export async function getDoubtById(token: string, id: string): Promise<Doubt & {followUps: FollowUp[]}> {
  return request<Doubt & {followUps: FollowUp[]}>(`/student/doubt/${id}`, {
    token,
  });
}

export async function submitFollowUp(
  token: string,
  id: string,
  question: string,
): Promise<FollowUp> {
  return request<FollowUp>(`/student/doubt/${id}/follow-up`, {
    method: 'POST',
    token,
    body: {question},
  });
}

export async function getWeakAreas(token: string): Promise<WeakArea[]> {
  return request<WeakArea[]>('/student/weak-areas', {token});
}

export async function getSimilarProblems(
  token: string,
  id: string,
): Promise<Doubt[]> {
  return request<Doubt[]>(`/student/doubt/${id}/similar`, {token});
}
