# V7 Climbing Journal - Backend Architecture Plan

## Overview

This document outlines the complete backend architecture for transitioning from JSON mock data to a production AWS serverless architecture with AI-powered coaching capabilities.

## Architecture Components

- **Database**: DynamoDB with optimized access patterns
- **API**: AWS API Gateway with Lambda functions
- **AI**: Amazon Bedrock with Claude Opus 4, (Sonnet 4 for lighter tasks like routing)
- **Authentication**: AWS Cognito
- **Storage**: S3 for media files
- **Monitoring**: CloudWatch + X-Ray

## DynamoDB Table Design

### 1. Users Table
```json
{
  "TableName": "v7-users",
  "PartitionKey": "userId",
  "Attributes": {
    "userId": "string",
    "email": "string",
    "name": "string",
    "createdAt": "string (ISO 8601)",
    "subscription": {
      "tier": "enum: free|pro|premium", 
      "status": "enum: active|cancelled|expired",
      "expiresAt": "string (ISO 8601)"
    },
    "preferences": {
      "units": "enum: metric|imperial",
      "timezone": "string"
    }
  },
  "GSI": [
    {
      "IndexName": "email-index",
      "PartitionKey": "email"
    }
  ]
}
```

### 2. Athlete Profiles Table
```json
{
  "TableName": "v7-athlete-profiles",
  "PartitionKey": "userId",
  "Attributes": {
    "userId": "string",
    "age": "number",
    "weight": "number",
    "height": "number", 
    "yearsClimbing": "number",
    "currentGrades": {
      "indoor": {
        "slab": "string",
        "vertical": "string", 
        "overhang": "string"
      },
      "outdoor": {
        "sport": "string",
        "boulder": "string",
        "trad": "string"
      }
    },
    "goals": [
      {
        "id": "string",
        "grade": "string",
        "targetDate": "string",
        "type": "enum: boulder|sport|trad",
        "description": "string",
        "completed": "boolean"
      }
    ],
    "weaknesses": ["string"],
    "strengths": ["string"], 
    "dietaryRestrictions": ["string"],
    "injuryHistory": [
      {
        "id": "string",
        "type": "string",
        "date": "string",
        "duration": "string", 
        "recovered": "boolean",
        "notes": "string"
      }
    ],
    "updatedAt": "string"
  }
}
```

### 3. Benchmark Sends Table
```json
{
  "TableName": "v7-benchmark-sends",
  "PartitionKey": "userId",
  "SortKey": "date#sendId",
  "Attributes": {
    "userId": "string",
    "sendId": "string",
    "grade": "string",
    "gradeNumeric": "number",
    "gradeType": "enum: v-scale|yds",
    "name": "string",
    "location": "string",
    "date": "string (YYYY-MM-DD)",
    "type": "enum: indoor|outdoor",
    "style": "enum: slab|vertical|overhang|roof",
    "attempts": "number",
    "notes": "string",
    "media": ["string (S3 URLs)"],
    "significance": "enum: breakthrough|milestone|personal-best|project-send",
    "createdAt": "string"
  },
  "GSI": [
    {
      "IndexName": "grade-progression-index",
      "PartitionKey": "userId",
      "SortKey": "gradeNumeric#date"
    },
    {
      "IndexName": "significance-index", 
      "PartitionKey": "userId",
      "SortKey": "significance#date"
    }
  ]
}
```

### 4. Journal Entries Table
```json
{
  "TableName": "v7-journal-entries",
  "PartitionKey": "userId",
  "SortKey": "date#entryId",
  "Attributes": {
    "userId": "string",
    "entryId": "string",
    "date": "string (YYYY-MM-DD)",
    "sessionType": "enum: training|outdoor|gym|rest",
    "duration": "number (minutes)",
    "location": "string",
    "gradesAttempted": ["string"],
    "gradesCompleted": ["string"],
    "physicalCondition": {
      "energy": "number (1-10)",
      "soreness": {
        "fingers": "number (0-10)",
        "forearms": "number (0-10)", 
        "shoulders": "number (0-10)",
        "back": "number (0-10)",
        "legs": "number (0-10)"
      },
      "injuries": ["string"]
    },
    "technicalFocus": ["string"],
    "mentalState": "string",
    "notes": "string",
    "media": ["string (S3 URLs)"],
    "createdAt": "string"
  },
  "GSI": [
    {
      "IndexName": "session-type-index",
      "PartitionKey": "userId", 
      "SortKey": "sessionType#date"
    }
  ]
}
```

### 5. Training Plans Table
```json
{
  "TableName": "v7-training-plans",
  "PartitionKey": "userId",
  "SortKey": "planId", 
  "Attributes": {
    "userId": "string",
    "planId": "string",
    "name": "string",
    "startDate": "string",
    "endDate": "string",
    "weeklyStructure": {
      "monday": {
        "type": "enum: strength|power|endurance|technique|rest",
        "focus": ["string"],
        "duration": "number",
        "intensity": "enum: low|moderate|high",
        "notes": "string"
      }
      // ... other days
    },
    "goals": ["string"],
    "active": "boolean",
    "createdAt": "string"
  }
}
```

### 6. Nutrition Profiles Table
```json
{
  "TableName": "v7-nutrition-profiles",
  "PartitionKey": "userId",
  "Attributes": {
    "userId": "string",
    "currentWeight": "number",
    "targetWeight": "number", 
    "height": "number",
    "age": "number",
    "activityLevel": "enum: sedentary|light|moderate|active|very-active",
    "goal": "enum: maintain|cut|bulk|recomp",
    "dietaryRestrictions": ["string"],
    "targets": {
      "calories": "number",
      "protein": "number", 
      "carbs": "number",
      "fat": "number",
      "hydration": "number"
    },
    "updatedAt": "string"
  }
}
```

### 7. Nutrition Logs Table
```json
{
  "TableName": "v7-nutrition-logs",
  "PartitionKey": "userId",
  "SortKey": "date",
  "Attributes": {
    "userId": "string",
    "date": "string (YYYY-MM-DD)",
    "meals": [
      {
        "id": "string",
        "name": "string",
        "time": "string",
        "calories": "number",
        "protein": "number",
        "carbs": "number", 
        "fat": "number",
        "notes": "string"
      }
    ],
    "totalCalories": "number",
    "macros": {
      "protein": "number",
      "carbs": "number",
      "fat": "number"
    },
    "hydration": "number",
    "supplements": ["string"],
    "updatedAt": "string"
  }
}
```

### 8. Reference Tables

#### Exercises Table
```json
{
  "TableName": "v7-exercises",
  "PartitionKey": "exerciseId",
  "Attributes": {
    "exerciseId": "string",
    "name": "string",
    "type": "enum: strength|power|endurance|technique|recovery",
    "equipment": ["string"],
    "instructions": "string",
    "sets": "number",
    "reps": "string",
    "duration": "number",
    "restPeriod": "number",
    "progressionLevel": "enum: beginner|intermediate|advanced",
    "safetyNotes": "string",
    "createdAt": "string"
  },
  "GSI": [
    {
      "IndexName": "type-level-index",
      "PartitionKey": "type",
      "SortKey": "progressionLevel"
    }
  ]
}
```

#### Chat Templates Table
```json
{
  "TableName": "v7-chat-templates",
  "PartitionKey": "templateType",
  "SortKey": "templateId",
  "Attributes": {
    "templateType": "enum: coaching|nutrition|technique|motivation|analysis",
    "templateId": "string",
    "prompt": "string",
    "context": ["string"],
    "priority": "number",
    "conditions": {
      "userLevel": "enum: beginner|intermediate|advanced",
      "dataAge": "number (days)",
      "triggers": ["string"]
    },
    "createdAt": "string"
  }
}
```

## Access Patterns

### Primary Access Patterns
1. **User Profile Management**: Get/Update user + athlete profile
2. **Session Logging**: Create/Read journal entries by user and date range
3. **Achievement Tracking**: Create/Read benchmark sends, ordered by date or grade
4. **Training Planning**: Get active training plan, update progress
5. **Nutrition Tracking**: Daily nutrition log CRUD operations
6. **AI Context Retrieval**: Get recent data across all domains for AI coaching

### AI Context Queries
1. **Recent Performance**: Last 30 days of journal entries + benchmark sends
2. **Goal Tracking**: Current goals + recent progress toward targets
3. **Health Patterns**: Injury history + recent soreness patterns
4. **Nutrition Compliance**: Last 7 days nutrition vs targets
5. **Training Adherence**: Planned vs actual sessions

### Performance Considerations
- **Hot Partitions**: Distribute user data across multiple partitions using userId prefix
- **Time-Series Optimization**: Use date-based sort keys for chronological queries
- **Read Optimization**: Project only needed attributes for large scans
- **Write Optimization**: Batch writes for bulk operations

## Estimated Costs (Monthly)

### DynamoDB
- **On-Demand**: ~$25-50/month for 1000 active users
- **Provisioned**: ~$15-30/month with auto-scaling

### Lambda
- **Execution**: ~$5-15/month (assumes 1M requests)
- **Duration**: Depends on AI context retrieval complexity

### API Gateway  
- **REST API**: ~$3.50 per million requests
- **HTTP API**: ~$1.00 per million requests (recommended)

### Bedrock
- **Claude 3.5 Sonnet**: ~$15 per 1M input tokens, ~$75 per 1M output tokens
- **Estimated**: $50-200/month depending on usage

### Total Estimated Monthly Cost
- **Development**: $50-100/month
- **Production (1K users)**: $150-400/month