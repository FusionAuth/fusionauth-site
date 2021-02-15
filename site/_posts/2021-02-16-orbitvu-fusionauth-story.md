---
layout: blog-post
title: Orbitvu chose FusionAuth for architectural flexibility, great support, and customizability
description: Orbitvu, a product photography company, gets more flexibility and value with FusionAuth.
author: Dan Moore
image: blogs/orbitvu-fusionauth-story/orbitvu-chose-fusionauth-for-architectural-flexibility-great-support-and-customizability-header-image.png
category: blog
tags: topic-community-story
excerpt_separator: "<!--more-->"
---

Maciej Wisniowski is a FusionAuth community member and team leader in the web development department at Orbitvu, where he is building innovative eCommerce imaging solutions. He chatted with us over email about how he and his team are using FusionAuth to meet their auth needs. 

<!--more-->

*This interview has been lightly edited for clarity and length.*

-------

**Dan:** Tell me a bit about your work as a developer.

**Maciej:** I'm a full-stack web developer working as a Team Leader in Orbitvu, a company that builds innovative imaging solutions for the world of eCommerce. 

Orbitvu provides both software and hardware solutions for automated product photography which means our client gets an end-to-end solution that starts with our hardware and desktop software with features like automatic background removal and then is able to effortlessly publish packshots and 360-degree interactive product presentations on the web. The latter part is my responsibility.

**Dan:** What a cool idea! Do you have a link to a sample (or real) interactive product presentation? 

**Maciej:** Of course, the typical 360-degree presentation made with our solutions might be similar to this presentation of the [miter saw](https://orbitvu.co/share/uEnZJgngCNobquxATcbAyf/17144/orbittour/view). We have a number of products targeted to different industries and/or product sizes. For example, our [Alphashot Micro](https://orbitvu.com/product/alphashot-micro/) is made for photography of smaller objects, eg. jewelry or watches. For the bigger objects, also human models, we have other solutions like our newest product [Fashion Studio](https://orbitvu.com/product/fashion-studio/) that is great not just for packshots but also for the videos.

> [Choosing FusionAuth] opened a whole bunch of new possibilities in terms of possible architectural solutions and technologies we were able to use. 

**Dan:** How do you use FusionAuth? OAuth? User management? Social sign-on? Something else?

**Maciej:** We use FusionAuth as an OAuth2/OIDC/SAML server (with integrated Google sign-on) to provide login and SSO to our web applications and supplementary systems like the site with our manuals. 

We are also starting to use FusionAuth internally. Orbitvu is not just a software development company but we also design and manufacture our automated photo studios. Because of that, we have a lot of different departments that utilize a number of internal systems like ERP, project management software, or Helpdesk. All of these can also benefit from FusionAuth integration.

Regarding the user management, this part remains in our own application due to the fact we already had it done before we switched to FusionAuth. We're integrating with FusionAuth using its API and it works flawlessly.

**Dan:** What benefits, if any, have you seen from having one view of your customer across multiple applications?

**Maciej:** The obvious benefit of having an SSO solution is that our clients can seamlessly switch between our applications without the need to log in multiple times or even realizing they're now in a different system. Another part of the story is that we, as Orbitvu, can easily manage the user accounts in a central way. What FusionAuth brings here (when compared to our old solution) is the support for multiple protocols that make it possible to integrate more applications more easily and securely. Another thing I like very much with FusionAuth is the built-in logout functionality.

> After the initial setup, there is not much to do with FusionAuth except upgrading from time to time, so this way it is way more cost-effective than the competing solutions that are sometimes extremely expensive when it comes to a bigger number of users.

**Dan:** What internal systems have you hooked up to FusionAuth? Were there any challenges doing so?

**Maciej:** We've integrated our helpdesk system (Freshdesk) and our manuals site (Screensteps). This was rather easy due to the standards provided by FusionAuth. We've also tested the integration with our ERP system which is an open-source solution Odoo. The proof-of-concept implementation we did work with FusionAuth using the OAuth2 protocol but before going further we need to resolve some other non-technical issues.

**Dan:** What problems did we solve for you? And how were you solving them before FusionAuth?

**Maciej:** Before Orbitvu has adopted FusionAuth we've used an SSO solution based on CAS (Central Authentication Service). It worked well for a long time and mostly for the traditional, monolithic web applications but in the era of SPA, React Native, microservices, and Kubernetes it became obvious that the technological debt regarding our Auth system is too big. This is where FusionAuth comes in. It has brought us solutions matching the newest trends like OAuth2 + OIDC or 2FA and has opened a whole bunch of new possibilities in terms of possible architectural solutions and technologies we were able to use. At the same time, it became possible to integrate our system with other providers thanks to the OAuth2 or SAML.

**Dan:** Why did you choose FusionAuth over the competition?

**Maciej:** We've reviewed multiple solutions like Auth0, Okta, AWS Cognito, and MiniOrange but we decided to use FusionAuth due to its flexibility, great documentation, and competitive pricing. I'd say that flexibility (also understood as customizability) of the solution is where FusionAuth stands out. It was important to us that we can use FusionAuth both on-premise (including docker and Kubernetes) as well as a hosted, hassle-free Saas version. Thanks to the docker images and FusionAuth's Kickstart system we could easily integrate FusionAuth into our development process to build reproducible development environments.

Another thing about flexibility, where the competition is far behind, is the possibility to customize the look and feel of almost every aspect of the FusionAuth using themes. By the way, personally I don't like FreeMarker's syntax but it does the job! It was critical to us to be able to have our own layout applied to login pages and emails.

One more important factor that we considered was the way to migrate from our existing solution to the new one. Again, FusionAuth's way of doing this fitted our needs perfectly and made it possible to migrate user password hashes from the Django-based system to FusionAuth flawlessly (initially we've created our own password encryptor to handle this but turned out the built ones were enough).

Last but not least is that at Orbitvu we love open source and we use it a lot. What we do like in FusionAuth is that, while not open source, it feels like an open source project due to its development style with Github's issue tracker.

> We’re integrating with FusionAuth using its API and it works flawlessly.

**Dan:** I see the Orbitvu website supports multiple languages; was the ability to localize FusionAuth important as well?

**Maciej:** Definitely, it was one of the must-have features when we were looking for our auth solution.

**Dan:** How much time and money would you say FusionAuth has saved you?

**Maciej:** Given that FusionAuth is the only solution that is so complete and can be used on-premise without extra costs I'm pretty sure it has saved a lot of money for us. We use FusionAuth on our own hosting and we're managing it on our own so the costs are the hosting cost plus our working hours' cost. After the initial setup, there is not much to do with FusionAuth except upgrading from time to time, so this way it is way more cost-effective than the competing solutions that are sometimes extremely expensive when it comes to a bigger number of users.

**Dan:** How do you run FusionAuth (k8s, standalone tomcat server, behind a proxy, etc)?

**Maciej:** We use the standalone tomcat server. Our production instances (and staging too as these are closely following production) are built to be highly available so there are two FusionAuth instances in a cluster, running behind a load balancer (Nova ADC) and using ElasticSearch cluster (3 nodes) with Postgresql database (managed, the highly available solution from the hosting provider).

> Last but not least is that at Orbitvu we love open source and we use it a lot. What we do like in FusionAuth is that, while not open source, it feels like an open source project due to its development style with Github’s issue tracker.

**Dan:** Any general feedback/areas to improve?

**Maciej:** I'm not sure if there is anything to improve... maybe you can release less often so that I can stop upgrading my instances every week - just kidding, but the frequency of FusionAuth releases is amazing.

One thing I'd like to emphasize is the support you have. I remember when I started using FusionAuth and the Forum section was empty. I don't know if it was due to some kind of forum migration or it has really started from scratch but after few weeks I've noticed with amazement how fast the new topics appear, how popular the platform is, and how good support you have (as said before, like an open source project).

-------

We love sharing community stories. You can check out [Orbitvu's website](https://orbitvu.com/) if you'd like to learn more. 
