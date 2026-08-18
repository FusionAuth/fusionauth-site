# FusionAuth Quickstart: Rust Actix

> [!WARNING]  
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/localcode/quickstart-rust-actix). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This repo holds an example Rust application that uses FusionAuth as the identity provider.

This repository is documented at https://fusionauth.io/docs/quickstarts/quickstart-rust-actix-web.

## Project Contents

The `docker-compose.yml` file and the `kickstart` directory are used to start and configure a local FusionAuth server.

The `complete-application` directory contains a fully working version of the application.

## Prerequisites

* [Rust](https://rustup.rs/#)
* [Docker](https://www.docker.com) version 20 or later.
* On macOS and Windows, one of the following container management tools:
  * [Docker desktop](https://www.docker.com/products/docker-desktop/)
  * [OrbStack](https://docs.orbstack.dev/quick-start) (to use Orbstack for `docker compose` commands after install, run `docker context use orbstack`)
  * [Podman](https://podman.io/docs/installation) (in the commands below, replace `docker` with `podman`)

## Running FusionAuth

To run FusionAuth, stand up the docker containers using `docker-compose`.

First, clone the example repo and change into the project directory:

```shell
git clone https://github.com/FusionAuth/fusionauth-quickstart-rust-actix-web.git
cd fusionauth-quickstart-rust-actix-web
```

Start the containers:

```shell
docker compose up
```

This will start containers for PostgreSQL, Opensearch, and FusionAuth with the following settings:

* client id is: `e9fdb985-9173-4e01-9d73-ac2d60d1dc8e`
* client secret is: `super-secret-secret-that-should-be-regenerated-for-production`
* example username is: `richard@example.com` and your password is: `password`
* admin username is: `admin@example.com` and your password is: `password`
* fusionAuthBaseUrl is: `http://localhost:9011/`

Log into the [FusionAuth admin UI](http://localhost:9011/admin) to experiment with more configuration.

## Running the Example Application

Use the following command to run the application:

```shell
cargo run
```

Browse to the app at [http://localhost:9012](http://localhost:9012) and login with `richard@example.com` and `password`.
