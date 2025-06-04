# API Gateway Architecture

## Overview

This document defines the RESTful API structure using AWS API Gateway HTTP APIs for optimal performance and cost. The API follows REST principles with consistent patterns across all resources.

## Base Configuration

### API Gateway Settings
- **Type**: HTTP API (lower latency, lower cost than REST API)
- **Protocol**: HTTPS only
- **CORS**: Enabled for web application
- **Throttling**: 1000 requests per second per user
- **API Keys**: Required for production usage

### Base URL Structure
```
Production: https://api.v7climbing.com/v1
Development: https://dev-api.v7climbing.com/v1
```

## Authentication & Authorization

### JWT Bearer Token Authentication
```yaml
securitySchemes:
  bearerAuth:
    type: http
    scheme: bearer
    bearerFormat: JWT
```

### Authorization Patterns
1. **User Resources**: Must own the resource (`userId` match)
2. **Public Resources**: Read-only access to exercises, templates
3. **Admin Resources**: Admin role required
4. **AI Resources**: Valid user + active subscription

## API Resource Structure

### 1. User Management
```yaml
/v1/users:
  post:
    summary: Create new user account
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [email, name, password]
            properties:
              email: { type: string, format: email }
              name: { type: string, minLength: 1 }
              password: { type: string, minLength: 8 }
    responses:
      201:
        description: User created successfully
        content:
          application/json:
            schema:
              type: object
              properties:
                user: { $ref: '#/components/schemas/User' }
                token: { type: string }
      409:
        description: User already exists

/v1/users/{userId}:
  get:
    summary: Get user profile
    security: [bearerAuth: []]
    parameters:
      - name: userId
        in: path
        required: true
        schema: { type: string }
    responses:
      200:
        description: User profile
        content:
          application/json:
            schema:
              type: object
              properties:
                user: { $ref: '#/components/schemas/User' }
      404:
        description: User not found
  
  put:
    summary: Update user profile
    security: [bearerAuth: []]
    requestBody:
      content:
        application/json:
          schema:
            type: object
            properties:
              name: { type: string }
              preferences:
                type: object
                properties:
                  units: { type: string, enum: [metric, imperial] }
                  timezone: { type: string }
```

### 2. Authentication Endpoints
```yaml
/v1/auth/login:
  post:
    summary: Authenticate user
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [email, password]
            properties:
              email: { type: string, format: email }
              password: { type: string }
    responses:
      200:
        description: Authentication successful
        content:
          application/json:
            schema:
              type: object
              properties:
                user: { $ref: '#/components/schemas/User' }
                token: { type: string }
                expiresAt: { type: string, format: date-time }

/v1/auth/refresh:
  post:
    summary: Refresh access token
    security: [bearerAuth: []]
    responses:
      200:
        description: Token refreshed
        content:
          application/json:
            schema:
              type: object
              properties:
                token: { type: string }
                expiresAt: { type: string, format: date-time }

/v1/auth/logout:
  post:
    summary: Logout user (invalidate token)
    security: [bearerAuth: []]
    responses:
      200:
        description: Logout successful
```

### 3. Athlete Profiles
```yaml
/v1/users/{userId}/profile:
  get:
    summary: Get athlete profile
    security: [bearerAuth: []]
    responses:
      200:
        description: Athlete profile
        content:
          application/json:
            schema:
              type: object
              properties:
                profile: { $ref: '#/components/schemas/AthleteProfile' }
  
  put:
    summary: Update athlete profile
    security: [bearerAuth: []]
    requestBody:
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/AthleteProfileUpdate'
    responses:
      200:
        description: Profile updated
```

### 4. Journal Entries
```yaml
/v1/users/{userId}/journal:
  get:
    summary: List journal entries
    security: [bearerAuth: []]
    parameters:
      - name: startDate
        in: query
        schema: { type: string, format: date }
      - name: endDate  
        in: query
        schema: { type: string, format: date }
      - name: limit
        in: query
        schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
      - name: cursor
        in: query
        schema: { type: string }
        description: Pagination cursor
    responses:
      200:
        description: Journal entries
        content:
          application/json:
            schema:
              type: object
              properties:
                entries: 
                  type: array
                  items: { $ref: '#/components/schemas/JournalEntry' }
                nextCursor: { type: string }
                hasMore: { type: boolean }
  
  post:
    summary: Create journal entry
    security: [bearerAuth: []]
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/JournalEntryCreate'
    responses:
      201:
        description: Entry created
        content:
          application/json:
            schema:
              type: object
              properties:
                entry: { $ref: '#/components/schemas/JournalEntry' }

/v1/users/{userId}/journal/{entryId}:
  get:
    summary: Get specific journal entry
    security: [bearerAuth: []]
    responses:
      200:
        description: Journal entry
        content:
          application/json:
            schema:
              type: object
              properties:
                entry: { $ref: '#/components/schemas/JournalEntry' }
  
  put:
    summary: Update journal entry
    security: [bearerAuth: []]
    requestBody:
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/JournalEntryUpdate'
    responses:
      200:
        description: Entry updated
  
  delete:
    summary: Delete journal entry
    security: [bearerAuth: []]
    responses:
      204:
        description: Entry deleted
```

### 5. Benchmark Sends
```yaml
/v1/users/{userId}/benchmark-sends:
  get:
    summary: List benchmark sends
    security: [bearerAuth: []]
    parameters:
      - name: gradeType
        in: query
        schema: { type: string, enum: [v-scale, yds] }
      - name: significance
        in: query
        schema: { type: string, enum: [breakthrough, milestone, personal-best, project-send] }
      - name: limit
        in: query
        schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
      - name: cursor
        in: query
        schema: { type: string }
    responses:
      200:
        description: Benchmark sends
        content:
          application/json:
            schema:
              type: object
              properties:
                sends:
                  type: array
                  items: { $ref: '#/components/schemas/BenchmarkSend' }
                nextCursor: { type: string }
                hasMore: { type: boolean }
  
  post:
    summary: Create benchmark send
    security: [bearerAuth: []]
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/BenchmarkSendCreate'
    responses:
      201:
        description: Send created

/v1/users/{userId}/benchmark-sends/{sendId}:
  get:
    summary: Get specific benchmark send
    security: [bearerAuth: []]
    responses:
      200:
        description: Benchmark send
  
  put:
    summary: Update benchmark send
    security: [bearerAuth: []]
    responses:
      200:
        description: Send updated
  
  delete:
    summary: Delete benchmark send
    security: [bearerAuth: []]
    responses:
      204:
        description: Send deleted
```

### 6. Training Plans
```yaml
/v1/users/{userId}/training-plans:
  get:
    summary: List training plans
    security: [bearerAuth: []]
    parameters:
      - name: active
        in: query
        schema: { type: boolean }
        description: Filter by active status
    responses:
      200:
        description: Training plans
        content:
          application/json:
            schema:
              type: object
              properties:
                plans:
                  type: array
                  items: { $ref: '#/components/schemas/TrainingPlan' }
  
  post:
    summary: Create training plan
    security: [bearerAuth: []]
    requestBody:
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/TrainingPlanCreate'
    responses:
      201:
        description: Plan created

/v1/users/{userId}/training-plans/active:
  get:
    summary: Get active training plan
    security: [bearerAuth: []]
    responses:
      200:
        description: Active training plan
        content:
          application/json:
            schema:
              type: object
              properties:
                trainingPlan: { $ref: '#/components/schemas/TrainingPlan' }

/v1/users/{userId}/training-plans/{planId}:
  get:
    summary: Get specific training plan
    security: [bearerAuth: []]
    responses:
      200:
        description: Training plan
  
  put:
    summary: Update training plan
    security: [bearerAuth: []]
    responses:
      200:
        description: Plan updated
  
  delete:
    summary: Delete training plan
    security: [bearerAuth: []]
    responses:
      204:
        description: Plan deleted
```

### 7. Nutrition Management
```yaml
/v1/users/{userId}/nutrition/profile:
  get:
    summary: Get nutrition profile
    security: [bearerAuth: []]
    responses:
      200:
        description: Nutrition profile
        content:
          application/json:
            schema:
              type: object
              properties:
                profile: { $ref: '#/components/schemas/NutritionProfile' }
  
  put:
    summary: Update nutrition profile
    security: [bearerAuth: []]
    requestBody:
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/NutritionProfileUpdate'
    responses:
      200:
        description: Profile updated

/v1/users/{userId}/nutrition/logs:
  get:
    summary: List nutrition logs
    security: [bearerAuth: []]
    parameters:
      - name: startDate
        in: query
        schema: { type: string, format: date }
      - name: endDate
        in: query
        schema: { type: string, format: date }
    responses:
      200:
        description: Nutrition logs
        content:
          application/json:
            schema:
              type: object
              properties:
                logs:
                  type: array
                  items: { $ref: '#/components/schemas/NutritionLog' }

/v1/users/{userId}/nutrition/logs/{date}:
  get:
    summary: Get nutrition log for specific date
    security: [bearerAuth: []]
    parameters:
      - name: date
        in: path
        required: true
        schema: { type: string, format: date }
    responses:
      200:
        description: Nutrition log
  
  put:
    summary: Save nutrition log for date
    security: [bearerAuth: []]
    requestBody:
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/NutritionLogUpdate'
    responses:
      200:
        description: Log saved
```

### 8. AI Coaching Endpoints
```yaml
/v1/users/{userId}/ai/chat:
  post:
    summary: Chat with AI coach
    security: [bearerAuth: []]
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [message]
            properties:
              message: { type: string, minLength: 1 }
              conversationId: { type: string }
              context:
                type: object
                properties:
                  sessionType: { type: string }
                  focusArea: { type: string }
    responses:
      200:
        description: AI response
        content:
          application/json:
            schema:
              type: object
              properties:
                response: { type: string }
                conversationId: { type: string }
                suggestions:
                  type: array
                  items: { type: string }

/v1/users/{userId}/ai/context:
  get:
    summary: Get AI context for user
    security: [bearerAuth: []]
    parameters:
      - name: days
        in: query
        schema: { type: integer, minimum: 1, maximum: 90, default: 30 }
    responses:
      200:
        description: User context for AI
        content:
          application/json:
            schema:
              type: object
              properties:
                context: { $ref: '#/components/schemas/AIContext' }

/v1/users/{userId}/ai/insights:
  get:
    summary: Get AI-generated insights
    security: [bearerAuth: []]
    responses:
      200:
        description: AI insights
        content:
          application/json:
            schema:
              type: object
              properties:
                insights:
                  type: array
                  items:
                    type: object
                    properties:
                      type: { type: string }
                      title: { type: string }
                      content: { type: string }
                      priority: { type: string, enum: [high, medium, low] }
                      createdAt: { type: string, format: date-time }
```

### 9. Dashboard & Analytics
```yaml
/v1/users/{userId}/dashboard:
  get:
    summary: Get dashboard data
    security: [bearerAuth: []]
    responses:
      200:
        description: Dashboard statistics
        content:
          application/json:
            schema:
              type: object
              properties:
                stats: { $ref: '#/components/schemas/DashboardStats' }

/v1/users/{userId}/analytics/progress:
  get:
    summary: Get progress analytics
    security: [bearerAuth: []]
    parameters:
      - name: period
        in: query
        schema: { type: string, enum: [week, month, quarter, year], default: month }
    responses:
      200:
        description: Progress analytics
        content:
          application/json:
            schema:
              type: object
              properties:
                analytics: { $ref: '#/components/schemas/ProgressAnalytics' }
```

### 10. Reference Data (Public)
```yaml
/v1/exercises:
  get:
    summary: List available exercises
    parameters:
      - name: type
        in: query
        schema: { type: string, enum: [strength, power, endurance, technique, recovery] }
      - name: level
        in: query
        schema: { type: string, enum: [beginner, intermediate, advanced] }
    responses:
      200:
        description: Exercise database
        content:
          application/json:
            schema:
              type: object
              properties:
                exercises:
                  type: array
                  items: { $ref: '#/components/schemas/Exercise' }

/v1/nutrition/protein-sources:
  get:
    summary: List protein sources
    responses:
      200:
        description: Protein source database

/v1/nutrition/supplements:
  get:
    summary: List supplements
    responses:
      200:
        description: Supplement database
```

### 11. Media Upload
```yaml
/v1/users/{userId}/media/upload:
  post:
    summary: Get signed URL for media upload
    security: [bearerAuth: []]
    requestBody:
      content:
        application/json:
          schema:
            type: object
            required: [fileName, fileType]
            properties:
              fileName: { type: string }
              fileType: { type: string }
              entityType: { type: string, enum: [journal, benchmark-send] }
              entityId: { type: string }
    responses:
      200:
        description: Signed upload URL
        content:
          application/json:
            schema:
              type: object
              properties:
                uploadUrl: { type: string }
                mediaUrl: { type: string }
                fields: { type: object }
```

## Error Response Format

### Standard Error Schema
```yaml
components:
  schemas:
    Error:
      type: object
      required: [error]
      properties:
        error:
          type: object
          required: [code, message, timestamp]
          properties:
            code: { type: string }
            message: { type: string }
            details: { type: object }
            timestamp: { type: string, format: date-time }
```

### HTTP Status Code Usage
- **200**: Success with data
- **201**: Created successfully  
- **204**: Success with no content
- **400**: Bad request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Resource not found
- **409**: Conflict (duplicate resource)
- **429**: Rate limit exceeded
- **500**: Internal server error

## API Gateway Integration

### Lambda Integration Pattern
```yaml
x-amazon-apigateway-integration:
  type: aws_proxy
  httpMethod: POST
  uri: arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:123456789012:function:v7-users-get/invocations
  payloadFormatVersion: '2.0'
```

### Request Validation
```yaml
x-amazon-apigateway-request-validator: all
x-amazon-apigateway-request-validators:
  all:
    validateRequestBody: true
    validateRequestParameters: true
```

### CORS Configuration
```yaml
x-amazon-apigateway-cors:
  allowOrigins:
    - https://app.v7climbing.com
    - https://dev.v7climbing.com
  allowHeaders:
    - Content-Type
    - Authorization
    - X-Api-Key
  allowMethods:
    - GET
    - POST
    - PUT
    - DELETE
    - OPTIONS
  allowCredentials: true
```

## Rate Limiting Strategy

### Usage Plans
```yaml
UsagePlans:
  Free:
    throttle: { rateLimit: 10, burstLimit: 20 }
    quota: { limit: 1000, period: DAY }
  Pro: 
    throttle: { rateLimit: 50, burstLimit: 100 }
    quota: { limit: 10000, period: DAY }
  Premium:
    throttle: { rateLimit: 100, burstLimit: 200 }
    quota: { limit: 50000, period: DAY }
```

### Per-Endpoint Limits
- **AI Chat**: 20 requests/minute per user
- **Context Retrieval**: 60 requests/hour per user
- **Media Upload**: 10 requests/minute per user
- **CRUD Operations**: Standard plan limits

This API Gateway architecture provides:
- **RESTful design** with consistent patterns
- **Comprehensive authentication** and authorization
- **Efficient pagination** for large datasets
- **Proper error handling** with detailed responses
- **Rate limiting** to prevent abuse
- **CORS support** for web applications