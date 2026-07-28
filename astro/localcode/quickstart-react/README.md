# FusionAuth Quickstart: React SPA

This repository contains:

- a locally-hosted FusionAuth authorization server that runs in a container group
- frontend React code for each step of the quickstart

For full instructions, see the [FusionAuth React Quickstart](https://fusionauth.io/docs/quickstarts/quickstart-react).

## Dependencies

* [Node.js](https://nodejs.org/en/download) v22+
* [Docker](https://docs.docker.com/get-started/get-docker/) v23+
* On macOS and Windows, one of the following container management tools:
  * [OrbStack](https://docs.orbstack.dev/quick-start) (run `docker context use orbstack` after installation to use Orbstack for `docker compose` commands)
  * [Podman](https://podman.io/docs/installation) (in the commands below, replace `docker` with `podman`)
  * [Docker desktop](https://www.docker.com/products/docker-desktop/)

## Install and Start FusionAuth

To install and run FusionAuth locally:

1. Navigate to the `fusionauth-backend` directory.
1. Run the following Docker compose command:
   ```console
   docker compose up -d
   ```
1. Once the compose process completes, you should see the `fusionauth-backend` container group in your container management tool. This group contains containers called `fusionauth`, `db`, and `search`. To access FusionAuth, visit [http://localhost:9011/admin](http://localhost:9011/admin).
1. You can access your FusionAuth admin dashboard with the username `admin@example.com` and the password `password`.

## Set Up the React App

To run any step of the quickstart:

1. Navigate into the `react-frontend-steps/<name-of-step>` folder.
1. Run the following command to install dependencies:
   ```console
   npm install
   ```
1. Run the following command to start the app:
   ```console
   npm run dev
   ```
1. To use the React app, visit the URL displayed in your terminal.
