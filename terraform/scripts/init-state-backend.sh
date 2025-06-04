#!/bin/bash
# Initialize Terraform state backend (S3 bucket and DynamoDB table)

set -euo pipefail

ENVIRONMENT=""
AWS_REGION="us-east-1"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

usage() {
    echo "Usage: $0 -e ENVIRONMENT"
    echo ""
    echo "Options:"
    echo "  -e, --environment    Environment (dev, staging, prod)"
    echo "  -r, --region         AWS region (default: us-east-1)"
    echo ""
    echo "This script creates the S3 bucket and DynamoDB table needed for Terraform state management."
    exit 1
}

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -r|--region)
            AWS_REGION="$2"
            shift 2
            ;;
        *)
            echo "Unknown option $1"
            usage
            ;;
    esac
done

if [[ -z "$ENVIRONMENT" ]]; then
    echo "Error: Environment is required"
    usage
fi

BUCKET_NAME="v7-climbing-terraform-state-${ENVIRONMENT}"
TABLE_NAME="v7-climbing-terraform-locks-${ENVIRONMENT}"

echo -e "${BLUE}🏗️  Creating Terraform state backend for $ENVIRONMENT...${NC}"

# Create S3 bucket
echo -e "${BLUE}Creating S3 bucket: $BUCKET_NAME${NC}"
aws s3 mb "s3://$BUCKET_NAME" --region "$AWS_REGION" || echo "Bucket may already exist"

# Enable versioning
echo -e "${BLUE}Enabling S3 bucket versioning...${NC}"
aws s3api put-bucket-versioning \
    --bucket "$BUCKET_NAME" \
    --versioning-configuration Status=Enabled

# Enable encryption
echo -e "${BLUE}Enabling S3 bucket encryption...${NC}"
aws s3api put-bucket-encryption \
    --bucket "$BUCKET_NAME" \
    --server-side-encryption-configuration '{
        "Rules": [
            {
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }
        ]
    }'

# Block public access
echo -e "${BLUE}Blocking public access to S3 bucket...${NC}"
aws s3api put-public-access-block \
    --bucket "$BUCKET_NAME" \
    --public-access-block-configuration '{
        "BlockPublicAcls": true,
        "IgnorePublicAcls": true,
        "BlockPublicPolicy": true,
        "RestrictPublicBuckets": true
    }'

# Create DynamoDB table for locking
echo -e "${BLUE}Creating DynamoDB table: $TABLE_NAME${NC}"
aws dynamodb create-table \
    --table-name "$TABLE_NAME" \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region "$AWS_REGION" \
    --tags "Key=Environment,Value=$ENVIRONMENT" "Key=Project,Value=v7-climbing-journal" "Key=Purpose,Value=terraform-locking" \
    || echo "Table may already exist"

echo -e "${GREEN}✅ Terraform state backend created successfully!${NC}"
echo ""
echo -e "${YELLOW}Backend configuration:${NC}"
echo "  Bucket: $BUCKET_NAME"
echo "  Table:  $TABLE_NAME"
echo "  Region: $AWS_REGION"
echo ""
echo -e "${YELLOW}You can now run terraform init in environments/$ENVIRONMENT/${NC}"