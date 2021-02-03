---
layout: blog-post
title: The Auth Bottleneck Pattern 
description: How and why to use a centralized user management system rather than having individual applications use their own auth components.
author: Dan Moore
image: blogs/bottleneck-pattern/the-auth-bottleneck-pattern.png
category: blog
tags: topic-auth-patterns
excerpt_separator: "<!--more-->"
---

One common pattern for modern organizations is to centralize user management with a bottleneck architecture. A solid user management system is provisioned and all authentication and authorization requests are routed through it, rather than individual applications having their own auth components. 

<!--more-->

## The Architectural Pattern With OIDC and SAML

In this architectural pattern, applications delegate user management to the user management system. Many kinds of applications can perform such delegation. Examples include custom applications written by internal teams, third party services used by employees, such as Salesforce and Zendesk, and applications used by customers, such as forums or account management. 

Like any serious architecture discussion, we'll need some acronyms and jargon. There are a few identity management standards, including OpenID Connect (OIDC), released in the mid 2010s, and Security Assertion Markup Language (SAML), which was standardized in the 2000s.

If the protocol in use is OIDC, applications delegating auth decisions are called Relying Parties, or RPs. If the protocol is SAML, the delegating applications are called Service Providers, or SPs. In either case, decisions about authentication or authorization, and often account management, are shifted from the application to a central service.

In OIDC systems, this centralized auth system is referred to as an OpenID provider, or OP. For SAML based systems, it is called an Identity Provider, or IdP. The system's scope includes:

* authentication - who is this user? 
* authorization - what can this user do?
* user management - registration, forgot password flows, two factor authentication, reporting, and more

However, an auth system isn't limited to just verifying users locally. It can also federate to other providers of identity, such as Google, HYPR or Facebook. In addition, standards compliant providers adhering to the SAML or OIDC specifications can be integrated.

Here's a diagram of the bottleneck architecture:

{% include _image.liquid src="/assets/img/blogs/bottleneck-pattern/bottleneck-diagram.png" alt="A common architectural pattern." class="img-fluid" figure=false %}

The applications, in purple, rely on the centralized auth system, which is in gray. They'll send all their auth requests to one place. Depending on how the auth system is configured, the applications' requests for user information may be answered directly, based on information in the auth system's datastore. Or, alternately, auth requests for a given user can be relayed to the federated identity providers, in orange. (You can read more about [the identity providers](/docs/v1/tech/identity-providers/) FusionAuth supports.)

## Benefits of a User Auth Service

This user management architecture enables single sign-on (SSO) and has substantial benefits when implemented. Among them are increased visibility, decreased operational complexity, and increased choice of auth method.

### Increased Visibility and Development Speed

There is one location for user and application management. Therefore, implementing organization wide policies is easier, including those which are security or compliance related. Users also have only one identity to maintain, so any changes, such as to their password or personal information, are relatively easy to make.

This bottleneck also serves as a well maintained list of applications used by the organization. That is, if everyone uses it. Knowing which services are in use, and seeing who is using them how often, is as simple as signing into the auth service administration panel. This also helps the organization avoid buying apps with overlapping functionality, since you can review the list of active applications. 

If your auth system has mature user management functionality, it will accelerate custom application development by providing often used services. No more worrying about building a front end to allow customer service reps to lock accounts. Nor do you have to build a way to let end users reset their passwords or register.

### Operational Ease

Such a centralized user auth service also makes it easy to turn accounts on and off. Onboarding a new employee becomes simpler, and offboarding departing employees is a matter of disabling their account in one place, rather than hunting down all the applications to which they have access. Or worse, leaving those accounts enabled.

There are additional benefits to end users, as well. While identifying people with username, password and multi-factor authentication is a secure and relatively convenient method, there may be times when an alternative is a better user experience.  


### Give Your Users the Experience They Want

As you might expect, different types of users have different third party accounts. If you have a consumer focused application, offering sign on with Facebook is a great idea, because everyone has a Facebook account. One less password for your potential users to remember, and one less obstacle to signing up. 

On the other hand, if the application is aimed at enterprise customers, integrating with ActiveDirectory can help adoption. If developers are your target market, GitHub authentication eases the sign-up process as well as signals to them that you understand their needs.

If your auth system allows for multiple different identity providers, your application can meet users "where they are", rather than requiring them to create and manage a new account. 

If you work for a large organization, you may need to federate your user management system, using one of the standards such as OIDC, to other user datastores. Having a central service for your suite of applications means federation and integration only needs to be done once, rather than for each application you build.

## Challenges With SSO

Of course, nothing is perfect. There are challenges with this approach as well. Some technical, some not so much. 

First off is the [SSO tax](https://sso.tax/). Many third party applications don't support this user auth delegation until you are on an enterprise plan. Ouch. Investigate required applications to see if and how they can act as a RP or SP to a centralized user management system before you decide to pursue this architecture. 

Another organizational challenge is ensuring developers and end users actually use the organization's user management system. Some may want to use their old, familiar authentication solutions. Encourage everyone to work within these constraints by making adoption as easy as possible and clearly explaining the benefits. Providing examples of successful integrations can help with both of these.

Tying together the bottleneck system, the delegating applications, and the external identity providers requires effort. Sometimes it is as simple as following a tutorial on a website and adding a few lines of configuration. Other times it may be more complicated and may require support.

Finally, beware of insecure or slow auth services. No one cares about authentication and authorization, except when it doesn't work. When was the last time you heard someone exclaim "I love that login page!"? People want to log in when and how they choose and have it work, so they can get on to the task they need to accomplish. Select a system that is robust, has great support, and is flexible enough to meet future needs.

## See It In Action See With HYPR and FusionAuth

If you'd like to see how easy it is to configure FusionAuth to serve as an centralized authentication and authorization service, HYPR and FusionAuth are hosting a webinar on Thursday, July 16 2020. 

In less than 15 minutes, Zendesk will be set up as an application delegating auth decisions to FusionAuth (well, if you want to be technical, as an SP using SAML). HYPR will be configured as an identity provider. At the end, a user will be able to sign into Zendesk using HYPR's Passwordless technology. 

[Sign up for the webinar](https://get.hypr.com/fusionauth-webcast){:.button .brochure .orange .text-larger}

