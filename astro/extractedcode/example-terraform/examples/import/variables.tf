variable "fusionauth_api_key" {
  description = "The API Key for the FusionAuth instance"
  type        = string
  default     = ""
  sensitive   = true
}

variable "fusionauth_host" {
  description = "Host for FusionAuth instance"
  type        = string
  default     = ""
}

variable "fusionauth_default_tenant_id" {
  description = "The Tenant Id of the Default FusionAuth Tenant"
  type        = string
  default     = ""
}

variable "fusionauth_default_application_id" {
  description = "The Application Id of the Default FusionAuth Application"
  type        = string
  default     = "3c219e58-ed0e-4b18-ad48-f4f92793ae32"
}
