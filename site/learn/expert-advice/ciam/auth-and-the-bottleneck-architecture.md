---
layout: advice
title: The Auth Bottleneck Pattern 
description: Why you might use a centralized user management system rather than having individual applications manange their own auth.
author: Dan Moore
image: advice/bottleneck/the-auth-bottleneck-pattern.png
category: CIAM
author: Dan Moore
date: 2020-09-08
dateModified: 2020-09-08
---

A common pattern for modern organizations is to centralize user management with a bottleneck architecture, both for customers and for employees. A user management system is provisioned and all authentication and authorization requests are routed through it. Rather than individual applications having their own auth components, the auth system provides a single point of control. If there are other user databases, some auth requests may be federated.

## The architectural pattern with OIDC and SAML

In this architectural pattern, applications delegate user management to a specific system designed for the purpose. Many applications can delegate their auth needs to a standards based system. Examples include custom applications written by internal teams, third party services used by employees, such as Salesforce and Zendesk, and applications used by customers, such as forums, help desk software, or account management. 

By choosing one user management application for your customer and employee needs, you reduce training time. You can also easily allow different types of users access to different types of applications.

There are a number of identity management standards, including OpenID Connect (OIDC), released in the mid 2010s, and Security Assertion Markup Language (SAML), which was standardized in the 2000s. Applications choosing to delegate user management typically support one or more of these standards.

If the protocol in use is OIDC, the delegating applications are called Relying Parties, or RPs. If the protocol is SAML, they are called Service Providers, or SPs. In either case, decisions about authentication, authorization, and account management, are shifted from the application to a central service.

In OIDC systems, this centralized auth system is referred to as an OpenID provider, or OP. For SAML based systems, it is called an Identity Provider, or IdP. The centralized system's scope includes:

* authentication - who is this user? 
* authorization - what can this user do?
* user management - registration, forgot password flows, two factor authentication, reporting, and more

However, an auth system isn't limited to just verifying users based on a local datastore. It can also federate to other providers of identity, such as Google, Facebook or internal directories such as Active Directory. Standards compliant providers adhering to the SAML or OIDC specifications may also be federated. It's even possible to tie [cloud vendors such as AWS](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create.html) into your identity provider.

Here's a diagram of the bottleneck architecture:

{% include _image.liquid src="/assets/img/advice/bottleneck/bottleneck-diagram.svg" alt="A common architectural pattern for user identity management systems." class="img-fluid" figure=false %}

The applications, in purple, rely on the centralized auth system, which is in gray. They'll send auth requests to one place. Depending on how the auth system is configured, the applications' requests for user information may be answered directly, based on information in the auth system's datastore. Or, alternately, auth requests for a given user can be relayed to the federated identity providers, in orange. 

## Benefits of a user auth service

This user management architecture enables single sign-on (SSO), which makes users' lives easier. They only have to remember username and password for all their applications. Among other benefits are increased visibility, decreased operational complexity, and increased authentication choice.

### Increased visibility and development speed

There is one application for user and application management. Because of this, implementing organization wide policies is easier, including those which are security or compliance related. Users have only one identity to maintain, so any changes, such as to their password or personal information, are easier.

This bottleneck also serves as a continuously maintained list of applications used by the organization. Knowing which services are in use, and seeing usage frequency, is as simple as signing into the auth service administration panel. This also helps the organization avoid buying apps with overlapping functionality.

If your auth system has mature user management functionality, it will accelerate custom application development by providing necessary commodity user management functionality. No more worrying about building a front end to allow customer service reps to lock accounts. Nor do you have to build a way to let end users reset their passwords or register.

### Operational simplicity

A centralized user auth service also makes it easy to turn accounts on and off. Onboarding a new employee becomes simpler, and offboarding departing employees is a matter of disabling their account in one place, rather than hunting down all the applications to which they have access. Or worse, leaving those accounts enabled.

There are additional benefits to end users, as well. While identifying people with username, password and multi-factor authentication is a secure and relatively convenient method, there may be times when an alternative such as a passwordless solution is a better user experience.  

### Meet your users where they are

As you might expect, different types of users have different third party accounts. If you are building a consumer focused application, offering sign on with Facebook is a great idea, because most of the world has a Facebook account. One less password for your potential users to remember; one less obstacle to signing in. 

On the other hand, if the application is aimed at enterprise customers, integrating with ActiveDirectory can help adoption, especially if you can deploy your identity provider on premises. If developers are your target market, GitHub authentication eases the sign-up process and also signals to them your understanding of their needs.

If your auth system allows for multiple identity providers, your application can meet users "where they are", rather than requiring them to create and manage a new account. 

If you work for a large organization, you may need to federate your user management system to other user datastores. Having a central service for your suite of applications means federation and integration only needs to be done once, rather than for each application you build.

## Challenges with SSO

Of course, nothing is perfect. There are challenges with this approach as well. Some technical, some not so much. 

First off is the [SSO tax](https://sso.tax/). Many third party applications don't support auth delegation until you are on an enterprise plan. Investigate required applications to see if and how they can act as a RP or SP to a centralized user management system before you decide to pursue the bottleneck architecture. 

Another organizational challenge is ensuring developers and end users actually use the organization's user management system. Some may want to use their old, familiar authentication solutions. Encourage everyone to work within these constraints by making adoption as easy as possible and clearly explaining the benefits. Providing examples of successful integrations can help with both of these.

Tying together the bottleneck system, the delegating applications, and the external identity providers requires effort. It can be simple; sometimes it's just following a tutorial on a website and adding a few lines of configuration. Other times it may be more complicated and may require coordination across multiple teams.

Beware of insecure or slow auth services. No one cares about authentication and authorization, except when it doesn't work. When was the last time you heard someone exclaim "I love that login page!"? People want to authenticate when and how they choose and have it work. They want to use the application, not sign in. Select a system that is robust, has great support, and is flexible enough to meet future needs.
