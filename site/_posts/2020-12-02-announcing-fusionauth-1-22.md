---
layout: blog-post
title: Announcing FusionAuth 1.22
description: The FusionAuth 1.22 Release offers Elasticsearch improvements and asynchronous tenant deletion
author: Dan Moore
image: blogs/release-1-22/product-update-fusionauth-1-22.png
category: blog
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.22 of FusionAuth. This release shipped on Dec 1, 2020. This version delivers new features as well as resolving issues for users on version 1.21 and older.

<!--more-->

## Highlights

In addition to bug fixes and enhancements, there are a couple of new improvements I wanted to highlight.

### Elasticsearch improvements

Elasticsearch is one of the two search engines available for FusionAuth. (If you aren't sure which one to choose, you can read about the [strengths and limitations of each](/docs/v1/tech/core-concepts/users/#user-search).)

This release includes improvements to Elasticsearch. You may now specify the index name, using any of the configuration options (environment variable, system property or configuration file option). You might want to do this if you are running multiple instances of FusionAuth, perhaps for different development environments, but using the same Elasticsearch cluster. See the [configuration reference documentation](/docs/v1/tech/reference/configuration/) for more details.

You don't typically have to reindex Elasticsearch in a production environment, but sometimes you want to. This operation can be done from the administrative user interface by navigating to "System" and then "Reindex". The reindexing process has been substantially reworked in 1.22, and you can now reindex 1M users in approximately 100 seconds. Performance does depend on hardware and other system activity, however.

### Asynchronous tenant deletion 

[Tenants](/docs/v1/tech/core-concepts/tenants/) are useful in many situations, and FusionAuth supports unlimited tenants. You can use them for private labeling your application, for different dev/test/qa environments, or for logical separation between different applications and API keys. 

Tenants are also useful for testing bulk load migration scripts. When you use a tenant for this purpose, you'll delete the tenant repeatedly. Doing so deletes all the applications, groups, users, and configuration associated with a tenant. There's no going back when you delete a tenant, so FusionAuth asks you to confirm it:

{% include _image.liquid src="/assets/img/blogs/release-1-22/delete-screen.png" alt="The delete tenant confirmation screen." class="img-fluid" figure=false %}

Deleting all these entities can take some time. The [delete operation](/docs/v1/tech/apis/tenants/#delete-a-tenant) can now be asynchronous using the API and passing `async=true`. Before this release, you had to ensure that your requesting client had a high timeout setting, as it had to wait for the entire operation to complete. When you're loading millions of test users, that can take a fair bit of time. 

With this release the API client can request a deletion and then poll periodically to see if the tenant deletion has finished. We say, let that API client rest a bit!

## Bugs squashed

In addition to the above improvements, there were over ten other bugs squashed and GitHub issues resolved. These included increasing the third party identity provider timeout, a two factor authentication code request bug, and fixing an error during the login process when using an LDAP connector. Please see the [release notes](/docs/v1/tech/release-notes/#version-1-22-0) for the full breakdown of the changes between 1.21 and 1.22. 

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/installation-guide/upgrade/). 

If you have a FusionAuth Cloud deployment, open a [support request from your account dashboard](https://account.fusionauth.io/account/support/){:target="_blank"} and we'll get your servers upgraded! 

Or, if we've piqued your interest and you'd like to download and use FusionAuth, [check out your options](/pricing/).
