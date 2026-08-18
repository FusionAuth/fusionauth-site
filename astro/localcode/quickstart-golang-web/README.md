# FusionAuth Quickstart: Golang

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/localcode/quickstart-golang-web). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This repo holds an example Go application that uses FusionAuth as the identity provider.

This repository is documented at https://fusionauth.io/docs/quickstarts/quickstart-golang-web.

## Project Contents

The `docker-compose.yml` file and the `kickstart` directory are used to start and configure a local FusionAuth server.

The `complete-application` directory contains a fully working version of the application.

## Prerequisites

* [Go](https://go.dev/doc/install) 1.16 or later
* [Docker](https://www.docker.com) version 20 or later.
* On macOS and Windows, one of the following container management tools:
  * [Docker desktop](https://www.docker.com/products/docker-desktop/)
  * [OrbStack](https://docs.orbstack.dev/quick-start) (to use Orbstack for `docker compose` commands after install, run `docker context use orbstack`)
  * [Podman](https://podman.io/docs/installation) (in the commands below, replace `docker` with `podman`)

## Running FusionAuth

Clone the example repo and change into the project directory:

```shell
git clone https://github.com/FusionAuth/fusionauth-quickstart-golang-web.git
cd fusionauth-quickstart-golang-web
```

Start the containers:

```shell
docker compose up -d
```

This will start containers for PostgreSQL, OpenSearch, and FusionAuth with the following settings:

* client id: `e9fdb985-9173-4e01-9d73-ac2d60d1dc8e`
* client secret: `2HYT86lWSAntc-mvtHLX5XXEpk9ThcqZb4YEh65CLjA-not-for-prod`
* example username: `richard@example.com` / `password`
* admin username: `admin@example.com` / `password`
* FusionAuth base URL: `http://localhost:9011`

Log into the [FusionAuth admin UI](http://localhost:9011/admin) to experiment with more configuration.

## Running the Example Application

```shell
cd complete-application
go mod tidy
go run main.go
```

Browse to the app at [http://localhost:8080](http://localhost:8080) and log in with `richard@example.com` and `password`.
