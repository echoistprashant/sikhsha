interface LessonStep {
  order: number
  activity: string
  duration: number
  method: string
  resources: string[]
  notes?: string
}

interface SessionIntroduction {
  hook: string
  priorKnowledge: string
  agendaShare: string
}

interface CheckForUnderstanding {
  type: string
  prompt: string
  expectedResponse?: string
}

export interface LessonSession {
  sessionNumber: number
  title: string
  duration: number
  objectives: string[]
  introduction: SessionIntroduction
  activities: LessonStep[]
  checkForUnderstanding: CheckForUnderstanding[]
  closure: string
}

interface Concept {
  id: string
  name: string
  description: string
}

interface AssessmentPlan {
  formative: string[]
  summative: string
}

interface DifferentiationPlan {
  support: string[]
  extension: string[]
  accommodations?: string[]
}

export interface LessonPlan {
  title: string
  objectives: string[]
  prerequisites: string[]
  standards?: string[]
  concepts: Concept[]
  sessions: LessonSession[]
  assessments: AssessmentPlan
  resources: string[]
  differentiation: DifferentiationPlan
  totalSessions: number
  totalDuration: number
}

const parseJsonLike = <T>(value: unknown, fallback: T): T => {
  if (value == null) return fallback
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T
    } catch {
      return fallback
    }
  }
  return value as T
}

export const normalizeLessonPlan = (value: unknown): LessonPlan | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const raw = value as Record<string, unknown>

  if (Array.isArray(raw.sessions)) {
    return raw as unknown as LessonPlan
  }

  const sessions = parseJsonLike<LessonSession[]>(raw.sequence, [])
  const objectives = parseJsonLike<string[]>(raw.objectives, [])
  const concepts = parseJsonLike<Concept[]>(raw.concepts, [])
  const assessments = parseJsonLike<AssessmentPlan>(raw.assessments, {
    formative: [],
    summative: '',
  })
  const metadata = parseJsonLike<Record<string, unknown>>(raw.resources, {})
  const resources = parseJsonLike<string[]>(metadata.resources, [])
  const prerequisites = parseJsonLike<string[]>(metadata.prerequisites, [])
  const standards = parseJsonLike<string[] | undefined>(metadata.standards, undefined)
  const differentiation = parseJsonLike<DifferentiationPlan>(metadata.differentiation, {
    support: [],
    extension: [],
    accommodations: [],
  })

  return {
    title: typeof raw.title === 'string' ? raw.title : 'Lesson Plan',
    objectives,
    prerequisites,
    standards,
    concepts,
    sessions,
    assessments,
    resources,
    differentiation,
    totalSessions:
      typeof metadata.totalSessions === 'number'
        ? metadata.totalSessions
        : sessions.length,
    totalDuration:
      typeof raw.duration === 'number'
        ? raw.duration
        : typeof raw.totalDuration === 'number'
          ? raw.totalDuration
          : sessions.reduce((sum, session) => sum + (session.duration || 0), 0),
  }
}
