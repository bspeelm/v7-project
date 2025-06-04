import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { DataService } from '@/lib/api/dataService'
import { calculateTrainingLoad } from '@/lib/utils/climbingCalculations'

interface DashboardStats {
  userId: string
  currentWeek: {
    sessionsThisWeek: number
    successRate: number
    daysToGoal: number
    weekStartDate: string
    sessions: Array<{
      date: string
      type: string
      duration: number
      gradesCompleted: string[]
    }>
  }
  trends: {
    last4Weeks: {
      averageSessions: number
      averageSuccessRate: number
      gradeProgression: Array<{
        week: string
        highestGrade: string
        numericGrade: number
      }>
    }
    monthlyProgress: {
      [month: string]: {
        totalSessions: number
        uniqueGradesCompleted: string[]
        newPersonalBests: number
        averageSessionDuration: number
      }
    }
  }
  goals: {
    primary: {
      grade: string
      targetDate: string
      currentProgress: number
      milestones: Array<{
        grade: string
        completed: boolean
        date?: string
        estimated?: string
      }>
    }
  }
  lastUpdated: string
}

interface DashboardState {
  // Data
  stats: DashboardStats | null
  
  // Loading states
  isLoading: boolean
  error: string | null
  
  // Computed metrics
  computedMetrics: {
    currentSuccessRate: number
    trainingLoad: {
      volume: number
      intensity: number
      density: number
      load: number
    }
    weeklyTrend: 'improving' | 'stable' | 'declining'
  } | null
  
  // Actions
  loadDashboardStats: (userId: string) => Promise<void>
  refreshStats: (userId: string) => Promise<void>
  updateGoalProgress: (progress: number) => void
  addMilestone: (milestone: { grade: string, completed: boolean, date?: string }) => void
  calculateMetrics: (journalEntries?: any[], trainingData?: any[]) => void
  getWeeklyTrend: () => 'improving' | 'stable' | 'declining'
  clearError: () => void
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      stats: null,
      isLoading: false,
      error: null,
      computedMetrics: null,
      
      loadDashboardStats: async (userId: string) => {
        set({ isLoading: true, error: null })
        try {
          const stats = await DataService.getDashboardStats(userId)
          set({ 
            stats: stats as DashboardStats, 
            isLoading: false 
          })
          
          // Auto-calculate metrics after loading
          const { calculateMetrics } = get()
          calculateMetrics()
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load dashboard stats',
            isLoading: false 
          })
        }
      },
      
      refreshStats: async (userId: string) => {
        // Clear cache and reload fresh data
        DataService.clearCache()
        await get().loadDashboardStats(userId)
      },
      
      updateGoalProgress: (progress: number) => {
        set((state) => {
          if (!state.stats) return state
          
          return {
            stats: {
              ...state.stats,
              goals: {
                ...state.stats.goals,
                primary: {
                  ...state.stats.goals.primary,
                  currentProgress: progress
                }
              },
              lastUpdated: new Date().toISOString()
            }
          }
        })
      },
      
      addMilestone: (milestone) => {
        set((state) => {
          if (!state.stats) return state
          
          const existingIndex = state.stats.goals.primary.milestones.findIndex(
            m => m.grade === milestone.grade
          )
          
          let updatedMilestones
          if (existingIndex >= 0) {
            updatedMilestones = state.stats.goals.primary.milestones.map((m, i) =>
              i === existingIndex ? milestone : m
            )
          } else {
            updatedMilestones = [...state.stats.goals.primary.milestones, milestone]
          }
          
          return {
            stats: {
              ...state.stats,
              goals: {
                ...state.stats.goals,
                primary: {
                  ...state.stats.goals.primary,
                  milestones: updatedMilestones
                }
              },
              lastUpdated: new Date().toISOString()
            }
          }
        })
      },
      
      calculateMetrics: (trainingData?: any[]) => {
        const { stats } = get()
        if (!stats) return
        
        // Calculate success rate from current week sessions
        const currentSuccessRate = stats.currentWeek.successRate
        
        // Calculate training load from recent sessions
        const trainingLoad = trainingData ? calculateTrainingLoad(trainingData) : {
          volume: 0,
          intensity: 0,
          density: 0,
          load: 0
        }
        
        // Determine weekly trend from grade progression
        const weeklyTrend = get().getWeeklyTrend()
        
        set({
          computedMetrics: {
            currentSuccessRate,
            trainingLoad,
            weeklyTrend
          }
        })
      },
      
      getWeeklyTrend: () => {
        const { stats } = get()
        if (!stats || stats.trends.last4Weeks.gradeProgression.length < 2) {
          return 'stable'
        }
        
        const progression = stats.trends.last4Weeks.gradeProgression
        const recent = progression.slice(-2)
        const [previous, current] = recent
        
        if (current.numericGrade > previous.numericGrade) {
          return 'improving'
        } else if (current.numericGrade < previous.numericGrade) {
          return 'declining'
        } else {
          return 'stable'
        }
      },
      
      clearError: () => set({ error: null })
    }),
    {
      name: 'dashboard-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        stats: state.stats,
        computedMetrics: state.computedMetrics
      })
    }
  )
)