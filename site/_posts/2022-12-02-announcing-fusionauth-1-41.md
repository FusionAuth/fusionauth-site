---
layout: blog-post
title: Announcing FusionAuth 1.41
description: These releases include biometric authentication support, improvements to Steam login, and IdP provisioning for the FusionAuth admin UI.
author: Dan Moore
image: blogs/release-1-41/fusionauth-1-41.png
category: announcement
tags: topic-webauthn webauthn release-announcement
excerpt_separator: "<!--more-->"
---

FusionAuth version 1.41 shipped in November, 2022. These releases include WebAuthn support, improvements to Steam login, and IdP provisioning for the FusionAuth administrative user interface.

<!--more-->

There are a number of new features, enhancements, and bug fixes. As always, please see the [release notes](/docs/v1/tech/release-notes#version-1-41-3) for a full breakdown of the changes between 1.40 and 1.41, including any schema changes.

There were 19 issues, enhancements, and bug fixes included in the 1.41 releases. Read more about all the changes in the [release notes](/docs/v1/tech/release-notes#version-1-41-3).

The changes include WebAuthn support, improvements to Steam login, and IdP provisioning for the FusionAuth admin UI.

## Biometric authentication support

This was a big one. WebAuthn, also known as passkeys, allow a user to login securely using biometric and other means. FusionAuth supports this for re-authentication and bootstrap authentication. As usual, FusionAuth supports this via the hosted login pages, where all the complexity is taken care of for you, and via APIs.

To enable WebAuthn, upgrade to 1.41 or greater, ensure you have the correct license and enable the workflows you desire on the tenant.

{% include _image.liquid src="/assets/img/blogs/release-1-41/enable-webauthn.png" alt="The WebAuthn tenant settings." class="img-fluid" figure=true %}

There's a lot more detail in [the WebAuthn documentation](/fusionauth.io/docs/v1/tech/passwordless/webauthn-passkeys).

This functionality is limited to Essentials and Enterprise users; learn more by visiting [the pricing page](/pricing) or [contacting our sales team](/contact).

## Provisioning for the FusionAuth admin UI

Previous to this release, all users had to be added to the FusionAuth UI application via API or admin action. In particular, if a user was logging in using an identity provider, such as a SAML or OIDC connection, they could not be automatically registered for the FusionAuth admin UI. They could, however, be registered for any other application.

However, some FusionAuth users want to control all user access via federation, and want that external identity provider to be the source of truth, even for the FusionAuth admin UI.

As of this release, you can now choose to enable "Create registration" for the FusionAuth admin application for any given Identity Provider. 

{% include _image.liquid src="/assets/img/blogs/release-1-41/enable-registration-fusionauth.png" alt="Using an IdP to allow for registration of the FusionAuth application." class="img-fluid" figure=true %}

## Steam login

FusionAuth supports [Login with Steam](/docs/v1/tech/identity-providers/steam) which is a great way to let your game users log in. Previous to this release you could only link accounts with an access token. But sometimes, all you have is a user session ticket.

This release allows you to use the session ticket to complete a link. You can read more about this in [the API docs](/docs/v1/tech/apis/identity-providers/steam); search for `sessionTicket`.

Login with Steam is limited to Essentials and Enterprise users; learn more by visiting [the pricing page](/pricing) or [contacting our sales team](/contact).

## The rest of it

As mentioned above, there were 19 issues, enhancements, and bug fixes included in this release. A selection not mentioned above includes:

* Users that are authenticated using an [LDAP or Generic connector](/docs/v1/tech/connectors/) will no longer have their refresh tokens automatically invalidated.
* FireFox users will no longer see a zero byte file downloaded after logging out.
* `userType` and `title` SCIM fields are now deserialized correctly.
* You can use the `RelayState` parameter to pass a redirect URL when using the IdP initiated SAML provider.

Read more about all the changes in the [release notes](/docs/v1/tech/release-notes#version-1-41-3).

## Upgrade at will

The [release notes](/docs/v1/tech/release-notes#version-1-41-3) are a guide to the changes, fixes, and new features. Please read them carefully to see if any features you use have been modified or enhanced.

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/admin-guide/upgrade). 

If you have a FusionAuth Cloud deployment, proceed to the "Deployments" tab on your [account dashboard](https://account.fusionauth.io/account/deployment/){:target="_blank"} and upgrade your instances. If you have any questions about the upgrade, [please open a support ticket](https://account.fusionauth.io/account/support/){:target="_blank"}.

Or, if we've piqued your interest and you'd like to use FusionAuth, [check out your options](/pricing).
