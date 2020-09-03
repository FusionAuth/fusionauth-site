---
layout: blog-post
title: Announcing FusionAuth 1.19
description: The FusionAuth 1.19 release offers stateless, multi-tenant Single-Sign-on (SSO), more flexible configuration, and more.
author: Dan Moore
image: blogs/release-1-19/fusionauth-release-1-19.png
category: blog
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.19 of FusionAuth, which shipped at the beginning of September. This version delivers new features and resolves issues for users running any older version.

<!--more-->

## Highlights

In addition to the usual bug fixes and user interface improvements, there are a few highlights we'd like to, well, highlight.

### Revamped configuration options

Configuration options are now consistent no matter how you set them. Every option can be specified in one of three ways:

* a key value pair in the `fusionauth.properties` file
* environment variables
* Java system properties, set with the `-D` command line option when starting FusionAuth

If you are running in Docker or Kubernetes, you'll have configuration flexibility without mounting any volumes.

And if you are worried about your configuration breaking with these new settings, don't. All previous configuration options are backwards compatible. We will, however, kindly remind you to update your configuration values or environment variables, because that’s how we roll. Learn more in the [configuration reference docs](/docs/v1/tech/reference/configuration).

### Login page hinting

If you are using FusionAuth as an [auth bottleneck](/blog/2020/07/08/auth-and-the-bottleneck-architecture), you may want to let users proceed directly to their third party identity provider, rather than have them see the FusionAuth login page initially. Doing so makes for a more pleasant user auth experience. 

This is now an option using login page hinting. Configure it for certain domains or by passing request parameters and your users will proceed directly to their third party identity provider.

### Import those refresh tokens

If you are migrating to FusionAuth, typically you are using [the Import Users API](/docs/v1/tech/apis/users#import-users), perhaps with a [custom password encryptor](/docs/v1/tech/plugins/password-encryptors). You usually want to minimize impact on your users due to migration of a production system. 

With this release you can now import refresh tokens issued by a different user management system. FusionAuth will continue to honor those tokens. Rather than forcing a user to log in at migration, when clients present the old refresh token, new JWTs will be issued. Score one for smooth, transparent migrations.

### Application email templates

If you are building out a private label application, having application specific email templates for common flows keeps you from unnecessarily creating tenants. With this release, you can configure the following templates on an application by application basis:

* Passwordless
* Email verification
* Setup password
* Change password

See the [email templates documentation](/docs/v1/tech/email-templates/) for more on configuring and customizing your templates.

### Pin your session no longer 

Previous to the 1.19 release, you needed to use sticky sessions (aka session pinning) for the FusionAuth administrative user interface and the FusionAuth login pages. Now, if you run more than one FusionAuth node fronted by a load balancer, you do not have to enable session pinning. The applications are now stateless.

### Multi-tenant single-sign-on (SSO)

This was a limitation prior to this release due to the way we managed the HTTP session. Now FusionAuth can handle true multi-tenant SSO using the hosted login pages. Users can sign in to multiple applications in different tenants in the same browser.

In addition to these features, there were other bugs squashed and GitHub issues resolved as well. Please see the [release notes](/docs/v1/tech/release-notes) for the full breakdown of the changes between 1.18 and 1.19. 

If you'd like to upgrade your FusionAuth instance, see our [upgrade guide](/docs/v1/tech/installation-guide/upgrade). If you have a licensed edition, open a [support request from your account dashboard](https://account.fusionauth.io){:target="_blank"} and we'll take care of you. Or, if you'd like to download and use FusionAuth, [check out your options](/pricing).

