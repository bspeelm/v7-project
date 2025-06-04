# DynamoDB Tables for V7 Climbing Journal

locals {
  table_prefix = "${var.environment}-v7"
}

# Users Table
resource "aws_dynamodb_table" "users" {
  name           = "${local.table_prefix}-users"
  billing_mode   = var.billing_mode
  hash_key       = "userId"
  
  read_capacity  = var.billing_mode == "PROVISIONED" ? var.read_capacity : null
  write_capacity = var.billing_mode == "PROVISIONED" ? var.write_capacity : null

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  global_secondary_index {
    name     = "email-index"
    hash_key = "email"
    
    read_capacity  = var.billing_mode == "PROVISIONED" ? var.read_capacity : null
    write_capacity = var.billing_mode == "PROVISIONED" ? var.write_capacity : null
    
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = var.point_in_time_recovery
  }

  tags = var.common_tags
}

# Athlete Profiles Table
resource "aws_dynamodb_table" "athlete_profiles" {
  name         = "${local.table_prefix}-athlete-profiles"
  billing_mode = var.billing_mode
  hash_key     = "userId"

  read_capacity  = var.billing_mode == "PROVISIONED" ? var.read_capacity : null
  write_capacity = var.billing_mode == "PROVISIONED" ? var.write_capacity : null

  attribute {
    name = "userId"
    type = "S"
  }

  point_in_time_recovery {
    enabled = var.point_in_time_recovery
  }

  tags = var.common_tags
}

# Journal Entries Table
resource "aws_dynamodb_table" "journal_entries" {
  name         = "${local.table_prefix}-journal-entries"
  billing_mode = var.billing_mode
  hash_key     = "userId"
  range_key    = "date#entryId"

  read_capacity  = var.billing_mode == "PROVISIONED" ? var.read_capacity : null
  write_capacity = var.billing_mode == "PROVISIONED" ? var.write_capacity : null

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "date#entryId"
    type = "S"
  }

  attribute {
    name = "sessionType#date"
    type = "S"
  }

  global_secondary_index {
    name     = "session-type-index"
    hash_key = "userId"
    range_key = "sessionType#date"
    
    read_capacity  = var.billing_mode == "PROVISIONED" ? var.read_capacity : null
    write_capacity = var.billing_mode == "PROVISIONED" ? var.write_capacity : null
    
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = var.point_in_time_recovery
  }

  tags = var.common_tags
}

# Benchmark Sends Table
resource "aws_dynamodb_table" "benchmark_sends" {
  name         = "${local.table_prefix}-benchmark-sends"
  billing_mode = var.billing_mode
  hash_key     = "userId"
  range_key    = "date#sendId"

  read_capacity  = var.billing_mode == "PROVISIONED" ? var.read_capacity : null
  write_capacity = var.billing_mode == "PROVISIONED" ? var.write_capacity : null

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "date#sendId"
    type = "S"
  }

  attribute {
    name = "gradeNumeric#date"
    type = "S"
  }

  attribute {
    name = "significance#date"
    type = "S"
  }

  global_secondary_index {
    name     = "grade-progression-index"
    hash_key = "userId"
    range_key = "gradeNumeric#date"
    
    read_capacity  = var.billing_mode == "PROVISIONED" ? var.read_capacity : null
    write_capacity = var.billing_mode == "PROVISIONED" ? var.write_capacity : null
    
    projection_type = "ALL"
  }

  global_secondary_index {
    name     = "significance-index"
    hash_key = "userId"
    range_key = "significance#date"
    
    read_capacity  = var.billing_mode == "PROVISIONED" ? var.read_capacity : null
    write_capacity = var.billing_mode == "PROVISIONED" ? var.write_capacity : null
    
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = var.point_in_time_recovery
  }

  tags = var.common_tags
}

# Training Plans Table
resource "aws_dynamodb_table" "training_plans" {
  name         = "${local.table_prefix}-training-plans"
  billing_mode = var.billing_mode
  hash_key     = "userId"
  range_key    = "planId"

  read_capacity  = var.billing_mode == "PROVISIONED" ? var.read_capacity : null
  write_capacity = var.billing_mode == "PROVISIONED" ? var.write_capacity : null

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "planId"
    type = "S"
  }

  point_in_time_recovery {
    enabled = var.point_in_time_recovery
  }

  tags = var.common_tags
}

# Nutrition Profiles Table
resource "aws_dynamodb_table" "nutrition_profiles" {
  name         = "${local.table_prefix}-nutrition-profiles"
  billing_mode = var.billing_mode
  hash_key     = "userId"

  read_capacity  = var.billing_mode == "PROVISIONED" ? var.read_capacity : null
  write_capacity = var.billing_mode == "PROVISIONED" ? var.write_capacity : null

  attribute {
    name = "userId"
    type = "S"
  }

  point_in_time_recovery {
    enabled = var.point_in_time_recovery
  }

  tags = var.common_tags
}

# Nutrition Logs Table
resource "aws_dynamodb_table" "nutrition_logs" {
  name         = "${local.table_prefix}-nutrition-logs"
  billing_mode = var.billing_mode
  hash_key     = "userId"
  range_key    = "date"

  read_capacity  = var.billing_mode == "PROVISIONED" ? var.read_capacity : null
  write_capacity = var.billing_mode == "PROVISIONED" ? var.write_capacity : null

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "date"
    type = "S"
  }

  point_in_time_recovery {
    enabled = var.point_in_time_recovery
  }

  tags = var.common_tags
}

# Reference Tables

# Exercises Table
resource "aws_dynamodb_table" "exercises" {
  name         = "${local.table_prefix}-exercises"
  billing_mode = var.billing_mode
  hash_key     = "exerciseId"

  read_capacity  = var.billing_mode == "PROVISIONED" ? var.read_capacity : null
  write_capacity = var.billing_mode == "PROVISIONED" ? var.write_capacity : null

  attribute {
    name = "exerciseId"
    type = "S"
  }

  attribute {
    name = "type"
    type = "S"
  }

  attribute {
    name = "progressionLevel"
    type = "S"
  }

  global_secondary_index {
    name     = "type-level-index"
    hash_key = "type"
    range_key = "progressionLevel"
    
    read_capacity  = var.billing_mode == "PROVISIONED" ? var.read_capacity : null
    write_capacity = var.billing_mode == "PROVISIONED" ? var.write_capacity : null
    
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = var.point_in_time_recovery
  }

  tags = var.common_tags
}

# Chat Templates Table
resource "aws_dynamodb_table" "chat_templates" {
  name         = "${local.table_prefix}-chat-templates"
  billing_mode = var.billing_mode
  hash_key     = "templateType"
  range_key    = "templateId"

  read_capacity  = var.billing_mode == "PROVISIONED" ? var.read_capacity : null
  write_capacity = var.billing_mode == "PROVISIONED" ? var.write_capacity : null

  attribute {
    name = "templateType"
    type = "S"
  }

  attribute {
    name = "templateId"
    type = "S"
  }

  point_in_time_recovery {
    enabled = var.point_in_time_recovery
  }

  tags = var.common_tags
}