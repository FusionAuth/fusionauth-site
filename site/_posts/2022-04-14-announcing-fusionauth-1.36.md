---
layout: blog-post
title: Announcing FusionAuth 1.36
description: This release includes bug fixes, enhancements, and SCIM2 support.
author: Joyce Park 
image: blogs/release-1-36/product-update-fusionauth-1-36.png
category: blog
tags: topic-troubleshooting scim scim2
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of versions 1.36 of FusionAuth. This version shipped April 14, 2022. The 1.36 releases include bug fixes, internal updates, and SCIM support.

<!--more-->

These releases contained features, enhancements, and bug fixes. Please see the [release notes](/docs/v1/tech/release-notes#version-1-36-1) for a full breakdown of the changes between 1.35 and 1.36. 

There are a few improvements that I wanted to call out specifically.

## SCIM 2 support

[SCIM 2](http://www.simplecloud.info) (System for Cross-domain Identity Management), a standardized API for identity management sponsored by the IETF, allows user records to be read, written, and shared via HTTP using a simple JSON schema. In a [long-awaited feature](https://github.com/FusionAuth/fusionauth-issues/issues/106), FusionAuth now supports SCIM formats and operations as well as our own API. Learn more about SCIM support in our [SCIM API documentation](https://fusionauth.io/docs/v1/tech/apis/scim).

This feature is particularly helpful in cases where you want to use a third-party SCIM-compliant backend to provision users and keep user data in sync. SCIM helps you manage users across systems like GitHub, Salesforce, and Trello, among others.

SCIM data formats vary wildly so a new lambda is available. This lambda will take care of mapping from the SCIM provided user data into the FusionAuth user data schema, allowing for integration flexibility.

This functionality is only available for our Enterprise users; learn more by visiting [the pricing page](/pricing) or [contacting our sales team](/contact).

## Nintendo Online Identity Provider

Nintendo Online (forthcoming) has been added as an identity provider, allowing users to log in using their Nintendo Online accounts.

{% include _image.liquid src="/assets/img/blogs/release-1-36/nintendo-login.png" alt="Nintendo added as Idp." class="img-fluid" figure=true %}

This feature is available to our Enterprise and Essentials license holders as part of the “Advanced and gaming Idp” suite. Learn more about these editions by visiting [the pricing page](/pricing) or [contacting our sales team](/contact).
 
## Webhook for user Link and Unlink

A new webhook event is available for developers to trigger an action when a user links or unlinks to an identity provider. This will allow developers to write a subsystem that immediately notices any new Idp accounts their users associate with their FusionAuth account (e.g. Xbox, nintendo, play station) and when these accounts are deleted. Another system listens for those events and handles them: for instance it records the data for analytics, or adjusts functionality which is only available if you have an account at a certain IdP, like a special in-game item is only available to Xbox users or Nintendo users. Documentation for this web hook will be available [here](/docs/v1/tech/apis/webhooks#overview) soon.
 
## The rest of it

There were 17 issues, enhancements, and bug fixes included in this release. A selection of these include:

* Custom password plugins that rely on dependencies in jarfiles are now more easily loaded. Required jars can now be  placed in the same directory as custom plugin, and will be loaded in a separate class loader.
* OAuth2 Password Grant correctly returns MFA method
* Support for higher volumes of logins when using a connector by making more conservative use of system resources
Read more about all the changes in the [release notes](/docs/v1/tech/release-notes#version-1-36-1).

## Upgrade at will

The [release notes](/docs/v1/tech/release-notes#version-1-36-1) are a guide to the changes, fixes, and new features. Please read them carefully to see if any features you use have been modified or enhanced.

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/admin-guide/upgrade). 

If you have a FusionAuth Cloud deployment, proceed to the "Deployments" tab on your [account dashboard](https://account.fusionauth.io/account/deployment/){:target="_blank"} and upgrade your instances. If you have any questions about the upgrade, [please open a support ticket](https://account.fusionauth.io/account/support/){:target="_blank"}.

Or, if we've piqued your interest and you'd like to use FusionAuth, [check out your options](/pricing).
