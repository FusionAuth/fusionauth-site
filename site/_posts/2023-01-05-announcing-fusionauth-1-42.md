---
layout: blog-post
title: Announcing FusionAuth 1.42
description: This release includes rehashing of passwords on password change, force MFA, and allow users to unlock their account by changing their password, and more.
author: Dan Moore
image: blogs/release-1-42/fusionauth-1-42.png
category: announcement
tags: release-announcement passwords mfa multi-factor-authentication tenants
excerpt_separator: "<!--more-->"
---

FusionAuth version 1.42 shipped on December 7, 2022. This release includes the ability to force MFA, rehashing of passwords on password change, and to allow users to unlock their account by changing their password, and more.

<!--more-->

There are a number of new features, enhancements, and bug fixes. As always, please see the [release notes](/docs/v1/tech/release-notes#version-1-42-0) for a full breakdown of the changes between 1.41 and 1.42, including any schema changes.

All in all there are 13 issues, enhancements, and bug fixes included in the 1.42 releases. Read more about all the changes in the [release notes](/docs/v1/tech/release-notes#version-1-42-0).

## Forcing MFA

This was a big one. Previously, MFA was only enforced when a user had a valid method. With this change, you can now prohibit someone from logging in to an application if they don't have an MFA method enabled. You can set this at either the tenant or the application level (the application level requires an Enterprise plan). The policy also allows configuring MFA to take place if the user has an additional factor set up, or to not require any MFA at all.

{% include _image.liquid src="/assets/img/blogs/release-1-42/enable-forced-mfa.png" alt="The MFA tenant settings with a policy of 'required'." class="img-fluid" figure=true %}

When the MFA policy is set to `required`, a user with an MFA method configured, whether the TOTP method accessible to instances running on the community plan, or any advanced MFA methods such email or SMS, will be prompted for that additional factor, based on the trust lifetime defined.

If a user does not have an MFA method configured, they will be sent to a themeable page where they will be prompted to add an additional factor. Until they do so, the login will not complete; they'll be repeatedly forced into the workflow to add a second factor.

When applied at the tenant level, this functionality applies to all applications in a tenant, so if you enable it on the default tenant, it will also apply to the FusionAuth administrative user interface.

## Rehashing password on password change

FusionAuth has password hashing plugins, which allow for easy migration of existing users. If you have their hashes and know the algorithm and factor used to hash them, you can transparently import your users. 

When this is done with an insecure algorithm, perhaps one that is older or home-grown, FusionAuth has the ability to rehash the password on login using a more secure hashing algorithm.

Previous to this release, the rehashing happened only on login, but with this release, it will happen on a password change as well.

This is one of the subtleties of authentication that using an authentication server takes off the plate of your engineering team.

## Unlocking accounts by changing the password

With this release, as an admin, you now have the ability to allow users who have been actioned and [thus prevented from logging in](/docs/v1/tech/tutorials/gating/setting-up-user-account-lockout) to cancel the action whenever their password is reset.

If a user attempts to log in, triggers an action due to the number of failed attempts, and then resets their password, prior to this release the action would still be in force and they'd be denied access. Now, on a tenant by tenant basis, you can cancel the action when a successful password reset occurs.

{% include _image.liquid src="/assets/img/blogs/release-1-42/account-lock-tenant-settings.png" alt="The tenant settings to allow users to cancel an lockout action by resetting their password." class="img-fluid" figure=true %}

This helps lessen the load on your admins because they don't have to manually remove the user action; it is now in the user's control.

## The rest of it

As mentioned above, there were 13 issues, enhancements, and bug fixes included in this release. A selection not mentioned above includes:

* Refresh tokens can be revoked when MFA is enabled.
* Minor WebAuthn related fixes.
* Fixes an issue when searching on both `entityId` and `userId`.

Read more about all the changes in the [release notes](/docs/v1/tech/release-notes#version-1-42-0).

## Upgrade at will

The [release notes](/docs/v1/tech/release-notes#version-1-42-0) are a guide to the changes, fixes, and new features. Please read them carefully to see if any features you use have been modified or enhanced.

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/admin-guide/upgrade). 

If you have a FusionAuth Cloud deployment, proceed to the "Deployments" tab on your [account dashboard](https://account.fusionauth.io/account/deployment/){:target="_blank"} and upgrade your instances. If you have any questions about the upgrade, [please open a support ticket](https://account.fusionauth.io/account/support/){:target="_blank"}.

Or, if we've piqued your interest and you'd like to use FusionAuth, [check out your options](/pricing).
