---
layout: blog-post
title: Announcing FusionAuth 1.41
description: This release includes biometric authentication support, improvements to Steam login, and IdP provisioning for the FusionAuth admin UI.
author: Dan Moore
image: blogs/release-1-41/fusionauth-1-41.png
category: blog
tags: topic-webauthn
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of FusionAuth version 1.41. It shipped in mid November, 2022. This release includes WebAuthn support, improvements to Steam login, and IdP provisioning for the FusionAuth administrative user interface.

<!--more-->

There are a number of new features, enhancements, and bug fixes. As always, please see the [release notes](/docs/v1/tech/release-notes#version-1-41-2) for a full breakdown of the changes between 1.40 and 1.41, including any schema changes.

There were 18 issues, enhancements, and bug fixes included in the 1.41 releases. Read more about all the changes in the [release notes](/docs/v1/tech/release-notes#version-1-41-2).

This release includes WebAuthn support, improvements to Steam login, and IdP provisioning for the FusionAuth admin UI.

## Biometric authentication support

This was a big one. WebAuthn, also known as passkeys, allow a user to login securely using biometric and other means. FusionAuth supports this for re-authentication and bootstrap authentication. As usual, FusionAuth supports this via the hosted login pages, where all the complexity is taken care of for you, and via APIs.

To enable WebAuthn, upgrade to 1.41 or greater, ensure you have the correct license and enable the workflows you desire on the tenant.

{% include _image.liquid src="/assets/img/blogs/release-1-41/enable-webauthn.png" alt="The WebAuthn tenant settings." class="img-fluid" figure=true %}

This functionality is only available for our Essentials and Enterprise users; learn more by visiting [the pricing page](/pricing) or [contacting our sales team](/contact).

## Steam login



## Provisioning for the FusionAuth admin UI

## The rest of it

As mentioned above, there were 18 issues, enhancements, and bug fixes included in this release. A selection not mentioned above includes:

* Support for the `en_GB` time and date format in the administrative user interface.
* Group application roles are no longer incorrectly removed when a `PATCH` request to [`/api/group/{groupId}`](/docs/v1/tech/apis/groups#update-a-group) is made
* Improved error messages when an API request is made without the correct `Content-Type` header.

Read more about all the changes in the [release notes](/docs/v1/tech/release-notes#version-1-39-0).

## Upgrade at will

The [release notes](/docs/v1/tech/release-notes#version-1-41-2) are a guide to the changes, fixes, and new features. Please read them carefully to see if any features you use have been modified or enhanced.

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/admin-guide/upgrade). 

If you have a FusionAuth Cloud deployment, proceed to the "Deployments" tab on your [account dashboard](https://account.fusionauth.io/account/deployment/){:target="_blank"} and upgrade your instances. If you have any questions about the upgrade, [please open a support ticket](https://account.fusionauth.io/account/support/){:target="_blank"}.

Or, if we've piqued your interest and you'd like to use FusionAuth, [check out your options](/pricing).
