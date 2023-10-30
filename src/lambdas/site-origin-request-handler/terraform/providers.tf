#
# Terraform provider configuration
#
terraform {
  required_version = "~> 1.6.2"

  backend "s3" {
    bucket         = "fusionauth-svc-terraform-state"
    region         = "us-west-2"
    dynamodb_table = "terraform-state"
    encrypt        = true
    key            = "fusionauth-site/172023253951-us-east-1/lambdas/site-origin-request-handler/terraform.tfstate"
    role_arn       = "arn:aws:iam::752443094709:role/github-actions"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.22.0"
    }
  }
}

#
# Define the AWS Provider
#
provider "aws" {
  region = "us-east-1"
  assume_role {
    role_arn     = "arn:aws:iam::172023253951:role/github-actions"
    session_name = "fusionauth-site"
  }

  default_tags {
    tags = {
      managedBy       = "terraform"
      terraformRepo   = "fusionauth-site"
      terraformConfig = "src/lambdas/site-origin-request-handler/terraform"
      environment     = "dev"
      team            = "support"
      service         = "fusionauth-site"
    }
  }
}
