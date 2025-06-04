/**
 * Data Service - Centralized data access layer
 * Handles loading and caching of JSON data files
 */

// Import all JSON data
import usersData from '@/data/users.json'
import athleteProfilesData from '@/data/athlete-profiles.json'
import benchmarkSendsData from '@/data/benchmark-sends.json'
import nutritionUserProfilesData from '@/data/nutrition/user-profiles.json'
import proteinSourcesData from '@/data/nutrition/protein-sources.json'
import supplementsData from '@/data/nutrition/supplements.json'
import mealTemplatesData from '@/data/nutrition/meal-templates.json'
import aiInsightsData from '@/data/nutrition/ai-insights.json'
import mealPlanOptionsData from '@/data/nutrition/meal-plan-options.json'
import trainingPlansData from '@/data/training/plans.json'
import exercisesData from '@/data/training/exercises.json'
import journalEntriesData from '@/data/journal-entries.json'
import dashboardStatsData from '@/data/dashboard-stats.json'
import chatResponsesData from '@/data/chat-responses.json'

import type { 
  User, 
  AthleteProfile, 
  BenchmarkSend, 
  JournalEntry,
  TrainingPlan,
  NutritionLog
} from '@/types'

// Simple in-memory cache for development
class DataCache {
  private cache = new Map<string, any>()
  private lastModified = new Map<string, number>()

  set(key: string, data: any): void {
    this.cache.set(key, data)
    this.lastModified.set(key, Date.now())
  }

  get(key: string): any {
    return this.cache.get(key)
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  clear(): void {
    this.cache.clear()
    this.lastModified.clear()
  }

  getAge(key: string): number {
    const lastMod = this.lastModified.get(key)
    return lastMod ? Date.now() - lastMod : Infinity
  }
}

const dataCache = new DataCache()

// Simulate API delay for realistic behavior
const simulateDelay = (ms: number = 100): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms))

export class DataService {
  // User Management
  static async getUser(userId: string): Promise<User | null> {
    await simulateDelay()
    
    if (userId === 'dev-user-1') {
      return usersData.devUser as User
    }
    
    const user = usersData.sampleUsers.find((u: any) => u.id === userId)
    return user as User || null
  }

  static async getAllUsers(): Promise<User[]> {
    await simulateDelay()
    return [usersData.devUser, ...usersData.sampleUsers] as User[]
  }

  // Athlete Profiles
  static async getAthleteProfile(userId: string): Promise<AthleteProfile | null> {
    await simulateDelay()
    
    if (userId === 'dev-user-1') {
      return athleteProfilesData.devUserProfile as AthleteProfile
    }
    
    return null
  }

  static async updateAthleteProfile(userId: string, updates: Partial<AthleteProfile>): Promise<AthleteProfile> {
    await simulateDelay()
    
    const current = await this.getAthleteProfile(userId)
    if (!current) {
      throw new Error('Profile not found')
    }
    
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() }
    // In real app, would persist to backend
    return updated
  }

  // Benchmark Sends
  static async getBenchmarkSends(userId: string): Promise<BenchmarkSend[]> {
    await simulateDelay()
    
    const cacheKey = `benchmark-sends-${userId}`
    if (dataCache.has(cacheKey)) {
      return dataCache.get(cacheKey)
    }
    
    if (userId === 'dev-user-1') {
      const sends = benchmarkSendsData.devUserSends as BenchmarkSend[]
      dataCache.set(cacheKey, sends)
      return sends
    }
    
    return []
  }

  static async addBenchmarkSend(send: Omit<BenchmarkSend, 'id' | 'createdAt'>): Promise<BenchmarkSend> {
    await simulateDelay()
    
    const newSend: BenchmarkSend = {
      ...send,
      id: `send-${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    
    // Update cache
    const cacheKey = `benchmark-sends-${send.userId}`
    const currentSends = dataCache.get(cacheKey) || []
    dataCache.set(cacheKey, [newSend, ...currentSends])
    
    return newSend
  }

  static async updateBenchmarkSend(id: string, updates: Partial<BenchmarkSend>): Promise<BenchmarkSend> {
    await simulateDelay()
    
    // In real implementation, would update backend and cache
    const updated = { ...updates, id } as BenchmarkSend
    return updated
  }

  static async deleteBenchmarkSend(id: string, userId: string): Promise<void> {
    await simulateDelay()
    
    const cacheKey = `benchmark-sends-${userId}`
    const currentSends = dataCache.get(cacheKey) || []
    const filtered = currentSends.filter((send: BenchmarkSend) => send.id !== id)
    dataCache.set(cacheKey, filtered)
  }

  // Nutrition Data
  static async getNutritionUserProfile(userId: string) {
    await simulateDelay()
    
    if (userId === 'dev-user-1') {
      return nutritionUserProfilesData.devUserProfile as unknown as import('@/types').UserNutritionProfile
    }
    
    return null
  }

  static async getProteinSources() {
    await simulateDelay(50)
    return proteinSourcesData.proteinSources
  }

  static async getSupplements() {
    await simulateDelay(50)
    return [
      ...supplementsData.coreSupplements,
      ...supplementsData.conditionalSupplements
    ]
  }

  static async getMealTemplates() {
    await simulateDelay(50)
    return mealTemplatesData
  }

  static async getAiInsights(userId: string) {
    await simulateDelay()
    
    const cacheKey = `ai-insights-${userId}`
    if (dataCache.has(cacheKey)) {
      return dataCache.get(cacheKey)
    }
    
    // Return default insights for now
    const insights = aiInsightsData.defaultInsights
    dataCache.set(cacheKey, insights)
    return insights
  }

  static async addAiInsight(userId: string, insight: string) {
    await simulateDelay()
    
    const cacheKey = `ai-insights-${userId}`
    const currentInsights = dataCache.get(cacheKey) || []
    const updated = [insight, ...currentInsights.slice(0, 4)] // Keep last 5
    dataCache.set(cacheKey, updated)
    return updated
  }

  static async getMealPlanOptions() {
    await simulateDelay(50)
    return mealPlanOptionsData.mealPlanOptions
  }

  // Training Data
  static async getTrainingPlan(userId: string): Promise<TrainingPlan | null> {
    await simulateDelay()
    
    if (userId === 'dev-user-1') {
      const plan = trainingPlansData.devUserPlan
      return {
        ...plan,
        endDate: plan.startDate, // Add missing endDate field
        active: true,
        createdAt: plan.startDate
      } as TrainingPlan
    }
    
    return null
  }

  static async getExercises() {
    await simulateDelay()
    return exercisesData
  }

  // Journal Entries
  static async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    await simulateDelay()
    
    const cacheKey = `journal-entries-${userId}`
    if (dataCache.has(cacheKey)) {
      return dataCache.get(cacheKey)
    }
    
    if (userId === 'dev-user-1') {
      const entries = journalEntriesData.devUserEntries.map((entry: any) => ({
        ...entry,
        physicalCondition: {
          ...entry.physicalCondition,
          soreness: Object.fromEntries(
            Object.entries(entry.physicalCondition.soreness)
              .filter(([_, value]) => value !== undefined)
              .map(([key, value]) => [key, value as number])
          )
        }
      })) as JournalEntry[]
      dataCache.set(cacheKey, entries)
      return entries
    }
    
    return []
  }

  static async addJournalEntry(entry: Omit<JournalEntry, 'id' | 'createdAt'>): Promise<JournalEntry> {
    await simulateDelay()
    
    const newEntry: JournalEntry = {
      ...entry,
      id: `entry-${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    
    const cacheKey = `journal-entries-${entry.userId}`
    const currentEntries = dataCache.get(cacheKey) || []
    dataCache.set(cacheKey, [newEntry, ...currentEntries])
    
    return newEntry
  }

  // Dashboard Stats
  static async getDashboardStats(userId: string) {
    await simulateDelay()
    
    if (userId === 'dev-user-1') {
      return dashboardStatsData.devUserStats
    }
    
    return dashboardStatsData.defaultStats.newUser
  }

  // Chat/AI Responses
  static async getChatResponseTemplates() {
    await simulateDelay(50)
    return chatResponsesData
  }

  // Nutrition Logs
  static async getNutritionLogs(userId: string, dateRange?: { start: string, end: string }): Promise<NutritionLog[]> {
    await simulateDelay()
    
    const cacheKey = `nutrition-logs-${userId}`
    if (dataCache.has(cacheKey)) {
      let logs = dataCache.get(cacheKey)
      
      if (dateRange) {
        logs = logs.filter((log: NutritionLog) => 
          log.date >= dateRange.start && log.date <= dateRange.end
        )
      }
      
      return logs
    }
    
    return []
  }

  static async saveNutritionLog(log: NutritionLog): Promise<NutritionLog> {
    await simulateDelay()
    
    const cacheKey = `nutrition-logs-${log.userId}`
    const currentLogs = dataCache.get(cacheKey) || []
    
    // Update existing log for the date or add new one
    const existingIndex = currentLogs.findIndex((l: NutritionLog) => l.date === log.date)
    
    if (existingIndex >= 0) {
      currentLogs[existingIndex] = log
    } else {
      currentLogs.unshift(log)
    }
    
    dataCache.set(cacheKey, currentLogs)
    return log
  }

  // Utility Methods
  static clearCache(): void {
    dataCache.clear()
  }

  static getCacheStats() {
    return {
      size: dataCache['cache'].size,
      keys: Array.from(dataCache['cache'].keys())
    }
  }
}

export default DataService