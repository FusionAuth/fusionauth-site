---
layout: blog-post
title: How to migrate from Google Firebase
description: How can you migrate away from Google Firebase?
author: Dan Moore
image: blogs/migrate-from-cognito/how-to-migrate-from-amazon-cognito-header-image.png
category: blog
tags: topic-upgrade-firebase
excerpt_separator: "<!--more-->"
---

Firebase is a serverless app building service from Google which includes customer identity and access management (CIAM). As such, it offers authentication and authorization, but Firebase also includes a database, metrics and more.

At FusionAuth, we talk to potential customers who are interested in migrating away from Firebase because of limitations, typically of UX, standards or data control.

<!--more-->

This blog post will explain why and how you might choose to migrate from Firebase to another solution for user authentication and authorization. Other aspects of a migration, such as how to export your metrics data, will not be covered.

## Weaknesses of Firebase

While [Firebase](https://firebase.google.com/) is a low cost auth service and a far better choice than rolling your own auth solution, it has some downsides. These include:

* There is only one deployment model, a SaaS offering.
* You can run Firebase only in the geographies supported by Google.
* Some OAuth grants are not supported, such as the device grant.
* Usage limits may throttle required operations.

These limitations may be acceptable initially, but eventually you may need a feature not provided by Firebase, such as a unique login provider or the OAuth device grant.
Or perhaps you want more control over the location of your data.

For whatever reason, you may decide you need to move your customer and user data from Firebase. Let's take a look at how you might do so.

## When you shouldn't migrate

Firebase strengths as well as weaknesses, and when your application depends on unique features or if the upsides outweigh the downsides, continue to run on Firebase.

For example, if your usage is free, under 50,000 MAUs, and the limitations of Firebase are acceptable, migration doesn't make sense. The fact that Firebase is serverless makes it easy to "set and forget" and allows you to focus on other aspects of your application. You know, the features your users want.

If you need Firebase's other functionality, such as messaging, analytics or the Cloud Firestore NoSQL database, migration won't make sense. A standalone auth provider won't provide the breadth of functionality. 

## How to migrate

After you have decided to migrate users from Firebase, the first decision you'll need to make is: "With what will I replace all the other Firebase functionality?" You can leave most of your application running on Firebase or move it all to an environment where you have more control. What makes sense here depends on what other Firebase functionality you use.

{% include _callout-note.liquid content="This blog post gives general guidance on migration off of Firebase to any other auth provider. If you are looking for step by step instructions on how to migrate from Firebase to FusionAuth, please review our [Firebase migration guide](/docs/v1/tech/migration-guide/firebase)." %}

You can also decide if you want to migrate your users in a bulk or drip migration.

## Bulk migration from Firebase

The basic steps of a bulk migration are:

* Set up the new auth system. Make sure you map all user functionality and data from Firebase to the new system. Ensure the new system supports the [modified scrypt hashing algorithm](https://firebase.google.com/docs/reference/admin/java/reference/com/google/firebase/auth/hash/Scrypt) used by Firebase.
* Retrieve user data from Firebase. You can do this with the Firebase CLI: `firebase auth:export users.json --format=JSON --project your_project_id`.
* Massage the exported user data into a format acceptable to your new provider, using whatever data transformation tools you are comfortable with.
* Upload the user data to the new provider. 
* Create configuration in the new auth system corresponding to the applications previously set up in Fireabase. You should also customize the user interface, messages, MFA methods and any other specific settings that are relevant.
* Update your custom, COTS or OSS applications to point to the new auth system.
* Disable the sign-in methods in your Firebase application to ensure that all of your users are authenticating against the new system.

Here's the login flow before the bulk migration:

{% plantuml source: _diagrams/docs/guides/bulk-migration-before-firebase.plantuml, alt: "Bulk migration login request flow before the migration." %}

Here's the login flow after the bulk migration, when Firebase no longer is involved in the login process:

{% plantuml source: _diagrams/docs/guides/bulk-migration-after-firebase.plantuml, alt: "Bulk migration login request flow after the migration." %}

The benefits of a bulk migration include:

* You can move all your users at one time. Having a single source of truth for customer data is typically beneficial.
* You no longer have a dependency on Firebase for authentication; the transition is quick.

The downsides of a bulk import are:

* You'll have to build a script to retrieve the data from Firebase, modify it, and push it to the new system.
* There may be some downtime in the migration process.
* If the new system can't support the scrypt algorithm, you must load up the users and reset their passwords.

Since Firebase uses scrypt to rehash user passwords at login, if a user has been imported with a different hash and never logged in, [the `passwordHash` field will be empty](https://firebase.google.com/docs/cli/auth). In that case, you should set the user's password to a random string and force them to reset their password.

## A slow migration from Firebase


With a slow, or phased, migration, users log in to the new system, provide their username and password, which is then forwarded to Firebase. (This must be a secure connection and should be augmented with IP restrictions, custom headers or client certificates; you don't want anyone to be able to pass credentials and probe your userbase.) If the credentials are correct, the user is logged in. The new system can rehash and store the password along with other user data.

Here's a diagram of an initial user login during a slow migration:

{% plantuml source: _diagrams/docs/guides/slow-migration-firebase.plantuml, alt: "Slow migration initial login request flow." %}

After the initial login, Firebase is no longer the system of record for that user. Any changes to this user, whether made by themselves, automated processes or customer service team members, will need to be made in the new system. In subsequent logins, Firebase is never consulted.

{% plantuml source: _diagrams/docs/guides/slow-migration-subsequent-firebase.plantuml, alt: "Slow migration subsequent login request flow." %}

The basic steps of a slow migration are:

* Set up the new auth system. Make sure you map all user functionality and data from Firebase to the new system.
* Determine what constitutes "done" for this migration, since it is unlikely that every single user will log in and be migrated, no matter how long you run these two systems in parallel. You can see [more details on how to calculate that](/docs/v1/tech/migration-guide/general#migration-timeline).
* Set up a way for the new system to present user credentials to Firebase during an authentication event. The exact method will depend on new system features. This can be done with a Firebase API call; see [this Firebase documentation](https://firebase.google.com/docs/reference/rest/auth#section-sign-in-email-password) for more.
* Create configuration in the new auth system corresponding to the applications previously set up in Fireabase. You should also customize the user interface, messages, MFA methods and any other specific settings that are relevant.
* Update your custom, COTS or OSS applications to point to the new auth system.
* Wait, running reports periodically to determine if you've migrated enough users to shut down the slow migration.
* Decide what to do with unmigrated users. Options include abandoning them, a bulk migration, or contacting them to encourage a sign-in.
* Disable the sign-in methods in your Firebase application to ensure that all of your users are authenticating against the new system.

Slow migrations have less impact on your users, but more impact on your systems and employees and take more time. For instance, if a customer service representative needs to reset a password, they will have to determine if the user has been migrated to the new system or not before they can process the request. 

## Conclusion

This blog post offers an overview of a Firebase migration. No matter what the new target system is, you'll need to decide between the bulk or slow migration, as well take specific steps to move your data and settings. You'll also want to consider how to migrate any the other functionality you use in Firebase.

If you are looking for step by step instructions on how to move to FusionAuth from Firebase, please check out our [Firebase migration guide](/docs/v1/tech/migration-guide/cognito).


