---
layout: blog-post
title: Announcing FusionAuth 1.32
description: This release includes custom email headers, identity provider link limits, and more.
author: Dan Moore
image: blogs/release-1-32/product-update-fusionauth-1-32.png
category: announcement
tags: topic-troubleshooting feature-advanced-threat-detection advanced-threat-detection identity-links email release-announcement
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.32 of FusionAuth. This version shipped the week of December 13, 2021. 1.32 includes a ton of bug fixes and improvements to the Identity Providers feature.

<!--more-->

This release contained a number of features, enhancements, and bug fixes. Please see the [release notes](/docs/v1/tech/release-notes#version-1-32-1) for a full breakdown of the changes between 1.31 and 1.32. 

There are a few improvements worth highlighting.

## Limit the number of links for any user

Recent versions of FusionAuth support identity linking. This lets you link accounts in FusionAuth to accounts in remote user data stores, whether social, SAML or OIDC based. Here are some [examples of linking](/docs/v1/tech/identity-providers/#linking-strategy-examples) that can be useful to understand this feature.

With the 1.32 release, you can limit the number of links per identity provider, per user. This is configured in the identity provider, but can vary between tenants.

{% include _image.liquid src="/assets/img/blogs/release-1-32/limit-links.png" alt="Limit the number of links for the Google identity provider." class="img-fluid" figure=false %}

An example situation where this might be useful is if you have an application which lets people log in via Google, but you want to ensure that each user is tied to at most one Google account. You can now configure the links per user for the Google Identity Provider to be `1`, and this business rule is now enforced by FusionAuth. 

## Custom email headers

FusionAuth sends a [lot of email](/docs/v1/tech/email-templates/templates-replacement-variables) on your behalf. Whether a breached password notification, an email to allow a user to reset their password or an address verification, FusionAuth lets you [manage these templates via an API](/docs/v1/tech/apis/emails) and [localize them](/docs/v1/tech/email-templates/email-templates#localization) to provide the language your users expect. You can even turn on SMTP debugging to see what happens if you have issues with emails being delivered.

{% include _image.liquid src="/assets/img/blogs/release-1-32/additional-email-headers.png" alt="Configure additional email headers." class="img-fluid" figure=false %}

However, there are certain situations where you want to add custom email headers. For instance, when using Amazon Simple Email Service, you may want to [specify a SES configuration](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/using-configuration-sets.html) set using a header. You can add as many headers as you want.

This option is configured on the tenant. The headers are added to every email sent by FusionAuth and are not dynamic.

## Java 17 support

FusionAuth now runs on Java 17. 

Java 17 is an [LTS version of Java](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) and will be supported for many years. The upgrade is primarily an internal one, though you may see a [performance increase](https://www.optaplanner.org/blog/2021/09/15/HowMuchFasterIsJava17.html) depending on your use case.

## The rest of it

Some of the other enhancements and fixes included in this release:

* Application URIs such as `android-app://com.example` are now valid authorized request origins.
* You can disable implicit email verification.
* A bug where the registration count rollup was incorrect was fixed.

## Upgrade at will

The [release notes](/docs/v1/tech/release-notes#version-1-32-1) are a guide to the changes, fixes, and new features. Please read them carefully to see if any features you use have been modified.

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/admin-guide/upgrade). 

If you have a FusionAuth Cloud deployment, proceed to the "Deployments" tab on your [account dashboard](https://account.fusionauth.io/account/deployment/){:target="_blank"} and upgrade your servers. If you have any questions about the upgrade, [please open a support ticket](https://account.fusionauth.io/account/support/){:target="_blank"}.

Or, if we've piqued your interest and you'd like to use FusionAuth, [check out your options](/pricing).
