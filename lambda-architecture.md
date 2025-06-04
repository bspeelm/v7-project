# Lambda Functions Architecture

## Overview

This document defines the Lambda function architecture for atomic CRUD operations and AI context retrieval. Each domain has dedicated functions following consistent patterns for maintainability and security.

## Lambda Function Structure

### Naming Convention
- **CRUD Operations**: `v7-{domain}-{operation}` (e.g., `v7-users-get`, `v7-journal-create`)
- **AI Functions**: `v7-ai-{purpose}` (e.g., `v7-ai-context`, `v7-ai-coach`)
- **Utility Functions**: `v7-{purpose}` (e.g., `v7-auth`, `v7-media-upload`)

### Runtime & Configuration
- **Runtime**: Node.js 20.x
- **Memory**: 512MB (CRUD), 1024MB (AI functions)
- **Timeout**: 30s (CRUD), 5min (AI functions)
- **Environment**: Shared environment variables for DynamoDB tables, Bedrock config

## Domain-Specific Lambda Functions

### 1. User Management

#### v7-users-create
```javascript
// POST /users
exports.handler = async (event) => {
  const { email, name, password } = JSON.parse(event.body);
  
  // Validate input
  if (!email || !name || !password) {
    return errorResponse(400, 'Missing required fields');
  }
  
  // Check if user exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return errorResponse(409, 'User already exists');
  }
  
  // Hash password, create user
  const userId = generateUserId();
  const user = {
    userId,
    email,
    name,
    createdAt: new Date().toISOString(),
    subscription: { tier: 'free', status: 'active' },
    preferences: { units: 'imperial', timezone: 'UTC' }
  };
  
  await dynamoClient.put({
    TableName: 'v7-users',
    Item: user
  }).promise();
  
  // Create default athlete profile
  await createDefaultAthleteProfile(userId);
  
  return successResponse(201, { user: sanitizeUser(user) });
};
```

#### v7-users-get
```javascript
// GET /users/{userId}
exports.handler = async (event) => {
  const { userId } = event.pathParameters;
  
  // Authorize user access
  if (!authorizeUser(event, userId)) {
    return errorResponse(403, 'Unauthorized');
  }
  
  const user = await getUserById(userId);
  if (!user) {
    return errorResponse(404, 'User not found');
  }
  
  return successResponse(200, { user: sanitizeUser(user) });
};
```

#### v7-users-update
```javascript
// PUT /users/{userId}
exports.handler = async (event) => {
  const { userId } = event.pathParameters;
  const updates = JSON.parse(event.body);
  
  if (!authorizeUser(event, userId)) {
    return errorResponse(403, 'Unauthorized');
  }
  
  // Validate updates (name, preferences only)
  const allowedFields = ['name', 'preferences'];
  const filteredUpdates = filterObject(updates, allowedFields);
  
  const result = await dynamoClient.update({
    TableName: 'v7-users',
    Key: { userId },
    UpdateExpression: buildUpdateExpression(filteredUpdates),
    ExpressionAttributeValues: buildAttributeValues(filteredUpdates),
    ReturnValues: 'ALL_NEW'
  }).promise();
  
  return successResponse(200, { user: sanitizeUser(result.Attributes) });
};
```

### 2. Athlete Profiles

#### v7-athlete-profiles-get
```javascript
// GET /users/{userId}/profile
exports.handler = async (event) => {
  const { userId } = event.pathParameters;
  
  if (!authorizeUser(event, userId)) {
    return errorResponse(403, 'Unauthorized');
  }
  
  const profile = await getAthleteProfile(userId);
  if (!profile) {
    return errorResponse(404, 'Profile not found');
  }
  
  return successResponse(200, { profile });
};
```

#### v7-athlete-profiles-update
```javascript
// PUT /users/{userId}/profile
exports.handler = async (event) => {
  const { userId } = event.pathParameters;
  const updates = JSON.parse(event.body);
  
  if (!authorizeUser(event, userId)) {
    return errorResponse(403, 'Unauthorized');
  }
  
  // Validate profile data
  const validationResult = validateAthleteProfile(updates);
  if (!validationResult.valid) {
    return errorResponse(400, validationResult.errors);
  }
  
  updates.updatedAt = new Date().toISOString();
  
  const result = await dynamoClient.update({
    TableName: 'v7-athlete-profiles',
    Key: { userId },
    UpdateExpression: buildUpdateExpression(updates),
    ExpressionAttributeValues: buildAttributeValues(updates),
    ReturnValues: 'ALL_NEW'
  }).promise();
  
  return successResponse(200, { profile: result.Attributes });
};
```

### 3. Journal Entries

#### v7-journal-create
```javascript
// POST /users/{userId}/journal
exports.handler = async (event) => {
  const { userId } = event.pathParameters;
  const entryData = JSON.parse(event.body);
  
  if (!authorizeUser(event, userId)) {
    return errorResponse(403, 'Unauthorized');
  }
  
  // Validate entry data
  const validationResult = validateJournalEntry(entryData);
  if (!validationResult.valid) {
    return errorResponse(400, validationResult.errors);
  }
  
  const entryId = generateEntryId();
  const entry = {
    userId,
    entryId,
    ...entryData,
    createdAt: new Date().toISOString()
  };
  
  // Check for duplicate date entry
  const existingEntry = await getJournalEntryByDate(userId, entryData.date);
  if (existingEntry) {
    return errorResponse(409, 'Entry already exists for this date');
  }
  
  await dynamoClient.put({
    TableName: 'v7-journal-entries',
    Item: entry,
    ConditionExpression: 'attribute_not_exists(userId)'
  }).promise();
  
  // Update dashboard stats asynchronously
  await updateDashboardStats(userId);
  
  return successResponse(201, { entry });
};
```

#### v7-journal-list
```javascript
// GET /users/{userId}/journal?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&limit=50
exports.handler = async (event) => {
  const { userId } = event.pathParameters;
  const { startDate, endDate, limit = 50 } = event.queryStringParameters || {};
  
  if (!authorizeUser(event, userId)) {
    return errorResponse(403, 'Unauthorized');
  }
  
  let queryParams = {
    TableName: 'v7-journal-entries',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: { ':userId': userId },
    ScanIndexForward: false, // newest first
    Limit: parseInt(limit)
  };
  
  // Add date range filtering
  if (startDate && endDate) {
    queryParams.KeyConditionExpression += ' AND #date BETWEEN :startDate AND :endDate';
    queryParams.ExpressionAttributeNames = { '#date': 'date' };
    queryParams.ExpressionAttributeValues[':startDate'] = startDate;
    queryParams.ExpressionAttributeValues[':endDate'] = endDate;
  }
  
  const result = await dynamoClient.query(queryParams).promise();
  
  return successResponse(200, { 
    entries: result.Items,
    lastEvaluatedKey: result.LastEvaluatedKey 
  });
};
```

### 4. Benchmark Sends

#### v7-benchmark-sends-create
```javascript
// POST /users/{userId}/benchmark-sends
exports.handler = async (event) => {
  const { userId } = event.pathParameters;
  const sendData = JSON.parse(event.body);
  
  if (!authorizeUser(event, userId)) {
    return errorResponse(403, 'Unauthorized');
  }
  
  // Validate and convert grade
  const gradeValidation = validateAndConvertGrade(sendData.grade, sendData.gradeType);
  if (!gradeValidation.valid) {
    return errorResponse(400, gradeValidation.error);
  }
  
  const sendId = generateSendId();
  const send = {
    userId,
    sendId,
    ...sendData,
    gradeNumeric: gradeValidation.numeric,
    createdAt: new Date().toISOString()
  };
  
  await dynamoClient.put({
    TableName: 'v7-benchmark-sends',
    Item: send
  }).promise();
  
  // Check for new personal best
  await checkPersonalBest(userId, send);
  
  // Update dashboard stats
  await updateDashboardStats(userId);
  
  return successResponse(201, { send });
};
```

#### v7-benchmark-sends-list
```javascript
// GET /users/{userId}/benchmark-sends?gradeType=v-scale&significance=breakthrough&limit=20
exports.handler = async (event) => {
  const { userId } = event.pathParameters;
  const { gradeType, significance, limit = 20 } = event.queryStringParameters || {};
  
  if (!authorizeUser(event, userId)) {
    return errorResponse(403, 'Unauthorized');
  }
  
  let queryParams = {
    TableName: 'v7-benchmark-sends',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: { ':userId': userId },
    ScanIndexForward: false,
    Limit: parseInt(limit)
  };
  
  // Filter by significance using GSI
  if (significance) {
    queryParams.IndexName = 'significance-index';
    queryParams.KeyConditionExpression = 'userId = :userId AND significance = :significance';
    queryParams.ExpressionAttributeValues[':significance'] = significance;
  }
  
  // Filter by grade type
  if (gradeType) {
    queryParams.FilterExpression = 'gradeType = :gradeType';
    queryParams.ExpressionAttributeValues[':gradeType'] = gradeType;
  }
  
  const result = await dynamoClient.query(queryParams).promise();
  
  return successResponse(200, { 
    sends: result.Items,
    lastEvaluatedKey: result.LastEvaluatedKey 
  });
};
```

### 5. Training Plans

#### v7-training-plans-get-active
```javascript
// GET /users/{userId}/training-plans/active
exports.handler = async (event) => {
  const { userId } = event.pathParameters;
  
  if (!authorizeUser(event, userId)) {
    return errorResponse(403, 'Unauthorized');
  }
  
  const result = await dynamoClient.query({
    TableName: 'v7-training-plans',
    KeyConditionExpression: 'userId = :userId',
    FilterExpression: 'active = :active',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':active': true
    },
    Limit: 1
  }).promise();
  
  const activePlan = result.Items[0] || null;
  
  return successResponse(200, { trainingPlan: activePlan });
};
```

### 6. Nutrition Functions

#### v7-nutrition-log-save
```javascript
// PUT /users/{userId}/nutrition/logs/{date}
exports.handler = async (event) => {
  const { userId, date } = event.pathParameters;
  const logData = JSON.parse(event.body);
  
  if (!authorizeUser(event, userId)) {
    return errorResponse(403, 'Unauthorized');
  }
  
  // Validate date format
  if (!isValidDate(date)) {
    return errorResponse(400, 'Invalid date format');
  }
  
  // Calculate totals
  const totals = calculateNutritionTotals(logData.meals);
  
  const nutritionLog = {
    userId,
    date,
    ...logData,
    totalCalories: totals.calories,
    macros: totals.macros,
    updatedAt: new Date().toISOString()
  };
  
  await dynamoClient.put({
    TableName: 'v7-nutrition-logs',
    Item: nutritionLog
  }).promise();
  
  return successResponse(200, { nutritionLog });
};
```

## AI-Specific Lambda Functions

### v7-ai-context-retrieval
```javascript
// GET /users/{userId}/ai-context?days=30
exports.handler = async (event) => {
  const { userId } = event.pathParameters;
  const { days = 30 } = event.queryStringParameters || {};
  
  if (!authorizeUser(event, userId)) {
    return errorResponse(403, 'Unauthorized');
  }
  
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
  
  // Parallel data retrieval
  const [
    profile,
    recentJournalEntries,
    recentBenchmarkSends,
    nutritionLogs,
    activePlan
  ] = await Promise.all([
    getAthleteProfile(userId),
    getJournalEntries(userId, startDate, endDate),
    getBenchmarkSends(userId, startDate, endDate),
    getNutritionLogs(userId, startDate, endDate),
    getActivePlan(userId)
  ]);
  
  // Calculate derived metrics
  const metrics = calculateProgressMetrics(recentJournalEntries, recentBenchmarkSends);
  const nutritionCompliance = calculateNutritionCompliance(nutritionLogs, profile);
  
  const context = {
    profile,
    recentActivity: {
      journalEntries: recentJournalEntries,
      benchmarkSends: recentBenchmarkSends,
      nutritionLogs: nutritionLogs.slice(0, 7) // Last 7 days
    },
    metrics,
    nutritionCompliance,
    activePlan,
    goals: profile.goals.filter(g => !g.completed),
    retrievedAt: new Date().toISOString()
  };
  
  return successResponse(200, { context });
};
```

### v7-ai-coaching-chat
```javascript
// POST /users/{userId}/ai/chat
exports.handler = async (event) => {
  const { userId } = event.pathParameters;
  const { message, conversationId } = JSON.parse(event.body);
  
  if (!authorizeUser(event, userId)) {
    return errorResponse(403, 'Unauthorized');
  }
  
  // Get user context
  const contextResponse = await lambda.invoke({
    FunctionName: 'v7-ai-context-retrieval',
    Payload: JSON.stringify({ pathParameters: { userId } })
  }).promise();
  
  const context = JSON.parse(contextResponse.Payload).body.context;
  
  // Determine chat type and get appropriate template
  const chatType = determineChatType(message, context);
  const template = await getChatTemplate(chatType, context);
  
  // Build prompt
  const prompt = buildCoachingPrompt(template, context, message);
  
  // Call Bedrock
  const bedrockResponse = await bedrock.invokeModel({
    modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  }).promise();
  
  const response = JSON.parse(bedrockResponse.body).content[0].text;
  
  // Store conversation
  const conversationEntry = {
    userId,
    conversationId: conversationId || generateConversationId(),
    timestamp: new Date().toISOString(),
    userMessage: message,
    aiResponse: response,
    context: {
      chatType,
      templateUsed: template.templateId
    }
  };
  
  await storeConversation(conversationEntry);
  
  return successResponse(200, { 
    response,
    conversationId: conversationEntry.conversationId 
  });
};
```

## Utility Functions

### Common Helper Functions
```javascript
// Shared utilities across all functions
const successResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify(body)
});

const errorResponse = (statusCode, message) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({ error: message })
});

const authorizeUser = (event, userId) => {
  const token = event.headers.Authorization?.replace('Bearer ', '');
  if (!token) return false;
  
  // Verify JWT token and extract user ID
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  return decodedToken.sub === userId;
};

const buildUpdateExpression = (updates) => {
  const expressions = [];
  Object.keys(updates).forEach(key => {
    expressions.push(`${key} = :${key}`);
  });
  return 'SET ' + expressions.join(', ');
};

const buildAttributeValues = (updates) => {
  const values = {};
  Object.keys(updates).forEach(key => {
    values[`:${key}`] = updates[key];
  });
  return values;
};
```

## Error Handling Strategy

### Consistent Error Responses
```javascript
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND', 
  UNAUTHORIZED: 'UNAUTHORIZED',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
};

const formatError = (code, message, details = null) => ({
  error: {
    code,
    message,
    details,
    timestamp: new Date().toISOString()
  }
});
```

### Retry Logic
```javascript
const retryOperation = async (operation, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error;
      }
      await sleep(Math.pow(2, attempt) * 100); // Exponential backoff
    }
  }
};
```

## Performance Optimizations

### Connection Reuse
```javascript
// Initialize outside handler for connection reuse
const dynamoClient = new AWS.DynamoDB.DocumentClient({
  httpOptions: {
    connectionTimeout: 3000,
    timeout: 5000
  }
});

const bedrock = new AWS.BedrockRuntime({
  region: process.env.AWS_REGION
});
```

### Batch Operations
```javascript
const batchGetItems = async (requests) => {
  const chunks = chunkArray(requests, 100); // DynamoDB batch limit
  const results = [];
  
  for (const chunk of chunks) {
    const response = await dynamoClient.batchGet({
      RequestItems: chunk
    }).promise();
    
    results.push(...response.Responses);
  }
  
  return results;
};
```

This Lambda architecture provides:
- **Atomic operations** for each data domain
- **Consistent error handling** across all functions
- **Optimized performance** with connection reuse
- **Comprehensive validation** for data integrity
- **AI context retrieval** for intelligent coaching responses