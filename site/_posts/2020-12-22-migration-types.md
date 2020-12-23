---
layout: blog-post
title: Approaches to user account migration
description: What are the ways you can migrate user data, and why should you pick one over the others?
author: Dan Moore
image: blogs/ampio-customer-story/iot-company-picks-fusionauth-to-avoid-getting-distracted-by-auth-header-image.png
category: blog
excerpt_separator: "<!--more-->"
---

Migrating user data is fraught with risk. Of course, migrating any data is tough, but user accounts are even harder because any issue with the transfer affects human beings. Whether employees, customers, or potential clients, humans tend to react negatively to applications being inaccessible. 

There are a few different approaches to migrating user accounts. Each of these works, but has different risks, timelines and implementation approaches.

<!--more-->

There are three main approaches to user data migration. When you are changing how someone authenticates with your systems, you will eventually have to cut over. This is when a user authenticates with the new system instead of the old one. In this post, I'll assume FusionAuth is the new system, but these patterns work with any identity provider.

While each approach differs in the particulars, one way to decide which works for you is to consider how many of these cutovers you want to handle. Options include:

* Migrate everyone at once. This is also known as a "big bang" migration. Here, you have one cutover. At one point in time everyone is authenticating against the old system. Then the migration occurs, and everyone is then logging into FusionAuth.
* Segment your user base and migrate each chunk, one at a time. This approach requires multiple cutovers. First, you move the engineering team from the legacy system to FusionAuth. Then, you move the QA team. And so on and so forth.
* Migrate when a user logs in, also known as a "slow migration". There are two cutover points with this choice. First, you cut over the application (or applications). Next at authentication, the user account data migrates and it is now stored in FusionAuth. There are many data migration events, as users migrate one by one.

Each of these approaches migrates user account data into FusionAuth from one or more legacy systems. Let's examine each approach in more detail to help you make the best decision for your use case.

## The Big Bang Migration

With a big bang migration, you are moving all your users at one time. How long this takes varies depending on the amount of data you are moving, but there is a single cutover. For small systems it may be minutes, for bigger systems it might last hours or even days. 

The basic steps for this approach are:

* Map user attributes from the legacy system to FusionAuth. As part of this, Decide which applications and tenants will need to be created in FusionAuth beforehand.
* Build and test a set of migration scripts. Ensure that migration accuracy meets your needs. Figure out how long a migration takes.
* Test application changes required to point users to FusionAuth for login, registration, and other auth needs.
* When you are ready to migrate, bring your systems down or to a mode where authentication is disallowed.
* Run the previously tested migration scripts.
* Release the application changes, which perform the cutover. Now the system of record for all your users is FusionAuth.

This approach has some real strengths:

* If you manage the window when login will not be available, and your user base isn't global, the migration can have minimal impact on user experience. We all want to avoid those angry emails, right?
* This approach has a known duration. When you have completed the migration, you're done. You may keep the original system up for a while to make an emergency rollback possible, but beyond that you can shortly shut it down. 
* In a similar vein, with the "big bang", you run two production systems for a short period. Only long enough to assure yourself that you don't need to roll back, basically. 
* If the old system needs to be migrated away from by a certain timeframe, due to an upcoming license renewal or other business factor, this migration provides assurances that the deadline will be met. Don't forget to allow some buffer for unexpected issues, though!
* Anyone accessing account data, be they employees or contractors, will need to switch their working routines only once. There's one system of record at any moment in time for all your users.

Nothing is perfect, though. The big bang approach has some challenges:

Everyone is human, and it is common to miss issues during the testing period. Data migrations are, in general, unique. Testing helps, but production systems often differ in unexpected and subtle ways from even the best testing environments. Any problems with the migration impact many users, since everyone is being transferred.

This approach also requires the migration scripts to be given a lot of care, and you need to test them well. Then, after the migration, you throw them away. Maybe there's a few lessons learned, but much of the specific knowledge will be inapplicable to future migrations.

Finally, FusionAuth, or any other new auth system, must be compatible with the old system's password hashing algorithm. Otherwise, you must force all users to reset their password, which is a suboptimal user experience, to put it mildly.

The big bang migration is conceptually easy to understand, with few moving pieces. It works well when you have deadlines. Because of the uniqueness of its implementation, this is the most high risk option.

## Segment by Segment Migration

The segment by segment migration is an alternative to the big bang, with some significant overlap. This approach is essentially a series of "little bang" migrations, where you use the same approach, just with smaller chunks of users. You split your accounts into segments and migrate each segment one at a time. You can split your accounts in a number of ways:

* The type of user; for example: administrator accounts, employee, free user, premium account.
* The source of the account data. This is common when you are migrating users from multiple siloed user data stores into one. 
* Applications. You may have a variety of different applications and you might want to move over all the users of each application at a time. The cutover changes will be limited to each application and take place when the account data migration completes.

This approach allows you to test your processes in production by migrating less critical, or more understanding, users initially. For example, the engineering team is likely to be more forgiving of migration issues than paying customers would be. In addition, you can reuse code and approaches across the different segments. Each time you perform a migration you'll improve. In general, this approach decreases risk when compared to a big bang migration. The cost, of course, is more complexity and planning.

As implied, the segmented migration is not without its issues:

* Instead of one project, you have multiple, with N downtime periods and cutovers to manage.
* In some cases, there may be no useful natural divisions among your user accounts.
* If the segment numbers are unbalanced, the extra effort to migrate some first may not be worth it. If you have one popular application and two nascent apps, migrating the latter won't really help derisk the migration of the former.
* Because you have multiple migrations, this approach takes more calendar time to complete. Depending on what you are migrating from, you might end up running FusionAuth and the legacy system or systems for a longer period of time.
* Depending on user segmentation, the application cutover might be complicated. For example, if you divide your users by type and initially migrate admin users, the application needs to be smart enough to dispatch admin users to FusionAuth and other users to the old system.

In general, the segment by segment migration is useful when you have natural, well, segments. It decreases cutover risk because a smaller chunk of users will be migrated, and you can control which ones you do first. But it also introduces more complexities because you are running multiple migrations.

## Slow Migration

This approach is the logical endpoint of segment by segment migration. What if you made each chunk of accounts to be migrated as small as possible. Well, you end up with each segment being a single user. 

With the slow migration approach, you need to: 

* Map your user attributes from the old system to the new system. 
* Set up a connection between the legacy system and FusionAuth. This could be an API call or some other way to pass authentication information from FusionAuth to the old system, and get back an authentication response.
* Modify the application or applications to send users to FusionAuth for authentication. Test these changes before rolling them out, including that the connection created above works. If you previously used OIDC or SAML to connect to the legacy system, this effort may be minimal.
* At this point, FusionAuth receives all auth requests. It delegates the initial authentication for each user to the legacy system. 
* When the first call happens, the old system returns account data if the user presented valid credentials. FusionAuth creates a new user with the data. 
* When this user logs in subsequently, FusionAuth responds; it is now the system of record, the user has been migrated, and the old system no longer has that particular user's information.

This approach has a number of benefits. You are only migrating at the time a user authenticates. Therefore if there are issues, the blast radius is smaller and limited to the user authenticating. You have the user's password (they're providing it when they are authenticating), so you can upgrade their password hash to use a different algorithm transparently. This approach sidesteps any complexities around porting over bespoke hashing algorithms as well. 

Application cutover is, all other things equal, simpler. You aren't moving any account data, which can often take some time. Instead you are only switching where users authenticate. In addition, you can scrub your user base of inactive users with little effort. Or, before the migration, you can contact them and encourage them to log in your applications, possibly regaining their interest.

However, a slow migration isn't always the best solution. Some things to consider include:

* You are passing a plaintext password or other credential from FusionAuth to the legacy system. Make sure you take care of this precious cargo using TLS at a minimum. If possible, keep it from travelling over the internet by placing FusionAuth and the legacy system on the same network.
* The legacy user management solution has to be able to provide an authentication API or support LDAP. You may need to extend it to do so, and this may not always be possible.
* The timeline is a lot longer for this kind of migration. You also must run both FusionAuth and the original system for that period of time. If you have a deadline or the old system is creaky, this may be painful.
* Internal users accessing user account data will need to look in both places to find a user during the migration, though you can write tooling to check both systems from one application.
* Rollback is more complex. There are two systems of record, one for users who have been migrated and one for users in the legacy system.

Slow migrations make a different set of tradeoffs. You don't have the upfront effort, apart from creating the connection and updating your applications. The risks of a failed migration are limited to the user who is migrating. However, you will need to run both systems for a longer period of time. So, a slow migration is a lower risk, longer duration approach. 

## Conclusion

Migrating user data is never fun. But doing so can save you money, allow new features or reduce operational headaches by consolidating users. I hope this overview of the different migration approaches that we've seen here at FusionAuth is helpful in guiding you toward the migration that works for you.
