---
layout: blog-post
title: Announcing FusionAuth 1.20
description: The FusionAuth 1.20 Release offers more forms, SAML improvements, docker changes and more.
author: Dan Moore
image: blogs/release-1-20/product-update-fusionauth-1.20.png
category: blog
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.20. The 1.20 release shipped on Oct 26, 2020. This version delivers new features as well as resolving issues for users on version 1.19 and older.

<!--more-->

## Highlights

In addition to bug fixes and user interface improvements, there are a couple of new features and improvements which deserve a spotlight.

### SAML, SAML, SAML

With this release, FusionAuth implements additional parts of the SAML 2.0 standard.

FusionAuth now has support for SAML POST bindings when it is acting as either the SP or the IdP. This allows FusionAuth to integrate with a number of popular commercial off-the-shelf applications and websites, including [login.gov](https://developers.login.gov/saml/) and [Alfresco](https://docs.alfresco.com/saml/concepts/saml-overview.html).

FusionAuth also supports the `SessionIndex` attribute, which is optional, but required by some software applications, notably Artifactory.

Finally FusionAuth now honors the `AssertionConsumerServiceURL` in a SAML request. Multiple redirect URLs can be configured in the application SAML settings as well.

### Docker changes

In this release, we updated the base image for Docker from `alpine` to `ubuntu:focal`. This should not impact functionality, but it's worth paying attention to if you are building Docker images based on our image.

We made this change because in order to run on `alpine` without including the GNU C Library (`glibc`) we had to use a custom build of OpenJDK compiled using the `musl` C library. Due to some possible performance concerns with this option, we have moved to an official build of JDK provided by AdoptOpenJDK. This build is compiled using `glibc`. Unfortunately, using the `ubuntu:focal` image increased the docker image size by approximately 30 MB over the `alpine` based image. However, until we can obtain official builds from AdoptOpenJDK based upon the `musl` C library, we are not planning to ship an official FusionAuth image on `alpine` due to the performance concerns.

### Additional admin user management forms

In version 1.18, FusionAuth added [custom registration forms](/features/advanced-registration-forms/) for users with a paid edition.

In this release, we've added a few new forms. These customizations are also only available to customers with a paid edition. (Learn more about [purchasing a paid edition](/pricing/).) 

This new feature allows you to customize the form used to add or edit a user from the FusionAuth admin UI. These forms can be configured on a per tenant basis. For instance, you can now require a mobile phone number or require one or many custom fields when a FusionAuth admin is creating a user.

You can also modify the registration creation and update form in the FusionAuth admin UI, including capturing custom data, removing unused fields and adding validation to the custom fields. This form is configurable on an application by application basis. 

For instance, if your business logic needs to know a user's favorite color (or anything else), FusionAuth has you covered:

{% include _image.liquid src="/assets/img/blogs/release-1-20/custom-edit-registration-form.png" alt="A customized registration editing form." class="img-fluid" figure=false %}

When combined with FusionAuth's granular roles, which allow you to create users with limited privileges, you can expose these forms to customer service reps or other users whom you might not want to access the entire FusionAuth admin UI.

## Bugs squashed

In addition to these features, there were over ten other bugs squashed and GitHub issues resolved as well. These fixes include changes to JWT contents in certain situations, dashboard user counts, and superfluous log messages. Please see the [release notes](/docs/v1/tech/release-notes/) for the full breakdown of the changes between 1.19 and 1.20. 

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/installation-guide/upgrade/). If you have a FusionAuth Cloud deployment, open a [support request from your account dashboard](https://account.fusionauth.io){:target="_blank"} or [use our contact form](/contact){:target="_blank"} and we'll get your servers upgraded! Or, if you'd like to download and use FusionAuth, [check out your options](/pricing/).
