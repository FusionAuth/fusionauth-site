# Example SCIM Integration

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/example-scim-integration). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.


This is an example SCIM integration.

You'll need an enterprise version of FusionAuth, maven and a modern version of java. Tested with java 17.

To run it:

* set up SCIM as documented in the FusionAuth documentation: https://fusionauth.io/docs/v1/tech/core-concepts/scim
* Edit the file and modify the constants at the top.
* `mvn compile` to compile it.
* `mvn exec:java -Dexec.mainClass="io.fusionauth.example.scim.ScimExample" -Dexec.args="client_secret get"`

The first argument is the client secret from the SCIM client entity.

The second is the operation. Supported operations are:

* get: retrieves a user
* create: creates a user
* list: lists users
