variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "v7-climbing-journal"
}

variable "database_config" {
  description = "Database configuration"
  type = object({
    billing_mode           = string
    point_in_time_recovery = bool
    backup_retention_days  = number
  })
}