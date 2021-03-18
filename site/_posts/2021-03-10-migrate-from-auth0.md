---
layout: blog-post
title: Migrating off of Auth0? Here's what you need to know
description: You aren't sure about the Okta acquisition. What are things you need to consider when migrating off of Auth0?
author: Dan Moore
image: blogs/migrating-off-auth0/migrating-off-of-auth0-heres-what-you-need-to-know-header-image.png
category: blog
tags: topic-upgrade-auth0
excerpt_separator: "<!--more-->"
---

Pssst. You may have heard that [Auth0 was recently acquired by Okta](https://www.okta.com/press-room/press-releases/okta-signs-agreement-to-acquire-auth0/). If this has you considering migration options, read on. This post will provide a strategy for determining if a migration makes sense, and discuss what you'll need to consider if it does.

<!--more-->

I'll be using FusionAuth as an example migration destination, but the investigation and feature mapping I discuss can be used to prepare a move to any Auth0 competitor. That said, since the announcement our website has seen significantly more traffic and we've had dozens of people reach out to learn more about FusionAuth.

## FusionAuth vs Auth0

FusionAuth and Auth0 have many similarities. Both allow you to get started quickly. They both the complexity of modern authentication, whether it be social sign-on, SAML, or OIDC, in a complete, easy to use package. Each make it easy to migrate data into their systems. But the similarities run deeper than that. Both Auth0 and FusionAuth were built with developers in mind. This means great APIs and documentation as well as support for open source projects. Both have good customer service, with active forums and responsive customer support teams.

However, Auth0 and FusionAuth have differences too. Here are some of the things that FusionAuth offers that Auth0 does not:

* Fully customizable UI
* A robuse consent data model
* Support for parent/child relationships in the auth system
* Flexible password hashing/bring your own algorithm
* Better legacy backend support
* Advanced registration forms
* Unlimited SAML/OIDC connections
* The ability to self-host
* Unlimited tenants
* A truly free option with no limits on the number of users when you self host the community edition

Regardless of FusionAuth's strengths, a migration is a good time to evaluate your current system and alternatives. It's good to look at your current Auth0 system and the alternatives both broadly and deeply.

## Broad evaluation

An authentication system is a critical part of your infrastructure. Just like a database, you want to make sure you can trust the software. If there's a commercial vendor behind it, you need to make sure you can trust that company too.

One alternative we hear about, which requires more trust in your team and less in an external software system, is coding up and running your own auth system. This is definitely an option, but its benefits should be weighed against the opportunity cost. Again, consider the database analogy. Should you build your own relational database? I'm sure there are situations where it makes sense, but 99% of the time using an existing solution is a better choice. 

Joe Stech, in ["Why outsource your auth system?"](https://fusionauth.io/blog/2021/01/20/why-outsource-auth/), wrote:

> Authentication is one of those components that you deal with all the time. Auth is a necessary part of any software product, but how you implement auth is not necessarily always the same. Careful consideration is needed, because your decision to outsource will not only impact speed of development, but also long-term product maintenance – you don't want to slow down time to market because you re-implemented an entire auth system unnecessarily, but you also don't want to use an auth system that is going to cause problems down the road.

Switching your auth provider is similar to migrating from any other vendor in many ways. However, there are some specific considerations worth thinking about. Below are some vendor agnostic articles about these topics.

* Learn about different tenancy models: ["Multi-Tenant vs. Single-Tenant IDaaS Solutions"](/learn/expert-advice/identity-basics/multi-tenancy-vs-single-tenant-idaas-solutions/)
* Due diligence to perform on any auth vendor: ["Performing Due Diligence on Authentication Vendors"](/learn/expert-advice/identity-basics/due-diligence-authentication-vendors/)
* A list of the challenges of customer identity and access management: ["Challenges of CIAM"](/learn/expert-advice/ciam/challenges-of-ciam/)
* Don't forget perspectives outside of engineering: ["Outsourcing auth: how to get buy-in from your team"](/blog/2021/02/03/outsourced-auth-team-buy-in/)
* Auth system scalability challenges: ["Making Sure Your Auth System Can Scale"](/learn/expert-advice/identity-basics/making-sure-your-auth-system-scales/)

There are a number of different dimensions on which you could evaluate a system providing authentication, authorization and user management:

* Self hosted or SaaS
* Standalone application or library/framework
* Open source or not
* Standards support
* Core functionality: authentication, authorization, user management or all three?
* Single sign-on (SSO) support
* Integrations with other auth technology such as LDAP
* Which OAuth grants are supported
* Cost, both initial outlay and forecasted future spend
* Operational complexity
* Support for your deployment environment
* Specific features and customizability
* Documentation and developer experience

I don't know your use cases, so I can't give you specific advice, but [here's a list of auth system providers](https://solutionsreview.com/identity-management/the-30-best-identity-management-companies/) to kickstart your evaluation. 

At this point in an evaluation, I'm a big fan of feature matrices, where you determine your requirements and "nice to haves" based on usage and knowledge. Refine them with your team and research. You're looking to complete a broad survey of available solutions, not dive deep into a few. Don't forget to include your current solution, Auth0, in your matrix. Performing such a survey has a few possible outcomes:

* Auth0 meets your needs adequately, so you will hang tight. Maybe the acquisition will be smooth. Off to the next meeting!
* You decide to revisit the issue the next time your Auth0 contract is up for renewal. Make a note in your calendar to allow a few months to evaluate and possibly migrate.
* You determine that there are a few alternatives worth a closer look. Time to prototype.

## Why you should prototype before deciding

Evaluating an auth system isn't simple. Auth systems, even those supporting standards such as OAuth, OIDC and SAML, are enmeshed deeply in other systems. So a migration is similar to switching a content management system. Because of the complexity, you want to spend some time playing with alternatives to make the best choice. You should build at the least a small integration with any auth provider under serious consideration.

In addition, there are many different ways to use auth systems, as alluded to above. A solution that works well for a multi-tenant web-based consumer SaaS application where social sign-on is critical may fall short in an on-premise application deployed to Kubernetes within an enterprise customer's environment.

For both of these reasons, it's best to do a proof of concept. When leaving Auth0 for, say, FusionAuth, you need to map the Auth0 functionality used to the new provider. You can [download FusionAuth](/download/) and kick the tires without talking to a sales person. 

Other providers may require a conversation to get access, but take the time to do this if you are considering them seriously. Don't move forward without performing a proof of concept. You'll thank me later.

My rule of thumb is to prototype the riskiest integration. Doing so ensures applications have a higher chance of working smoothly with the new provider; hey, nothing is 100% guaranteed. It also allows you to get a sense of the responsiveness of customer support as well as the quality of documentation.

## Evaluating Auth0 functionality

Each part of the Auth0 system used by your applications should be cataloged and compared with functionality of the new system. For example, permissions, roles and connections won't be the same between Auth0 and any other auth provider. User data, on the other hand, is typically pretty portable. As long as you can migrate a login (a username or email) and a password hash, a user can be successfully moved. 

A partial list of what may need to be migrated off of Auth0 for your application or applications to work properly:

* Users are entities which can log in. This concept is pretty common across auth systems.
* In Auth0, [Connections](https://auth0.com/docs/identityproviders) are a source of data for users. FusionAuth calls these [Identity Providers](/docs/v1/tech/identity-providers/).
* [Rules](https://auth0.com/docs/rules), [Hooks](https://auth0.com/docs/hooks) and [Actions](https://auth0.com/docs/actions) are ways for you to customize authentication or authorization workflows. FusionAuth has a similar concept called [Lambdas](/docs/v1/tech/lambdas/).
* With Auth0, [APIs, Applications and SSO Integrations](https://auth0.com/docs/applications/set-up-an-application) are what your users can log in to. They are also called Clients in the Auth0 documentation. FusionAuth refers to these as [Applications](/docs/v1/tech/core-concepts/applications/).
* [Tenants](https://auth0.com/docs/get-started/learn-the-basics) are a high level construct which groups other entities such as Users and Applications together. FusionAuth calls these [Tenants](/docs/v1/tech/core-concepts/tenants/) as well.
* For Auth0, [Roles and Permissions](https://auth0.com/docs/authorization/rbac/roles) provide information about what your users can do in your custom or off the shelf applications. FusionAuth has [Roles](/docs/v1/tech/core-concepts/roles/) as well; they are defined on an Application by Application basis.

One example of a detailed difference that might trip you up, illustrating the importance of a prototype, is that in FusionAuth, users are explicitly mapped to applications with a [Registration](/docs/v1/tech/core-concepts/registrations/). Auth0, on the other hand, allows users access to all Auth0 applications within a tenant by default. Such details are why there's no substitute for a proof of concept trialling alternatives you are seriously considering.

However, make sure you have clear goalposts for when a prototype is "good enough". You aren't performing a full fledged migration; you haven't committed to this particular provider. You want to know enough to be able to make an intelligent decision. But there'll always be unexpected hiccups, unfortunately. Acknowledging that tension and allowing for the unknown is part of any migration.

### Non-standard functionality

There are other Auth0 features that you'll need to find alternatives for. In other words, often you can't migrate the only configuration discussed above. 

For example, Auth0 provides [Universal Login](https://auth0.com/docs/universal-login). This is a complex, configurable login component that works with SPAs, native apps and web applications. FusionAuth's login experience, in contrast, is less complicated. You can choose to [build your own login pages or use FusionAuth's hosted login pages](/docs/v1/tech/core-concepts/integration-points/#login-options). 

Any extensions used from the Auth0 marketplace should also be cataloged and evaluated. Equivalent functionality must be found or built.

## Next steps

At the end of the deep dive evaluation, you should have picked a new solution. Now the real work of the migration begins. But don't forget your data! You also should plan to migrate this out of Auth0. 

The most important data is usually the aforementioned user data, though your application could only use Connections and not have a single user in an Auth0 managed database. If your application uses federation, plan to migrate that configuration as well. 

For much more on moving user data and other migration topics, [please check out the Auth0 migration guide](/docs/v1/tech/guides/auth0-migration/).
