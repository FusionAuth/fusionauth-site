---
layout: blog-post
title: How to migrate from Azure AD B2C
description: How can you migrate your user data away from Azure AD B2C?
author: Dan Moore
image: blogs/migrate-from-cognito/how-to-migrate-from-amazon-cognito-header-image.png
category: blog
tags: topic-upgrade-azure-ad
excerpt_separator: "<!--more-->"
---

Azure AD B2C is a serverless CIAM offering from Azure with integration across many of those cloud services. It offers authentication and authorization for users. Azure AD B2C supports a number of standard OAuth grants, including the Authorization Code grant, the Implicit grant and the Client Credentials grant.

At FusionAuth, potential customers are interested in migrating from Azure AD B2C because of limitations, typically of UX, functionality or data control.

<!--more-->

This blog post will explain why and how you might choose to migrate from Azure AD B2C to another solution. This is more complicated than it might seem because you cannot access the password hashes of users stored in Azure AD B2C, which has impacts your ability to migrate them without impacting their login experience negatively.

## The many kinds of Azure AD

Azure AD is Microsoft Azure's name for an umbrella of related identity solutions. There are actually quite a few, used for different use cases.

* Azure AD B2C, their CIAM solution, which lets customers register, login, and manage their profile. Think Auth0, Cognito or FusionAuth.
* Azure AD, their employee/workforce solution. It's a directory, authentication and authorization system. Think Okta or AWS SSO.
* Azure AD EI, external identity management, for users outside your org.
* Azure AD DS, domain services supporting older Windows focused functionality. This offers a lot of what the original Active Directory provided.

This article will discuss migrating from Azure AD B2C, not any of the other identity solutions under the Azure AD brand.

## Weaknesses of Azure AD B2C

While [Azure AD B2C](https://azure.microsoft.com/en-us/services/active-directory/external-identities/b2c/) is a low cost auth service and a far better choice than rolling your own auth solution, it has some downsides. These include:

* It can be complex to implement.
* There is only one deployment model, a SaaS offering on Azure.
* The customer user interface is inflexible and difficult to customize.
* You can run Azure AD only in the geographies supported by Azure. In fact, you can't specify the exact location of your data. Here is [more about Azure AD B2C data residency](https://learn.microsoft.com/en-us/azure/active-directory-b2c/data-residency).
* The user storage is not multi-region. If the region that your user data is in is unavailable, you have few options.
* SMS pricing is expensive relative to other options.
* You can't backup or export all user data, notably password hashes.

These limitations may be acceptable initially, but eventually you may need a feature not provided by Azure AD B2C, such as a unique login provider or the OAuth device grant. Or perhaps you need fine-grained control over the user interface your customers will see. 

For whatever reason, you may decide to move your customer and user data from Azure AD B2C. Let's take a look at how you might do so.

## When you shouldn't migrate from Azure AD B2C

Like any tool, Azure AD B2C has strengths as well as weaknesses. When your application depends on unique features or if the upsides outweigh the downsides, keep on using Azure AD B2C.

Azure AD B2C can be budget and developer friendly if you are are all in on Azure. For example, if your usage is free, under 50,000 MAUs, and the user interface and other limitations of Azure AD B2C are acceptable, migration doesn't make much sense. Since Azure AD B2C is serverless, it makes it easy to "set and forget" and allows you to focus on other aspects of your application. You know, the features your users want.

In addition, if you need custom user login flows and can successfully navigate the user flow XML-based policy implementation, Azure AD B2C is a good fit.

## How to migrate

After you have decided to migrate from Azure AD B2C, the first decision you'll need to make is "Am I okay with forcing all my users to reset their passwords?" This unfortunate choice is required since Azure AD B2C won't allow you to export password hash. Consider this choice carefully because often users consider an email asking them to reset their passwords an implicit admission of a data breach.

{% include _callout-note.liquid content="This blog post gives general guidance on migration off of Azure AD B2C to any other auth provider. If you are looking for step by step instructions on how to migrate from Azure AD B2C to FusionAuth, please review our [Azure AD B2C migration guide](/docs/v1/tech/migration-guide/azureadb2c)." %}

If the answer is yes, you are okay forcing users to reset their password, you have the option of a point-in-time bulk migration. 

If the answer is no, then you will be instead looking at a more complicated scenario. This is often called a phased, drip or "slow" migration, where users are migrated one at a time as they log in.

In general, the more users you have and the less they need your application, the less you'll want to force password resets. However, a slow migration is more complex operationally, since some users will exist in the new system, some in Azure AD B2C.

If you aren't sure, you have the option of segmenting your user base and migrating one section. This will allow you to see what effect requiring a password change has on engagement and conversion.

You should also run a proof of concept or trial with any new auth providers you are considering. This is out of scope for this document, but please [read this article for more information on how to run a successful trial](/learn/expert-advice/identity-basics/try-before-you-buy).

Once you have decided how you want to migrate, you'll proceed with either a bulk migration of users or a slow migration. Let's look at the steps for a bulk migration first.

## Bulk migration from Azure AD B2C

The basic steps of a bulk migration are:

* Set up the new auth system. Make sure you map all functionality and data from Azure AD B2C to the new system.
* Retrieve all available user data from Azure AD B2C. You can do this with any [Microsoft Graph SDK](https://learn.microsoft.com/en-us/graph/sdks/sdk-installation). Here's an [example application which pulls this data](https://github.com/FusionAuth/fusionauth-example-azure-ad-bulk-export).
* Massage the exported user data into a format acceptable to your new provider, using whatever data transformation tools you are comfortable with.
* Upload the user data to the new provider. If you must provide a password when importing users, set it to a random high entropy string. No one will use this password, so don't record it anywhere.
* Create configuration in the new auth system corresponding to the client configuration previously set up in Azure AD B2C. You should also customize the user interface, messages, MFA methods and any other Azure AD B2C specific settings that are relevant. Yes, this is a lot of work to include in one bullet point. Unfortunately, these steps are extremely implementation dependent.
* Update your custom, COTS or OSS applications to point to the new auth system.
* Mark all uploaded users as needing a new password and notify them. The details of how to send this email are specific to the new system, but typically it will involve sending each user a unique email with a link.
* After the migration is complete, delete the Azure AD B2C applications and configuration to ensure that all of your users are authenticating against the new system.

You can either notify the users in bulk via email or update your login screens with a message to users that they will need to reset their password to gain access.

Here's the login flow before the bulk migration:

{% plantuml source: _diagrams/docs/guides/bulk-migration-before-azureadb2c.plantuml, alt: "Bulk migration login request flow before the migration." %}

Here's the login flow after the bulk migration, when Azure AD B2C no longer is involved in the login process:

{% plantuml source: _diagrams/docs/guides/bulk-migration-after-azureadb2c.plantuml, alt: "Bulk migration login request flow after the migration." %}

The benefits of a bulk migration include:

* You can move all your users at one time. Having a single source of truth for customer data is typically beneficial.
* Customer service reps, users, and others will have one place to update their data.
* You no longer have a dependency on Azure AD B2C; the transition is quick.
* You aren't paying for two systems simultaneously, in either money or employee effort.

The downsides of a bulk import are:

* You must require all users to reset their password.
* You'll have to build a script to retrieve the data from Azure AD B2C, modify it, and push it to the new system. This will require some engineering effort.
* There may be some downtime in the migration process.

Let's discuss the other option, a slow migration.

## A slow migration from Azure AD B2C

With a slow, or phased, migration, users are not required to reset their password. Instead, they log in to the new system, provide their username and password, which is then forwarded to Azure AD B2C. If the credentials are correct, the user is logged in. The new system can rehash and store the password along with other user data.

The connection between Azure AD B2C must be secure and should be augmented with IP restrictions, custom headers or client certificates; you don't want anyone to be able to pass credentials to Azure AD B2C. 

The Azure AD B2C endpoint is monitored by rate limiting and identity protection systems. If a dynamic threshold of failed authentications is exceeded, the identity protection system may identify a repeated IP address (i.e. from the the new system) as an attacker.

Here's a diagram of an initial user login during a slow migration:

{% plantuml source: _diagrams/docs/guides/slow-migration-azureadb2c.plantuml, alt: "Slow migration initial login request flow." %}

After the initial login, Azure AD B2C is no longer the system of record for that user. Any changes to this user, whether made by themselves, automated processes or customer service team members, will need to be made in the new system.

In subsequent logins, the original Azure AD B2C system is never consulted, as below.

{% plantuml source: _diagrams/docs/guides/slow-migration-subsequent-azureadb2c.plantuml, alt: "Slow migration subsequent login request flow." %}

The basic steps of a slow migration are:

* Set up the new system. Make sure you map all functionality and data from Azure AD B2C to the new system.
* Determine what constitutes "done" for this migration, since it is unlikely that every single user will log in and be migrated, no matter how long you run these two systems in parallel. You can see [more details on how to calculate that](/docs/v1/tech/migration-guide/general#migration-timeline).
* Set up a way for the new system to present user credentials to Azure AD B2C for an authentication event. The exact method will depend on new system features. This can be done with an Azure Function Lambda; see [this document](/docs/v1/tech/migration-guide/azureadb2c#configuring-the-azure-functionset-up-aws) for an example which works with FusionAuth.
* Create configuration in the new auth system corresponding to the client configuration previously set up in Azure AD B2C. You should also customize the user interface, messages, MFA methods and any other Azure AD B2C specific settings that are relevant.
* Update your custom, COTS or OSS applications to point to the new auth system.
* Wait for the migration to work as users log in. You can run reports periodically to determine if you've migrated enough users to shut it down.
* Decide what to do with unmigrated users. Options include abandoning them, a bulk migration, or contacting them to encourage a sign-in.
* After the migration is complete, delete the Azure AD B2C applications and configuration to ensure that all of your users are authenticating against the new system.

Slow migrations have less impact on your users, but they take more time. They also have more impact on your systems and employees. For instance, if a customer service representative needs to reset a password, they will have to determine if the user has been migrated to the new system or not before they can process the request. 

## Conclusion

This blog post offers an overview of an Azure AD B2C migration. No matter the new system, you'll need to decide between the bulk or slow migration, as well take specific steps to move your data and settings.

If you are looking for step by step instructions on how to move to FusionAuth from Azure AD B2C, please check out our [Azure AD B2C migration guide](/docs/v1/tech/migration-guide/azureadbc2).
