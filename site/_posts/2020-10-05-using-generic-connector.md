---
layout: blog-post
title: Migrate your user data with minimum impact
description: How can you safely and easily migrate your user data from a legacy datastore?
author: Dan Moore
image: blogs/node-microservices-gateway/building-a-microservices-gateway-application.png
category: blog
tags: client-php feature-connectors
excerpt_separator: "<!--more-->"
---

Once you have migrated an application to use a modern data store, how can you migrate your users?

<!--more-->

Previously, you updated a legacy line of business PHP application to use [OAuth and FusionAuth to authenticate users](TBD). "The ATM" application now works well for new users. But how do you migrate existing users?

## Why migrate

First, it's important to understand the benefits of having a central user data store, rather than disparate, per application data stores. If you centralize user accounts, you have a single:

* View of user data
* Place to go to add and remove account and otherwise manage access
* Application to secure and update
* Interface for your users to interact with
* Password for your users to remember

You also have the ability to more easily implement single sign-on. As you add more and more applications, the value of this central user data store grows.

As you are contemplating a migration of existing users to a user datastore, you want to keep a few things in mind:

* Access: Usually, this is the highest priority concern. Any migration must be done with minimal impact to the user experience, including, but not limited to maintaining access to apps they currently use. 
* Data: You need to map currently held user data into the new system.
* Password: This is a subset of the data, but one that should be treated differently. Since passwords are typically [hashed, not encrypted](/learn/expert-advice/security/math-of-password-hashing-algorithms-entropy), you can't import hashes directly unless you have the same encryption algorithm.

There are only a few options:

* Big bang
* Migrate-on-authentication

I'll cover the big bang option briefly with some pointers to other docs, and then dive into migrate-on-authentication.

## Big bang

If you choose the big bang method, you are moving all your users at once. This means you build a system to migrate them, test the heck out of it, and have some downtime where you flip a switch. You also should create a rollback plan in case the testing misses something.

This works well when you have a small userbase or an application. It also works when you need to decommission the legacy datastore as soon as possible, such as when a license renewal is upcoming. This may be operationally simpler too, because you are only running two systems for a small period of time; you keep the legacy system running only for so long as is required to verify the mass migration worked.

The risks of this type of migration are:

* You'll miss some part of the migration during testing.
* You'll encounter some unexpected error during the production rollout causing a rollback.

A variation on this approach is the segment by segment big bang. It may be possible to split up a big bang and move the users of each application to the new user data store, one application at at time.

## FusionAuth's support for the big bang

If you want to use this method with FusionAuth, you'll want to check out the [Migrate Users tutorial](/docs/v1/tech/tutorials/migrate-users). FusionAuth also includes support for custom password hashing schemes, as documented in that tutorial.

## Migrate-on-authentication

This is a phased approach. In this approach, you maintain the existing user data store, but each time a user authenticates, you move over their data.

The benefits of this approach are many:

* There's less risk because this is gradual, so only a subset of users are affected if there is an issue. 
* The change can be rolled out to focused set of users, perhaps internal, to reduce the need for manual testing. It's easier to dogfood.
* There is no need to understand or reimplement the password hashing algorithm, as you'll re-hash each password when presented by the user.
* You won't migrate users who haven't used your application at the end of the migration period. Depending on your application usage, these users may be candidates for archival or deletion.

However, there are risks with this approach as well. 

* The cutover will take longer. You must maintain two systems for the duration of the cutover.
* Customer service may have to look in two systems to find someone.
* Rollback is more complex if there is an issue, because users are now in two systems.

## FusionAuth's support for phased user migration

You can do a phased migration using FusionAuth Connectors. 

If you don't have FusionAuth running, [get it going in 5 minutes](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide). Then get a license key and activate it. *Please note that advanced registration forms are a paid edition feature. You can [learn more about paid editions and sign up for a free trial here](/pricing).* Finally, [activate your license](/docs/v1/tech/reactor). 

The way to use a Connector for a phased migration requires a few steps, but in general you will:

* Build an API in your existing application which takes the username and password and returns a JSON login response. Protect that API by serving it over TLS and using basic authentication.
* Configure the connector to run for your application
* Let it run for a while and when you reach a certain timeline or percentage migrated over delete the connector .
* Migrate the rest of the users (if needed) using the big bang APIs. The risk is much lower now, as there are far fewer active users.
* Update the application to remove the legacy datastore. 

Let's look at how this might work in the context of the previously examined ["The ATM" legacy line of business PHP application](TBD). This code is available in the `master` branch of the GitHub repo, or [online](https://github.com/fusionauth/fusionauth-example-php-connector).

## Build an API

The first step to using a generic Connector is to build an API. This API will take the username and password input from FusionAuth and return a user JSON object.

Here's an example of what you might see from FusionAuth:

```json
{
  "loginId": "example@fusionauth.io",
  "password": "password",
  "applicationId": "10000000-0000-0002-0000-000000000001",
  "noJWT" : false,
  "ipAddress": "192.168.1.42"
}
```

The meanings of these keys are explained in the [Login API](/docs/v1/tech/apis/login#authenticate-a-user) docs, but in general, you'll want to take the `loginId` and the `password` fields and authenticate against the legacy datastore. The `user` JSON object is in documented in the [User API](/docs/v1/tech/apis/users) docs.

For the "The ATM" application, the PHP code for the API endpoint is pretty simple. First, there's a `config.php` file, which looks like this:

```php
<?php
// definitely update
$client_id = '1892611a-6b99-4457-913f-f39f7c614eb2';
$client_secret = '4X5_1OVkZi4ottPOrtdzwbe9lbuXRf2Vo9bZJenMkl0';
$tenant_id = '30663132-6464-6665-3032-326466613934';
$authorization_header_value = 'supersecretauthheader';

// update if you aren't running the app or FusionAuth in the default location 
$redirect_uri = 'http://localhost:8000/oauth-callback.php';
$fa_url = 'http://localhost:9011';
```

This sets some variables which are then used by the file which accepts the call from FusionAuth and performs the authentication. In the sample repository, this file is `fusionauthconnector.php`.

```php
<?php
require __DIR__. '/config.php';
require __DIR__. '/common.php';
require __DIR__ . '/vendor/autoload.php';

use Ramsey\Uuid\Uuid;

$headers = getallheaders();
if (!$headers) {
  error_log("Invalid authorization header.");
  return;
}

// check auth header
$authorization_value = $headers['Authorization'];
if ($authorization_value !== $authorization_header_value) {
  error_log("Invalid authorization header value found: ".$authorization_value);
  return;
}

$input = file_get_contents('php://input');

$inputobj = json_decode($input);
if (!$inputobj) {
  error_log("Invalid JSON");
  return;
}

// for debugging the data passed to us
// error_log(var_export($input, TRUE));

if (!auth($inputobj->loginId, $inputobj->password)) {
  http_response_code(404);
  return;
}

// build the user object
// in the real world, we'd pull this data from the database.
$obj = [];
$user = [];

$user['id'] = Uuid::uuid4();
$user['email'] = $inputobj->loginId;
$user['active'] = true;
$user['verified'] = true;
$user['tenantId'] = $tenant_id;

$data = [];
$data['favoriteColor'] = 'blue';
$user['data'] = $data;

$registrations = [];
$registration = [];
$registration['applicationId'] = $client_id;
array_push($registrations, $registration);

$user['registrations'] = $registrations;

$obj['user'] = $user;

echo json_encode($obj);
?>
```

This code does three main things. First, it checks some headers to ensure that it knows who is calling it. This endpoint opens up a view into your user datastore, so you want to make sure that there's no unauthorized access. There are a variety of security measures you can use, but running over TLS and using an authorization header enforces a basic level of security.

Then it authenticates the user. It uses the same `auth` common code that was used way back before "The ATM" was converted to use OAuth (see the [previous post](TBD) for more), which probably reaches into the database in most applications.

Finally, it builds the user object. Again, normally this would be coming from the database, but here it is hard coded. 

```php
//...
$user['id'] = Uuid::uuid4();
//...
```

This code generates a UUID. FusionAuth requires each user to have a unique id which is a UUID. You can pull it from the legacy datastore rather than generate it, if that's easier.

```php
//...
$user['id'] = Uuid::uuid4();
$user['email'] = $inputobj->loginId;
$user['active'] = true;
$user['verified'] = true;
$user['tenantId'] = $tenant_id;
//...
```

You can set values on the user object. These are hardcoded or pulled from configuration, but they could have been pulled from anywhere.

```php
//...
$data = [];
$data['favoriteColor'] = 'blue';
$user['data'] = $data;
//...
```

You can populate the `data` field with arbitrary key value data about the user.

```php
//...
$registrations = [];
$registration = [];
$registration['applicationId'] = $client_id;
array_push($registrations, $registration);

$user['registrations'] = $registrations;
//...
```

You will want to register this user to one or more applications defined in FusionAuth. In this case, the user is automatically registered for the application to which they are trying to authenticate, which is likely what you want. However, you could register them to multiple different applications at migration time.

The Authentication URL API endpoint is now complete. The next step is to configure FusionAuth to use this.

## Configure the connector

There are two parts to configuring the Connector to use the API you just built. 
The first is setting up the Connector and the second is updating the tenant configuration to use it. Below, you'll step through doing this with teh administrative user interface, but you can also do so by using the [Connector APIs](/docs/v1/tech/apis/connectors) and the [Tenant APIs](/docs/v1/tech/apis/tenants).

First, create the Connector by navigating to "Settings" and then "Connectors", and create a new one. 

Give it a name, like "My ATM Connector", and update the "Authentication URL" with the URL of the API you created above. You'll also want to update the headers tab with the authorization header you configured in `config.php`. You can also examine some of the other ways to secure your API endpoint. At the end, it looks like this:

pic tbd generic-connector-create.png

Then you need to configure the tenant to use this connector. 
Navigating to "Tenants", "Your Tenant" and then the "Connectors" tab. Create a new policy. 

Select the Connector you created and change the domain if needed; that's only required if a subset of users, differentiated by email domain, will be the only accounts authenticated against this Connector.

Finally, make sure you check the "Migrate user" checkbox. This ensures that the user data will be pulled over at authentication. After the first successful authentication, the "The ATM" Authentication URL will not be called for this user ever again.

pic tbd add-connector-to-tenant.png

Make sure you save your tenant settings by clicking the blue "save" icon in the upper right corner.

## Let it run

You would then let the "The ATM" application run for a while. Users will be migrated over and registered with the application. Make sure that any users registering, should you allow that, register with FusionAuth and not the legacy application.

Compare the numbers of users in FusionAuth to the number of users in your legacy data store by navigating to "Users" and searching for users registered for your application (if you are using the Elasticsearch search engine). Comparing this with the active user count in the legacy datastore will give the progress of the migration. 

After it has run for a while and has migrated the majority of your users, you can make a decision about what to do with the other users. If you've run the phased migration for six months or a year, it may be that the users who haven't signed in have abandoned your application. 

You can choose to not migrate these users, perhaps archiving or deleting them. Or you can choose to migrate this set of users using the big bang method. This will of course be far lower risk because there are far fewer users to migrate.

## Remove the Connector and the Authentication URL

The final step is to remove the Connector and other migration code. You can delete the policy and then the Connector. Any user who has been migrated will authenticate against FusionAuth. Any user who has not will see an error message as their account won't be found.

You can also remove the `fusionauthconnector.php` file from your application, as it won't be needed in the future.

## Conclusion

There are many ways to migrate your user data. For some a big bang approach with a single cutover date makes sense. For others, a phased migration, where users are migrated whenever they authenticate, will make for a smoother experience. 
