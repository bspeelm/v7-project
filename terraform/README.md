# V7 Climbing Journal - Terraform Infrastructure

This directory contains the Infrastructure as Code (IaC) for the V7 Climbing Journal project using Terraform.

## 🚀 Quick Start

### Prerequisites
- AWS CLI configured with appropriate credentials
- Terraform >= 1.6.0
- bash shell (for scripts)

### Initial Setup

1. **Create State Backend** (one-time setup per environment):
```bash
./scripts/init-state-backend.sh -e dev
```

2. **Initialize Terraform**:
```bash
cd environments/dev
terraform init
```

3. **Deploy Infrastructure**:
```bash
# From project root
./scripts/deploy.sh -e dev
```

## 📁 Directory Structure

```
terraform/
├── environments/          # Environment-specific configurations
│   ├── dev/              # Development environment
│   ├── staging/          # Staging environment
│   └── prod/             # Production environment
├── modules/              # Reusable Terraform modules
│   ├── database/         # DynamoDB tables
│   ├── lambda-functions/ # Lambda functions
│   ├── api-gateway/      # API Gateway configuration
│   ├── ai-services/      # Bedrock and AI resources
│   ├── storage/          # S3 buckets
│   ├── monitoring/       # CloudWatch and alerts
│   └── security/         # Security configurations
├── scripts/              # Deployment scripts
│   ├── deploy.sh         # Main deployment script
│   ├── init-state-backend.sh
│   └── ...
└── docs/                 # Documentation
```

## 🔧 Common Operations

### Deploy to Development
```bash
./scripts/deploy.sh -e dev
```

### Deploy Specific Module
```bash
./scripts/deploy.sh -e dev -m database
```

### Plan Changes (Dry Run)
```bash
./scripts/deploy.sh -e dev --plan-only
```

### Deploy to Production
```bash
# Requires manual confirmation
./scripts/deploy.sh -e prod
```

## 🏗️ Modules

### Database Module
Manages all DynamoDB tables:
- Users table
- Athlete profiles
- Journal entries
- Benchmark sends
- Training plans
- Nutrition data

### Lambda Functions Module
Deploys serverless functions:
- CRUD operations for each domain
- AI context retrieval
- Chat processing with Claude

### API Gateway Module
Configures REST API:
- User authentication endpoints
- Resource CRUD operations
- AI coaching endpoints

## 🔐 Security

- State files are encrypted in S3
- DynamoDB tables use encryption at rest
- IAM roles follow least privilege principle
- Sensitive outputs are marked as sensitive

## 🚨 Production Considerations

1. **Always plan before applying** to production
2. **Manual approval required** for production deployments
3. **Backup state** before major changes
4. **Monitor costs** with budget alerts

## 📋 Environment Variables

Each environment has its own `terraform.tfvars`:

```hcl
# Dev environment example
environment = "dev"
database_config = {
  billing_mode = "PAY_PER_REQUEST"
  point_in_time_recovery = false
}
```

## 🔄 CI/CD Integration

GitHub Actions workflow automatically:
- Validates Terraform on all PRs
- Plans changes for review
- Auto-deploys to dev on merge to develop
- Requires approval for production

## 📚 Additional Documentation

- [Terraform Workflow Guide](docs/TERRAFORM_WORKFLOW.md)
- [Module Development Guide](docs/MODULE_DEVELOPMENT.md)
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md)

## ⚠️ Important Notes

1. Never commit `.tfvars` files with sensitive data
2. Always use remote state for team collaboration
3. Tag all resources appropriately for cost tracking
4. Use targeted applies (`-target`) carefully