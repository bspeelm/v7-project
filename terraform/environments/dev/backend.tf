terraform {
  backend "s3" {
    bucket         = "v7-climbing-terraform-state-dev"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "v7-climbing-terraform-locks-dev"
  }
}