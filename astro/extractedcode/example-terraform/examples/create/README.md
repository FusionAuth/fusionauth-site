# Create FusionAuth Resources

Creates a Tenant, an RSA signing key, an Application, and an `admin` role and a `user` role. The Application signs access tokens with the signing key. Terraform ignores changes to the **data** field of the Application, so an app can write to the field through the API.

```shell
export FA_API_KEY="<api-key>"
export FA_DOMAIN="http://localhost:9011"
terraform init
terraform apply
```

See [Manage FusionAuth With Terraform](https://fusionauth.io/docs/operate/deploy/terraform).
