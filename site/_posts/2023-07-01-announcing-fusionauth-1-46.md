---
layout: blog-post
title: Announcing FusionAuth 1.46
description: This release improves the OIDC discovery endpoint when you have multiple tenants, enhances the Device grant, and includes a number of security fixes.
author: Dan Moore
image: blogs/release-1-46/fusionauth-1-46.png
category: announcement
tags: release-announcement security device-grant oidc
excerpt_separator: "<!--more-->"
---

FusionAuth version 1.46 shipped on June 19, 2023. This release improves the OIDC discovery endpoint when you have multiple tenants, enhances the Device grant, and includes a number of security fixes. And more!

<!--more-->

All in all there are 26 issues, enhancements, and bug fixes included in the 1.46 release. As always, please see the [release notes](/docs/v1/tech/release-notes#version-1-46-0) for a full breakdown of the changes between 1.45 and 1.46.

## Security fixes

At FusionAuth, we take security very seriously. This release has a number of fixes, including a fix for CAPTCHA bypass, a potential directory traversal attack, and additional defensive validation on our self-service profile edit form.

We regularly obtain professional penetration testing and offer a bug bounty. [Learn more about FusionAuth's security programs](https://fusionauth.io/security).

If you'd like to be on the security announcement list, please sign up for a [free FusionAuth account](https://account.fusionauth.io) and give yourself the security officer role. 

## Improvements to the OAuth2 Device grant

The Device grant allows you to authorize a device like a TV or a gaming console while entering credentials on a different device, such as a computer or phone. [Learn more about the OAuth Device grant](/articles/oauth/oauth-device-authorization).

While FusionAuth has supported the Device grant since version 1.11.0, released on October 29th, 2019, this release updates and improves the functionality. In particular, you can bail out of our OAuth login flow when you are linking an external account (such as with Nintendo or XBox) and completing a Device grant later.

There are a few new workflows supported. First, FusionAuth now supports completing the grant via API after the user code is displayed.

The steps here are:

* Start a Device grant with an Identity Provider link.
* Enter the `user_code` on a FusionAuth page and bail sometime before providing credentials and completing a login. This means no auth code is generated.
* Complete the Device grant with a new API which will complete the Identity Provider link associated with a `user_code`.

FusionAuth also supports completing the grant when collecting the code outside of the FusionAuth hosted login pages.

* Start a Device grant with an Identity Provider link.
* Collect the code on an externally hosted page, not using a themed FusionAuth page.
* Validate the `user_code` using a new API `/oauth2/device/approve` to validate and get information about the `user_code`.
* Begin an Authorization Code grant with the collected user_code.
* Complete Authorization Code grant. In this case, the link is completed.

Adding support lets you create your own custom login flows using the Device grant. If you want to learn more about these new endpoints, please check out the [Device grant documentation](/docs/v1/tech/oauth/endpoints#device).

## Tenants and the OIDC discovery endpoint 

Oftentimes you can provide an OpenID Connect discovery endpoint to other software, such as [oauth2-proxy](https://github.com/oauth2-proxy/oauth2-proxy/). This endpoint, [defined by the OpenID Connect specification](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig), includes information about the OIDC server, including endpoints, supported claims, and supported signing algorithms.

Until this release, when there was a single FusionAuth tenant, the endpoint path was `/.well-known/openid-configuration`. The full URL would be something like `https://local.fusionauth.io/.well-known/openid-configuration`.

Once you had two or more tenants, the path was appended with the tenant Id, so the path would look something like: `/.well-known/openid-configuration/bafb4319-b7ca-ed27-fa2f-bbdba9d8ec06`.

The tenant Id at the end of the path caused compatibility issues for some software. While you could work around this by not using discovery and instead manually entering the required metadata, automatic configurability is superior in the long-term.

With this release, the tenant Id can now be a prefix for the discovery endpoint, rather than a suffix as above. So the previous example OIDC discovery path would be `/bafb4319-b7ca-ed27-fa2f-bbdba9d8ec06/.well-known/openid-configuration`. Both locations for the tenant Id will continue to work, but you should prefer this one.

## The rest of it

As mentioned above, there were 26 issues, enhancements, and bug fixes included in this release. A selection of the included changes not covered above includes:

* Using the administrative user interface to update an Identity Provider with more than 6000 applications now works. Previously it could cause a database error.
* Tokens obtained using the Client Credentials grant can now be used with the OAuth2 Introspect endpoint.
* In order to make it easier to monitor, you can configure FusionAuth to allow unauthenticated access to `/api/status` and `/api/prometheus/metrics` APIs from localhost. This will allow you to access these metrics via on-machine agents and roll them up to a tool such as Grafana.

Read more about all the changes in the [release notes](/docs/v1/tech/release-notes#version-1-46-0).

## Upgrade at will

The [release notes](/docs/v1/tech/release-notes#version-1-46-0) are a guide to the changes, fixes, and new features. Please read them carefully to see if any features you use have been modified or enhanced.

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/admin-guide/upgrade). 

If you have a FusionAuth Cloud deployment, proceed to the "Hosting" tab on your [account dashboard](https://account.fusionauth.io/account/deployment/){:target="_blank"} and upgrade your instances. If you have any questions about the upgrade, [please open a support ticket](https://account.fusionauth.io/account/support/){:target="_blank"}.

Or, if we've piqued your interest and you'd like to use FusionAuth, [check out your options](/pricing).
