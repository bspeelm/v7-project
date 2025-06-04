# Terraform Architecture Plan for V7 Climbing Journal

## Overview

This document outlines a robust Terraform architecture for managing AWS resources with environment isolation, modular design, and safe deployment practices. The structure prevents resource conflicts and enables independent updates.

## Project Structure

```
terraform/
├── environments/                    # Environment-specific configurations
│   ├── dev/
│   │   ├── main.tf                 # Environment entry point
│   │   ├── variables.tf            # Environment-specific variables
│   │   ├── terraform.tfvars        # Development values
│   │   ├── outputs.tf              # Environment outputs
│   │   └── backend.tf              # Remote state configuration
│   ├── staging/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   ├── outputs.tf
│   │   └── backend.tf
│   └── prod/
│       ├── main.tf
│       ├── variables.tf
│       ├── terraform.tfvars
│       ├── outputs.tf
│       └── backend.tf
├── modules/                        # Reusable Terraform modules
│   ├── core-infrastructure/       # VPC, IAM, basic networking
│   ├── database/                   # DynamoDB tables and indexes
│   ├── api-gateway/               # API Gateway and related resources
│   ├── lambda-functions/          # Lambda functions and layers
│   ├── ai-services/               # Bedrock and AI-related resources
│   ├── storage/                   # S3 buckets and CloudFront
│   ├── monitoring/                # CloudWatch, X-Ray, alarms
│   └── security/                  # WAF, security groups, policies
├── shared/                        # Shared configurations
│   ├── providers.tf               # Provider configurations
│   ├── data.tf                    # Common data sources
│   └── locals.tf                  # Common local values
├── scripts/                       # Deployment and utility scripts
│   ├── deploy.sh                  # Safe deployment script
│   ├── plan-all.sh               # Plan all environments
│   ├── destroy.sh                # Controlled destroy script
│   └── state-management.sh       # State file utilities
└── docs/                         # Terraform documentation
    ├── MODULE_USAGE.md           # How to use each module
    ├── DEPLOYMENT_GUIDE.md       # Step-by-step deployment
    └── TROUBLESHOOTING.md        # Common issues and solutions
```

## Module Design Philosophy

### 1. Single Responsibility Modules
Each module manages a specific domain of resources to minimize blast radius:

```hcl
# modules/database/main.tf - Only DynamoDB resources
resource "aws_dynamodb_table" "users" {
  name           = "${var.environment}-v7-users"
  billing_mode   = var.billing_mode
  hash_key       = "userId"
  
  attribute {
    name = "userId"
    type = "S"
  }
  
  tags = var.common_tags
}

# modules/lambda-functions/main.tf - Only Lambda resources
resource "aws_lambda_function" "user_crud" {
  for_each = var.lambda_functions
  
  function_name = "${var.environment}-${each.key}"
  runtime       = "nodejs20.x"
  handler       = each.value.handler
  
  # Reference database outputs via variables
  environment {
    variables = {
      USERS_TABLE = var.users_table_name
    }
  }
}
```

### 2. Clear Interface Contracts
Modules expose only necessary outputs and require specific inputs:

```hcl
# modules/database/variables.tf
variable "environment" {
  description = "Environment name (dev/staging/prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}

# modules/database/outputs.tf
output "table_names" {
  description = "Map of logical names to DynamoDB table names"
  value = {
    users              = aws_dynamodb_table.users.name
    athlete_profiles   = aws_dynamodb_table.athlete_profiles.name
    journal_entries    = aws_dynamodb_table.journal_entries.name
    # ... other tables
  }
}

output "table_arns" {
  description = "Map of logical names to DynamoDB table ARNs"
  value = {
    users              = aws_dynamodb_table.users.arn
    athlete_profiles   = aws_dynamodb_table.athlete_profiles.arn
    # ... other tables
  }
  sensitive = true
}
```

## Environment Isolation Strategy

### 1. Separate State Files
Each environment maintains its own Terraform state to prevent cross-contamination:

```hcl
# environments/dev/backend.tf
terraform {
  backend "s3" {
    bucket         = "v7-terraform-state-dev"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "v7-terraform-locks-dev"
  }
}

# environments/prod/backend.tf
terraform {
  backend "s3" {
    bucket         = "v7-terraform-state-prod"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "v7-terraform-locks-prod"
  }
}
```

### 2. Environment-Specific Variables
```hcl
# environments/dev/terraform.tfvars
environment = "dev"

# Database configuration
database_config = {
  billing_mode = "PAY_PER_REQUEST"
  backup_retention = 7
}

# Lambda configuration
lambda_config = {
  memory_size = 512
  timeout     = 30
  log_retention = 7
}

# API Gateway configuration
api_gateway_config = {
  throttle_rate  = 100
  throttle_burst = 200
}

# environments/prod/terraform.tfvars
environment = "prod"

# Database configuration
database_config = {
  billing_mode = "PROVISIONED"
  read_capacity = 5
  write_capacity = 5
  backup_retention = 30
  point_in_time_recovery = true
}

# Lambda configuration
lambda_config = {
  memory_size = 1024
  timeout     = 300
  log_retention = 30
  reserved_concurrency = 100
}
```

## Dependency Management

### 1. Module Composition Pattern
Environment configurations compose modules with explicit dependencies:

```hcl
# environments/prod/main.tf
locals {
  common_tags = {
    Environment = var.environment
    Project     = "v7-climbing-journal"
    ManagedBy   = "terraform"
  }
}

# Core infrastructure first
module "core_infrastructure" {
  source = "../../modules/core-infrastructure"
  
  environment  = var.environment
  common_tags  = local.common_tags
}

# Database layer
module "database" {
  source = "../../modules/database"
  
  environment    = var.environment
  common_tags    = local.common_tags
  vpc_id         = module.core_infrastructure.vpc_id
  subnet_ids     = module.core_infrastructure.private_subnet_ids
  
  # Database-specific configuration
  billing_mode         = var.database_config.billing_mode
  backup_retention     = var.database_config.backup_retention
  point_in_time_recovery = var.database_config.point_in_time_recovery
}

# Lambda functions (depends on database)
module "lambda_functions" {
  source = "../../modules/lambda-functions"
  
  environment = var.environment
  common_tags = local.common_tags
  
  # Dependencies from other modules
  vpc_id     = module.core_infrastructure.vpc_id
  subnet_ids = module.core_infrastructure.private_subnet_ids
  
  # Database connections
  dynamodb_tables = module.database.table_names
  dynamodb_arns   = module.database.table_arns
  
  # Lambda configuration
  memory_size          = var.lambda_config.memory_size
  timeout              = var.lambda_config.timeout
  reserved_concurrency = var.lambda_config.reserved_concurrency
}

# API Gateway (depends on Lambda)
module "api_gateway" {
  source = "../../modules/api-gateway"
  
  environment = var.environment
  common_tags = local.common_tags
  
  # Lambda function references
  lambda_functions = module.lambda_functions.function_arns
  
  # API configuration
  throttle_rate  = var.api_gateway_config.throttle_rate
  throttle_burst = var.api_gateway_config.throttle_burst
}
```

### 2. Data Sources for Cross-Module References
Use data sources instead of direct resource references where possible:

```hcl
# modules/lambda-functions/data.tf
data "aws_dynamodb_table" "users" {
  name = var.users_table_name
}

data "aws_iam_policy_document" "lambda_dynamodb_policy" {
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
      "dynamodb:Query",
      "dynamodb:Scan"
    ]
    resources = [
      data.aws_dynamodb_table.users.arn,
      "${data.aws_dynamodb_table.users.arn}/*"
    ]
  }
}
```

## Safe Deployment Practices

### 1. Deployment Script with Safety Checks
```bash
#!/bin/bash
# scripts/deploy.sh

set -euo pipefail

ENVIRONMENT=""
MODULE=""
AUTO_APPROVE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -e|--environment)
      ENVIRONMENT="$2"
      shift 2
      ;;
    -m|--module)
      MODULE="$2"
      shift 2
      ;;
    --auto-approve)
      AUTO_APPROVE=true
      shift
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

# Validation
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
  echo "Error: Environment must be dev, staging, or prod"
  exit 1
fi

# Safety checks for production
if [[ "$ENVIRONMENT" == "prod" ]]; then
  echo "🚨 PRODUCTION DEPLOYMENT DETECTED 🚨"
  echo "Running additional safety checks..."
  
  # Check for destroy operations
  if terraform plan -detailed-exitcode > /dev/null 2>&1; then
    if terraform plan | grep -q "destroy"; then
      echo "❌ Destroy operations detected in production plan!"
      echo "Please review the plan carefully:"
      terraform plan
      read -p "Continue with production deployment? (yes/no): " confirm
      if [[ "$confirm" != "yes" ]]; then
        echo "Deployment cancelled"
        exit 1
      fi
    fi
  fi
  
  # Require manual approval for production
  if [[ "$AUTO_APPROVE" == "true" ]]; then
    echo "❌ Auto-approve not allowed for production"
    exit 1
  fi
fi

cd "environments/$ENVIRONMENT"

echo "🔍 Initializing Terraform..."
terraform init -upgrade

echo "📋 Generating plan..."
terraform plan -out=tfplan

if [[ "$AUTO_APPROVE" == "true" ]]; then
  echo "🚀 Applying changes automatically..."
  terraform apply tfplan
else
  echo "📋 Plan generated. Review above and confirm:"
  read -p "Apply these changes? (yes/no): " confirm
  if [[ "$confirm" == "yes" ]]; then
    echo "🚀 Applying changes..."
    terraform apply tfplan
  else
    echo "Deployment cancelled"
    exit 1
  fi
fi

# Cleanup
rm -f tfplan

echo "✅ Deployment complete!"
```

### 2. Module-Specific Updates
```bash
#!/bin/bash
# scripts/update-module.sh

ENVIRONMENT=""
MODULE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -e|--environment)
      ENVIRONMENT="$2"
      shift 2
      ;;
    -m|--module)
      MODULE="$2"
      shift 2
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

if [[ -z "$ENVIRONMENT" || -z "$MODULE" ]]; then
  echo "Usage: $0 -e ENVIRONMENT -m MODULE"
  exit 1
fi

cd "environments/$ENVIRONMENT"

echo "🎯 Targeting module: $MODULE"
terraform plan -target="module.$MODULE"

read -p "Apply changes to module $MODULE? (yes/no): " confirm
if [[ "$confirm" == "yes" ]]; then
  terraform apply -target="module.$MODULE"
else
  echo "Update cancelled"
fi
```

## State Management Strategy

### 1. Remote State with Locking
```hcl
# shared/backend-config.tf
variable "state_bucket_prefix" {
  description = "Prefix for state bucket names"
  type        = string
  default     = "v7-terraform-state"
}

variable "lock_table_prefix" {
  description = "Prefix for lock table names"  
  type        = string
  default     = "v7-terraform-locks"
}

# Create state management resources
resource "aws_s3_bucket" "terraform_state" {
  bucket = "${var.state_bucket_prefix}-${var.environment}"
  
  tags = var.common_tags
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_dynamodb_table" "terraform_locks" {
  name           = "${var.lock_table_prefix}-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "LockID"
  
  attribute {
    name = "LockID"
    type = "S"
  }
  
  tags = var.common_tags
}
```

### 2. State Import and Migration Scripts
```bash
#!/bin/bash
# scripts/state-management.sh

migrate_state() {
  local from_env=$1
  local to_env=$2
  local resource=$3
  
  echo "Migrating $resource from $from_env to $to_env"
  
  # Export from source
  cd "environments/$from_env"
  terraform state pull > "../temp_state.json"
  
  # Import to destination
  cd "../$to_env"
  terraform import "$resource" $(cat "../temp_state.json" | jq -r ".resources[] | select(.name==\"$resource\") | .instances[0].attributes.id")
  
  # Cleanup
  rm "../temp_state.json"
}

backup_state() {
  local env=$1
  local backup_dir="backups/$(date +%Y%m%d_%H%M%S)"
  
  mkdir -p "$backup_dir"
  
  cd "environments/$env"
  terraform state pull > "../../$backup_dir/${env}_state.json"
  
  echo "State backed up to $backup_dir"
}
```

## CI/CD Integration

### 1. GitHub Actions Workflow
```yaml
# .github/workflows/terraform.yml
name: Terraform

on:
  push:
    branches: [ main, develop ]
    paths: [ 'terraform/**' ]
  pull_request:
    branches: [ main ]
    paths: [ 'terraform/**' ]

env:
  TF_VERSION: 1.6.0

jobs:
  validate:
    name: Validate
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Terraform
      uses: hashicorp/setup-terraform@v3
      with:
        terraform_version: ${{ env.TF_VERSION }}
    
    - name: Terraform Format Check
      run: terraform fmt -check -recursive terraform/
    
    - name: Validate All Environments
      run: |
        for env in dev staging prod; do
          echo "Validating $env..."
          cd terraform/environments/$env
          terraform init -backend=false
          terraform validate
          cd ../../..
        done

  plan:
    name: Plan
    runs-on: ubuntu-latest
    needs: validate
    if: github.event_name == 'pull_request'
    
    strategy:
      matrix:
        environment: [dev, staging]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Terraform
      uses: hashicorp/setup-terraform@v3
      with:
        terraform_version: ${{ env.TF_VERSION }}
    
    - name: Configure AWS Credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        role-to-assume: ${{ secrets[format('AWS_ROLE_{0}', matrix.environment)] }}
        aws-region: us-east-1
    
    - name: Terraform Plan
      run: |
        cd terraform/environments/${{ matrix.environment }}
        terraform init
        terraform plan -no-color > plan.txt
    
    - name: Comment Plan
      uses: actions/github-script@v7
      with:
        script: |
          const fs = require('fs');
          const plan = fs.readFileSync('terraform/environments/${{ matrix.environment }}/plan.txt', 'utf8');
          
          const output = `#### Terraform Plan for ${{ matrix.environment }} 🪐
          \`\`\`
          ${plan}
          \`\`\`
          `;
          
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: output
          });

  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    needs: validate
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    
    strategy:
      matrix:
        environment: [dev]  # Only auto-deploy to dev
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Terraform
      uses: hashicorp/setup-terraform@v3
      with:
        terraform_version: ${{ env.TF_VERSION }}
    
    - name: Configure AWS Credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        role-to-assume: ${{ secrets[format('AWS_ROLE_{0}', matrix.environment)] }}
        aws-region: us-east-1
    
    - name: Deploy
      run: |
        cd terraform/environments/${{ matrix.environment }}
        terraform init
        terraform apply -auto-approve
```

This Terraform architecture provides:
- **Clean separation** of environments and modules
- **Safe deployment** practices with validation
- **State isolation** to prevent cross-environment issues
- **Modular design** for easy maintenance and updates
- **CI/CD integration** for automated validation and deployment