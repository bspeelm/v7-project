# Development Environment Configuration

environment = "dev"
aws_region  = "us-east-1"

# Database Configuration for Development
database_config = {
  billing_mode           = "PAY_PER_REQUEST"  # Cost-effective for dev
  point_in_time_recovery = false              # Not needed for dev
  backup_retention_days  = 1                  # Minimal backup for dev
}