---
layout: blog-post
title:  "FusionAuth Tenants - Dev, Stage and Production"
author: Daniel DeGroff
categories: blog
image: blogs/fusionauth-website.png
---

When we built FusionAuth we intentionally decided against a multi-tenancy architecture. A multi-tenant model makes scaling and selling a SaaS offering easier and more cost effect, but it isn't a great feature for the end user as it pertains to security.

In the security world there is a concept of an attack surface. There is not any one single way to measure an attack surface but a common way to think of the problem is to quantify and sum all possible points of attacks which sometimes referred to as attack vectors. 

The practical reason to measure the attack surface is to be able to identify the cost to the business if an attack is successful. 

The more valuable the data, the likely and attack is to be attempted. In an a tangible example, if you were to pile up a stack of cash on your desk you would implicitly increase the likelyhood of an attack if only because you have increased the reward for a successful attempt.  

By selecting an architecture that does not place all of our customers user dat ain one database or datacenter, we reduce the value of a successful attack. 

While there are many good reasons to move services to a cloud or a SaaS provider, we do not believe this makes a good argument to move login and user security to the same model.

 
Login should be fast and secure. On premise reduces latency, and allows our clients to have flexibility in the way they deploy and secure our service.

  


