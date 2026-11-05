# Import the Default Resources

Brings the default Tenant and the FusionAuth Application under Terraform management. Replace `<default-tenant-id>` with the Id of the default Tenant.

* `first-plan/main.tf` holds the configuration before the first plan.
* `main.tf` adds the values that the first plan reports as changes. A plan of `main.tf` finds no differences.

The values in `main.tf` come from a new FusionAuth instance. Compare the values with the plan for your instance.

See [Manage FusionAuth With Terraform](https://fusionauth.io/docs/deploy/production/terraform#manage-the-default-resources).
