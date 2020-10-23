---
layout: advice
title: Slow migration of user data
description: What is a slow migration and when does it make sense to perform one?
author: Dan Moore
image: advice/registration-best-practices/expert-advice-best-practices-for-registration-forms.png
category: Identity Basics
date: 2020-10-20
dateModified: 2020-10-20
---

Migrating user data is a pain. People have to login to your application, and maintaining access is critical. User data is often siloed and changes at the whim of your users. 

A slow migration of user data can make the process easier. But first, why would you endure the data migration pain? There are many reasons why you might decide to migrate your user data.

## Why migrate at all?

Perhaps you've been burned by home grown auth systems and want to migrate to a more secure, more featureful library or standalone auth solution. Maybe you want a single view into customers', users' or employees' profile data across all your applications.

Or maybe you have an outdated user management system with an impending license renewal and you want to migrate to a different system with a better cost structure. Or, perhaps you are looking to integrate both COTS applications and home grown internal apps and want a centralized auth system which supports standards.

Once you've decided to undertake the migration, using a slow migration process allows the movement of customer data with minimal impact to existing users and systems.

A slow, or phased, migration is one where user data is migrated at the time of authentication. The first time a user authenticates with a new system after the migration as begun, their data is mapped from the old system to the new one. The new system is then the system of record for this user.

This document will discuss what you need to do to succeed with a slow migration.

## Alternatives

There are two alternatives to performing a slow, phased migration. You can migrate everyone at once, in a big bang. You can also divide user accounts by application, employment status, or some other mechanism, and migrate users segment by segment.

If you choose a big bang, you are moving all your users at one point in time. To do so, you build a data processing system to migrate the users and test the heck out of it. When you are ready to migrate, arrange for minimal downtime. Migrate the data. Then flip the system of record for all your users from the old to the new. 

You have downtime because you don’t want anyone updating their user profile in the old system after they've been migrated to the new system but before the system of record has flipped. Depending on your availability needs, you could also choose to do writes to both systems during that period. An alternative approachs is to allow the old system to run in a degraded state, allowing user data can be read, but not updated.

With the big bang option, you also should create a rollback plan in case testing misses something and things go sideways.

The big bang is a good choice when you have a small user base, or aren't in production yet. It also works when you need to decommission the legacy datastore as soon as possible, i.e. an upcoming license renewal. The big bang is operationally simpler than altneratives, because you are running both systems for a short period of time; the legacy system is running only for so long as is required to verify the mass migration worked. People accessing user data, such as customer service reps, will only need to switch their working routines once the migration is done.

However, there are some issues or concerns with a big bang migration:

* You will miss something during testing. After all, you aren’t doing this regularly; by definition this is a one time event. Plan for time to fix surprises.
* Production systems, no matter how good the testing environment, have a way of being different, if for no other reason than that they are under load. You might encounter an unexpected error during the production rollout.
* If something goes sideways, many users will be impacted, since they were all being migrated.
* You'll write a bunch of code which you'll test intensely, use once and then throw away.
* You need to ensure the new system understand how the passwords were hashed in the old system. Or force everyone to reset their password, which is a subpar user experience, to put it mildly.

Segment by segment migration, the second alternative, can be thought of as a series of "little bang" migrations. You split up your user data in a natural way, then you migrate each segment of users.

A segment by segment migration lets you test your processes in production by migrating less critical, or more understanding, sets of users first. A set of employees or the engineering team may be a good first group, since they'll be more understanding of issues. You may be able to reuse some of your code or logic across segments. In general, this approach decreases risk when compared to the one time big bang migration.

However, a segment by segment migration may be problematic in the following ways:

* You may not be able to perform one if there's no natural divisions in your userbase.
* This may not be worth it if most of your users are in one segment. For example, if you have a popular application and a couple nascent apps and want to combine your users, you may not be decreasing your risk much.
* This approach takes longer to complete, leaving you running multiple systems for a longer period of time.
* You'll have downtime for each user segment, which requires additional off hours work or coordination.

## How does a slow migration work?

At a high level, a slow migration happens in four phases. Each user proceeed through the phases independently of any other.  Here's how the data flows before any changes are made: 

{% plantuml source: _diagrams/learn/expert-advice/identity-basics/slow-migration/auth-before-migration.plantuml, alt: "The user auth process before migration." %}

Then you'd stand up the new system, connect it to the old system, and route all authentication requests to the new system. When the new auth system is in front of the old auth system, the old system consulted the first time a user authenticates:

{% plantuml source: _diagrams/learn/expert-advice/identity-basics/slow-migration/auth-during-migration-first-auth.plantuml, alt: "The auth process during an initial authentication in a slow migration." %}

For subsequent logins, the user's data has been migrated. There's no need to consult the old auth system. However, it continues to run because there are other users who have not yet performed a initial authentication.

{% plantuml source: _diagrams/learn/expert-advice/identity-basics/slow-migration/auth-during-migration-second-auth.plantuml, alt: "The auth process during a subsequent authentication in a slow migration." %}

After a period of time, most or all user data has been migrated. There's no need to consult the old auth system. It can be safely shut down.

{% plantuml source: _diagrams/learn/expert-advice/identity-basics/slow-migration/auth-after-migration.plantuml, alt: "The auth process after migration is completed." %}

Slow migration is similar to the [strangler pattern](https://martinfowler.com/bliki/StranglerFigApplication.html), first documented by Martin Fowler. Let's walk through the steps to successfully undertake a phased migration.

## Plan and map

The first step to any successful data migration is planning. A slow migration is no different. You need to know where all your data sources are, how to connect to them, and what the data looks like. 

Consider edge cases. What fields are required and optional in the old system? What about the new system? 

Is there a clean mapping between the data fields? The answer is almost certainly no, so think about how you are going to handle irregularities.

Let's examine a trivial example. Suppose an old auth system has a user data model with these attribute names and data types:

* fname - string
* lname - string
* birthdate - string
* phone num - string

Assume the new system has a user object with these attributes and data types:

* first name - string
* last name - string
* date of birth - date
* area code - string
* phone number - string

When you are moving between them, you'll face three challenges. 

The first is converting from `fname` -> `first name` and `lname` -> `last name`. This is pretty easy. 

The second is parsing the `birthdate` field into a date format to place in the `date of birth` field. Depending on how clean the data is, this could be trivial or it could be painful. 

The last issue would be splitting the `phone num` into an `area code` and a `phone number`. 

As this example shows, getting ready for a migration is full of tiny choices and design decisions. Make sure you understand the data model for your users before you start the migration. 

If you have the option of storing arbitrary key value data in the new system, serialize the user object from the old system and store it there. The old user model may be helpful in the future because if there was data that mistranslated, you'll have the original copy.

You'll also want to think about relationships between users and other objects. Groups, roles, historical data, and anything else the old system has tied to users. Make sure you know where this data is coming from, if it can be discarded, and if not, where it will end up. Perhaps it will be migrated to the new system, perhaps to a different datatore.

There are two field types worth commenting on in more detail. The first is user ids. These are often referenced by other systems and are used for auditing, analytics or other historical purposes. If you can preserve user ids, do so. 

If you cannot, plan accordingly. You may want to keep that field in the new system in an `old_user_id` field, accept the loss of this data, or build a system to map from old user ids to new user ids, to be used by any external party which depended on the old user id.

The other notable attribute is the password, and any related fields such as a salt. Passwords don't have to be migrated in a slow migration. The user will provide the password during authentication, and it can be stored in the new auth system during that process.

One special complexity which will require more planning is if you have user data in multiple datastores and are planning to merge the data. Ensure you map both of the old data models into the new user data model before you write any migration code.

### What does done mean to you?

A key part of planning is setting a completion goal. Because slow migrations move users one at a time, it is unlikely you'll migrate 100% of your users in this manner. Some people will use your software rarely, others may have abandoned their account. No matter how long the migration, some people may not log in during that time.

Decide what "done" means to you. When thinking about this, consider:

* How often do people log in, on average? Is there a significant long tail of users who visit the application less frequently than the average user? 
* What are the ramifications of a user being locked out of their account? Are there business, compliance, legal, or security repercussions? Is loss of timely access to data an annoyance or a disaster for the user?
* What will you do with unmigrated users? 
* How hard or painful is it to keep both systems running?
* What is the value in a customer who has not logged in to the system in six months? A year? Three years?

It's hard to give any blanket guidance as all systems are different, but you should definitely set a goal of percentage of users migrated, migration time elapsed, or both. Otherwise you may be in for a frustrating situation, where you don't know when to cut over. You'll want to query new and old systems and determine how many accounts have been migrated to determine progress.

## Proxy to the old auth system

Once the planning and data mapping is done, you need to connect the two systemns.

The new auth system could connect to the old system's datastore, but it's better to create write an API in the old system. Doing so allows you to leverage any business logic the old system performs to authenticate the user or assemble their data. This API may also call any other APIs or systems needed to construct the full user object for the new system. 

This code should mark the user as migrated in the old auth system datastore, if possible. This will be helpful in tracking progress and determining the system of record for each user.

If you can't modify the old system to add an API, because it is proprietary or hard to change, you can either reach directly into the database, or put a network proxy in front of the old system to perform required data transformations. In a worst case scenario, you could mimic whatever user agent the old system expects, such as a browser, and convert the correspoding result into data to feed into the new system.

Make sure to lock down this API. At a minimum, use TLS and some form of authorization to ensure that no malicious party can call this endpoint. You don't want someone to be able to arbitrarily try out authentication credentials. Use basic authentication or a shared header value, and discard any requests which are not expected. You could also lock access to a given IP range, if the new system is only connecting from a certain set of IPs.

You should build an automated test against this API, ensuring that if there are any changes to the old auth system, you learn about them before your users do.

When you have tested that this proxy returns the correct user data for a given set of authentication credentials, cut your applications over to the new system. 

No data needs to be migrated, but new users should register with the new auth system. It should recieve all authentication requests first. It will, of course, defer such requests to the old auth system.

## The authentication process

When a user signs in, the new auth system passes on the crednetials to the old auth system, and receives the user data in response. Here's the diagram from above:

{% plantuml source: _diagrams/learn/expert-advice/identity-basics/slow-migration/auth-during-migration-first-auth.plantuml, alt: "The auth process during an initial authentication in a slow migration." %}

After initial authentication, the data should be migrated to the new auth datastore. Then, this user can be completely managed by it.

During authentication, add a migration success marker to the user in the new auth system. This is the inverse of the migration marker in the old system, mentioned above. Having this data will let you know how many users have been migrated successfully. If troubleshooting the new auth system, it is useful to know if users with issues are newly registered or migrated.

## Remove the proxy

After running reports on the numbers of migrations, you'll know when you've reached your goal of migrated users. Prepare to shut down the old auth system. Clean up any code or configuration in the new system which was used to communicate with the old system.

At this point, you need to determine what to do with all the users who haven't migrated. You considered this in the planning section, but now you need to execute on the plan, or adjust it. You have the following options:

* Notify the users to encourage them to migrate ("if you don't login, your account will be deleted on DATE"). 
* Archive or delete them from the old system. This will force users to re-register, and may mean lost data.
* Move them to the new auth system with a big bang migration.
* Continue the slow migration and extend the time running both systems.

Let's examine each of these options.

### Poke users to encourage migration

You can reach out to the users who remain in the old auth system and remind them of the value of your application. Encourage them to login, which will migrate their data. 

Who among us hasn't received a notice stating "inactive accounts will be deleted on DATE. If you want to keep your account, please sign in." If you send out a notice like this, provide ample lead time.

### Force users to re-register

If the accounts don't have valuable associated data and it's easy to sign up for a new account, you may want to archive or delete them from the old system. Once you've done that, anyone who only had an account on the old system will receive an authentication error. They can, of course, register in the new auth system.

In this case, make sure to stop billing any unmigrated users. Charging people for an application to which they no longer have access is a great way to annoy them.

### Migrate all remaining accounts

If the accounts are valuable, migrate them with a big bang. This will be less risky than if you were trying to migrate everyone, because you are migrating fewer, less active users. 

If you don't have access to the password hash logic, you could force all these accounts to reset their password. While this is a disastrous path if you are migrating *every* user in a system, this subset of users is less active and smaller. They haven't accessed your system in a while, and may have forgotten your application even exists.

### Extend the migration

If the reason you are doing a slow migration is because the big bang is too painful, and the prospect continues to be worrisome even with a smaller set of users, then you can extend the slow migration period. Simply keep running both systems.

You can mix and match these approaches. For example, you could migrate all paying customers with a big bang, while archiving free customers who may have been kicking the tires on your application a year ago.

## Further benefits of a slow migration

There are a number of reasons to choose a slow, phased migration. Let's examine some.

### Migration complexity

User migrations are unique when compared to other migrations. 

Users are a key component of most applications, and represent real, live people. People who tend to be angry when they can't log in to applications.

User data is that it's protected in ways other data are not. Similar to payment information, user data has legal protections unlike most other forms of data. 

Additionally, user passwords are hashed. Unlike encrypted data, hashes are one way. When you move user data, that password by design hidden in a hash. This means that you have to know the hashing mechanism to allow a user to sign in.

User data is also often commonly stored in more than one datastore. Almost every application needs the concept of a 'user', so as an organization grows and applications are added, user data grows more and more fragmented.

All of these factors combine to make user data especially complex to migrate. When you use a slow migration, you trade the risk of screwing up the migration process for all your users at once for the additional operational overhead of running two auth systems for an extended period of time.

### Business opportunity

A slow migration is also a business opportunity. When you perform one, you have a reason to reach out to existing users and encourage them to sign in, thus, hopefully, reactivating some of your users. 

This opportunity also means you won't waste time and effort migrating users who are no longer using your application. While storing data is cheap, human attention is less so. A slow migration is an effective way to scrub your userbase. 

After all, if you run a slow migration for a year, how valuable are the users who never authenticated during those twelve months?

### Decreased cutover risk

A phased migration decreases cutover risk. There's less downtime because there's no data moved. Depending on your system architecture, there may be some downtime as you direct all your users to the new auth system, rather than the old one. 

You may, eventually, decide to stop the slow migration and cut over remaining users. But even that is less risky because these will be definition be some of your least active users. And because you'll be moving fewer of them, the downtime requirements will decrease as well.

### Minimized required understanding of the old auth system

With a phased migration, you don't have to understand the nuts and bolts of the business logic of the old auth system. Just make sure you can add on a lightweight API which can authenticate using whatever means the old auth system expects. You never have to connect to the underlying user datastore. 

Compare that with the big bang approach, which requires you to understand the data store structure as well as any business logic which builds the user model.

## Risks of slow migration

Like any solution, slow migration isn't perfect. You are passing a user's plaintext password from the new auth system to the old auth system. Therefore, you should take special care to secure this data in transit. Use TLS to encrypt the request. For an additional layer of security, have the new auth system encrypt the password, and have the old auth system endpoint decrypt it before authenticating.

Both systems, the new and the old, should be extensible or have snap in points to connect them. If the old system supports a standard like LDAP, and the new system has a way to import users, you may be able to cobble together a slow migration even if the old system isn't extensible.

One of the benefits of the slow migration is that you don't have a big bang cutover, with downtime and risk. However, that comes at a cost. You have to run both the new and old systems for the length of your migration. Depending on the state of the old system, this may be more or less painful. 

A corrolary is that customer service and other internal users may have to access two systems to find a user. This is especially true if a user contacts your business using an offline method, such as a phone call. Such a user may not be migrated, and the rep may not know where to find their data. Additionaly, systems which access user data may need to be updated to handle two systems, or you may need to put a proxy in place to look in one system or the other. One solution is to have the new auth system proxy not just authentication, but any user data request.

The new system can have links to the "old" system, and vice versa. Such links make finding the relevant user data easier. If possible, allow internal users to search both the new and old systems from one interface.

Rollback from a phased migration is more complex if there are issues, because there are two systems of record, one for users who have been migrated and one for users who have not yet been moved. 

You can work around this with tooling to keep track of which users have been migrated. If you needed to roll back to using the old system, look at the users who had been migrated and pull back all their data into the old system.

