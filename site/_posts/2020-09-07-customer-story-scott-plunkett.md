---
layout: blog-post
title: ! "Scott Plunkett's customer story"
description: 
author: Dan Moore
image: blogs/release-1-19/fusionauth-release-1-19.png
category: blog
tags: topic-customer-story
excerpt_separator: "<!--more-->"
---

Scott Plunkett is a FusionAuth customer who is building a game server management company. He chatted with us over email about how he and his team are using FusionAuth to meet their auth needs. 

<!--more-->

*This interview has been lightly edited for clarity and length.*

-------

**Dan:** Tell me a bit about your work as a developer.

**Scott:** I founded a company building a game server management service that cuts out the middle-men (game hosting companies). Our product allows users to deploy game servers on virtual machines through various cloud providers, such as Linode, Vultr, DigitalOcean, or AWS.

The service is unique in that we don't charge for the hosting (users pay the provider for their usage) and we backup the data when they aren't playing so they pay hourly prices for the server only when it's actively used. We support non-cloud machines, such as dedicated servers from unsupported providers, but they don't offer the same cost-saving benefits.

> "We didn't want to have to manage the authentication lifecycle for the users and we didn't want to build it ourselves."

**Dan:** How do you use FusionAuth? Is it for OAuth? User management? Social sign-on? Something else?

**Scott:** Easy: all of the above! Right now we use FusionAuth for user management, OAuth, social sign-on, and two-factor authentication.

**Dan:** What problems did FusionAuth solve for you? And how were you solving them before FusionAuth?

**Scott:** We didn't want to have to manage the authentication lifecycle for the users and we didn't want to build it ourselves. We took the industry-driven advice that FusionAuth offers in their product to do what would take us much more time to do ourselves.

We wanted to offer OAuth capabilities for our customers as well in the near future. This is not something we've implemented yet because of some intricacies with FusionAuth and offering it as a service for our customers. We do use it for our 3rd party integrations we're working on building now, such as Integromat and Zapier as well as internal applications.

We're using FusionAuth's OIDC to authenticate users on Integromat (we have not begun building our Zapier integration yet, it's in the plan). The Integromat integration allows users to trigger the creation of game servers, kicking players, updating their ban list, receiving analytical data, etc. from Integromat. 

This opens up a bunch of codeless integrations for things like "When I type `!restart minecraft` in Discord, restart my Minecraft server" or "When I type `!banlist` in Discord, send a message in response with all people who are banned from my game servers". FusionAuth is the critical piece because the OIDC functionality made API authentication for Integromat super simple.

**Dan:** Why did you choose FusionAuth over the competition?

**Scott:** If I said it was anything but cost, I'd be lying. We were fed up with the idea of having to pay per MAU when we didn't really know what our MAU count would be since we're just now starting. We also didn't see the value in the MAU count packages offered by competitors. Having the flexibility to start with self-hosting and later to go to FusionAuth cloud when we're tired of managing the servers is the greatest part.
 
**Dan:** How do you run FusionAuth (kubernetes, standalone server, behind a proxy, etc)?

**Scott:** Right now we run FusionAuth on a Debian machine as an rpm package behind an ELB, but Kubernetes is in the works.

> "Having the flexibility to start with self-hosting and later to go to cloud when we're tired of managing the servers is the greatest part."
 
**Dan:** Any general feedback/areas to improve?

**Scott:** We love FusionAuth, but there are definitely some areas (Two-Factor Authentication recovery codes, session invalidation, exposing OAuth for customers to integrate) that are slightly irritating. 

However, they don't overshadow the benefits we get from FusionAuth as a solution itself.

-------

We love sharing customer stories. You can check out [Scott's website](https://contaim.io/) if you'd like to learn more about his company.
