---
layout: blog-post
title: FITTFinder chose FusionAuth and left auth security to the experts
description: FITTFinder, a health and fitness activity discovery startup, uses FusionAuth because they want to prepare for millions of users.
author: Dan Moore
image: blogs/become-education-story/become-education-chooses-fusionauth-for-idaas.png
category: blog
tags: topic-community-story topic-upgrade-homegrown
excerpt_separator: "<!--more-->"
---

Trevor Robinson is a FusionAuth community member and co-founder and CTO of FITT Finder, a meta-search and discovery engine for health and fitness activities. He chatted with us over email about how he and his team are using FusionAuth to meet their auth needs. 

<!--more-->

*This interview has been lightly edited for clarity and length.*

-------

**Dan:** Tell me a bit about your work as a developer and CTO.

**Trevor:** I'm currently co-founder/CTO/full-stack software engineer at my start-up company, FITT Finder, which is a meta-search and discovery engine for health and fitness activities. In addition to FusionAuth, we're using Typescript, Node.js, GraphQL, React, Material UI, MySQL, Elasticsearch, AWS, and Terraform.

> A big part of the reason to use a solution like FusionAuth is to leave those aspects of security to the experts who know all the evolving best practices and to have the confidence that a large community of users is helping to test and validate it.

**Dan:** Interesting. Seems like a huge problem would be keeping the activity data up to date and accurate. Care to share any tips on how you are going to solve that problem?

**Trevor:** We currently operate like most internet search engines, using a set of periodic jobs that fetch data from third-party APIs (such as cloud-based studio management software) and crawl web sites. In the future, we hope to have gyms, studios, etc. push data to our API.

**Dan:** How do you use FusionAuth? OAuth? User management? Social sign-on? Something else?

**Trevor:** FITT Finder uses FusionAuth as the user authentication component for the software we're building. It manages user credentials, performs authentication, and issues JWTs via OAuth. We also plan to use social sign-on and SAML SSO very soon.

**Dan:** Did you build your own user interface to the login flows, or are you using themed pages?

**Trevor:** We are currently using our own very simple login page. I need to set up themed pages for the rest of the flows before we launch. We may keep our own basic login UI though, so users can login within the app instead of redirecting.

> FusionAuth replaced some custom user management and authentication done by a prior contractor before my involvement. 

**Dan:** What are your plans for social sign-on and SAML SSO?

**Trevor:** We don't want our users to have to create passwords if they're comfortable using social sign-on or they're coming from a third-party using SSO. For social, we've already enabled Google, and we'll likely add Apple and Facebook. We're in the process of configuring SAML v2 for the first time, but ran into a snag because FusionAuth doesn't accept the partner's 1024-bit RSA keys. Hopefully they're able to use a stronger key.

**Dan:** You mention being happy with the API. Can you elaborate? How have you used the API?

**Trevor:** We use the OAuth (via my [express-jwt-fusionauth middleware](https://github.com/trevorr/express-jwt-fusionauth)), login, and registration APIs. The login API is used for embedded login within the app (as mentioned above). The registration API is used to store app-specific user data like roles and permissions in the user registration so it can be added to the JWT. 

I'm actually not thrilled with this solution, as it currently leads to stale user permission data in the JWT. I would like to fetch the extra data at login, but the reconcile lambdas don't seem to support asynchrony. (So I guess that actually goes near the top of my FusionAuth feature wishlist.) For scalability and reliability, we don't use sessions or sticky load-balancing, so we rely on the JWT containing enough context for authorization decisions.

> I chose FusionAuth because it seemed like it would meet all of our foreseeable needs without any significant per-user costs. 

**Dan:** What problems did we solve for you? And how were you solving them before FusionAuth?

**Trevor:** FusionAuth replaced some custom user management and authentication done by a prior contractor before my involvement. When I rebuilt the platform from scratch to improve scalability, reliability, and usability, I wanted a more secure and full-featured user management solution that I didn't have to build and maintain.

**Dan:** Why did you choose FusionAuth over the competition?

**Trevor:** I chose FusionAuth because it seemed like it would meet all of our foreseeable needs without any significant per-user costs. We eventually want to scale to millions of consumers, many of whom will likely use our service for free, so the per-user costs of other auth platforms seemed prohibitive, especially for a bootstrapped start-up.

**Dan:** How much time and money would you say FusionAuth has saved you?

**Trevor:** FusionAuth probably saved us many weeks of time if we were to implement the features we use ourselves. Of course, we wouldn't seriously consider doing that, given how important correctly implemented security and privacy are. A big part of the reason to use a solution like FusionAuth is to leave those aspects of security to the experts who know all the evolving best practices and to have the confidence that a large community of users is helping to test and validate it.

**Dan:** How do you run FusionAuth (k8s, standalone tomcat server, behind a proxy, etc)?

**Trevor:** We run FusionAuth on AWS ECS using the official Docker image with AWS RDS (MySQL 8) as the database. (We were using AWS Elasticsearch Service for the search provider, but dropped that aspect as soon as we were able. I don't think we generally use search features of FusionAuth, though we may need to revisit that when we have more users.) We're currently running two instances load-balanced by AWS ALB.

> We eventually want to scale to millions of consumers, many of whom will likely use our service for free, so the per-user costs of other auth platforms seemed prohibitive, especially for a bootstrapped start-up.

**Dan:** Any general feedback/areas to improve?

**Trevor:** I've been quite happy with the core functionality and API, as well as the support and community responsiveness on Slack and the forums. The minor issues I've had so far, from most important to least:

* There is no official support for zero-downtime upgrades. Downtime causes us contractual headaches around SLAs and personal headaches around performing upgrades during the middle of the night on a weekend. I've done this successfully at my own risk, but it will make me increasingly nervous. This feature seems doable, even in the face of schema upgrades, with some constraints (both for FA and its users) on consecutive versions.
* As a Java-based service, the memory demands are relatively high and insufficient memory results in a JVM crash. I know [more recent JVMs](https://medium.com/adorsys/usecontainersupport-to-the-rescue-e77d6cfea712) have better support for running in a container (i.e. no more `-Xmx`), so it would be nice to see FusionAuth support this (no more `FUSIONAUTH_MEMORY`) and degrade more gracefully (fail individual operations instead of the whole JVM).
* Better clarity about what features need or benefit from Elasticsearch, so I can know whether I really need the expense and burden of running it. (Recommended production configurations start at around $400/mo on AWS.)
* The FusionAuth UI is a bit dated looking and not always intuitive or ergonomic. For example, most of the useful operations on a table view involve tiny buttons on the right edge.
* Make the FA core open source so users can better debug issues, more people can audit security, the community can work on issues that aren't a priority for the company, etc.

-------

We love sharing community stories. You can check out [FITT Finder's website](https://fittfinder.com/) if you'd like to learn more. 
