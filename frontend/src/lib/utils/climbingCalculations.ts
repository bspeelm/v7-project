/**
 * Climbing-specific calculation utilities
 * Grade conversions, progress tracking, training load calculations
 */

interface GradeConversion {
  vScale: number | null
  yds: string | null
  french: string | null
  numericValue: number
}

interface ProgressMetrics {
  currentLevel: number
  targetLevel: number
  progressPercentage: number
  estimatedDaysToTarget: number
  weeklyProgressRate: number
}

interface TrainingLoad {
  volume: number      // Total climbing time
  intensity: number   // Average grade difficulty
  density: number     // Sessions per week
  load: number        // Combined metric
}

// Grade conversion tables
const V_SCALE_TO_YDS: { [key: number]: string } = {
  0: '5.10a',
  1: '5.10b',
  2: '5.10c',
  3: '5.10d',
  4: '5.11a',
  5: '5.11b',
  6: '5.11c',
  7: '5.11d',
  8: '5.12a',
  9: '5.12b',
  10: '5.12c',
  11: '5.12d',
  12: '5.13a',
  13: '5.13b',
  14: '5.13c',
  15: '5.13d',
  16: '5.14a',
  17: '5.14b'
}

const YDS_TO_V_SCALE: { [key: string]: number } = {
  '5.10a': 0, '5.10b': 1, '5.10c': 2, '5.10d': 3,
  '5.11a': 4, '5.11b': 5, '5.11c': 6, '5.11d': 7,
  '5.12a': 8, '5.12b': 9, '5.12c': 10, '5.12d': 11,
  '5.13a': 12, '5.13b': 13, '5.13c': 14, '5.13d': 15,
  '5.14a': 16, '5.14b': 17, '5.14c': 18, '5.14d': 19
}

/**
 * Parse grade string and return standardized format with numeric value
 */
export function parseGrade(gradeInput: string): {
  grade: string
  gradeNumeric: number
  gradeType: 'v-scale' | 'yds'
} {
  const cleanGrade = gradeInput.trim().toUpperCase()
  
  // V-Scale parsing
  const vMatch = cleanGrade.match(/^V(\d+)/)
  if (vMatch) {
    const vNumber = parseInt(vMatch[1])
    return {
      grade: `V${vNumber}`,
      gradeNumeric: vNumber,
      gradeType: 'v-scale'
    }
  }
  
  // YDS parsing
  const ydsMatch = cleanGrade.match(/^5\.(\d+)([A-D]?)/)
  if (ydsMatch) {
    const baseNumber = parseInt(ydsMatch[1])
    const letter = ydsMatch[2] || ''
    
    // Convert to numeric: 5.10a = 100, 5.10b = 101, etc.
    let numeric = baseNumber * 10
    if (letter) {
      numeric += letter.charCodeAt(0) - 'A'.charCodeAt(0)
    }
    
    const displayGrade = letter ? `5.${baseNumber}${letter.toLowerCase()}` : `5.${baseNumber}`
    
    return {
      grade: displayGrade,
      gradeNumeric: numeric,
      gradeType: 'yds'
    }
  }
  
  // Fallback
  return {
    grade: gradeInput,
    gradeNumeric: 0,
    gradeType: 'v-scale'
  }
}

/**
 * Convert between climbing grade systems
 */
export function convertGrade(grade: string, targetSystem: 'v-scale' | 'yds'): string | null {
  const parsed = parseGrade(grade)
  
  if (parsed.gradeType === targetSystem) {
    return parsed.grade
  }
  
  if (parsed.gradeType === 'v-scale' && targetSystem === 'yds') {
    return V_SCALE_TO_YDS[parsed.gradeNumeric] || null
  }
  
  if (parsed.gradeType === 'yds' && targetSystem === 'v-scale') {
    const vGrade = YDS_TO_V_SCALE[parsed.grade]
    return vGrade !== undefined ? `V${vGrade}` : null
  }
  
  return null
}

/**
 * Calculate comprehensive grade conversion
 */
export function getGradeConversions(grade: string): GradeConversion {
  const parsed = parseGrade(grade)
  
  let vScale: number | null = null
  let yds: string | null = null
  
  if (parsed.gradeType === 'v-scale') {
    vScale = parsed.gradeNumeric
    yds = convertGrade(grade, 'yds')
  } else {
    yds = parsed.grade
    const vGradeStr = convertGrade(grade, 'v-scale')
    vScale = vGradeStr ? parseInt(vGradeStr.replace('V', '')) : null
  }
  
  // French grades (simplified conversion)
  let french: string | null = null
  if (vScale !== null) {
    const frenchGrades = ['4', '4+', '5', '5+', '6A', '6A+', '6B', '6B+', '6C', '6C+', '7A', '7A+', '7B', '7B+', '7C', '7C+', '8A', '8A+']
    french = frenchGrades[vScale] || null
  }
  
  return {
    vScale,
    yds,
    french,
    numericValue: parsed.gradeNumeric
  }
}

/**
 * Calculate climbing progress metrics
 */
export function calculateProgressMetrics(
  currentGrade: string,
  targetGrade: string,
  historicalSends: Array<{ grade: string, date: string }>
): ProgressMetrics {
  const current = parseGrade(currentGrade)
  const target = parseGrade(targetGrade)
  
  // Ensure same grade system for comparison
  let currentLevel = current.gradeNumeric
  let targetLevel = target.gradeNumeric
  
  if (current.gradeType !== target.gradeType) {
    // Convert to common system (V-scale)
    if (current.gradeType === 'yds') {
      const converted = convertGrade(currentGrade, 'v-scale')
      currentLevel = converted ? parseInt(converted.replace('V', '')) : 0
    }
    if (target.gradeType === 'yds') {
      const converted = convertGrade(targetGrade, 'v-scale')
      targetLevel = converted ? parseInt(converted.replace('V', '')) : 0
    }
  }
  
  // Calculate progress percentage
  const progressPercentage = targetLevel > currentLevel 
    ? Math.min((currentLevel / targetLevel) * 100, 100)
    : 100
  
  // Calculate weekly progress rate from historical data
  const recentSends = historicalSends
    .map(send => ({ ...send, parsed: parseGrade(send.grade) }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10) // Last 10 sends
  
  let weeklyProgressRate = 0
  if (recentSends.length >= 2) {
    const oldestSend = recentSends[recentSends.length - 1]
    const newestSend = recentSends[0]
    const timeDiff = new Date(newestSend.date).getTime() - new Date(oldestSend.date).getTime()
    const weeksDiff = timeDiff / (1000 * 60 * 60 * 24 * 7)
    const gradeDiff = newestSend.parsed.gradeNumeric - oldestSend.parsed.gradeNumeric
    
    weeklyProgressRate = weeksDiff > 0 ? gradeDiff / weeksDiff : 0
  }
  
  // Estimate days to target
  const gradeGap = targetLevel - currentLevel
  const estimatedDaysToTarget = weeklyProgressRate > 0 
    ? Math.round((gradeGap / weeklyProgressRate) * 7)
    : 365 // Default to 1 year if no progress trend
  
  return {
    currentLevel,
    targetLevel,
    progressPercentage: Math.round(progressPercentage * 10) / 10,
    estimatedDaysToTarget: Math.max(0, estimatedDaysToTarget),
    weeklyProgressRate: Math.round(weeklyProgressRate * 100) / 100
  }
}

/**
 * Calculate training load based on session data
 */
export function calculateTrainingLoad(
  sessions: Array<{
    date: string
    duration: number
    gradesAttempted: string[]
    sessionType: string
  }>,
  weeksPeriod: number = 4
): TrainingLoad {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - (weeksPeriod * 7))
  
  const recentSessions = sessions.filter(session => 
    new Date(session.date) >= cutoffDate && session.sessionType !== 'rest'
  )
  
  if (recentSessions.length === 0) {
    return { volume: 0, intensity: 0, density: 0, load: 0 }
  }
  
  // Volume: Total training time per week
  const totalMinutes = recentSessions.reduce((sum, session) => sum + session.duration, 0)
  const volume = totalMinutes / weeksPeriod
  
  // Intensity: Average grade difficulty
  const allGrades = recentSessions.flatMap(session => session.gradesAttempted)
  const avgGradeNumeric = allGrades.length > 0 
    ? allGrades.reduce((sum, grade) => sum + parseGrade(grade).gradeNumeric, 0) / allGrades.length
    : 0
  const intensity = avgGradeNumeric
  
  // Density: Sessions per week
  const density = recentSessions.length / weeksPeriod
  
  // Combined load metric (normalized)
  const normalizedVolume = Math.min(volume / 300, 1) // Cap at 5 hours per week
  const normalizedIntensity = Math.min(intensity / 10, 1) // Cap at V10
  const normalizedDensity = Math.min(density / 5, 1) // Cap at 5 sessions per week
  
  const load = (normalizedVolume + normalizedIntensity + normalizedDensity) / 3 * 100
  
  return {
    volume: Math.round(volume),
    intensity: Math.round(intensity * 10) / 10,
    density: Math.round(density * 10) / 10,
    load: Math.round(load)
  }
}

/**
 * Calculate success rate for recent attempts
 */
export function calculateSuccessRate(
  journalEntries: Array<{
    gradesAttempted: string[]
    gradesCompleted: string[]
    date: string
  }>,
  daysPeriod: number = 30
): number {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysPeriod)
  
  const recentEntries = journalEntries.filter(entry => 
    new Date(entry.date) >= cutoffDate
  )
  
  const totalAttempted = recentEntries.reduce((sum, entry) => 
    sum + entry.gradesAttempted.length, 0
  )
  
  const totalCompleted = recentEntries.reduce((sum, entry) => 
    sum + entry.gradesCompleted.length, 0
  )
  
  return totalAttempted > 0 ? Math.round((totalCompleted / totalAttempted) * 100) : 0
}

/**
 * Analyze climbing style performance
 */
export function analyzeStylePerformance(
  benchmarkSends: Array<{
    grade: string
    style: 'slab' | 'vertical' | 'overhang' | 'roof'
    significance: string
  }>
): { [style: string]: { averageGrade: number, count: number, bestGrade: string } } {
  const styles = ['slab', 'vertical', 'overhang', 'roof']
  const analysis: { [style: string]: { averageGrade: number, count: number, bestGrade: string } } = {}
  
  styles.forEach(style => {
    const styleSends = benchmarkSends.filter(send => send.style === style)
    
    if (styleSends.length === 0) {
      analysis[style] = { averageGrade: 0, count: 0, bestGrade: 'N/A' }
      return
    }
    
    const grades = styleSends.map(send => parseGrade(send.grade).gradeNumeric)
    const averageGrade = grades.reduce((sum, grade) => sum + grade, 0) / grades.length
    const bestGradeNumeric = Math.max(...grades)
    const bestGrade = `V${bestGradeNumeric}`
    
    analysis[style] = {
      averageGrade: Math.round(averageGrade * 10) / 10,
      count: styleSends.length,
      bestGrade
    }
  })
  
  return analysis
}

/**
 * Generate training recommendations based on performance analysis
 */
export function generateTrainingRecommendations(
  targetGrade: string,
  styleAnalysis: { [style: string]: { averageGrade: number, count: number, bestGrade: string } },
  trainingLoad: TrainingLoad
): string[] {
  const recommendations: string[] = []
  const target = parseGrade(targetGrade)
  
  // Analyze weakest style
  const styles = Object.entries(styleAnalysis)
    .filter(([_, data]) => data.count > 0)
    .sort((a, b) => a[1].averageGrade - b[1].averageGrade)
  
  if (styles.length > 0) {
    const weakestStyle = styles[0][0]
    const strongestStyle = styles[styles.length - 1][0]
    const gap = styles[styles.length - 1][1].averageGrade - styles[0][1].averageGrade
    
    if (gap > 1.5) {
      recommendations.push(`Focus on ${weakestStyle} climbing - it's ${gap.toFixed(1)} grades behind your ${strongestStyle}`)
    }
  }
  
  // Training load recommendations
  if (trainingLoad.load < 30) {
    recommendations.push('Consider increasing training frequency or session length')
  } else if (trainingLoad.load > 80) {
    recommendations.push('High training load detected - ensure adequate recovery')
  }
  
  if (trainingLoad.intensity < target.gradeNumeric - 2) {
    recommendations.push('Gradually increase the difficulty of problems you attempt')
  }
  
  // Specific recommendations for V7 goal
  if (target.gradeNumeric >= 7) {
    recommendations.push('Focus on power development - campus board and limit bouldering')
    recommendations.push('Core tension work is crucial for V7+ overhangs')
    recommendations.push('Practice reading complex sequences before attempting')
  }
  
  return recommendations
}

export default {
  parseGrade,
  convertGrade,
  getGradeConversions,
  calculateProgressMetrics,
  calculateTrainingLoad,
  calculateSuccessRate,
  analyzeStylePerformance,
  generateTrainingRecommendations
}