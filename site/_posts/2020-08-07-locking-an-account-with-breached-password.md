---
layout: blog-post
title: Locking user accounts with a webhook
description: Webhooks let you take actions based on events in FusionAuth. For instance, when someone logs in with a compromised password, you can immediately lock their account.
author: Dan Moore
image: blogs/breached-password-detection/how-to-enable-breached-password-detection-fusionauth.png
category: blog
tags: feature-breached-password-detection client-php feature-webhooks
excerpt_separator: "<!--more-->"
---

An auth system is rarely sufficient on its own. After all, users want to authenticate in order to use an application's functionality, not for the fun of entering their username and password. In almost every instance, a user management system will be integrated into one or more applications, whether custom, open source, or SaaS software. 

<!--more-->

FusionAuth gives you options. You can integrate using [JWTs](/docs/v1/tech/oauth/tokens) or the [APIs](/docs/v1/tech/apis/). However, when events happen, you may want other parts of your system to be informed so they can take action. Do this with webhooks. 

You may also use webhooks to extend the functionality of FusionAuth, listening to events and then calling back into FusionAuth using the APIs.

Suppose you have an application to which access is so sensitive that if any user's password is found to be breached, the account should immediately be locked. This feature isn't built into FusionAuth. What do you do? 

In this tutorial, I'll show you how to implement this. We'll lock an account immediately if someone signs in with a password that is compromised.

> Due to the use case, this post focuses on the breached password event, but the integration principles apply for any of the [over fifteen events](/docs/v1/tech/events-webhooks/events) for which FusionAuth can fire a webhook.

This is different from [locking an account based on a number of failed logins](/docs/v1/tech/tutorials/setting-up-user-account-lockout). Here, you are relying on the [breached password detection previously discussed](/blog/2020/07/22/breached-password-detection). 

*Breached password detection is a [paid edition feature](/pricing).*

## Prerequisites

* A modern PHP (tested with PHP 7.3)
* FusionAuth installed (see the [5 minute setup guide](/docs/v1/tech/5-minute-setup-guide) if you don't have it)
* A license for a paid edition of FusionAuth

If you'd like to jump ahead to the code, here's the [GitHub repo](https://github.com/FusionAuth/fusionauth-example-php-webhook) that you can download and explore.

## Set up users, license, and API keys

Once you're in the administrative interface, create a user with a horrible password, one that is compromised. I suggest `password` as a tried and true option. Enable your license as [outlined here](/docs/v1/tech/reactor).

Then create an API key by navigating to the *Settings* tab and then to *API Keys*. At a minimum configure the following permission for this key: `DELETE` on the `/api/user` endpoint. Record the API key for later use.

## Configure breached password detection

Navigate to the *Tenants* tab and then to the default tenant. Go to the *Passwords* tab. Take the following steps:

* Enable breached password detection.
* Set the *On login* option to "Only record the result, take no action."

Your settings should look like this:

{% include _image.liquid src="/assets/img/blogs/breached-password-webhook/tenant-settings-password-tab.png" alt="Setting up breached password detection." class="img-fluid" figure=false %}

## Configure tenant webhook settings

Now, you need to configure the webhook at the tenant level. This will ensure the tenant emits the event and waits for the webhook's success. Navigate to the *Webhooks* tab for the default tenant. Enable the `user.password.breach` event and set the "Transaction setting" to "All the Webhooks must succeed".

{% include _image.liquid src="/assets/img/blogs/breached-password-webhook/tenant-settings-webhooks-tab.png" alt="Setting up webhook tenant settings." class="img-fluid" figure=false %}

Click the *Save* button to persist the tenant configuration. Now that you have configured the tenant to send events, you need to configure a webhook to listen.

## Configure the webhook 

Navigate to the *Settings* section, and then to *Webhooks*. You may need to scroll to see this section. You're now setting the webhook up and making sure it is able to receive the breached password detection event.

While a bit more complicated, separately configuring the tenant to emit an event and the webhook to receive it provides flexibility. You can create a number of global webhooks and then have tenants control which events are sent. For example, if you are [private labeling an application with FusionAuth's multi-tenancy functionality](/blog/2020/06/30/private-labeling-with-multi-tenant), you could set up one tenant to emit events for new user registrations and another to emit only failed user logins. If you want to emit the same event in different tenants, you can also configure the webhook to listen to events from specific applications. See the [docs for more info](/docs/v1/tech/events-webhooks/).

Now, create the webhook in FusionAuth. Set the URL to `http://localhost:8000/webhook.php`. For an example, using this protocol is fine, but for production, please use TLS. Add a description, and you should end up with a screen like this:

{% include _image.liquid src="/assets/img/blogs/breached-password-webhook/webhook-settings-url.png" alt="The webhook configuration screen." class="img-fluid" figure=false %}

Scroll down and make sure the `user.password.breach` event is enabled:

{% include _image.liquid src="/assets/img/blogs/breached-password-webhook/webhook-settings-event-choice.png" alt="Configuring the received webhook events." class="img-fluid" figure=false %}

It's a good idea to secure your webhook so no unauthorized POSTs will be processed. You can do that with a [header, basic auth, or at the network layer](/docs/v1/tech/events-webhooks/securing), or some combination of the three. For this application, set a header value for the webhook:

{% include _image.liquid src="/assets/img/blogs/breached-password-webhook/webhook-settings-add-headers.png" alt="Configuring the webhook to receive an Authorization header." class="img-fluid" figure=false %}

Finally, click the *Save* button.

## Write the webhook code

Now that FusionAuth is properly configured, let's look at some code. We'll be using PHP because it's a performant language with good JSON handling. You could use any of the [client libraries](/docs/v1/tech/client-libraries/) or call the APIs directly. I suppose you could write the webhook in bash, IF YOU DARE.

But we'll use PHP. 

The code is [available here](https://github.com/FusionAuth/fusionauth-example-php-webhook) if you want to check it out. Here's the `webhook.php` code, which is the heart of the example:

```php
<?php
require __DIR__. '/config.php';
require __DIR__ . '/vendor/autoload.php';

$headers = getallheaders();
if (!$headers) {
  error_log("Invalid authorization header.");
  return;
}

$authorization_value = $headers['Authorization'];
if ($authorization_value !== $authorization_header_value) {
  error_log("Invalid authorization header value found: ".$authorization_value);
  return;
}

$input = file_get_contents('php://input');

$obj = json_decode($input);
if (!$obj) { 
  error_log("Invalid JSON");
  return;
}

$type = $obj->event->type;
if ($type !== "user.password.breach") {
  error_log("Sorry, we only handle breached password events.");
  return;
}

$user_id = $obj->event->user->id;
if (!$user_id) {
  error_log("No user id");
  return;
}
$client = new FusionAuth\FusionAuthClient($api_key, $fa_url);
$response = $client->deactivateUser($user_id);
if (!$response->wasSuccessful()) {
  // uh oh
  error_log("Response wasn't successful:");
  error_log(var_export($response, TRUE));
  return;
}
http_response_code(500);
?>
```

Let's walk through this code, line by line.

```php
// ...
require __DIR__. '/config.php';
require __DIR__ . '/vendor/autoload.php';
// ...
```

First, there are some required libraries and files.

```php
//...
$headers = getallheaders();
if (!$headers) {
  error_log("Invalid authorization header.");
  return;
}

$authorization_value = $headers['Authorization'];
if ($authorization_value !== $authorization_header_value) {
  error_log("Invalid authorization header value found: ".$authorization_value);
  return;
}
//...
```

Then, the code checks the `Authorization` header. This ensures that only FusionAuth calls this webhook. For production, you would definitely want to use TLS as well.

```php
//...
$input = file_get_contents('php://input');

$obj = json_decode($input);
//...
```

In these lines, the entire contents of the webhook payload are converted into a string. The string is then decoded into a JSON object for easier handling.

```php
//...
if (!$obj) { 
  error_log("Invalid JSON");
  return;
}

type = $obj->event->type;
if ($type !== "user.password.breach") {
  error_log("Sorry, we only handle breached password events.");
  return;
}

$user_id = $obj->event->user->id;
if (!$user_id) {
  error_log("No user id");
  return;
}
//...
```

Next, validate the payload. If you don't get valid JSON, a password breach event, and a user id, simply log an error and return. Doing so allows the webhook and the login event to succeed. Check for the event type just in case there's a misconfiguration and our webhook is notified of other types of events.

```php
//...
$client = new FusionAuth\FusionAuthClient($api_key, $fa_url);
$response = $client->deactivateUser($user_id);
if (!$response->wasSuccessful()) {
  error_log("Response wasn't successful:");
  error_log(var_export($response, TRUE));
  return;
}
//...
```

Finally! This is where the action is. This code creates a new FusionAuth client. It then deactivates the user who logged in with a password found to be compromised. You could take other steps here, too. 

You could do more within FusionAuth, by, for example:

* Adding a date of deactivation to the `user.data` field
* [Actioning the user](/docs/v1/tech/apis/actioning-users) for display in the administrative interface or to be queried via the API
* Putting the user in a [group](/docs/v1/tech/core-concepts/groups) for future processing

You could also integrate with other systems.

* You could fire off an API call to another service that needs to know about this security violation
* The system could add an event to a streaming service such as Kafka for future analysis
* Your application could send an email to the user and their boss about the situation. Wouldn't be cool, but you could do it.

```php
//...
http_response_code(500);
//...
```

Finally, we return a `500` HTTP status code. This stops the login process. Because we configured this tenant to require all webhooks to succeed before processing the event, if any don't, the event doesn't complete. This means the user is not logged in. 

If this webhook didn't fail, the user would be logged in. The account would be deactivated; they'd be unable to login later. But their current session would be active for the duration of the token. We don't want that to happen, so that's why the code returns a `500`.

## Results

If you install the webhook, follow the instructions in [the repository](https://github.com/FusionAuth/fusionauth-example-php-webhook/blob/master/README.md), and login as a user with a breached password, the user will see this screen on their first failed login: 

{% include _image.liquid src="/assets/img/blogs/breached-password-webhook/first-attempt-login-after-lock.png" alt="Login screen after first failed login attempt." class="img-fluid" figure=false %}

On their second login, they'll see the normal "your account has been locked" error message:

{% include _image.liquid src="/assets/img/blogs/breached-password-webhook/first-attempt-login-after-lock.png" alt="Login screen after subsequent failed login attempts." class="img-fluid" figure=false %}

In a production system, I'd want to customize these messages; you can do that via [theming](/docs/v1/tech/themes/).

This user will also be deactivated in the administrative user interface:

{% include _image.liquid src="/assets/img/blogs/breached-password-webhook/admin-view-user-locked.png" alt="Administrative user interface view of locked user." class="img-fluid" figure=false %}

## Conclusion

Webhooks allow you to extend FusionAuth in all kinds of interesting ways. 

Whether you are pushing data to an external system or calling back into FusionAuth to take custom actions, you can leverage webhooks to make FusionAuth work the way you want.

