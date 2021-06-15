---
layout: blog-post
title: Securing a Symfony application with OAuth
description: How you can set up Symfony to use an OAuth server
author: Dan Moore
image: blogs/oggeh-fusionauth-gluu/oggeh-cloud-computing-switched-to-fusionauth-from-gluu.png
category: blog
tags: tutorial, client-php
excerpt_separator: "<!--more-->"
---

In this tutorial, you'll learn how to integrate an OAuth server with Symfony 5, a popular PHP development framework. You'll create a custom authenticator which will integrate with the OAuth server. And the end of this tutorial, you will have the skeleton of a video chat application. 

<!--more-->

It'll have a few pages:

* a home page anyone can visit
* a chat page that only logged in users can visit

Users will also have the ability to log in and log out. Implementing the actual video chat will be an exercise left to the reader. It's highly suggested you utilize the Pied Piper algorithm.

FusionAuth is being used as the OAuth server for this tutorial, but any compliant OIDC/OAuth server should work as well.

All the code is available on [GitHub under a permissive license](https://github.com/FusionAuth/fusionauth-example-symfony/) if you'd like to download that and follow along. 

## Prerequisites

First things first, though. Before you get going, you should install the following pieces of software:

* A modern PHP (tested with php 7.3.24)
* Composer
* Symfony 5, including the `symfony` cli tool; [more here](https://symfony.com/doc/current/setup.html). This code was tested with symfony 5.2.6.
* FusionAuth installed; [more here](/docs/v1/tech/5-minute-setup-guide/).
* A database such as MySQL installed. This tutorial will use MySQL, but PostgreSQL or another supported database should work fine.

Once these prerequisites are out of the way, you can start building an application.

## Setting up the database

You should create a database, user and password.

If you are using MySQL, beware of the [legacy password issue](https://stackoverflow.com/questions/53066962/an-exception-occurred-in-driver-sqlstatehy000-2054-the-server-requested-aut).

```sql
CREATE DATABASE ppvc;
CREATE USER 'ppvc'@'localhost' IDENTIFIED WITH mysql_native_password BY 'pp@VCpw@';
GRANT ALL PRIVILEGES ON ppvc.* TO 'ppvc'@'localhost';
```


## The first pages of the application
First, let's create the application pages without any authentication check.

Go to an empty directory and create a new full symfony project:

```shell
symfony new piedpipervideochat --full
```

Change to that directory:

```shell
cd piedpipervideochat 
```

You need to set up the database connection by creating a file called `.env.local`. This will include sensitive settings which should not be committed. You can also add the location of your FusionAuth installation, which will be used later.

Have the contents of that file be:

```shell
DATABASE_URL="mysql://ppvc:pp@VCpw@@127.0.0.1:3306/ppvc"
FUSIONAUTH_BASE="http://locahost:9011"
```

Again, if you are using a different database, that may look different. Consult the [symfony database configuration documentation](https://symfony.com/doc/current/doctrine.html) for more information.

Next up, require some needed libaries for templates and easier route setup:

```shell
symfony composer require twig
symfony composer require annotations
```

Now  create two routes. 

First, add a file at `src/Controller/HomeController.php`. This will be our home page. Put this code in there:

```php
<?php
namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class HomeController extends AbstractController
{
  /**
  * @Route("/")
  */
  public function index(): Response
  {
    return $this->render('home/index.html.twig', []);
  }
}
```

You need to add a twig template as well. This is what the user will actually see, and is typically, though not always, HTML. Here's the content of the `templates/home/index.html.twig` file:

```twig
{% raw %}
{% extends 'base.html.twig' %}

{% block content %}
<h1>
Welcome to Pied Piper video chat
</h1>

<p>
Login or register
</p>
{% endblock %}
{% endraw %}
```

You can do the same for `src/Controller/ChatController.php`. This will be the page the user arrives at after they have authenticated, eventually. For right now it'll be public just like the home page. Put this code in there:

```php
<?php
namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class ChatController extends AbstractController
{
  /**
  * @Route("/chat/")
  */
  public function index(): Response
  {
    return $this->render('chat/index.html.twig', []);
  }
}
```

Don't forget the twig template as well. In `templates/chat/index.html.twig`, put:

```twig
{% raw %}
{% extends 'base.html.twig' %}

{% block content %}
<h1>
Welcome to Pied Piper video chat
</h1>

<p>
Chat coming soon.
</p>
{% endblock %}
{% endraw %}
```

The last thing you need to do is to update the layout. You'll add some navigation and set it up to include the relevant content blocks you added in the twig templates above. In `templates/base.html.twig`, add this:

```twig
{% raw %}
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>{% block title %}Welcome!{% endblock %}</title>
        {# Run `composer require symfony/webpack-encore-bundle`
           and uncomment the following Encore helpers to start using Symfony UX #}
        {% block stylesheets %}
            {#{{ encore_entry_link_tags('app') }}#}
        {% endblock %}

        {% block javascripts %}
            {#{{ encore_entry_script_tags('app') }}#}
        {% endblock %}
    </head>
    <body>
        {% block body %}
            <div id="nav">
                {% block nav %}
                    <a href="{{ path('app_home_index') }}">Home</a>
                    | <a href="{{ path('app_chat_index') }}">Chat</a> 
                {% endblock %}
            </div>

            <div id="content">
                {% block content %}{% endblock %}
            </div>
        {% endblock %}
    </body>
</html>
{% endraw %}
```

Now you should be able to open a new terminal window and run:

```shell
symfony server:start
```

Visit `http://localhost:8000` and you should see your home page content.

PIC TBD

## Set up FusionAuth

The next component to set up will be FusionAuth. This OAuth server will serve as the system of record for all users in this chat application. It should already be set up, but if not, please run through the [5 minute tutorial](/docs/v1/tech/5-minute-setup-guide/). This tutorial will assume you are running FusionAuth locally, at `http://localhost:9011`.

There are two constraints of this tutorial for simplicity, but that are not inherent FusionAuth limits:

* All configuration will be done via the UI. All FusionAuth configuration can be performed via the [APIs](/docs/v1/tech/apis/) as well as the UI.
* Everything will be done in one tenant. FusionAuth supports multi-tenant configurations; some users are running [thousands of tenants](/blog/2021/03/29/seegno-thousands-tenants/).

Applications are anything you can log in to. You can set up the application configuration in FusionAuth by logging in to the administrative user interface by going to `http://localhost:9011`, then navigating to "Applications". Create a new application. Let's call it "PPVC" for "Pied Piper Video Chat".

Go to the "OAuth" tab and enter the following values:

* Add `http://localhost:8000/connect/fusionauth/check` to the "Authorized redirect URLs" list
* Add `http://localhost:8000` to the Logout URL setting.
* Make sure that the `Authorization Code` grant is checked in the "Enabled grants" section.

PIC TBD

Then go to the "Registration" tab and enable "Self service registration". Enable the "First name" and "Last name" fields. 

PIC TBD

Save the application by clicking the blue save button. Then click the green view button on the list of applications and view the details of this application configuration. Scroll down to the "OAuth configuration" section and note the "Client Id" and "Client secret". 

Add those to your `.env.local` file (so flip back to your terminal) so it will look like this:

```shell
DATABASE_URL="mysql://ppvc:pp@VCpw@@127.0.0.1:3306/ppvc"
FUSIONAUTH_BASE="http://localhost:9011"

CLIENT_ID="07ecf704-ec77-4f8a-aae7-fa2de28cf38e"
CLIENT_SECRET="QsaaSDwJohvaNBLIJNFPQg0_2iIndlJuXKlUQISytvE"
```

Your values will be different, but it should look similar.

The last thing you need to do is return to the administrative user interface and register a user to the new application. Navigate to "Users" then choose a user. It could be the user you are currently logged in as. Click "Add registration" and then add a registration for "PPVC". Save it.

When you are done, it should look a little something like this:

PIC TBD

You can now log out of the FusionAuth administrative user interface; it is configured.

Next, you'll add login/logout functionality to your symfony application.

## Adding login and logout

You can implement login and logout this any number of ways, but this tutorial is going to use the [KnpUOAuth2ClientBundle](https://github.com/knpuniversity/oauth2-client-bundle) for symfony, along with the [FusionAuth Provider for OAuth 2.0 Client](https://github.com/jerryhopper/oauth2-fusionauth) which has been created by Jerry Hopper, a FusionAuth community member.

Here's a diagram of the login flow with an authenticator.

{% plantuml source: _diagrams/blogs/symfony/authorization-code-grant.plantuml, alt: "The Authorization Code grant data flow." %}

### Add libraries

To begin integrating, add the needed libraries (make sure you are in the root directory of your application):

```shell
symfony composer require knpuniversity/oauth2-client-bundle
symfony composer require jerryhopper/oauth2-fusionauth
```

When `require`-ing the `knpuniversity/oauth2-client-bundle` package, you may see an error similar to:

```
Symfony operations: 1 recipe (6ebb9b08a331dda91a3b6d7738e7414c)
  -  WARNING  knpuniversity/oauth2-client-bundle (>=1.20): From github.com/symfony/recipes-contrib:master
    The recipe for this package comes from the "contrib" repository, which is open to community contributions.
    Review the recipe at https://github.com/symfony/recipes-contrib/tree/master/knpuniversity/oauth2-client-bundle/1.20

    Do you want to execute this recipe?
    [y] Yes
    [n] No
    [a] Yes for all packages, only for the current installation session
    [p] Yes permanently, never ask again for this project
```

You should execute this recipe, so hit `y` for "Yes".

### Set up the routes needed for the recipe

Then you need to configure these components.

You'll want to edit `config/packages/knpu_oauth2_client.yaml`; make the contents of the file:

```yaml
knpu_oauth2_client:
    clients:
        # configure your clients as described here: https://github.com/knpuniversity/oauth2-client-bundle#configuration
        fusionauth: 
            type: 'generic'
            provider_class: '\JerryHopper\OAuth2\Client\Provider\FusionAuth'
            client_id: '%env(CLIENT_ID)%'
            client_secret: '%env(CLIENT_SECRET)%'
            redirect_route: 'connect_fusionauth_check'
            provider_options: 
                urlAuthorize: '%env(FUSIONAUTH_BASE)%/oauth2/authorize'
                urlAccessToken: '%env(FUSIONAUTH_BASE)%/oauth2/token'
                urlResourceOwnerDetails: '%env(FUSIONAUTH_BASE)%/oauth2/userinfo'

```

Here you are configuring a generic provider because the FusionAuth provider hasn't been accepted by the recipe maintainers yet. You are providing the environment variables you placed in `.env.local` above for the `client_id` and `client_secret` values, as well as providing FusionAuth's authorize, token and user info endpoints.

This recipe ties into a couple of routes you must write. Create another controller with the needed routes. Put this in `src/Controller/FusionauthController.php`. (Note that `auth` is lowercase here, to match the `fusionauth` in the `clients` definition above.


```php
<?php

namespace App\Controller;

use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use League\OAuth2\Client\Provider\Exception\IdentityProviderException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class FusionauthController extends AbstractController
{
    /**
     * Link to this controller to start the "connect" process
     *
     * @Route("/connect/fusionauth", name="connect_fusionauth_start")
     */
    public function connectAction(ClientRegistry $clientRegistry)
    {
        return $clientRegistry
            ->getClient('fusionauth') // key used in config/packages/knpu_oauth2_client.yaml
            ->redirect([
	    	'profile', 'email' // the scopes you want to access
            ]);
    }

    /**
     * After going to Fusionauth, you're redirected back here
     * because this is the "redirect_route" you configured
     * in config/packages/knpu_oauth2_client.yaml
     *
     * @Route("/connect/fusionauth/check", name="connect_fusionauth_check")
     */
    public function connectCheckAction(Request $request, ClientRegistry $clientRegistry)
    {
    }
}
```

The first route, `connect_fusionauth_start`, is what starts the login process. You need to add this route to the navigation for the login link. Update the `nav` block in `base.html.twig` to add this:

```twig
{% raw %}
// ...
{% block nav %}
<a href="{{ path('app_home_index') }}">Home</a>
| <a href="{{ path('app_chat_index') }}">Chat</a>
| <a href="{{ path('connect_fusionauth_start') }}">Login</a>
{% endblock %}
// ...
{% endraw %}
```

The second route, `connect_fusionauth_check` is the same as the `redirect_route` value configured in `config/packages/knpu_oauth2_client.yaml`. Because you are authenticating the user, this method will be empty, but protected by an authenticator.

Let's build that next. 

### The authenticator

First, you need to configure the security settings to add the Authenticator. Add the following to `config/packages/security.yaml` under the `main` key, which is under `firewall`.

```yaml
custom_authenticators:
  - App\Security\FusionAuthAuthenticator
```

Remove the `anonymous` key under `main` because that is no longer supported. Enable authenticators by adding the following key to `config/packages/security.yaml` under the toplevel `security` key:

```yaml
enable_authenticator_manager: true
```

At the end, `config/packages/security.yaml` should look like:

```yaml
security:
    enable_authenticator_manager: true
    # https://symfony.com/doc/current/security.html#where-do-users-come-from-user-providers
    providers:
        users_in_memory: { memory: null }
    firewalls:
        dev:
            pattern: ^/(_(profiler|wdt)|css|images|js)/
            security: false
        main:
            lazy: true
            provider: users_in_memory
            custom_authenticators:
                 - App\Security\FusionAuthAuthenticator

            # activate different ways to authenticate
            # https://symfony.com/doc/current/security.html#firewalls-authentication

            # https://symfony.com/doc/current/security/impersonating_user.html
            # switch_user: true

    # Easy way to control access for large sections of your site
    # Note: Only the *first* access control that matches will be used
    access_control:
        # - { path: ^/admin, roles: ROLE_ADMIN }
        # - { path: ^/profile, roles: ROLE_USER }
```

Next, add the code for the Authenticator. Put this file in `src/Security/FusionAuthAuthenticator.php` (you may need to create `src/Security`):

```php
<?php 

namespace App\Security;

use App\Entity\User; // your user entity
use Doctrine\ORM\EntityManagerInterface;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use KnpU\OAuth2ClientBundle\Security\Authenticator\OAuth2Authenticator;
use League\OAuth2\Client\Token\AccessToken;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\PassportInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

class FusionAuthAuthenticator extends OAuth2Authenticator
{
    private $clientRegistry;
    private $entityManager;
    private $router;

    public function __construct(ClientRegistry $clientRegistry, EntityManagerInterface $entityManager, RouterInterface $router)
    {
        $this->clientRegistry = $clientRegistry;
        $this->entityManager = $entityManager;
        $this->router = $router;
    }

    public function supports(Request $request): ?bool
    {
        // continue ONLY if the current ROUTE matches the check ROUTE
        return $request->attributes->get('_route') === 'connect_fusionauth_check';
    }

    public function authenticate(Request $request): PassportInterface
    {
        $accessToken = $this->fetchAccessToken($this->clientRegistry->getClient('fusionauth'));
        $credentials = new AccessToken(['access_token' => $accessToken]);

        return new SelfValidatingPassport(
            new UserBadge($credentials, function($credentials) {
                /** @var FusionAuthUser $fusionAuthUser */
                $accessToken = new AccessToken(['access_token' => $credentials]);
                $fusionAuthUser = $this->clientRegistry->getClient('fusionauth')->fetchUserFromToken($accessToken);

                $email = $fusionAuthUser->getEmail();

                // 1) have they logged in with FusionAuth before? Easy!
                $existingUser = $this->entityManager->getRepository(User::class)->findOneBy(['fusionAuthId' => $fusionAuthUser->getId()]);

                if ($existingUser) {
                    return $existingUser;
                }

                // 2) do we have a matching user by email?
                $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]);

                // 3) Maybe you just want to "register" them by creating
                // a User object
                $user = new User();
                $user->setFusionAuthId($fusionAuthUser->getId());
                $user->setEmail($email);
                $user->setRoles($fusionAuthUser->toArray()['roles']);
                $this->entityManager->persist($user);
                $this->entityManager->flush();

                return $user;
            })
        );
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        $targetUrl = $this->router->generate('app_home_index');

        return new RedirectResponse($targetUrl);
    
        // or, on success, let the request continue to be handled by the controller
        //return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        $message = strtr($exception->getMessageKey(), $exception->getMessageData());

        return new Response($message, Response::HTTP_FORBIDDEN);
    }
}
```

That's a lot of code, let's look at the individual pieces.

```php
// ...
    public function supports(Request $request): ?bool
    {
        // continue ONLY if the current ROUTE matches the check ROUTE
        return $request->attributes->get('_route') === 'connect_fusionauth_check';
    }
// ...
```

The `supports` function says that this authenticator will only fire on `connect_fusionauth_check`. All other routes will be ignored. This makes sense because this is the route that fires when a user is done authenticating FusionAuth.

```php
// ...
    public function authenticate(Request $request): PassportInterface
    {
        $accessToken = $this->fetchAccessToken($this->clientRegistry->getClient('fusionauth'));
        $credentials = new AccessToken(['access_token' => $accessToken]);

        return new SelfValidatingPassport(
            new UserBadge($credentials, function($credentials) {
                /** @var FusionAuthUser $fusionAuthUser */
                $accessToken = new AccessToken(['access_token' => $credentials]);
                $fusionAuthUser = $this->clientRegistry->getClient('fusionauth')->fetchUserFromToken($accessToken);

                $email = $fusionAuthUser->getEmail();

                // 1) have they logged in with FusionAuth before? Easy!
                $existingUser = $this->entityManager->getRepository(User::class)->findOneBy(['fusionAuthId' => $fusionAuthUser->getId()]);

                if ($existingUser) {
                    return $existingUser;
                }

                // Maybe you just want to "register" them by creating
                // a User object
                $user = new User();
                $user->setFusionAuthId($fusionAuthUser->getId());
                $user->setEmail($email);
                $user->setRoles($fusionAuthUser->toArray()['roles']);
                $this->entityManager->persist($user);
                $this->entityManager->flush();

                return $user;
            })
        );
    }
```

This is where most of the authentication logic lives. The code here gets the access token, which the OAuth libraries provide, and retrieves the users info from the userInfo endpoint. If the user doesn't exist in the symfony database, you create a record in your database. This 'shadow profile' allows you to have user references to other items in your database. (For instance, if you wanted to create a chat history download function, you'd want to know which users participated in a chat, and save the chat history information in your database, referencing these users.)

```php
//...
    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        $targetUrl = $this->router->generate('app_home_index');

        return new RedirectResponse($targetUrl);
    
        // or, on success, let the request continue to be handled by the controller
        //return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        $message = strtr($exception->getMessageKey(), $exception->getMessageData());

        return new Response($message, Response::HTTP_FORBIDDEN);
    }
// ...
```

Finally, the `onAuthenticationSuccess` and `onAuthenticationFailure` methods take care of where to send the user if authentication succeeds or fails, respectively.

Here's a diagram of the login flow.

{% plantuml source: _diagrams/blogs/symfony/authorization-code-grant.plantuml, alt: "The Authorization Code grant data flow." %}

### Add a shadow profile database table

Before you can test this, you need to create a user table for the 'shadow profile' in the database and configure the object.

```shell
symfony console make:user
```

You can accept all the defaults except for `Does this app need to hash/check user passwords? (yes/no) [yes]`. This you want to answer "no" to, since FusionAuth will be storing all your passwords.

Then, add a `fusionAuthId` property to the file at `src/Entity/User.php`:

```php
//...
private $fusionAuthId;

/**
* @ORM\Column(type="string", length=180, unique=true)
*/

public function getFusionAuthId(): ?string
{
  return $this->fusionAuthId;
}

public function setFusionAuthId(string $fusionAuthId): self
{
  $this->fusionAuthId = $fusionAuthId;

  return $this;
}
//...
```

Now, generate the migration and run it:

```shell
symfony console doctrine:migrations:diff
symfony console doctrine:migrations:migrate
```

You can see the "Login" link is present.

PIC TBD

Click it and sign in with the user you registered for the application when you set up FusionAuth.



### Test login

If you left the server running, visit `http://localhost:8000`. If not, start it up again:

```shell
symfony server:start
```

and visit `http://localhost:8000`.

PIC TBD

When you successfully login, you are sent back to the home page. What happened? The template needs to be updated to show different messages for logged in users. Let's add a logout link so you can know if someone successfully logged in.

## Setting up logout

To add logout, configure the security settings file. Add the following to `config/packages/security.yaml` under the `main` key, which is under `firewall`.

```yaml
logout:
  path:   app_logout
```

Next, add a controller with that path in `src/Controller/SecurityController.php`.

```php
<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class SecurityController extends AbstractController
{
    /**
     * @Route("/logout", name="app_logout", methods={"GET"})
     */
    public function logout()
    {
        // controller can be blank: it will never be executed!
        throw new \Exception('Don\'t forget to activate logout in security.yaml');
    }
}
```

Finally, add a logout link to the navbar:

```twig
{% raw %}
// ...
{% block nav %}
<a href="{{ path('app_home_index') }}">Home</a>
{% if not is_granted('IS_AUTHENTICATED_FULLY') %}
| <a href="{{ path('connect_fusionauth_start') }}">Login</a>
{% endif %}
{% if is_granted('IS_AUTHENTICATED_FULLY') %}
  | <a href="{{ path('app_chat_index') }}">Chat</a> 
  | <a href="{{ path('app_logout') }}">Logout</a>
{% endif %}
{% endblock %}
{% endraw %}
// ...
```

Run visit the page. If you haven't logged out, you should a "Logout" link. If you click it, you'll be sent back to the home page where you can "Login" again. 

PIC TBD

However, if you click "Login", you will be automatically logged in again without having to provide your username and password.  This is because FusionAuth remembers you! You need to take some extra steps to make sure clicking "Logout" in the application also logs you out of FusionAuth.

### Logging out of FusionAuth

To log out of FusionAuth, you need to add a custom event listener. It will listen for the logout event and redirect the user to the FusionAuth logout URL. Because of the "Logout URL" you configured in the "PPVC" FusionAuth application, the user will then be logged out and sent back to the home page.

To do this, first add the following service to `config/services.yaml`:

```yaml
    App\EventListener\CustomLogoutListener:
        arguments:
           $fusionauthBase: '%env(FUSIONAUTH_BASE)%'
           $fusionauthClientId: '%env(CLIENT_ID)%'
        tags:
            - name: kernel.event_listener
              dispatcher: security.event_dispatcher.main
              event: 'Symfony\Component\Security\Http\Event\LogoutEvent'
```

Then, you need to create the listener (put it at `src/EventListener/CustomLogoutListener.php`; you'll need to create the directory).

```php
<?php

namespace App\EventListener;

use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Security\Http\Event\LogoutEvent;

class CustomLogoutListener
{
    private $fusionauthClientId;
    private $fusionauthBase;

    public function __construct($fusionauthBase, $fusionauthClientId)
    {
        $this->fusionauthBase = $fusionauthBase;
        $this->fusionauthClientId = $fusionauthClientId;
    }

   public function onSymfonyComponentSecurityHttpEventLogoutEvent(LogoutEvent $event)
    {

        $fusionauth_base = $this->fusionauthBase;
        $client_id = $this->fusionauthClientId;
        $response = new RedirectResponse($fusionauth_base.'/oauth2/logout?client_id='.$client_id);
        $event->setResponse($response);
    }
}
```

Once this is complete, you should be fully logged out when you click logout.

Pic TBD

### Protecting Chat

You may have tried to visit the `/chat` page by editing the URL and found that you could. That's problematic, to say the least. Even though you protected the link in the nav, both users and browsers have memories. In this section, let's update symfony to protect it. Configure the security settings file. Add the following to `config/packages/security.yaml` under the `access_control` key.

```yaml
        - { path: ^/home, roles: PUBLIC_ACCESS }
        - { path: ^/chat, roles: ROLE_USER }
```

Awesome, you don't see the chat page. But you do see an ugly page. 

PIC TBD

Let's fix that by adding an entry point. This tells symfony where to send an unauthenticated user. You could create a special page or send them to a registration page. In this tutorial you are going to send them to the home page.

You need to modify `config/services.yaml` to add a custom entry point. Add this under the `services` key:

```yaml
    App\Security\Firewall\EntryPoint:
        arguments:
           - url: '/'
```

Then modify `config/packages/security.yaml` to add an entry point under the `main` key:

```yaml
entry_point: App\Security\Firewall\EntryPoint
```

Finally, you need to create that class. Here's the contents of the class, which you should create at `src/Security/Firewall/EntryPoint.php` (you will need to create `src/Security/Firewall`):

```php
<?php
namespace App\Security\Firewall;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\EntryPoint\AuthenticationEntryPointInterface;

class EntryPoint implements AuthenticationEntryPointInterface{
  private $url;
  public function __construct($url){
    $this->url = $url;
  }
  public function start(Request $request, AuthenticationException $authException = null){
      $response = new Response(
        '',
        Response::HTTP_FOUND, //for 302 and Response::HTTP_TEMPORARY_REDIRECT for HTTP307 
        array('Location'=>$this->url)); 
      return $response;
  }
}
```

This class takes the URL it is passed by the services dependency injection and forwards an unauthenticated user to it. 

Now when you modify the URL and visit `http://localhost:8000/chat/` you are redirected back to the root page.



## Next steps

That's it! You've successfully integrated symfony and FusionAuth. You can now use all the FusionAuth login functionality without writing it, including offering social login, passwordless, SAML integration and more.

All the code discussed is available on [GitHub under a permissive license](https://github.com/FusionAuth/fusionauth-example-symfony/) if you'd like to download it and see play with the code.

Some next steps you could take:

* Deploy the app somewhere live! Make sure you set the environment variables correctly as well as setting up FusionAuth at an internet accessible location.
* Build out the chat app, maybe using an API like [Daily.co](https://www.daily.co/).
* Add self service registration (hint, it's done in the github repo and you've already set up FusionAuth for it; build a controller to send the user to the registration link).

Happy coding!
