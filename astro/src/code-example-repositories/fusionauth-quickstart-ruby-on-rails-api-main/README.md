# Quickstart: Ruby on Rails Resource Server with FusionAuth

This repository contains a Ruby on Rails application that works with a locally-running instance of [FusionAuth](https://fusionauth.io/), the authentication and authorization platform.

## Setup

### Prerequisites
You will need the following things properly installed on your computer.

- [Ruby 2.7.x](https://rubyonrails.org/): This quickstart was built using Ruby 2.7. This example may work on different versions of Rails, but it has not been tested.
- [Rails 7.0.x.x](https://rubyonrails.org/): This quickstart was built using Rails 7.0.7.2. This example may work on different versions of Rails, but it has not been tested.
- [SQLite](https://www.sqlite.org/download.html): This quickstart was built using sqlite3 (please note MacOS comes with sqlite3).
- [Docker](https://www.docker.com): The quickest way to stand up FusionAuth. Ensure you also have [docker compose](https://docs.docker.com/compose/) installed.
- (Alternatively, you can [Install FusionAuth Manually](https://fusionauth.io/docs/v1/tech/installation-guide/)).

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
* Your fusionAuthBaseUrl is `http://localhost:9011/`

You can log into the [FusionAuth admin UI](http://localhost:9011/admin) and look around if you want, but with Docker/Kickstart you don't need to.

### Ruby on Rails API complete-application

The `complete-application` directory contains a minimal Ruby on Rails app configured to authenticate with locally running FusionAuth.

Install the dependencies via the Gemfile
```
cd complete-application
bundle install
bundle e rails s -p 4001
```

The app is now serving two api endpoints
 - [http://localhost:4001/make-change](http://localhost:4001/make-change) - this endpoint calculates the change to make from a given total
 - [http://localhost:4001/panic](http://localhost:4001/panic) - this endpoint simulates notifying the police of an incident.

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
curl --location 'http://localhost:4001/make-change?total=5.12' \
--cookie 'app.at=<your_token>'
```

or

```sh
curl --location --request POST 'http://localhost:4001/panic' \
--cookie 'app.at=<your_token>'
```

### Further Information

Visit https://fusionauth.io/docs/quickstarts/quickstart-ruby-on-rails-api for a step-by-step guide on how to build this Ruby on Rails API from scratch.
