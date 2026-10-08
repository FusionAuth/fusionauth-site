terraform {
  required_providers {
    fusionauth = {
      source = "FusionAuth/fusionauth"
      version = "0.1.101"
    }
  }
}

provider "fusionauth" {
  api_key = var.fusionauth_api_key
  host = var.fusionauth_host
}
# :snippet-start: defaultTenantDataSource
data "fusionauth_tenant" "Default" {
  name = "Default"
}
# :snippet-end:
# :snippet-start: defaultApplicationDataSource
data "fusionauth_application" "FusionAuth" {
  name = "FusionAuth"
}
# :snippet-end:

resource "fusionauth_application" "forum" {
  tenant_id = data.fusionauth_tenant.Default.id
  name = "forum"
  jwt_configuration {
    access_token_id = fusionauth_key.forum-access-token.id
  }
}

resource "fusionauth_application_role" "forum_admin_role" {
  application_id = fusionauth_application.forum.id
  is_default     = false
  is_super_role  = true
  name           = "admin"
}

resource "fusionauth_application_role" "forum_user_role" {
  application_id = fusionauth_application.forum.id
  is_default     = true
  is_super_role  = false
  name           = "user"
}

resource "fusionauth_key" "forum-access-token" {
  algorithm = "HS512"
  name      = "Forum Application Access Token Key"
}
