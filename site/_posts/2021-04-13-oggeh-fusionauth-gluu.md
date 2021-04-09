---
layout: blog-post
title: OGGEH Cloud Computing switched to FusionAuth from Gluu
description: OGGEH Cloud Computing has a cloud computing platform that empowers front end developers. They chose FusionAuth and saved 40% because it requires less CPU and memory resources than Gluu.
author: Dan Moore
image: blogs/oggeh-fusionauth-gluu/oggeh-cloud-computing-switched-to-fusionauth-from-gluu.png
category: blog
tags: topic-community-story topic-upgrade-gluu
excerpt_separator: "<!--more-->"
---

Ahmed Abbas is a FusionAuth community member and CEO of OGGEH Cloud Computing, a backend as a service provider which helps front end devs build awesome applications. He chatted with us over email about how he and his team are using FusionAuth to meet their auth needs. 

<!--more-->

*This interview has been lightly edited for clarity and length.*

-------

**Dan:** Tell me a bit about your work as a developer and what OGGEH Cloud Computing is working on?

**Ahmed:** I consider myself a front end Swiss Army Knife. I started as a UX Designer 16 years ago. My developer journey started with ActionScript producing rich internet apps in Flash Player. The turning point came after the famous letter by Steve Jobs, which was officially the death certificate of the Flash Player. Right then, I switched to JavaScript.

OGGEH Cloud Computing is the only qualified Progressive Web Application (PWA) Agency by Google Developers in Africa and the MENA region. As well as the only Google Cloud Technology Partner in the Arabian countries! Actual users/customers are always looking for a simple way to manage their content at the backend. Something that does not involve writing mysterious markup like HTML and/or weird shortcodes as most plugins do (for WordPress, Joomla, Drupal, and others). 

OGGEH Cloud Platform takes care of complex backend/infrastructure logic for security and scalability. 

This allows frontend designers/developers to build their apps without requiring them to build an API and/or server-side services. Additionally, the platform provides a ready-made Cloud CMS that does pure content management. Not a website builder and/or a design tool.

We pick our early adopters carefully. Large organizations with real traffic on PWA(s). Many members use OGGEH Cloud Platform, such as [Omar Effendi stores](https://shop.omareffendi.com.eg/?lang=en), one of the oldest and largest retailers in Egypt (founded in 1856).

I would say that OGGEH Cloud Computing is a business built by nerds seeking out other nerds. Surviving on cloud usage subscriptions. (We might expose our platform as an open-source project in the near future.)

> [FusionAuth] worked like a charm from the first attempt. That's something that doesn't usually happen when trying new things. 

**Dan:** Tell me more about the Cloud CMS. Does it deliver JSON data which can then be used by a variety of clients (mobile, webapp, etc) in whatever way makes sense?

**Ahmed:** Yes, that's exactly what it does. There's a [single-page](https://docs.oggeh.com) that covers our API reference, developer access, service architecture, and more. We have [a short video](https://dev.oggeh.com/) that presents OGGEH Cloud Platform for the developer community as well.

**Dan:** How do you use FusionAuth? OAuth? User management? Social sign-on? Something else?

**Ahmed:** As we speak, FusionAuth manages and authenticates our users to use OGGEH Cloud Platform tools (Cloud Apps, Cloud CMS, Cloud Stats and others). As well as a separate tenant/customer for each cloud app that requires its user authentication at the frontend (like e-commerce apps).

We prefer OpenID Connect and OAuth 2.0 for the implementation. At the moment, we use both Authorization Code and Implicit flows for the authentication of our platform tools, and only Implicit flow on cloud apps (since they're progressive web apps).

Securing OGGEH Cloud Platform customers is one of our main focuses, so we do not allow any special markup and/or scripts anyway. As I mentioned earlier, we introduce pure content management only. This means there's no easy way to inject code using our platform.

**Dan:** Are you creating the tenants for each customer via the API or in the UX? Is the main reason for that separation because of the look and feel differences or are there other reasons to have a tenant for each cloud app?

**Ahmed:** We prefer the API since it's part of automated builds. It's not because of the look and feel of FusionAuth (that's completely fine). It's more about abstracting complex configurations when creating our Cloud Apps. We aim to provide some sort of bare minimum UI for our customers to stick to pure content management, which includes user management. We're providing technical support anyway.

**Dan:** What problems did we solve for you? And how were you solving them before FusionAuth?

**Ahmed:** Two words: customization, and scalability! FusionAuth provides a very comforting way to organize tenants, applications, identify providers, email templates, and themes. In addition to the fact that the footprint is remarkably small and does not require great CPU or memory resources to operate. Which fits perfectly into our scalable stack.

Earlier, we had to replicate the authentication server for each customer (Cloud App) just to customize the login theme and email templates. We also had to use separate servers on each due to the high resource requirements to start and operate. Scaling servers is far more complex and comes with a greater financial cost.

> Literarily 40% of our expenses [are] just gone [after adopting FusionAuth]. 

**Dan:** Do your customers have the ability to customize the themes and email templates or is that something you take care of for them?

**Ahmed:** That depends, in most cases, we do it ourselves for non-technical customers. We plan to extend our API services for those who have a technical background and the ability to use our platform tools (i.e. frontend developers). So that they can inject those themselves.

**Dan:** Why did you choose FusionAuth over the competition?

**Ahmed:** Gluu requires 2xCPU and 8G Memory to start and operate properly. I find that remarkably unnecessary even if we have thousands of users. Additionally, there's no notion of having multiple tenants in Gluu. Same for themes and email templates. That wasn't an issue as long as we used it to authenticate our own users only, but later, we had to add user authentication to other applications (especially e-commerce). It was almost a nightmare. Replicating the whole server was the only option!

There's also one important note I must add here. Gluu might break due to expired JKS files for SCIM. These Java Keystore files are generated upon installation and [expire after one year](https://gluu.org/docs/gluu-server/4.0/operation/replace-expired-jks-scim/). Imagine how we felt after exactly one year of the installation to find a broken Gluu and spending many hours digging up this annoying fact!

To be honest, that was the moment where I decided to get rid of Gluu. There were many other alternatives. FusionAuth caught my attention and just stuck there. I used to say that Auth0 has the best documentation and comprehensive service. But all that changed dramatically after I explored FusionAuth. It worked like a charm from the first attempt. That's something that doesn't usually happen when trying new things. I wish to thank you for that.

**Dan:** How much time and money would you say FusionAuth has saved you?

**Ahmed:** A tremendous amount! Literarily 40% of our expenses just gone. No more unnecessary high resources for Gluu. FusionAuth works just fine on our auto-scaled stack.

> [FusionAuth's] footprint is remarkably small and does not require great CPU or memory resources to operate.

**Dan:** How do you run FusionAuth (k8s, standalone tomcat server, behind a proxy, etc)?

**Ahmed:** K8s. We do the same for the rest of OGGEH Cloud Platform tools, which includes a variety of auto-scaled micro-services. Now FusionAuth is one of those. I did not exactly pick the docker version provided by FusionAuth docs. I had to modify the official Dockerfile from FusionAuth/fusionauth-containers repository for auto-installing a custom plugin. One that handles LDAP Salted SHA512 passwords (imported from Gluu). 

We need to have a stateless container. I'm not sure if I can auto-install a custom plugin using a kickstart file by FusionAuth. _[ed note: This is not currently possible, but there's an [open issue](https://github.com/FusionAuth/fusionauth-issues/issues/1096).]_

**Dan:** Any general feedback/areas to improve?

**Ahmed:** Would love to be able to change the branding of the default login screen of FusionAuth from the very first setup/kickstart. Even though we use a custom tenant for our users, they still see the FusionAuth admin UI screen sometimes. Someone might just hit the hostname of our authentication server directly without any request parameters that define a tenant (i.e. `sso.oggeh.com`). 

They will not be able to login using their credentials of course, and I do not mind that the FusionAuth logo sits there at the bottom and the favicon. But that login screen has this "help" link at the top-right corner which links to the FusionAuth docs and I prefer to show the OGGEH logo instead. It would be nice if we can use a custom stylesheet as well. _[ed note: Review [this issue](https://github.com/FusionAuth/fusionauth-issues/issues/994) for more on such functionality, which is coming soon in a paid edition.]_

-------

We love sharing community stories. You can check out [OGGEH Cloud Computing's website](https://oggeh.com/) if you'd like to learn more. 
