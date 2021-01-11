---
layout: blog-post
title: Announcing FusionAuth 1.23
description: The FusionAuth 1.23 Release offers customer support roles as well as the LinkedIn identity provider
author: Dan Moore
image: blogs/release-1-23/product-update-fusionauth-1-23.png
category: blog
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.23 of FusionAuth. This release shipped on Jan 11, 2021. This version delivers new features as well as resolving issues for users on version 1.22 and older.

<!--more-->

## Highlights

In addition to some bug fixes, there are a couple of new features worth noting.

### Customer support roles

FusionAuth has a [number of roles](/docs/v1/tech/core-concepts/roles/#fusionauth-application-roles) for managing users who are using the FusionAuth administrative user interface. In 1.23.0, there are two new ones. The first is `user_support_viewer`, which is a strictly read-only role. This role is perfect for new employees learning the FusionAuth admin UI. They can view user information, but can't make any changes. The second is 

Here's the view of Jian which Nelson has. Nelson has the `user_support_manager` role. You can see that the menu options available to Nelson are limited, and he can't perform any dangerous actions such as changing Jian's email address.

{% include _image.liquid src="/assets/img/blogs/release-1-23/user-edit-with-user-support-manager-role.png" alt="The user view in the admin UI when the logged in user has the user_support_manager role." class="img-fluid" figure=false %}

### Sign in with LinkedIn

This release includes a new identity provider, LinkedIn. Used by employers and employees around the world, LinkedIn is a social network for professionals. With this release, you can configure your application to offer your users the ability to register or log in with LinkedIn. 

{% include _image.liquid src="/assets/img/blogs/release-1-23/linkedin-login.png" alt="Login page with LinkedIn as an option." class="img-fluid" figure=false %}

## Bugs squashed

In addition to the above improvements, there were ten other bugs squashed and GitHub issues resolved. These included enhancements to the [.NET Core client library](https://fusionauth.io/docs/v1/tech/client-libraries/netcore/), SAML signature validation and the IP address displayed for FusionAuth clusters. Please see the [release notes](/docs/v1/tech/release-notes/#version-1-23-0) for the full breakdown of the changes between 1.22 and 1.23. 

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/installation-guide/upgrade/). 

If you have a FusionAuth Cloud deployment, open a [support request from your account dashboard](https://account.fusionauth.io/account/support/){:target="_blank"} and we'll get your servers upgraded! 

Or, if we've piqued your interest and you'd like to download and use FusionAuth, [check out your options](/pricing/).
