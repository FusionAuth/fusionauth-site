---
title: How Complete Does Your Authentication Provider Need To Be?
description: Learn the various types of authentication systems, advantages and limitations of each, and which ones might suit your application.
author: Cameron Pavey
icon: /img/icons/complete-auth-provider-needs.svg
darkIcon: /img/icons/complete-auth-provider-needs-dark.svg
section: Identity Basics
date: 2021-09-14
dateModified: 2021-09-14
---

Many applications start with rudimentary authentication systems. It might just be a table of users in your database, with hashed and salted passwords and a simple exchange of a valid password for a token or session. This is simple, and many web apps have worked like this for a long time—even now. As your application grows in complexity and user base size, you might find that your old DIY auth system isn't quite meeting your product's ever-changing needs. This is where Authentication Providers and Authentication-as-a-Service come in.

In this article, you will see the various types of authentication systems available to you. You will learn some advantages and limitations of each type, as well as which ones might suit your application and its needs. Ultimately, this will come down to your product requirements and what you expect from your authentication system. The good news is that due to the diverse range of offerings, no matter what level of feature completeness you are looking for, there will almost certainly be something that ticks all the boxes.

## What Are the Different Types of Auth Systems?

There are a few different broad categories.

### DIY

The first and probably most common type of authentication system is the DIY approach. There isn't any strict standard here, as it comes down to whatever works for you. As mentioned above, a popular choice is storing user records in a database with hashed and salted passwords. This is a pretty standard approach. While it can be easy enough to implement, and many frameworks and libraries provide drop-in solutions for this kind of authentication system, there are some noteworthy drawbacks. 

When taking the DIY approach, it is important to note that your team will be responsible for managing the security of the solution and mitigating vulnerabilities, which third-party vendors would otherwise handle when using a more managed provider. There are some rather attractive benefits to rolling your own solution, which is why so many teams do it. First of all, you have the freedom to build whatever you need, how you need it. You also get the benefit of not having any additional ongoing fees as you would with third-party providers. 

These benefits can be a huge plus for small teams, startups, and hobbyists but as mentioned above, tend not to scale so well as teams, products, and problems grow in size and scope. On the other hand, any additional functionality that you want will need to be manually implemented. For example, if you want to support Single-Sign-On (SSO) with your DIY solution, you would have to manually implement your preferred SSO standard. Although this is a well-known process, it still takes time, money, and effort to do it right, and the same is true for any other authentication-related features you want to bring to your application, such as Multi-factor Authentication or WebAuthn.

### Drop-In Script

The next option you might consider when putting together an authentication solution is the drop-in script approach. A great example of this is [Cotter.app](https://cotter.app), a passwordless authentication system that works by sending a magic link to the user's provided email. Once the user has clicked the link, they are authenticated and will receive an OAuth token that can authenticate with back-end services. 

The benefits of this approach are pretty clear when you consider how quickly you can get up and running. With just a few lines of JavaScript dropped into your application, you can get functional OAuth authentication. Although setup and integration is quite simple, it comes at the cost of extensibility. While there is still some level of customization afforded to you when you use something like Cotter, it isn't quite on the level of more advanced fully-featured systems. For many teams, this might not be an issue. It may be the case that the customization options available to you are all you need, in which case a drop-in script can be an excellent choice.

### Full Fledged Solution

For more complex and mature implementations, it is hard to beat the customisations afforded by using a full-fledged Authentication-as-a-Service provider, like FusionAuth. Systems like FusionAuth offer a wide array of features that some implementations cannot do without, including:

* Features like powerful SSO integrations
* Support for multiple different enterprise-grade auth standards such as SAML 2.0 and OIDC
* The flexibility of lightweight multi-tenancy
* The ability to customize different workflows 
* Full control of the look and feel
* The ability to self-host

Each of these may or may not be important to you and your business.

## How Do You Choose?

When deciding what type of authentication system you will implement, you need to consider several factors. Naturally, each approach has its own pros and cons, and based on this, one may be more aligned with the goals for your product or application than another. 

### Side Projects

Due to their lightweight nature, drop-in scripts are often a good choice for side-projects or rapid prototype/proof of concept applications. Because there is minimal effort in implementing one of these solutions, it can be swift to get started with and is likely going to be faster, more secure, and boast more features than if you took the time to roll your own solution.

### Advanced Features

On the other hand, a fully-fledged system requires more consideration and planning before implementation but is really the only sensible way to go if you need the power of a real auth provider. This kind of authentication service often comes with more advanced user management functionality and SSO capabilities, among other features. Again, this might not be something you need on a smaller project, but as products grow and mature, it is not uncommon for more complex user management and integrations to become a focus. These advanced features come at a cost, however. 

Often, AaaS providers will cost more than simpler alternatives, and because of this, it is important to think about your requirements and your budget. It's possible that many of the advanced features on offer aren't actually something you need, in which case it could be more cost-effective to go for a simpler solution while still being able to reap the key benefits of using a third-party auth provider.

### Compliance Concerns

Depending on the space your product is in, you might be subject to various compliance standards. This is another instance where running a full-on auth system can come to your aid. Solutions like FusionAuth come with the ability to configure things like password strength rules, which can help with security requirements. If you think about the dev effort needed to implement something like configurable password rules in a hypothetical DIY solution, it is not insignificant. Being able to offload these requirements to your auth provider means your dev team is free to work on features that bring value directly to your customers.

### Single Sign-On

Many organizations also make use of SSO to allow one set of credentials to allow the user to authenticate with many services. Some authentication providers - typically the more heavily featured ones - will provide support for common SSO standards like SAML and OIDC. This can be an important factor in determining which authentication provider is right for you, because if it is something you need, it can be tricky if you need to bolt it on after the fact. 

The effort to manually implement SAML (and OIDC, to a lesser extent) are quite high, so if these standards are something that you need, it is worth taking a serious look at which auth providers include them in their offering, such as FusionAuth.

### Requirements Should Drive the Choice

Which category of solution you should implement will have a lot to do with your specific requirements and what you expect out of an auth provider. That said, if you are expecting that you will need some of the more advanced functionality down the line, it is hard to go wrong with the full-featured approach. 

Even if you start with a more straightforward system, like a DIY approach or a drop-in script, there is no reason why you cannot migrate to a more advanced system later. Migrating between auth systems naturally brings its own challenges, but there are steps you can take to [avoid vendor lock-in](/articles/authentication/avoid-lockin) to make the transition smoother when the time comes.

Returning to the example of Cotter and FusionAuth, if you were graduating from one to the other, you would be able to export your users from Cotter in CSV format and then import them into FusionAuth. As with any migration, there is the potential for unexpected setbacks depending on your configuration, but generally speaking, it should be pretty manageable.

## Conclusion

For early-stage projects, proofs-of-concept, prototypes, and side projects, drop-in scripts are a very appealing option. They give you a way to get started quickly with a secure, reliable foundation. They take minimal effort to implement, and offer a respectable spread of features at a generally reasonable price. 

For more mature products and complex scenarios, it's hard to argue with the stability and flexibility offered by full-featured AaaS providers. They might take a little bit more effort to integrate, but will ultimately give you a greater runway for future expansion and configuration. 

It is essential to consider which approach best suits your current requirements and your future trajectory, anticipated requirements, and budget.


