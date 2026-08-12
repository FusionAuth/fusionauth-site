# Testing Lambdas Application

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/localcode/example-testing-lambdas). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-example-testing-lambdas) instead.

- remove search from compose file
- reset && docker compose down -v && docker compose up

This repo holds a modified version of the FusionAuth 5 minute getting started guide. It uses the kickstart functionality to obviate manual configuration of FusionAuth.

This project is used to show examples of creating and testing lambdas.

This project is paired with the [Lambda Guide](https://fusionauth.io/docs/v1/tech/guides/lambda). In order for the tests to pass, you need to work through that guide.

## Project Contents

The `docker-compose.yml` file and the `kickstart` directory are used to start and configure a local FusionAuth server.

The `/app` directory contains a fully working version of the application.

## Project Dependencies

* Docker, for running FusionAuth
* Node.js 18 or later, for running the example application

## Running FusionAuth
To run FusionAuth, just stand up the docker containers using `docker-compose`.

```shell
docker compose up
```

This will start a PostgreSQL database, and Elastic service, and the FusionAuth server.

## Running the Example App

```shell
cd app && npm install && npm start
```

Visit the local webserver at `http://localhost:3000/` and sign in using the credentials:

* username: richard@example.com
* password: password
