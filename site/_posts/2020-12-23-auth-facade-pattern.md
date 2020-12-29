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

I love talking to FusionAuth customers and community members. In recent conversations I've seen a usage pattern pop up and I wanted to document it.

First, the problem: you and your team are building an application which will deploy onsite. This could be into a data center, an isolated network, or a private cloud. 

<!--more-->

You might do this for a variety of reasons:

* Data gravity, when your application needs to go to the data because there's enough of it that the data isn't coming to you for cost or performance reasons.
* Security of confidential data, when the customer needs to have the data remain in their hands.
* Intermittent or lossy connectivity to the internet due to the location of the deployment.

All of these stem from customer demand; you need to meet your customers where they are. These all mean that your production deployment environment is out of your control. This situtation was common before the rise of SaaS, and its very complexities led to that architecture's proliferation. Typical SaaS solutions, whether for monitoring, auth or analytics won't work in this environment.

There's a lot of complexity in deploying onsite applications, though technologies such as kubernetes make it somewhat easier. One complicated piece can be the authentication of users in your application.

Your customers want to use their own auth systems. The enterprise doesn't want to have Yet Another User Database to maintain. They want your application to authenticate its users against an existing user datastore. This may be Azure Active Directory, Okta, or another identity provider. This identity provider is run by your customer's employees and may support OIDC or SAML.

At the same time, you want to ensure that your developers focus on building the application, not auth integrations. You especially want to make sure to avoid debugging authentication in prod environments you don't control, as much as possible.

As an enterprise software developer, you have a couple of options for handling authentication in this scenario:

* Test and document how your application can be configured to use an upstream provider. You can minimize the costs by limiting the environments into which you deploy. However, this may cause potential customers to pass. This is a roll your own solution and requires insight into your customers deployment environments. 
* Code to the OIDC and/or SAML specs and hope that gives you all the data you need for your user store. Plan to spend some time debugging how your app works against common solutions. This is more conventional federation. 
* Use an auth facade.

The auth facade, as any [good facade should](https://en.wikipedia.org/wiki/Facade_pattern), hides a complex subsystem from a client. In this case, the hidden component is your client's identity provider.

As part of your application, you ship an embedded auth and user management system. All auth functionality is routed through this component, and it is configured to communicate with upstream authentication providers. 

TBD diagram? app in box with auth system, talking to other backend systems

The auth facade is more than just federation, however. Federation is a good start, but you need more functionality, support and documentation than what is offered by standards. When you use an auth facade, you get the following benefits:

* A single, consistent interface for your developers to code against.
* An easy, deployable, compact auth system which runs everywhere.
* A rich set of APIs and complete data model.
* Ample documentation for various upstream providers.

Let's talk a bit more about each of these.

## Developer interface

Your developers will need to integrate with some auth system to know which users can access the application, as well as what fucntionality will be made available to each user. By using the auth facade, your devs only need to learn how to integrate with one system, rather than any system your clients may use. This makes development easier and frees up more time for your devs to be building the features of your application. 

Additionally, when there are bugs in the auth system, you may be able to replicate them in your local environment, in the interaction between your application and the facade. Alternatively, the bug may occur in communication between the auth facade system and the upstream provider, due to a misconfiguration or bug in the auth system. This seperation of concerns makes it easier to track down issues.

You'll want a responsive team behind the auth facade when there are issues. You don't want to keep your customers waiting for a fix.

## Deployable auth system

When evaluating auth facade solutions, you want to make sure you can deploy the system providing the facade anywhere. This rules out any SaaS based system, unless your enterprise clients are deploying your application into a network with internet connectivity; this is not always a given, and being able to support airgapped or isolated networks can be a strong differentiator for your application.

Ensure that your application is easily deployable, and that the auth system is deployable in a similar manner. Depending on customers' needs, you may want to deploy in a unix friendly package like an RPM or DEB, a generic software package like a zip file, or, for the cutting edge clients who use kubernetes, a container like Docker.

Since auth is a necessary part of your application, but not a differntiator, you actually want an auth system that fades into the background. Both in the literal sense, where the UX isn't recognizable as anything separate from your application, and the figurative sense, where your engineers don't need to spend any time worrying about it or maintaining it.

You also want a friendly license for embedding the auth system into your code. I am not a lawyer, but ensure you understand the licensing ramifications of any open source code you include in your app. Some open source projects offer dual licensing, which may be a viable option.

## APIs and data model

If the lowest common denominator of authentication and authorization information works for your needs, following the OIDC and SAML standards may be enough. But often you'll want more information about a user than these standards can provide. You may want to store custom domain specific user attributes, for example.

Any auth facade solution must provide a superior data model when compared to the standards in order to be worthwhile to implement. 

## Documentation

In talking to customers, this surprised me. While documentation is often useful, why is it so important for an auth facade? 

The answer? Because it lets your team offload configuration of the connection between the auth facade and the upstream systems to people who know and maintain those systems. These employees of your clients won't be familiar with your application. In fact, they may resent the additional work that your application's installation requires of them. Making the configuration of the auth facade as well documented and simple as possible is going to make it easier to get your application working.

This leads you with two choices. Maintain such documentation yourself, or rely on the auth provider to be a source of great docs.

## How can you implement the auth facade with FusionAuth

As implied above, many customer have found FusionAuth to be a great auth facade solution. It runs anywhere, integrates with both SAML and OIDC, provides a single, rich interface for your developers, and is well documented.

To learn more or begin implementing, review the [identity provider](/docs/v1/tech/identity-providers/) and [connector](/docs/v1/tech/connectors/) documentation to make sure that your enterprise's target identity providers are supported. [Contact us](/contact/) if they aren't; we'd love to learn more. You can also read [case](/resources/dealcloser-case-study.pdf) [studies](/resources/unsupervised-case-study.pdf) of customers using FusionAuth as an auth facade.

If FusionAuth fits your needs, download FusionAuth it and get going. If you are interested in packaging it as part of your application, please contact us to discuss a resellers agreement.
