---
layout: blog-post
title: What to consider when migrating from Auth0?
description: What are things you need to consider when migrating off of Auth0?
author: Dan Moore
image: blogs/scaling-auth-system/auth-specific-scaling-challenges-header-image.png
category: blog
tags: upgrade-auth0
excerpt_separator: "<!--more-->"
---

Pssst. You may have heard that [Auth0 was recently acquired by Okta](https://www.okta.com/press-room/press-releases/okta-signs-agreement-to-acquire-auth0/). If you are considering your migration options, you may want to take a look at FusionAuth. We've had dozens of people reach out to learn more about FusionAuth, and our website has seen significantly more traffic. 

<!--more-->

FusionAuth and Auth0 have many similarities. Both have relatively friendly pricing structures, especially when you are starting out. Both allow you to get going quickly. Both Auth0 and FusionAuth wrap the complexity of modern authentication, be that social sign-on, SAML, or OIDC, in a simple package that is easy to use. They each make it easy to migrate your data in to their systems.

But the similarities run deeper than that. Both Auth0 and FusionAuth were built with developers in mind, have great APIs and documentation, and a number of supporting open source projects. And both have good customer service, with active forums and responsive customer support teams.


There are many differences. Here are just a few of them: FusionAuth offers true multi-tenancy, fully customizable UI, full consent modeling, support for families, better scalability, better data migration, flexible password hashing, better legacy backend support, advanced registration forms, custom events, unlimited SAML/OIDC connections, self-hosting, truly free option (no user limits), better support, better pricing, and no Okta. ;)



However, if you are thinking about moving authentication providers, you'll want to evaluate both your current situation and use of Auth0 and the alternatives both broadly and deeply.

## Broad evaluation

An authentication system is a critical part of your infrastructure. Just like a database, you want to make sure you can trust the software. If there's a commercial vendor behind it, you also want to make sure you can trust them. 

You can also code up or run your own auth system. This is definitely an option, but should be weighed against the opportunity cost. From ["Why outsource your auth system?"](https://fusionauth.io/blog/2021/01/20/why-outsource-auth/)

> Authentication is one of those components that you deal with all the time. Auth is a necessary part of any software product, but how you implement auth is not necessarily always the same. Careful consideration is needed, because your decision to outsource will not only impact speed of development, but also long-term product maintenance – you don't want to slow down time to market because you re-implemented an entire auth system unnecessarily, but you also don't want to use an auth system that is going to cause problems down the road.

Switching your auth provider is similar to switching out any other vendor, but there are some auth specific considerations. Here are some vendor agnostic articles about some of these considerations:

* ["Multi-Tenant vs. Single-Tenant IDaaS Solutions"](https://fusionauth.io/learn/expert-advice/identity-basics/multi-tenancy-vs-single-tenant-idaas-solutions/)
* ["Performing Due Diligence on Authentication Vendors"](https://fusionauth.io/learn/expert-advice/identity-basics/due-diligence-authentication-vendors/)
* ["Challenges of CIAM"](https://fusionauth.io/learn/expert-advice/ciam/challenges-of-ciam/)
* ["Making Sure Your Auth System Can Scale"](https://fusionauth.io/learn/expert-advice/identity-basics/making-sure-your-auth-system-scales/)

Performing this kind of evaluation has a few possible outcomes:

* You realize that Auth0 meets your needs and you hang tight. Maybe the acquisition will be smooth.
* You decide to revisit the issue in a few months, after the acquisition completes (July 31, 2021). Make a note in your calendar to start looking in June.
* You determine that a deeper look at alternatives makes sense at this time.

## Deep evaluation

Unfortunately, evaluating an auth system isn't as simple as looking at, say, a new web hosting provider. Auth systems, even those using standards such as OIDC and SAML, tend to be enmeshed deeply in other systems. This entanglement means that you need to test out any auth provider if you are considering the move.

In addition, there are many different ways to use auth systems. A solution that works well in a web based SaaS application aimed at consumers may be problematic in an on-premise application deployed to Kubernetes in an customer's environment.

Here are a number of different dimensions on which you could evaluate a system providing authentication, authorization and user management:

* self hosted or SaaS
* standalone application or library/framework you integrate
* open source or not
* standards support
* authentication, authorization, user management or all three?
* single sign-on (SSO) support
* integrations with other auth tech (such as LDAP)
* which OAuth grants are supported
* cost, both initial outlay and forecasted
* operational complexity
* support for your deployment environment
* specific features and customizability
* documentation and developer experience

For both of these reasons, it's best to do a proof of concept when you are considering an auth provider. When leaving Auth0 for, say, FusionAuth, you need to map the Auth0 functionality you use to FusionAuth. Run through the riskiest of your integrations to ensure your applications will continue to work.

Finally, you also have to make a plan to export your data. The most important data is typically user data, though your application could use Auth0's connections and not host a single user in the Auth0 managed database. You also want to make sure to move any connection data.

## Evaluating Auth0 functionality

Be aware that the functionality of permissions, roles and connections may not be the same between Auth0 and FusionAuth, or any other auth provider for that matter. 

This is different from user data; as long as you can migrate a login (a username or email) and a password hash, a user will be authenticated and successfully migrated. A partial list what may need to be migrated for your application to work properly includes the following:

* In Auth0, [Connections](https://auth0.com/docs/identityproviders) are a source of data for users. FusionAuth calls these [Identity Providers](/docs/v1/tech/identity-providers/).
* [Rules](https://auth0.com/docs/rules, https://auth0.com/docs/hooks[Hooks] and https://auth0.com/docs/actions[Actions] are ways for you to customize authentication or authorization workflows. FusionAuth has a similar concept called link:/docs/v1/tech/lambdas/[Lambdas].
* With Auth0, https://auth0.com/docs/applications/set-up-an-application[APIs, Applications and SSO Integrations] are what your users can log in to. They are also called Clients in the Auth0 documentation. FusionAuth refers to these as link:/docs/v1/tech/core-concepts/applications/[Applications]. 
* https://auth0.com/docs/get-started/learn-the-basics[Tenants] are a high level construct which groups other entities such as users and applications together. FusionAuth calls these link:/docs/v1/tech/core-concepts/tenants/[Tenants] as well. FusionAuth supports multi-tenant configuration by default.
* For Auth0, https://auth0.com/docs/authorization/rbac/roles[Roles and Permissions] provide information about what your users can do in your custom or off the shelf applications. FusionAuth has link:/docs/v1/tech/core-concepts/roles/[Roles] and they are defined on an Application by Application basis.
* Refresh tokens allow JWTs to be refreshed without a user logging in. These can be migrated using the link:/docs/v1/tech/apis/users/#import-refresh-tokens[Import Refresh Tokens API].

[NOTE]
====
In FusionAuth, users are explicitly mapped to applications with a link:/docs/v1/tech/core-concepts/registrations/[Registration]. 

Auth0, in contrast, gives users access to all Auth0 applications in a tenant by default. 
====

=== Universal Login

Auth0 provides https://auth0.com/docs/universal-login[Universal Login]. This is a complex, configurable login component that works with SPAs, native applications and web applications. 

FusionAuth's login experience is less complicated. You can choose to build your own login pages or use FusionAuth's hosted login pages. link:/docs/v1/tech/core-concepts/integration-points/#login-options[Read more about these choices].

Once you've planned your migration, the next step is to export your user data from Auth0.


You can use either the Auth0 management API or the Auth0 user interface to export user data. This guide uses the user interface, but if you have a large number of users, the https://auth0.com/docs/api/management/v2#!/Users/get_users[management API is recommended]. Auth0 also has a https://auth0.com/docs/support/export-data[high level export guide] worth reviewing.

If you are using the user interface, usernames, email addresses and other data can be obtained by installing an extension and downloading the data. The password hashes can be obtained by opening a support ticket.

Here's a brief video walking through the export process, which is further documented below.

video::wQklLZZP_3s[youtube,width=560,height=315]

=== Mapping User Attributes

The attributes of the User object in FusionAuth are link:/docs/v1/tech/apis/users/[well documented]. 

If there is an attribute in your Auth0 user which cannot be directly mapped to a FusionAuth attribute, you can place it to the `user.data` field. This field can store arbitrary JSON values and will be indexed and searchable.

