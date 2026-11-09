# Testing Lambdas

The tested code for the [Test Lambdas](https://fusionauth.io/docs/lambdas/testing) guide. Follow the guide to build the same project from scratch.

## Project Contents

* `kickstart/kickstart.json` configures FusionAuth for the guide.
* `complete-application` holds the lambda, the harness unit test, and the integration test from the guide.
* `tests` runs the whole guide against FusionAuth.

## Run the Tests

The tests start FusionAuth with `astro/public/docs/docker-compose.yml`, the file the guide tells readers to download, so the FusionAuth version follows `fusionauth-version`. Run the tests from the `fusionauth-site` repository:

```shell
bash astro/extractedcode/example-testing-lambdas/tests/test.sh
```

The tests need Docker and `jq`.
