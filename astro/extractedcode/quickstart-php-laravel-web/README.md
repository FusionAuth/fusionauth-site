# FusionAuth Laravel Quickstart

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/localcode/quickstart-php-laravel-web). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

## Documentation

This repository is documented at https://fusionauth.io/docs/quickstarts/quickstart-php-laravel-web.

Further reading:
- [Laravel Socialite concepts](https://laravel.com/docs/13.x/socialite)
- [FusionAuth OAuth Docs](https://fusionauth.io/docs/v1/tech/oauth/endpoints)

## Prerequisites

* [PHP](https://www.php.net/manual/en/install.php) 8.3
* [Composer](https://getcomposer.org/)
* [Docker](https://www.docker.com) version 20 or later.

## How To Run

In a terminal run the following to start FusionAuth and Laravel.

```shell
git clone https://github.com/FusionAuth/fusionauth-quickstart-php-laravel-web.git
cd fusionauth-quickstart-php-laravel-web
docker compose up -d
cd complete-application
composer install
touch database/database.sqlite
php artisan migrate
php artisan serve
```

Browse to the app at http://localhost:8000.