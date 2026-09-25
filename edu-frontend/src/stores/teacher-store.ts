import { create } from 'zustand'
import type { Deck, Activity, LessonPlan } from '@/types/teacher'

interface TeacherState {
  currentDeck: Deck | null
  decks: Deck[]
  activities: Activity[]
  lessonPlans: LessonPlan[]
  setCurrentDeck: (deck: Deck | null) => void
  addDeck: (deck: Deck) => void
  addActivity: (activity: Activity) => void
  addLessonPlan: (plan: LessonPlan) => void
}

export const useTeacherStore = create<TeacherState>((set) => ({
  currentDeck: null,
  decks: [],
  activities: [],
  lessonPlans: [],
  
  setCurrentDeck: (deck) => set({ currentDeck: deck }),
  addDeck: (deck) => set((state) => ({ decks: [deck, ...state.decks] })),
  addActivity: (activity) => set((state) => ({ activities: [activity, ...state.activities] })),
  addLessonPlan: (plan) => set((state) => ({ lessonPlans: [plan, ...state.lessonPlans] })),
}))
