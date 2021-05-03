---
layout: advice
title: The Auth Facade Pattern
description: Introducing a facade in front of customer identity providers adds implementation flexibility and gives additional control to your applications
image: advice/auth-facade/expert-advice-the-auth-facade-pattern-header-image.png
category: CIAM
author: Dan Moore
date: 2021-04-30
dateModified: 2021-04-30
---

When talking about identity architectures in FusionAuth customers, there's a common deployment pattern called the "Auth Facade". This is also commonly referred to as the "Identity Broker" pattern. 

This pattern is useful when you are deploying software to heterogeneous environments. If, for example, you are building an application which your customers will deploy on-premise, whether in a data center, air-gapped servers, or a private cloud, you should consider a facade. These environments are run by your customers, so you have limited insight into the environment configuration, but your application needs to run well.

## Why deploy into this type of environment?

First, let's discuss why you might choose to run in such a difficult environment. After all, isn't SaaS the future?

You might choose this deployment model for a number of reasons:

* Data gravity: your application needs to go to the data because there's so much of it that the data isn't going to come to you. The gravity could be for either cost or performance reasons.
* Security of confidential data: sometimes the customer requires data remain in their hands, or at least in their data center.
* Intermittent, absent or lossy connectivity to the internet: This may be due to deployment location or for security reasons.

You meet your customers where they are, and that unfortunately means that SaaS doesn't always work. When this is the case, your production deployment environment is beyond your control. 

By the way, this was common before the rise of "software as a service", and the complexities are part of the reasons SaaS is so successful. But for these situations, SaaS solutions won't work.

## Why the facade?

At the same time, your customer doesn't want "Yet Another User Database." Instead, stakeholders need your application to authenticate against an existing user datastore. What the store is doesn't really matter, it may be Azure Active Directory, Okta, or another enterprise friendly identity provider. However, there is a common thread; this identity provider is run by your customer's employees and may support OIDC or SAML.

You could code directly against these providers. But you want your developers focused on building and improving your application, not building auth integrations to these various providers or standards. One painful situation you want to avoid is debugging authentication in prod environments you may not even have access to.

To top it off, your application needs to store user data as well. Whether the functionality is role based authorization, access audit logs or displaying the appropriate welcome message, your application will need to access and modify user data.

## What are your options?

As an enterprise software developer, you have a few options:

* Test and document how to configure your application to use an upstream provider. Provide and test configurations for as many of the major providers as you can.
* Code to the OIDC and SAML specs and do pure federation. Most enterprise providers support these. Limit your user data to what these provide; for instance, the [OIDC standard claims](https://openid.net/specs/openid-connect-core-1_0.html#Claims).
* Use an auth facade/identity broker.

Like any [facade](https://en.wikipedia.org/wiki/Facade_pattern), the auth facade hides a subsystem; the subsystem hidden here is a client's identity provider. As part of your application, ship an embedded auth and user management system. Your application's authentication and authorization requests are sent to this embedded system. It federates as needed with upstream authentication providers. 

{% include _image.liquid src="/assets/img/advice/auth-facade/auth-facade-pattern.svg" alt="The identity broker architectural pattern." class="img-fluid" figure=false %}

## The auth facade vs federation

The auth facade provides more than authentication and authorization federation. Federation is necessary, but often your application requires more than standards can give. 

With an auth facade, you get:

* A single interface for your developers to access and manage user data, no matter where they deploy.
* A rich set of APIs and data models.
* Documentation for supported upstream providers at zero incremental cost to you.

Let's talk a bit more about each of these.

### The developer experience

Developers need an user model to control access to the application. By using the auth facade, your team integrates with one system, rather than every system your clients have. Development becomes easier and your team has more time to focus on building features in your application. 

When there are bugs in the auth system, it is typically either:

* Between your application and the facade
* Between the auth facade system and the upstream provider

In the former case, developers have everything they need to debug what is causing an issue in their development environment. 

In the latter case, you'll be able to use the troubleshooting and bug fixing expertise of the maintainers of the auth facade system. They can amortize these efforts across all of the customers and users they support. 

Typically you need a responsive team behind the auth facade system. When issues arise, you don't want to keep your customers waiting for a fix.

### The importance of APIs and the data model

If your needs are met with the lowest common denominator of authentication and authorization information, follow the OIDC and SAML standards. You'll have less code to write, less code to test, and fewer deployment complexities.

Often the application you are building will unfortunately need more information about a user than these standards provide. You may want to store domain specific attributes useful to your application, for example.

Any auth facade system should provide a superior data model compared to the standards. If it doesn't, stick with the standards and federate to the upstream providers.

### Documenting system configuration

While documentation is often useful for developers building a system, why is it so important for an auth facade? 

Great configuration documentation allows you offload configuration of the connection between your application and upstream systems to your clients' employees. These people know and maintain those upstream systems, and are familiar with them.

Documenting the required configuration and making it as simple as possible to integrate with their system makes it easier to get your application working in your customer's environment.

So you need good docs. You have two choices:

* Maintain such documentation yourself.
* Rely on the auth facade provider to provide the needed documentation.

Which one is easier for your engineering team?


## Deploying an embedded auth system

When evaluating auth facade solutions, make sure you can deploy the system into a variety of customer environments. This rules out SaaS solutions.

Being able to support air gapped or isolated networks is a strong competitive differentiator for your application, especially if it accesses sensitive data.

Ensure your application and the auth facade system are deployable as a unit. Depending on customers' needs, you may want to deploy in a unix friendly package such as an RPM or DEB, a generic software package like a zip file, or, for the clients using Kubernetes, a containerized solution.

Since auth is a necessary part of your application, but not a differentiator, an auth system that fades into the background is best. This should happen both in the literal sense, with a user interface that matches your applications look and feel, and the figurative sense, so your engineers minimize time spent maintaining or troubleshooting it.

You also want a friendly license for embedding the auth system. I am not a lawyer, but ensure you understand the licensing ramifications of third party applications or libraries you ship with your app. Some open source projects offer dual licensing, which may be a viable option.

