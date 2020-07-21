---
layout: blog-post
title: Announcing FusionAuth 1.18
description: The FusionAuth 1.18 Release offers custom registration forms, syncing with LDAP and more.
author: Dan Moore
image: blogs/release-1-18/fusionauth-release-1-18.png
category: blog
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.18. The 1.18 release shipped on July 21, 2020. This version delivers new features as well as resolving issues for users on version 1.17 and older.

<!--more-->

## Highlights

In addition to bug fixes and user interface improvements, there are a couple of features available only to users of paid editions.

### Advanced Registration Forms 

FusionAuth now has support for [advanced registration forms](/docs/v1/tech/apis/forms). This [paid edition](/pricing) feature lets you build out flexible registration forms with no code required. You can add custom fields as well as controlling their display order. You can also set up multiple pages for registration; for example, you can have a step gathering personal information and then a second step asking for application specific registration information. Here's an example of adding a field to a custom registration form:

{% include _image.liquid src="/assets/img/blogs/release-1-18/add-custom-registration-flow.png" alt="Adding a field to a custom registration form." class="img-fluid" figure=false %}

### Connectors

Support for [LDAP integration](xxx) has also been added, as well as a general framework for allowing authentication against external systems. These are referred to as Connectors. When you configure a Connector, you can write flexible rules determining which users will use the Connector and whether to migrate the external user information to FusionAuth. FusionAuth will authenticate users against external systems. This functionality is in technology preview, and is also a [paid edition](/pricing) feature. 

{% include _image.liquid src="/assets/img/blogs/release-1-18/set-up-ldap-connector.png" alt="Adding an LDAP connector" class="img-fluid" figure=false %}

In addition to these features, there were over ten other bugs squashed and GitHub issues resolved as well. These fixes include changes to JWT claims, consents and refresh tokens. Please see the [release notes](/docs/v1/tech/release-notes#version-1-18-1) for the full breakdown of the changes between 1.17 and 1.18. 

This release includes a substantial data migration, so if you have a large number of users, make sure you test the upgrade process; testing upgrades with 3M+ users took approximately 3-5 minutes on bare metal with an SSD. 

If you'd like to upgrade your FusionAuth instance, see our [upgrade guide](/docs/v1/tech/installation-guide/upgrade). If you have a licensed edition, open a [support request from your account dashboard](https://account.fusionauth.io){:target="_blank"} and we'll take care of you. Or, if you'd like to download and use FusionAuth, [check out your options](/pricing).
