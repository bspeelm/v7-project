#!/bin/bash
# Safe deployment script for V7 Climbing Journal Terraform

set -euo pipefail

ENVIRONMENT=""
MODULE=""
AUTO_APPROVE=false
PLAN_ONLY=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Usage function
usage() {
    echo "Usage: $0 -e ENVIRONMENT [-m MODULE] [--auto-approve] [--plan-only]"
    echo ""
    echo "Options:"
    echo "  -e, --environment    Environment (dev, staging, prod)"
    echo "  -m, --module         Specific module to deploy (optional)"
    echo "  --auto-approve       Auto-approve changes (not allowed for prod)"
    echo "  --plan-only          Only generate plan, don't apply"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -e dev                           # Deploy entire dev environment"
    echo "  $0 -e dev -m database              # Deploy only database module in dev"
    echo "  $0 -e staging --plan-only          # Generate plan for staging"
    echo "  $0 -e dev --auto-approve           # Auto-approve dev deployment"
    exit 1
}

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
        --plan-only)
            PLAN_ONLY=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "Unknown option $1"
            usage
            ;;
    esac
done

# Validation
if [[ -z "$ENVIRONMENT" ]]; then
    echo -e "${RED}Error: Environment is required${NC}"
    usage
fi

if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo -e "${RED}Error: Environment must be dev, staging, or prod${NC}"
    exit 1
fi

# Check if environment directory exists
ENV_DIR="environments/$ENVIRONMENT"
if [[ ! -d "$ENV_DIR" ]]; then
    echo -e "${RED}Error: Environment directory $ENV_DIR does not exist${NC}"
    exit 1
fi

# Safety checks for production
if [[ "$ENVIRONMENT" == "prod" ]]; then
    echo -e "${RED}🚨 PRODUCTION DEPLOYMENT DETECTED 🚨${NC}"
    echo "Running additional safety checks..."
    
    # Require manual approval for production
    if [[ "$AUTO_APPROVE" == "true" ]]; then
        echo -e "${RED}❌ Auto-approve not allowed for production${NC}"
        exit 1
    fi
    
    # Confirm production deployment
    echo -e "${YELLOW}Are you sure you want to deploy to PRODUCTION? This will affect live users.${NC}"
    read -p "Type 'yes' to continue: " confirm
    if [[ "$confirm" != "yes" ]]; then
        echo "Production deployment cancelled"
        exit 1
    fi
fi

# Change to environment directory
cd "$ENV_DIR"

echo -e "${BLUE}🔍 Initializing Terraform for $ENVIRONMENT...${NC}"
terraform init -upgrade

# Validate configuration
echo -e "${BLUE}✅ Validating Terraform configuration...${NC}"
terraform validate

# Generate plan
echo -e "${BLUE}📋 Generating Terraform plan...${NC}"
PLAN_ARGS=""
if [[ -n "$MODULE" ]]; then
    PLAN_ARGS="-target=module.$MODULE"
    echo -e "${YELLOW}🎯 Targeting module: $MODULE${NC}"
fi

terraform plan $PLAN_ARGS -out=tfplan

# Check for destroy operations in production
if [[ "$ENVIRONMENT" == "prod" ]]; then
    if terraform show tfplan | grep -q "will be destroyed"; then
        echo -e "${RED}❌ Destroy operations detected in production plan!${NC}"
        echo "Destroy operations found:"
        terraform show tfplan | grep "will be destroyed" || true
        echo ""
        read -p "Are you ABSOLUTELY sure you want to continue? (yes/no): " destroy_confirm
        if [[ "$destroy_confirm" != "yes" ]]; then
            echo "Deployment cancelled due to destroy operations"
            rm -f tfplan
            exit 1
        fi
    fi
fi

# If plan-only, show plan and exit
if [[ "$PLAN_ONLY" == "true" ]]; then
    echo -e "${GREEN}📋 Plan generated successfully. Review above.${NC}"
    echo "Plan saved as tfplan. To apply:"
    echo "cd $ENV_DIR && terraform apply tfplan"
    exit 0
fi

# Apply changes
if [[ "$AUTO_APPROVE" == "true" ]]; then
    echo -e "${GREEN}🚀 Applying changes automatically...${NC}"
    terraform apply tfplan
else
    echo -e "${YELLOW}📋 Plan generated. Review above and confirm:${NC}"
    read -p "Apply these changes? (yes/no): " confirm
    if [[ "$confirm" == "yes" ]]; then
        echo -e "${GREEN}🚀 Applying changes...${NC}"
        terraform apply tfplan
    else
        echo "Deployment cancelled"
        rm -f tfplan
        exit 1
    fi
fi

# Cleanup
rm -f tfplan

echo -e "${GREEN}✅ Deployment complete!${NC}"

# Show outputs
echo -e "${BLUE}📤 Environment outputs:${NC}"
terraform output