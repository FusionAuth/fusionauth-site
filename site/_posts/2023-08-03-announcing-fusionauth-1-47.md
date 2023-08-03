---
layout: blog-post
title: Announcing FusionAuth 1.47
description: These releases include performance improvements, the ability to include preferred languages on the basic registration form, and SAMLv2 assertion encryption.
author: Dan Moore
image: blogs/release-1-47/fusionauth-1-47.png
category: announcement
tags: release-announcement localization registration performance lambda connector http metrics saml
excerpt_separator: "<!--more-->"
---

FusionAuth version 1.47 shipped in late July, 2023. These releases include performance improvements, the ability to include preferred languages on the basic registration form, and SAMLv2 assertion encryption.

<!--more-->

The focus of this release was improving performance. In fact, I hereby dub it the "Performance Panther" release.

All in all there are 21 issues, enhancements, and bug fixes included in the 1.47 releases. As always, please see the [release notes](/docs/v1/tech/release-notes#version-1-47-1) for a full breakdown of the changes between 1.46 and 1.47, including any schema changes.

## Performance improvements

{% include _image.liquid src="/assets/img/blogs/release-1-47/panther.png" alt="Performance panther is looking at you." class="img-fluid" figure=false %}

There were a number of performance improvements in these releases. 

Some improvements are only applicable for Enterprise clients. This included lowering the memory overhead when downloading and storing the IP location database. This IP data is used by [Advanced Threat Detection](/docs/v1/tech/advanced-threat-detection/).

Other improvements apply to all users of FusionAuth. This includes reworking the internal caching system, which improves performance when creating or deleting hundreds or thousands of applications, keys or other configuration. Another performance improvement is capturing timing metrics around HTTP requests and Lambda and Connector invocations. These will be exposed in the [System Status API](https://fusionauth.io/docs/v1/tech/apis/system#retrieve-system-status) response. 

There was also validation logic added which limits the number of languages a user can have. Sorry, you'll just have to make do with 20. In certain cases providing too many languages during registration caused performance impacts to the system.

To assist with troubleshooting performance issues, garbage collection logging can be turned on in version 1.47.0. Reviewing garbage collection logs, while no fun, can help you understand how the JVM is impacting FusionAuth's abilities to authenticate your users.

Happy tuning!

## Preferred languages on the basic registration form

FusionAuth has self service registration. It comes in two flavors: 

* [Basic registration](/docs/v1/tech/guides/basic-registration-forms), which is available with all plans, including the forever free Community plan.
* [Advanced registration](/docs/v1/tech/guides/advanced-registration-forms), which requires a paid plan.

In either case, when enabled, your users can self-register for your application by providing certain information.

With basic, you are limited to a number of common registration fields, such as first name and last name. With 1.47, your users can now choose a preferred language when registering.

To set it up, you'd enable it in the basic registration configuration.

{% include _image.liquid src="/assets/img/blogs/release-1-47/preferred-languages-enable.png" alt="Enabling the preferred languages field." class="img-fluid" figure=false %}

Then, the user will now see a dropdown when registering. This page [can be themed](/docs/v1/tech/themes/), of course.

{% include _image.liquid src="/assets/img/blogs/release-1-47/preferred-languages-user.png" alt="The user's view of preferred languages." class="img-fluid" figure=false %}

This feature is useful if your application supports multiple languages and you want to [send your welcome email](/docs/v1/tech/email-templates/templates-replacement-variables#setup-password) in the language your user prefers. Previous to 1.47, you had to use advanced registration forms to get this functionality.

## SAMLv2 assertion encryption

As of version 1.47, FusionAuth is compatible with a SAML v2 Service Provider (SP) that requires encrypted assertions. This functionality is only available when FusionAuth is acting as the SAMLv2 Identity Provider (IdP). You can enable and configure the behavior on the "SAML" tab of a given Application.

Reasons why SAML assertion encryption might be useful:

* The assertion contains sensitive personally identifiable information (PII).
* The login occurs in a highly secure or regulated environment.
* The assertion contains other sensitive data.
* The SP requires it. :)

Learn more about [configuring SAML assertion encryption](/docs/v1/tech/core-concepts/applications#assertion-encryption).

## The rest of it

As mentioned above, there were 21 issues, enhancements, and bug fixes included in these releases. A selection of the included changes not covered above includes:

* Updating third party dependencies such as Jackson and the PostgreSQL client library.
* New configuration to accept any named parameter as a login hint coming from the SAML v2 SP when FusionAuth is acting as the SAML v2 IdP. 
* Upgrading to the latest version of our phone number validation library, which includes support and updates for a number of countries phone numbers.

Read more about all the changes in the [release notes](/docs/v1/tech/release-notes#version-1-47-1).

## Upgrade at will

The [release notes](/docs/v1/tech/release-notes#version-1-47-1) are a guide to the changes, fixes, and new features. Please read them carefully to see if any features you use have been modified or enhanced.

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/admin-guide/upgrade). 

If you have a FusionAuth Cloud deployment, proceed to the "Hosting" tab on your [account dashboard](https://account.fusionauth.io/account/deployment/){:target="_blank"} and upgrade your instances. If you have any questions about the upgrade, [please open a support ticket](https://account.fusionauth.io/account/support/){:target="_blank"}.

Or, if we've piqued your interest and you'd like to use FusionAuth, [check out your options](/pricing).
