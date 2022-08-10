---
layout: blog-post
title: Announcing FusionAuth 1.37
description: This release includes bug fixes, the ability to configure multi-factor authentication (MFA) requirements on an application by application basis, and webhooks enhancements.
author: Dan Moore
image: blogs/release-1-37/product-update-fusionauth-1-37.png
category: blog
tags: topic-security topic-webhook
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.37 of FusionAuth. It shipped in August, 2022. The 1.37 releases include bug fixes, the ability to configure multi-factor authentication (MFA) requirements on an application by application basis, and webhooks enhancements.

<!--more-->

These releases contained features, enhancements, and bug fixes. Please see the [release notes](/docs/v1/tech/release-notes#version-1-37-0) for a full breakdown of the changes between 1.36 and 1.37. 

There are a few changes that are worth highlighting. But wow, there's a lot of stuff in this release. Please, check out the [release notes](/docs/v1/tech/release-notes#version-1-37-0).

## Configure MFA requirements for an application

Previous to this release, you could enable MFA on a tenant by tenant basis. Then, if a user had MFA enabled, they were required to complete the MFA process for every application they logged into.

Our customers raised an interesting business case. They were using FusionAuth for more than one kind of application. 

Some were consumer facing applications with low risk and a desire to ensure onboarding was as easy as possible, such as a gaming application.

Others were higher risk, either internal applications where compliance dictated MFA and other security measures or customer facing higher risk applications where money transfers or other high value interactions were involved.

If you enable MFA for all users, the first application's growth suffers. If you disable it, then the second type of application is in violation of rules or is exposed to issues.

The solution: to allow MFA to be enabled on an application by application basis.

To do so, log in to the FusionAuth administrative user interface, navigate to the "Applications" tab and edit your application. Then go to the "Multi-Factor" tab and chose your preferred option from the "On login policy" dropdown.

{% include _image.liquid src="/assets/img/blogs/release-1-37/multi-factor-app-config.png" alt="The application specific MFA settings." class="img-fluid" figure=true %} 

You have four choices:

* Disable the application specific MFA configuration. In this case, the application will have the same behavior as in previous versions of FusionAuth.
* Enable the application specific MFA configuration and set the "Trust policy" to "Any". Doing this will mean that if the user has completed an MFA challenge for any FusionAuth managed application, they will not be challenged again for this application until the duration configured for "Two-Factor trust" has expired.
* Enable the application specific MFA configuration and set the "Trust policy" to "This application". Doing this will mean that if the user has completed an MFA challenge for this application, they will not be challenged until the duration configured for "Two-Factor trust" has expired.
* Enable the application specific MFA configuration and set the "Trust policy" to "None". Doing this will mean that the user must complete an MFA challenge for every login.

This functionality requires a valid FusionAuth license.

## Webhooks, applications and tenants

Previous to this release, a few webhooks could be associated with an application. This was not recommended and caused a lot of confusion for our users. In this release, all webhooks will be associated with a tenant, and you won't be able to configure application specific webhooks. You will be able to associate a webhook with zero or more tenants, however.

{% include _image.liquid src="/assets/img/blogs/release-1-37/webhook-tenant-limit.png" alt="Configuring webhooks to fire only for certain tenants.." class="img-fluid" figure=true %} 

If you currently have a webhook associated with an application, it wil be transparently migrated. Each webhook will be associated with the tenant containing the application. The code receiving the webhook should be modified to handle events from other applications in the same tenant.

If you are only interested in events for a certain application, filter in the webhook receiving code. For example, if you are only interested in the "User Registration Create" event for an internal admin application, fire this event for the tenant and then filter and discard events sent by any other application.

You can review your existing webhook configuration by using the administrative user interface or by running this script.

```shell
INSTANCE_HOSTNAME=... # your instance's hostname
API_KEY=... # an API key with at least `GET` permission on the /api/webhook endpoint

curl -H "Authorization: $API_KEY" https://$INSTANCE_HOSTNAME/api/webhook|jq '.webhooks|.[]|.id,.global,.applicationIds '
```

This will show any webhooks configured for a specific application. If `global` is false, the application Ids for which this webhoook is configured will be printed as well.

## Can verify an email without sending an email

Email address verification is critical for CIAM systems to ensure accounts are created by legitimate users and that self service actions such as password resets can be delivered. FusionAuth supports this functionality. There are a number of interactions that will verify a user's email address, but they all involve sending emails to the email address associated with an account.

However, there are times when you want to verify an email address without sending an email. This may be because you've already verified the email address through another system, because you provisioned the email address yourself, or because the email address is trusted.

You can now use an API call to directly mark a user's email as verified.

```shell
INSTANCE_HOSTNAME=... # your instance's hostname
API_KEY=... # an API key with at least `POST` permission on the /api/user/verify-email endpoint

curl -XPOST -H 'Content-type: application/json' -H "Authorization: $API_KEY" https://$INSTANCE_HOSTNAME/api/user/verify-email -d \
'{ "userId": "429797ba-37d7-4bbe-8748-58fb812448ff" }'
```

## Moving to Netty

Another change in this release that opens up some exciting new possibilities is the move from Tomcat to Netty for the infrastructure underlying FusionAuth.

Tomcat has been very good to us over the years, and the previous releases relied on it. But Tomcat has some architectural assumptions and moving to a more customizable foundational layer like Netty allows better cookie handling and more options around configuration reloading.

While this is a lower level change that is functionally equivavlent and shouldn't have any impacts on you and your users, it will open up a lot of possibilities for FusionAuth in future versions.

## The rest of it

There were 21 issues, enhancements, and bug fixes included in this release. A selection of these not mentioned above includes:

* SMTP debugging is now available in the Event Log rather than the System Log.
* Client library fixes.
* You can now use `let`/`optional` chaining when using the GraalJS lambda engine.
* Email template size restrictions were increased from 64K to 16MB, allowing for uses such as inline images in emails.
* FusionAuth now supports `id_token_hint` on logout.

Read more about all the changes in the [release notes](/docs/v1/tech/release-notes#version-1-37-0).

## Upgrade at will

The [release notes](/docs/v1/tech/release-notes#version-1-37-0) are a guide to the changes, fixes, and new features. Please read them carefully to see if any features you use have been modified or enhanced.

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/admin-guide/upgrade). 

If you have a FusionAuth Cloud deployment, proceed to the "Deployments" tab on your [account dashboard](https://account.fusionauth.io/account/deployment/){:target="_blank"} and upgrade your instances. If you have any questions about the upgrade, [please open a support ticket](https://account.fusionauth.io/account/support/){:target="_blank"}.

Or, if we've piqued your interest and you'd like to use FusionAuth, [check out your options](/pricing).
