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

During conversations with FusionAuth customers, I have seen a common deployment pattern I call the "Auth Facade". This pattern is useful when deploying software to heterogenous environments. These software networks are run by your customers and you may have limited insight into their setup. 

First, the problem: you and your team are building an application which will deploy onsite. This could be into a data center, an isolated network, or a private cloud. 

<!--more-->

You might do this for a variety of reasons:

* Data gravity, when your application needs to go to the data because there's enough of it that the data isn't coming to you for cost or performance reasons.
* Security of confidential data, when the customer needs to have the data remain in their hands.
* Intermittent or lossy connectivity to the internet due to the location of the deployment.

All of these stem from customer demand; you need to meet your customers where they are. These all mean that your production deployment environment is out of your control. This situtation was common before the rise of SaaS, and its very complexities led to that architecture's proliferation. Typical SaaS solutions, whether for monitoring, auth or analytics won't work in this environment.

At the same time, your enterprise customer doesn't want Yet Another User Database to maintain. Instead the stakeholders want your application to authenticate users against an existing datastore. This may be Azure Active Directory, Okta, or another identity provider. This identity provider is run by your customer's employees and may support OIDC or SAML.

However, you want to ensure that your developers focus on building the application, not auth integrations. You especially want to make sure to avoid debugging authentication in prod environments you don't control, as much as possible.

Finally, your application has needs around user data as well. Whether that is role based authorization, auditing access or displaying a 'Welcome Dan' message, your application will need access to user data.

As an enterprise software developer, you have a couple of options to solve this problem:

* Test and document how your application can be configured to use an upstream provider. This is a roll your own solution and requires knowledge of your customers deployment environments. You'll want to provide and test configuration options for all the major providers.
* Code to the OIDC and SAML specs, since most enterprise providers will support these. Then you need to structure your user data needs around what these provide. This is the pure federation option.
* Use an auth facade.

Like any [facade](https://en.wikipedia.org/wiki/Facade_pattern), the auth facade hides a subsystem from a client. In this case, the subsystem is your client's identity provider. As part of your application, you ship an embedded auth and user management system. All auth functionality is routed through this component, and it is configured to communicate with upstream authentication providers. 

{% include _image.liquid src="/assets/img/blogs/auth-facade/auth-facade-pattern.svg" alt="A common architectural pattern." class="img-fluid" figure=false %}

The auth facade provides more than just authentication and authorization federation, though. Federation is a good start, but sometimes you need more functionality, support and documentation than the standards provide. When you use an auth facade, you get the following:

* A single interface for your developers to access and manage user data
* An easy, deployable, compact auth system which runs everywhere
* A rich set of APIs and data models
* Ample documentation for various upstream providers 

Let's talk a bit more about each of these.

## Developer interface

Your developers will need to have some kind of auth system in order to know which users can access the application, as well as what particular functionality is available to them. By using the auth facade, your devs only learn how to integrate with one system, rather than every system your clients may use. This makes development easier and also frees up engineering time and focus for the features of your application. 

Additionally, when there are bugs in the auth system, there are two common locations:

* between your application and the facade
* between the auth facade system and the upstream provider

In the former case, you have everything you need to debug what is causing an issue for your customer. In the latter, you'll be leveraging all the troubleshooting and bugfixing the auth facade system has performed against the upstream provider. In either case, separating the concerns makes it easier to track down issues.

You'll want a responsive team behind the auth facade system when issues arise. You don't want to keep your customers waiting for a fix.

## Deployable auth system

When evaluating auth facade solutions, make sure you can deploy the system providing the facade into a variety of customer environments. This rules out any SaaS, unless your enterprise clients are deploying your application into a network with internet connectivity or the SaaS provider can deploy into their network. Being able to support airgapped or isolated networks can be a strong differentiator for your application, especially if the data it is accessing is sensitive.

Ensure your application is easily deployable, and that the auth system is deployed using the same methods. Doing so lowers the installation complexity. Depending on customers' needs, you may want to deploy in a unix friendly package such as an RPM or DEB, a generic software package like a zip file, or, for the cutting edge clients using kubernetes, a container solution such as Docker.

Since auth is a necessary part of your application, but not a differntiator, an auth system that fades into the background is best. This should happen both in the literal sense, with a user interface that isn't recognizable as separate from your application, and the figurative sense, where your engineers minimize time spent worrying about it or maintaining it.

You also want a friendly license for embedding the auth system into your code. I am not a lawyer, but ensure you understand the licensing ramifications of any source code you include in your app. Some open source projects offer dual licensing, which may be a viable option.

## APIs and data model

If you can get by with the lowest common denominator of authentication and authorization information, strictly follow the OIDC and SAML standards and you'll be happy. But often the application you are building will need more information about a user than these standards can provide. You may want to store custom domain specific attributes useful to your application, for example.

Any auth facade solution must provide a superior data model when compared to the standards in order to be worthwhile to implement. If it doesn't, just use the standards to interface with the upstream provider.

## Documentation

As I talked to customers, they pointed out the benefits of documentation, which was surprising to me. While documentation is often useful, why is it so important for an auth facade? 

Documentation lets you offload configuration of the connection between the auth facade and the upstream systems to people who know and maintain those upstream systems. These employees of your clients won't be familiar with your application. 

In fact, they may resent the additional work that your application's installation requires of them. Making the configuration of the auth facade well documented and as simple as possible will make it easier to get your application working in your customer's environment.

You therefore have two choices:

* Maintain such documentation yourself
* Rely on the auth facade provider to create and offer great docs

Guess which one is easier for your engineering team?

## How can you implement the auth facade with FusionAuth

FusionAuth is a great choice for an auth facade. It runs anywhere, integrates with both SAML and OIDC as well as other upstream providers, provides a single, rich interface for your developers, and is well documented.

To begin implementing the auth facade with FusionAuth, review the FusionAuth [Identity Provider](/docs/v1/tech/identity-providers/) and [Connector](/docs/v1/tech/connectors/) documentation to make sure that your client's identity providers are supported. [Contact us](/contact/) if they aren't; we'd love to learn more. You can also read a case studies of customers using FusionAuth in this fashion, such as this one from [Unsupervised](/resources/unsupervised-case-study.pdf) (PDF).

If you think FusionAuth fits your needs, [download FusionAuth](/download/), kick the tires and build out a proof of concept. If you are interested in packaging it as part of your application, please contact us to discuss a resellers agreement.
