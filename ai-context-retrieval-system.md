# AI Context Retrieval System

## Overview

This document outlines the dynamic context retrieval system that aggregates relevant user data to provide personalized AI coaching responses. The system prioritizes recent data while maintaining historical context for pattern recognition.

## Context Aggregation Strategy

### Data Prioritization Matrix
```javascript
const CONTEXT_WEIGHTS = {
  // Recent activity (higher weight)
  last7Days: {
    journalEntries: 1.0,
    benchmarkSends: 1.0,
    nutritionLogs: 0.9,
    weight: 3.0
  },
  
  // Medium-term trends
  last30Days: {
    journalEntries: 0.8,
    benchmarkSends: 0.9,
    nutritionLogs: 0.7,
    weight: 2.0
  },
  
  // Background context
  last90Days: {
    journalEntries: 0.5,
    benchmarkSends: 0.7,
    nutritionLogs: 0.4,
    weight: 1.0
  },
  
  // Static profile data
  profile: {
    goals: 1.0,
    weaknesses: 0.9,
    strengths: 0.8,
    injuries: 0.9,
    weight: 2.5
  }
};
```

### Context Categories

#### 1. Performance Context
```javascript
const gatherPerformanceContext = async (userId, timeframe) => {
  const [journalEntries, benchmarkSends] = await Promise.all([
    getJournalEntries(userId, timeframe),
    getBenchmarkSends(userId, timeframe)
  ]);
  
  return {
    sessionFrequency: calculateSessionFrequency(journalEntries),
    gradeProgression: analyzeGradeProgression(benchmarkSends),
    successRate: calculateSuccessRate(journalEntries),
    consistencyScore: calculateConsistency(journalEntries),
    recentBreakthroughs: identifyBreakthroughs(benchmarkSends),
    plateauIndicators: detectPlateaus(journalEntries, benchmarkSends),
    
    // Patterns
    bestPerformanceDays: identifyBestDays(journalEntries),
    energyPatterns: analyzeEnergyLevels(journalEntries),
    technicalFocusAreas: aggregateTechnicalFocus(journalEntries)
  };
};
```

#### 2. Physical Condition Context
```javascript
const gatherPhysicalContext = async (userId, timeframe) => {
  const journalEntries = await getJournalEntries(userId, timeframe);
  
  return {
    currentInjuries: getCurrentInjuries(journalEntries),
    sorenessPatterns: analyzeSorenessPatterns(journalEntries),
    recoveryTrends: assessRecoveryTrends(journalEntries),
    energyTrends: analyzeEnergyTrends(journalEntries),
    
    // Risk indicators
    overtrainingRisk: assessOvertrainingRisk(journalEntries),
    injuryRisk: calculateInjuryRisk(journalEntries),
    
    // Recommendations
    restDayRecommendations: calculateRestNeeds(journalEntries),
    intensityAdjustments: recommendIntensityChanges(journalEntries)
  };
};
```

#### 3. Nutrition Context
```javascript
const gatherNutritionContext = async (userId, timeframe) => {
  const [nutritionLogs, nutritionProfile] = await Promise.all([
    getNutritionLogs(userId, timeframe),
    getNutritionProfile(userId)
  ]);
  
  return {
    complianceRate: calculateNutritionCompliance(nutritionLogs, nutritionProfile),
    proteinIntake: analyzeProteinIntake(nutritionLogs, nutritionProfile),
    calorieBalance: analyzeCalorieBalance(nutritionLogs, nutritionProfile),
    hydrationTrends: analyzeHydration(nutritionLogs),
    
    // Patterns
    mealTiming: analyzeMealTiming(nutritionLogs),
    supplementConsistency: analyzeSupplementUsage(nutritionLogs),
    
    // Correlations with performance
    performanceNutritionCorrelation: correlateWithPerformance(nutritionLogs, journalEntries),
    
    // Recommendations
    nutritionGaps: identifyNutritionGaps(nutritionLogs, nutritionProfile),
    improvementAreas: prioritizeNutritionImprovements(nutritionLogs, nutritionProfile)
  };
};
```

#### 4. Goal Progress Context
```javascript
const gatherGoalContext = async (userId) => {
  const [profile, benchmarkSends, journalEntries] = await Promise.all([
    getAthleteProfile(userId),
    getBenchmarkSends(userId, { days: 90 }),
    getJournalEntries(userId, { days: 90 })
  ]);
  
  return {
    activeGoals: profile.goals.filter(g => !g.completed),
    goalProgress: assessGoalProgress(profile.goals, benchmarkSends),
    timeToGoal: estimateTimeToGoal(profile.goals, benchmarkSends, journalEntries),
    
    // Achievement analysis
    recentAchievements: identifyRecentAchievements(benchmarkSends),
    milestoneProgress: trackMilestoneProgress(profile.goals, benchmarkSends),
    
    // Recommended adjustments
    goalRecommendations: recommendGoalAdjustments(profile.goals, benchmarkSends),
    nextMilestones: identifyNextMilestones(profile.goals, benchmarkSends)
  };
};
```

## Context Retrieval Implementation

### Primary Context Function
```javascript
const retrieveAIContext = async (userId, options = {}) => {
  const {
    days = 30,
    includeAnalytics = true,
    priorityAreas = ['performance', 'physical', 'nutrition', 'goals'],
    maxTokens = 8000
  } = options;
  
  const timeframes = {
    recent: { days: 7 },
    medium: { days: 30 },
    extended: { days: 90 }
  };
  
  // Parallel data gathering
  const contextPromises = {};
  
  if (priorityAreas.includes('performance')) {
    contextPromises.performance = gatherPerformanceContext(userId, timeframes);
  }
  
  if (priorityAreas.includes('physical')) {
    contextPromises.physical = gatherPhysicalContext(userId, timeframes);
  }
  
  if (priorityAreas.includes('nutrition')) {
    contextPromises.nutrition = gatherNutritionContext(userId, timeframes);
  }
  
  if (priorityAreas.includes('goals')) {
    contextPromises.goals = gatherGoalContext(userId);
  }
  
  // Always include profile
  contextPromises.profile = getAthleteProfile(userId);
  
  const rawContext = await Promise.all(Object.values(contextPromises));
  const contextKeys = Object.keys(contextPromises);
  
  // Combine results
  const context = {};
  contextKeys.forEach((key, index) => {
    context[key] = rawContext[index];
  });
  
  // Apply prioritization and token limits
  const prioritizedContext = prioritizeContext(context, maxTokens);
  
  // Add metadata
  return {
    ...prioritizedContext,
    metadata: {
      userId,
      retrievedAt: new Date().toISOString(),
      timeframe: { days },
      priorityAreas,
      tokenEstimate: estimateTokenCount(prioritizedContext)
    }
  };
};
```

### Context Prioritization Logic
```javascript
const prioritizeContext = (context, maxTokens) => {
  const prioritized = {
    critical: {},
    important: {},
    supportive: {}
  };
  
  // Critical: Recent performance indicators
  prioritized.critical = {
    recentSessions: context.performance?.sessionFrequency?.last7Days,
    currentInjuries: context.physical?.currentInjuries,
    activeGoals: context.goals?.activeGoals,
    energyTrends: context.physical?.energyTrends?.last7Days
  };
  
  // Important: Medium-term trends
  prioritized.important = {
    gradeProgression: context.performance?.gradeProgression,
    plateauIndicators: context.performance?.plateauIndicators,
    nutritionCompliance: context.nutrition?.complianceRate,
    goalProgress: context.goals?.goalProgress
  };
  
  // Supportive: Background context
  prioritized.supportive = {
    profile: context.profile,
    performancePatterns: context.performance?.bestPerformanceDays,
    nutritionPatterns: context.nutrition?.mealTiming,
    historicalTrends: context.performance?.last90Days
  };
  
  // Token-based truncation
  let currentTokens = 0;
  const result = {};
  
  // Always include critical
  result.critical = prioritized.critical;
  currentTokens += estimateTokenCount(prioritized.critical);
  
  // Add important if space allows
  const importantTokens = estimateTokenCount(prioritized.important);
  if (currentTokens + importantTokens <= maxTokens * 0.8) {
    result.important = prioritized.important;
    currentTokens += importantTokens;
  }
  
  // Add supportive if space allows
  const supportiveTokens = estimateTokenCount(prioritized.supportive);
  if (currentTokens + supportiveTokens <= maxTokens) {
    result.supportive = prioritized.supportive;
  } else {
    // Selectively include supportive elements
    result.supportive = selectiveSupportiveContext(
      prioritized.supportive, 
      maxTokens - currentTokens
    );
  }
  
  return result;
};
```

### Performance Analytics Functions

#### Session Frequency Analysis
```javascript
const calculateSessionFrequency = (journalEntries) => {
  const periods = {
    last7Days: journalEntries.filter(e => isWithinDays(e.date, 7)),
    last30Days: journalEntries.filter(e => isWithinDays(e.date, 30)),
    last90Days: journalEntries.filter(e => isWithinDays(e.date, 90))
  };
  
  return {
    sessionsPerWeek: {
      recent: (periods.last7Days.length / 1) * 1,
      average30: (periods.last30Days.length / 30) * 7,
      average90: (periods.last90Days.length / 90) * 7
    },
    consistency: calculateConsistencyScore(periods),
    restDayRatio: calculateRestDayRatio(periods),
    sessionTypes: analyzeSessionTypes(periods)
  };
};
```

#### Grade Progression Analysis
```javascript
const analyzeGradeProgression = (benchmarkSends) => {
  const timeWindows = [7, 30, 90];
  const progression = {};
  
  timeWindows.forEach(days => {
    const recentSends = benchmarkSends.filter(s => isWithinDays(s.date, days));
    const grades = recentSends.map(s => s.gradeNumeric).sort((a, b) => b - a);
    
    progression[`last${days}Days`] = {
      maxGrade: grades[0] || null,
      averageGrade: grades.length ? grades.reduce((a, b) => a + b) / grades.length : null,
      gradeRange: grades.length ? grades[0] - grades[grades.length - 1] : 0,
      breakthrough: identifyBreakthroughSends(recentSends),
      trend: calculateGradeTrend(recentSends)
    };
  });
  
  return progression;
};
```

#### Plateau Detection
```javascript
const detectPlateaus = (journalEntries, benchmarkSends) => {
  const recentEntries = journalEntries.filter(e => isWithinDays(e.date, 30));
  const recentSends = benchmarkSends.filter(s => isWithinDays(s.date, 60));
  
  const indicators = {
    gradeStagnation: checkGradeStagnation(recentSends),
    successRateDecline: checkSuccessRateDecline(recentEntries),
    motivationIndicators: checkMotivationIndicators(recentEntries),
    effortIncreaseWithoutProgress: checkEffortWithoutProgress(recentEntries, recentSends)
  };
  
  const plateauScore = calculatePlateauScore(indicators);
  
  return {
    isPlateauing: plateauScore > 0.6,
    plateauScore,
    indicators,
    recommendations: generatePlateauRecommendations(indicators)
  };
};
```

## Context-Aware Query Optimization

### Intelligent Context Selection
```javascript
const selectContextForQuery = (fullContext, userMessage, conversationType) => {
  const contextSelectors = {
    technique: ['performance.technicalFocusAreas', 'profile.weaknesses', 'physical.currentInjuries'],
    nutrition: ['nutrition', 'physical.energyTrends', 'performance.sessionFrequency'],
    training: ['performance', 'physical', 'goals.activeGoals', 'profile.currentGrades'],
    motivation: ['goals.goalProgress', 'performance.recentBreakthroughs', 'performance.plateauIndicators'],
    recovery: ['physical', 'performance.sessionFrequency', 'nutrition.complianceRate'],
    general: ['critical', 'important']
  };
  
  const relevantPaths = contextSelectors[conversationType] || contextSelectors.general;
  const selectedContext = {};
  
  relevantPaths.forEach(path => {
    const value = getNestedValue(fullContext, path);
    if (value) {
      setNestedValue(selectedContext, path, value);
    }
  });
  
  return selectedContext;
};
```

### Context Summarization
```javascript
const summarizeContext = (context, maxLength = 2000) => {
  const summaries = {
    critical: summarizeCritical(context.critical),
    important: summarizeImportant(context.important),
    supportive: summarizeSupportive(context.supportive)
  };
  
  // Combine summaries based on available space
  let result = summaries.critical;
  let currentLength = result.length;
  
  if (currentLength + summaries.important.length <= maxLength * 0.7) {
    result += '\n\n' + summaries.important;
    currentLength += summaries.important.length;
  }
  
  if (currentLength + summaries.supportive.length <= maxLength) {
    result += '\n\n' + summaries.supportive;
  }
  
  return result;
};
```

## Caching Strategy

### Context Cache Implementation
```javascript
class ContextCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutes
  }
  
  getCacheKey(userId, options) {
    return `${userId}-${JSON.stringify(options)}`;
  }
  
  get(userId, options) {
    const key = this.getCacheKey(userId, options);
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.context;
    }
    
    return null;
  }
  
  set(userId, options, context) {
    const key = this.getCacheKey(userId, options);
    this.cache.set(key, {
      context,
      timestamp: Date.now()
    });
  }
  
  invalidate(userId) {
    // Remove all cache entries for user
    for (const [key] of this.cache) {
      if (key.startsWith(userId)) {
        this.cache.delete(key);
      }
    }
  }
}
```

### Cache Invalidation Triggers
```javascript
const CACHE_INVALIDATION_TRIGGERS = {
  journalEntry: ['performance', 'physical'],
  benchmarkSend: ['performance', 'goals'],
  nutritionLog: ['nutrition'],
  profileUpdate: ['profile', 'goals'],
  trainingPlanUpdate: ['training']
};

const invalidateRelevantCache = (userId, dataType) => {
  const affectedContexts = CACHE_INVALIDATION_TRIGGERS[dataType] || [];
  affectedContexts.forEach(contextType => {
    contextCache.invalidatePattern(userId, contextType);
  });
};
```

## Performance Optimizations

### Parallel Data Fetching
```javascript
const optimizedContextRetrieval = async (userId, options) => {
  // Batch DynamoDB queries
  const batchQueries = [
    {
      RequestItems: {
        'v7-journal-entries': {
          KeyConditionExpression: 'userId = :userId AND #date >= :startDate',
          ExpressionAttributeNames: { '#date': 'date' },
          ExpressionAttributeValues: {
            ':userId': userId,
            ':startDate': getDateString(options.days)
          }
        }
      }
    },
    // ... additional batch queries
  ];
  
  const [journalData, benchmarkData, nutritionData] = await Promise.all(
    batchQueries.map(query => dynamoClient.batchGet(query).promise())
  );
  
  // Process in parallel
  const [performance, physical, nutrition] = await Promise.all([
    processPerformanceData(journalData, benchmarkData),
    processPhysicalData(journalData),
    processNutritionData(nutritionData)
  ]);
  
  return { performance, physical, nutrition };
};
```

### Token Estimation
```javascript
const estimateTokenCount = (obj) => {
  const jsonString = JSON.stringify(obj);
  // Rough estimation: ~4 characters per token
  return Math.ceil(jsonString.length / 4);
};
```

This context retrieval system provides:
- **Intelligent data aggregation** with priority-based selection
- **Performance optimization** through caching and parallel queries
- **Token management** to stay within AI model limits
- **Contextual relevance** based on conversation type
- **Real-time invalidation** to maintain data freshness

## Reference Data Integration

### Loading Context Libraries
The system must load and utilize existing context libraries at Lambda initialization:

```javascript
// Load static context libraries
const climbingContext = require('./context/climbing-context-library.json');
const promptLibrary = require('./context/prompt-library.json');

// Initialize reference data cache
let referenceDataCache = null;

const initializeReferenceData = () => {
  referenceDataCache = {
    gradeProgressions: climbingContext.climbingGrades.bouldering["v-scale"],
    trainingPrinciples: climbingContext.trainingPrinciples,
    physicalBenchmarks: climbingContext.physicalCapacities,
    technicalSkills: climbingContext.technicalSkills,
    nutritionGuidelines: climbingContext.nutritionGuidelines,
    injuryPrevention: climbingContext.injuryPrevention,
    trainingProtocols: climbingContext.trainingProtocols,
    promptTemplates: promptLibrary
  };
};

// Call at Lambda cold start
initializeReferenceData();
```

### Context Enrichment with Static Data
```javascript
const enrichContextWithStaticData = (dynamicContext, conversationType) => {
  const { currentGrade, weaknesses, dietaryRestrictions } = dynamicContext.profile;
  
  // Find current grade position and next progression
  const gradeIndex = referenceDataCache.gradeProgressions.progression.indexOf(currentGrade);
  const nextGrade = referenceDataCache.gradeProgressions.progression[gradeIndex + 1];
  const progressionTimeframe = referenceDataCache.gradeProgressions.typicalProgression[`${currentGrade}_to_${nextGrade}`];
  
  // Get relevant benchmarks for current and next grade
  const currentBenchmarks = {};
  const nextBenchmarks = {};
  
  Object.keys(referenceDataCache.physicalBenchmarks).forEach(capacity => {
    if (referenceDataCache.physicalBenchmarks[capacity].benchmarks[currentGrade]) {
      currentBenchmarks[capacity] = referenceDataCache.physicalBenchmarks[capacity].benchmarks[currentGrade];
    }
    if (referenceDataCache.physicalBenchmarks[capacity].benchmarks[nextGrade]) {
      nextBenchmarks[capacity] = referenceDataCache.physicalBenchmarks[capacity].benchmarks[nextGrade];
    }
  });
  
  // Get nutrition targets based on dietary restrictions
  const nutritionSources = dietaryRestrictions.includes('vegetarian') 
    ? referenceDataCache.nutritionGuidelines.macronutrients.protein.sources.vegetarian
    : referenceDataCache.nutritionGuidelines.macronutrients.protein.sources.omnivore;
  
  // Select appropriate prompt templates
  const promptTemplate = referenceDataCache.promptTemplates.systemPrompts.roleVariations[conversationType] 
    || referenceDataCache.promptTemplates.systemPrompts.base;
  
  return {
    ...dynamicContext,
    staticContext: {
      gradeProgression: {
        current: currentGrade,
        next: nextGrade,
        typicalTimeframe: progressionTimeframe,
        currentPosition: gradeIndex
      },
      benchmarks: {
        current: currentBenchmarks,
        next: nextBenchmarks
      },
      trainingPhase: determineTrainingPhase(dynamicContext),
      nutritionTargets: {
        ...referenceDataCache.nutritionGuidelines.macronutrients,
        preferredSources: nutritionSources
      },
      relevantProtocols: getRelevantProtocols(weaknesses, currentGrade),
      systemPrompt: promptTemplate
    }
  };
};

const determineTrainingPhase = (context) => {
  // Use periodization principles from climbing-context-library.json
  const recentSessions = context.performance.recentSessions || [];
  const avgIntensity = calculateAverageIntensity(recentSessions);
  
  if (avgIntensity > 0.8) return referenceDataCache.trainingPrinciples.periodization.phases.power;
  if (avgIntensity > 0.6) return referenceDataCache.trainingPrinciples.periodization.phases.strength;
  return referenceDataCache.trainingPrinciples.periodization.phases.base;
};

const getRelevantProtocols = (weaknesses, grade) => {
  const protocols = {};
  
  // Match weaknesses to training protocols
  if (weaknesses.includes('finger strength')) {
    protocols.hangboard = referenceDataCache.trainingProtocols.hangboard.intermediate;
  }
  if (weaknesses.includes('power')) {
    protocols.campus = referenceDataCache.trainingProtocols.campus.intermediate;
  }
  if (weaknesses.includes('endurance')) {
    protocols.circuits = referenceDataCache.trainingProtocols.circuits.power_endurance;
  }
  
  return protocols;
};
```

### Using Prompt Library Templates
```javascript
const buildPromptFromLibrary = (conversationType, userContext, message) => {
  const library = referenceDataCache.promptTemplates;
  
  // Get base system prompt
  const systemPrompt = library.systemPrompts.roleVariations[conversationType] 
    || library.systemPrompts.base;
  
  // Build user context from template
  const contextTemplate = library.contextBuilders.userProfile;
  const userContextString = contextTemplate
    .replace('{age}', userContext.profile.age)
    .replace('{yearsClimbing}', userContext.profile.yearsClimbing)
    .replace('{currentGrades}', userContext.performance.currentGrades)
    .replace('{weight}', userContext.physical.currentWeight)
    .replace('{goalWeight}', userContext.profile.goalWeight)
    .replace('{dietaryRestrictions}', userContext.profile.dietaryRestrictions)
    .replace('{weaknesses}', userContext.profile.weaknesses.join(', '))
    .replace('{trainingHours}', userContext.training.weeklyHours);
  
  // Add recent progress context
  const progressTemplate = library.contextBuilders.recentProgress;
  const progressContext = progressTemplate
    .replace('{recentSessions}', JSON.stringify(userContext.performance.recentSessions))
    .replace('{energyLevels}', userContext.physical.energyLevel)
    .replace('{soreness}', userContext.physical.soreness.join(', '))
    .replace('{achievements}', userContext.performance.recentAchievements.join(', '))
    .replace('{focusAreas}', userContext.training.currentFocus.join(', '));
  
  // Select appropriate response template
  const responseTemplate = selectResponseTemplate(message, userContext, library);
  
  return {
    system: systemPrompt,
    context: `${userContextString}\n\n${progressContext}`,
    responseGuidance: responseTemplate,
    safetyReminders: getSafetyReminders(userContext, library)
  };
};

const selectResponseTemplate = (message, context, library) => {
  // Analyze message sentiment and context
  const isStruggling = message.toLowerCase().includes('stuck') || 
                      message.toLowerCase().includes('frustrated') ||
                      context.performance.plateauIndicators;
  
  const isSuccess = message.toLowerCase().includes('sent') ||
                   message.toLowerCase().includes('finally') ||
                   message.toLowerCase().includes('breakthrough');
  
  if (isSuccess) {
    return library.responseTemplates.encouragement.success[0];
  } else if (isStruggling) {
    return library.responseTemplates.encouragement.struggle[0];
  }
  
  // Default to advice template
  return library.responseTemplates.advice.training;
};

const getSafetyReminders = (context, library) => {
  const reminders = [...library.safetyReminders.always];
  
  // Add conditional reminders based on context
  if (context.training.weeklyVolume > 15) {
    reminders.push(library.safetyReminders.conditional.highVolume);
  }
  
  if (context.physical.fatigue > 7) {
    reminders.push(library.safetyReminders.conditional.fatigued);
  }
  
  return reminders;
};
```

This integration ensures that:
1. **All static climbing knowledge** from climbing-context-library.json is available
2. **Pre-defined prompt templates** from prompt-library.json are utilized
3. **Context is enriched** with relevant benchmarks, progressions, and protocols
4. **Responses are consistent** with the established prompt library
5. **Safety and best practices** are always included based on user context