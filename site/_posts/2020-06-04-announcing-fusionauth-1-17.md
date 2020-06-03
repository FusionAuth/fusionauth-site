---
layout: blog-post
title: Announcing FusionAuth 1.17
description: The FusionAuth 1.17 Release offers Sign in with Apple, more flexibilty with identity provider user reconciliation and more.
author: Dan Moore
image: blogs/news/blog-fusionauth-1-17.png
category: blog
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.17. The 1.17 release shipped on Jun 2, 2020. This version delivers new features as well as resolving issues for users on version 1.16 and older.

<!--more-->

## Highlights

FusionAuth has support for [Sign in with Apple](/docs/v1/tech/identity-providers/apple) as an identity provider. You can now let your users authenticate with their Apple account.

Refresh tokens saw some improvements. You can now issue one time use refresh tokens as well as expire them based on when they were last used. This expiration policy means that if you are using refresh tokens to maintain a user session, the session can be maintained as long as the user remains active.

All [identity providers](/docs/v1/tech/identity-providers/) now have [lambdas](/docs/v1/tech/lambdas/) for user data reconciliation. This allows developers complete control over how these configurations work and what information is set or written to the user object during login. The business logic has not changed, but it has been extracted from an internal FusionAuth service to a Lambda that can be modified by administrators. If you have an OIDC or SAMLv2 setup with an existing lambda, you will need to merge your logic with the extracted logic.

And of course there are 8 other bugs squashed and GitHub issues resolved as well. 

Please see the [release notes](/docs/v1/tech/release-notes#version-1-17-0) for the full breakdown of the changes between 1.16 and 1.17.

If you'd like to upgrade your FusionAuth instance, see our [upgrade guide](/docs/v1/tech/installation-guide/upgrade). If you have a licensed edition, open a [support request from your account dashboard](https://account.fusionauth.io){:target="_blank"} and we'll take care of you. Or, if you'd like to download and use FusionAuth, [check out your options](/pricing).
