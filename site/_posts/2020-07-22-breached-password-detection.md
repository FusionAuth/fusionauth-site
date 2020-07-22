---
layout: blog-post
title: How to enable breached password detection with FusionAuth
description: How can you easily prevent your users from using passwords that have been cracked and made available for sale on the web? By enabling breached password detection with FusionAuth."
author: Dan Moore
image: blogs/social-sign-in-django/headerimage.png
category: blog
tags: feature-breached-password-detection
excerpt_separator: "<!--more-->"
---

While there are many ways for people to authenticate with online systems, usernames and passwords are still commonly used credentials. Unfortunately, many passwords have been compromised and made available on the Internet. When combined with the fact that users often reuse passwords across different systems, this means that your application or site may be at risk through no fault of your own.

<!--more-->

## The danger of compromised passwords

Breached passwords allow unauthorized access to your systems. If a user's credentials are known to another party, that party can access your systems acting as that user. Depending on data and functionality available in your systems, the results of unauthorized access could range from worrying to disastrous.

## How to avoid unauthorized access

Here are some options auth systems often provide to help secure accounts:

* Force users to choose long and complex passwords
* Require users to set up two factor authentication
* Make users change passwords regularly

What all of these remedies have in common is that they all require your user to act. Who among us likes to change their password? In addition, none of these prevent a user from choosing to reuse a password across multiple applications.

[Defense in depth](https://en.wikipedia.org/wiki/Defense_in_depth_(computing)) is a security concept which basically means you shouldn't rely on one single way to protect your systems. Preventing a user from using a publicly available password, one that has been compromised, will increase your system security. There are numerous publicly available databases of cracked passwords. Your auth system can check if a user's password matches anything in these datasets.

## How to protect against breached passwords

Setting up your authentication system to check for and prevent use of breached passwords has a couple of benefits:

* It helps prevent password reuse across systems. It's not perfect, but if any systems have been breached, you can prevent reuse of that password in your system.
* It allows the user to pick whatever password they want, as long as it is unique. Whether that means using a password manager, a string of unique words, or an easily remembered, slightly modified quote. 

Enabling breached password detection actually empowers your users. Rather than enforcing a certain set of characters in a password, you're disallowing problematic passwords. 

I don't know about you, but I get frustrated when I'm signing up for an account and am told: "you must have between 26 and 31.5 characters in your password, of which exactly 12 must be uppercase and 15 must be numeric and please hop on one foot while entering your password". Okay, maybe I exaggerate a bit.

If you are going to build this feature, look for available datasets. You can also [look for APIs](https://haveibeenpwned.com/API/v3) to help you. Consider how to ingest and expose these sets to your auth systems in a performant manner. You'll also need to make sure you schedule time to keep these datasets up to date. 

When building this feature, build a way to force users to change their compromised passwords. There's not a ton of literature out there, but [this recent study (PDF)](https://www.ieee-security.org/TC/SPW2020/ConPro/papers/bhagavatula-conpro20.pdf) of almost 250 users over two years showed that only 13% of users with a breached password changed their credentials within three months. From the conclusion:

> Overall, our findings suggest that password breach notifications are failing dramatically, both at causing users to take action and at causing users to take *constructive* action. Regulators should take note of the ineffectiveness or absence of breach notifications and impose requirements on companies to implement better practices.

Ouch.

## How FusionAuth detects breached passwords

*Please note that this is a paid edition feature. You can [learn more about paid editions here](/pricing).*

We have built breached password detection into our auth management system. Enabling real time compromised password detection and mitigation in FusionAuth couldn't be easier. 

Assuming you've [activated your paid edition with a license key](/docs/v1/tech/reactor), navigate to the Tenant details page, and then to the "Password" tab. Enable "Breached password detection settings" and then choose your options. If you need varied configuration for different applications, use the multi-tenant feature to create separate tenants and configure them individually.

{% include _image.liquid src="/assets/img/blogs/breached-password-detection/enable-breached-password-check.png" alt="Enabling breached password detection." class="img-fluid" figure=false %}

This tab is also where you can specify various password settings. The defaults are fine, but feel free to change the rules to meet your needs, whether requiring certain types of characters, setting an expiration time, or mandating a minimum length. Just don't make me hop on one foot, please.

When configuring breached password detection, there are three levels of compromised password matching. You can match:

* on the password alone
* on the password plus username, email address or email sub-address
* on the password and an exact match on username or email address, or commonly used passwords like "password". 

While you know your security requirements best, we recommend matching on password alone, as this provides the most protection. The match will check for a compromised credential whenever a user's password is created or modified. This includes the following scenarios:

* A user registers, should self-registration be enabled
* A user is created via the administrative user interface 
* A user is created via the [User APIs](/docs/v1/tech/apis/users)
* A user changes their password
* An administrator changes a user's password

In all cases, the provided password will be checked against a large and ever-growing database of compromised credentials maintained by FusionAuth. 

The other configuration option is what, if any, action to take on user login. Should a password be checked when someone signs in? One option is to simply not check for compromised passwords during the sign in event. 

This is an acceptable choice if login performance is of the utmost importance to you. However, if a password is compromised after an account is created, no check will occur until the password is changed, exposing your system to unauthorized access. Test to make sure that the performance win is worth the security consequence. We recommend enabling one of the other choices. 

Some of these other, more secure, options are:

* Recording the result, which will update statistics and [fire a webhook](/docs/v1/tech/events-webhooks/)
* Emailing the user, letting them know their password has been compromised
* Forcing the user to change their password before their authentication can be completed

It's important to note that these only apply to login events. Once password breach detection is enabled, password changes and registrations always require an uncompromised credential before they'll succeed. Enabling this check on login allows you to increase the security of your user accounts in a gradual fashion. 

These settings are also available in the [Tenant API](/docs/v1/tech/apis/tenants), under the `tenant.passwordValidationRules.breachDetection` key. 

### Reporting on affected users

When you enable this feature, you'll also get built in reporting. On a tenant by tenant basis, you can see how many of your users have had breached passwords: 

{% include _image.liquid src="/assets/img/blogs/breached-password-detection/breach-password-report.png" alt="The breached password report." class="img-fluid" figure=false %}

It's also easy to search for users who have compromised credentials from the administrative user interface. This makes it easy to lock accounts, reach out to your customers, or take any other actions.

## What does breach detection look like?

Here's an example of a registration API call. Breached password detection has been enabled for the tenant.

```shell
API_KEY=...
APPLICATION_ID=...

curl -XPOST -H 'Content-type: application/json' -H "Authorization: $API_KEY" 'https://local.fusionauth.io/api/user/registration' -d '{"user" : {"email": "dan@piedpiper.com", "password": "password5" }, "registration": {"applicationId" : "'$APPLICATION_ID'" }}'
```

And here is the response:
```json
{"fieldErrors":{"user.password":[{"code":"[breachedCommonPassword]user.password","message":"The [user.password] property value has been breached and may not be used, please select a different password."}]}}
```

Luckily, it's easy to fix. The same curl command with a more secure password allows a registration. I mean, c'mon, "password5"?

If you require a password change when a breached credential is found, FusionAuth has built-in pages to support this flow. Here's what a user with a compromised password will see after attempting to log in, if you are using the FusionAuth provided pages:

{% include _image.liquid src="/assets/img/blogs/breached-password-detection/invalid-login-message.png" alt="What a user sees when they are forced to change their breached password." class="img-fluid" figure=false %}

Any administrator viewing the user details page will also see a warning and information about when the breach was found. Here's an example of a details page for a user with a weak password:

{% include _image.liquid src="/assets/img/blogs/breached-password-detection/admin-ui-warning-of-breach.png" alt="The warning an administrative user sees after a compromised password is found." class="img-fluid" figure=false %}

## Performance impacts

FusionAuth handles password breach checks in real time. Any way you slice it, this check is additional work whenever someone registers or, if the login check is configured, signs in. How does that impact performance? 

Here are some benchmarks I created using ApacheBench. I created 10 users with common poor passwords. Over three runs, with 10,000 requests and 100 threads, I made a login request for one of the random users against a local FusionAuth instance. Here are the 50th and 95 percentile durations with breached password detection disabled and enabled. 

| Run number | Disabled 50th (ms) | Enabled 50th (ms) | 50th % increase | Disabled 95th (ms) | Enabled 95th (ms) | 95th % increase |
|----|---|---|
| 1    | 120 | 123 | 2.5%  | 258 | 274 | 6.2%   |
| 2    | 107 | 115 | 7.5%  | 232 | 285 | 22.8%  |
| 3    | 112 | 104 | -7.1% | 383 | 312 | -18.5% |

You can see a performance impact. It fluctuated between runs and was less than a 20% difference in all cases. Due to the fact I was benchmarking on my local machine, the percentage change is more telling than the actual numbers. You probably won't be deploying your FusionAuth instance on a MacBook, so make sure you test in a more realistic setting.

## Enable Breached Password Detection Today

Breached password detection helps secure your users' data. You can choose how you want to respond and how you want to check passwords during the user authentication experience. You can add additional security with none of the frustrating password rules that often stymie user registration.

It also protects your applications and systems from breaches in other companies with zero effort on your part.

Just a reminder, this is a paid edition feature only. You can [learn more about paid editions here](/pricing).

