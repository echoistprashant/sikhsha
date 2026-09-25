export interface VisualMetadata {
  visualType?: string
  visualConfig?: any
  confidence?: number
  generatedBy?: string
  reasoning?: string
}

export interface Slide {
  id: string
  title: string
  content: string
  imageUrl?: string
  order: number
  notes?: string
  visualMetadata?: VisualMetadata
}

export interface Deck {
  id: string
  title: string
  subject: string
  gradeLevel: string
  slides: Slide[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface DeckGenerateRequest {
  topic: string
  subject: string
  gradeLevel: string
  numSlides?: number
}

// Topic Generator Types (Replica of Deck)
export interface TopicItem {
  id: string
  title: string
  content: string
  imageUrl?: string
  order: number
  notes?: string
  visualMetadata?: VisualMetadata
}

export interface Topic {
  id: string
  title: string
  subject: string
  gradeLevel: string
  slides: TopicItem[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface TopicGenerateRequest {
  topic: string
  subject: string
  gradeLevel: string
  numSlides?: number
}

export interface Activity {
  id: string
  title: string
  subject: string
  activityType: string
  duration: number
  materials: string[]
  steps: string[]
  learningOutcomes: string[]
  createdBy: string
  createdAt: string
}

export interface ActivityGenerateRequest {
  topic: string
  subject: string
  duration: number
  activityType: string
  gradeLevel: string
}

export interface LessonPlan {
  id: string
  title: string
  subject: string
  gradeLevel: string
  duration: number
  objectives: string[]
  concepts: Concept[]
  sequence: LessonStep[]
  assessments: string[]
  resources: string[]
  createdBy: string
  createdAt: string
}

export interface LessonStep {
  order: number
  activity: string
  duration: number
  method: string
  resources: string[]
}

export interface Concept {
  id: string
  name: string
  description: string
  subject: string
  gradeLevel: string
  prerequisites: string[]
  relatedConcepts: string[]
}

export interface LessonPlanGenerateRequest {
  topics: string[]
  subject: string
  gradeLevel: string
  totalDuration: number
}
