import { create } from 'zustand'
import type { NutritionLog, Meal } from '@/types'

interface NutritionTargets {
  calories: number
  protein: number
  carbs: number
  fat: number
  hydration: number // ml per day
}

interface UserNutritionProfile {
  currentWeight: number // lbs
  targetWeight: number
  height: number // inches
  age: number
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active'
  goal: 'maintain' | 'cut' | 'bulk' | 'recomp'
  dietaryRestrictions: string[]
}

interface NutritionState {
  // User profile and targets
  userProfile: UserNutritionProfile
  targets: NutritionTargets
  
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
  
  // Actions
  updateUserProfile: (profile: Partial<UserNutritionProfile>) => void
  calculateTargets: () => void
  logMeal: (meal: Omit<Meal, 'id'>) => void
  updateMeal: (mealId: string, updates: Partial<Meal>) => void
  deleteMeal: (mealId: string) => void
  setAiMealPlan: (meals: Meal[]) => void
  addAiInsight: (insight: string) => void
  getCurrentDayLog: () => NutritionLog | null
  getWeeklyAverage: () => Partial<NutritionTargets>
}

// Calculate nutrition targets based on user profile
const calculateNutritionTargets = (profile: UserNutritionProfile): NutritionTargets => {
  // Mifflin-St Jeor Equation for BMR
  const bmr = (10 * (profile.currentWeight * 0.453592)) + // Convert lbs to kg
             (6.25 * (profile.height * 2.54)) - // Convert inches to cm
             (5 * profile.age) + 5 // Male adjustment (could be parameterized)
  
  // Activity multipliers
  const activityMultipliers = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725,
    'very-active': 1.9
  }
  
  let tdee = bmr * activityMultipliers[profile.activityLevel]
  
  // Goal adjustments
  if (profile.goal === 'cut') tdee *= 0.8 // 20% deficit
  if (profile.goal === 'bulk') tdee *= 1.1 // 10% surplus
  if (profile.goal === 'recomp') tdee *= 0.95 // Slight deficit
  
  // Macro calculations (optimized for climbing)
  const proteinPerLb = profile.goal === 'cut' ? 1.2 : 1.0 // Higher protein when cutting
  const protein = profile.currentWeight * proteinPerLb
  const fat = tdee * 0.25 / 9 // 25% of calories from fat
  const carbs = (tdee - (protein * 4) - (fat * 9)) / 4 // Remaining calories from carbs
  
  return {
    calories: Math.round(tdee),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
    hydration: Math.round(profile.currentWeight * 30) // 30ml per lb body weight
  }
}

// Mock user profile based on athlete context
const mockUserProfile: UserNutritionProfile = {
  currentWeight: 174,
  targetWeight: 165,
  height: 70, // 5'10"
  age: 42,
  activityLevel: 'very-active',
  goal: 'cut',
  dietaryRestrictions: ['vegetarian']
}

export const useNutritionStore = create<NutritionState>((set, get) => ({
  userProfile: mockUserProfile,
  targets: calculateNutritionTargets(mockUserProfile),
  currentLog: null,
  logs: [],
  aiMealPlan: [],
  aiInsights: [
    "Your protein intake is 60% below target. Focus on adding a protein source to each meal.",
    "Consider timing protein intake around workouts for better recovery.",
    "Your vegetarian diet needs strategic planning - combine legumes with grains for complete proteins."
  ],
  proteinRecommendations: [
    {
      food: "Greek Yogurt (0% fat)",
      efficiency: 5.6,
      protein: 16,
      calories: 90,
      notes: "Excellent post-workout option with casein protein"
    },
    {
      food: "Protein Isolate",
      efficiency: 4.0,
      protein: 25,
      calories: 100,
      notes: "Fastest absorption, ideal for post-workout"
    },
    {
      food: "Orgain Protein Powder",
      efficiency: 7.6,
      protein: 21,
      calories: 160,
      notes: "Plant-based, good for vegetarians but higher calories"
    },
    {
      food: "Tofu (Extra Firm)",
      efficiency: 7.0,
      protein: 10,
      calories: 70,
      notes: "Versatile, complete protein, good for main meals"
    },
    {
      food: "Lentils (cooked)",
      efficiency: 8.5,
      protein: 9,
      calories: 115,
      notes: "High fiber, pair with rice for complete protein"
    },
    {
      food: "Seitan",
      efficiency: 4.8,
      protein: 21,
      calories: 100,
      notes: "Wheat protein, very high protein density"
    }
  ],
  
  updateUserProfile: (profile) => {
    set((state) => {
      const newProfile = { ...state.userProfile, ...profile }
      return {
        userProfile: newProfile,
        targets: calculateNutritionTargets(newProfile)
      }
    })
  },
  
  calculateTargets: () => {
    const { userProfile } = get()
    set({ targets: calculateNutritionTargets(userProfile) })
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
  
  addAiInsight: (insight) => {
    set((state) => ({
      aiInsights: [insight, ...state.aiInsights.slice(0, 4)] // Keep last 5 insights
    }))
  },
  
  getCurrentDayLog: () => {
    const today = new Date().toISOString().split('T')[0]
    return get().logs.find(log => log.date === today) || null
  },
  
  getWeeklyAverage: () => {
    const { logs } = get()
    const lastWeekLogs = logs.slice(-7)
    
    if (lastWeekLogs.length === 0) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 }
    }
    
    const totals = lastWeekLogs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.totalCalories,
        protein: acc.protein + log.macros.protein,
        carbs: acc.carbs + log.macros.carbs,
        fat: acc.fat + log.macros.fat
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
    
    return {
      calories: Math.round(totals.calories / lastWeekLogs.length),
      protein: Math.round(totals.protein / lastWeekLogs.length),
      carbs: Math.round(totals.carbs / lastWeekLogs.length),
      fat: Math.round(totals.fat / lastWeekLogs.length)
    }
  }
}))