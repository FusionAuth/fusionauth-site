---
layout: blog-post
title: dealcloser chooses FusionAuth, saves two months of development time
description: dealcloser, a legaltech startup, uses FusionAuth to solve their enterprise needs.
image: blogs/dealcloser-case-study/dealcloser-chooses-fusionauth-saves-two-months-of-development-time.png
author: Dan Moore
category: blog
tags: topic-customer-story topic-upgrade-homegrown
excerpt_separator: "<!--more-->"
---

James Humphrey, Senior Director of Technology at AdCellerant, and Jeff Fairley, Senior Director of Engineering at AdCellerant, sat down and talked to us about how this growing adtech company is using FusionAuth. 

<!--more-->

We covered the gamut, from the details of the migration of over 100,000 user attributes from a MongoDB database with multiple user data models to the FusionAuth support provided during and after the migration.

Before migrating to FusionAuth, [AdCellerant](https://www.adcellerant.com/) used a homegrown authentication solution. It was an application where authentication logic was intermingled with business logic. This application worked fine initially, but as the company grew, issues arose. 

> "We didn't want to build our own identity service, but if we had, it would look like FusionAuth..." - Jeff

In particular, the application had scaling issues as they added more customers. There were also multiple user data models. These were all stored in a MongoDB database. The lack of a standard user data object made application development more difficult. 

The growing pains of the monolithic application impacted the engineering team timelines, unfortunately. They also made it difficult to deliver on promises to clients.

AdCellerant seamlessly migrated their data from MongoDb to FusionAuth with no impact on users. Thousands of accounts were transferred. The AdCellerant team continues to migrate applications from the homegrown auth system to FusionAuth. 

They've also been able to use FusionAuth for new projects, including building an API to allow external developers to integrate with their flagship product. We'll let James have the final word:

> "FusionAuth has been very responsive; that type of support goes a really long way."

Want to learn more about AdCellerant's migration to FusionAuth? 

[READ THE CASE STUDY](/resources/adcellerant-case-study.pdf){:.button .brochure .orange .text-larger}{:target="_blank"}
