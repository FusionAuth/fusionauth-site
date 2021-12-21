---
layout: blog-post
title: Maila Networks centralized authentication with FusionAuth on OpenStack
description: They run FusionAuth on OpenStack and are consolidating access logs in FusionAuth.
author: Dan Moore
image: blogs/circleboom-fusionauth-single-sign-on/circleboom-chose-fusionauth-for-single-sign-on-across-their-products-header-image(1).png
category: blog
tags: topic-community-story topic-upgrade-homegrown
excerpt_separator: "<!--more-->"
---

Jean Rousseau Franco is a FusionAuth community member and CTO at Maila Networks and Mai Telecom. He chatted with us over email about how he and his team are using FusionAuth to meet their auth needs. 

<!--more-->

*This interview has been lightly edited for clarity and length.*

-------

**Dan:** Can you tell me a bit about Maila Networks and Mai Telecom? What is the mission?

**Jean Rousseau:** We're a Service Provider, offering data center services and telecommunications offerings in the south of Brazil.

Our mission is to provide the best experience to our customers mixing the service and connectivity offerings, both being delivered with security in mind.

**Dan:** Tell me about your work as a CTO.

**Jean Rousseau:** It's a big responsibility but it comes with a lot of pleasure. I'm involved in many different areas, going from technical to design, and even being on the field with the technicians to understand their needs and attitudes.

> ... [using FusionAuth] saved us from having to build our own application.

**Dan:** How do you use FusionAuth? OAuth? User management? Social sign-on? Something else?

**Jean Rousseau:** We started using for a simple project and replaced a CoovaChilli hotspot. Nowadays, I'm experimenting with it in other areas to integrate all sign-ons in a single application.

It's a powerful application and I'm loving it.

**Dan:** What applications are you planning to integrate with FusionAuth?

**Jean Rousseau:** Different hotspot applications and email servers.

**Dan:** What problems did we solve for you?

**Jean Rousseau:** The authentication, logging and searching problems that we had.

**Dan:** What kind of searching do you find FusionAuth to be helpful for? Can you give an example?

**Jean Rousseau:** When we had different servers, we had to go through the login logs in different servers. It was time consuming.

> It's a powerful application and I'm loving it.

**Dan:** How were you solving them before FusionAuth?

**Jean Rousseau:** We needed several servers and applications running to get all the data.

With FusionAuth everything is concentrated in a single app, with the possibility to add nodes to share the load.

**Dan:** Why did you choose FusionAuth over the alternatives?

**Jean Rousseau:** The price was the main factor. As the company itself puts it: the pricing is transparent.

**Dan:** How much time and money would you say FusionAuth has saved you?

**Jean Rousseau:** I haven't being able to measure it yet, but it saved us from having to build our own application.

**Dan:** How long would you estimate it would have taken you to build your own application? 

**Jean Rousseau:** I'm just speculating, but the last time we had to build a similar application, it took us around six months.

> ... the pricing is transparent.

**Dan:** How do you run FusionAuth (kubernetes, standalone tomcat server, behind a proxy, etc)?

**Jean Rousseau:** We're running on a OpenStack cluster and we have an NGINX server in front of it.

**Dan:** Any general feedback/areas to improve?

**Jean Rousseau:** I would recommend a few additions on the installation tutorial, they're simple things, but we never install some of the packages unless we really need. Packages like tar, zip, unzip and curl were required but not mentioned in the installation guides.

**Dan:** Thanks for the feedback!

-------

We love sharing community stories. You can check out [Maila Network's website](https://www.maila.net.br/) if you'd like to learn more about them.
