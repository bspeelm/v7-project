import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { DataService } from '@/lib/api/dataService'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (userId: string, password: string) => Promise<void>
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (userId: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          // Simulate password check (in real app, would verify with backend)
          if (userId === 'dev-user-1' && password === 'password') {
            const user = await DataService.getUser(userId)
            if (user) {
              const mockToken = `mock-token-${userId}-${Date.now()}`
              set({ 
                user, 
                token: mockToken,
                isAuthenticated: true, 
                isLoading: false,
                error: null 
              })
            } else {
              throw new Error('User not found')
            }
          } else {
            throw new Error('Invalid credentials')
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null
          })
        }
      },
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      logout: () => set({ 
        user: null, 
        token: null, 
        isAuthenticated: false,
        error: null 
      }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)