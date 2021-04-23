---
layout: blog-post
title: Announcing FusionAuth 1.26
description: The FusionAuth 1.26 Release includes more debugging and SAMLv2 logout.
author: Dan Moore
image: blogs/release-1-26/product-update-fusionauth-1-26.png
category: blog
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.26 of FusionAuth. This shipped on April 20, 2021. This version resolves issues for FusionAuth community members and customers on versions 1.25 and older.

<!--more-->

This release contained a number of enhancements and bug fixes. Please see the [release notes](/docs/v1/tech/release-notes/#version-1-26-0) for the full breakdown of the changes between 1.25 and 1.26. I wanted to highlight a few of the biggest changes.

## Advanced MFA

This is a premium feature requiring a paid license. It broadens support for MFA in FusionAuth, including adding the following:

* customizable SMS templates, including localization
* email is now available as an authentication a factor
* customizable SMS delivery mechanisms
* control of available MFA options at the tenant level
* multiple authentication methods can be associated with an account
* recovery codes
* self service MFA management

It's important to note that we think every application user should have access to MFA in some form. Therefore, TOTP based multi-factor authentication is still available in the community edition. 

Here's a customize SMS template:

{% include _image.liquid src="/assets/img/blogs/release-1-26/custom-sms-template.png" alt="A customized SMS MFA template." class="img-fluid" figure=false %}

Here's the tenant edit screen, where I am setting the available MFA methods:

{% include _image.liquid src="/assets/img/blogs/release-1-26/setting-mfa-options.png" alt="Configuring allowed MFA methods." class="img-fluid" figure=false %}

These changes unforunately are **not backwards compatible**, so if you have built on top of the previous two-factor API, please [review the changes carefully](/docs/v1/tech/apis/two-factor/).

## Entity Management

When talking to customers, users and potential clients, we often heard that they were modelling entities in addition to users and wanted to use FusionAuth for this purpose. So, we built it; it is a premium feature requiring a paid license. Entity Management is in technology preview in this release, so we're looking for feedback on how to improve it.

You can create types of entities, such as "API" or "Company". You can create permissions on these types, such as "invoke" or "manage". Then you can create individual instantiations of each of these types, such as "Email API" or "Bachmanity". You can then create relationships between entities, which grants an entity permission on another entity.

For example, suppose I have a reminder API which needs permission to call a todo API to query upcoming tasks. With entity management, I can:

* Create an "API" entity type with the following permissions: `execute` and `configure`.
* Create an "reminder API" entity
* Set up a "todo API" entity
* Grant the reminder API `query` permissions on the todo API
* When the reminder API is ready to gather reminders, it can "sign in" using the Client Credentials grant. 
* FusionAuth will, if the reminder API has the appropriate permission on the todo API, create a JWT.
* The reminder API can present the JWT, perhaps as a bearer token, to the todo API.
* The todo API can process the request and return the data.

{% include _image.liquid src="/assets/img/blogs/release-1-26/list-of-entities.png" alt="A list of APIs created using Entity Management." class="img-fluid" figure=false %}

All of this set up and execution can be done via API, making this a great way to model machine to machine communication in a dynamic service oriented application, an internet of things system, or elsewhere.

You don't have to use the grant mechanism either. If you want to model relationships in FusionAuth for other reasons, you can store JSON arbitrary data in the `entity.data` field.

## An API to manage API keys

In true Inception style, there is now an API to manage FusionAuth API keys. This was a community request from 2020 and has now been implemented. You can create, copy, update, and delete API keys. These keys will allow you to make any API call. You can lock them down in a number of ways:

* By tenant
* By endpoint
* By permission on an endpoint

This opens up all kinds of interesting automation capabilities, as you can generate API keys with very specific permissions, distribute and use them as needed, and then destroy them.

## Other enhancements

Some of the other enhancements included in this release are:

* Support for FusionAuth to act as an SP for IdP initiated SSO (this is a premium feature).
* An extension to the user registration forms to allow for a user self service profile page (this is a premium feature).
* A Prometheus endpoint for monitoring.
* Licensing now supports air-gapped deployments.
* The login success and failure webhook events now include the IP address.

Also, there's a new themeable index page so that when your users go to auth.example.com, they are not forwarded to the FusionAuth admin login page. To proceed to the login page when using the default theme, click the lock in the upper right.

{% include _image.liquid src="/assets/img/blogs/release-1-26/themable-index-page.png" alt="The themable root page. No more users ending up on the login page." class="img-fluid" figure=false %}

Like I said, this was a big release!

## Bugs squashed

There were a couple of bugs fixed, including:

* A user registration for an inactive application previously couldn't be deleted; now it can be.
* There was spurious text output on the FusionAuth admin UI screen in certain cases. This is now gone.

## Upgrade at will

We're in the process of documenting all of this good stuff, but the [release notes](/docs/v1/tech/release-notes/#version-1-26-0) serve as a good guide of the changes, fixes, and new features.

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/installation-guide/upgrade/). 

If you have a FusionAuth Cloud deployment, proceed to the "Deployments" tab on your [account dashboard](https://account.fusionauth.io/account/deployment/){:target="_blank"} and upgrade your servers. If you have any questions about the upgrade, [please open a support ticket](https://account.fusionauth.io/account/support/){:target="_blank"}.

Or, if we've piqued your interest and you'd like to use FusionAuth, [check out your options](/pricing/).
