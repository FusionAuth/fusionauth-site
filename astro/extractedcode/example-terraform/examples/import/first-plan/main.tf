terraform {
  required_providers {
    fusionauth = {
      source  = "fusionauth/fusionauth"
      version = "~> 1.3"
    }
  }
}

provider "fusionauth" {}

# :snippet-start: importFirstPlan
import {
  to = fusionauth_tenant.default
  id = "<default-tenant-id>"
}

resource "fusionauth_tenant" "default" {
  name = "Default"
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
  lifecycle {
    prevent_destroy = true
  }
}
# :snippet-end:
