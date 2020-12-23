---
layout: blog-post
title: What is the auth facade pattern?
description: How can the auth facade pattern help you deploy apps in customer's networks?
author: Dan Moore
image: blogs/ampio-customer-story/iot-company-picks-fusionauth-to-avoid-getting-distracted-by-auth-header-image.png
category: blog
tags: topic-auth-patterns
excerpt_separator: "<!--more-->"
---

I have been seeing a common pattern when talking to FusionAuth customers, and I wanted to document it. I call it the Auth Facade pattern and it applies to people deploying their software in to other environments. These environments are run by your customers and you may have limited insight or control.

<!--more-->

At the same time, the enterprise doesn't want to have Yet Another User Database to maintain. Instead they want your application to authenticate its users against an existing user datastore. This may be Azure Active Directory, Okta, or another identity provider. This identity provider is run by your customer's employees and may support OIDC or SAML.

As an enterprise software developer, you have a couple of options:

* Test and document how your application can be configured to use an upstream provider. This is a roll your own solution and requires insight into your customers deployment environments.
* Code to the OIDC and SAML specs and hope that gives you all the data you need for your user store. This is federation.
* Use an auth facade.


The auth facade, as any [good facade should](https://en.wikipedia.org/wiki/Facade_pattern), hides a subsystem from a client. In this case, it is your client's identity provider.

The auth facade is more than just federation. Federation is a good start, but you need more functionality, support and documentation than what is guaranteed by the standards. When you use an auth facade, you get the following benefits:

* A single interface for your developers
* An easy, deployable, compact auth system which runs everywhere
* A rich set of APIs and data model
* Ample documentation for various upstream providers 

TBD diagram?

Let's talk a bit more about each of these.

## Developer interface

Your developers will need to integrate with some auth system to know which users can access the application, as well as what fucntionality will be made available to each user. By using the auth facade, your devs only need to learn how to integrate with one system, rather than all the systems that your clients may use. This will ease development and free up more time for your devs to be building the features of your application. 

Additionally, when there are bugs in the auth system, you either replicate them in your local environment, in the interaction between your application and the facade. Alternatively, the bug may occur in communication between the auth facade system and the upstream provider, due to a misconfiguration or bug in the auth system. This seperation of concerns makes it easier to track down issues.

You'll want a responsive team behind the auth facade when there are issues. You don't want to keep your customers waiting for a fix.

## Deployable auth system

When evaluating auth facade solutions, you want to make sure you can deploy the system providing the facade anywhere. This pretty much rules out any SaaS based system, unless your enterprise clients are deploying your application into a network with internet connectivity; this is not always a given, and being able to support airgapped or isolated networks can be a strong differentiator for your application.

You also want to ensure that your application is easily deployable, and that the auth system is deployable in a similar manner. Depending on customers' needs, you may want to deploy in a unix friendly package like an RPM or DEB, a generic software package like a zip file, or, for the cutting edge clients who use kubernetes, a container like Docker.

Since auth is a necessary part of your application, but not a differntiator, you actually want an auth system that fades into the background. Both in the literal sense, where the UX isn't recognizable as anything separate from your application, and the figurative sense, where your engineers don't need to spend any time worrying about it or maintaining it.

You also want a friendly license for embedding the auth system into your code.

## APIs and data model

If you can get by with the lowest common denominator of authentication and authorization information, it might be easier to do so by strictly following the OIDC and SAML standards. But often you'll want more information about a user than these standards can provide. You may want to store custom attributes that are domain specific and therefore useful to your application, for example.

Any auth facade solution must provide a superior data model when compared to the standards in order to be worthwhile to implement. 

## Documentation

This was surprising to me. While documentation is useful in many areas, why is it so important for an auth facade? 

Because it lets you offload configuration of the connection between the auth facade and the upstream systems to people who know and maintain upstream systems. These employees of your clients won't be familiar with your application. In fact, they may resent the additional work that your application's installation is foisting on them. So making the configuration of the auth facade as well documented and simple as possible is going to make it easier to get your application working.

This leads you with two choices. You can maintain such documentation yourself, or you can rely on the auth provider to be a source of great docs.

## How can you implement the auth facade

FusionAuth is a great auth facade. It runs anywhere, integrates with both SAML and OIDC, provides a single, rich interface for your developers, and is well documented.

To begin implementing, review the identity provider and connector documentation to make sure that your enterprise's target identity providers are supported. You can also read a case studies of customers using FusionAuth in this fashion.

If FusionAuth fits your needs, download FusionAuth it and get going. If you are interested in packaging it as part of your application, please contact us to discuss a resellers agreement.
