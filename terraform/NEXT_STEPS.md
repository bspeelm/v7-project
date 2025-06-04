# Next Steps for V7 Climbing Journal Infrastructure

## Current Status (as of 2025-06-04)
- ✅ AWS Account: 002060795112 (correct account)
- ✅ State Backend: Deployed (v7-climbing-terraform-state-dev)
- ✅ Database Module: All 9 DynamoDB tables deployed

## Immediate Next Steps

### 1. Lambda Functions Module
Create `/terraform/modules/lambda-functions/` with:

#### Required Lambda Functions (from lambda-architecture.md):
1. **User CRUD Functions**
   - `createUser`, `getUser`, `updateUser`, `deleteUser`
   - `getUserByEmail` (using GSI)

2. **Athlete Profile Functions**
   - `createAthleteProfile`, `getAthleteProfile`, `updateAthleteProfile`

3. **Journal Entry Functions**
   - `createJournalEntry`, `getJournalEntries`, `updateJournalEntry`, `deleteJournalEntry`
   - `getJournalEntriesByType` (using GSI)

4. **Benchmark Send Functions**
   - `createBenchmarkSend`, `getBenchmarkSends`, `updateBenchmarkSend`
   - `getBenchmarkSendsByGrade`, `getBenchmarkSendsBySignificance` (using GSIs)

5. **AI Context Functions**
   - `getAIContext` - Aggregates user data for AI responses
   - `processAIChat` - Handles chat requests with Bedrock

#### Module Structure:
```
lambda-functions/
├── main.tf              # Lambda function definitions
├── variables.tf         # Input variables
├── outputs.tf          # Function ARNs and names
├── iam.tf              # IAM roles and policies
├── layers.tf           # Shared Lambda layers
└── src/                # Function source code
    ├── users/
    ├── athlete-profiles/
    ├── journal-entries/
    ├── benchmark-sends/
    ├── training-plans/
    ├── nutrition/
    ├── ai-context/
    └── shared/         # Shared utilities
```

#### Key Requirements:
- Node.js 20.x runtime
- Environment variables for table names
- Proper error handling (400/404/500 responses)
- Input validation with Zod
- DynamoDB client with retry logic
- Structured logging with correlation IDs

### 2. API Gateway Module
After Lambda functions are deployed, create API Gateway with:
- REST API endpoints as defined in `api-gateway-architecture.md`
- Lambda integrations
- CORS configuration
- API keys and usage plans

### 3. AI Services Module
Configure Bedrock access:
- Claude Opus 4 for complex coaching
- Claude Sonnet 4 for routing/classification
- Proper IAM roles for Bedrock access

## Important Files to Reference
1. **Architecture Documents**:
   - `lambda-architecture.md` - Complete Lambda specifications
   - `api-gateway-architecture.md` - API endpoint definitions
   - `backend-architecture-plan.md` - DynamoDB schemas
   - `ai-context-retrieval-system.md` - Context aggregation logic

2. **Current Infrastructure**:
   - Database tables are in `terraform/modules/database/`
   - Table names follow pattern: `dev-v7-{table-name}`
   - All tables use PAY_PER_REQUEST billing

3. **Context Libraries**:
   - `/context/climbing-context-library.json` - Climbing knowledge base
   - `/context/prompt-library.json` - AI prompt templates

## Commands for Next Session
```bash
# Verify current infrastructure
cd terraform/environments/dev
terraform state list

# See table ARNs (needed for Lambda IAM)
terraform output -json database_table_arns

# Start Lambda module development
mkdir -p terraform/modules/lambda-functions/src
```

## Testing Approach
1. Deploy one simple Lambda first (e.g., `getUser`)
2. Test with AWS CLI before adding more functions
3. Add functions incrementally
4. Test error scenarios (missing user, invalid input)

## Remember
- Lambda functions need access to specific DynamoDB tables only
- Use least privilege IAM policies
- Include the JSON context libraries in Lambda layers for AI functions
- Follow the error response format from architecture docs