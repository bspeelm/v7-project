/**
 * API Utilities for HTTP requests and backend communication
 * Centralized HTTP client with error handling, retry logic, and type safety
 */

// API Configuration
const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
}

// Response types
interface ApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
  error?: string
}


// HTTP Methods
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// Request configuration
interface RequestConfig {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: any
  timeout?: number
  retries?: number
  authRequired?: boolean
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  public status?: number
  public code?: string
  public details?: any

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

/**
 * HTTP Client class with retry logic and error handling
 */
export class HttpClient {
  private baseUrl: string
  private timeout: number
  private defaultHeaders: Record<string, string>

  constructor(baseUrl?: string, timeout?: number) {
    this.baseUrl = baseUrl || API_CONFIG.baseUrl
    this.timeout = timeout || API_CONFIG.timeout
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }

  /**
   * Get authentication token from storage
   */
  private getAuthToken(): string | null {
    try {
      const authData = localStorage.getItem('auth-storage')
      if (authData) {
        const parsed = JSON.parse(authData)
        return parsed.state?.token || null
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error)
    }
    return null
  }

  /**
   * Build headers for request
   */
  private buildHeaders(config: RequestConfig): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...config.headers }
    
    if (config.authRequired) {
      const token = this.getAuthToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    return headers
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Make HTTP request with retry logic
   */
  async request<T = any>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      timeout = this.timeout,
      retries = API_CONFIG.retryAttempts,
      authRequired = false
    } = config

    const url = `${this.baseUrl}${endpoint}`
    const headers = this.buildHeaders({ ...config, authRequired })

    const requestOptions: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(timeout),
    }

    if (body && method !== 'GET') {
      requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body)
    }

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions)
        
        if (!response.ok) {
          const errorText = await response.text()
          let errorData: any = {}
          
          try {
            errorData = JSON.parse(errorText)
          } catch {
            errorData = { message: errorText }
          }

          throw new ApiError(
            errorData.message || `HTTP ${response.status}`,
            response.status,
            errorData.code,
            errorData.details
          )
        }

        const responseData = await response.json()
        return {
          data: responseData.data || responseData,
          success: true,
          message: responseData.message
        }

      } catch (error) {
        lastError = error as Error
        
        // Don't retry on certain errors
        if (error instanceof ApiError) {
          if (error.status === 401 || error.status === 403 || error.status === 404) {
            throw error
          }
        }

        // Don't retry on the last attempt
        if (attempt === retries) {
          break
        }

        // Wait before retrying
        await this.sleep(API_CONFIG.retryDelay * Math.pow(2, attempt))
      }
    }

    throw lastError || new ApiError('Request failed after retries')
  }

  // Convenience methods
  async get<T = any>(endpoint: string, config: Omit<RequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  async post<T = any>(endpoint: string, body?: any, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body })
  }

  async put<T = any>(endpoint: string, body?: any, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body })
  }

  async patch<T = any>(endpoint: string, body?: any, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body })
  }

  async delete<T = any>(endpoint: string, config: Omit<RequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}

/**
 * Default HTTP client instance
 */
export const httpClient = new HttpClient()

/**
 * API endpoint builders
 */
export const ApiEndpoints = {
  // Authentication
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    profile: '/auth/profile',
  },

  // Users
  users: {
    list: '/users',
    byId: (id: string) => `/users/${id}`,
    profile: (id: string) => `/users/${id}/profile`,
    updateProfile: (id: string) => `/users/${id}/profile`,
  },

  // Journal Entries
  journal: {
    list: (userId: string) => `/users/${userId}/journal`,
    byId: (userId: string, entryId: string) => `/users/${userId}/journal/${entryId}`,
    create: (userId: string) => `/users/${userId}/journal`,
    update: (userId: string, entryId: string) => `/users/${userId}/journal/${entryId}`,
    delete: (userId: string, entryId: string) => `/users/${userId}/journal/${entryId}`,
  },

  // Benchmark Sends
  benchmarks: {
    list: (userId: string) => `/users/${userId}/benchmarks`,
    byId: (userId: string, sendId: string) => `/users/${userId}/benchmarks/${sendId}`,
    create: (userId: string) => `/users/${userId}/benchmarks`,
    update: (userId: string, sendId: string) => `/users/${userId}/benchmarks/${sendId}`,
    delete: (userId: string, sendId: string) => `/users/${userId}/benchmarks/${sendId}`,
  },

  // Nutrition
  nutrition: {
    profile: (userId: string) => `/users/${userId}/nutrition/profile`,
    logs: (userId: string) => `/users/${userId}/nutrition/logs`,
    logByDate: (userId: string, date: string) => `/users/${userId}/nutrition/logs/${date}`,
    proteinSources: '/nutrition/protein-sources',
    supplements: '/nutrition/supplements',
    mealTemplates: '/nutrition/meal-templates',
    insights: (userId: string) => `/users/${userId}/nutrition/insights`,
    mealPlans: '/nutrition/meal-plans',
  },

  // Training
  training: {
    plans: (userId: string) => `/users/${userId}/training/plans`,
    exercises: '/training/exercises',
    sessions: (userId: string) => `/users/${userId}/training/sessions`,
  },

  // Dashboard
  dashboard: {
    stats: (userId: string) => `/users/${userId}/dashboard/stats`,
    metrics: (userId: string) => `/users/${userId}/dashboard/metrics`,
  },

  // Chat/AI
  chat: {
    message: '/chat/message',
    history: (userId: string) => `/users/${userId}/chat/history`,
    insights: (userId: string) => `/users/${userId}/chat/insights`,
  },
}

/**
 * Response type helpers
 */
export type UserResponse = ApiResponse<import('@/types').User>
export type AthleteProfileResponse = ApiResponse<import('@/types').AthleteProfile>
export type JournalEntryResponse = ApiResponse<import('@/types').JournalEntry>
export type JournalEntriesResponse = ApiResponse<import('@/types').JournalEntry[]>
export type BenchmarkSendResponse = ApiResponse<import('@/types').BenchmarkSend>
export type BenchmarkSendsResponse = ApiResponse<import('@/types').BenchmarkSend[]>
export type NutritionLogResponse = ApiResponse<import('@/types').NutritionLog>
export type NutritionLogsResponse = ApiResponse<import('@/types').NutritionLog[]>

/**
 * Utility functions
 */
export const ApiUtils = {
  /**
   * Check if error is a network error
   */
  isNetworkError: (error: Error): boolean => {
    return error.name === 'TypeError' || error.message.includes('fetch')
  },

  /**
   * Check if error is an authentication error
   */
  isAuthError: (error: Error): boolean => {
    return error instanceof ApiError && (error.status === 401 || error.status === 403)
  },

  /**
   * Extract error message from various error types
   */
  getErrorMessage: (error: unknown): string => {
    if (error instanceof ApiError) {
      return error.message
    }
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return 'An unexpected error occurred'
  },

  /**
   * Build query string from object
   */
  buildQueryString: (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })

    const queryString = searchParams.toString()
    return queryString ? `?${queryString}` : ''
  },

  /**
   * Format date for API requests
   */
  formatDate: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toISOString().split('T')[0]
  },
}

export default {
  httpClient,
  ApiEndpoints,
  ApiUtils,
  ApiError,
  HttpClient,
}