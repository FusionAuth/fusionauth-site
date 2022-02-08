---
layout: blog-post
title: Announcing FusionAuth 1.33
description: This release includes updates in Docker architecture support, improved localization and more.
author: Dan Moore
image: blogs/release-1-33/product-update-fusionauth-1-33.png
category: blog
tags: tbd topic-troubleshooting feature-advanced-threat-detection
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.33 of FusionAuth. This version shipped Feburary 7, 2022. 1.33 includes a ton of bug fixes, official Docker support for a number of architectures, and improvements to the MFA process.

<!--more-->

This release contained a number of features, enhancements, and bug fixes. Please see the [release notes](/docs/v1/tech/release-notes#version-1-33-0) for a full breakdown of the changes between 1.32 and 1.33. 

There are a few improvements worth a special mention.

## Support for multiple architectures with Docker

Community members have been experimenting with FusionAuth on other architectures for a while, including running FusionAuth on a Raspberry Pi. Since version 1.32 and Java 17, FusionAuth has supported the ARM CPU architecture. But with version 1.33, FusionAuth has official support for [Docker images running a variety of CPU architectures](https://hub.docker.com/r/fusionauth/fusionauth-app/tags), including:

* linux/amd64
* linux/arm/v7
* linux/arm64
* linux/ppc64le
* linux/s390x

You can pull an architecture specific build using `docker pull --platform <platform> fusionauth/fusionauth-app:latest`. These images have been generated back to FusionAuth 1.24, at a community member request.

This support is exciting for two reasons:

1. You can now run FusionAuth in Docker on the newest Macs with the M1 chip with far better performance.
2. You can now run FusionAuth in container based systems, such as Kubernetes, using ARM based virtual machines like AWS's Graviton. Preliminary tests with Graviton show great price and performance improvements.

To learn what platform your FusionAuth instance is currently running, navigate to "System" and then the "About" section. Look for the "Platform" label:

{% include _image.liquid src="/assets/img/blogs/release-1-33/about-screen.png" alt="The About screen displaying the CPU architecture platform." class="img-fluid" figure=false %}

By the way, if your FusionAuth instance is running on the PowerPC or LinuxONE architectures, please post a screenshot of the "About" screen in our [forum](https://fusionauth.io/community/forum/) or tag us on [Twitter](https://twitter.com/fusionauth). We'd love to send you a t-shirt!

# Localization improvements

FusionAuth's hosted login pages support more than 15 languages through community effort. With this release, this process is more automated, so it'll be easier to keep translations up to date.

If you want to learn more about localization or the community efforts, please check out the [fusionauth-localization GitHub repository](https://github.com/FusionAuth/fusionauth-localization).

The new release also maintains locale ordering for users with more than one locale preference. This will let the text generated for email and SMS messages fall back from French Canadian to French to English in a deterministic and appropriate manner.

Here's an example of the "Forgot Password" hosted login page with the community provided German translation:

{% include _image.liquid src="/assets/img/blogs/release-1-33/forgot-password.png" alt="The Forgot Password page translated into German." class="img-fluid" figure=false %}

## Improved messaging around licensing

With version 1.30, FusionAuth included, for the first time, features only available to customers with an Enterprise license.

Unfortunately our licensing error messages were not correctly updated. This caused some confusion. Customers with paid licenses were seeing messages indicating that they needed a paid license to enable these Enterprise only features like webhooks on a user password change or rate limiting the requesting of two-factor codes. Sorry about that!

In this release, error messages have been made clearer.

## The rest of it

There were 30 issues, enhancements and bug fixes included in this release. A selection of these include:

* Fixing the fastpath download script; it wasn't downloading Java correctly.
* A number of bug fixes around advanced registration forms.
* The `jwt.refresh-token.revoke` event now fires correctly when you call the `/api/logout` endpoint.

## Upgrade at will

The [release notes](/docs/v1/tech/release-notes#version-1-33-0) are a guide to the changes, fixes, and new features. Please read them carefully to see if any features you use have been modified.

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/admin-guide/upgrade). 

If you have a FusionAuth Cloud deployment, proceed to the "Deployments" tab on your [account dashboard](https://account.fusionauth.io/account/deployment/){:target="_blank"} and upgrade your instances. If you have any questions about the upgrade, [please open a support ticket](https://account.fusionauth.io/account/support/){:target="_blank"}.

Or, if we've piqued your interest and you'd like to use FusionAuth, [check out your options](/pricing).
