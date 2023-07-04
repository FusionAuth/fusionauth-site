---
layout: doc
title: Integrate Your Laravel API With FusionAuth
description: Integrate your Laravel API with FusionAuth
navcategory: getting-started
prerequisites: Composer, Docker and at least PHP 8.2
technology: Laravel
language: PHP
---

## Integrate Your {{page.technology}} API With FusionAuth

{% include docs/integration/_intro-api.md %}

## Prerequisites

{% include docs/integration/_prerequisites.md %}

## Download and Install FusionAuth

{% include docs/integration/_install-fusionauth.md %}

## Create a User and an API Key

{% include docs/integration/_add-user.md language=page.language %}

## Configure FusionAuth

Next, you need to set up FusionAuth. This can be done in different ways, but we’re going to use the [{{page.language}} client library](/docs/v1/tech/client-libraries/php). You can use the client library with an IDE of your preference as well.

First, make a directory:

```shell
mkdir setup-fusionauth && cd setup-fusionauth
```

Now, copy and paste the following file into `composer.json`.

```javascript
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-client-libraries/main/php/composer.json %}
```

Install the dependencies.

```shell
composer install
```

Then copy and paste the following file into `setup.php`.

```php
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-client-libraries/main/php/setup.php %}
```

Then, you can run the setup script.

{% include _callout-note.liquid content="The setup script is designed to run on a newly installed FusionAuth instance with only one user and no tenants other than `Default`. To follow this guide on a FusionAuth instance that does not meet these criteria, you may need to modify the above script. <br><br> Refer to the [PHP client library](/docs/v1/tech/client-libraries/php) documentation for more information." %}

This will create the FusionAuth configuration for your {{page.technology}} API.

```shell
php setup.php "YOUR_API_KEY_FROM_ABOVE"
```

### Retrieve JWKS Endpoint

Instead of manually storing the public key to verify JWTs, your application should automatically look it up using the [JWKS endpoint](/docs/v1/tech/oauth/endpoints#json-web-key-set-jwks).

As both your Laravel application and FusionAuth instance are running in different Docker Compose projects, they can't reach each other. To do that, you need to expose your FusionAuth instance to the Web using [ngrok](/docs/v1/tech/developer-guide/exposing-instance).

{% include _callout-note.liquid content="You could also add network connectivity between them by running [`docker network connect`](https://docs.docker.com/engine/reference/commandline/network_connect/)." %}

Now, log into your instance using the address `ngrok` gave you and browse to <span>Applications</span>{:.breadcrumb}. Locate the `PHP Example App` application that the setup script created for you and click <i/>{:.ui-button .green .fa .fa-search} to view its details. In the <span>OAuth2 & OpenID Connect Integration details</span>{:.uielement} section, locate <span>JSON Web Key (JWK) Set</span>{:.uielement} and copy it. You'll need this value later.

## Create Your {{page.technology}} API

Now you are going to create a {{page.technology}} application. While this section uses a simple {{page.technology}} application, you can use the same steps to integrate any {{page.technology}} application with FusionAuth.

First, make a directory:

```shell
mkdir ../setup-laravel && cd ../setup-laravel
```

Next, create a simple {{page.technology}} template using Laravel's build script.

```shell
curl -s "https://laravel.build/fusionauth-example-laravel-api?with=mariadb" | bash
```

This can take several minutes to complete, so please be patient.

### Adding JWT Authentication

After it is done, change into the `fusionauth-example-laravel-api` directory and install [`fusionauth/jwt-auth-webtoken-provider`](https://github.com/fusionauth/fusionauth-laravel-jwt-auth-webtoken-provider), a library created by FusionAuth to add JWT validation capabilities to Laravel, and [`web-token/jwt-signature-algorithm-rsa`](https://github.com/web-token/jwt-signature-algorithm-rsa), a package to handle RSA algorithms.

```shell
cd fusionauth-example-laravel-api
./vendor/bin/sail composer require fusionauth/jwt-auth-webtoken-provider web-token/jwt-signature-algorithm-rsa
```

Add some authentication routes to `routes/api.php` and another endpoint to allow `GET` requests to `/api/messages`, which you'll create later. 

```php
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-laravel-api/main/laravel/routes/api.php %}
```

Create `app/Http/Controllers/Api/AuthController.php` for all authentication logic.

```php
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-laravel-api/main/laravel/app/Http/Controllers/Api/AuthController.php %}
```

Laravel uses something called [Guards](https://laravel.com/docs/10.x/authentication#adding-custom-guards) to protect your endpoints, so we need to tell it about the new Guard provided from that library by editing `config/auth.php`.

```php
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-laravel-api/main/laravel/config/auth.php %}
```

To make the library available for use, publish its configuration by running the command below.

```shell
./vendor/bin/sail artisan vendor:publish --provider="FusionAuth\JWTAuth\WebTokenProvider\Providers\WebTokenServiceProvider"
```

### Editing Files

The Laravel installer already brings some useful resources for many applications. We'll have to edit a few of them and add some more.

First, remove the need for users to have a password by editing `app/Models/User.php`.

```php
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-laravel-api/main/laravel/app/Models/User.php %}
```

Change the created migration at `database/migrations/2014_10_12_000000_create_users_table.php`.

```php
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-laravel-api/main/laravel/database/migrations/2014_10_12_000000_create_users_table.php %}
```

You may remove all other migrations, as you won't need them.

```shell
rm database/migrations/2014_10_12_100000_create_password_reset_tokens_table.php
rm database/migrations/2019_08_19_000000_create_failed_jobs_table.php
rm database/migrations/2019_12_14_000001_create_personal_access_tokens_table.php
```

Run the remaining migrations to create the necessary tables in your database.

```shell
./vendor/bin/sail artisan migrate
```

### Adding Files

By default, Laravel only allows JWTs that correspond to existing users in your database, but one of the greatest benefits of using FusionAuth is to have a single source of truth of user management. So, you would want your API to automatically provision new users when it receives a trusted JWT from FusionAuth.

First, extend the default [User Provider](https://laravel.com/docs/10.x/authentication#adding-custom-user-providers) to create new users when receiving valid JWTs from FusionAuth.

```php
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-laravel-api/main/laravel/app/FusionAuth/Providers/FusionAuthEloquentUserProvider.php %}
```

Now, add an [Authentication Guard](https://laravel.com/docs/10.x/authentication#adding-custom-guards) in `app/FusionAuth/FusionAuthJWTGuard.php` to call that custom method from the User Provider created above.

```php
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-laravel-api/main/laravel/app/FusionAuth/FusionAuthJWTGuard.php %}
```

To override the existing classes when the ones you just added, you must create a [Service Provider](https://laravel.com/docs/10.x/providers) in `app/FusionAuth/Providers/FusionAuthServiceProvider.php`.

```php
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-laravel-api/main/laravel/app/FusionAuth/Providers/FusionAuthServiceProvider.php %}
```

Edit the `.env` file and add these lines there.

```ini
FUSIONAUTH_CLIENT_ID=e9fdb985-9173-4e01-9d73-ac2d60d1dc8e
FUSIONAUTH_URL=http://localhost:9011/
JWT_ALGO=RS256
JWT_JWKS_URL=https://address.that.ngrok.gave.you/.well-known/jwks.json
JWT_JWKS_URL_CACHE=86400
```

You should change `JWT_JWKS_URL` to the [JWKS Endpoint you copied earlier](#retrieve-jwks-endpoint).

### Creating a Controller

Create a controller in `app/Http/Controllers/Api/MessagesController.php` which gives back a JSON message.

```php
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-laravel-api/main/laravel/app/Http/Controllers/Api/MessagesController.php %}
```

### Creating the View

Change the view file located at `resources/views/welcome.blade.php` to add a <span>Log in with FusionAuth</span>{:.uielement} button when you are logged out and a container for the messages API response when you are logged in.

```php
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-laravel-api/main/laravel/resources/views/welcome.blade.php %}
```

Create a file named `public/js/fusionauth.js` that will fetch both `/api/messages` from the Laravel API and your user details from FusionAuth.

```javascript
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-laravel-api/main/laravel/public/js/fusionauth.js %}
```

### Testing the Authentication Flow

Finally, start your application.

```shell
./vendor/bin/sail up -d
```

Browse to [localhost](http://localhost/) and click the <span>Log in with FusionAuth</span>{:.uielement} button.

{% include _image.liquid src="/assets/img/docs/tutorials/laravel-api/login.png" alt="Laravel application login screen." class="img-fluid" width="1200" figure=false %}

Log in with username `richard@example.com` and password `password`. You should be redirected back to your Laravel application with both your user details and the result of the messages API call.

{% include _image.liquid src="/assets/img/docs/tutorials/laravel-api/logged-in.png" alt="Laravel application welcome screen." class="img-fluid" width="1200" figure=false %}

The full code for this guide can be found [here](https://github.com/FusionAuth/fusionauth-example-laravel-api).
