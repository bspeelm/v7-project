# Development Environment Configuration

terraform {
  required_version = ">= 1.6.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

locals {
  common_tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

# Database Module
module "database" {
  source = "../../modules/database"
  
  environment             = var.environment
  billing_mode           = var.database_config.billing_mode
  point_in_time_recovery = var.database_config.point_in_time_recovery
  backup_retention_days  = var.database_config.backup_retention_days
  
  common_tags = local.common_tags
}

# Output important values for other modules
output "database_table_names" {
  description = "DynamoDB table names"
  value       = module.database.table_names
}

output "database_table_arns" {
  description = "DynamoDB table ARNs"
  value       = module.database.table_arns
  sensitive   = true
}