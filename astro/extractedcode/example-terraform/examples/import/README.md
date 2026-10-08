# Single FusionAuth instance configuration using Terraform

This directory contains code as an example of structuring Terraform configurations for a  single FusionAuth instance configuration, where no external dependencies were used.

## Features

This code illustrates how to:

1. Use the FusionAuth Terraform Provider
2. Specify and use of variables from the existing FusionAuth instance
3. Import existing Resources, specifically the Default Tenant and FusionAuth Application
4. Create an Application on top of the Imported Resources with a few example configurations
5. The use of prevent_destroy and ignore_changes

The initial configuration is based on the kickstart.json in this repository.

## See also

Check [FusionAuth 5-Minute Guide](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide) and [FusionAuth Kickstart](https://fusionauth.io/docs/v1/tech/installation-guide/kickstart) for the initial FusionAuth setup.

And get more details around the FusionAuth Terraform configuration in the [FusionAuth Documentation - Configuration Management](https://fusionauth.io/docs/v1/tech/admin-guide/configuration-management).

Follow [Terraform Best Practices](https://www.terraform-best-practices.com) for more information about naming, code style and tips for most common problems.
