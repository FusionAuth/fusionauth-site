---
layout: blog-post
title: ClearSpend chose FusionAuth because of self-hosting and clear APIs
description: ClearSpend, a spend-control and expense-management solution, uses FusionAuth for all their user management needs.
author: Dan Moore
image: blogs/clearspend-fusionauth/clearsend.png
category: community-story
tags: topic-community-story community-story java react-native
excerpt_separator: "<!--more-->"
---

Stephen Saucier is a FusionAuth community member and Head of UX Development at ClearSpend. He chatted with us over email about how he and his team are using FusionAuth to meet their auth needs. 

<!--more-->

*This interview has been lightly edited for clarity and length.*

-------

**Dan:** Can you tell me a bit about ClearSpend? What is the company's mission?

**Stephen:** We offer a completely free spend-control and expense-management solution built specifically with and for small businesses and their bookkeepers. That means no more expense reports, ever, and every employee can have their own virtual and physical spend cards, with as few or many limitations on their usage as their managers want.

**Dan:** How have you found the reception? It sounds like an absolutely awesome product, as someone with an outstanding expense report he needs to file.

**Stephen:** We based our whole business on interviews with over a hundred CEOs and bookkeepers, and after they told us what their 'problems' were and we introduced our solution, they were very excited about it.

Since our launch, we've had a great reception from our customers, and we feel like we have only to get the word out now!

> We use FusionAuth in both mobile (React Native) and web (SolidJS, Java) clients.

**Dan:** Tell me about your work as Head of UX Development at ClearSpend.

**Stephen:** Since we're a startup, I wear many hats, including running our front-end development for mobile & web and all quality assurance.

**Dan:** How do you use FusionAuth? OAuth? User management? Social sign-on? Something else?

**Stephen:** We do all user management in FusionAuth, with OAuth and MFA (via Twilio SMS). We don't offer social sign-on.

All of our user management UI is custom-built on top of the FusionAuth APIs.

We use FusionAuth in both mobile (React Native) and web (SolidJS, Java) clients.

**Dan:** When you say "user management" who is doing the management? Is it the ClearSpend admin team, the managers who are allocating the spend cards, or both?

**Stephen:** I was referring mainly to user creation, login, role handling, and password/MFA management.

The managers who allocate the spend cards do all of that, along with the employees themselves.

We keep the ClearSpend team out of our clients' workspace.

> Several of us had used FusionAuth at a previous company as well and were pleased with it.

**Dan:** How did you model companies? Did you do that in FusionAuth with, say, groups, or did you keep those entities in your database?

**Stephen:** We keep those in our database. That allows for performant database sharding and also makes it easy for bookkeepers who work with multiple companies to switch between them when doing their books.

**Dan:** What problems did we solve for you?

**Stephen:** We needed an identity provider that was easy to use, well-documented, cost-effective, and that would scale well with our business.

Several of us had used FusionAuth at a previous company as well and were pleased with it.

**Dan:** How were you solving them before FusionAuth?

**Stephen:** We started with FusionAuth from the get-go.

> We needed an identity provider that was easy to use, well-documented, cost-effective, and that would scale well with our business.

**Dan:** Why did you choose FusionAuth over the alternatives?

**Stephen:** A few reasons:

1. The basic version is free and easy for developers to install locally.
2. It's easy to self-host instances in multiple environments.
3. Its APIs are straightforward and do everything we need.
4. It's portable -- not tied to a certain stack or host.

**Dan:** How much time and money would you say FusionAuth has saved you?

**Stephen:** I haven't done a cost-comparison between it and competitors, but I'd imagine it's in the thousands of dollars per year, with our usage.

> [FusionAuth] APIs are straightforward and do everything we need.

**Dan:** How do you run FusionAuth (kubernetes, standalone server, behind a proxy, etc)?

**Stephen:** We run it in a Kubernetes cluster, along with our main applications.

**Dan:** Any plans to use it for internal service authentication in your kubernetes cluster?

**Stephen:** I'm not completely informed about this area, but we use our cloud's built-in authentication for our own users, and since our codebase is monolithic, we don't have much authentication to do between microservices. We do have some elevated permissions within FusionAuth for customer service agents to perform some admin functions.

**Dan:** Any general feedback/areas to improve?

**Stephen:** Sure, two things come to mind.

The documentation includes a good many outdated entries, and several guides have not been rewritten to work with new versions.

And custom interfaces for user management don't always seem to be a first-class citizen. Customizing the built-in UI is quite limited. _Ed. note: This [issue](https://github.com/FusionAuth/fusionauth-issues/issues/91) and [this one](https://github.com/FusionAuth/fusionauth-issues/issues/1524) may be of interest._

**Dan:** Thanks for your feedback!

-------

We love sharing community stories. You can check out [ClearSpend's website](https://clearspend.com/) if you'd like to learn more. 
