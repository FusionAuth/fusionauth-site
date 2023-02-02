---
layout: blog-post
title: Adding single sign-on to a Laravel app using Socialite and OIDC
description: In this tutorial, we'll build a basic Laravel web application using FusionAuth to handle single sign-on.
author: Vinicius Campitelli
category: tutorial
tags: tutorial tutorial-laravel tutorial-php php laravel oidc
image: blogs/laravel-single-sign-on/laravel-app-sso.png
excerpt_separator: "<!--more-->"
---

Single sign-on (SSO) is a session and user authentication technique that permits a user to use one set of login
credentials to authenticate with multiple apps. SSO works by establishing trust between a service provider, usually your
application, and an identity provider, like FusionAuth.

> @INTERNAL copy the rest from Django article

<!--more-->

# Configuring FusionAuth

> @TODO create application, configure the oauth callback and grab both client ID and secret 

# Installing Laravel

> Note: If you already have a running Laravel application, please skip this step.

There are several ways of installing Laravel, but we recommend using it inside a Docker container via Laravel Sail. To
do so, you can execute the command below to automatically download and install every package needed:

```shell
$ curl -s https://laravel.build/my-app | bash
```

> @INTERNAL I don't like doing this without a proper checksum or something. Maybe we could host our own install script and
> provide the checksum ourselves?

> Hint: you can change the name of your application from `my-app` from the URL above to anything you like, as long
> as it only contains alphanumeric characters, dashes and underscores

After everything is finished, you can enter the application directory and start it via Sail:

```shell
$ cd my-app
$ ./vendor/bin/sail up -d
```

The command `./vendor/bin/sail` has a lot of built-in tools to handle your containerized application from your host
machine, and it will forward every unknown option to `docker compose`. So, running the command above would actually
just run `docker compose up -d` with the necessary context and environment to run it successfully.

# About Laravel Socialite

According to its own docs, [Laravel Socialite](https://laravel.com/docs/9.x/socialite) is a _"a simple, convenient way
to authenticate with OAuth providers"_, meaning that is a very straightforward way of calling a remote server in order
to authenticate a user. And that is exactly what FusionAuth is all about!

Officialy, it is shipped with support for Facebook, Twitter, LinkedIn, Google, GitHub, GitLab and Bitbucket, but there
are several community projects that add other providers, and they are grouped in a project
called [Socialite Providers](https://socialiteproviders.com/).

> @INTERNAL should we avoid talking about these providers?

Thanks to the open-source community, there is
[a package to use FusionAuth as a provider](https://github.com/SocialiteProviders/FusionAuth), which we'll now use to
show you how it's done!

## Installing Socialite and the FusionAuth provider

The first thing we need to do is add the [FusionAuth provider](https://github.com/SocialiteProviders/FusionAuth) as a
dependency to our application.

```shell
$ composer require socialiteproviders/fusionauth
```

> Note: when running the command above, [composer](https://getcomposer.org) will automatically install the
> necessary `laravel/socialite` package

Now, we need to configure our application with the necessary settings to interact with our FusionAuth service, by adding
the following lines to the big array located at `config/services.php`:

```php
'fusionauth' => [
    'client_id' => env('FUSIONAUTH_CLIENT_ID'),
    'client_secret' => env('FUSIONAUTH_CLIENT_SECRET'),
    'redirect' => env('FUSIONAUTH_REDIRECT_URI'),
    'base_url' => env('FUSIONAUTH_BASE_URL'),
    'tenant_id' => env('FUSIONAUTH_TENANT_ID'),
],
```

It is a good practice to store those settings in environment variables, as described in
the [12 Factor App](https://12factor.net/config) methodology and in several others. Being so, we need to alter
our `.env` file to include those entries:

```dotenv
# Paste both client ID and secret for your application
FUSIONAUTH_CLIENT_ID=<APP CLIENT ID FROM FUSIONAUTH>
FUSIONAUTH_CLIENT_SECRET=<APP CLIENT SECRET FROM FUSIONAUTH>

# Leave this blank for the default tenant
FUSIONAUTH_TENANT_ID=<ID FOR YOUR TENANT>

# Replace http://localhost:9011 with the address where the FusionAuth application is running
FUSIONAUTH_BASE_URL=http://localhost:9011

# Reaplce http://your.app.domain with the address for your PHP application
# We'll create the route for `/auth/callback` later
FUSIONAUTH_REDIRECT_URI=http://your.app.domain/auth/callback
```

> @INTERNAL is Tenant ID really needed? I tried locally and it doesn't seem to be, but I just want to make sure as their
> docs (for the FusionAuth Socialite provider) says that it is required

Now, we need to alter the service provider responsible for listening to events
at `app/Providers/EventServiceProvider.php` so we can tell Laravel that it should call our class when an event for 
Socialite is being handled. To do this, change the `$listen` protected attribute as the following:

```php
protected $listen = [
    \SocialiteProviders\Manager\SocialiteWasCalled::class => [
        \SocialiteProviders\FusionAuth\FusionAuthExtendSocialite::class . '@handle',
    ],
];
```

> Note: if you already have something in the `$listen` array (like `Registered::class => [...]`), please keep it and
> just add a new entry

# Adding the routes

Now that our `users` table and model are ready, we need to define the necessary routes to redirect the user to the
FusionAuth address and the address that the user will be redirected to after completing the login process.

Let's add those routes to our `routes/web.php` file:

```php
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

/**
 * Responsible for redirecting the user to the FusionAuth login page 
 */
Route::get('/auth/redirect', function () {
    return Socialite::driver('fusionauth')->redirect();
})->name('login');

/**
 * This is the address that we configured in our .env file which the user will be redirected to after completing the
 * login process
 */
Route::get('/auth/callback', function () {
    // This returns a User model in case of success, but we'd need to check for errors first
    /** @var \SocialiteProviders\Manager\OAuth2\User $user */
    $user = Socialite::driver('fusionauth')->user();

    // Let's create a new entry in our users table (or update if it already exists) with some information from the user  
    $user = User::updateOrCreate([
        'fusionauth_id' => $user->id,
    ], [
        'name' => $user->name,
        'email' => $user->email,
        'fusionauth_token' => $user->token,
        'fusionauth_refresh_token' => $user->refreshToken,
    ]);

    // Creating the session to log on the user in our app
    Auth::login($user);

    // Redirecting to your app's protected dashboard
    return redirect('/dashboard');
});
```

> @INTERNAL check for errors in the redirect


# Creating the migration

Migrations are the code-based version control for your database. Instead of having to share SQL queries with your
coworkers so they can create a table or add a column everytime there is a change in the database, you can write code
to programatically do this.

In Laravel, to create a new migration, you just need to run the `artisan make:migration` command and inform a meaningful
name for it. In the next line, we'll create a migration called `add_fusionauth_fields_user_table`:

```shell
$ php artisan make:migration add_fusionauth_fields_user_table
```

Then, go to your `database/migrations` folder, where you'll find a file there with the name you created and prefixed by
today's date (e.g `2023_02_03_123000_add_fusionauth_fields_user_table.php`).

Let's edit that file so we can describe the changes needed in our database. We are going to add three new columns to
the `users` table, `fusionauth_id`, `fusionauth_token` and `fusionauth_refresh_token`, and change the `password` column
so it can be `NULL`.

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * When running this migration, we want to create three new columns and change the password so it can be NULL
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users',  function (Blueprint $table) {
            $table->string('fusionauth_id', 36)->unique();
            $table->text('fusionauth_token');
            $table->text('fusionauth_refresh_token')->nullable();
            $table->string('password')->nullable()->change();
        });
    }

    /**
     * When rolling back this migration, we want to drop the added columns and revert the password to NOT NULL again
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users',  function (Blueprint $table) {
            $table->dropColumn('fusionauth_id');
            $table->dropColumn('fusionauth_token');
            $table->dropColumn('fusionauth_refresh_token');
            $table->string('password')->nullable(false)->change();
        });
    }
};
```

> @INTERNAL check ID and token lengths

We also need to add `doctrine/dbal` as a dependency, which is a package responsible for changing table and column
definitions:

```shell
$ composer require doctrine/dbal
```

Now, we can finally run our migration to add those columns:

```shell
$ php artisan migrate

   INFO  Running migrations.  

  2023_02_03_123000_add_fusionauth_fields_user_table ........................................................ 51ms DONE
```

> @INTERNAL can we paint `INFO` blue here?

> @TODO modify Users model 

# Conclusion

> @TODO
