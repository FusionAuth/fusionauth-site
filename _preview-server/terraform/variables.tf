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
  description = "EC2 instance type. m6i.2xlarge (8 vCPU / 32 GB) matches the prod build runner."
  type        = string
  default     = "m6i.2xlarge"
}

variable "github_repo_url" {
  description = "HTTPS clone URL of the public GitHub repository"
  type        = string
  default     = "https://github.com/FusionAuth/fusionauth-site.git"
}
