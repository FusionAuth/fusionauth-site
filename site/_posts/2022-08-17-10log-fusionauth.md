---
layout: blog-post
title: 10log integrates FusionAuth into their architectural acoustics applications
description: 10log integrates FusionAuth running on a Digital Ocean droplet into their architectural acoustics web and desktop applications
author: Dan Moore
image: blogs/10log-integrates-fusionauth/10log-integrates-fusionauth.png
category: community-story
tags: topic-community-story community-story javascript
excerpt_separator: "<!--more-->"
---

Ákos Komuves is a FusionAuth community member and team member at 10log. He chatted with us over email about how he and the 10log team are using FusionAuth to meet their auth needs. 

<!--more-->

*This interview has been lightly edited for clarity and length.*

-------

**Dan:** Can you tell me a bit about 10log? What is the company's mission?

**Ákos:** 10log is building a suite of web-based technical and project management tools for the architectural acoustics & noise control industry. These tools are designed to speed up the learning curve for new acousticians and increase efficiency and design quality for senior acousticians. 10log also sponsors research to improve the knowledge base of acoustics and the quality of these tools.

**Dan:** That sounds really cool. What would you say is the biggest challenge of this project? Is it UX? The math that models the acoustics? Something else?

**Ákos:** The UX is challenging because in acoustics there are tons of data (mostly numbers) you have to represent, preferably in a table (Excel-like) format.

We also do lots of custom components, charts, and more. Here's one of [our public calculators](https://www.10log.com/public/rt). Here's [another one](https://www.10log.com/public/raytracer). You can see this [last one in action](https://www.youtube.com/watch?v=cBA91hA2NEw).

**Dan:** Tell me about your work on this project.

**Ákos:** I work as a contractor with the owner of 10log.io and 10log.com and have for more than 7 years now.

> With FusionAuth, we do not need to build out a user management/login system. 

**Dan:** How do you use FusionAuth? OAuth? User management? Social sign-on? Something else?

**Ákos:**  We're using the OAuth functionality of FusionAuth with the help of its JavaScript library.

**Dan:** Does this mean that you are having people log in to various applications all managed by FusionAuth? Or are you protecting APIs? Or both? 

**Ákos:** Both, because we also have a desktop application.

**Dan:** What problems did we solve for you?

**Ákos:** With FusionAuth, we do not need to build out a user management/login system. 

**Dan:** How were you solving them before FusionAuth?

**Ákos:** For 10log.com (the predecessor of 10log.io that's in use to this day) we used a boilerplate project that had user-management implemented. 

**Dan:** Why did you choose FusionAuth over the alternatives?

**Ákos:** Because of the ability to be self-hosted and own our data.

**Dan:** That's great to hear. Have you found self-hosting FusionAuth to be difficult or is it more set-and-forget?

**Ákos:** It was pretty straightforward to set it up - the only issue we had is that it wasn't working with 1GB of memory. That's the size of the cheapest droplet on DigitalOcean where our apps are hosted.
I don't recall now but I believe I expected it to work with 1GB of memory after reading the requirements. After upgrading our droplet to a different tier (2GB) it worked without any problem. 

> [10log chose FusionAuth because] of the ability to be self-hosted and own our data.

**Dan:** How often do you upgrade FusionAuth?

**Ákos:** Every time there's an upgrade. 

**Dan:** How much time and money would you say FusionAuth has saved you?

**Ákos:** I'm not sure exactly, a couple of thousands of dollars so far.

**Dan:** How do you run FusionAuth (kubernetes, standalone server, behind a proxy, etc)?

**Ákos:** In a DigitalOcean droplet.

**Dan:** How many logins per minute are you expecting?

**Ákos:** Not too many. This is a B2B application where engineers log in at the beginning of the work day (or week) and work on a project. On 10log.com, the older application where we manage the login ourselves, engineers expected to log in and stay logged in for weeks.

**Dan:** How many users are you planning to support with this deployment?

**Ákos:** A couple of hundred users. Although we haven't set up anything for tenants yet, I don't know if that's going to increase the memory usage. The current deployment uses 63% of 2GB.

**Dan:** Any general feedback/areas to improve?

**Ákos:** I think your public repositories on GitHub could use some love. There are some long-standing tickets for example in [the typescript client](https://github.com/FusionAuth/fusionauth-typescript-client).

**Dan:** Thanks for your feedback!

-------

We love sharing community stories. You can check out [Ákos' site](http://akoskm.com/) or [10logs's website](https://10log.io/) if you'd like to learn more. 
