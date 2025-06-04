// User and Profile Types
export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  subscription: {
    tier: 'free' | 'pro' | 'premium'
    status: 'active' | 'cancelled' | 'expired'
    expiresAt?: string
  }
  preferences: {
    units: 'metric' | 'imperial'
    timezone: string
  }
}

export interface AthleteProfile {
  userId: string
  age: number
  weight: number
  height: number
  yearsClimbing: number
  currentGrades: {
    indoor: {
      slab: string
      vertical: string
      overhang: string
    }
    outdoor: {
      sport: string
      boulder: string
      trad?: string
    }
  }
  goals: Goal[]
  weaknesses: string[]
  strengths: string[]
  dietaryRestrictions: string[]
  injuryHistory: Injury[]
  updatedAt: string
}

export interface Goal {
  id: string
  grade: string
  targetDate: string
  type: 'boulder' | 'sport' | 'trad'
  description?: string
  completed?: boolean
}

export interface Injury {
  id: string
  type: string
  date: string
  duration: string
  recovered: boolean
  notes?: string
}

// Journal Types
export interface JournalEntry {
  id: string
  userId: string
  date: string
  sessionType: 'training' | 'outdoor' | 'gym' | 'rest'
  duration: number // minutes
  location?: string
  gradesAttempted: string[]
  gradesCompleted: string[]
  physicalCondition: {
    energy: number // 1-10
    soreness: { [key: string]: number }
    injuries: string[]
  }
  technicalFocus: string[]
  mentalState: string
  notes: string
  media?: string[] // S3 URLs
  createdAt: string
}

// Training Types
export interface TrainingPlan {
  id: string
  userId: string
  name: string
  startDate: string
  endDate: string
  weeklyStructure: WeeklyStructure
  goals: string[]
  active: boolean
  createdAt: string
}

export interface WeeklyStructure {
  monday?: SessionPlan
  tuesday?: SessionPlan
  wednesday?: SessionPlan
  thursday?: SessionPlan
  friday?: SessionPlan
  saturday?: SessionPlan
  sunday?: SessionPlan
}

export interface SessionPlan {
  type: 'strength' | 'power' | 'endurance' | 'technique' | 'rest'
  focus: string[]
  duration: number
  intensity: 'low' | 'moderate' | 'high'
  notes?: string
}

// Nutrition Types
export interface NutritionLog {
  userId: string
  date: string
  meals: Meal[]
  totalCalories: number
  macros: {
    protein: number
    carbs: number
    fat: number
  }
  hydration: number // ml
  supplements: string[]
}

export interface Meal {
  id: string
  name: string
  time: string
  calories: number
  protein: number
  carbs: number
  fat: number
  notes?: string
}

// Chat Types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  context?: any
}

// Analytics Types
export interface ProgressMetrics {
  userId: string
  period: string
  metrics: {
    sessionsCompleted: number
    averageGrade: string
    highestGrade: string
    successRate: number
    volumeClimbed: number
    restDays: number
    injuries: number
  }
  trends: {
    gradeProgression: DataPoint[]
    volumeTrend: DataPoint[]
    strengthMetrics: DataPoint[]
  }
}

export interface DataPoint {
  date: string
  value: number
  label?: string
}

// Benchmark Send Types
export interface BenchmarkSend {
  id: string
  userId: string
  grade: string // Display grade (e.g., "V5", "5.12a")
  gradeNumeric: number // Numeric value for sorting (V0=0, V1=1, 5.10a=100, 5.10b=101, etc.)
  gradeType: 'v-scale' | 'yds' // V-scale (bouldering) or YDS (route climbing)
  name: string
  location: string
  date: string
  type: 'indoor' | 'outdoor'
  style: 'slab' | 'vertical' | 'overhang' | 'roof'
  attempts: number
  notes: string
  media?: string[] // S3 URLs
  significance: 'breakthrough' | 'milestone' | 'personal-best' | 'project-send'
  createdAt: string
}