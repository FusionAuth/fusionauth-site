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

{% include docs/integration/_intro.md %}

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

```javascript
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-client-libraries/main/php/setup.php %}
```

Then, you can run the setup script.

{% include _callout-note.liquid content="The setup script is designed to run on a newly installed FusionAuth instance with only one user and no tenants other than `Default`. To follow this guide on a FusionAuth instance that does not meet these criteria, you may need to modify the above script. <br><br> Refer to the [PHP client library](/docs/v1/tech/client-libraries/php) documentation for more information." %}

This will create the FusionAuth configuration for your {{page.technology}} API.

```shell
php setup.php "YOUR_API_KEY_FROM_ABOVE"
```

If you want, you can [log into your instance](http://localhost:9011) and examine the new Application the script created for you.

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

### Adding JWT authentication

After it is done, change into the `fusionauth-example-laravel-api` directory and install [`tymon/jwt-auth`](https://github.com/tymondesigns/jwt-auth), a library that adds JWT capabilities to Laravel.

```shell
cd fusionauth-example-laravel-api
./vendor/bin/sail composer require tymon/jwt-auth
```

Expose the JWT configuration from a `config/jwt.php` file.

```php
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-laravel-api/main/laravel/config/jwt.php %}
```

Add some authentication routes to `routes/api.php`. 

```diff
{% remote_include https://github.com/FusionAuth/fusionauth-example-laravel-api/commit/0770f7d0dc4f20b5b96ac1beb25ce24e6fa4e1ed.diff %}
```

Create `app/Http/Controllers/AuthController.php` to hold the authentication process.

```php
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-laravel-api/main/laravel/app/Http/Controllers/AuthController.php %}
```

Laravel uses something called [Guards](https://laravel.com/docs/10.x/authentication#adding-custom-guards) to protect your endpoints, so we need to tell it about the new Guard provided from that library.

```diff
{% remote_include https://github.com/FusionAuth/fusionauth-example-laravel-api/commit/dc737c76af3079e1e4979959d1f3cf540c691437.diff %}
```

To make the library available for use, publish its configuration by running the command below.

```shell
./vendor/bin/sail artisan vendor:publish --provider="Tymon\\JWTAuth\\Providers\\LaravelServiceProvider"
```

### Editing files

The Laravel installer already brings some useful resources for many applications. We'll have to edit a few of them and add some more.

First, remove the need for users to have a password by editing `app/Models/User.php`.

```diff
{% remote_include https://github.com/FusionAuth/fusionauth-example-laravel-api/commit/e77d5b780bf1a083aa30ab8d3eeed6e2eda84cfa.diff %}
```

Change the created migration at `database/migrations/2014_10_12_000000_create_users_table.php`.

```diff
{% remote_include https://github.com/FusionAuth/fusionauth-example-laravel-api/commit/7dab24a119aca8ce241fadb0f7a681786f5ecc22.diff %}
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

### Adding files

By default, Laravel only allows JWTs that correspond to existing users in your database, but one of the greatest benefits of using FusionAuth is to have a single source of truth of user management. So, you would want your API to automatically provision new users when it receives a trusted JWT from FusionAuth. Even though [`tymon/jwt-auth`](https://github.com/tymondesigns/jwt-auth) is a great library, it doesn't provide an easy way of doing these kinds of customizations, so you'll have to create some classes to do them.

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

Finally, expose your Service Provider by adding it to the `providers` array in `config/app.php`.

```diff
{% remote_include https://github.com/FusionAuth/fusionauth-example-laravel-api/commit/98942e64bc8296df905278633369d62f3b20f9a3.diff %}
```

### Retrieving Public Key

To make your API trust JWTs issued by FusionAuth, you must import the Public Key from your FusionAuth application into it.

If you have [jq](https://stedolan.github.io/jq/download/) _(a script to parse JSON objects)_ installed, you can run the command below to fetch it directly.

```shell
curl -H 'Authorization: this_really_should_be_a_long_random_alphanumeric_value_but_this_still_works' http://localhost:9011/api/key/1afa4d7e-76f0-45e9-bb46-98be5329ef37 | jq -r '.key.publicKey'
```

If you don't have it, log into the [FusionAuth admin screen](http://localhost:9011) using the admin user credentials ("admin@example.com"/"password"), navigate to <span>Settings -> Key Master</span>{:.breadcrumb}, locate the key named `For exampleapp` and click its download button. Inside the downloaded `.zip` file, go to the `keys` folder and open `public-key.pem`.

Now that you have the Public Key, edit the `.env` file in your Laravel application and add these three lines, replacing the contents of `JWT_PUBLIC_KEY` with your Public Key.

```diff
{% remote_include https://github.com/FusionAuth/fusionauth-example-laravel-api/commit/62d9a390b04e0f4dcb2954421c6116b0b8b96c22.diff %}
```

### Creating a Controller

Create a controller in `app/Http/Controllers/MessagesController.php` which gives back a JSON message.

```php
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-laravel-api/main/laravel/app/Http/Controllers/MessagesController.php %}
```

Add a route to `routes/api.php` so it can be possible to make a `GET` request to `/api/messages`.

```diff
{% remote_include https://github.com/FusionAuth/fusionauth-example-laravel-api/commit/18ed5f233ec54695586de1f50b2d1e89e9642cf3.diff %}
```

### Testing the Authentication Flow

Finally, start your application.

```shell
./vendor/bin/sail up -d
```

Make sure that everything is running fine by making a request to [localhost/api/auth/me](http://localhost/api/auth/me).

```shell
curl -X POST -H 'Accept: application/json' http://localhost/api/auth/me
```

You should see an error message because you're not providing any JWT to the request.

```json
{"message":"Unauthenticated."}
```

Now, you need to call FusionAuth to get an access token. For ease of use, these instructions will use the Login API, but you could also get the access token via the hosted login pages.

```shell
curl -H 'Authorization: this_really_should_be_a_long_random_alphanumeric_value_but_this_still_works' \
  -H 'Content-type: application/json' \
  -d '{"loginId": "richard@example.com", "password": "password", "applicationId": "e9fdb985-9173-4e01-9d73-ac2d60d1dc8e"}' \
  http://localhost:9011/api/login
```

Copy the `token` value and place it in the `Authorization` header when calling your Laravel API.

```shell
curl -H 'Accept: application/json' \
  -H 'Authorization: Bearer <TOKEN_VALUE>' \
  http://localhost/api/messages
```

You should get a success message.

```json
{"messages":["Hello, world!"]}
```

The full code for this guide can be found [here](https://github.com/FusionAuth/fusionauth-example-laravel-api).
