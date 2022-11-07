---
layout: blog-post
title: Introducing the FusionAuth Early Access Program
description: Authentication and authorization is critical application functionality. How can you stay on top of the latest features without affecting your users?
author: Emily Jansen
image: blogs/what-is-webauthn/what-is-web-authn.png
category: blog
tags: topic-releases
excerpt_separator: "<!--more-->"
---

The Early Access Program (EAP) provides existing customers on any plan the opportunity to upgrade to a preview version of the latest FusionAuth codebase prior to general availability.

<!--more-->

Using an EAP release enables you to test FusionAuth within your own environment before the general release candidate is announced, as well as the opportunity to give the FusionAuth team feedback. 

Our early-release software is tested and is believed to be free of bugs. However, it is still a work in progress and has not received the same level of testing and review as a final public, generally available release.

## How can you participate?

Any FusionAuth user can access the Early Release Program. After logging in to the account portal (free registration required), navigate to [the early access tab](https://account.fusionauth.io/account/early-access/) to download the files or get the link to the docker image. 

If you have been granted EAP access in the past, you will see files and links.

{% include _image.liquid src="/assets/img/blogs/eap-announcement/early-access-granted.png" alt="The early access tab when you have been granted access." class="img-fluid" figure=true %}

If you don’t have access, please contact us. We will enable the EAP for your account, typically within one business day.

{% include _image.liquid src="/assets/img/blogs/eap-announcement/early-access-not-granted.png" alt="The early access tab when you have not been granted access." class="img-fluid" figure=true %}

You can also [contact the sales team](/contact) and request a FusionAuth cloud instance running an EAP version, for even easier testing.

## Things to know

EAP builds are useful for testing out new functionality, but it’s important to know that there’s **no upgrade path** to the GA release.

You can import your users and applications to "kick the tires" but you won’t want to run these builds in production.

New EAP releases will be offered for a period of time (typically a month or two) before a new feature is released. After the feature reaches general availability, the EAP releases will no longer be available for download.

No license is needed to access any new premium features in an EAP release. The documentation for any new EAP features will be limited or non-existent.

EAP releases will be announced on the community forum and slack, or you can ask your account rep about them. There may be multiple EAP releases as a feature is refined, and these will be present on the “early access” tab in your account portal.

There is [more information on EAP releases in our technical documentation](https://fusionauth.io/docs/v1/tech/admin-guide/releases#early-access-program).

## Let us know what you think

If you download and try an EAP, we’d love to hear from you.

You can file bugs in our [GitHub issues repo](https://github.com/fusionauth/fusionauth-issues/issues)and offer any other feedback on the [community forum](https://fusionauth.io/community/forum/), in [slack](https://fusionauth.slack.com/), or via a [support ticket](https://account.fusionauth.io/account/support/). 

