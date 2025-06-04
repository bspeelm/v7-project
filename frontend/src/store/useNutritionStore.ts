import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { DataService } from '@/lib/api/dataService'
import { calculateNutritionTargets, calculateWeeklyAverages } from '@/lib/utils/nutritionCalculations'
import type { NutritionLog, Meal, NutritionTargets, UserNutritionProfile } from '@/types'

interface NutritionState {
  // User profile and targets
  userProfile: UserNutritionProfile | null
  targets: NutritionTargets | null
  
  // Daily tracking
  currentLog: NutritionLog | null
  logs: NutritionLog[]
  
  // AI recommendations
  aiMealPlan: Meal[]
  aiInsights: string[]
  proteinRecommendations: Array<{
    food: string
    efficiency: number
    protein: number
    calories: number
    notes: string
  }>
  
  // Loading states
  isLoading: boolean
  error: string | null
  
  // Actions
  loadUserProfile: (userId: string) => Promise<void>
  updateUserProfile: (profile: Partial<UserNutritionProfile>) => void
  calculateTargets: () => void
  loadNutritionLogs: (userId: string, dateRange?: { start: string, end: string }) => Promise<void>
  saveNutritionLog: (log: NutritionLog) => Promise<void>
  logMeal: (meal: Omit<Meal, 'id'>) => void
  updateMeal: (mealId: string, updates: Partial<Meal>) => void
  deleteMeal: (mealId: string) => void
  loadProteinSources: () => Promise<void>
  setAiMealPlan: (meals: Meal[]) => void
  loadAiInsights: (userId: string) => Promise<void>
  addAiInsight: (userId: string, insight: string) => Promise<void>
  getCurrentDayLog: () => NutritionLog | null
  getWeeklyAverage: () => Partial<NutritionTargets>
  clearError: () => void
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      userProfile: null,
      targets: null,
      currentLog: null,
      logs: [],
      aiMealPlan: [],
      aiInsights: [],
      proteinRecommendations: [],
      isLoading: false,
      error: null,
      
      loadUserProfile: async (userId: string) => {
        set({ isLoading: true, error: null })
        try {
          const profile = await DataService.getNutritionUserProfile(userId)
          if (profile) {
            const targets = calculateNutritionTargets(profile)
            set({ userProfile: profile, targets, isLoading: false })
          } else {
            throw new Error('Profile not found')
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load profile',
            isLoading: false 
          })
        }
      },
      
      loadProteinSources: async () => {
        try {
          const sources = await DataService.getProteinSources()
          set({ proteinRecommendations: sources })
        } catch (error) {
          console.error('Failed to load protein sources:', error)
        }
      },
      
      loadNutritionLogs: async (userId: string, dateRange?: { start: string, end: string }) => {
        set({ isLoading: true, error: null })
        try {
          const logs = await DataService.getNutritionLogs(userId, dateRange)
          const today = new Date().toISOString().split('T')[0]
          const currentLog = logs.find(log => log.date === today) || null
          set({ logs, currentLog, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load logs',
            isLoading: false 
          })
        }
      },
      
      saveNutritionLog: async (log: NutritionLog) => {
        try {
          await DataService.saveNutritionLog(log)
          // Update local state
          set((state) => {
            const logIndex = state.logs.findIndex(l => l.date === log.date)
            const updatedLogs = logIndex >= 0 
              ? state.logs.map((l, i) => i === logIndex ? log : l)
              : [...state.logs, log]
            
            return {
              logs: updatedLogs,
              currentLog: log.date === new Date().toISOString().split('T')[0] ? log : state.currentLog
            }
          })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to save log' })
        }
      },
      
      loadAiInsights: async (userId: string) => {
        try {
          const insights = await DataService.getAiInsights(userId)
          set({ aiInsights: insights })
        } catch (error) {
          console.error('Failed to load AI insights:', error)
        }
      },
      
      addAiInsight: async (userId: string, insight: string) => {
        try {
          const updatedInsights = await DataService.addAiInsight(userId, insight)
          set({ aiInsights: updatedInsights })
        } catch (error) {
          console.error('Failed to add AI insight:', error)
        }
      },
      
      updateUserProfile: (profile) => {
        set((state) => {
          if (!state.userProfile) return state
          const newProfile = { ...state.userProfile, ...profile }
          return {
            userProfile: newProfile,
            targets: calculateNutritionTargets(newProfile)
          }
        })
      },
      
      calculateTargets: () => {
        const { userProfile } = get()
        if (userProfile) {
          set({ targets: calculateNutritionTargets(userProfile) })
        }
      },
      
      logMeal: (mealData) => {
        const today = new Date().toISOString().split('T')[0]
        const mealId = Date.now().toString()
        const meal: Meal = { ...mealData, id: mealId }
        
        set((state) => {
          let currentLog = state.currentLog
          
          // Create new log for today if doesn't exist
          if (!currentLog || currentLog.date !== today) {
            currentLog = {
              userId: 'dev-user-1',
              date: today,
              meals: [],
              totalCalories: 0,
              macros: { protein: 0, carbs: 0, fat: 0 },
              hydration: 0,
              supplements: []
            }
          }
          
          // Add meal to current log
          const updatedMeals = [...currentLog.meals, meal]
          const newTotals = updatedMeals.reduce(
            (acc, m) => ({
              calories: acc.calories + m.calories,
              protein: acc.protein + m.protein,
              carbs: acc.carbs + m.carbs,
              fat: acc.fat + m.fat
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
          )
          
          const updatedLog: NutritionLog = {
            ...currentLog,
            meals: updatedMeals,
            totalCalories: newTotals.calories,
            macros: {
              protein: newTotals.protein,
              carbs: newTotals.carbs,
              fat: newTotals.fat
            }
          }
          
          // Update logs array
          const logIndex = state.logs.findIndex(log => log.date === today)
          const updatedLogs = logIndex >= 0 
            ? state.logs.map((log, i) => i === logIndex ? updatedLog : log)
            : [...state.logs, updatedLog]
          
          return {
            currentLog: updatedLog,
            logs: updatedLogs
          }
        })
      },
      
      updateMeal: (mealId, updates) => {
        set((state) => {
          if (!state.currentLog) return state
          
          const updatedMeals = state.currentLog.meals.map(meal =>
            meal.id === mealId ? { ...meal, ...updates } : meal
          )
          
          const newTotals = updatedMeals.reduce(
            (acc, m) => ({
              calories: acc.calories + m.calories,
              protein: acc.protein + m.protein,
              carbs: acc.carbs + m.carbs,
              fat: acc.fat + m.fat
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
          )
          
          const updatedLog: NutritionLog = {
            ...state.currentLog,
            meals: updatedMeals,
            totalCalories: newTotals.calories,
            macros: newTotals
          }
          
          return { currentLog: updatedLog }
        })
      },
      
      deleteMeal: (mealId) => {
        set((state) => {
          if (!state.currentLog) return state
          
          const updatedMeals = state.currentLog.meals.filter(meal => meal.id !== mealId)
          const newTotals = updatedMeals.reduce(
            (acc, m) => ({
              calories: acc.calories + m.calories,
              protein: acc.protein + m.protein,
              carbs: acc.carbs + m.carbs,
              fat: acc.fat + m.fat
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
          )
          
          const updatedLog: NutritionLog = {
            ...state.currentLog,
            meals: updatedMeals,
            totalCalories: newTotals.calories,
            macros: newTotals
          }
          
          return { currentLog: updatedLog }
        })
      },
      
      setAiMealPlan: (meals) => set({ aiMealPlan: meals }),
      
      getCurrentDayLog: () => {
        const today = new Date().toISOString().split('T')[0]
        return get().logs.find(log => log.date === today) || null
      },
      
      getWeeklyAverage: () => {
        const { logs } = get()
        const lastWeekLogs = logs.slice(-7)
        
        return calculateWeeklyAverages(lastWeekLogs.map(log => ({
          totalCalories: log.totalCalories,
          macros: log.macros
        })))
      },
      
      clearError: () => set({ error: null })
    }),
    {
      name: 'nutrition-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        userProfile: state.userProfile,
        targets: state.targets 
      })
    }
  )
)