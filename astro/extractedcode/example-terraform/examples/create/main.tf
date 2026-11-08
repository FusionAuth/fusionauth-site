# :snippet-start: provider
terraform {
  required_providers {
    fusionauth = {
      source  = "fusionauth/fusionauth"
      version = "~> 1.3"
    }
  }
}

# reads the API key and URL from FA_API_KEY and FA_DOMAIN
provider "fusionauth" {}
# :snippet-end:

# :snippet-start: forumTenant
resource "fusionauth_tenant" "forum" {
  name = "Forum"
  lifecycle {
    prevent_destroy = true
  }
}

resource "fusionauth_key" "forum" {
  algorithm = "RS256"
  length    = 2048
  name      = "Forum access token key"
}
# :snippet-end:

# :snippet-start: forumApplication
resource "fusionauth_application" "forum" {
  tenant_id = fusionauth_tenant.forum.id
  name      = "Forum"
  jwt_configuration {
    enabled         = true
    access_token_id = fusionauth_key.forum.id
  }
  lifecycle {
    # the forum app writes its own settings to this field through the API
    ignore_changes = [data]
  }
}

resource "fusionauth_application_role" "admin" {
  application_id = fusionauth_application.forum.id
  name           = "admin"
  is_super_role  = true
}

resource "fusionauth_application_role" "user" {
  application_id = fusionauth_application.forum.id
  name           = "user"
  is_default     = true
}
# :snippet-end:
