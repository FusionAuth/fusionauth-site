# Example API Consents Application

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/example-api-consents-platform). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This repo holds two example JavaScript applications. 

* MoneyScope, a financial analysis tool
* Changebank APIs

This application will use an OAuth Authorization Code Grant workflow to log a user in, request needed OAuth Scopes and get them access and
refresh tokens. The access token will be used to make a request against the Changebank APIs to find the user's balance.

This application was built to illustrate the [API Consents Platform use case](https://fusionauth.io/docs/get-started/use-cases/api-consents-platform).

## Project Contents

The `docker-compose.yml` file and the `kickstart` directory are used to start and configure a local FusionAuth server.

The `moneyscope-application` directory contains a fully working version of the MoneyScope application.

The `changebank-apis` directory contains a fully working version of the Changebank APIs.

`create-application` is a directory that contains a FusionAuth SDK script to create the third-party application instead of using Kickstart. It can safely be ignored.

## Project Dependencies

* Docker, for running FusionAuth
* Node 20.12.2 or later, for running the applications
* A [valid Essentials or Enterprise license key](https://fusionauth.io/pricing)

## Running FusionAuth

First, edit `kickstart/kickstart.json` and add a valid Essentials or Enterprise license key. Look for the line `"licenseId": "LICENSE ID",` and replace `LICENSE ID` with a valid key.

To run FusionAuth, just stand up the docker containers using `docker compose`.

```shell
docker compose up
```

This will start a PostgreSQL database, OpenSearch service, and the FusionAuth server.

## Running the Apps

For the MoneyScope application:

Copy the `env.sample` file to `.env` and edit it if needed. (For example, if you are using a remote FusionAuth instance.)

```shell
cd moneyscope-application
npm install
npm run dev
```

In a separate terminal window, to start the Changebank APIs:

Copy the `env.sample` file to `.env` and edit it if needed. (For example, if you are using a remote FusionAuth instance.)

```shell
cd changebank-apis
npm install
npm run dev
```

## Testing Out the Apps

Visit the local webserver at `http://localhost:8080/` and sign in using the credentials:

* username: richard@example.com
* password: password

Accept the scopes and you'll be logged into the MoneyScope application.

You can modify the bank balance by changing the APIs in the `changebank-apis/routes/index.js` file.

