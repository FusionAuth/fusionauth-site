---
layout: blog-post
title: Powered By Coffee helps WordPress scale with FusionAuth
description: Powered By Coffee is an agency that specializes in WordPress and helps organizations such as media companies with their subscription and membership models.
author: Dan Moore
image: blogs/wordpress-powered-by-coffee-fusionauth/powered-by-coffee-helps-wordpress-scale-with-fusionauth-header-image.png
category: blog
tags: topic-community-story
excerpt_separator: "<!--more-->"
---

Stewart Ritchie is a FusionAuth partner as well as founder and managing director at the agency Powered By Coffee. He chatted with us over email about how he and his team are using FusionAuth to meet the auth needs of their clients. 

<!--more-->

*This interview has been lightly edited for clarity and length.*

-------

**Dan:** Tell me a bit about your work at Powered By Coffee. What kind of clients do you typically work with?

**Stewart:** We're a WordPress development agency that specialises in the media industry. We help media companies, organisations that rely on memberships and subscriptions, and indie startups that create mass content.

> We've continued to use and recommend FusionAuth because we find it very pleasant to use as developers.  

**Dan:** How do you use FusionAuth? OAuth? User management? Social sign-on? Something else?

**Stewart:** We use FusionAuth to:

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

By using FusionAuth to handle User authentication and access control we can bypass the WordPress User system and handle Authentication entirely on the client side. That means we can be much more aggressive with our caching, improving overall performance. 

Similarly, these users don't need to have logins to WordPress anymore, hugely improving overall performance as we decrease the size of a WordPress user table from hundreds of thousands of users to the few hundred users who are authors and editors.

> I think the cost savings purely from helping optimise caching and performance on high traffic WordPress sites, drastically reducing the number of servers needed to run a performant site, is massive.

**Dan:** Why did you choose FusionAuth over the competition?

**Stewart:** In our case we were introduced to FusionAuth by a client who had already decided to use it.

We've continued to use and recommend FusionAuth because we find it very pleasant to use as developers.  There are lots of options for API access, different ways we can integrate FusionAuth in our projects and support is always there when we need a little extra help.

It's great to see the product continue to evolve and the roadmap be published. It gives us more options to support our own clients.

**Dan:** How much time and money would you say FusionAuth has saved you and your clients?

**Stewart:** Impossible to say I'm afraid. I think the cost savings purely from helping optimise caching and performance on high traffic WordPress sites, drastically reducing the number of servers needed to run a performant site, is massive.

Second, the reduction in developer time and having simple, straightforward API's to share user profile and access information in multiple accessory applications is beyond calculation.

> WordPress is a great CMS but it's a terrible user manager.

**Dan:** How do you run FusionAuth (k8s, standalone tomcat server, behind a proxy, etc)?

**Stewart:** We run a couple of different FusionAuth setups; we have a managed FusionAuth Cloud instance for production work. We also have FusionAuth running in a Docker Container in our development network. We've also run FusionAuth as a service in a Docker Compose project.

**Dan:** Any general feedback/areas to improve?

**Stewart:** You know, I'd love to be able to trigger a database backup myself on the enterprise support plan. _[Editor's note: this is on the roadmap.]_

-------

We love sharing community stories. You can check out [Powered By Coffee](https://poweredbycoffee.co.uk/) if you'd like to learn more. 

