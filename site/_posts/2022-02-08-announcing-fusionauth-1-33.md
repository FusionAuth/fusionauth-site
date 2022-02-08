---
layout: blog-post
title: Announcing FusionAuth 1.33
description: This release includes ...
author: Dan Moore
image: blogs/release-1-33/product-update-fusionauth-1-33.png
category: blog
tags: tbd topic-troubleshooting feature-advanced-threat-detection
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.33 of FusionAuth. This version shipped Feburary 7, 2022. 1.32 includes a ton of bug fixes, official support for a number of architectures, and improvements to the MFA process.

<!--more-->

This release contained a number of features, enhancements, and bug fixes. Please see the [release notes](/docs/v1/tech/release-notes#version-1-33-0) for a full breakdown of the changes between 1.32 and 1.33. 

There are a few improvements worth highlighting.

## Support for multiple architectures with Docker

While community members have been experimenting with FusionAuth on other architectures for a while, including running FusionAuth on a raspberry pi, and FusionAuth supported ARM in version 1.32 with the addition of Java17 support, version 1.33.0 release has official support for [Docker images running a variety of CPU architectures](https://hub.docker.com/r/fusionauth/fusionauth-app/tags):

* linux/amd64
* linux/arm/v7
* linux/arm64
* linux/ppc64le
* linux/s390x

You can pull a specific architecture using `docker pull --platform linux/arm64 fusionauth/fusionauth-app:latest`.

This is exciting for two reasons:

1. You can now run FusionAuth in Docker on the newest Macs with the M1 chip, should you have them, in a more performant manner.
2. You can now run FusionAuth in container systems, such as Kubernetes, using ARM based instances like AWS's Graviton. Preliminary tests on the ARM architecture show some great price and performance improvements.

You can see the type of instance your FusionAuth instance is running on by navigating to "System" and then the "About" section:

TODO IMAGE

Please post a screenshot of the "About" screen in our [forum](https://fusionauth.io/community/forum/) if you run FusionAuth on the PowerPC or LinuxONE architectures. We'd love to send you a t-shirt!

# Localization improvements

FusionAuth's hosted login pages support over 10 other languages through community efforts. With this release, we've automated some of this process so that it'll be easier to keep translations up to date.

If you want to learn more about our localization efforts, please check out the [fusionauth-localization GitHub repository](https://github.com/FusionAuth/fusionauth-localization)

The new release also maintains locale ordering for users who have more than one locale preference. This will let email and SMS messages you send fall back from, say French Canadian to French to English, in a deterministic and appropriate manner.

Here's an example of the hosted login pages using the community provided German translation.

TODO IMAGE

{% include _image.liquid src="/assets/img/blogs/release-1-32/limit-links.png" alt="Limit the number of links for the Google identity provider." class="img-fluid" figure=false %}

## Improved messaging around licensing

With version 1.30, FusionAuth includes, for the first time, features only available to customers with an Enterprise license.

Unfortunately our licensing error messages were not updated. This caused some customer confusion. Customers with paid licenses were seeing messages stating that they needed a license to enable features like webhooks on password change or rate limiting two-factor code sending. Sorry about that!

In this release, the error message has been made clearer what needs to be enabled to access certain Enterprise only features.

## The rest of it

There were 30 issues, enhancements and bug fixes that have improved this release. These include:

* Fixing the fastpath download script; it wasn't downloading Java correctly.
* A number of bug fixes around advanced registration forms were completed.
* The `jwt.refresh-token.revoke` event fires correctly when you call `/api/logout`.
* A bug where the registration count rollup was incorrect was fixed.

## Upgrade at will

The [release notes](/docs/v1/tech/release-notes#version-1-33-0) are a guide to the changes, fixes, and new features. Please read them carefully to see if any features you use have been modified.

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/admin-guide/upgrade). 

If you have a FusionAuth Cloud deployment, proceed to the "Deployments" tab on your [account dashboard](https://account.fusionauth.io/account/deployment/){:target="_blank"} and upgrade your servers. If you have any questions about the upgrade, [please open a support ticket](https://account.fusionauth.io/account/support/){:target="_blank"}.

Or, if we've piqued your interest and you'd like to use FusionAuth, [check out your options](/pricing).
