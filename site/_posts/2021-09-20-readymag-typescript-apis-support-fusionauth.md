---
layout: blog-post
title: Readymag chose FusionAuth because of the well-structured API, Typescript SDK, and helpful support
description: Readymag, a browser-based design tool that helps create websites, portfolios and online publications uses FusionAuth because of its clear structure, reasonable update policies and support.
author: Dan Moore
image: blogs/readymag-apis-typescript-support/readymag-chose-fusionauth-because-of-the-well-structured-api-typescript-sdk-and-helpful-support-header-image.png
category: blog
tags: topic-community-story topic-upgrade-homegrown
excerpt_separator: "<!--more-->"
---

Sergey Nechaev and Ilya Shuvalov are FusionAuth community members and software developers at Readymag. They chatted with us over email about how they and their team are using FusionAuth to meet their auth needs. 

<!--more-->

*This interview has been lightly edited for clarity and length.*

-------

**Dan:** Can you tell me a bit about Readymag?

**Sergey and Ilya:** Readymag is a browser-based design tool that helps create websites, portfolios and all kinds of online publications without coding.

**Dan:** How do you use FusionAuth? OAuth? User management? Social sign-on? Something else?
        
**Sergey and Ilya:** Mostly we use FusionAuth for all types of user authorisation. This ranges from username and passwords, to social sign-on or two-factor authentication. User management wasn't the main criterion behind our choice, as we have our own resources for this. We also use FusionAuth to authorise applications in our multiservice stack.

> [F]or us the main advantage of FusionAuth is that we outsource authorization to a separate service with a clear structure, reasonable update policies and a good level of support.

**Dan:** What problems did we solve for you?

**Sergey and Ilya:** We were looking for a tool that would help us accomplish a variety of goals: 

* Create a single authorization for users with standard login / password + OAuth from different providers, and concentrate management in one place.
* Allow our customers to use two-factor authentication.
* Easy authorization for our internal applications, with a single sign-on.
* Differentiate roles and access rights at the user level.

**Dan:** How were they handled before FusionAuth?

**Sergey and Ilya:** We used standard username and password authorization, as well as self-written connectors to OAuth providers. 

Internal applications also had their own authorization tools, though there was no centralized resource for management.

> [The FusionAuth software has] a convenient and well-structured API.

**Dan:** Why choose FusionAuth over the alternatives?

**Sergey and Ilya:** First we experimented with other solutions by trying to build an authorization system. But it didn't go beyond internal testing: the API was poorly documented, updating it was an issue, and the admin panel was not user-friendly. We also experienced a lack of support and community resources.

Ultimately, we switched to FusionAuth for the following reasons:

* A convenient and well-structured API
* Well-prepared documentation
* Plenty of examples in the FusionAuth repositories
* Helpful support, including community support
* Cost effectiveness
* Typescript support
* Quick start: we were able to deploy FusionAuth and try it out in only a few minutes (with the help of Docker)

**Dan:** How much time and money would you say FusionAuth has saved you?

**Sergey and Ilya:** It's not easy to estimate, but for us the main advantage of FusionAuth is that we outsource authorization to a separate service with a clear structure, reasonable update policies and a good level of support.

> [FusionAuth has] well-prepared documentation.
        
**Dan:** How do you run FusionAuth (Kubernetes, standalone tomcat server, behind a proxy, etc)?

**Sergey and Ilya:** We use a cluster of docker instances with load balancing in a cloud infrastructure provider.

**Dan:** Any general feedback/areas to improve?

**Sergey and Ilya:** It would be nice to have a more clear description of how to update versions for production in a cluster mode with several nodes.

-------

We love sharing community stories. You can check out [Readymag's website](https://readymag.com/) if you'd like to learn more about them.
