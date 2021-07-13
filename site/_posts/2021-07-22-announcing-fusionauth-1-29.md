---
layout: blog-post
title: Announcing FusionAuth 1.29
description: The FusionAuth 1.29 release includes identity linking, additional identity providers, a lambda for the Client Credentials grant and more
author: Dan Moore
image: blogs/release-1-29/product-update-fusionauth-1-29.png
category: blog
tags: feature-identity-providers feature-client-credentials-grant
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.29 of FusionAuth. This shipped on June 7, 2021, with follow on point releases planned shortly. This version resolves issues for FusionAuth community members and customers on versions 1.28 and older. 

<!--more-->

This release contained a number of enhancements and bug fixes. Please see the [release notes](/docs/v1/tech/release-notes/#version-1-29-0) for a full breakdown of the changes between 1.28 and 1.29. There were a few items to which it is worth paying close attention.

## More SAML debugging

SAML is a critical standard to support for single sign-on, but there are a lot of subtle differences between providers. FusionAuth already provides debugging, but this release increases the amount of debugging availalble. In particular, turning on debugging when using a [SAML Identity Provider](/docs/v1/tech/identity-providers/samlv2/) will now log `AuthN` details, including:

* The configured binding 
* The query string
* The encoded request
* The relay state
* The entire unecoded XML value

Enabling this will help all FusionAuth users with SAML integrations more easily debug any issues they find. It's always a good idea to turn this off in production or once the debugging is done, since it will fire for every user who authenticates using the SAML provider. Such debugging may have a performance impact and will definitely spam the [Event Log](/docs/v1/tech/troubleshooting/#event-log).

## Identity linking enhancements

The last release included identity linking, where you could link one or more external accounts, managed by other identity providers, to one FusionAuth user account.

This release extends this functionality to:

* Allow you to retrieve a FusionAuth user by an Identity Provider Id and the unique Id maintained at that Identity Provider. So if you wanted to find a user who registered in FusionAuth using the Facebook Identity Provider to, for instance, delete them, you could. Simply provide the [Facebook Identity Provider Id](/docs/v1/tech/apis/identity-providers/facebook/) and the user's Facebook Id, and you can find the FusionAuth user.
* Allow the IdP Login API to be passed a request parameter to indicate a link should not be established and return a 404 instead. This is useful if you wish to identify if a identity link exists first before starting a workflow such as a device grant with a linking token.

## Freemarker debugging improvements

[Apache Freemarker](https://freemarker.apache.org/) is the technology primarily used to customize [FusionAuth themes](/docs/v1/tech/themes/). Themes control every aspect of the user interface for the [hosted login pages](/docs/v1/tech/core-concepts/integration-points/#hosted-login-pages). These hosted login pages take care of ten plus common login workflows. FusionAuth provides a default theme, but for most implementations, you'll want to brand these pages to look like your application.

Previous to this release, any errors in the templates would cause nasty ugly exceptions to be displayed. With this release, a more useful message is logged to the aforementioned Event Log, including the expression, the line number, the template name and the theme Id. Reviewing these messages should shorten the debugging time required to fix any template bugs.

Building themes is critical to most users of FusionAuth and we're happy to improve the developer experience in this way.

## Other enhancements

Some of the other enhancements included in this release are:

* Upgrading our JDBC connection pooling


* The Email Send API now allows an email address in the To field instead of requiring FusionAuth user Ids. You can now use the FusionAuth templating system to send an email to anybody, not just users stored in FusionAuth.
* The SAML identity provider supports any `NameID` format, including `urn:oasis:names:tc:SAML:2.0:nameid-format:persistent`, used by Slack.
* The Google and Facebook identity providers can be configured to use either a popup or redirect style login flow. With the redirect style flow, you can use the `idp_hint` parameter to send users directly to Google or Facebook.

There's a lot more in this release. In total, I counted 18 GitHub issues resolved in the 1.29 release.

## Upgrade at will

The [release notes](/docs/v1/tech/release-notes/#version-1-29-0) are a guide of the changes, fixes, and new features. Please read them carefully to see if any features you use have been modified.

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/installation-guide/upgrade/). 

If you have a FusionAuth Cloud deployment, proceed to the "Deployments" tab on your [account dashboard](https://account.fusionauth.io/account/deployment/){:target="_blank"} and upgrade your servers. If you have any questions about the upgrade, [please open a support ticket](https://account.fusionauth.io/account/support/){:target="_blank"}.

Or, if we've piqued your interest and you'd like to use FusionAuth, [check out your options](/pricing/).
