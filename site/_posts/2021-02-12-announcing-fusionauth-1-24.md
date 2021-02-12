---
layout: blog-post
title: Announcing FusionAuth 1.24
description: The FusionAuth 1.24 Release offers customer support roles as well as the LinkedIn identity provider
author: Dan Moore
image: blogs/release-1-24/product-update-fusionauth-1-24.png
category: blog
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.24 of FusionAuth. This release shipped on Feb 11, 2021. This version delivers resolves issues for FusionAuth community members and customers on versions 1.23 and older.

<!--more-->

This was primarily a bug fix release and small enhancement release. Please see the [release notes](/docs/v1/tech/release-notes/#version-1-24-0) for the full breakdown of the changes between 1.23 and 1.24. 

## Enhancements released

Some of the enhancements included in this release are:

* Support for certificates with key lengths of 1024 to support certain SAML integrations
* Adding entity counts to pages such as Tenants, Lambdas and Consents
* Improvements to the webhooks screen to make enabling and disabling webhooks easier
* Removing unneeded claims from the `id_token`

## Bugs squashed

There were seven bugs fixed, including:

* Kafka configuration parsing issues
* Imports of unsupported certificates (for example, with key lengths that were too short) failed silently
* A UX regression which prevented removing a user from a group using the administrative user interface

## Commence upgrading

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/installation-guide/upgrade/). 

If you have a FusionAuth Cloud deployment, open a [support request from your account dashboard](https://account.fusionauth.io/account/support/){:target="_blank"} and we'll get your servers upgraded! 

Or, if we've piqued your interest and you'd like to use FusionAuth, [check out your options](/pricing/).
