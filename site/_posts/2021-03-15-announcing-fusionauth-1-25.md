---
layout: blog-post
title: Announcing FusionAuth 1.25
description: The FusionAuth 1.25 Release includes more debugging and SAMLv2 logout.
author: Dan Moore
image: blogs/release-1-25/product-update-fusionauth-1-25.png
category: blog
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.25 of FusionAuth. This release shipped on Mar 11, 2021. This version resolves issues for FusionAuth community members and customers on versions 1.24 and older.

<!--more-->

This release contained a number of enhancements and bug fixes. Please see the [release notes](/docs/v1/tech/release-notes/#version-1-25-0) for the full breakdown of the changes between 1.24 and 1.25. 

While there were numerous enhancements, one has me especially excited.

## Additional debug options

By its nature, FusionAuth integrates with other systems, whether that be sending email, an application or library using the Authorization Code grant, or CORS for web based single sign on.

In this release, the team has added new debugging capabilities. When you have an issue around the functionality, look for a "Debug enabled" field and check it. Save the configuration, then run through the integration workflow one more time. Check the event log, by navigating to "System" and then "Event Log". The additional debugging information will be there.

{% include _image.liquid src="/assets/img/blogs/release-1-25/debug-enabled.png" alt="Enabling additional debugging for an OAuth grant." class="img-fluid" figure=false %}

This additional debugging capability is exciting to me for two reasons:

* First, oftentimes additional logging is enough to allow a FusionAuth user, who is typically very technical, to solve integration issues. As a developer, I love when I can solve an issue without involving anyone else.
* Second, if the debug statements don't lead a FusionAuth user to a solution, sharing the details with the community and the FusionAuth team helps resolve the issue more quickly.

## Other enhancements

Some of the other enhancements included in this release are:

* Full support for the SAMLv2 Logout spec. This also introduces a new page you can theme.
* You can now delete all user sessions in one go in the FusionAuth administrative user interface. Use the power wisely.
* The Twitter Identity Provider can now accept an access token. Useful if you are not using the hosted login pages, but instead are building your own login pages and providing a 'Login With Twitter' button.
* If a public key is present, generate the `kid` using the process documented in [RFC 7638](https://tools.ietf.org/html/rfc7638) rather than a random string.

## Bugs squashed

There were multiple bugs fixed, including:

* A regression introduced in 1.24 which caused issues when using Elasticsearch 6.
* Handling null pointer exceptions when certain login reports were generated.
* Patching the `Application` object caused erroneous validation errors.

Overall there were 14 issues resolved in this release.

## Upgrade at will

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/installation-guide/upgrade/). 

If you have a FusionAuth Cloud deployment, proceed to the "Deployments" tab on your [account dashboard](https://account.fusionauth.io/account/deployment/){:target="_blank"} and upgrade your servers. If you have questions about the upgrade, [please open a support ticket](https://account.fusionauth.io/account/support/){:target="_blank"}.

Or, if we've piqued your interest and you'd like to use FusionAuth, [check out your options](/pricing/).
