---
layout: blog-post
title: ZanoCloud helps companies make the most of the cloud with FusionAuth
description: ZanoCloud helps companies with a variety of problems and reaches for FusionAuth for their auth needs.
author: Dan Moore
image: blogs/zanocloud.png
category: community-story
tags: topic-community-story community-story cloud
excerpt_separator: "<!--more-->"
---

Dmitry Zanozin is a FusionAuth community member and Founder and CEO at ZanoCloud. He chatted with us over email about how he and his team are using FusionAuth to meet their auth needs. 

<!--more-->

*This interview has been lightly edited for clarity and length.*

-------

**Dan:** Can you tell me a bit about ZanoCloud? What is the company's mission?

**Dmitry:** We’re a technology consulting company that brings cloud infrastructure and big data processing back down to earth for people running businesses.

It’s our mission to make it more accessible to everyone. Our team of experts have a wealth of experience, and we provide the best solution for our clients, no matter what their specific needs may be. So, they can focus on running their businesses, not managing their technology.

**Dan:** Tell me about your work as a founder at ZanoCloud.

**Dmitry:** I was working as a technology consultant and saw first-hand the frustration people felt with the complexity of cloud infrastructure and its costs. I couldn't find the same services and decided to create my own company. That's how ZanoCloud was born. We're a technology consulting company that helps businesses make the most of the cloud. We work with all the major cloud providers, including Amazon Web Services and Google Cloud Platform. We help companies save money on their infrastructure costs, and we also help them to simplify their architecture and make it more manageable. In addition, the company also offers a wide range of technology services, including design of big data pipelines and software development.

We're now one of the leading technology providers in the space, and our success is built on making life easier for our customers.

> Self-hosted deployments are convenient for projects where you want everything to be managed in one environment as well as for dev experiments.

**Dan:** How do you use FusionAuth? OAuth? User management? Social sign-on? Something else?

**Dmitry:** We started our first experiments with FusionAuth with version 1.11 three years ago.

Today we use OAuth, Single Sign-On and JWT for Web, Mobile and Desktop applications. FusionAuth works as the main user DB.

Some clients opted in to store all user metadata in FusionAuth through custom attributes.

Most of the projects are small and medium-sized, early-stage startups, with a user base from hundreds to a few thousands of users.

The largest deployment at the current time is for ~9000 users. The projects use either the web-based code grant flow or implement login/token refresh/logout through the login API server-side.
 
**Dan:** What problems did we solve for you?

**Dmitry:** A single auth server for own apps and 3rd party services integrated together (e.g. chats, forums).

Self-hosted deployments are convenient for projects where you want everything to be managed in one environment as well as for dev experiments. And it’s very attractive for early-stage startups when they need to reduce cost of tools and services but are still able to switch to paid plans later if they need more features and support.

**Dan:** How were you solving them before FusionAuth?

**Dmitry:** We used built-in authentication layers of different frameworks (Spring, Dropwizard, Wordpress) or managed auth services.

Built-in authentication layers worked for individual apps but it was hard to integrate them with other applications for single sign-on. Also it didn’t work well for microservices.

Managed auth services handled single sign-on pretty good but it was not always easy to migrate a user base to them. Also, some projects had requirements of local development and deployment without dependencies on external services.

There are some great options on the market that allow companies to overcome the limitations and fit the requirements, but we prefer using FusionAuth for some of our projects.  

> ... it’s very attractive for early-stage startups when they need to reduce cost of tools and services but are still able to switch to paid plans later if they need more features and support.

**Dan:** Why did you choose FusionAuth over the alternatives?

**Dmitry:** We choose FusionAuth because of its installation and configuration simplicity. Self-hosted. Available lambdas and event management.

Seamless user migration from other systems (e.g. we wrote a simple FusionAuth plugin to import WordPress user credentials).

FusionAuth used the same tech stack as many of our projects at the time: Java, Freemarker, and JavaScript.

If there are any questions it’s pretty easy to find information in the FusionAuth documentation. FusionAuth has a great community/forum where you can get support. You can also contact the developers with  feature requests or bug reports and get timely responses.

**Dan:** How much time and money would you say FusionAuth has saved you?

**Dmitry:** It’s hard to estimate, it was different for every project. But I would say, hundreds/thousands of dollars of service cost for the initial project stages compared to managed services.

Time-wise, it saved several weeks of work and provided a better user experience for user base migration to FusionAuth.

> We choose FusionAuth because of its installation and configuration simplicity.

**Dan:** How do you run FusionAuth (kubernetes, standalone web app, behind a proxy, etc)?

**Dmitry:** We use only container-based deployments with Kubernetes or standalone Docker.

The server always runs behind a proxy: nginx, AWS ALB, and GCP LB.

**Dan:** Any general feedback/areas to improve?

**Dmitry:** We are pretty happy with the standard functionality FusionAuth provides, as well as the available premium features for those who need them.

Most of the questions we had were resolved quickly enough like recently with added support for ARM CPUs used now on cloud VMs and in the local development.

-------

We love sharing community stories. You can check out [ZanoCloud's website](https://zanocloud.com/) if you'd like to learn more. 
