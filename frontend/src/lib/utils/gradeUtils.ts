/**
 * Utility functions for climbing grade parsing and conversion
 */

export interface ParsedGrade {
  grade: string
  gradeNumeric: number
  gradeType: 'v-scale' | 'yds'
}

/**
 * Parse a climbing grade string and return standardized format
 */
export function parseGrade(gradeInput: string): ParsedGrade {
  const cleanGrade = gradeInput.trim().toUpperCase()
  
  // V-Scale (Bouldering): V0, V1, V2, etc.
  const vScaleMatch = cleanGrade.match(/^V(\d+)/)
  if (vScaleMatch) {
    const vNumber = parseInt(vScaleMatch[1])
    return {
      grade: `V${vNumber}`,
      gradeNumeric: vNumber,
      gradeType: 'v-scale'
    }
  }
  
  // YDS (Route climbing): 5.10a, 5.12d, etc.
  const ydsMatch = cleanGrade.match(/^5\.(\d+)([A-D]?)/)
  if (ydsMatch) {
    const baseNumber = parseInt(ydsMatch[1])
    const letter = ydsMatch[2] || ''
    
    // Convert to numeric: 5.10a = 100, 5.10b = 101, 5.10c = 102, 5.10d = 103
    // 5.11a = 110, etc.
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
  
  // Fallback for unrecognized formats
  return {
    grade: gradeInput,
    gradeNumeric: 0,
    gradeType: 'v-scale'
  }
}

/**
 * Convert numeric grade back to display string
 */
export function numericToGrade(numeric: number, type: 'v-scale' | 'yds'): string {
  if (type === 'v-scale') {
    return `V${numeric}`
  } else {
    const baseNumber = Math.floor(numeric / 10)
    const letterIndex = numeric % 10
    const letter = letterIndex > 0 ? String.fromCharCode('a'.charCodeAt(0) + letterIndex) : ''
    return `5.${baseNumber}${letter}`
  }
}

/**
 * Get all possible grades for a given type (for dropdowns)
 */
export function getGradeOptions(type: 'v-scale' | 'yds'): { value: string; label: string }[] {
  if (type === 'v-scale') {
    // V0 through V17
    return Array.from({ length: 18 }, (_, i) => ({
      value: `V${i}`,
      label: `V${i}`
    }))
  } else {
    // 5.1 through 5.15d
    const options: { value: string; label: string }[] = []
    for (let base = 1; base <= 15; base++) {
      if (base <= 9) {
        // 5.1 through 5.9 (no letters)
        options.push({
          value: `5.${base}`,
          label: `5.${base}`
        })
      } else {
        // 5.10+ (with letters)
        for (const letter of ['a', 'b', 'c', 'd']) {
          options.push({
            value: `5.${base}${letter}`,
            label: `5.${base}${letter}`
          })
        }
      }
    }
    return options
  }
}

/**
 * Compare two grades for sorting (higher grade = higher number)
 */
export function compareGrades(a: ParsedGrade, b: ParsedGrade): number {
  // If different types, V-scale generally harder than equivalent YDS
  if (a.gradeType !== b.gradeType) {
    // V5 ≈ 5.12a, so V-scale gets +95 bonus for comparison
    const aNumeric = a.gradeType === 'v-scale' ? a.gradeNumeric + 95 : a.gradeNumeric
    const bNumeric = b.gradeType === 'v-scale' ? b.gradeNumeric + 95 : b.gradeNumeric
    return bNumeric - aNumeric
  }
  
  return b.gradeNumeric - a.gradeNumeric
}