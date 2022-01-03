---
layout: blog-post
title: How to migrate from Amazon Cognito
description: How can you migrate away from Amazon Cognito?
author: Dan Moore
image: blogs/release-1-31/product-update-fusionauth-1-31.png
category: blog
tags: topic-upgrade-cognito
excerpt_separator: "<!--more-->"
---

Amazon Cognito is a serverless CIAM service with deep AWS integration. It offers authentication and authorization with a variety of OAuth grants, including the Authorization Code grant, the Implicit grant and the Client Credentials grant. This blog post will discuss why and how you might choose to migrate off of Amazon Cognito.

<!--more-->

## Cognito downsides

While Amazon Cognito is a low cost auth service and a far better choice than rolling your own auth solution, it has some downsides:

* There is only one deployment model, SaaS
* You can run it only in the geographies AWS supports
* The interface presented to your customers or users is inflexible
* It doesn't support localization #TODO
* You can't backup or export all of your user data, including password hashes
* SAML users are expensive once you have more than the 50 provided by the free tier
* It has received relatively few improvements in the last few years

These limitations may be acceptable initially, but after a time you may need a feature not provided by Amazon Cognito, such as a unique login provider or the OAuth device grant. Or perhaps you want more control over the login user interface your customers will see. 

For whatever reason, you may decide you need to move your customer and user data from Amazon Cognito. Let's take a look at how you might do so.

## When you shouldn't migrate

Amazon Cognito has strengths as well as weaknesses, and if your application depends on unique features or the upsides outweigh the downsides, you should remain on Cognito.

If you have usage in the free tier, with under 50,000 normal MAUs, and the user interface and other limitations of Amazon Cognito are acceptable, migration may not make sense. Cognito's serverless nature makes it very easy to "set and forget" and let you focus on other aspects of your application.

In addition, if you need Cognito's unique deep integration with AWS, including its ability to grant authenticated users AWS credentials to access resources such as an S3 bucket or rows in a DynamoDB table, migration won't sense. No other auth provider will provide such access natively, though you may be able to generate temporary credentials and share them with your users with custom code.

## How to migrate

When you are thinking about migrating off of Amazon Cognito, the very first decision after you've committed to a migration is "Am I okay with forcing all my users to reset their passwords?".

{% include _callout-note.liquid content="This blog post gives general guidance on migration off of Amazon Cognito. If you are looking for step by step instructions on how to migrate from Amazon Cognito to FusionAuth, please review our [Amazon Cognito migration guide](/docs/v1/tech/migration-guide/cognito/)." %}

If the answer is yes, then you are looking at a straightforward bulk migration. 

If the answer is no, then you will be instead looking at a phased or "slow" migration.

In general, the more users you have and the less they are required to use your application, the less impact you'll want to have on them, and the more likely it is you won't want to force them to reset their passwords. However, a slow migration is more complex operationally (some users will exist in the new system, some in Cognito). One option is to run a test on a small portion of your userbase and see what effect requiring a password change has on engagement and conversion.

Let's look at a bulk migration first.

## Bulk migration

The basic steps of a bulk migration are:

* Set up the new system. Make sure you map all functionality and data from Cognito to the new system.
* Retrieve all available user data from Cognito. You can do this using the AWS CLI or any other AWS API client such as boto3.
* Massage it into a format acceptable to your new provider, using whatever data transformation tools you are comfortable with.
* Upload it to the new provider. If you must provide a password, set it to a random string.
* Create configuration in the new provider corresponding to the client configuration set up in Amazon Cognito.
* Update your applications to have users log in to the new system.
* Mark all uploaded users as needing a new password. Notify them in some manner of this fact.
* Disable the Cognito user pools to ensure that all users are using the new system.

You could notify the users in bulk, via email or other communication mechanism. You could also update your login screens to indicate to users that they might need to reset their password in the new system.

Here's the login flow before the bulk migration:

{% plantuml source: _diagrams/docs/guides/bulk-migration-before.plantuml, alt: "Bulk migration login request flow before the migration." %}

Here's the login flow after the bulk migration, when Amazon Cognito no longer is involved in the login process:

{% plantuml source: _diagrams/docs/guides/bulk-migration-after.plantuml, alt: "Bulk migration login request flow after the migration." %}


The benefits of a bulk migration include:

* You can move your users all at once. Having a single source of truth for your customer data is generally beneficial.
* You no longer have a dependency on Cognito; the transition is quick.

The downsides of a bulk import:

* You must require all users to reset their password. In general, this requirement is frustrating to your users and may impact their usage of your application.
* You'll have to build a script to retrieve the data from Cognito and push it to the new system.

## A slow migration from Amazon Cognito

With a slow or phased migration, users don't reset their password. Instead, they log in to the new system, provide their username and password which is then forwarded to Amazon Cognito. If the credentials are correct, the user is logged in. Since the new system has the user's password in plaintext during the login process, it can rehash and store the password. 

{% plantuml source: _diagrams/docs/guides/slow-migration.plantuml, alt: "Slow migration initial login request flow." %}

After the initial login, Cognito is no longer the system of record for that user.

Any changes to this user, whether made by themselves, automated processes or customer service reps, will need to be made in the new system.

{% plantuml source: _diagrams/docs/guides/slow-migration-subsequent.plantuml, alt: "Slow migration subsequent login request flow." %}

The basic steps of a slow migration are:

* Set up the new system. Make sure you map all functionality and data from Cognito to the new system.
* Determine what constitutes "done" for this migration, since it is unlikely that every single user will login and be migrated for any given period of time. You can see [more details on how to calculate that here](/docs/v1/tech/migration-guide/general/#migration-timeline).
* Set up a way for the new system to present user credentials to Amazon Cognito for an authentication event. The exact method will depend on new system features. This can be done with an AWS Lambda; see [this document](/docs/v1/tech/migration-guide/cognito/#set-up-aws) for an example which works with FusionAuth.
* Create configuration in the new provider corresponding to the client configuration set up in Amazon Cognito.
* Update your applications to have users log in to the new system.
* Wait, running reports periodically to determine if you've migrated enough users to call it a success.
* Decide what to do with users that have not been migrated. You can abandon them, bulk migrate them, or contact them to try to get them to log in.

Slow migrations have less impact on your users, but more impact on your systems and employees. 

For instance, if a customer service rep needs to reset a password, they will have to determine if the user has been migrated to the new system or not before they can determine where to process this password reset request. 

## Conclusion

This blog post provided an overview of an Amazon Cognito migration. No matter what the new target system is, you'll need to decide between the bulk or slow migration, as well as pursue the specific steps.

If you are looking for step by step instructions on how to move to FusionAuth from Amazon Cognito, please take a look at our [Amazon Cognito migration guide](/docs/v1/tech/migration-guide/cognito/).
