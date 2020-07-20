---
layout: blog-post
title: Announcing FusionAuth 1.18
description: The FusionAuth 1.18 Release offers custom registration forms, syncing with LDAP and more.
author: Dan Moore
image: blogs/news/fusionauth-release-1-18.png
category: blog
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.18. The 1.18 release shipped on July 20, 2020. This version delivers new features as well as resolving issues for users on version 1.17 and older.

<!--more-->

## Highlights

In addition to bug fixes and user interface improvements, there are a couple of features available in [paid editions](/pricing).

FusionAuth now has support for [custom registration forms](xxx). This paid edition feature lets you build out a registration form with more flexibility. You can add custom fields as well as controlling their order. You can also set up multiple steps for registration; for example, you can have a step gathering personal information and then a second step asking for application specific registration information. Here's an example of adding a field to a custom registration form:

{% include _image.liquid src="/assets/img/blogs/release-1-18/add-custom-registration-flow.png" alt="Adding a field to a custom registration form." class="img-fluid" figure=false %}

Support for [LDAP integration](xxx) has also been added, as well as a general framework for allowing authentication against external systems. This framework is referred to as "Connectors". When you configure a connector, you can use it for a certain domain or all domains, and you can choose whether to migrate user information to FusionAuth. When a user for a domain logs in, if their domain matches, FusionAuth will attempt to authenticate them against the external system. This functionality is in technology preview, and is also a paid edition feature. 

{% include _image.liquid src="/assets/img/blogs/release-1-18/set-up-ldap-connector.png" alt="Adding an LDAP connector" class="img-fluid" figure=false %}

In addition to these features, there were XXX other bugs squashed and GitHub issues resolved as well. These fixes include changes to XXX. 

Please see the [release notes](/docs/v1/tech/release-notes#version-1-18-1) for the full breakdown of the changes between 1.17 and 1.18.

If you'd like to upgrade your FusionAuth instance, see our [upgrade guide](/docs/v1/tech/installation-guide/upgrade). If you have a licensed edition, open a [support request from your account dashboard](https://account.fusionauth.io){:target="_blank"} and we'll take care of you. Or, if you'd like to download and use FusionAuth, [check out your options](/pricing).
