# Quickstart: Go Resource Server with FusionAuth

This repository contains a Go application that works with a locally-running instance of [FusionAuth](https://fusionauth.io/), the authentication and authorization platform.

## Setup

### Prerequisites
You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/): Presumably you already have this on your machine if you are looking at this project locally; if not, use your platform's package manager to install git, and `git clone` this repo.
* [Go](https://go.dev/): You can download and from the go website if it is not already installed on your maching.
* [Docker](https://www.docker.com): For standing up FusionAuth from within a Docker container. (You can [install it other ways](https://fusionauth.io/docs/v1/tech/installation-guide/), but for this example we will assume you are using Docker.)

This app was built using Go 1.21.0. This example may work on different versions of Go, but it has not been tested.

### FusionAuth Installation via Docker

The root of this project directory (next to this README) are two files [a Docker compose file](./docker-compose.yml) and an [environment variables configuration file](./.env). Assuming you have Docker installed on your machine, you can stand up FusionAuth up on your machine with:

```
docker compose up -d
```

The FusionAuth configuration files also make use of a unique feature of FusionAuth, called [Kickstart](https://fusionauth.io/docs/v1/tech/installation-guide/kickstart): when FusionAuth comes up for the first time, it will look at the [Kickstart file](./kickstart/kickstart.json) and mimic API calls to configure FusionAuth for use when it is first run.

> **NOTE**: If you ever want to reset the FusionAuth system, delete the volumes created by docker-compose by executing `docker-compose down -v`.

FusionAuth will be initially configured with these settings:

* Your client Id is: `e9fdb985-9173-4e01-9d73-ac2d60d1dc8e`
* Your client secret is: `super-secret-secret-that-should-be-regenerated-for-production`
* Your admin username is `admin@example.com` and your password is `password`.
* Your teller username is `teller@example.com` and your password is `password`.
* Your customer username is `customer@example.com` and your password is `password`.
* Your fusionAuthBaseUrl is 'http://localhost:9011/'

You can log into the [FusionAuth admin UI](http://localhost:9011/admin) and look around if you want, but with Docker/Kickstart you don't need to.

### Go API complete-application

The `complete-application` directory contains a minimal Go app configured to authenticate with locally running FusionAuth.

Install the dependencies and run the app server with:
```
cd complete-application
go get
go run main.go
```

Go is now serving two api endpoints
 - [http://localhost:9001/make-change](http://localhost:9001/make-change) - this endpoint calculates the change to make from a given total
 - [http://localhost:9001/panic](http://localhost:9001/panic) - this endpoint simulates notifying the police of an incident.

You can login with a user preconfigured during Kickstart, `teller@example.com` with the password of `password` and `applicationId` by calling:

```sh
curl --location 'https://local.fusionauth.io/api/login' \
--header 'Authorization: this_really_should_be_a_long_random_alphanumeric_value_but_this_still_works' \
--header 'Content-Type: application/json' \
--data-raw '{
  "loginId": "teller@example.com",
  "password": "password",
  "applicationId": "e9fdb985-9173-4e01-9d73-ac2d60d1dc8e"
}'
```

You can take the token from the response and then call one of the endpoints listed above by calling:

```sh
curl --location 'http://localhost:9001/make-change?total=5.12' \
--header 'Authorization: Bearer {replaceWithToken}'
```

or

```sh
curl --location --request POST 'http://localhost:9001/panic' \
--header 'Authorization: Bearer {replaceWithToken}'
```



### Further Information

Visit [https://fusionauth.io/docs/quickstarts/quickstart-go-api](https://fusionauth.io/docs/quickstarts/quickstart-golang-api) for a step-by-step guide on how to build this Go API from scratch.
