import { request } from './httpClient';



export interface Deck {
  id: string;
  title: string;
  subject: string;
  grade_level: string;
  created_at?: string;
}

export interface Activity {
  id: string;
  title: string;
  subject: string;
  activity_type: string;
  duration: number;
  created_at?: string;
}

export interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  grade_level: string;
  duration: number;
  created_at?: string;
}

export interface Concept {
  id: string;
  name: string;
  description?: string;
  subject: string;
  grade_level: string;
}

export interface Slide {
  id: string;
  title: string;
  content: string;
  slide_order: number;
}

export interface DeckWithSlides extends Deck {
  slides: Slide[];
}

export interface ActivityDetail extends Activity {
  materials: string[] | string;
  steps: string[] | string;
  learning_outcomes: string[] | string;
}

export async function getDecks(token: string): Promise<Deck[]> {
  return request<Deck[]>('/teacher/decks', { token });
}

export async function getDeckById(token: string, id: string): Promise<DeckWithSlides> {
  return request<DeckWithSlides>(`/teacher/deck/${id}`, { token });
}


export async function generateDeck(
  token: string,
  payload: { topic: string; subject: string; gradeLevel: string; numSlides?: number },
): Promise<Deck> {
  const result = await request<any>('/teacher/deck/generate', {
    method: 'POST',
    token,
    body: payload,
  });

  return result as Deck;
}


export async function updateDeck(
  token: string,
  id: string,
  payload: Partial<Pick<Deck, 'title' | 'subject' | 'grade_level'>>,
): Promise<Deck> {
  return request<Deck>(`/teacher/deck/${id}`, {
    method: 'PUT',
    token,
    body: payload,
  });
}

export async function deleteDeck(token: string, id: string): Promise<void> {
  await request(`/teacher/deck/${id}`, {
    method: 'DELETE',
    token,
  });
}

export interface RefineDeckPayload {
  feedback: string;
}

export interface RefineDeckResponse {
  message: string;
}

export async function refineDeck(
  token: string,
  deckId: string,
  feedback: string,
): Promise<RefineDeckResponse> {
  const result = await request<RefineDeckResponse>(`/teacher/deck/${deckId}/ai-update`, {
    method: 'POST',
    token,
    body: {
      feedback,
    },
  });

  return result;
}

export async function getActivities(token: string): Promise<Activity[]> {
  return request<Activity[]>('/teacher/activities', { token });
}

export async function getActivityById(token: string, id: string): Promise<ActivityDetail> {
  return request<ActivityDetail>(`/teacher/activity/${id}`, { token });
}

export interface QuizQuestion {
  id: string;
  content: string;
  type: string;
  options: string[];
  answer: string;
  explanation: string;
  difficulty: string;
}

export interface QuizResponse {
  questions: QuizQuestion[];
}

export async function generateActivity(
  token: string,
  payload: {
    classLevel: string;
    subject: string;
    chapter: string;
    topic: string;
    count?: number;
  },
): Promise<QuizResponse> {
  const result = await request<QuizResponse>('/teacher/activity/generate', {
    method: 'POST',
    token,
    body: payload,
  });

  return result;
}

export async function updateActivity(
  token: string,
  id: string,
  payload: any,
): Promise<any> {
  // Legacy support or remove if needed
  return request<any>(`/teacher/activity/${id}`, {
    method: 'PUT',
    token,
    body: payload,
  });
}

export async function deleteActivity(token: string, id: string): Promise<void> {
  await request(`/teacher/question/${id}`, { // Maybe map to delete question?
    method: 'DELETE',
    token,
  });
}

export async function deleteLessonPlan(token: string, id: string): Promise<void> {
  await request(`/teacher/lesson-plan/${id}`, {
    method: 'DELETE',
    token,
  });
}

export interface TopicPlan {
  name: string;
  objectives: string[];
  teachingMinutes: number;
  periods: number;
  keyPoints: string[];
}

export interface ChapterPlan {
  name: string;
  topics: TopicPlan[];
  totalMinutes: number;
  totalPeriods: number;
}

export interface LessonPlanDetail extends LessonPlan {
  totalHours: number;
  totalPeriods: number;
  chapters: ChapterPlan[];
}

export async function getLessonPlans(token: string): Promise<LessonPlan[]> {
  return request<LessonPlan[]>('/teacher/lesson-plans', { token });
}

export async function getLessonPlanById(token: string, id: string): Promise<LessonPlanDetail> {
  return request<LessonPlanDetail>(`/teacher/lesson-plan/${id}`, { token });
}

export async function generateLessonPlan(
  token: string,
  payload: {
    topics: string[];
    subject: string;
    gradeLevel: string;
    totalDuration: number;
  },
): Promise<LessonPlan> {
  const result = await request<LessonPlan>('/teacher/lesson-plan/generate', {
    method: 'POST',
    token,
    body: payload,
  });

  return result;
}

export async function updateLessonPlan(
  token: string,
  id: string,
  payload: Partial<Pick<LessonPlan, 'title' | 'subject' | 'grade_level' | 'duration'>>,
): Promise<LessonPlan> {
  return request<LessonPlan>(`/teacher/lesson-plan/${id}`, {
    method: 'PUT',
    token,
    body: payload,
  });
}



export async function getConcepts(
  token: string,
  filters?: { subject?: string; gradeLevel?: string },
): Promise<Concept[]> {
  const params: string[] = [];

  if (filters?.subject) {
    params.push(`subject=${encodeURIComponent(filters.subject)}`);
  }

  if (filters?.gradeLevel) {
    params.push(`gradeLevel=${encodeURIComponent(filters.gradeLevel)}`);
  }

  const query = params.length ? `?${params.join('&')}` : '';

  return request<Concept[]>(`/teacher/concept-library${query}`, {
    token,
  });
}

export async function searchConcepts(
  token: string,
  searchTerm: string,
): Promise<Concept[]> {
  return request<Concept[]>('/teacher/concept/search', {
    method: 'POST',
    token,
    body: { searchTerm },
  });
}
