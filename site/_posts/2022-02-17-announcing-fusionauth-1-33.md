---
layout: blog-post
title: Announcing FusionAuth 1.33
description: This release includes updates in Docker architecture support, improved localization and more.
author: Dan Moore
image: blogs/release-1-33/product-update-fusionauth-1-33.png
category: announcement
tags: topic-troubleshooting feature-advanced-threat-detection advanced-threat-detection release-announcement
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.33 of FusionAuth. This version shipped February 7, 2022. 1.33 includes a ton of bug fixes, official Docker support for a number of architectures, and improvements to the MFA process.

<!--more-->

This release contained a number of features, enhancements, and bug fixes. Please see the [release notes](/docs/v1/tech/release-notes#version-1-33-0) for a full breakdown of the changes between 1.32 and 1.33. 

There are a few improvements worth a special mention.

## Support for multiple architectures with Docker

Community members have been experimenting with FusionAuth on other architectures for a while, including running FusionAuth on a Raspberry Pi. Since version 1.32 and Java 17, FusionAuth has supported the ARM CPU architecture. 

With version 1.33, FusionAuth officially supports [Docker images for a variety of CPU architectures](https://hub.docker.com/r/fusionauth/fusionauth-app/tags), including:

* linux/amd64
* linux/arm/v7
* linux/arm64
* linux/ppc64le
* linux/s390x

You can pull an architecture specific Docker image using `docker pull --platform <platform> fusionauth/fusionauth-app:latest`. These images have been generated back to FusionAuth version 1.24, at a community member's request.

This support is exciting for two reasons:

1. You can now run FusionAuth in Docker on the newest Macs with the M1 chip with far better performance that previously.
2. FusionAuth can run in container based systems, such as Kubernetes, using ARM based virtual machines such as AWS's Graviton. Preliminary tests with Graviton systems show great price and performance improvements.

To learn what platform your FusionAuth instance is currently running, navigate to "System" and then the "About" section in the administrative user interface.

Look for the "Platform" label:

{% include _image.liquid src="/assets/img/blogs/release-1-33/about-screen.png" alt="The About screen displaying the CPU architecture platform." class="img-fluid" figure=false %}

By the way, if your FusionAuth instance is running on the PowerPC or LinuxONE architectures, please post a screenshot of the "About" screen in our [forum](https://fusionauth.io/community/forum/) or tag us on [Twitter](https://twitter.com/fusionauth). We'd love to send you a t-shirt!

# Localization improvements

FusionAuth's hosted login pages support more than 15 languages, primarily through community effort. With this release, this process is more automated, so it'll be easier to keep the translations up to date.

If you want to learn more about the community localization efforts, please check out the [fusionauth-localization GitHub repository](https://github.com/FusionAuth/fusionauth-localization).

The new release also maintains locale ordering for users with more than one locale preference. This ensures email and SMS messages fall back appropriately, from say French Canadian to French to English.

Here's an example of the "Forgot Password" hosted login page with the community provided German translation:

{% include _image.liquid src="/assets/img/blogs/release-1-33/forgot-password.png" alt="The Forgot Password page translated into German." class="img-fluid" figure=false %}

## Improved messaging around licensing

With version 1.30, FusionAuth included features only available to customers with an Enterprise license.

Unfortunately our licensing error messages were not updated. This caused confusion. Customers with paid licenses were seeing messages indicating that they needed a paid license to enable these Enterprise only features, like webhooks on a user password change or rate limiting the requesting of two-factor codes.

Sorry about that! In this release, licensing related error messages have been made much clearer.

## Multi-factor and the Change Password API

If you are using 2FA and the Change Password API, there is a breaking change related to security that you will want to be aware of. 

If you use the FusionAuth themed pages, there is no change required on your part, but if you use the API directly there will be a modification required to your integration.

Beginning in this release, to use the Change Password API for a user with Two-Factor enabled, you must obtain a Trust Token from the Two Factor Login API. This is potentially a breaking change, but the decision was made due to the enhanced security provided. Please review the [release notes](/docs/v1/tech/release-notes#version-1-33-0) for more information.

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
