terraform {
  required_providers {
    fusionauth = {
      source  = "fusionauth/fusionauth"
      version = "~> 1.3"
    }
  }
}

provider "fusionauth" {}

# :snippet-start: dataSource
data "fusionauth_tenant" "default" {
  name = "Default"
}

resource "fusionauth_application" "forum" {
  tenant_id = data.fusionauth_tenant.default.id
  name      = "Forum"
}
# :snippet-end:
