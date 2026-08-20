# Quickstart: WordPress app with FusionAuth

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/localcode/quickstart-wordpress-web). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This repo holds an example WordPress application that uses FusionAuth as the identity provider.

This repository is documented at https://fusionauth.io/docs/quickstarts/quickstart-wordpress-web.

Further reading:
- [FusionAuth OAuth Docs](https://fusionauth.io/docs/v1/tech/oauth/endpoints)

## Project Contents

The `docker-compose.yml` file and the `kickstart` directory are used to start and configure a local FusionAuth server.

The `complete-application` directory contains a fully working version of the application.

## Prerequisites

- Docker 29 or higher for running FusionAuth, WordPress and MySQL database

## Running FusionAuth

To run FusionAuth, just stand up the docker containers using docker-compose

```shell-session
docker compose up
```

This will start a WordPress container, MySQL for WordPress, PostgreSQL and the FusionAuth server

FusionAuth will initially be configured with these settings:

* Your client id is: `e9fdb985-9173-4e01-9d73-ac2d60d1dc8e`
* Your client secret is: `super-secret-secret-that-should-be-regenerated-for-production`
* Your example username is `richard@example.com` and your password is `password`.
* Your admin username is `admin@example.com` and your password is `password`.
* Your fusionAuthBaseUrl is 'http://localhost:9011/'

You can log into the [FusionAuth admin UI](http://localhost:9011/admin) and look around if you want, but with Docker/Kickstart you don't need to.

## Running the Example Application

To run the application, first go into the project directory and configure all WordPress settings and plugins:

```shell-session
cd complete-application
./setup.sh
```

Browse to [http://localhost:3000](http://localhost:3000) and login with `richard@example.com` and `password`.

Follow the tutorial at https://fusionauth.io/docs/quickstarts/quickstart-wordpress-web to learn how to configure WordPress to work with FusionAuth.