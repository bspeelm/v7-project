# AI Climbing Coach - Application Architecture

## Overview
A personalized AI climbing coach application that tracks user progress, provides contextual advice, and helps climbers achieve their goals through structured journaling and AI-powered insights.

## Data Model

### DynamoDB Tables

#### 1. Users Table
```
PK: USER#{userId}
SK: PROFILE
Attributes:
- userId (UUID)
- email
- name
- createdAt
- subscription: {
    tier: 'free' | 'pro' | 'premium'
    status: 'active' | 'cancelled' | 'expired'
    expiresAt: timestamp
}
- preferences: {
    units: 'metric' | 'imperial'
    timezone: string
}
```

#### 2. Athlete Profiles Table
```
PK: USER#{userId}
SK: ATHLETE_PROFILE
Attributes:
- age
- weight
- height
- yearsClimbing
- currentGrades: {
    indoor: { slab: string, vertical: string, overhang: string }
    outdoor: { sport: string, boulder: string, trad: string }
}
- goals: [{ grade: string, targetDate: date, type: string }]
- weaknesses: []
- strengths: []
- dietaryRestrictions: []
- injuryHistory: []
- updatedAt: timestamp
```

#### 3. Journal Entries Table
```
PK: USER#{userId}
SK: JOURNAL#{timestamp}
GSI1PK: USER#{userId}#YEAR#{year}
GSI1SK: MONTH#{month}#DAY#{day}
Attributes:
- entryId (UUID)
- date
- sessionType: 'training' | 'outdoor' | 'gym' | 'rest'
- duration: minutes
- location
- gradesAttempted: []
- gradesCompleted: []
- physicalCondition: {
    energy: 1-10
    soreness: {}
    injuries: []
}
- technicalFocus: []
- mentalState: string
- notes: string
- media: [] // S3 URLs for photos/videos
- createdAt: timestamp
```

#### 4. Training Plans Table
```
PK: USER#{userId}
SK: PLAN#{planId}
Attributes:
- planId (UUID)
- name
- startDate
- endDate
- weeklyStructure: {}
- goals: []
- active: boolean
- createdAt: timestamp
```

#### 5. Nutrition Logs Table
```
PK: USER#{userId}
SK: NUTRITION#{date}
Attributes:
- date
- meals: []
- totalCalories
- macros: { protein: g, carbs: g, fat: g }
- hydration: ml
- supplements: []
```

#### 6. Chat History Table
```
PK: USER#{userId}
SK: CHAT#{timestamp}
Attributes:
- messageId (UUID)
- role: 'user' | 'assistant'
- content: string
- context: {} // Relevant data used for this response
- createdAt: timestamp
```

## AWS Architecture

### 1. Frontend (React SPA)
- **AWS Amplify** or **S3 + CloudFront**
- React with TypeScript
- Tailwind CSS for styling
- AWS Amplify UI components for auth

### 2. Authentication
- **AWS Cognito**
  - User pools for authentication
  - Identity pools for authorization
  - Social sign-in (Google, Apple)
  - MFA support
  - Custom attributes for subscription tier

### 3. API Layer
- **API Gateway** (REST or HTTP API)
  - JWT authorizer using Cognito tokens
  - Rate limiting by subscription tier
  - CORS configuration
  - Request/response validation

### 4. Business Logic
- **Lambda Functions** (Node.js/TypeScript)
  - User management
  - Journal CRUD operations
  - Training plan generation
  - Nutrition tracking
  - Chat message handling
  - Data aggregation for insights

### 5. AI Integration
- **AWS Bedrock**
  - Claude 3 Sonnet/Haiku for chat responses
  - Custom prompts with user context
  - Response streaming for better UX
  - Token usage tracking per user

### 6. Data Storage
- **DynamoDB**
  - Single-table design for user data
  - Global secondary indexes for queries
  - Point-in-time recovery
  - Auto-scaling

- **S3**
  - User media uploads (photos/videos)
  - Static assets
  - Backup storage
  - Pre-signed URLs for secure access

### 7. Backend Services
- **App Runner** or **ECS Fargate**
  - WebSocket server for real-time chat
  - Background job processing
  - Scheduled tasks (reminders, reports)

### 8. Additional Services
- **EventBridge**
  - Scheduled tasks (daily summaries, reminders)
  - Event-driven architecture

- **SES**
  - Email notifications
  - Progress reports
  - Subscription reminders

- **CloudWatch**
  - Application monitoring
  - Custom metrics
  - Alarms for errors

- **Secrets Manager**
  - API keys
  - Third-party integrations

## API Endpoints

### Authentication
- POST /auth/signup
- POST /auth/signin
- POST /auth/refresh
- POST /auth/signout
- POST /auth/forgot-password
- POST /auth/confirm-password

### User Profile
- GET /users/profile
- PUT /users/profile
- DELETE /users/profile

### Athlete Profile
- GET /athlete/profile
- PUT /athlete/profile
- POST /athlete/goals
- DELETE /athlete/goals/{goalId}

### Journal
- GET /journal/entries?from={date}&to={date}
- GET /journal/entries/{entryId}
- POST /journal/entries
- PUT /journal/entries/{entryId}
- DELETE /journal/entries/{entryId}
- POST /journal/entries/{entryId}/media

### Training
- GET /training/plans
- GET /training/plans/{planId}
- POST /training/plans
- PUT /training/plans/{planId}
- DELETE /training/plans/{planId}
- POST /training/generate-plan

### Nutrition
- GET /nutrition/logs?date={date}
- POST /nutrition/logs
- PUT /nutrition/logs/{date}
- GET /nutrition/insights?from={date}&to={date}

### Chat
- POST /chat/message
- GET /chat/history?limit={limit}&before={timestamp}
- DELETE /chat/history
- POST /chat/generate-insights

### Analytics
- GET /analytics/progress?metric={metric}&period={period}
- GET /analytics/summary?period={period}
- GET /analytics/trends

## Subscription Tiers

### Free Tier
- 3 journal entries per week
- Basic AI coaching (10 messages/month)
- Progress tracking
- Basic analytics

### Pro Tier ($9.99/month)
- Unlimited journal entries
- 100 AI coaching messages/month
- Advanced analytics
- Training plan generation
- Media uploads (5GB)
- Email reports

### Premium Tier ($19.99/month)
- Everything in Pro
- Unlimited AI coaching
- Priority AI responses
- Custom training plans
- Video analysis
- 1-on-1 AI strategy sessions
- API access
- 20GB media storage

## Security Considerations

1. **Data Encryption**
   - Encryption at rest (DynamoDB, S3)
   - Encryption in transit (TLS 1.3)
   - Field-level encryption for sensitive data

2. **Access Control**
   - IAM roles with least privilege
   - Resource-based policies
   - API key rotation

3. **Data Privacy**
   - GDPR compliance
   - User data export
   - Right to deletion
   - Data retention policies

4. **Rate Limiting**
   - Per-user limits based on tier
   - DDoS protection
   - API throttling

## Deployment Strategy

1. **Infrastructure as Code**
   - AWS CDK or Terraform
   - Environment separation (dev, staging, prod)
   - Blue-green deployments

2. **CI/CD Pipeline**
   - GitHub Actions or AWS CodePipeline
   - Automated testing
   - Security scanning
   - Staged rollouts

3. **Monitoring**
   - Real-time dashboards
   - Error tracking (Sentry)
   - Performance monitoring
   - Cost monitoring

## Cost Optimization

1. **Lambda**
   - Reserved concurrency for predictable workloads
   - ARM-based Graviton2 processors
   - Function bundling

2. **DynamoDB**
   - On-demand pricing for development
   - Auto-scaling for production
   - Time-based data archival

3. **Bedrock**
   - Model selection based on task complexity
   - Response caching for common queries
   - Token usage monitoring

4. **S3**
   - Lifecycle policies for media
   - Intelligent tiering
   - CloudFront caching

## Future Enhancements

1. **Mobile Apps**
   - React Native implementation
   - Offline support
   - Push notifications

2. **Social Features**
   - Training partner matching
   - Progress sharing
   - Community challenges

3. **Wearable Integration**
   - Heart rate data
   - Recovery metrics
   - Auto-session detection

4. **Advanced AI Features**
   - Video form analysis
   - Injury prediction
   - Personalized cue generation
   - Voice coaching