---
layout: blog-post
title: dealcloser chooses FusionAuth, saves two months of development time
description: dealcloser, a legaltech startup, uses FusionAuth to solve their enterprise needs.
image: blogs/dealcloser-case-study/dealcloser-chooses-fusionauth-saves-two-months-of-development-time.png
author: David Polstra
category: blog
tags: topic-customer-story
excerpt_separator: "<!--more-->"
---

Alex Trauzzi is a Developer & Software Architect building dealcloser, a transaction management hub for legal professionals. We sat down with him to chat about how he and his team are using FusionAuth’s Enterprise Edition to meet their auth needs.

<!--more-->

[dealcloser](https://www.dealcloser.com/) was originally using Auth0 to authenticate internal and external users, but they needed a solution that better fit their enterprise needs and they didn't want to build it inhouse.  They were also faced with a unique situation: many of their users needed to connect to their application without internet access. But dealcloser wanted to leverage existing standards such as OpenID Connect (OIDC). 

> "[While we were looking for a solution], [a]irgapping was the main driver. [The] biggest thing was to preserve that OpenID Connect compatibility."

In case you aren’t familiar with the term, an "air gapped" server is one with no network interfaces connected to outside networks. 

In other words, the dealcloser application had to be one hundred percent functional without routing any traffic over the wider Internet. This is obviously problematic for SaaS auth solutions, but well within FusionAuth’s capabilities.

dealcloser seamlessly migrated their user database from Auth0 to FusionAuth. Alex estimates that it would have taken the team at least two months of development and testing to build an auth system  with the same functionality. Now, they’re able to quickly enable additional auth features like SAML and Single Sign-on in seconds, rather than months and months of coding. 

We’ll let Alex have the final word:

"[FusionAuth has] completely offloaded the need to do any kind of auth coding. That OpenID Connect compatibility is like gold, it’s perfect. I can’t put a price on that."

Want to learn more about dealcloser’s migration from Auth0 to FusionAuth? 

[Read the case study](/resources/dealcloser-case-study.pdf){:.button .brochure .orange .text-larger}{:target="_blank"}
