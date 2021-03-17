---
layout: blog-post
title: Video conferencing company DolphinVC chose FusionAuth for cloud independence
description: DolphinVC chose FusionAuth because it saved them time and they could run it wherever they wanted. They didn't want to be restricted to a single cloud provider.
author: Dan Moore
image: blogs/dolphinvc-fusionauth/video-conferencing-company-dolphinvc-chose-fusionauth-for-cloud-independence-header-image.png
category: blog
tags: topic-community-story
excerpt_separator: "<!--more-->"
---

Lohith Venkatesh is a FusionAuth community member. He chatted with us over email about how he and his team are using FusionAuth to meet their auth needs. 

<!--more-->

*This interview has been lightly edited for clarity and length.*

-------

**Dan:** Tell me a bit about your work as a software developer.

**Lohith:** Our work involves designing and developing services for meeting management and user management. We are a video conferencing based product called DolphinVC. 

My daily work involves implementing new requirements or solving issues for our backend services. 

> I choose FusionAuth over others because I can run the FusionAuth service on my own private data center.

**Dan:** How do you use FusionAuth? OAuth? User management? Social sign-on? Something else?

**Lohith:** We use FusionAuth for user management, social sign-on and for authentication logic.

**Dan:** What problems did we solve for you? And how were you solving them before FusionAuth?

**Lohith:** When we started out, we are looking for an auth service similar to Amazon Cognito which would manage users and also handle many auth mechanisms. But we didn't want to constrain ourselves to an AWS service. 

We were also looking for a service which would provide us all the APIs that we want, so that if we need to implement any custom features on top of the auth service, we would be able to do so.

> You have saved [us] at least a month or more [of time]...

**Dan:** Have you ended up building any custom features on top of the FusionAuth API? Would love to hear any examples of ways that you extended the software.

**Lohith:** We have built phone one time password (OTP) authentication, for example. 

Users can sign up or sign in by entering the OTP which they were sent. We also built some different types of email auth flows. 

**Dan:** Why did you choose FusionAuth over the competition?

**Lohith:** I chose FusionAuth over other options because I can run the FusionAuth service in my own private data center. 

Other reasons include the documentation and the APIs provided by FusionAuth to build custom features on top of FusionAuth if needed.

**Dan:** Did you want to run in your own data center for security, data sovereignty or price reasons? (Or all 3?)

**Lohith:** Mostly for price and deployment reasons. We didn't want ourselves restricted to one cloud provider. 

**Dan:** How much time and money would you say FusionAuth has saved you?

**Lohith:** You have saved us at least a month or more because implementing the auth service with proper security at the database level would require a lot of design decisions and iterations of the service.

> We didn't want ourselves restricted to one cloud provider. 

**Dan:** How do you run FusionAuth (k8s, standalone tomcat server, behind a proxy, etc)?

**Lohith:** We run FusionAuth on a Kubernetes cluster. 

**Dan:** Any general feedback/areas to improve?

**Lohith:** Complete implementation of [a multi-tenant role](https://github.com/FusionAuth/fusionauth-issues/issues/91) for the FusionAuth admin UI would be so great. 

-------

We love sharing community stories. You can check out [DolphinVC's website](https://meet.dolphinvc.com/) if you'd like to learn more about the product and team.
