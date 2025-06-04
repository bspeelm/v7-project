/**
 * Nutrition Calculation Utilities
 * Contains all computational functions for nutrition targets, analysis, and insights
 */

interface UserNutritionProfile {
  currentWeight: number // lbs
  targetWeight: number
  height: number // inches
  age: number
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active'
  goal: 'maintain' | 'cut' | 'bulk' | 'recomp'
  dietaryRestrictions: string[]
}

interface NutritionTargets {
  calories: number
  protein: number
  carbs: number
  fat: number
  hydration: number // ml per day
}

interface MacroDistribution {
  protein: number
  carbs: number
  fat: number
}

// Activity multipliers for BMR calculation
const ACTIVITY_MULTIPLIERS = {
  'sedentary': 1.2,     // Little to no exercise
  'light': 1.375,      // Light exercise 1-3 days per week
  'moderate': 1.55,    // Moderate exercise 3-5 days per week
  'active': 1.725,     // Heavy exercise 6-7 days per week
  'very-active': 1.9   // Very heavy exercise, training 2x/day
}

// Goal adjustments for calories and protein
const GOAL_ADJUSTMENTS = {
  'maintain': { calorieMultiplier: 1.0, proteinMultiplier: 1.0 },
  'cut': { calorieMultiplier: 0.8, proteinMultiplier: 1.2 },
  'bulk': { calorieMultiplier: 1.1, proteinMultiplier: 1.0 },
  'recomp': { calorieMultiplier: 0.95, proteinMultiplier: 1.1 }
}

/**
 * Calculate BMR using Mifflin-St Jeor Equation
 * More accurate than Harris-Benedict for most people
 */
export function calculateBMR(weight: number, height: number, age: number, sex: 'male' | 'female' = 'male'): number {
  const weightKg = weight * 0.453592 // Convert lbs to kg
  const heightCm = height * 2.54     // Convert inches to cm
  
  // Mifflin-St Jeor Equation
  let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age)
  
  // Sex adjustment
  bmr += sex === 'male' ? 5 : -161
  
  return Math.round(bmr)
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 */
export function calculateTDEE(bmr: number, activityLevel: keyof typeof ACTIVITY_MULTIPLIERS): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel]
  return Math.round(bmr * multiplier)
}

/**
 * Calculate comprehensive nutrition targets based on user profile
 */
export function calculateNutritionTargets(profile: UserNutritionProfile): NutritionTargets {
  // Calculate BMR and TDEE
  const bmr = calculateBMR(profile.currentWeight, profile.height, profile.age)
  let tdee = calculateTDEE(bmr, profile.activityLevel)
  
  // Apply goal adjustments
  const goalAdjustment = GOAL_ADJUSTMENTS[profile.goal]
  tdee = Math.round(tdee * goalAdjustment.calorieMultiplier)
  
  // Calculate protein needs (g per lb bodyweight)
  const proteinPerLb = profile.goal === 'cut' ? 1.2 : 
                      profile.goal === 'bulk' ? 0.8 :
                      profile.goal === 'recomp' ? 1.1 : 1.0
  
  const baseProtein = profile.currentWeight * proteinPerLb
  const protein = Math.round(baseProtein * goalAdjustment.proteinMultiplier)
  
  // Calculate fat (25-30% of calories for climbing performance)
  const fatPercentage = profile.goal === 'cut' ? 0.25 : 0.30
  const fat = Math.round((tdee * fatPercentage) / 9)
  
  // Calculate carbs (remaining calories)
  const proteinCalories = protein * 4
  const fatCalories = fat * 9
  const remainingCalories = tdee - proteinCalories - fatCalories
  const carbs = Math.round(remainingCalories / 4)
  
  // Calculate hydration (30ml per lb bodyweight + 500ml base)
  const hydration = Math.round((profile.currentWeight * 30) + 500)
  
  return {
    calories: tdee,
    protein,
    carbs,
    fat,
    hydration
  }
}

/**
 * Calculate macro distribution percentages
 */
export function calculateMacroDistribution(targets: NutritionTargets): MacroDistribution {
  const totalCalories = targets.calories
  
  return {
    protein: Math.round((targets.protein * 4) / totalCalories * 100),
    carbs: Math.round((targets.carbs * 4) / totalCalories * 100),
    fat: Math.round((targets.fat * 9) / totalCalories * 100)
  }
}

/**
 * Calculate protein efficiency (calories per gram of protein)
 */
export function calculateProteinEfficiency(protein: number, calories: number): number {
  if (protein === 0) return Infinity
  return Math.round((calories / protein) * 10) / 10
}

/**
 * Categorize protein efficiency
 */
export function categorizeProteinEfficiency(efficiency: number): {
  tier: string
  color: string
  label: string
} {
  if (efficiency < 5) return { tier: 'excellent', color: 'green', label: 'Excellent' }
  if (efficiency < 6) return { tier: 'very-good', color: 'blue', label: 'Very Good' }
  if (efficiency < 8) return { tier: 'good', color: 'yellow', label: 'Good' }
  if (efficiency < 10) return { tier: 'moderate', color: 'orange', label: 'Moderate' }
  return { tier: 'avoid', color: 'red', label: 'Avoid When Cutting' }
}

/**
 * Calculate weekly nutrition averages
 */
export function calculateWeeklyAverages(logs: Array<{
  totalCalories: number
  macros: { protein: number, carbs: number, fat: number }
}>): {
  calories: number
  protein: number
  carbs: number
  fat: number
  days: number
} {
  if (logs.length === 0) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0, days: 0 }
  }
  
  const totals = logs.reduce((acc, log) => ({
    calories: acc.calories + log.totalCalories,
    protein: acc.protein + log.macros.protein,
    carbs: acc.carbs + log.macros.carbs,
    fat: acc.fat + log.macros.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
  
  const days = logs.length
  
  return {
    calories: Math.round(totals.calories / days),
    protein: Math.round(totals.protein / days),
    carbs: Math.round(totals.carbs / days),
    fat: Math.round(totals.fat / days),
    days
  }
}

/**
 * Generate nutrition insights based on current intake vs targets
 */
export function generateNutritionInsights(
  current: { calories: number, protein: number, carbs: number, fat: number },
  targets: NutritionTargets,
  profile: UserNutritionProfile
): string[] {
  const insights: string[] = []
  
  // Protein analysis
  const proteinRatio = current.protein / targets.protein
  if (proteinRatio < 0.8) {
    const deficit = Math.round(targets.protein - current.protein)
    insights.push(`Protein deficit: Currently ${current.protein}g vs ${targets.protein}g target (-${deficit}g)`)
  } else if (proteinRatio > 1.3) {
    insights.push(`High protein intake detected. Consider if ${current.protein}g is necessary.`)
  }
  
  // Calorie analysis
  const calorieRatio = current.calories / targets.calories
  if (calorieRatio < 0.7) {
    insights.push(`Calorie intake appears low for your activity level (${current.calories} vs ${targets.calories} target)`)
  } else if (calorieRatio > 1.2 && profile.goal === 'cut') {
    insights.push(`Calorie intake high for weight loss goal (${current.calories} vs ${targets.calories} target)`)
  }
  
  // Vegetarian-specific insights
  if (profile.dietaryRestrictions.includes('vegetarian')) {
    if (proteinRatio < 0.9) {
      insights.push('Focus on combining incomplete proteins (rice + beans, hummus + pita) for complete amino acid profiles')
    }
    insights.push('Monitor B12 and iron levels - consider fortified foods or supplements')
  }
  
  // Goal-specific insights
  if (profile.goal === 'cut' && proteinRatio > 1.0 && calorieRatio < 0.9) {
    insights.push('Good protein prioritization for muscle preservation during weight loss')
  }
  
  if (profile.goal === 'bulk' && calorieRatio < 1.05) {
    insights.push('Consider increasing calorie intake for effective muscle gain')
  }
  
  return insights
}

/**
 * Calculate optimal meal timing for climbing performance
 */
export function calculateMealTiming(workoutTime: string): {
  preWorkout: { time: string, focus: string[] }
  postWorkout: { time: string, focus: string[] }
  recommendations: string[]
} {
  const workout = new Date(`2025-01-01 ${workoutTime}`)
  
  // Pre-workout meal (2-3 hours before)
  const preTime = new Date(workout.getTime() - 2.5 * 60 * 60 * 1000)
  
  // Post-workout meal (within 30-60 minutes)
  const postTime = new Date(workout.getTime() + 45 * 60 * 1000)
  
  return {
    preWorkout: {
      time: preTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      focus: ['Complex carbohydrates', 'Moderate protein', 'Low fat', 'Easy to digest']
    },
    postWorkout: {
      time: postTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      focus: ['Fast protein (20-25g)', 'Simple carbohydrates', 'Rehydration']
    },
    recommendations: [
      'Avoid high fat/fiber foods 2 hours before climbing',
      'Hydrate well throughout the day, not just during exercise',
      'Post-workout nutrition window is most important within 60 minutes'
    ]
  }
}

/**
 * Calculate supplement priorities based on nutrition profile and current intake
 */
export function calculateSupplementPriorities(
  profile: UserNutritionProfile,
  currentIntake: { protein: number, calories: number },
  targets: NutritionTargets
): Array<{ supplement: string, priority: 'high' | 'medium' | 'low', reason: string }> {
  const priorities = []
  
  // Protein powder priority
  const proteinRatio = currentIntake.protein / targets.protein
  if (proteinRatio < 0.8) {
    priorities.push({
      supplement: 'Protein Powder',
      priority: 'high' as const,
      reason: `Only getting ${Math.round(proteinRatio * 100)}% of protein target`
    })
  }
  
  // Vegetarian-specific supplements
  if (profile.dietaryRestrictions.includes('vegetarian')) {
    priorities.push({
      supplement: 'B-Complex (with B12)',
      priority: 'high' as const,
      reason: 'Essential for vegetarians due to B12 deficiency risk'
    })
    
    priorities.push({
      supplement: 'Iron (with Vitamin C)',
      priority: 'medium' as const,
      reason: 'Plant-based iron is less bioavailable'
    })
  }
  
  // Weight loss specific
  if (profile.goal === 'cut') {
    priorities.push({
      supplement: 'Vitamin D3',
      priority: 'high' as const,
      reason: 'Important for maintaining metabolism during calorie restriction'
    })
  }
  
  // High activity level
  if (profile.activityLevel === 'very-active') {
    priorities.push({
      supplement: 'Creatine',
      priority: 'high' as const,
      reason: 'Significant strength and power benefits for high-volume training'
    })
    
    priorities.push({
      supplement: 'Magnesium',
      priority: 'medium' as const,
      reason: 'Important for muscle function and recovery with high training load'
    })
  }
  
  return priorities.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

export default {
  calculateBMR,
  calculateTDEE,
  calculateNutritionTargets,
  calculateMacroDistribution,
  calculateProteinEfficiency,
  categorizeProteinEfficiency,
  calculateWeeklyAverages,
  generateNutritionInsights,
  calculateMealTiming,
  calculateSupplementPriorities
}