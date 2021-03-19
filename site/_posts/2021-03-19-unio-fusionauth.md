---
layout: blog-post
title: Unio self hosts FusionAuth and saved $100k
description: Unio uses FusionAuth to handle their user accounts, authentication, authorization, and password management.
author: Dan Moore
image: blogs/dolphinvc-fusionauth/video-conferencing-company-dolphinvc-chose-fusionauth-for-cloud-independence-header-image.png
category: blog
tags: topic-community-story
excerpt_separator: "<!--more-->"
---

Jason Musyj is a FusionAuth community member and Co-Founder & CTO of Unio. He chatted with us over email about how he and his team are using FusionAuth to meet their auth needs. 
<!--more-->

*This interview has been lightly edited for clarity and length.*

-------

**Dan:** Tell me a bit about your work as a developer and CTO.

**Jason:** I am heavily involved in the architecture, design, and development of our software systems. This includes authentication and authorization systems which are usually tedious and error prone when built in house. 

I also have extensive experience working in both enterprise and startup environments, which includes several years at BlackBerry and as CTO of both MobiStream, Unio, and another company in the formative stage.

**Dan:** Can you tell me a bit about what Unio is currently up to?

**Jason:** Sure. [Our website](https://getunio.com) lays out the details of the platform, but we are a business messaging and collaboration tool. We are currently in beta testing with a few organizations and are getting ready for a general product release in May.

> Compared to rolling out our own authentication and authorization services, we estimate that [FusionAuth] saved us around 1000 developer hours. Using a standard $100/hour rate, that's $100k in savings. 

**Dan:** How do you use FusionAuth? OAuth? User management? Social sign-on? Something else?

**Jason:** Unio leverages FusionAuth for user management, authentication, authorization, APIs, and secure token signing.

**Dan:** What problems did we solve for you? And how were you solving them before FusionAuth?

**Jason:** FusionAuth solves a problem for Unio that many organizations often face: how do you handle user accounts, authentication, authorization, and password management? 

You usually have two options: roll your own solution or leverage a very expensive service. 

FusionAuth provides us with a third option—a standardized solution that is robust and battle-tested, which we can self-host, configure and extend as desired, and integrate easily with SDKs and APIs. 

We have been able to leverage some advanced features like JWT signing and JWKS endpoints of the platform to help us integrate with other external systems and build out best-in-class security and privacy for our platform.

**Dan:** Which SDKs do you use? What's an example of how you use it? 

**Jason:** We use the Java SDK and the REST API. 

Some examples of how we use it: get all users within a domain, start a forgot password flow, change password, authenticate users.

> FusionAuth provides ... a standardized solution that is robust and battle-tested, which we can self-host, configure and extend as desired, and integrate easily with SDKs and APIs. 

**Dan:** Why did you choose FusionAuth over the competition?

**Jason:** We chose FusionAuth because of its robust feature set, flexible deployment capabilities, and cost. 

We self-host, so it saves us a lot of money compared to using competing products.

**Dan:** How much time and money would you say FusionAuth has saved you?

**Jason:** A significant amount. Compared to rolling out our own authentication and authorization services, we estimate that it saved us around 1000 developer hours. Using a standard $100/hour rate, that's $100k in savings. 

As for competing services, we believe FusionAuth saved us around $300-$800 per month for the 12+ months we’ve been using it.

**Dan:** Any general feedback/areas to improve?

**Jason:** As always, developer documentation is something that can be improved. Although the current documentation is very good relative to a lot of other services I’ve seen, additional improvements could be made. 

Perhaps adding Swagger or documentation built into nodes would be helpful. Also, more robust examples for client libraries are always helpful. Is there a Slack group that our developers can join if they have questions for the core FusionAuth team? If not, creating a feedback channel would be incredibly useful.

> FusionAuth solves a problem for Unio that many organizations often face: how do you handle user accounts, authentication, authorization, and password management? 

**Dan:** "Perhaps adding Swagger or documentation built into nodes would be helpful" I don't understand what you mean. Can you explain further?

**Jason:** Sure, I mean adding in Swagger documentation available from the installed instance would be helpful. 

If I install FusionAuth 1.24 on `192.0.0.1`, would be great if I could go to `192.0.0.1/swagger` and see the APIs that are present on that instance. 

Installing 1.25 on `192.0.0.2` and then going to `192.0.0.2/swagger` would show me a completely different Swagger definition since the version is different but allows me to see right away which APIs are present on my particular version without wading through documentation. 

**Dan:** We do have a [community forum](https://fusionauth.io/community/forum/) which is fairly active and we also have an [active github issues tracker](https://github.com/fusionauth/fusionauth-issues/issues) for bugs and feature requests. We love feedback from our community. 

-------

We love sharing community stories. You can check out [Unio's website](https://getunio.com/) if you'd like to learn more about Unio.
