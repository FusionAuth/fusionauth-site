---
layout: blog-post
title: Announcing FusionAuth 1.29
description: The FusionAuth 1.29 release includes identity linking improvements, better SAML and Freemarker debugging, and more.
author: Dan Moore
image: blogs/release-1-29/product-update-fusionauth-1-29.png
category: blog
tags: topic-troubleshooting
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.29 of FusionAuth. This shipped on July 10, 2021. This version resolves issues for FusionAuth community members and customers on versions 1.28 or earlier. 

<!--more-->

This release contained a number of enhancements and bug fixes. Please see the [release notes](/docs/v1/tech/release-notes/#version-1-29-0) for a full breakdown of the changes between 1.28 and 1.29. 

There were a few items worth calling out.

## More SAML debugging

SAML is a critical standard for single sign-on, but there are many subtle differences between providers. FusionAuth already provides some SAML debugging help, but this release increases the amount of information available. 

In particular, turning on debugging when using a [SAML Identity Provider](/docs/v1/tech/identity-providers/samlv2/) will now log `AuthN` details, including:

* The configured binding 
* The query string
* The encoded request
* The relay state
* The entire unencoded XML value

Enabling this will help all FusionAuth users using SAML to more easily debug any issues. It's always a good idea to turn this off in production or once the debugging is done, however. It will fire for every user who authenticates using the SAML provider, and may have a performance impact; it will definitely spam the [Event Log](/docs/v1/tech/troubleshooting/#event-log).

## Identity linking enhancements

The last release included identity linking, where you could link one or more external accounts, managed by other identity providers, to one FusionAuth user account. This release extends identity linking functionality to:

* Allow you to retrieve a FusionAuth user by an Identity Provider Id and the unique Id maintained at that Identity Provider. This API allows you to find a user who registered in FusionAuth using the Facebook Identity Provider to modify or delete them. Provide the [Facebook Identity Provider Id](/docs/v1/tech/apis/identity-providers/facebook/) and the user's Facebook user Id, and you can find the FusionAuth user to modify to your heart's content.
* Allow the IdP Login API to be passed a request parameter indicating a link should not be established. This is useful if you wish to determine if an identity link exists first before starting a workflow such as a device grant with a linking token.

## Freemarker debugging improvements

[Apache Freemarker](https://freemarker.apache.org/) is the technology used to customize [FusionAuth themes](/docs/v1/tech/themes/). Themes control every aspect of the user interface for the [hosted login pages](/docs/v1/tech/core-concepts/integration-points/#hosted-login-pages). These hosted login pages take care of common login workflows. FusionAuth provides a default theme, but for most implementations, you'll want to brand these pages to look like your application.

Previous to this release, errors in the templates would cause ugly exceptions to be displayed to the end user. With this release, a more useful message is logged to the aforementioned Event Log, including debugging info such as the expression, the line number, the template name and the theme Id. When the runtime mode is `production`, the full error is never logged to the end user.

{% include _image.liquid src="/assets/img/blogs/release-1-29/freemarker-exception.png" alt="Example of the end user experience with a theme that has a Freemarker exception." class="img-fluid" figure=false %}

Reviewing these messages should shorten the debugging time required to fix any template bugs. Building and customizing themes is critical to users of FusionAuth and we're happy to improve the developer experience in this way.

## The rest of it

Some of the other enhancements and fixes included in this release:

* Upgrading our JDBC connection and connection pooling libraries
* Other SAML changes including fixing a regression around `NameID`
* Ensuring themeability of a webhook error page

## Upgrade at will

The [release notes](/docs/v1/tech/release-notes/#version-1-29-0) are a guide of the changes, fixes, and new features. Please read them carefully to see if any features you use have been modified.

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/installation-guide/upgrade/). 

If you have a FusionAuth Cloud deployment, proceed to the "Deployments" tab on your [account dashboard](https://account.fusionauth.io/account/deployment/){:target="_blank"} and upgrade your servers. If you have any questions about the upgrade, [please open a support ticket](https://account.fusionauth.io/account/support/){:target="_blank"}.

Or, if we've piqued your interest and you'd like to use FusionAuth, [check out your options](/pricing/).
