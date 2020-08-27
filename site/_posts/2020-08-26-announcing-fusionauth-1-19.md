---
layout: blog-post
title: Announcing FusionAuth 1.19
description: The FusionAuth 1.19 release offers stateless admin pages, multi-tenant SSO, more flexible configuration, and more.
author: Dan Moore
image: blogs/release-1-18/fusionauth-release-1-18.png
category: blog
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.19 of FusionAuth, which shipped at the end of August. This version delivers new features as well as resolves issues for users on version 1.18 and older.

<!--more-->

## Highlights

In addition to bug fixes and user interface improvements, there are a few highlights we'd like to, well, highlight.

### Pin your session no longer 

Previous to the 1.19 release, you needed to use sticky sessions (aka session pinning) for the FusionAuth administrative user interface and the FusionAuth login pages. Now, if you run more than one FusionAuth node fronted by a load balancer, you no longer have to enable session pinning. The applications are now stateless.

### Revamped configuration options

Configuration options are now consistent. Every option can be set in one of three ways:

* a key value pair in the `fusionauth.properties` file
* environment variables
* Java system properties, set with the `-D` command line option when starting FusionAuth

If you are running in Docker or Kubernetes, you'll have all the configuration flexibility without mounting any volumes for a `fusionauth.properties` file. 

And if you are worried about your configuration breaking with these new arguments, don't. All previous configuration options are backwards compatible. We will, however, nag you to update your configuration values or environment variables, because that’s how we roll.

### Login page hinting

If you are using FusionAuth as an [auth bottleneck](/blog/2020/07/08/auth-and-the-bottleneck-architecture), you may want to let users proceed directly to their third party identity provider. This makes for a more pleasant user auth experience. You can now do this with login page hinting. Configure users from certain domains or pass certain request parameters and your users will proceed directly to their third party identity provider.

### Import those refresh tokens

If you are migrating over to FusionAuth, especially if you are using [the Import Users API](/docs/v1/tech/apis/users#import-users), perhaps with a [custom password encryptor](/docs/v1/tech/plugins/password-encryptors), you typically want to minimize impact on your users. 

With this release you can now import refresh tokens issued by a different user management system. FusionAuth will continue to honor those tokens. Rather than forcing a user to log when they have been migrated, when clients present the old refresh token, new JWTs will be issued. Score one for smooth, transparent migrations.

### Application email templates

If you are building out a private label application, have application specific email templates for common flows keeps you from unnecessarily creating tenants. With this release, you can configure these templates on an application by application basis:

* Passwordless
* Email verification
* Setup password
* Change password

See the [email templates documentation](/docs/v1/tech/email-templates/) for more on configuring and customizing them.

In addition to these features, there were a few other bugs squashed and GitHub issues resolved as well, including true multi-tenant SSO and missing JWT claims. Please see the [release notes](/docs/v1/tech/release-notes) for the full breakdown of the changes between 1.18 and 1.19. 

If you'd like to upgrade your FusionAuth instance, see our [upgrade guide](/docs/v1/tech/installation-guide/upgrade). If you have a licensed edition, open a [support request from your account dashboard](https://account.fusionauth.io){:target="_blank"} and we'll take care of you. Or, if you'd like to download and use FusionAuth, [check out your options](/pricing).

