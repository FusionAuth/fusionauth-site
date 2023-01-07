---
layout: blog-post
title: Readymag chose FusionAuth because of the well-structured API, Typescript SDK, and helpful support
description: Readymag, a browser-based design tool that helps create websites, portfolios and online publications uses FusionAuth because of its clear structure, reasonable update policies and support.
author: Dan Moore
image: blogs/readymag-apis-typescript-support/readymag-chose-fusionauth-because-of-the-well-structured-api-typescript-sdk-and-helpful-support-header-image.png
category: community-story
tags: topic-community-story topic-upgrade-homegrown upgrade homegrown community-story apis
excerpt_separator: "<!--more-->"
---

Sergey Nechaev and Ilya Shuvalov are FusionAuth community members and software developers at Readymag. They chatted with us over email about how they and their team are using FusionAuth to meet their auth needs. 

<!--more-->

*This interview has been lightly edited for clarity and length.*

-------

**Dan:** Can you tell me a bit about Readymag?

**Sergey and Ilya:** Readymag is a browser-based design tool that helps create websites, portfolios and all kinds of online publications without any coding.

**Dan:** How do you use FusionAuth? OAuth? User management? Social sign-on? Something else?
        
**Sergey and Ilya:** Mostly we use FusionAuth for all user authentication. This ranges from username and passwords, to social sign-on, to two-factor authentication. FusionAuth's user management wasn't the main reason for our choice, as we have our own solution for this. We also use FusionAuth to authorize applications in our multiservice stack.

> [F]or us the main advantage of FusionAuth is that we outsource auth to a separate service with a clear structure, reasonable update policies and a good level of support.

**Dan:** What problems did we solve for you?

**Sergey and Ilya:** We were looking for a tool that would help us accomplish a variety of goals: 

* A single authentication solution for users with standard login/password + OAuth from different providers. We also wanted to have one place to manage this.
* Allow our customers to use two-factor authentication.
* Easy authorization for our internal-facing applications, with single sign-on.
* Differentiate roles and access rights at the user level.

**Dan:** How were the problems handled before FusionAuth?

**Sergey and Ilya:** We used standard username and password, as well as self-written connectors to OAuth providers. 

Internal applications also had their own solutions, though there was no centralized management solution.

> [FusionAuth has] a convenient and well-structured API.

**Dan:** Why choose FusionAuth over the alternatives?

**Sergey and Ilya:** First we experimented with other solutions by trying to build an auth system. But it didn't go beyond internal testing: the API was poorly documented, updating it was problematic, and the admin panel was not user friendly. We also experienced a lack of support and community resources.

Ultimately, we switched to FusionAuth for the following reasons:

* A convenient and well-structured API
* Well-prepared documentation
* Plenty of examples in the FusionAuth repositories
* Helpful support, including that provided by the community
* Cost effectiveness
* Typescript support

Additionally, we were able to deploy FusionAuth and try it out in only a few minutes (with the help of Docker). That quick start was a big win.

**Dan:** How much time and money would you say FusionAuth has saved you?

**Sergey and Ilya:** It's not easy to estimate, but for us the main advantage of FusionAuth is that we outsource auth to a separate service with a clear structure, reasonable update policies and a good level of support.

> [FusionAuth has] well-prepared documentation.
        
**Dan:** How do you run FusionAuth (Kubernetes, standalone tomcat server, behind a proxy, etc)?

**Sergey and Ilya:** We use a cluster of docker instances with load balancing, running in a cloud infrastructure provider.

**Dan:** Any general feedback/areas to improve?

**Sergey and Ilya:** It would be nice to have a more clear description of how to update versions for production in a cluster mode with several nodes. _[Ed. note: Here's our [current docs](/docs/v1/tech/installation-guide/cluster#cluster-upgrades) on this topic.]_

-------

We love sharing community stories. You can check out [Readymag's website](https://readymag.com/) if you'd like to learn more about them.
