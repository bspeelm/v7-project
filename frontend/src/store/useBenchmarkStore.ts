import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { DataService } from '@/lib/api/dataService'
import { parseGrade, analyzeStylePerformance, calculateProgressMetrics } from '@/lib/utils/climbingCalculations'
import type { BenchmarkSend } from '@/types'

interface BenchmarkState {
  // Data
  benchmarkSends: BenchmarkSend[]
  
  // Loading states
  isLoading: boolean
  error: string | null
  
  // Computed data
  styleAnalysis: { [style: string]: { averageGrade: number, count: number, bestGrade: string } } | null
  progressMetrics: {
    currentLevel: number
    targetLevel: number
    progressPercentage: number
    estimatedDaysToTarget: number
    weeklyProgressRate: number
  } | null
  
  // Actions
  loadBenchmarkSends: (userId: string) => Promise<void>
  addBenchmarkSend: (send: Omit<BenchmarkSend, 'id' | 'createdAt'>) => Promise<void>
  updateBenchmarkSend: (id: string, updates: Partial<BenchmarkSend>) => Promise<void>
  deleteBenchmarkSend: (id: string, userId: string) => Promise<void>
  calculateStyleAnalysis: () => void
  calculateProgress: (targetGrade: string) => void
  getBestGradeByStyle: (style: string) => string
  getRecentSends: (days?: number) => BenchmarkSend[]
  clearError: () => void
}

export const useBenchmarkStore = create<BenchmarkState>()(
  persist(
    (set, get) => ({
      benchmarkSends: [],
      isLoading: false,
      error: null,
      styleAnalysis: null,
      progressMetrics: null,
      
      loadBenchmarkSends: async (userId: string) => {
        set({ isLoading: true, error: null })
        try {
          const sends = await DataService.getBenchmarkSends(userId)
          set({ 
            benchmarkSends: sends, 
            isLoading: false 
          })
          
          // Auto-calculate analysis after loading
          const { calculateStyleAnalysis } = get()
          calculateStyleAnalysis()
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load benchmark sends',
            isLoading: false 
          })
        }
      },
      
      addBenchmarkSend: async (sendData) => {
        set({ isLoading: true, error: null })
        try {
          const newSend = await DataService.addBenchmarkSend(sendData)
          set((state) => ({
            benchmarkSends: [newSend, ...state.benchmarkSends],
            isLoading: false
          }))
          
          // Recalculate analysis
          const { calculateStyleAnalysis } = get()
          calculateStyleAnalysis()
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add benchmark send',
            isLoading: false 
          })
        }
      },
      
      updateBenchmarkSend: async (id: string, updates) => {
        set({ isLoading: true, error: null })
        try {
          const updatedSend = await DataService.updateBenchmarkSend(id, updates)
          set((state) => ({
            benchmarkSends: state.benchmarkSends.map(send => 
              send.id === id ? updatedSend : send
            ),
            isLoading: false
          }))
          
          // Recalculate analysis
          const { calculateStyleAnalysis } = get()
          calculateStyleAnalysis()
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update benchmark send',
            isLoading: false 
          })
        }
      },
      
      deleteBenchmarkSend: async (id: string, userId: string) => {
        set({ isLoading: true, error: null })
        try {
          await DataService.deleteBenchmarkSend(id, userId)
          set((state) => ({
            benchmarkSends: state.benchmarkSends.filter(send => send.id !== id),
            isLoading: false
          }))
          
          // Recalculate analysis
          const { calculateStyleAnalysis } = get()
          calculateStyleAnalysis()
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete benchmark send',
            isLoading: false 
          })
        }
      },
      
      calculateStyleAnalysis: () => {
        const { benchmarkSends } = get()
        if (benchmarkSends.length === 0) {
          set({ styleAnalysis: null })
          return
        }
        
        const analysis = analyzeStylePerformance(benchmarkSends)
        set({ styleAnalysis: analysis })
      },
      
      calculateProgress: (targetGrade: string) => {
        const { benchmarkSends } = get()
        if (benchmarkSends.length === 0) {
          set({ progressMetrics: null })
          return
        }
        
        // Find current best grade
        const grades = benchmarkSends.map(send => parseGrade(send.grade))
        const currentBest = Math.max(...grades.map(g => g.gradeNumeric))
        const currentGrade = `V${currentBest}`
        
        // Create historical sends data for progress calculation
        const historicalSends = benchmarkSends.map(send => ({
          grade: send.grade,
          date: send.date
        }))
        
        const metrics = calculateProgressMetrics(currentGrade, targetGrade, historicalSends)
        set({ progressMetrics: metrics })
      },
      
      getBestGradeByStyle: (style: string) => {
        const { benchmarkSends } = get()
        const styleSends = benchmarkSends.filter(send => send.style === style)
        
        if (styleSends.length === 0) return 'N/A'
        
        const grades = styleSends.map(send => parseGrade(send.grade).gradeNumeric)
        const bestGrade = Math.max(...grades)
        return `V${bestGrade}`
      },
      
      getRecentSends: (days: number = 30) => {
        const { benchmarkSends } = get()
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)
        
        return benchmarkSends.filter(send => 
          new Date(send.date) >= cutoffDate
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      },
      
      clearError: () => set({ error: null })
    }),
    {
      name: 'benchmark-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        benchmarkSends: state.benchmarkSends,
        styleAnalysis: state.styleAnalysis,
        progressMetrics: state.progressMetrics
      })
    }
  )
)