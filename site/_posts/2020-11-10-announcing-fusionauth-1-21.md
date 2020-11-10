---
layout: blog-post
title: Announcing FusionAuth 1.21
description: The FusionAuth 1.21 Release offers SAML improvements and PKCE support for OIDC
author: Dan Moore
image: blogs/release-1-21/product-update-fusionauth-1-21.png
category: blog
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.21. The 1.21 release shipped on Nov 10, 2020. This version delivers new features as well as resolving issues for users on version 1.20 and older.

<!--more-->

## Highlights

In addition to bug fixes and user interface improvements, there are a couple of new features and improvements I wanted to call out.

### SAML improvements

SAML is a workhorse identity provider technology, dating back to 2005. There are many different applications which use SAML for identity and single sign on purposes, including Google and Zendesk.

With this release, FusionAuth added flexibility around the SAML functionality. In particular, location of the XML signature is more flexible now. Both the `Assertion` and `Response` elements can be the signature parent.

### Consents deserve data too

Many different objects in FusionAuth can have arbitrary key value data associated with them: registrations, users, applications and tenants, among others.

Now consents can too. Consents are a data structure in FusionAuth which is used to record what your users have, well, consented to. You can create as many of these as you want and they are available to your applications via the [Consents API](/docs/v1/tech/apis/consent/). 

With this release, you can associate extra data with your consents to meet the needs of your business logic.

### OIDC + PKCE

PKCE is what is currently recommended by the [OAuth Security Best Current Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-09) for any interaction with the Authorization Code Grant.

While FusionAuth has supported PKCE for over a year, this release lets you use PKCE with OIDC. This means that FusionAuth is compatible with identity providers that may require PKCE. Please consult your OIDC provider's documentation to determine if this is the case.

## Bugs squashed

In addition to these features, there were other bugs squashed and GitHub issues resolved as well. These included allowing email templates to have access to the `application` object for easier email customization and a few other bug fixes. Please see the [release notes](/docs/v1/tech/release-notes/) for the full breakdown of the changes between 1.20 and 1.21. 

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/installation-guide/upgrade/). If you have a FusionAuth Cloud deployment, open a [support request from your account dashboard](https://account.fusionauth.io){:target="_blank"} or [use our contact form](/contact){:target="_blank"} and we'll get your servers upgraded! Or, if you'd like to download and use FusionAuth, [check out your options](/pricing/).
