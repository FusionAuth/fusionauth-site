# Quickstart: Laravel API with FusionAuth

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/quickstart-php-laravel-api). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This repository contains a Laravel API that works with a locally-running instance of [FusionAuth](https://fusionauth.io/), the authentication and authorization platform.

## Setup

### Prerequisites
You will need the following things properly installed on your computer.

- [PHP 8.1+](https://www.php.net): This quickstart was built using PHP 8.1 and tested with PHP 8.2 as well. It may work on different versions of PHP, but it has not been tested. 
- [Composer](https://getcomposer.org/) to install PHP dependencies.
- [Docker](https://www.docker.com): The quickest way to stand up both FusionAuth and Laravel. Ensure you also have [docker compose](https://docs.docker.com/compose/) installed.
- (Alternatively, you can [Install FusionAuth Manually](https://fusionauth.io/docs/v1/tech/installation-guide/)).

### FusionAuth Installation via Docker

The root of this project directory (next to this `README`) are two files: [a Docker compose file](./docker-compose.yml) and an [environment variables configuration file](./.env). Assuming you have Docker installed on your machine, you can stand up FusionAuth up on your machine with:

```sh
docker compose up -d
```

The FusionAuth configuration files also make use of a unique feature of FusionAuth, called [Kickstart](https://fusionauth.io/docs/v1/tech/installation-guide/kickstart): when FusionAuth comes up for the first time, it will look at the [Kickstart file](./kickstart/kickstart.json) and mimic API calls to configure FusionAuth for use when it is first run.

> **NOTE**: If you ever want to reset the FusionAuth system, delete the volumes created by docker-compose by executing `docker-compose down -v`.

FusionAuth will be initially configured with these settings:

* Your client Id is: `e9fdb985-9173-4e01-9d73-ac2d60d1dc8e`.
* Your client secret is: `super-secret-secret-that-should-be-regenerated-for-production`.
* Your admin username is `admin@example.com` and your password is `password`.
* Your teller username is `teller@example.com` and your password is `password`.
* Your customer username is `customer@example.com` and your password is `password`.
* The FusionAuth instance is located at `http://localhost:9011/`.

You can log into the [FusionAuth admin UI](http://localhost:9011/admin) and look around if you want, but with Docker/Kickstart you don't need to.

### Complete Laravel API

The `complete-application` directory contains a minimal Laravel app configured to authenticate with locally running FusionAuth.

Install the dependencies via Composer:

```shell
cd complete-application
composer install
./vendor/bin/sail up -d
```

The app is now serving two api endpoints:
 - [http://localhost/api/make-change](http://localhost/api/make-change) - this endpoint calculates the change to make from a given total.
 - [http://localhost/api/panic](http://localhost/api/panic) - this endpoint simulates notifying the police of an incident.

You can log in with a user preconfigured during Kickstart, `teller@example.com` with the password of `password`, by calling:

```sh
curl --location 'http://localhost:9011/api/login' \
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
curl --cookie 'app.at=<your_token>' 'http://localhost/make-change?total=5.12'
```

or

```sh
curl --cookie 'app.at=<your_token>' --request POST 'http://localhost/panic'
```

### Further Information

Visit https://fusionauth.io/docs/quickstarts/quickstart-php-laravel-api for a step-by-step guide on how to build this Laravel API from scratch.

