output "table_names" {
  description = "Map of logical names to DynamoDB table names"
  value = {
    users              = aws_dynamodb_table.users.name
    athlete_profiles   = aws_dynamodb_table.athlete_profiles.name
    journal_entries    = aws_dynamodb_table.journal_entries.name
    benchmark_sends    = aws_dynamodb_table.benchmark_sends.name
    training_plans     = aws_dynamodb_table.training_plans.name
    nutrition_profiles = aws_dynamodb_table.nutrition_profiles.name
    nutrition_logs     = aws_dynamodb_table.nutrition_logs.name
    exercises          = aws_dynamodb_table.exercises.name
    chat_templates     = aws_dynamodb_table.chat_templates.name
  }
}

output "table_arns" {
  description = "Map of logical names to DynamoDB table ARNs"
  value = {
    users              = aws_dynamodb_table.users.arn
    athlete_profiles   = aws_dynamodb_table.athlete_profiles.arn
    journal_entries    = aws_dynamodb_table.journal_entries.arn
    benchmark_sends    = aws_dynamodb_table.benchmark_sends.arn
    training_plans     = aws_dynamodb_table.training_plans.arn
    nutrition_profiles = aws_dynamodb_table.nutrition_profiles.arn
    nutrition_logs     = aws_dynamodb_table.nutrition_logs.arn
    exercises          = aws_dynamodb_table.exercises.arn
    chat_templates     = aws_dynamodb_table.chat_templates.arn
  }
  sensitive = true
}

output "gsi_arns" {
  description = "Map of Global Secondary Index ARNs"
  value = {
    users_email_index           = "${aws_dynamodb_table.users.arn}/index/email-index"
    journal_session_type_index  = "${aws_dynamodb_table.journal_entries.arn}/index/session-type-index"
    benchmark_grade_index       = "${aws_dynamodb_table.benchmark_sends.arn}/index/grade-progression-index"
    benchmark_significance_index = "${aws_dynamodb_table.benchmark_sends.arn}/index/significance-index"
    exercises_type_level_index  = "${aws_dynamodb_table.exercises.arn}/index/type-level-index"
  }
  sensitive = true
}