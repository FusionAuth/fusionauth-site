# FusionAuth Quickstart: Golang API

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/localcode/quickstart-golang-api). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This repo holds an example Go API application that uses FusionAuth as the identity provider.

This repository is documented at https://fusionauth.io/docs/quickstarts/quickstart-golang-api.

## Project Contents

The `docker-compose.yml` file and the `kickstart` directory are used to start and configure a local FusionAuth server.

The `complete-application` directory contains a fully working version of the application.

## Prerequisites

* [Go](https://go.dev/doc/install) 1.21 or later
* [Docker](https://www.docker.com) version 20 or later.
* On macOS and Windows, one of the following container management tools:
  * [Docker desktop](https://www.docker.com/products/docker-desktop/)
  * [OrbStack](https://docs.orbstack.dev/quick-start) (to use Orbstack for `docker compose` commands after install, run `docker context use orbstack`)
  * [Podman](https://podman.io/docs/installation) (in the commands below, replace `docker` with `podman`)

## Running FusionAuth

Clone the example repo and change into the project directory:

```shell
git clone https://github.com/FusionAuth/fusionauth-quickstart-golang-api.git
cd fusionauth-quickstart-golang-api
```

Start the containers:

```shell
docker compose up -d
```

This will start containers for PostgreSQL, OpenSearch, and FusionAuth with the following settings:

* application id: `e9fdb985-9173-4e01-9d73-ac2d60d1dc8e`
* teller user: `teller@example.com` / `password`
* customer user: `customer@example.com` / `password`
* admin user: `admin@example.com` / `password`
* FusionAuth base URL: `http://localhost:9011`

Log into the [FusionAuth admin UI](http://localhost:9011/admin) to experiment with more configuration.

## Running the Example Application

```shell
cd complete-application
go mod tidy
go run main.go
```

The API listens on port `9001`. See the [quickstart documentation](https://fusionauth.io/docs/quickstarts/quickstart-golang-api) for example requests.
