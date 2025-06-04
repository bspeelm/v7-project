# Bedrock/Claude Integration Architecture

## Overview

This document outlines the integration architecture for Amazon Bedrock with Claude models, utilizing Claude Opus 4 for complex reasoning and coaching, and Claude Sonnet 4 for lightweight routing and classification tasks.

## Model Selection Strategy

### Claude Opus 4 - Primary Coaching Model
**Use Cases:**
- Complex coaching conversations requiring deep reasoning
- Personalized training plan generation
- Comprehensive progress analysis
- Detailed technique instruction
- Multi-factor nutrition recommendations
- Goal setting and milestone planning

**Characteristics:**
- **Strengths**: Superior reasoning, nuanced understanding, comprehensive responses
- **Token Limit**: 200K context window
- **Cost**: Higher per token (~$15 input, ~$75 output per 1M tokens)
- **Latency**: 3-8 seconds for complex responses
- **Best For**: Quality over speed scenarios

### Claude Sonnet 4 - Routing and Classification Model  
**Use Cases:**
- Message classification and intent detection
- Agent routing decisions
- Quick responses to simple questions
- Data validation and formatting
- Context summarization for Opus
- Health/safety screening of user inputs

**Characteristics:**
- **Strengths**: Fast response, efficient, good reasoning for simpler tasks
- **Token Limit**: 200K context window
- **Cost**: Lower per token (~$3 input, ~$15 output per 1M tokens)
- **Latency**: 1-3 seconds
- **Best For**: Speed and efficiency

## Architecture Components

### 1. Intelligent Routing System

#### Router Lambda Function
```javascript
const routeToModel = async (userMessage, context, conversationHistory) => {
  // Use Sonnet 4 for classification
  const classification = await classifyMessage(userMessage, context);
  
  const routingDecision = {
    model: null,
    reasoning: null,
    contextReduction: null,
    priority: null
  };
  
  // Routing logic based on complexity and requirements
  if (requiresOpus(classification, context, conversationHistory)) {
    routingDecision.model = 'opus-4';
    routingDecision.reasoning = 'Complex reasoning required';
    routingDecision.contextReduction = await reduceContextForOpus(context);
  } else {
    routingDecision.model = 'sonnet-4';
    routingDecision.reasoning = 'Simple query or routing task';
    routingDecision.contextReduction = await reduceContextForSonnet(context);
  }
  
  return routingDecision;
};

const requiresOpus = (classification, context, history) => {
  const opusIndicators = {
    // Complex coaching scenarios
    complexCoaching: classification.type === 'coaching' && classification.complexity > 0.7,
    
    // Multi-domain analysis needed
    multiDomain: classification.domains.length > 2,
    
    // First-time complex question
    newComplexTopic: !history.some(h => h.topic === classification.topic) && classification.complexity > 0.5,
    
    // User explicitly asking for detailed help
    detailedRequest: /detailed|comprehensive|explain|analyze|help me understand/.test(classification.message.toLowerCase()),
    
    // Progress analysis requiring trend interpretation
    progressAnalysis: classification.type === 'progress' && context.performance?.dataPoints > 10,
    
    // Goal setting or plan creation
    planCreation: /plan|goal|strategy|program/.test(classification.message.toLowerCase()),
    
    // Safety-critical advice
    safetyCritical: classification.safety?.risk > 0.3,
    
    // Plateau breakthrough requiring complex analysis
    plateauBreakthrough: context.performance?.plateauScore > 0.6
  };
  
  return Object.values(opusIndicators).some(indicator => indicator);
};
```

#### Message Classification with Sonnet 4
```javascript
const classifyMessage = async (message, context) => {
  const prompt = `
You are a message classifier for a climbing coaching AI system. Analyze this user message and return a JSON classification.

USER MESSAGE: "${message}"

CONTEXT SUMMARY: ${JSON.stringify(context.summary)}

Return classification as JSON:
{
  "type": "coaching|question|update|request|analysis",
  "domains": ["technique", "training", "nutrition", "motivation", "progress"],
  "complexity": 0.0-1.0,
  "urgency": "low|medium|high", 
  "safety": {"risk": 0.0-1.0, "concerns": []},
  "intent": "primary user intent",
  "requiresPersonalization": boolean,
  "expectedResponseLength": "short|medium|long"
}
`;

  const response = await bedrock.invokeModel({
    modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    })
  }).promise();
  
  return JSON.parse(response.body).content[0].text;
};
```

### 2. Context Optimization for Each Model

#### Opus 4 Context Preparation
```javascript
const prepareOpusContext = async (fullContext, classification) => {
  // Opus can handle rich, detailed context
  const contextPriority = {
    // High priority for complex coaching
    critical: {
      profile: fullContext.profile,
      recentPerformance: fullContext.performance.last30Days,
      activeGoals: fullContext.goals.active,
      currentInjuries: fullContext.physical.currentInjuries
    },
    
    // Medium priority - trend data
    important: {
      progressTrends: fullContext.performance.trends,
      nutritionCompliance: fullContext.nutrition.compliance,
      trainingPatterns: fullContext.training.patterns,
      plateauIndicators: fullContext.performance.plateauIndicators
    },
    
    // Supporting context
    supportive: {
      historicalData: fullContext.performance.last90Days,
      preferences: fullContext.profile.preferences,
      pastBreakthroughs: fullContext.performance.breakthroughs
    }
  };
  
  // For Opus, include comprehensive context up to 150K tokens
  const maxTokens = 150000;
  return assembleContext(contextPriority, maxTokens, 'comprehensive');
};
```

#### Sonnet 4 Context Preparation  
```javascript
const prepareSonnetContext = async (fullContext, classification) => {
  // Sonnet gets streamlined, focused context
  const contextPriority = {
    // Only most relevant for quick decisions
    essential: {
      currentGrades: fullContext.profile.currentGrades,
      recentSessions: fullContext.performance.last7Days,
      immediateGoals: fullContext.goals.immediate,
      activeInjuries: fullContext.physical.activeInjuries
    }
  };
  
  // For Sonnet, limit to 20K tokens for speed
  const maxTokens = 20000;
  return assembleContext(contextPriority, maxTokens, 'focused');
};
```

### 3. Model-Specific Invocation Patterns

#### Opus 4 Invocation
```javascript
const invokeOpus = async (prompt, context, options = {}) => {
  const {
    maxTokens = 2000,
    temperature = 0.7,
    streaming = false
  } = options;
  
  const requestBody = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: maxTokens,
    temperature,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    system: buildSystemPrompt('opus', context)
  };
  
  if (streaming) {
    return invokeModelWithResponseStream({
      modelId: 'anthropic.claude-3-opus-4-20241022-v2:0',
      body: JSON.stringify(requestBody)
    });
  }
  
  const response = await bedrock.invokeModel({
    modelId: 'anthropic.claude-3-opus-4-20241022-v2:0',
    body: JSON.stringify(requestBody)
  }).promise();
  
  return {
    content: JSON.parse(response.body).content[0].text,
    usage: JSON.parse(response.body).usage,
    model: 'opus-4'
  };
};
```

#### Sonnet 4 Invocation
```javascript
const invokeSonnet = async (prompt, context, options = {}) => {
  const {
    maxTokens = 1000,
    temperature = 0.3,  // Lower temperature for routing/classification
    format = 'text'
  } = options;
  
  const requestBody = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: maxTokens,
    temperature,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    system: buildSystemPrompt('sonnet', context)
  };
  
  const response = await bedrock.invokeModel({
    modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    body: JSON.stringify(requestBody)
  }).promise();
  
  return {
    content: JSON.parse(response.body).content[0].text,
    usage: JSON.parse(response.body).usage,
    model: 'sonnet-4'
  };
};
```

### 4. Hybrid Processing Workflows

#### Two-Stage Processing
```javascript
const hybridProcessing = async (userMessage, context) => {
  // Stage 1: Sonnet classifies and routes
  const classification = await invokeSonnet(
    buildClassificationPrompt(userMessage, context),
    context,
    { maxTokens: 500, format: 'json' }
  );
  
  // Stage 2: Route to appropriate model
  if (classification.requiresOpus) {
    // Opus for complex coaching
    const coachingResponse = await invokeOpus(
      buildCoachingPrompt(userMessage, context, classification),
      context,
      { maxTokens: 2000, streaming: true }
    );
    
    return {
      response: coachingResponse.content,
      model: 'opus-4',
      classification,
      cost: calculateCost(coachingResponse.usage, 'opus')
    };
  } else {
    // Sonnet for simple responses
    const quickResponse = await invokeSonnet(
      buildQuickResponsePrompt(userMessage, context, classification),
      context,
      { maxTokens: 800 }
    );
    
    return {
      response: quickResponse.content,
      model: 'sonnet-4', 
      classification,
      cost: calculateCost(quickResponse.usage, 'sonnet')
    };
  }
};
```

#### Opus with Sonnet Preprocessing
```javascript
const opusWithPreprocessing = async (userMessage, context) => {
  // Use Sonnet to prepare and summarize context for Opus
  const contextSummary = await invokeSonnet(
    `Summarize this climbing context for detailed coaching analysis: ${JSON.stringify(context)}`,
    {},
    { maxTokens: 1000 }
  );
  
  // Use summarized context with Opus for efficient processing
  const optimizedContext = {
    ...context,
    summary: contextSummary.content
  };
  
  return await invokeOpus(
    buildDetailedCoachingPrompt(userMessage, optimizedContext),
    optimizedContext,
    { maxTokens: 2500 }
  );
};
```

### 5. Cost Optimization Strategies

#### Dynamic Model Selection
```javascript
const costOptimizedRouting = (classification, userTier, monthlyUsage) => {
  const costLimits = {
    free: { opus: 5, sonnet: 100 },      // Monthly interaction limits
    pro: { opus: 50, sonnet: 1000 },
    premium: { opus: 200, sonnet: 5000 }
  };
  
  const currentLimits = costLimits[userTier];
  
  // Force Sonnet if Opus limit reached
  if (monthlyUsage.opus >= currentLimits.opus) {
    return {
      model: 'sonnet-4',
      reasoning: 'Monthly Opus limit reached',
      suggestion: 'Consider upgrading for more detailed coaching'
    };
  }
  
  // Use complexity threshold based on tier
  const complexityThreshold = {
    free: 0.8,     // High bar for Opus
    pro: 0.6,      // Medium bar
    premium: 0.4   // Low bar - more Opus usage
  }[userTier];
  
  return classification.complexity >= complexityThreshold ? 'opus-4' : 'sonnet-4';
};
```

#### Token Optimization
```javascript
const optimizeTokenUsage = async (prompt, context, model) => {
  if (model === 'opus-4') {
    // For Opus, optimize for quality while managing cost
    return {
      prompt: await enhancePromptForOpus(prompt, context),
      context: await prepareRichContext(context),
      maxTokens: 2000
    };
  } else {
    // For Sonnet, optimize for efficiency
    return {
      prompt: await streamlinePromptForSonnet(prompt, context),
      context: await prepareMinimalContext(context),
      maxTokens: 800
    };
  }
};
```

### 6. Response Quality Assurance

#### Multi-Model Validation
```javascript
const validateResponse = async (response, userMessage, context) => {
  if (response.model === 'opus-4') {
    // High-stakes validation for Opus responses
    const validation = await invokeSonnet(
      `Validate this climbing coaching response for accuracy and safety: ${response.content}`,
      { userMessage, context: context.summary },
      { maxTokens: 300 }
    );
    
    return {
      validated: true,
      validationScore: parseValidationScore(validation.content),
      safetyChecked: true
    };
  }
  
  return { validated: false, reason: 'Sonnet responses not validated' };
};
```

### 7. Performance Monitoring

#### Model Performance Tracking
```javascript
const trackModelPerformance = async (interaction) => {
  const metrics = {
    modelUsed: interaction.model,
    responseTime: interaction.endTime - interaction.startTime,
    tokenUsage: interaction.usage,
    cost: interaction.cost,
    userSatisfaction: null, // To be collected later
    classification: interaction.classification,
    contextSize: interaction.contextTokens
  };
  
  await storeMetrics(metrics);
  
  // Alert if costs trending high
  if (metrics.cost > COST_THRESHOLDS.warning) {
    await alertCostSpike(interaction.userId, metrics);
  }
};
```

## Error Handling and Fallbacks

### Model Failure Cascading
```javascript
const invokeWithFallback = async (prompt, context, preferredModel) => {
  try {
    if (preferredModel === 'opus-4') {
      return await invokeOpus(prompt, context);
    } else {
      return await invokeSonnet(prompt, context);
    }
  } catch (error) {
    if (error.code === 'ThrottlingException' && preferredModel === 'opus-4') {
      // Fall back to Sonnet if Opus is throttled
      console.log('Opus throttled, falling back to Sonnet');
      return await invokeSonnet(
        await adaptPromptForSonnet(prompt),
        await prepareMinimalContext(context)
      );
    }
    throw error;
  }
};
```

### Rate Limiting Management
```javascript
const manageConcurrency = {
  opus: new Bottleneck({ maxConcurrent: 2, minTime: 1000 }),  // Conservative for Opus
  sonnet: new Bottleneck({ maxConcurrent: 5, minTime: 200 })  // More aggressive for Sonnet
};

const rateLimitedInvoke = async (model, prompt, context) => {
  const limiter = manageConcurrency[model.includes('opus') ? 'opus' : 'sonnet'];
  return await limiter.schedule(() => invoke(model, prompt, context));
};
```

This Bedrock/Claude integration architecture provides:
- **Intelligent model selection** based on complexity and cost
- **Optimized context preparation** for each model's strengths
- **Hybrid processing workflows** for maximum efficiency
- **Cost management** with tier-based limits
- **Quality assurance** through validation
- **Performance monitoring** and alerting
- **Robust error handling** with fallback strategies