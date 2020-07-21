---
layout: blog-post
title: How to prevent your users from using breached passwords
description: In this tutorial, we'll build a basic Django web application using FusionAuth for an easier and safer way of handling user registration and authentication.
author: Dan Moore
image: blogs/social-sign-in-django/headerimage.png
category: blog
tags: client-python
excerpt_separator: "<!--more-->"
---

While there are many ways to authenticate against online systems, usernames such as email addresses and passwords are still commonly used credentials. Unfortunately, many passwords have been compromised and made available on the Internet. When combined with the fact that users often reuse passwords across different systems, this means that your application or site may be at risk through no fault of your own.

<!--more-->

## The danger of compromised passwords

Compromised passwords allow unauthorized access to your systems. If a user's credentials are known to another party, that party can access your systems acting as that user. Depending on data and functionality available in your systems, the results of unauthorized access could range from worrying to disastrous.

## How to avoid unauthorized access

Here are some common options auth systems provide to help secure user accounts.

* force users to choose hard passwords
* require users to set up two factor authentication
* make users change passwords regularly

What all of these remedies have in common is that they require action by your user. In addition, they don't prevent a user from choosing a complex, shared passwords. 

Defense in depth suggests increasing password security by multiple means, and you can definitely require all of the above. Preventing a user from using a publicly available password, one that has been compromised, is yet another way to increase your system security. There are numerous publicly available databases of cracked passwords. Your auth system can check if a user's password matches anything in these datasets.

Checking for breached passwords has two benefits:

* it helps prevent password reuse across systems. It's not perfect, but if any of the systems have been breached, you can prevent reuse of that credential.
* it's proactive ? https://www.ieee-security.org/TC/SPW2020/ConPro/papers/bhagavatula-conpro20.pdf
* it allows the user to pick whatever password they want, as long as it is unique. Whether that means using a password manager, a string of unique words, or an easily remembered, modified quote. Rather than enforcing a certain set of characters in a password, you're disallowing passwords which are problematic. 

If you were going to build this, you should look find available datasets and consider how to ingest and expose them to your login systems in a performant manner. There are APIs out there as well, if a network call is acceptable.

## How FusionAuth can help

*Please note that this is a paid edition feature. You can [learn more about paid editions here](/pricing).*

We built this feature and have incorporated it into our auth management system. Enabling near realtime breached password detection in FusionAuth couldn't be easier. 

Assuming you've [activated your paid edition with a license key](/docs/v1/tech/reactor), to navigate to the Tenant details page, and then to the "Password" tab. Enable "Breached password detection settings" and then choose your options. If you need different configuration for different applications, use the multi-tenant feature to create separate tenants, which can then be configured individually.

TBD pic

This tab is also where you can specify various password settings. The defaults are fine, but feel free to change the rules to meet your needs, whether that is requiring certain types of characters, setting an expiration time, or mandating a given length. 

When configuring breached password detection, there are three levels of compromised password matching. You can match:

* on the password alone
* on the password plus a match of the username, email address or email sub-address
* on the password and an exact match on username or email address, or a commonly used password like "password". 

While you know your security requirements, we recommend matching on password alone, as this gives you the greatest protection.

These matching rules apply to all passwords provided whenever a user is created. This includes when they register themselves, should self-registration be enabled, when they are created via the administrative user interface, and when a user is created via the [User APIs](/docs/v1/tech/apis/users). In all cases, a provided password will be checked against a large and ever-growing database of compromised credentials maintained by FusionAuth. Any time a password is changed by a user, the database will also be checked. 

The other configuration option is what, if any, action to take on user login. Should passwords be checked when someone signs in? One option is to not check for compromised passwords on login. This is a good choice if you don't have any users in production before you enable breached password detection. In that case, all passwords will have already been vetted during user creation.

Other options include:

* recording the result, which will update statistics and also fire a webhook
* emailing the user, letting them know their password has been compromised
* forcing the user to change their password

These settings are also configurable via the [Tenant API](/docs/v1/tech/apis/tenants), under the `tenant.passwordValidationRules.breachDetection` key.

## What does it look like in practice?

Here's an example of a registration flow with breached password detection enabled:

```shell
API_KEY=...
APPLICATION_ID=...

curl -XPOST -H 'Content-type: application/json' -H "Authorization: $API_KEY" 'http://localhost:9011/api/user/registration' -d '{"user" : {"email": "dan@piedpiper.com", "password": "password5" }, "registration": {"applicationId" : "'$APPLICATION_ID'" }}'
```

And here is the response:
```json
{"fieldErrors":{"user.password":[{"code":"[breachedCommonPassword]user.password","message":"The [user.password] property value has been breached and may not be used, please select a different password."}]}}
```

The same curl command with a secure password, such as `pTvS19asSUSrD$RYzzkp1YEA11`, will complete the registration.

Here's what your user will see if you are using the FusionAuth provided login screens:

TBD Pic

## Performance impacts

FusionAuth handles password breach checks in realtime. Any way you slice it, this check is additional work whenever someone registers or, if the login check is configured, signs in. How does that impact performance?

Here are some benchmarks I ran using apache bench. I created 10 users with poor passwords. Over three runs, with 10000 requests and 100 threads, I made a login request for one of the random users against a local FusionAuth instance. Here are the 50th and 95 percentile durations with the breached password check both disabled and enabled. 

| Run number | Disabled 50th (ms) | Enabled 50th (ms) | 50th % increase | Disabled 95th (ms) | Enabled 95th (ms) | 95th % increase |
|----|---|---|
| 1    | 120 | 123 | 2.5%  | 258 | 274 | 6.2%   |
| 2    | 107 | 115 | 7.5%  | 232 | 285 | 22.8%  |
| 3    | 112 | 104 | -7.1% | 383 | 312 | -18.5% |

You can see that there some impact on performance, but it fluctuated, and was less than a 20% difference in all cases. Due to the fact I was benchmarking on my local machine, the percentage change is more useful than the actual numbers. You probably won't be deploying your FusionAuth instance on a MacBook, so make sure you test in production.

