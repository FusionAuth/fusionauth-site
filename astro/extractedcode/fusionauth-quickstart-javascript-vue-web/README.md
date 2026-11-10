# FusionAuth QuickStart: Vue SPA

> [!WARNING]  
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/fusionauth-quickstart-javascript-vue-web). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This repository contains:

- a locally-hosted FusionAuth authorization server that runs in a container group
- frontend Vue code for each step of the QuickStart

For full instructions, see the [FusionAuth Vue QuickStart](https://fusionauth.io/docs/get-started/quickstarts/spa/vue).

## Dependencies

* [Node.js](https://nodejs.org/en/download) v22.22.2+ or v24.15+
* [Docker](https://docs.docker.com/get-started/get-docker/) v23+
* On macOS and Windows, one of the following container management tools:
  * [OrbStack](https://docs.orbstack.dev/quick-start) (run `docker context use orbstack` after installation to use Orbstack for `docker compose` commands)
  * [Podman](https://podman.io/docs/installation) (in the commands below, replace `docker` with `podman`)
  * [Docker desktop](https://www.docker.com/products/docker-desktop/)

## Install and Start FusionAuth

To install and run FusionAuth locally:

1. Navigate to the `fusionauth-backend` directory.
1. Run the following Docker compose command:
   ```shell-session
   docker compose up -d
   ```
1. Once the compose process completes, you should see the `fusionauth-backend` container group in your container management tool. This group contains containers called `fusionauth`, `db`, and `search`. To access FusionAuth, visit [http://localhost:9011/admin](http://localhost:9011/admin).
1. You can access your FusionAuth admin dashboard with the username `admin@example.com` and the password `password`.

## Set Up the Vue App

To run any step of the QuickStart:

1. Navigate into the `vue-frontend-steps/<name-of-step>` folder.
1. Run the following command to install dependencies:
   ```shell-session
   npm install
   ```
1. Run the following command to start the app:
   ```shell-session
   npm run dev
   ```
1. To use the Vue app, visit the URL displayed in your terminal.
