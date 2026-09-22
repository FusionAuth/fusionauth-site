# Quickstart: Ruby on Rails app with FusionAuth

This repository contains a Ruby on Rails app that works with a locally running instance of [FusionAuth](https://fusionauth.io/), the authentication and authorization platform.

## Setup

### Prerequisites
- [Ruby](https://www.ruby-lang.org/en/documentation/installation/): This will be needed for pulling down the various dependencies.
- [Rails](https://guides.rubyonrails.org/getting_started.html): This will be used in order to run the Rails server.
- [Docker](https://www.docker.com): The quickest way to stand up FusionAuth.
  - (Alternatively, you can [Install FusionAuth Manually](https://fusionauth.io/docs/v1/tech/installation-guide/)).

This app has been tested with Ruby 3.2.2 and Rails 7.0.4.3

### FusionAuth Installation via Docker

The root of this project directory (next to this README) are two files [a Docker compose file](./docker-compose.yml) and an [environment variables configuration file](./.env). Assuming you have Docker installed on your machine, you can stand up FusionAuth up on your machine with:

```
docker-compose up -d
```

The FusionAuth configuration files also make use of a unique feature of FusionAuth, called [Kickstart](https://fusionauth.io/docs/v1/tech/installation-guide/kickstart): when FusionAuth comes up for the first time, it will look at the [Kickstart file](./kickstart/kickstart.json) and mimic API calls to configure FusionAuth for use when it is first run.

> **NOTE**: If you ever want to reset the FusionAuth system, delete the volumes created by docker-compose by executing `docker-compose down -v`.

FusionAuth will be initially configured with these settings:

* Your client Id is: `e9fdb985-9173-4e01-9d73-ac2d60d1dc8e`
* Your client secret is: `super-secret-secret-that-should-be-regenerated-for-production`
* Your example username is `richard@example.com` and your password is `password`.
* Your admin username is `admin@example.com` and your password is `password`.
* Your fusionAuthBaseUrl is 'http://localhost:9011/'

You can log into the [FusionAuth admin UI](http://localhost:9011/admin) and look around if you want, but with Docker/Kickstart you don't need to.

### Ruby on Rails complete-app

The `complete-app` directory contains a minimal Ruby on Rails app configured to authenticate with locally running FusionAuth.

Install gems and run the Rails server with:
```
cd complete-app
bundle install
OP_SECRET_KEY=super-secret-secret-that-should-be-regenerated-for-production bundle exec rails s
```

Now vist the Rails app at [http://localhost:3000](http://localhost:3000)
You can login with a user preconfigured during Kickstart, `richard@example.com` with the password of `password`.

### Further Information

Visit https://fusionauth.io/docs/quickstarts/quickstart-ruby-rails-web for a step by step guide on how to build this Rails app integrated with FusionAuth by scratch.

### Troubleshooting

* I get `This site can’t be reached localhost refused to connect.` when I click the Login button

Ensure FusionAuth is running in the Docker container.  You should be able to login as the admin user, `admin@example.com` with the password of `password` at http://localhost:9011/admin

* I get an error page when I click on the Login button with message of `"error_reason" : "invalid_client_id"`

Ensure the value for `config.x.fusionauth.client_id` in the file `config/environments/development.rb` matches client id configured in FusionAuth for the Example App application at http://localhost:9011/admin/application/

* I'm getting an error from Rails after logging in

```
Rack::OAuth2::Client::Error
invalid_client :: Invalid client authentication credentials.
```

This indicates that Omniauth is unable to call FusionAuth to validate the returned token.  It is likely caused my not supplying the correct *client secret*.  Ensure the `OP_SECRET_KEY` used to start rails matches the FusionAuth ExampleApp client secret.  http://localhost:9011/admin/application/
