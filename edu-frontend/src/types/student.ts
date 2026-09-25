export interface Doubt {
  id: string
  studentId: string
  question: string
  questionType: 'text' | 'image' | 'voice'
  imageUrl?: string
  audioUrl?: string
  subject: string
  status: 'pending' | 'resolved'
  solution: string
  followUps: FollowUp[]
  weakAreas: string[]
  relatedConcepts: string[]
  createdAt: string
  resolvedAt?: string
}

export interface FollowUp {
  id: string
  question: string
  answer: string
  createdAt: string
}

export interface DoubtSubmitRequest {
  question?: string
  image?: File
  audio?: File
  subject?: string
}

export interface DoubtHistory {
  doubts: Doubt[]
  totalCount: number
  weakAreas: WeakArea[]
}

export interface WeakArea {
  subject: string
  topic: string
  frequency: number
  concepts: string[]
}
