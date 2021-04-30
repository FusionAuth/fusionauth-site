---
layout: blog-post
title: Unsupervised uses FusionAuth to integrate with customers' upstream providers 
description: Unsupervised, a machine learning platform, uses FusionAuth to solve their enterprise integration needs.
image: blogs/unsupervised-case-study/unsupervised-uses-fusionauth-to-integrate-with-customers-upstream-providers-header-image.png
author: Dan Moore
category: blog
tags: topic-customer-story topic-upgrade-homegrown
excerpt_separator: "<!--more-->"
---

Justin Davis is Head of Engineering at Unsupervised, a machine learning platform that automatically analyzes and discovers the most important patterns in a company’s data with no human guidance or supervision. 

<!--more-->

[Unsupervised](https://unsupervised.com/) deploys their algorithms wherever the customer's data resides and therefore always run their software in their customers' environments. We sat down with him to chat about how he and his team are using FusionAuth's Enterprise Edition to meet their auth needs.

Unsupervised was looking for an auth system that satisfied numerous customer compliance requirements as well as one that could be used in disparate cloud environments. Additionally, Unsupervised needed a solution that could seamlessly plug in to upstream identity providers used by clients, such as Azure Active Directory or Okta. 

> "Allowing [FusionAuth] to be a known base is very freeing mentally. We are much more confident that FusionAuth will implement the authentication system correctly compared to our homegrown, quasi-maintained version."

After choosing FusionAuth, the development team had one authentication system to code against, with all the complexity and diversity of various client auth systems abstracted away. As a bonus, their clients' employees configure the upstream connections using FusionAuth's documentation, saving Unsupervised engineers even more effort.

Justin estimates that if they had to rebuild what FusionAuth provides them, they'd have to hire an additional senior engineer to build, maintain, and debug their auth layer. 

Unsupervised also automates the setup of developer environments via [Kickstart](https://fusionauth.io/docs/v1/tech/installation-guide/kickstart). Doing so enables consistent system configuration for every engineering team member. 

We'll let Justin have the final word:

> "FusionAuth allows us to remain focused on the actual effort and shields us from fighting with upstream identity providers in strange environments that we're not familiar with."

Want to learn more about Unsupervised's decision process and savings? 

[READ THE CASE STUDY](/resources/unsupervised-case-study.pdf){:.button .brochure .orange .text-larger}{:target="_blank"}
