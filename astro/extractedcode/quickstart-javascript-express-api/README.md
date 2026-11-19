# FusionAuth QuickStart: Express API

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/quickstart-javascript-express-api). Changes to files here will be overwritten by that automation. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This repository contains a locally hosted FusionAuth instance and an Express API. For full instructions, see the [FusionAuth Express API QuickStart](https://fusionauth.io/docs/quickstarts/api/quickstart-javascript-express-api).

## Dependencies

* Node.js 22 or later.
* Docker 23 or later.

## Start FusionAuth

1. Navigate to the `fusionauth` directory.
1. Start FusionAuth with Docker Compose:
   ```shell-session
   docker compose up -d
   ```
1. Open [http://localhost:9011/admin](http://localhost:9011/admin). Log in with `admin@example.com` and the password `password`.

## Start the API

1. Open a new terminal in the repository root.
1. Navigate to `complete-application` and install the dependencies:
   ```shell-session
   cd complete-application
   npm install
   ```
1. Start the API:
   ```shell-session
   node api.mjs
   ```

The API listens on port `3000`. Send access tokens in the `Authorization: Bearer <token>` header. The `free@example.com` user can call `GET /read`. The `premium@example.com` user can call `POST /write`.
