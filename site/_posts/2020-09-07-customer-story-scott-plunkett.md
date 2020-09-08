---
layout: blog-post
title: ! "Scott Plunkett's Customer story"
description: 
author: Dan Moore
image: blogs/release-1-19/fusionauth-release-1-19.png
category: blog
excerpt_separator: "<!--more-->"
---

Scott Plunkett is a FusionAuth customer who is bulding a game server management company. He chatted with us over email about how he is using FusionAuth. 

<!--more-->

This interview has been lightly edited for clarity and length.

**Dan:** Tell me a bit about your work as a developer.

**Scott:** I founded a company building a game server management service that cuts out the middle-man (game hosting companies). Our product allows users to deploy game servers on virtual machines through various cloud providers, such as Linode, Vultr, DigitalOcean, or AWS.

The service is unique in that we don't charge for the hosting (they pay the provider for their usage) and we backup the data when they aren't playing so they pay hourly prices for the server only when it's actively used. We support non-cloud machines, such as dedicated servers from unsupported providers, but they don't offer the same cost-saving benefits.

**Dan:** How do you use FusionAuth? OAuth? User management? Social signon? Something else?

**Scott:** Easy: all of the above! Right now we use FusionAuth for user management, OAuth, social sign-on, and two-factor authentication.

**Dan:** What problems did FusionAuth solve for you? And how were you solving them before FusionAuth?

We didn't want to have to manage the authentication lifecycle for the users and we didn't want to build it ourselves. We took the industry-driven advice that FusionAuth offers in their product to do what would take us much more time to do ourselves.

We wanted to offer OAuth capabilities for our customers as well in the near future. This is not something we've implemented yet because of some intricacies with FusionAuth and offering it as a service for our customers. We do use it for our 3rd party integrations we're working on building now, such as Integromat and Zapier as well as internal applications.

**Dan:** Why did you choose FusionAuth over the competition?

If I said it was anything but cost, I'd be lying. We were fed up with the idea of having to pay per MAU when we didn't really know what our MAU count would be since we're just now starting. We also didn't see the value in the MAU count packages offered by competitors. Having the flexibility to start with self-hosting and later to go to cloud when we're tired of managing the servers is the greatest part.

**Dan:** Any general feedback/areas to improve?

We love FusionAuth, but there are definitely some areas (Two-Factor Authentication recovery codes, session invalidation, exposing OAuth for customers to integrate) that are slightly irritating, but they don't overshadow the benefits we get from FusionAuth as a solution itself.

