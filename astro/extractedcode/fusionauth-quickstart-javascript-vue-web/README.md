# Quickstart: Vue app with FusionAuth

This repository contains a Vue app that works with a locally running instance of [FusionAuth](https://fusionauth.io/), the authentication and authorization platform.

## Setup

### Prerequisites
- [Node](https://nodejs.org/en/download/): This will be needed to run the Vue app.
- [Docker](https://www.docker.com): The quickest way to stand up FusionAuth.
  - (Alternatively, you can [Install FusionAuth Manually](https://fusionauth.io/docs/v1/tech/installation-guide/)).

### FusionAuth Installation via Docker

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

### Vue complete-application

The `complete-application` directory contains a minimal Vue app configured to authenticate with locally running FusionAuth.

* If you want to use your own server to perform the OAuth token exchange, update the `serverUrl` property of your [FusionAuthConfig](https://github.com/FusionAuth/fusionauth-quickstart-javascript-vue-web/blob/5-add-server-notes-to-readme-vue/complete-application/src/main.ts). See [example server implementation](https://github.com/FusionAuth/fusionauth-javascript-sdk-express).

Install dependencies and run the Vue app with:
```
cd complete-application
npm i
npm start
```

Now vist the Vue app at [http://localhost:5173](http://localhost:4200)
You can log in with a user preconfigured during Kickstart, `richard@example.com` with the password of `password`.

### Further Information

Visit https://fusionauth.io/quickstarts/quickstart-javascript-vue-web for a step by step guide on how to build this Vue app integrated with FusionAuth from scratch.

### Troubleshooting

* I get `This site can’t be reached  localhost refused to connect.` when I click the Login button

Ensure FusionAuth is running in the Docker container.  You should be able to login as the admin user, `admin@example.com` with the password of `password` at http://localhost:9011/admin

### Maintaining this repo

> Please note that code snippets from this repository are pulled into [this tutorial](https://fusionauth.io/docs/quickstarts/quickstart-javascript-vue-web) on the fusionauth site. Please consider this when making changes here.