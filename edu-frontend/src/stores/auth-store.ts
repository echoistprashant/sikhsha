import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api-client'
import type { User, AuthState, RegisterData } from '@/types/auth'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const response = await api.post('/auth/login', { email, password })
          const { user, token } = response.data

          localStorage.setItem('auth_token', token)
          localStorage.setItem('user', JSON.stringify(user))

          set({ user, token, isAuthenticated: true })
        } catch (error) {
          console.error('Login failed:', error)
          throw error
        }
      },

      register: async (data: RegisterData) => {
        try {
          const response = await api.post('/auth/register', data)
          const { user, token } = response.data

          localStorage.setItem('auth_token', token)
          localStorage.setItem('user', JSON.stringify(user))

          set({ user, token, isAuthenticated: true })
        } catch (error) {
          console.error('Registration failed:', error)
          throw error
        }
      },

      logout: () => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        set({ user: null, token: null, isAuthenticated: false })
      },

      setUser: (user: User) => {
        set({ user })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

