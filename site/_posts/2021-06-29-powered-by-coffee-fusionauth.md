---
layout: blog-post
title: Powered By Coffee helps WordPress scale with FusionAuth
description: Powered By Coffee is an agency specialising in the media industry and helps media companies, organisations who rely on memberships and subscriptions and indie startups who create mass content.
author: Dan Moore
image: blogs/become-education-story/become-education-chooses-fusionauth-for-idaas.png
category: blog
tags: topic-community-story
excerpt_separator: "<!--more-->"
---

Stewart Ritchie is a FusionAuth partner and founder and managing director at Powered By Coffee. He chatted with us over email about how he and his team are using FusionAuth to meet the auth needs of their clients. 

<!--more-->

*This interview has been lightly edited for clarity and length.*

-------

**Dan:** Tell me a bit about your work at Powered By Coffee. What kind of clients do you typically work with?

**Stewart:** We're a WordPress development agency and we specialise in the media industry, helping media companies, organisations who rely on memberships and subscriptions and indie startups who create mass content.

> We've continued to use and recommend Fusion Auth because we find it very pleasant to use as developers.  

**Dan:** How do you use FusionAuth? OAuth? User management? Social sign-on? Something else?

**Stewart:** We use Fusion Auth to:

* Centralise user data and identity so profiles can be used across products and services.
* Manage access to content on membership sites.
* Provide all the user infrastructure for a site, out of the box.
* Give users a central place to manage their preferences.
* Control access to the WordPress admin panel and setting user access levels.

To do this, we used these features:
* The FusionAuth REST API
* FusionAuth's OAuth support
* Social Login
* Migration and importing of user data

**Dan:** What problems did we solve for you? And how were you solving them before FusionAuth?

**Stewart:** FusionAuth solved a problem of scale and access for us. WordPress is a great CMS but it's a terrible user manager.

By using FusionAuth to handle User authentication and access control we can bypass the WordPress User system and handle Authentication entirely client side. That means we can be much more aggressive with our caching, improving overall performance. 

Similarly, these users don't need to have logins to WordPress anymore, hugely improving overall performance as we take a user table down from hundreds of thousands of users, down to a few hundred authors and editors.

> I think the cost savings purely from helping optimise caching and performance on high traffic WordPress sites, massively reducing the number of servers needed to run a performant site, is massive.

**Dan:** Why did you choose FusionAuth over the competition?

**Stewart:** In our case we were introduced to Fusion Auth by a client who had already decided to use it.

We've continued to use and recommend Fusion Auth because we find it very pleasant to use as developers.  There are lots of options for API access, different ways we can integrate FA in our projects and support is always there when we need a little extra help.

It's great to see the product continue to evolve and the road map be published. It gives us more options to support our own clients.

**Dan:** How much time and money would you say FusionAuth has saved you and your clients?

**Stewart:** Impossible to say I'm afraid. I think the cost savings purely from helping optimise caching and performance on high traffic WordPress sites, massively reducing the number of servers needed to run a performant site, is massive.

Second, the reduction in developer time, having simple, straightforward API's to share that user profile and access information in multiple accessory applications is beyond calculation.

> WordPress is a great CMS but it's a terrible user manager.

**Dan:** How do you run FusionAuth (k8s, standalone tomcat server, behind a proxy, etc)?

**Stewart:** We run a couple of different Fusion Auth setups; we have a managed Fusion Auth instance that Fusion Auth lookafter for production work and we also have FusionAuth running as a Docker Container in our Development Network. We've also run FusionAuth as a service in a Docker Compose driven project.

**Dan:** Any general feedback/areas to improve?

**Stewart:** You know, I'd love to be able to trigger a backup myself on the enterprise support plan.

-------

We love sharing community stories. You can check out [Powered By Coffee](https://poweredbycoffee.co.uk/) if you'd like to learn more. 

