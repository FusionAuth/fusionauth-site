# Example Machine To Machine Applicaion

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/example-machine-to-machine). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This repo shows you how to use FusionAuth for a machine to machine scenario, where you have devices represented as entities inside FusionAuth, with permissions  modeled between them.

This application will use an OAuth Client Credentials Grant workflow to request an access token. The access token will be used to make a request against an APIs to retrieve news or weather information.

This application was built to illustrate the [Machine to Machine use case](https://fusionauth.io/docs/get-started/use-cases/machine-to-machine).

## Project Contents

The `docker-compose.yml` file and the `kickstart` directory are used to start and configure a local FusionAuth server.

The `apis` directory contains a sample working version of the APIs.

The `request-api` directory contains a script that can be used to make a request against the API.

The `update-plan` directory contains a script that can update the plan for a given entity.

The `create-entity` directory contains a FusionAuth SDK script to create entities instead of using Kickstart (or in addition to). It can safely be ignored.

## Project Dependencies

* Docker, for running FusionAuth
* Node 20.12.2 or later, for running the applications
* A [valid Starter, Essentials or Enterprise license key](https://fusionauth.io/pricing)

## Running FusionAuth

First, edit `kickstart/kickstart.json` and add a valid Starer, Essentials or Enterprise license key. Look for the line `"licenseId": "LICENSE ID",` and replace `LICENSE ID` with a valid key.

To run FusionAuth, stand up the docker containers using `docker compose`.

```shell
docker compose up
```

This will start a PostgreSQL database, OpenSearch service, and the FusionAuth server.

## Running the App

For the APIs:

Copy the `env.sample` file to `.env` and edit it if needed. (For example, if you are using a remote FusionAuth instance.)

```shell
cd apis
npm install
npm run dev
```

## Testing Out the Apps

Change into the `request-api` directory.

Copy the `env.sample` file to `.env` and edit it if needed. (For example, if you are using a remote FusionAuth instance.)

Run the script, which will request the access token from FusionAuth and then the news from your local API server.

```shell
cd request-api
npm install
npm run request-news
```

If you want to log into the FusionAuth admin UI and look around, do so by logging into http://localhost:9011 with the username `admin@example.com` and the password `password`.
