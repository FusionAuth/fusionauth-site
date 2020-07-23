---
layout: advice
title: Breached Password Detection
description: What is breached password detection and why should you implement it.
author: Dan Moore
image: advice/password-security-checklist-article.png
category: Security
date: 2020-07-22
dateModified: 2020-07-22
---

There are a large and growing number of compromised passwords available out on the Internet. For example, one of the biggest datasets, Have I Been Pwned, has over 10 billion accounts for which the password hashes are available. These include millions of accounts from popular services like MySpace, LiveJournal and Mathway. 

Now, Have I Been Pwned is one of the good guys. They are among the services sharing these hashes in an effort to help people find out if their credentials have been compromised. There are other actors out there with, shall we say, less hospitable intentions, using breached datasets for unauthorized access to systems.

Of course, the best step to avoid such access to ensure your own systems are secured and that you help your users choose strong passwords. Unfortunately, many users reuse passwords across different applications and services. No matter how good your system security is, if credentials are shared with other systems, your application is as vulnerable as they are, should they suffer a data breach. Wikipedia has a [list of hundreds of data breaches](https://en.wikipedia.org/wiki/List_of_data_breaches).

## What is breached password detection

Breached password detection can help. This practice consists of the following:

* Finding breached and otherwise compromised lists of passwords. 
* Building a system to download, process and store these datasets. 
* Hooking into your user management system to check passwords.
* Taking action when a compromised credential is found.

Lets cover each of these in turn, but first, let's discuss some other reasons why you might be interested in implementing this functionality. 

## Why would you implement breached password detection

Beyond preventing unauthorized access to your systems, detecting when someone has a compromised set of credentials has other benefits.

It is a service to your end users, letting them know that their account with you, and any other accounts that may share the same password, has been compromised. Depending on how you implement it, such notice can be difficult to avoid. It's easy to ignore an email or letter, but harder to neglect being unable to log in to an application you use.

It is a protective measure that you as an application developer or operator can apply without requiring any user action (until a compromised password is found). There are other account security best practices that you should consider, such as two factor authentication. Enabling some of these require end user cooperation.

Compared to the common practice of requiring a certain number of special characters or uppercase letters, checking for breached passwords is low impact and less frustrating. It also expands the universe of acceptable passwords, which may now include long passphrases.

In that same vein, [NIST, an American government agency](https://pages.nist.gov/800-63-3/sp800-63b.html#memsecret), recommends that you should check passwords against a variety of sources; a memorized secret is NIST-speak for password. From the "Digital Identity Guidelines" document:

> When processing requests to establish and change memorized secrets, verifiers SHALL compare the prospective secrets against a list that contains values known to be commonly-used, expected, or compromised. For example, the list MAY include, but is not limited to:
> 
> * Passwords obtained from previous breach corpuses.
> * Dictionary words.
> * Repetitive or sequential characters (e.g. ‘aaaaaa’, ‘1234abcd’).
> * Context-specific words, such as the name of the service, the username, and derivatives thereof.
> 
> If the chosen secret is found in the list, the CSP or verifier SHALL advise the subscriber that they need to select a different secret, SHALL provide the reason for rejection, and SHALL require the subscriber to choose a different value.

There are many other recommendations in the document and it's well worth reading. Other requirements include setting a minimum user chosen password length of at least 8 characters and forcing a user to change their password if it has been compromised. These guidelines prohibit requiring certain characters in passwords:

> Verifiers SHOULD NOT impose other composition rules (e.g., requiring mixtures of different character types or prohibiting consecutively repeated characters) for memorized secrets. 

Hopefully you're convinced. Now, let's return to our previously scheduled discussion of implementation details.

## Finding compromised credentials

Have I Been Pwned is a good place to start, but there are other providers out there, such as DeHashed or GhostProject. There may be substantial overlap between these providers. 

You can also include lists of common passwords in your datasets. These may not be present in any public data breach, but are common enough that they are easy for an attacker to use, and so should be avoided. Feel free to augment this list with any other dictionary lists you can put together. Make sure you include 'correcthorsebatterystaple' ([Image courtesy of xkcd](https://xkcd.com/license.html)).

{% include _image.liquid src="/assets/img/advice/breached-password-detection/password-strength.png" alt="Password strength" class="img-fluid text-center" figure=false %}

Note that you'll need to make sure you are looking for these providers and datasets on a schedule, as new breaches happen and new providers appear. Each time you'll want to download the dataset and ingest it. Again, for a starting point, you can rely on Have I Been Pwned, but make sure you subscribe to their updates.

## Download and store the datasets

Now that you've catalogued the common passwords and known compromised credentials list, you can build a system to download and store these data sets. Then you'll want to make them available to your authentication system. 

This is a fairly standard data ingestion problem which has been solved in many contexts, so I won't go into nitty gritty details on how to accomplish this. However, make sure you're ingesting this data on a regular schedule. You'll also want to expose this service to your application or applications, possibly over a REST API or data export.

Some services, such as the aforementioned Have I Been Pwned, also offer an API. You could use such provided APIs, if that fits your performance profile, but in general storing the datasets will give you more control. Like any software system, you will need to make tradeoffs. It is certainly simpler to rely on a REST API to perform breached password checks. What you lose is:

* Control. You can no longer add your own suggested dictionaries or other customizations. You can no longer isolate your systems from the outside Internet.
* Performance. You're now going over the Internet, which will almost certainly negatively affect response times. How much? It depends. Test.
* Reliability. Integrating an outside service could affect your users. Make sure you plan for the external service to fail to return results in a timely manner.

Test any API thoroughly to ensure that your application is not negatively affected. Authentication is a critical part of any application. If it is degraded then the user experience is degraded as well. 

However, for a quick solution, you can start with an API integration, perhaps using a [library such as these](https://haveibeenpwned.com/API/Consumers), and then build your own data ingestion system as your use increases or you need more control. 

In any event, you'll have a source of compromised credentials and a way to check to see if a password is in that set.

## Configuring your authentication system to check provided passwords

Now you'll need to hook into your authentication system. Depending on what kind of auth system you have, the integration may be more or less difficult. However, you'll want to check at a couple of different times in the lifecycle of your user's interactions with your systems:

* When they register or an account is created for them.
* When a user changes a password.
* When a user logs in.
* Periodically checking without any user interaction.

You should enable checks on the first two events to prevent known compromised credentials from entering your system. In fact, the registration or password change should fail if the user provides a publicly known password.

Those last two deserve a bit of explanation. Suppose a user signs up on Example.com with a great password. Then they come to your site and sign up with a great password. They continue to use your site for months, but forget about Example.com. Then, Example.com is breached. They may send out a notice, but your user may not receive it or may not change their password. This [study from 2020 (PDF)](https://www.ieee-security.org/TC/SPW2020/ConPro/papers/bhagavatula-conpro20.pdf) covers a small dataset, approximately 250 users over two years. It found that of the approximately 25% of the users who had accounts on breached domains, only 13% changed their password within three months of the breach announcement.

If you only check for compromise when the password is created at registration or modified during password changes, you'll miss this scenario. The Example.com breach affected your system through the vector of the reused password. So definitely check for breached passwords whenever a user logs in and set up a scheduled job to check credentials of users who haven't logged in.

The actual implementation of the password check depends on how you are receiving the compromised dataset, but often you have a list of hashed passwords with a certain algorithm (SHA-1, for example). When your authentication system receives the proposed credential from a user, hash that using the same algorithm and then see if that hash is present in your datasets or in the API. If it is, then the password has been compromised. 

Unfortunately, such datasets can only provide proof of compromise, not proof of safety. If the dataset doesn't contain the hash, then the password may have been compromised in a private but the hash hasn't made it into the datasets yet.

## Taking action when the breached password is found

Alright, we've built up this capability and now have found a user who has a breached password. What do we need to do?  What is the best choice depends on the level of harm unauthorized access could cause. 

In increasing order of impact on the end user, you could:

* Update an internal system, but not tell the user. This might be useful if you don't protect any data, but rather use authentication to control access or for reporting. If you are rolling this out and expect user pushback when they are required to take one of these other steps, you may want to get a baseline for how many compromised credentials are in your system currently.
* Notify the user by sending them an email or contact them in some other fashion to let them know about the compromised credential. I'd suggest politely asking them to change their password at that time.
* Force them to reset their password. Most user management systems have a way to expire a password.
* Lock the account and prohibit any use until the situation is rectified. This may include resetting the password or other steps such as investigating any unauthorized access.

Take into account the level of privileges the user has. If the user is an administrator, you may want to take different actions than if they are a normal user of the system.

## External integration

Depending on the breadth of your digital infrastructure, you may need to integrate with external systems when an account could possibly be compromised. Whether this happens in an entirely automated fashion or kicks off a manual process depends, again, on your security posture. Consider if the authentication system you are integrating with can fire off events notifying other interested systems.

You also may want to be able to run reports or other analytics to determine if there are any patterns to the compromised passwords, or simply to know how many of your users have been affected. These reports may be provided in the auth system, or there may be an analytics system that is, again, an interested party in those events.

## Performance

All security is a tradeoff; in this case, checking the password is going to have an impact. The question is, how great of one? If the dataset is local, performing a hash against a password isn't too computationally intensive. If there are network calls required, it may take a bit longer. It also depends on how many registration, password change and login attempts occur. 

If you are really concerned about performance, pull the data close to your auth system. You can also batch examine the passwords of your users on a schedule and avoid checking passwords of users that have been checked more recently than the breached password data has changed. 

Only you can test in a real-world scenario and determine the performance impact on your system, but a back of the envelope calculation may help in deciding how many resources to spend. If you only get a login every 5 seconds which takes 200 milliseconds without the check, and the hash adds another 100 milliseconds, you don't need to worry.
