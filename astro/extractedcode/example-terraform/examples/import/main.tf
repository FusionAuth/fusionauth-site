terraform {
  required_providers {
    fusionauth = {
      source  = "fusionauth/fusionauth"
      version = "~> 1.3"
    }
  }
}

provider "fusionauth" {}

# :snippet-start: importReconciled
import {
  to = fusionauth_tenant.default
  id = "<default-tenant-id>"
}

resource "fusionauth_tenant" "default" {
  name = "Default"
  email_configuration {
    default_from_name                   = "FusionAuth"
    implicit_email_verification_allowed = true
  }
  jwt_configuration {
    refresh_token_revocation_policy_on_login_prevented = true
    refresh_token_revocation_policy_on_password_change = true
  }
  phone_configuration {
    implicit_phone_verification_allowed = true
  }
  lifecycle {
    prevent_destroy = true
  }
}

import {
  to = fusionauth_application.fusionauth
  id = "3c219e58-ed0e-4b18-ad48-f4f92793ae32"
}

resource "fusionauth_application" "fusionauth" {
  tenant_id = fusionauth_tenant.default.id
  name      = "FusionAuth"
  jwt_configuration {
    enabled                         = true
    refresh_token_expiration_policy = "SlidingWindow"
    refresh_token_ttl_minutes       = 60
    refresh_token_usage_policy      = "OneTimeUse"
    ttl_seconds                     = 60
  }
  lifecycle {
    prevent_destroy = true
  }
}
# :snippet-end:
