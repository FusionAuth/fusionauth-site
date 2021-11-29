---
layout: blog-post
title: How To Migrate Off of Amazon Cognito
description: How can you migrate away from Amazon Cognito?
author: Dan Moore
image: blogs/release-1-31/product-update-fusionauth-1-31.png
category: blog
tags: topic-upgrade-cognito
excerpt_separator: "<!--more-->"
---

Amazon Cognito is a serverless CIAM service with deep integration into the AWS environment. It offers authentication and authorization with a variety of OAuth grants, including the Authorization Code grant, the Implicit grant and the Client Credentials grant. This blog post will discuss why and how you might migrate off of Amazon Cognito.

<!--more-->

## Cognito downsides

While Amazon Cognito is a low cost auth service and a far better choice than rolling your own solution, it has some downsides:

* There is only one deployment model, SaaS, in the geographies AWS supports
* The user interface is inflexible
* It doesn't support localization
* You can't backup or export all of your user data, including password hashes
* SAML users are expensive once you have more than the 50 provided by the free tier

These limitations may be acceptable, but perhaps you need a feature not provided by Amazon Cognito, such as a unique login provider or the device grant, or you want more control over the user interface your customers will see. 

For whatever reason, you may decide you need to move your customer and user data from Amazon Cognito. Let's take a look at how you might do so.

## When you shouldn't migrate

Amazon Cognito has strengths as well as weaknesses, and if your application depends on unique features or the upsides outweigh the downsides, you should remain on Cognito.

If you have usage in the free tier, with under 50,000 normal MAUs, and the user interface and other limitations of Amazon Cognito are acceptable, migration may not make sense. Cognito's serverless nature makes it very easy to "set and forget" and let you focus on other aspects of your application.

In addition, if you need Cognito's deep integration with AWS, including its ability to grant authenticated users AWS credentials to access resources such as an S3 bucket or rows in a DynamoDB table, migration makes less sense. No other auth provider will provide such access natively, though you may be able to generate temporary credentials and share them with your users another way.

## How to migrate

When you are thinking about migrating off of Amazon Cognito, the very first decision after you've committed to a migration is "Am I okay with forcing all my users to reset their passwords?".

{% include _callout-important.liquid content="This blog post gives general guidance on migration off of Amazon Cognito. If you are looking for step by step instructions on how to migrate from Amazon Cognito to FusionAuth, please review our [Amazon Cognito migration guide](/docs/v1/tech/migration-guide/cognito/)." %}

If the answer is yes, then you are looking at a straightforward bulk migration. 

If the answer is no, then you will be instead looking at a phased or "slow" migration.

Let's look at a bulk migration first.

## Bulk migration

The basic steps of a bulk migration are:

* Set up the new system. Make sure you map all functionality and data from Cognito to the new system.
* Retrieve all available user data from Cognito. You can do this using the AWS CLI or any other AWS API client such as boto3.
* Massage it into a format acceptable to your new provider, using whatever data transformation tools you are comfortable with.
* Upload it to the new provider. If you must provide a password, set it to a random string.
* Update your applications to have users log in to the new system.
* Mark all uploaded users as needing a new password.
* Disable the Cognito user pools to ensure that all users are using the new system.

You could do the last step in bulk, via email or other notification, or you could update your login screens to indicate to users that they might need to reset their password in the new system.

The benefits of a bulk migration include:

* You can move your users all at once. Having a single source of truth for your customer data is generally beneficial.
* You no longer have a dependency on Cognito; the transition is clean.

The downsides of a bulk import:

* You must require all users to reset their password. In general, this requirement is frustrating to your users and may impact their usage of your application.

## A slow migration from Amazon Cognito

With a slow migration, your users don't have to reset their password. Instead, they log in to the new system, provide their username and password, and that is forwarded to Amazon Cognito. If the credentials are correct, the user is logged in. Since the new system has the user's password in plaintext during the login process, it can rehash and store the password. 

After the initial login, Cognito is no longer the system of record for that user. Any changes to this user, whether made by themselves, automated processes or customer service reps, will need to be made in the new system.

The basic steps of a slow migration are:

* Set up the new system. Make sure you map all functionality and data from Cognito to the new system.
* Determine what constitutes "done" for this migration, since it is unlikely that every single user will login and be migrated for any given period of time.
* Set up a way for the new system to present user credentials to Amazon Cognito for an authentication event. The exact method will depend on new system features.
* Update your applications to have users log in to the new system.
* Decide what to do with users that have not been migrated. You can abandon them, bulk migrate them, or contact them to try to get them to log in.

Slow migrations have less impact on your users, but more impact on your systems and employees. For instance, if a customer service rep needs to reset a password, they will have to determine if the user has been migrated to the new system or not before they can determine where to process this password reset request. 

## Conclusion


This blog post provided a high level overview of the process of migrating off of Amazon Cognito. If you are looking for step by step instructions on how to move to FusionAuth from Amazon Cognito, please take a look at our [Amazon Cognito migration guide](/docs/v1/tech/migration-guide/cognito/).
