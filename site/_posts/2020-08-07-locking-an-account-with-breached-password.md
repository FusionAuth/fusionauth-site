---
layout: blog-post
title: Locking user accounts with a webhook
description: You can take actions based on events in a FusionAuth system. For instance, when someone logs in with a compromised password, you can immediately lock their account.
author: Dan Moore
image: blogs/breached-password-detection/how-to-enable-breached-password-detection-fusionauth.png
category: blog
tags: feature-breached-password-detection client-php
excerpt_separator: "<!--more-->"
---

A user management system like FusionAuth is rarely sufficient on its own. After all, users want to authenticate to use an application's functionality. In almost every instance, it'll be integrated into one or more applications, whether custom or commercial off the shelf software. 

<!--more-->

You can perform this integration with [JWTs](/docs/v1/tech/oauth/tokens) and the [FusionAuth API](/docs/v1/tech/apis/). However, when certain events happen, you may want other parts of your system to be informed so they can take action. You can do this with webhooks. You may also use webhooks to extend the functionality of FusionAuth, listening to events and then calling back into FusionAuth using the APIs.

Suppose you have an application which is so sensitive that if any user's passord is found to be breached, the account should immediately be locked. This isn't built into FusionAuth. What do you do? 

In this tutorial, I'll show you how to lock an account immediately if someone signs in with a password that is compromised.

This is different than [locking an account based on a number of failed logins](/docs/v1/tech/tutorials/setting-up-user-account-lockout). In this situation, you are relying on the [breached password detection previously covered here](/blog/2020/07/22/breached-password-detection). Note, this is a [paid edition feature](/pricing).

> Due to the use case, this post focuses on the breached password event, but the principles of integration work for any of the [over fifteen events](/docs/v1/tech/events-webhooks/events) for which FusionAuth has webhooks.

## Prerequisites

* A modern PHP (tested with php 7.3)
* FusionAuth installed (see the [5 minute setup guide](/docs/v1/tech/5-minute-setup-guide) if you don't have it)
* A license for a [paid edition](/pricing) of FusionAuth

If you'd like to jump ahead to the code, here's the [GitHub repo](https://github.com/FusionAuth/fusionauth-example-php-webhook).

## Set up users, your license, and API keys

Once you're in the administrative interface, create a user with a horrible password, one that is compromised. I suggest `password` as a tried and true option.

Next, make sure you enable your license as [outlined here](/docs/v1/tech/reactor).

Create an API key by navigating to the *Settings* tab and then to *API Keys*. At a miniumum configure the following permission: `DELETE` on the `/api/user` endpoint. Record the API key for later use.

## Configure breached password detection

Navigate to *Tenants* and then to the default tenant. Go to the *Passwords* tab. Take the following steps:

* Enable breached password detection.
* Set the *On login* option to "Only record the result, take no action."

Your settings should look like this:

TBD pic tenant-settings-password-tab.png

## Configure tenant webhook settings

Now, you need to configure the webhook at the tenant level. This will ensure the webhook receives the event. Navigate to the *Webhooks* tab for the default tenant. Enable the `user.password.breach` event and set the "Transaction setting" to "All the Webhooks must succeed".

TBD pic tenant-settings-webhook-tab.png

Now that you have configured the tenant to emit the webhook events, you need to configure a webhook to listen.

## Configure the webhook 

Navigate to the *Settings* section, and then to *Webhooks*. You may need to scroll to see that section. In this section, you're setting up the webhook and making sure it is able to receive the breached password detection event from any tenant for which it is configured.

While a bit more complicated, configuring the tenant to emit an event and the webhook to receive it separately provides flexibility. You can create a number of global webhooks and then have tenants control which events are sent. For example, if you are [private labeling an application with FusionAuth's multi-tenancy functionality](/blog/2020/06/30/private-labeling-with-multi-tenant), you could set up one tenant to emit events for new user registrations and another to emit only failed user logins. If you want to emit the same event in different tenants, you can also configure the webhook to listen to events from certain applications.

Create the webhook. Set the URL to `http://localhost:8000/webhook.php`, add a descripton, and make sure the `user.password.breach` event is enabled.

TBD two pics

It's a good idea to add a layer of security for a webhook so no unauthorized use can occur. You can do that with a [header, basic auth, or at the network layer](/docs/v1/tech/events-webhooks/securing), or some combination. For this application, you'll set a header value for the webhook:

TBD pic

## Write the webhook code

Now that everything is properly configured, let's write code. We'll be using PHP because it's a performant language with good JSON handling, but any of the supported [client libraries](/docs/v1/tech/client-libraries/) would work as well. 

The code is [available here](https://github.com/FusionAuth/fusionauth-example-php-webhook) if you want to check it out.

Here's the `webhook.php` code:

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
http_response_code(403);
?>
```

Let's walk through this code:

```php
// ...
require __DIR__. '/config.php';
require __DIR__ . '/vendor/autoload.php';
```

First, require some needed libraries.

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

Then, check the authorization header to make sure that whoever is calling the webhook has the correct permissions.

```php
//...
$input = file_get_contents('php://input');

$obj = json_decode($input);
//...
```

Here, we pull the entire contents of the webhook payload and decode it into a JSON object.

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

These lines of code validate the payload. If we don't get valid JSON, a password breach event, and a user id, log an error and return. That returns a `200` and the webhook succeeds.

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

This code is creating a new FusionAuth client. Then it deactivates the user. 

This is the place you could take any other action. You could add a date of deactivation to the `user.data` field, fire off another API call, or add data to S3 for future analysis.

```php
//...
http_response_code(403);
//...
```

Finally, we return a non `200` status. This disrupts the login process, because we configured this tenant to require all webhooks to succeed before processing the event. I returned a `403` because I think that is the correct semantic value; the client is no longer authorized.

If we didn't fail at the end of this webhook, the user would be logged in. The account would be deactivated and so they'd be unable to login again, but their current session would be active for the duration of the JWT, as configured in the tenant. We don't want that to happen, so that's why we fail.

## Results

If you install the webhook, follow the full instructions in the repository, and login as a user with a breached password, the user will see this on their first failed login: 

pic TBD

On their second login, they'll see the normal "your account has been locked" error message.

In a production system, I'd want to customize these messages, and you can do that via [theming](/docs/v1/tech/themes/).

This user will also be deactivated in the administrative user interface:

pic TBD

## Conclusion

Webhooks allow you to extend FusionAuth in all kinds of interesting ways. Whether you are pushing data to an external system or calling back into FusionAuth to take custom actions, you can leverage webhooks to make FusionAuth work the way you want.
