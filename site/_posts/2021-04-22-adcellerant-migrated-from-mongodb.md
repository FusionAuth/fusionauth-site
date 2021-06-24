---
layout: blog-post
title: AdCellerant seamlessly migrated their data from MongoDB to FusionAuth
description: Before migrating to FusionAuth, AdCellerant used a homegrown authentication solution with MongoDB. When they moved to FusionAuth, they transferred thousands of accounts transparently. 
image: blogs/adcellerant-case-study/adcellerant-seamlessly-migrated-their-data-from-mongodb-to-fusionauth-header-image.png
author: Dan Moore
category: blog
tags: topic-customer-story topic-upgrade-homegrown
excerpt_separator: "<!--more-->"
---

James Humphrey, Senior Director of Technology at AdCellerant, and Jeff Fairley, Senior Director of Engineering at AdCellerant, sat down and talked to us about how this growing adtech company is using FusionAuth. 

<!--more-->

In our conversation, we covered the gamut. The topics ranged from the details of the migration of over 100,000 user attributes in a MongoDB database with multiple user data models to the FusionAuth support provided during and after the migration.

Before migrating to FusionAuth, [AdCellerant](https://www.adcellerant.com/) used a homegrown authentication solution. It was an application where authentication logic was intermingled with business logic. This application worked fine initially, but as the company grew, issues arose. 

> "We didn't want to build our own identity service, but if we had, it would look like FusionAuth..." - Jeff Fairley

In particular, the application had scaling issues as they added more customers. There were also multiple user data models. These were all stored in a MongoDB database. The lack of a standard user data object made application development more difficult. 

Unfortunately, the growing pains of their homegrown application impacted engineering timelines. More importantly, it became increasingly difficult to meet client promises.

AdCellerant seamlessly migrated their data from MongoDB to FusionAuth with no impact to their customers. This was not a trivial effort; thousands of accounts were transferred without issue. The AdCellerant team continues to migrate applications from the homegrown auth system to FusionAuth. 

They've also been able to use FusionAuth for new projects to drive innovation and growth. One such project involves building an API to allow external developers to integrate with their flagship product. 

We'll let James Humphrey have the final word:

> "FusionAuth has been very responsive; that type of support goes a really long way."

Want to learn more about AdCellerant's migration to FusionAuth? 

[READ THE CASE STUDY](/resources/adcellerant-case-study.pdf){:.button .brochure .orange .text-larger}{:target="_blank"}
