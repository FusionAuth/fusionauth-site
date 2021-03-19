---
layout: blog-post
title: Seegno manages thousands of tenants with FusionAuth and Kubernetes
description: Seegno upgraded from their homegrown auth system and runs FusionAuth in Kubernetes.
author: Dan Moore
image: blogs/seegno-fusionauth/...
category: blog
tags: topic-community-story topic-upgrade-homegrown
excerpt_separator: "<!--more-->"
---

John Maia is a FusionAuth community member and software developer at Seegno. He chatted with us over email about how he and his team are using FusionAuth to meet their auth needs. 

<!--more-->

*This interview has been lightly edited for clarity and length.*

-------

**Dan:** Tell me a bit about your work as a software engineer.

**John:** I'm a software developer and part of the leadership of the back-end team at Seegno and Slyk. 

We design and develop software products for a variety of industries, such as financial services, retail, real estate, cybersecurity and bioinformatics. 

I'm one of the team members responsible for researching and, using my background in high performance computing, architecting and implementing the most efficient solution to varied issues.

**Dan:** How do you use FusionAuth? OAuth? User management? Social sign-on? Something else?
        
**John:** We use FusionAuth as a multi-tenant authentication service to manage users and session tokens from multiple applications simultaneously. 

We also use FusionAuth's Identity Providers to offer our users the ability to register and authenticate using their social accounts.

> FusionAuth ... turned out to be the most versatile, easy to use and, more importantly, configurable solution. 

**Dan:** Approximately many tenants do you have? 

**John:** In our largest environment we currently handle over five thousand tenants. 

**Dan:** Do you manage the tenants using the API primarily?

**John:** We manage them via API using FusionAuth's node client. We only use the UI during debugging sessions.

**Dan:** What problems did we solve for you? And how were you solving them before FusionAuth?

**John:** Before using FusionAuth we had our own authentication solution. We wanted to focus solely on features that were specifically related to each one of our products (e.g. crypto wallets management), so we started researching for a headless, self-hosted and ready to use solution. We needed all of the authentication features that our products required (e.g. multi-tenancy support, efficient token session management, etc).

**Dan:** Why did you choose FusionAuth over the competition?

**John:** After comparing multiple authentication services, such as Keycloak and Okta, we ended up choosing FusionAuth because it turned out to be the most versatile, easy to use and, more importantly, configurable solution. 

An example of what we were able to do with FusionAuth (and struggled to accomplish with all the other solutions!) was the configuration of different JSON Web Token (JWT) encryption keys for each tenant via API.

The active community was also a big factor on our decision making. Whenever we encountered an issue with FusionAuth, we always received a quick response from the support team and were always able to find a solution together.

> Whenever we encountered an issue with FusionAuth, we always received a quick response from the support team and were always able to find a solution together.

**Dan:** Are there any other examples of customization, beyond the JWT keys, that you could share?

**John:** Other than JWT keys we use our own email service to send the user related emails (confirm email, reset password, etc) and use FusionAuth only to generate and validate email confirmation codes. 

We also use FusionAuth's passwordless login functionality to return a session token right after the user successfully confirms his or her email address.

**Dan:** How much time and money would you say FusionAuth has saved you?

**John:** It's hard to estimate the exact amount of time and money that we saved with FusionAuth. 

But if we were to update our in-house solution to offer what we currently need, it would surely take us hundreds of hours of architecting and developing. And after that we would still need to regularly maintain and update all of the features.

**Dan:** How do you run FusionAuth (k8s, standalone tomcat server, behind a proxy, etc)?
        
**John:** We use kubernetes to manage our multiple instances of FusionAuth in our various environments.

**Dan:** Any general feedback/areas to improve?

**John:** To be fair, much of what we asked for has already been done. We would like to ask the FusionAuth team to continue improving the services' ability to handle a high number of tenants, both in performance and in the UI.

We would also like FusionAuth to be compatible with the Kubernetes multi-cluster strategy. This would make it possible to deploy multiple instances across various regions to improve its availability and regional performance.

> In our largest environment we currently handle over five thousand tenants. 

**Dan:** Other than the multi-cluster strategy you mention, have you run into any issues with FusionAuth in Kubernetes?

**John:** We struggle a bit to run multiple FusionAuth instances in Kubernetes. We usually have more than one replica of each service and to do this in Kubernetes we normally only need to indicate the number of replicas we want. But with FusionAuth this can't be done because each replica needs to know its URL through `FUSIONAUTH_APP_URL` environment variable. 

To work around this issue and have at least two replicas of FusionAuth we need to create two separate deployments, each with just one replica, and then create a service pointing to these two deployments.

-------

We love sharing community stories. You can check out [Seegno's website](https://seegno.com/) if you'd like to learn more about them.
