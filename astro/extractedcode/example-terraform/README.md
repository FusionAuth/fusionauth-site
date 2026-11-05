# FusionAuth Terraform Examples

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/example-terraform). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

The configuration from the [Manage FusionAuth With Terraform](https://fusionauth.io/docs/deploy/production/terraform) guide:

* `examples/create`: creates a Tenant, a signing key, an Application, and two roles.
* `examples/import`: brings the default Tenant and the FusionAuth Application under Terraform management. `examples/import/first-plan` holds the configuration before the first plan.
* `examples/data-source`: creates an Application in the default Tenant without managing the Tenant.
* `kickstart/kickstart.json`: a Kickstart file that creates the API key for the examples.

Each example reads the FusionAuth URL from `FA_DOMAIN` and the API key from `FA_API_KEY`.

## Test

`bash tests/test.sh` starts FusionAuth with Docker Compose and the Kickstart file. The script then runs each example with Terraform in a container and checks that:

* Each example applies.
* A second plan finds no changes.
* A plan ignores changes to the **data** field of the `Forum` Application.

The test runs the FusionAuth version in the `fusionauth-version` file at the root of the site repository. To test another version, set `FUSIONAUTH_VERSION`.

## Maintenance

* A FusionAuth release can add or change default Tenant or Application settings. When that happens, the import check fails because the plan of `examples/import/main.tf` shows changes. To fix the check, run the plan against the new version and copy the reported current values into `examples/import/main.tf`.
* The guide shows an excerpt of `terraform plan` output for the first import plan. The test doesn't check the excerpt. When you update the provider, Terraform, or FusionAuth version, compare the excerpt with real output.

Learn more about FusionAuth: https://fusionauth.io
