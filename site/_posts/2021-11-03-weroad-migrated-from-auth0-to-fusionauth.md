---
layout: blog-post
title: WeRoad migrated from Auth0 to FusionAuth
description: WeRoad brings travelers together for live-changing travel and used FusionAuth to simplify their auth infrastructure.
author: Dan Moore
image: blogs/weroad-left-auth0-for-fusionauth/weroad-migrated-from-auth0-to-fusionauth-header-image.png
category: community-story
tags: topic-community-story topic-upgrade-auth0 auth0 upgrade community-story
excerpt_separator: "<!--more-->"
---

Danilo Polani is a FusionAuth community member and senior software engineer at WeRoad. He chatted with us over email about how he and his team are using FusionAuth to meet their auth needs. 

<!--more-->

*This interview has been lightly edited for clarity and length.*

-------

**Dan:** Can you tell me a bit about WeRoad? What is the company's mission?

**Danilo:** WeRoad is a community of travelers, united by their passion for adventure and discovering faraway lands and cultures. We bring together small groups of like-minded millennials and send them on life-changing experiences to 80+ destinations all over the globe. Our mission is to design and deliver experiences worth living and sharing, rewriting the rules of the travel industry every step of the way.

> We found FusionAuth really simple, yet powerful. 

**Dan:** Tell me about your work as a senior software engineer at WeRoad.

**Danilo:** Our tech team is composed of two subteams. Mine is in charge of developing, enriching and maintaining the Catalog platform of the company. The Catalog is shown to the users and on the website itself.

My work is mainly on the backend side. One year ago we started splitting our big Node.js monolith into several services and Catalog is the only one (currently) written in Laravel. There's a huge amount of work under the hood: we have an internal (home made) page builder that our marketing team can use with a simple drag and drop interface. It lets them reuse components, duplicate pages and modify the content of those pages. 

The Catalog APIs take care of injecting dynamic values from the database, return pages applying special rules (e.g. "enable this block only at that time"), and checking that header and footer URLs are valid (with a daily cron job). Most importantly, the Catalog APIs collect information through RabbitMQ from different services, such as user bookings or travel planning.  

> Having a centralized user management and login platform is truly amazing. 

**Dan:** How do you use FusionAuth? OAuth? User management? Social sign-on? Something else?

**Danilo:** We use FusionAuth to manage our users and their roles in order to control or deny access to our platforms through both classic credentials login and social sign-on (Google currently, more soon). 

Currently only our company employees have access to FusionAuth, but we have in our roadmap to expand it to our whole user base!

**Dan:** What problems did we solve for you? How were you solving them before FusionAuth?

**Danilo:** We have more than five internal platforms. Each one has its own rules and access privileges. Having a centralized user management and login platform is truly amazing. 

Before introducing a solution like FusionAuth, we had a users table on every service, then a roles table too. We had to ask our colleagues to manually create an account on every platform and they had different passwords spread across different services. It was a pain for everyone. 

The best (worst) part: for a particular old service we had to create the user directly from the database because there was no other way to create an admin. Ouch!

> At scale, Auth0's pricing was outrageous.

**Dan:** Why did you choose FusionAuth over the alternatives?

**Danilo:** We were using Auth0 before FusionAuth and, although it had great features, it could be a bit confusing, mainly when talking about roles, scopes, permissions etc. At scale, Auth0's pricing was outrageous.

We were looking for something else: simple to use, cheaper but with similar functionality. 

At the end we discovered FusionAuth: our DevOps guy (hi Rob!) along with our CTO (hi Cass!) took a shot at deploying it. We found FusionAuth really simple, yet powerful. After a quick presentation to the whole team we decided to adopt it and we're migrating all our services to it. 

Plus, having FusionAuth running on our infrastructure makes us more confident. 

**Dan:** How much time and money would you say FusionAuth has saved you?

**Danilo:** In our primary market (Italy) we have 23k+ registered users and thousands of users in two other countries to which we've expanded. By switching from Auth0, I assume we're going to save at least $500 per month, when you take our future plans into consideration.

When thinking about time saved, it's not easily estimated. We would have needed at least two people for two months or more. You have to consider the support and maintenance time too. Building something would be crazy when our company is at this stage.

> [H]aving FusionAuth running on our infrastructure makes us more confident. 

**Dan:** How do you run FusionAuth (kubernetes, standalone tomcat server, behind a proxy, etc)?

**Danilo:** We have deployed our FusionAuth instance with Kubernetes on Google Cloud Platform, just like our other services. 

It's not really my field, but our DevOps folks make it look simple.

**Dan:** Any general feedback/areas to improve?

**Danilo:** We're happy with the decision we made, we look forward to applying our custom stylesheet to the login screen in order to make it feel and appear like WeRoad.

Once you get used to the terminology (like entities) which might be different than in other platforms, you're ready to go. You won't be disappointed. 

Something I'd love to see in FusionAuth are a future restyle of the dashboard and the ability to duplicate a user across different tenants. But there are really no major issues.

-------

We love sharing community stories. You can check out [WeRoad's website](https://www.weroad.it/) if you'd like to learn more about them.
