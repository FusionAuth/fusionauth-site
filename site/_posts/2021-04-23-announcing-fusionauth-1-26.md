---
layout: blog-post
title: Announcing FusionAuth 1.26
description: The FusionAuth 1.26 Release includes advanced MFA, an API to manage API keys, entity management preview release and more.
author: Dan Moore
image: blogs/release-1-26/product-update-fusionauth-1-26.png
category: blog
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.26 of FusionAuth. This shipped on April 20, 2021. This version resolves issues for FusionAuth community members and customers on versions 1.25 and older. This was a big release!

<!--more-->

This release contained a number of enhancements and bug fixes. Please see the [release notes](/docs/v1/tech/release-notes/#version-1-26-0) for a full breakdown of the changes between 1.25 and 1.26. I wanted to highlight a few of the biggest ones.

## Advanced multi-factor authentication (MFA)

This is a premium feature requiring a [paid license](/pricing/editions/). It increases support for MFA in FusionAuth, including adding the following features:

* Customizable SMS templates, including localization
* A new MFA factor: email 
* Support for multiple SMS delivery mechanisms
* Available MFA options can be specified at the tenant level
* A user can have multiple MFA methods
* One-time use recovery codes
* User self service MFA management

The FusionAuth team wants every user to be able to use multi-factor authentication to secure their accounts, whether developers buy a premium edition or not. Therefore, support for time based one-time password MFA solutions such as Google Authenticator and Authy continues to be included in the community edition. (Take that, hackers!)

{% include _callout-important.liquid content=
"Unfortunately, these changes are not backwards compatible with the previous Two Factor implementation, so if you have built on top of that, please [review the changes carefully](/docs/v1/tech/apis/two-factor/). There is also a [1.25 -> 1.26 MFA migration guide](/docs/v1/tech/guides/multi-factor-authentication/#migration-from-version-1-25-and-earlier)."
%}

Here's a customized SMS template:

{% include _image.liquid src="/assets/img/blogs/release-1-26/custom-sms-template.png" alt="A customized SMS MFA template." class="img-fluid" figure=false %}

Here's the tenant edit view, where I am configuring available MFA methods:

{% include _image.liquid src="/assets/img/blogs/release-1-26/setting-mfa-options.png" alt="Configuring allowed MFA methods." class="img-fluid" figure=false %}

## Entity Management

When talking to customers, users and potential clients, we heard that they were often modelling entities beyond users and wanted to use FusionAuth. 

So we built tooling to help you do just that with Entity Management. Entity Management is a premium feature requiring a paid license. It is currently in technology preview and may change. We would love for you to try it out and see if it helps you solve this class of problem. In other words, let us know what you think!

You can create distinct entity types representing classes of entities, such as "API" or "Company". You then can create permissions on these types, such as "invoke" or "manage". At that point, you create individual instantiations of these types, such as "Reminder API" or "Bachmanity". Finally, create "grant" relationships between entities, which allow you to model permissions between entities.

For example, suppose I have a reminder API which needs to call a todo API to query upcoming tasks. With Entity Management, I can:

* Create an "API" entity type with the following permissions: `query`, `execute`, and `configure`.
* Create an "reminder API" entity
* Set up a "todo API" entity
* Grant the "reminder API" `query` permissions on the todo API

When the reminder API is ready to gather upcoming tasks, it "signs in" with the Client Credentials grant. FusionAuth will, if the reminder API has the appropriate permission on the todo API, create a JWT. The reminder API can present the JWT, perhaps as a bearer token, to the todo API. The todo API can then process the request and return the needed data.

{% include _image.liquid src="/assets/img/blogs/release-1-26/list-of-entities.png" alt="A list of APIs created using Entity Management." class="img-fluid" figure=false %}

All of this set up and execution can be done via API, making Entity Management a great way to model machine to machine communication in a dynamic service oriented application, an internet of things system, or elsewhere. You don't have to use the grant mechanism either. If you want to model relationships in FusionAuth for any reason, store JSON arbitrary data in the `entity.data` field. Read more about [Entity Management here](/docs/v1/tech/core-concepts/entity-management/).

## An API to manage API keys

In true Inception style, there is now an API to manage FusionAuth API keys. This was a community request last year. You can create, copy, update, and delete API keys. When used, these keys are nearly indistinguishable from API keys created in the FusionAuth administrative user interface. To prevent unplanned privilege escalation, keys with the API key permission must be created in the admin UI; other than that, API generated keys can be used for any purpose.

These API keys can be restricted in a number of ways:

* By tenant
* By endpoint
* By permission on an endpoint

You can now automate every aspect of FusionAuth. For example, you can now generate API keys with very specific permissions, distribute them as needed, and then destroy them after use.

## Other enhancements

Some of the other enhancements included in this release are:

* Support for FusionAuth acting as an SP for IdP initiated SAMLv2 SSO (this is a premium feature).
* User profile self service, which lets users to update profile data, MFA options, and passwords on their own (this is a premium feature).
* A Prometheus endpoint for monitoring.
* Support for licensing in air-gapped deployments.
* The login success and failure webhook events now include the IP address.

Also, there's a new themeable FusionAuth index page so when your users accidentally arrive at `auth.example.com`, they are not forwarded to the FusionAuth admin UI login page. (To proceed to that login page when using the default theme, click the lock in the upper right.)

{% include _image.liquid src="/assets/img/blogs/release-1-26/themable-index-page.png" alt="The themable root page. No more users ending up on the login page." class="img-fluid" figure=false %}

Like I said, this was a big release!

## Bugs squashed

There were a couple of bugs fixed, including:

* A registration for an inactive application previously couldn't be deleted. Now it can.
* There was spurious text on the FusionAuth admin UI screen in certain scenarios. This is now gone.

## Upgrade at will

We're in the process of documenting all of this, but the [release notes](/docs/v1/tech/release-notes/#version-1-26-0) serve as a good guide of the changes, fixes, and new features.

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/installation-guide/upgrade/). 

If you have a FusionAuth Cloud deployment, proceed to the "Deployments" tab on your [account dashboard](https://account.fusionauth.io/account/deployment/){:target="_blank"} and upgrade your servers. If you have any questions about the upgrade, [please open a support ticket](https://account.fusionauth.io/account/support/){:target="_blank"}.

Or, if we've piqued your interest and you'd like to use FusionAuth, [check out your options](/pricing/).
