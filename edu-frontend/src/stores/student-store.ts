import { create } from 'zustand'
import type { Doubt, DoubtHistory } from '@/types/student'

interface StudentState {
  currentDoubt: Doubt | null
  doubtHistory: DoubtHistory | null
  setCurrentDoubt: (doubt: Doubt | null) => void
  setDoubtHistory: (history: DoubtHistory) => void
  addDoubt: (doubt: Doubt) => void
}

export const useStudentStore = create<StudentState>((set) => ({
  currentDoubt: null,
  doubtHistory: null,
  
  setCurrentDoubt: (doubt) => set({ currentDoubt: doubt }),
  setDoubtHistory: (history) => set({ doubtHistory: history }),
  addDoubt: (doubt) => set((state) => ({
    doubtHistory: state.doubtHistory
      ? {
          ...state.doubtHistory,
          doubts: [doubt, ...state.doubtHistory.doubts],
          totalCount: state.doubtHistory.totalCount + 1,
        }
      : {
          doubts: [doubt],
          totalCount: 1,
          weakAreas: [],
        },
  })),
}))
