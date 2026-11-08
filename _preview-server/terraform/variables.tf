variable "admin_email" {
  description = "Email address for Let's Encrypt certificate notifications"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-2"
}

variable "instance_type" {
  description = "EC2 instance type. Must be Graviton (arm64) to match the AMI; c8g.2xlarge is 8 vCPU / 16 GB."
  type        = string
  default     = "c8g.2xlarge"
}

variable "github_repo_url" {
  description = "HTTPS clone URL of the public GitHub repository"
  type        = string
  default     = "https://github.com/FusionAuth/fusionauth-site.git"
}
