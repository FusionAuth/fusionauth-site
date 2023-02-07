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

<!--more-->

The trust is established through an out-of-band exchange of cryptographic credentials, such as a client secret or public
key infrastructure (PKI) certificate. Once trust has been established between the service provider and the identity
provider, SSO authentication can occur when a user wants to authenticate with the service provider. This will typically
involve the service provider sending a token to the identity provider containing details about the user seeking
authentication. The identity provider can then check if the user is already authenticated and ask them to authenticate
if they are not. Once this is done, the identity provider can send a token back to the service provider, signifying that
the user has been granted access.

SSO helps reduce password fatigue by requiring users to only remember one password and username for all the applications
managed through the SSO feature. This also reduces the number of support tickets created for your IT team when a user
inevitably forgets their password. In addition, SSO minimizes the number of times you have to key-in security
credentials, limiting exposure to security issues like keystroke probing and exposure. Security is also enhanced by SSO
because you can implement additional functionality such as MFA or anomalous behavior detection at the identity provider
without adding any complexity to your application.

In this tutorial, you'll learn how to design and implement SSO using [Laravel](https://laravel.com), a popular PHP-based
web framework and FusionAuth as the OIDC provider. Any other OIDC compatible authentication server should work as well.

## Implementing SSO in a Laravel web app

As previously stated, in this tutorial, you'll be shown how to implement SSO in a Laravel web app. The Laravel demo
application is integrated with FusionAuth, an authentication and authorization platform,
and [Laravel Socialite](https://laravel.com/docs/9.x/socialite), its official solution to authenticate users with OAuth
providers.

Before you begin, you'll need the following:

* A Linux machine. The step-by-step instructions in this article are based on
  a [CentOS Linux machine](https://www.centos.org). If you want to work on a different OS, check out
  this [setup guide](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide) for more information.
* [Docker Engine](https://docs.docker.com/engine/) and [Docker Compose](https://docs.docker.com/compose/).
* Experience with a Laravel framework and application development.

## Installing FusionAuth

Go through [5-Minute Setup Guide](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide) to install FusionAuth in your
machine. You have a few ways of doing so, but we recommend
the [Docker](https://fusionauth.io/docs/v1/tech/getting-started/5-minute-docker) approach.

#### Starting FusionAuth

{% include posts/sso/starting.md %}

#### Configure FusionAuth

Now you need to configure FusionAuth.

First, you'll configure the application, then register the user for the application.

This setup allows users in FusionAuth to sign in to the Laravel application automatically once they are authenticated by
FusionAuth.

#### Set up the application

{% include posts/sso/setup.md callbackUrl='http://localhost/auth/callback' oauthDetailsImage='/assets/img/blogs/laravel-single-sign-on/oauth-details.png' %}

#### Register the user

{% include posts/sso/register-user.md %}

#### Kickstart

Instead of manually setting up FusionAuth using the admin UI as you did above, you can use Kickstart. This tool allows
you to get going quickly if you have a fresh installation of FusionAuth. Learn more about how to
use [Kickstart](https://fusionauth.io/docs/v1/tech/installation-guide/kickstart).

> @TODO kickstart json file

### Installing Laravel

> Note: If you already have a running Laravel application, please skip this step.

There are several ways of installing Laravel, but we recommend using it inside a Docker container via Laravel Sail. To
do so, you can execute the command below to automatically download and install every package needed:

```shell
$ curl -s https://laravel.build/my-app | bash
```

> Hint: you can change the name of your application from `my-app` from the URL above to anything you like, as long
> as it only contains alphanumeric characters, dashes and underscores

After everything is finished, you can enter the application directory and start it via Sail:

```shell
$ cd my-app
$ ./vendor/bin/sail up -d
```

> The command `./vendor/bin/sail` has a lot of built-in tools to handle your containerized application from your host
> machine, and it will forward every unknown argument to `docker compose`. So, the command above would actually just
> run `docker compose up -d` with the necessary context and environment to run it successfully.

To test whether the Laravel application is up and running as expected, open a browser and
access [http://localhost](http://localhost).

{% include _image.liquid src="/assets/img/blogs/laravel-single-sign-on/laravel-application.png" alt="The default
Laravel application." class="img-fluid" figure=true %}

### Installing and configuring Laravel Socialite

According to its own docs, [Laravel Socialite](https://laravel.com/docs/9.x/socialite) is a _"a simple, convenient way
to authenticate with OAuth providers"_, meaning that is a very straightforward way of calling a remote server in order
to authenticate a user. And that is exactly what FusionAuth is all about!

Officialy, it is shipped with support for Facebook, Twitter, LinkedIn, Google, GitHub, GitLab and Bitbucket, but there
are several community projects that add other providers, and they are grouped in a project
called [Socialite Providers](https://socialiteproviders.com/).

Thanks to the open-source community, there is
[this package to use FusionAuth as a provider](https://github.com/SocialiteProviders/FusionAuth), which we'll now use to
show you how it's done!

#### Installing Socialite and the FusionAuth provider

The first thing we need to do is add the [FusionAuth provider](https://github.com/SocialiteProviders/FusionAuth) as a
dependency to our application.

```shell
$ ./vendor/bin/sail composer require socialiteproviders/fusionauth
```

> Note: when running the command above, [composer](https://getcomposer.org) will automatically install the
> necessary `laravel/socialite` package

Now, we need to configure our application with the necessary settings to interact with our FusionAuth service, by adding
a new entry to the array located at `config/services.php`:

```php
'fusionauth' => [
    'client_id' => env('FUSIONAUTH_CLIENT_ID'),
    'client_secret' => env('FUSIONAUTH_CLIENT_SECRET'),
    'redirect' => env('FUSIONAUTH_REDIRECT_URI'),
    'base_url' => env('FUSIONAUTH_BASE_URL'),
    'tenant_id' => env('FUSIONAUTH_TENANT_ID'),
],
```

Instead of putting directly the values there, we are using environment variables, which is a good practice from both
maintenance and security standpoints, as described in the [12 Factor App](https://12factor.net/config) methodology and
in several others. Being so, we need to alter our `.env` file to include those entries:

```dotenv
# Paste b##oth client ID and secret for your application
FUSIONAUTH_CLIENT_ID=<APP CLIENT ID FROM FUSIONAUTH>
FUSIONAUTH_CLIENT_SECRET=<APP CLIENT SECRET FROM FUSIONAUTH>

# Specify a tenant ID or leave this blank for the default tenant
FUSIONAUTH_TENANT_ID=<ID FOR YOUR TENANT>

# Replace http://localhost:9011 with the address where the FusionAuth application is running
FUSIONAUTH_BASE_URL=http://localhost:9011

# Replace http://localhost with the address for your PHP application, if necessary
# We'll create the route for `/auth/callback` later##
FUSIONAUTH_REDIRECT_URI=http://localhost/auth/callback
```

Now, we need to alter the service provider responsible for listening to events
at `app/Providers/EventServiceProvider.php` so we can tell Laravel that it should call our class when there is an event
for Socialite. To do this, change its `$listen` property to add the following entry to the array:

```php
protected $listen = [
    \SocialiteProviders\Manager\SocialiteWasCalled::class => [
        \SocialiteProviders\FusionAuth\FusionAuthExtendSocialite::class . '@handle',
    ],
];
```

> Note: if you already have something in the `$listen` array (like `Registered::class => [...]`), please keep it and
> just add a new entry to the array

#### Creating new fields for our User model

Migrations are the code-based version control for your database. Instead of having to share SQL queries with your
coworkers so they can create a table or add a column everytime there is a change in the database, you can write code
to programatically do this when running a command.

In Laravel, to create a new migration you just need to run the `artisan make:migration` and inform a meaningful name for
it. In the next line, we'll create a migration called `add_fusionauth_fields_user_table`:

```shell
$ ./vendor/bin/sail artisan make:migration add_fusionauth_fields_user_table
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

We also need to add `doctrine/dbal` as a dependency, which is a package responsible for changing table and column
definitions:

```shell
$ ./vendor/bin/sail composer require doctrine/dbal
```

Let's run our migration to add those new columns:

```shell
$ ./vendor/bin/sail php artisan migrate

   INFO  Running migrations.  

  2023_02_03_123000_add_fusionauth_fields_user_table ........................... 51ms DONE
```

Now, let's change our User model so it can become aware of these new columns. Modify `app/Models/User.php` and add them
to both `$fillable` and `$hidden` properties:

```php
/**
 * The attributes that are mass assignable.
 *
 * @var array<int, string>
 */
protected $fillable = [
    'name',
    'email',
    'password',
    'fusionauth_id',            // Add this column here
    'fusionauth_token',         // Add this column here
    'fusionauth_refresh_token', // Add this column here
];

/**
 * The attributes that should be hidden for serialization.
 *
 * @var array<int, string>
 */
protected $hidden = [
    'password',
    'remember_token',
    'fusionauth_id',            // Add this column here
    'fusionauth_token',         // Add this column here
    'fusionauth_refresh_token', // Add this column here
];
```

#### Adding routes

Now that our `Users` model and table have more details about the integration, let's define the necessary routes to
redirect the user to the FusionAuth login and the page that the user will be redirected to after completing the process
there. We need to add those routes to our `routes/web.php` file:

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

    // Logging the user in
    Auth::login($user);

    // Here, you should redirect to your app's authenticated pages (e.g. the user dashboard)
    return redirect('/');
});
```

### Changing the view

To better see what is going on after logging in, we can change the view for our home page to actually display the name
for the current user. You can do this by opening `views/welcome.blade.php` and adding a new line after "Home":

```php
// Before: 
  @auth
      <a href="{% raw %}{{ url('/home') }}{% endraw %}" class="text-sm text-gray-700 dark:text-gray-500 underline">Home</a>
  @else
      // ...

// After:
  @auth
      <a href="{% raw %}{{ url('/home') }}{% endraw %}" class="text-sm text-gray-700 dark:text-gray-500 underline">Home</a>
      <span class="ml-2 text-sm text-gray-700 dark:text-gray-500">{% raw %}{{ Auth::user()->name }}{% endraw %}</span>
  @else
      // ...
```

### Testing

It is finally time to open your application in the browser and test everything! Navigate
to [http://localhost](http://localhost) and click the "Log in" link in the upper right corner of that page to be taken
to FusionAuth's login screen. Provide the credentials for the user we created earlier and submit the form: you should be
redirected back to that "Welcome" page but instead of seeing the same "Log in" link, you should now see both "Home" and
your name there!

{% include _image.liquid src="/assets/img/blogs/laravel-single-sign-on/laravel-application-logged-in.png" alt="The default
Laravel application while being logged in." class="img-fluid" figure=true %}

Now you have a working Laravel application that has been authenticated by the user created in FusionAuth. On successful
sign-in to the integrated OAuth and identity provider, the user is automatically signed in in the Laravel application!

## Conclusion

SSO-based authentication eases the process of signing in to applications, and it's a popular choice for many
organizations. In this article, you learned about SSO and authentication platforms
like [FusionAuth](https://fusionauth.io/), as well as how you can integrate a Laravel application with FusionAuth to
successfully enable SSO-based authentication.

Get your hands dirty by [downloading FusionAuth](https://fusionauth.io/download) on your end and set up SSO for your
Laravel app today.

