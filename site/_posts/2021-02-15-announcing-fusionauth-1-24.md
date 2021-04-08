---
layout: blog-post
title: Announcing FusionAuth 1.24
description: The FusionAuth 1.24 Release offers UX improvements and numerous bug fixes.
author: Dan Moore
image: blogs/release-1-24/product-update-fusionauth-1-24.png
category: blog
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.24 of FusionAuth. This release shipped on Feb 11, 2021. This version resolves issues for FusionAuth community members and customers on versions 1.23 and older.

<!--more-->

This was primarily a bug fix release and small enhancement release. Please see the [release notes](/docs/v1/tech/release-notes/#version-1-24-0) for the full breakdown of the changes between 1.23 and 1.24. 

## Enhancements released

Some of the enhancements included in this release are:

* More consistent use of the `Cache-Control` header for the FusionAuth administrative user interface
* Support for certificates with key lengths of 1024 to support certain SAML integrations
* Adding entity counts to pages such as Tenants, Lambdas and Consents
* A new [User Search API](/docs/v1/tech/apis/users/#search-for-users) parameter, `accurateTotal` which allows you to retrieve the exact user count
* Improvements to the webhooks screen to make enabling and disabling them en masse easier
* Removing unneeded claims from the `id_token`; neither the `applicationId` nor the `roles` claims will be present

## Bugs squashed

There were multiple bugs fixed, including:

* Kafka configuration parsing issues
* Imports of unsupported certificates (for example, with key lengths that were too short) failed silently
* A UX regression which prevented removing a user from a group using the administrative user interface
* A fix to the Identity Provider admin UI to allow correct editing if you have more than 2000 applications

## Commence upgrading

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/installation-guide/upgrade/). 

If you have a FusionAuth Cloud deployment, open a [support request from your account dashboard](https://account.fusionauth.io/account/support/){:target="_blank"} and we'll get your servers upgraded! 

Or, if we've piqued your interest and you'd like to use FusionAuth, [check out your options](/pricing/).
