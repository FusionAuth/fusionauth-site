---
layout: blog-post
title: Got Users? How About 100 Million of Them?
description: FusionAuth can handle hundreds of millions of users easily, because you might need to.
author: Daniel DeGroff
excerpt_separator: "<!--more-->"
categories: blog
tags:
- user registration
- load test
- call of duty
image: blogs/got-users.jpg
---
## FusionAuth User Registration Hits 100,000,000 in Load Test

Did you know that each time you log into Facebook, check your email or fire up Fortnite, a software engineer has thought about user registration and authentication. Hopefully she has thought a lot about it. For example, what happens if Call of Duty goes offline for maintenance and then six million users try to log back in at the same time? It could take days for users to get back online if peak loads aren’t planned for.
<!--more-->

Over the past ten years we've been building a real time text filter called CleanSpeak. CleanSpeak filters billions of messages in any given month. With this experience, when we started developing FusionAuth a few years ago we spent a lot of time thinking about scale and performance.

One way we design for performance is by running load tests during our development cycles to ensure our database indexes are optimized and to confirm we don’t have any poor performing code paths. By stressing our software we are able to measure its response and determine behavior.

Our load tests are run on very modest hardware and stock database configurations so that our metrics are not an unrealistic best case result, but rather the minimum you can obtain when running on bare metal. Our test system is nearly 10 years old with only an upgraded disk drive. Here are the system specifications:
- Dell PowerEdge 1950 (2007)
- CPU: Dual Intel Xeon L5320 1.8GHz (Discontinued in 2009)
- Front Side Bus: 1066 MHz
- RAM: 12GB (Only 1 GB assigned to Java VM running FusionAuth)
- Disk: Intel 5xx SATA SSD

## The Results

To date we’ve registered 100 million users without any significant reduction in performance. We’re running about 400 new user registrations per second, roughly 1.4 million user registrations per hour. Once a user is registered subsequent logins are much faster at about 1000 per second which comes out to about 3.6 million per hour.

The latest [census data](https://www.census.gov/quickfacts/ "Jump to Census Data site") we have shows that the US population is approximately 327 million as of 2018. 23% of that total population is under 18 years of age. This works out to be about 73 million people under the age of 18 living in this country.

This means that every single person in the United States under the age of 18 could register for your new game or application using FusionAuth and you’d still be well under the load that we are testing.

According to an [infographic published by Activision in 2014](http://venturebeat.com/2014/11/24/call-of-duty-advanced-warfare-by-the-big-numbers/ "Jump to Venturebeat site"), the online multiplayer franchise Call of Duty had over 125 million total users. Call of Duty  is an exceptionally popular game, so this is a number that few titles will ever reach. Nevertheless, to put user registrations per second into perspective, FusionAuth would allow you to grow a title from launch to a staggering 125 million registered users in just over a weekend. I am quite sure that if your application actually grew that quickly the rest of your infrastructure would fail spectacularly. But rest assured, FusionAuth will be just fine.

The throughput we have achieved in FusionAuth is a number that we don’t expect anyone to ever legitimately require. However, the more distance we can put between what we can achieve and what our most demanding clients require, the less chance we will encounter issues in the field.

FusionAuth’s proven performance and ability to scale, as seen through our load test results, will power high volume applications with ease. Let us help you reach 100,000,000 users.

## Learn More About FusionAuth

FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available at the best price. We provide registration, login, SSO, MFA, data search, social login, user management and more, 100% free for unlimited users.

[Find out more about FusionAuth](https://fusionauth.io/ "FusionAuth Home") and download it today.

<!--
- Strategies
- Products
- FusionAuth
-->
