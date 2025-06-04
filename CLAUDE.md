# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# V7 Climbing Journal - AI Context

This is an AI-assisted journal for tracking progress toward climbing V7. The journal entries provide context for AI to give personalized climbing advice.

## Project Structure

This is a hybrid project with both a React frontend application and markdown-based journal entries:

- `/frontend/` - React + TypeScript + Vite application for tracking climbing progress
- `/journal/` - Markdown journal entries for AI analysis
- `/context/` - Reference files for AI coaching context

## Development Commands

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server (Vite)
npm run build        # Build for production (TypeScript + Vite)
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

## Application Architecture

### Frontend Stack
- **Framework**: React 19 + TypeScript + Vite
- **Routing**: React Router DOM v7
- **State Management**: Zustand with persistence
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: TailwindCSS
- **Form Handling**: React Hook Form + Zod validation
- **Icons**: Lucide React

### Key Directories
- `src/pages/` - Main application pages (Dashboard, Training, Nutrition, etc.)
- `src/components/` - Reusable UI components organized by domain
- `src/store/` - Zustand stores for state management
- `src/lib/api/` - Data service layer and API utilities
- `src/data/` - JSON mock data files
- `src/types/` - TypeScript type definitions

### Data Layer
The application uses a centralized `DataService` class (`src/lib/api/dataService.ts`) that:
- Imports static JSON data files from `src/data/`
- Provides async API-like methods with simulated delays
- Implements in-memory caching for development
- Handles user profiles, journal entries, training plans, nutrition logs, etc.

### State Management Pattern
- **Zustand stores** for each domain (auth, nutrition, journal, benchmark sends)
- **TanStack Query** for server state management and caching
- **Persistent storage** for authentication state

### Authentication
Development mode with hardcoded credentials:
- Username: `dev-user-1`
- Password: `password`

### Component Organization
Components are organized by domain:
- `benchmark/` - Benchmark send tracking
- `chat/` - AI chat interface
- `journal/` - Training journal forms
- `nutrition/` - Meal planning and logging
- `profile/` - User profile management
- `training/` - Training plan components
- `ui/` - Reusable UI primitives

## Journal Entry Structure
Each entry should include:
- Date
- Session type (training/outdoor/gym)
- Grades attempted and completed
- Physical condition (energy, soreness, injuries)
- Technical focus areas
- Mental state
- Notes on specific climbs or breakthroughs

## AI Coaching Focus Areas
When analyzing journal entries, AI should consider:
- Progression patterns
- Recovery needs
- Technique improvements
- Mental game development
- Training load balance
- Injury prevention
- Breakthrough moments

## Key Context Files

### Athlete Information
- `athlete-profile.md` - Current stats, performance levels, background
- `goals-progression.md` - Timeline and milestones toward V7
- `quick-reference.md` - Daily targets, supplement timing, recovery indicators

### Training Context
- `training-insights.md` - Major discoveries about training needs
- `training-sessions.md` - Reference for typical weekly structure
- `nutrition-plan.md` - Vegetarian protein strategies and meal planning

### Journal Management
- `journal/` - All climbing session entries
- `journal-template.md` - Template for creating new entries
- Use date format: `YYYY-MM-DD-description.md`

## Important Athlete Context
- 42-year-old vegetarian climber
- 3 years climbing experience
- Currently climbing indoor V5-V6 (slab), V4 (overhang)
- Weight: 173-175 lbs (goal: 165 lbs)
- Weakness: Overhang climbing (tension maintenance, not finger strength)
- Training 15+ hours/week
- Under-eating (1800 cal, 50g protein vs 2200-2400 cal, 130g protein needed)

## Backend Architecture Documentation

### Architecture Reference Files
The following files contain the complete backend architecture plan for transitioning from JSON mock data to production AWS infrastructure:

#### Core Architecture Documents
1. **`backend-architecture-plan.md`** - Master architecture overview
   - DynamoDB table schemas for all data domains
   - AWS service integration (API Gateway, Lambda, Bedrock, S3)
   - Cost estimates and performance considerations
   - Complete data model with relationships

2. **`lambda-architecture.md`** - Lambda function specifications
   - Atomic CRUD operations for each data domain
   - AI-specific functions for context retrieval and coaching
   - Error handling patterns and performance optimizations
   - Utility functions and validation logic

3. **`api-gateway-architecture.md`** - REST API design
   - Complete endpoint specifications with OpenAPI schemas
   - Authentication and authorization patterns
   - Rate limiting and CORS configuration
   - Error response formats

4. **`ai-context-retrieval-system.md`** - AI data aggregation
   - Dynamic context retrieval for personalized coaching
   - Performance analytics and pattern detection
   - Caching strategies and token optimization
   - Context prioritization algorithms

5. **`ai-prompt-templates-decision-trees.md`** - AI coaching system
   - Agent-specific prompt templates (technique, training, nutrition, motivation)
   - Decision trees for intelligent routing
   - Context-aware response selection
   - Quality assurance and fallback strategies

6. **`bedrock-claude-integration.md`** - AI model integration
   - Claude Opus 4 for complex reasoning and coaching
   - Claude Sonnet 4 for routing and classification
   - Cost optimization through intelligent model selection
   - Performance monitoring and error handling

### How to Use These Files

#### For Backend Development
- **Reference `backend-architecture-plan.md`** first for overall system understanding
- **Use `lambda-architecture.md`** when implementing specific CRUD operations
- **Follow `api-gateway-architecture.md`** for endpoint specifications and error handling
- **Implement AI features** using the context retrieval and prompt template specifications

#### For AI Integration Work
- **Start with `ai-context-retrieval-system.md`** to understand data aggregation patterns
- **Use `ai-prompt-templates-decision-trees.md`** for coaching logic implementation
- **Reference `bedrock-claude-integration.md`** for model selection and cost optimization

#### For Frontend Migration
- **Map current DataService methods** to new API endpoints in `api-gateway-architecture.md`
- **Update type definitions** based on DynamoDB schemas in `backend-architecture-plan.md`
- **Implement authentication flows** following API Gateway specifications

#### For DevOps/Infrastructure
- **Use DynamoDB schemas** from `backend-architecture-plan.md` for table creation
- **Deploy Lambda functions** following specifications in `lambda-architecture.md`
- **Configure API Gateway** using resource definitions in `api-gateway-architecture.md`
- **Set up Bedrock integration** following `bedrock-claude-integration.md`

### Architecture Implementation Phases
1. **Phase 1**: DynamoDB tables and basic CRUD Lambdas
2. **Phase 2**: API Gateway endpoints and authentication
3. **Phase 3**: AI context retrieval and basic coaching
4. **Phase 4**: Advanced AI features with Opus/Sonnet integration
5. **Phase 5**: Performance optimization and monitoring

## Terraform Infrastructure Management

### Current Infrastructure Status
- **AWS Account**: 002060795112
- **Region**: us-east-1
- **State Backend**: 
  - S3 Bucket: `v7-climbing-terraform-state-dev`
  - DynamoDB Table: `v7-climbing-terraform-locks-dev`
- **Deployed Modules**:
  - ✅ Database Module (9 DynamoDB tables deployed)
  - ⏳ Lambda Functions Module (next step)
  - ⏳ API Gateway Module
  - ⏳ AI Services Module

### Terraform Project Structure
The project uses a modular Terraform architecture with complete environment isolation:

```
terraform/
├── environments/           # Environment-specific configurations
│   ├── dev/               # Development environment (currently deployed)
│   ├── staging/           # Staging environment  
│   └── prod/              # Production environment
├── modules/               # Reusable Terraform modules
│   ├── database/          # ✅ DynamoDB tables and indexes (DEPLOYED)
│   ├── lambda-functions/  # ⏳ Lambda functions and layers (NEXT)
│   ├── api-gateway/       # ⏳ API Gateway resources
│   ├── ai-services/       # ⏳ Bedrock and AI-related resources
│   ├── storage/           # S3 buckets and CloudFront
│   ├── monitoring/        # CloudWatch, X-Ray, alarms
│   └── security/          # WAF, security groups, policies
├── scripts/               # Deployment and utility scripts
└── docs/                  # Terraform documentation
```

### Deployed DynamoDB Tables
All tables are deployed with `dev-v7-` prefix:
- `users` - User authentication and profiles (GSI: email-index)
- `athlete-profiles` - Detailed athlete information
- `journal-entries` - Training session logs (GSI: session-type-index)
- `benchmark-sends` - Notable climbing achievements (GSIs: grade-progression-index, significance-index)
- `training-plans` - Structured training programs
- `nutrition-profiles` - User nutrition settings
- `nutrition-logs` - Daily nutrition tracking
- `exercises` - Exercise reference library (GSI: type-level-index)
- `chat-templates` - AI chat response templates

### Key Terraform Files
1. **`terraform-architecture-plan.md`** - Complete Terraform architecture design
   - Modular structure with environment separation
   - Resource dependency management
   - State isolation strategies
   - Safe deployment practices

2. **`terraform/docs/TERRAFORM_WORKFLOW.md`** - Operational workflow
   - Daily development workflow
   - Environment management procedures
   - Safety practices and troubleshooting
   - CI/CD integration patterns

### Infrastructure Management Commands

#### Initial Setup (One-time per environment)
```bash
# Create state backend infrastructure
./terraform/scripts/init-state-backend.sh -e dev

# Initialize Terraform for environment
cd terraform/environments/dev
terraform init
```

#### Daily Development Workflow
```bash
# Plan changes for review
./terraform/scripts/deploy.sh -e dev --plan-only

# Deploy to development
./terraform/scripts/deploy.sh -e dev

# Deploy specific module only
./terraform/scripts/deploy.sh -e dev -m database
```

#### Production Deployment
```bash
# Always plan first for production
./terraform/scripts/deploy.sh -e prod --plan-only

# Deploy to production (requires manual confirmation)
./terraform/scripts/deploy.sh -e prod
```

### Terraform Best Practices
- **Environment Isolation**: Separate state files prevent cross-environment issues
- **Modular Design**: Single-responsibility modules for easy maintenance
- **Safe Deployments**: Built-in safety checks and approval processes
- **Resource Dependencies**: Explicit dependency management between modules
- **State Management**: Remote state with locking prevents conflicts

### Infrastructure Deployment Order
1. **State Backend**: ✅ Created S3 bucket and DynamoDB table for state management
2. **Database Module**: ✅ Deployed all 9 DynamoDB tables with GSIs
3. **Lambda Functions**: ⏳ NEXT - Deploy CRUD and AI functions (see `lambda-architecture.md`)
4. **API Gateway**: ⏳ Deploy REST API with Lambda integrations (see `api-gateway-architecture.md`)
5. **AI Services**: ⏳ Configure Bedrock and Claude model access (see `bedrock-claude-integration.md`)
6. **Monitoring**: ⏳ Deploy CloudWatch alarms and dashboards

### Next Steps: Lambda Functions Module
The Lambda functions module should implement:
1. **CRUD Functions** for each DynamoDB table (based on `lambda-architecture.md`)
2. **AI Context Functions** for aggregating user data (see `ai-context-retrieval-system.md`)
3. **Chat Processing Functions** for Bedrock integration (see `ai-prompt-templates-decision-trees.md`)
4. **Utility Functions** for validation and authorization

Key considerations:
- Use table ARNs from database module outputs
- Implement proper IAM roles with least privilege
- Include error handling as specified in architecture docs
- Set up environment variables for table names

## Common Commands
- Create new journal entry: Copy `journal-template.md` to `journal/YYYY-MM-DD-description.md`
- Review progress: Analyze journal entries chronologically
- Update context files when major insights emerge from journal patterns
- Reference architecture docs before implementing backend features
- Follow API specifications for consistent error handling and response formats