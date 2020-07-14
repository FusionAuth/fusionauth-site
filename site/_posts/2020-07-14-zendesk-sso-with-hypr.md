---
layout: blog-post
title: Zendesk SSO with FusionAuth and HYPR 
description: We'll be walking through how to set up Zendesk with FusionAuth and HYPR
author: Dan Moore
image: blogs/bottleneck-pattern/the-auth-bottleneck-pattern.png
category: blog
excerpt_separator: "<!--more-->"
---

FusionAuth is an excellent centralized identity management platform. In a [webinar tomorrow](https://get.hypr.com/fusionauth-webcast), I'll be walking through how to set up single sign-on authentication between Zendesk, the popular customer support platform and FusionAuth. In under 10 minutes, you'll see how easy it is to configure Zendesk use SAML to integrate with FusionAuth. 

<!--more-->

If you were to continue this pattern with multiple applications, such as GSuite or a custom web application, users could sign into to your entire suite of tools, both COTS and custom, with one username and password. [This architecture](/blog/2020/07/08/auth-and-the-bottleneck-architecture) also allows for operational efficiencies since all users are managed in a single store.

But wait, there's more!

To top it off, we'll be adding HYPR as an identity provider in the webinar. This will allow a user to authenticate using [HYPR's True Passwordless&trade; MFA](https://www.hypr.com/true-passwordless-mfa/). Any authorized user will then be able to access their applications in an easy, secure way.

If you'd like to see how easy it is to configure FusionAuth to serve as an centralized authentication and authorization service, HYPR and FusionAuth are hosting a webinar on Thursday, July 16 2020. 

[Sign up for the webinar](https://get.hypr.com/fusionauth-webcast){:.button .brochure .orange .text-larger}

