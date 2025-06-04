import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { DataService } from '@/lib/api/dataService'
import { calculateSuccessRate, parseGrade } from '@/lib/utils/climbingCalculations'
import type { JournalEntry } from '@/types'

interface JournalState {
  // Data
  entries: JournalEntry[]
  currentEntry: JournalEntry | null
  
  // Loading states
  isLoading: boolean
  error: string | null
  
  // Filters and search
  filters: {
    dateRange?: { start?: string, end?: string }
    sessionType?: string
    gradeRange?: { min: number, max: number }
    searchTerm?: string
  }
  
  // Analytics
  analytics: {
    totalSessions: number
    averageSessionDuration: number
    successRate: number
    gradeProgression: Array<{
      date: string
      highestGrade: string
      gradeNumeric: number
    }>
    recentTrends: {
      lastWeekSessions: number
      lastMonthAverage: number
      bestMonth: string
    }
  } | null
  
  // Actions
  loadJournalEntries: (userId: string) => Promise<void>
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => Promise<void>
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => Promise<void>
  deleteJournalEntry: (id: string) => Promise<void>
  setCurrentEntry: (entry: JournalEntry | null) => void
  setFilters: (filters: Partial<JournalState['filters']>) => void
  getFilteredEntries: () => JournalEntry[]
  calculateAnalytics: () => void
  getEntriesByDateRange: (start: string, end: string) => JournalEntry[]
  getEntryById: (id: string) => JournalEntry | undefined
  searchEntries: (searchTerm: string) => JournalEntry[]
  clearError: () => void
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],
      currentEntry: null,
      isLoading: false,
      error: null,
      filters: {},
      analytics: null,
      
      loadJournalEntries: async (userId: string) => {
        set({ isLoading: true, error: null })
        try {
          const entries = await DataService.getJournalEntries(userId)
          set({ 
            entries, 
            isLoading: false 
          })
          
          // Auto-calculate analytics after loading
          const { calculateAnalytics } = get()
          calculateAnalytics()
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load journal entries',
            isLoading: false 
          })
        }
      },
      
      addJournalEntry: async (entryData) => {
        set({ isLoading: true, error: null })
        try {
          const newEntry = await DataService.addJournalEntry(entryData)
          set((state) => ({
            entries: [newEntry, ...state.entries],
            isLoading: false
          }))
          
          // Recalculate analytics
          const { calculateAnalytics } = get()
          calculateAnalytics()
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add journal entry',
            isLoading: false 
          })
        }
      },
      
      updateJournalEntry: async (id: string, updates) => {
        set({ isLoading: true, error: null })
        try {
          // In a real app, would call DataService.updateJournalEntry
          set((state) => ({
            entries: state.entries.map(entry => 
              entry.id === id ? { ...entry, ...updates } : entry
            ),
            currentEntry: state.currentEntry?.id === id 
              ? { ...state.currentEntry, ...updates } 
              : state.currentEntry,
            isLoading: false
          }))
          
          // Recalculate analytics
          const { calculateAnalytics } = get()
          calculateAnalytics()
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update journal entry',
            isLoading: false 
          })
        }
      },
      
      deleteJournalEntry: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
          // In a real app, would call DataService.deleteJournalEntry
          set((state) => ({
            entries: state.entries.filter(entry => entry.id !== id),
            currentEntry: state.currentEntry?.id === id ? null : state.currentEntry,
            isLoading: false
          }))
          
          // Recalculate analytics
          const { calculateAnalytics } = get()
          calculateAnalytics()
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete journal entry',
            isLoading: false 
          })
        }
      },
      
      setCurrentEntry: (entry) => set({ currentEntry: entry }),
      
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters }
        }))
      },
      
      getFilteredEntries: () => {
        const { entries, filters } = get()
        let filtered = [...entries]
        
        // Date range filter
        if (filters.dateRange?.start) {
          filtered = filtered.filter(entry => entry.date >= filters.dateRange!.start!)
        }
        if (filters.dateRange?.end) {
          filtered = filtered.filter(entry => entry.date <= filters.dateRange!.end!)
        }
        
        // Session type filter
        if (filters.sessionType) {
          filtered = filtered.filter(entry => entry.sessionType === filters.sessionType)
        }
        
        // Grade range filter
        if (filters.gradeRange) {
          filtered = filtered.filter(entry => {
            const entryGrades = entry.gradesCompleted.map(grade => parseGrade(grade).gradeNumeric)
            const maxGrade = Math.max(...entryGrades, 0)
            return maxGrade >= (filters.gradeRange!.min || 0) && 
                   maxGrade <= (filters.gradeRange!.max || 20)
          })
        }
        
        // Search term filter
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase()
          filtered = filtered.filter(entry =>
            entry.notes?.toLowerCase().includes(searchLower) ||
            (Array.isArray(entry.technicalFocus) 
              ? entry.technicalFocus.some(focus => focus.toLowerCase().includes(searchLower))
              : false) ||
            entry.mentalState?.toLowerCase().includes(searchLower) ||
            entry.gradesCompleted.some(grade => grade.toLowerCase().includes(searchLower))
          )
        }
        
        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      },
      
      calculateAnalytics: () => {
        const { entries } = get()
        if (entries.length === 0) {
          set({ analytics: null })
          return
        }
        
        // Basic stats
        const totalSessions = entries.filter(e => e.sessionType !== 'rest').length
        const averageSessionDuration = totalSessions > 0 
          ? entries.reduce((sum, e) => sum + (e.duration || 0), 0) / totalSessions
          : 0
        
        // Success rate calculation
        const successRate = calculateSuccessRate(
          entries.map(e => ({
            gradesAttempted: e.gradesAttempted || [],
            gradesCompleted: e.gradesCompleted || [],
            date: e.date
          }))
        )
        
        // Grade progression
        const gradeProgression = entries
          .filter(e => e.gradesCompleted && e.gradesCompleted.length > 0)
          .map(entry => {
            const grades = entry.gradesCompleted.map(grade => parseGrade(grade).gradeNumeric)
            const highestGrade = Math.max(...grades)
            return {
              date: entry.date,
              highestGrade: `V${highestGrade}`,
              gradeNumeric: highestGrade
            }
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        
        // Recent trends
        const now = new Date()
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        
        const lastWeekSessions = entries.filter(e => 
          new Date(e.date) >= lastWeek && e.sessionType !== 'rest'
        ).length
        
        const lastMonthEntries = entries.filter(e => new Date(e.date) >= lastMonth)
        const lastMonthAverage = lastMonthEntries.length > 0
          ? lastMonthEntries.reduce((sum, e) => sum + (e.duration || 0), 0) / lastMonthEntries.length
          : 0
        
        // Find best month (most sessions)
        const monthCounts: { [key: string]: number } = {}
        entries.forEach(entry => {
          const month = entry.date.substring(0, 7) // YYYY-MM
          monthCounts[month] = (monthCounts[month] || 0) + 1
        })
        const bestMonth = Object.entries(monthCounts).reduce((best, [month, count]) =>
          count > (monthCounts[best] || 0) ? month : best, Object.keys(monthCounts)[0] || ''
        )
        
        set({
          analytics: {
            totalSessions,
            averageSessionDuration: Math.round(averageSessionDuration),
            successRate,
            gradeProgression,
            recentTrends: {
              lastWeekSessions,
              lastMonthAverage: Math.round(lastMonthAverage),
              bestMonth
            }
          }
        })
      },
      
      getEntriesByDateRange: (start: string, end: string) => {
        const { entries } = get()
        return entries.filter(entry => entry.date >= start && entry.date <= end)
      },
      
      getEntryById: (id: string) => {
        const { entries } = get()
        return entries.find(entry => entry.id === id)
      },
      
      searchEntries: (searchTerm: string) => {
        set((state) => ({
          filters: { ...state.filters, searchTerm }
        }))
        return get().getFilteredEntries()
      },
      
      clearError: () => set({ error: null })
    }),
    {
      name: 'journal-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        entries: state.entries,
        filters: state.filters,
        analytics: state.analytics
      })
    }
  )
)