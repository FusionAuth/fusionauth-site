# Example Device Limiting Express.js Application Using FusionAuth APIs With A UI

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/example-device-limit-friendly). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This repo holds an example Express.js application that uses FusionAuth as the identity provider. 
This application will use an OAuth Authorization Code Grant workflow to log a user in and 
get them access and refresh tokens. It also implements a form of device limiting using FusionAuth's APIs and webhooks. This is a user friendly example of device limiting which presents the user with a list of devices they are logged in on and allows them to log out of a device if they are over the limit.

You can read more about this implementation in the device limiting in the [Device Limiting Guide](https://fusionauth.io/docs/extend/examples/device-limiting) on the FusionAuth website. The guide also contains alternative solutions to implementing device limiting and links to relevant GitHub issues.

This application is based on the [Express.js Quickstart](https://fusionauth.io/docs/quickstarts/quickstart-javascript-express-web/).

## Project Contents

The `docker-compose.yml` file and the `kickstart` directory are used to start and configure a local FusionAuth server.

The `/complete-application` directory contains a fully working version of the application.

## Project Dependencies
* Docker, for running FusionAuth
* Node 16 or later, for running the Changebank Express.js application

## FusionAuth Installation via Docker

In the root of this project directory (next to this README) are two files [a Docker compose file](./docker-compose.yml) and an [environment variables configuration file](./.env). Assuming you have Docker installed on your machine, you can stand up FusionAuth up on your machine with:

```
docker compose up -d
```

The FusionAuth configuration files also make use of a unique feature of FusionAuth, called [Kickstart](https://fusionauth.io/docs/v1/tech/installation-guide/kickstart): when FusionAuth comes up for the first time, it will look at the [Kickstart file](./kickstart/kickstart.json) and mimic API calls to configure FusionAuth for use when it is first run. 

> **NOTE**: If you ever want to reset the FusionAuth system, delete the volumes created by docker compose by executing `docker compose down -v`. 

FusionAuth will be initially configured with these settings:

* Your client Id is: `e9fdb985-9173-4e01-9d73-ac2d60d1dc8e`
* Your client secret is: `super-secret-secret-that-should-be-regenerated-for-production`
* Your example username is `richard@example.com` and your password is `password`.
* Your admin username is `admin@example.com` and your password is `password`.
* Your fusionAuthBaseUrl is 'http://localhost:9011/'

You can log into the [FusionAuth admin UI](http://localhost:9011/admin) and look around if you want, but with Docker/Kickstart you don't need to.

## Running the Example App
To run the application, first go into the project directory

```shell
cd complete-application
```

Install dependencies

```shell
npm install
```

Start the application

```shell
npm run dev
```
