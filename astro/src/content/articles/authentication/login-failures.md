---
title: Why Login Failures Matter
description: Are you tracking your login failures? Learn about how to track them, why it matters, and what you should do to avoid login failure.
author: Hannah Sutor
section: Authentication
icon: /img/icons/login-failures.svg
darkIcon: /img/icons/login-failures-dark.svg
---

Picture a chart representing user logins. It has a line, trending upwards and to the right. Growing over time, never dipping. 

![No dips here!.](/img/articles/login-failure/login-success-graph.png)

When you care about providing great [authentication](/docs/get-started/core-concepts/authentication-authorization) experiences, like us (the few, the proud), there is nothing better than this chart - undeniable proof that our users are successfully logging in. And, more importantly, getting access to the features or data which that login process protects. That’s what most users are looking for, after all.

The more people who successfully log in, the more confident we are that our solution can handle a large number of users and that users are able to enter the application smoothly.

However, do you track login _failures_ as much as you pay attention to login _successes_? At first,it doesn’t sound as exciting. You definitely won’t be hoping for a line up and to the right. Instead, you'll be hoping for a line trending downwards. Or better yet, one never ascending in the first place. 

Tracking login failure rates is just as important, if not more important, than tracking login success numbers. Failures signify users are having difficulty accessing the application, and it’s our job to figure out why. And  to fix it.

## Define Login Failures

Before you can measure, you have to decide on what you will consider a failure in the login process. A safe assumption is that any failed authentication event should be counted. Authentication is not as simple as a username and password pair, and scenarios around passwordless authentication and multi-factor authentication (MFA) need to be considered as well. If a user attempts to log in, uses their username/password pair successfully, but never completes MFA, this is considered a failure.

There are some scenarios that are not quite failures, and not quite successes. These are also worth tracking, but require some nuance in instrumentation and reporting. Some examples:

* User initiates an account recovery flow, but never completes it.
* A magic link email or SMS is sent, but never completed.
* If MFA is required, and user removes the current factor, but never adds another factor.
* A user was rate limited after suspicious behavior or for entering their credentials incorrectly.

In all cases, the user is denied access to the application, but not in a typical manner. If you aren’t tracking login failures at all, don’t worry about these edge cases. But if you are and want to take the next step in terms of understanding your user’s experience, track these and think about how your user might perceive them.

## Measuring Login Failure Rates

The first step in working towards measuring failed authentication attempts is awareness - brought to you by this article! 

Next, walk through what you should be doing::

1. **Begin logging login activity, if you aren’t already.** Both successes and failures must be measured to understand the average login success ratio and the trend over time. Here are some common ways to capture this data:

* [FusionAuth’s login failure webhook](/docs/extend/events-and-webhooks/events/user-login-failed) fires an event when a login fails due to invalid credentials
* Okta gives admins access to a report that contains failed login information
* Auth0 provides events that give specific reasons why a login failed
* If you are using another provider, consult the documentation
* If you’re using a homegrown identity management system, make sure it includes login failure events and metadata around them

2. **Be granular.** When a failure occurs, log the reason for the failure and metadata around the event. If you can’t piece together a hypothesis about the failure, you can’t fix it, so this part is really important. Some ideas for attributes to track:

* User attributes: IP address, user agent/OS, the mapped location of the IP address, time of day, type of login (social sign on, [WebAuthn](/blog/2022/09/13/what-is-webauthn-why-do-you-care), magic link), which factor failed (if using [multi-factor authentication aka MFA](/glossary/multi-factor-authentication))
* System level events: application version, client version, external factor such as a new source of traffic or promotion
* Remember that an incomplete login should also count as a failure - track these too!

3. **Patience is key.** You’ll need at least 3 months of solid data before you can start to zoom in to identify meaningful trends.

4. **Adjust your expectations based on your industry.** While it is difficult to find login failure rates based on your specific industry, they can range between 15-40%, based on the average of the stats between [this article](https://jsoverson.medium.com/what-your-login-success-rate-says-about-your-credential-stuffing-threat-1f10bc20eaee) and [this one](https://learn.fastly.com/rs/025-XKO-469/images/Detecting-Account-Takeovers-and-Defending-Your-Users-Signal-Sciences-2017.pdf). After tracking these numbers for a while, you’ll get a feel for when changes to your applications cause failure rates to change.

5. **Pass it on.** When building your application, empower application administrators to monitor failure rates themselves. For example, Okta gives admins a report where they can view failures and successes. Most authentication as a service providers offer detailed log events that can be built as a dashboard or report for administrator consumption. 

Now that you know what you should be doing to track failures, let’s talk about why user authentication events fail.

## Why Logins Fail

There are a number of reasons why someone fails to log in. These range from system issues like performance to user confusion to obstacles from security measures.

### Performance

Technical problems, such as slow response times from the application, cause major user attrition. A[ report by Google](https://blog.google/products/ads-commerce/the-need-for-mobile-speed/) found that 53% of mobile users will leave a website if it takes longer than 3 seconds to load. Even if your application loads within a reasonable amount of time, you need to ensure that your login response is equally as zippy. 


### Poor UX

A poor user experience, often marked by unclear instructions and an overwhelming number of input fields, can cause frustration for users and lead to authentication failure. Poor UX can manifest in other ways, too:

* Not providing an easy way to reset forgotten or lost passwords. When there is no clear way to reset a password or recover a username, users will quickly give up and exit the login flow. Give the user the option to resend recovery emails, and remind them to check spam folders. 
* Inconsistent field lengths. When a new user registration form accepts a certain number of characters for the password field, and the login form accepts a different, smaller number, your user can be locked out even if they have correct credentials! Be sure that your field lengths are consistent for each field type, no matter where they are presented.
* Lack of tools for MFA recovery. Don’t forget that many accounts have MFA (we hope). Focusing only on username and password recovery leaves users who have lost their MFA devices unable to access their accounts. Simplify MFA recovery by forcing users to download recovery codes when they first set up MFA. 
* Lack of feedback in the UI. Rather than wait for a user to submit the login form,  validate and alert them of errors in real-time so that users can correct them quickly rather than wait until they submit the form. 

### Security Measures

Ah, the age old struggle between security and usability. Those same security features that help to project our application also cause friction for users. A CAPTCHA may make sense if a user is logging in from an unusual IP address, but presents an additional obstacle to the user. 

A common security measure is to make a user click a magic link, sent to them via email or SMS, when a login looks suspicious. Any time a user has to go into another application (in this case, their email client or phone), just to use yours, they are at a higher risk of failed authentication.

Unnecessary steps in the flow for security purposes will slow down the login process, leading to a higher chance of user attrition and error. Choose security measures wisely.

An additional benefit of taking a baseline measurement as this article suggests above is that you can know how such measures affect your users.

### User Problems

You may do all you can to make the login process seamless for users, but failed attempts are a part of life. Why is that? 

On the other end of your shiny, awesome login form, is a flawed human being. We forget our credentials. We forget if we used Google, Facebook, or LinkedIn to sign in. We entered our username, then got distracted and forgot to come back to the tab.

I could go on and on. Ultimately, expect that no matter how optimized your login process, there will be some percentage of failure due to the human condition. 


## Why Be Aware?

You might ask, why do I care about login failures?

An authenticated user is more valuable to your business than an unauthenticated one. Once a user is tied to an identity, you can improve their experience:

* You can personalize your application for them, lowering time to value. 
* You can contact them if something goes wrong, or to nudge them back into your product. 
* Authenticated users are much more likely to share valuable private data with your application by engaging with it.

When you improve the percentage of successful logins, you are directly creating business value.

Authentication is a high stakes, high visibility portion of your application. If a user can’t login, the application is dead in the water. When users can’t log in, they lose trust in your application - not to mention the general sense of annoyance that comes with wanting to access something that you can’t!

Alerting on login failure rates can give you a heads up that something isn’t right. The sooner you know, the sooner you can do something about it.

### Choosing Not To Invest In Login Failure Rates
 
All things in software (and life) have  tradeoffs, and tracking login failures is no exception. You may choose not to invest in this area for the following reasons:

* **Other priorities with higher ROI**: You’ve done the work to understand what a failed login attempt costs your company, and you’ve determined that there are bigger fish to fry.
* **You’ve hit "good enough"**: There comes a point where you are no longer willing to invest in optimizing your login experience. Even if you had data pointing to issues, you wouldn’t do anything about it. 

## Take Action

Once you implement tracking, you may determine that you want to do something to improve your login failure rates. Here are some ideas for how to increase successful logins.

1. **Provide automated help to anyone struggling to log in.** Present tailored advice or reminders in the user experience based on the problem they’re experiencing. An example of this is offering to send a password reset email with one click after a certain number of failed login attempts. Or, if you’re noticing that legitimate-looking users are failing at the CAPTCHA step frequently, consider a [CAPTCHA alternative](https://www.w3.org/WAI/GL/wiki/Captcha_Alternatives_and_thoughts).

2. **Give secure options for account credentials reset.** Once a problem has been detected, offer a login with a security code. Once the user is authenticated, allow them to modify their credentials so that they can remember them. For an added layer of security, send the user an email any time their username or password changes. In case it wasn’t them, they can be alerted of a possible malicious actor and take further steps such as changing their credentials or locking their account. 

3. **Give users options.** Passwordless options, like passkeys and magic links, can replace username and password combinations. You can also provide the ability for users to authenticate with pre-existing accounts using social sign in, SAML, and OAuth2. Since you have metrics captured, you can determine which of these is most effective for your userbase.

4. **Keep users logged in if they choose.** Ensure your authentication system provides the ability for users to select “Remember me”. Long lived sessions reduce the need to log in, sometimes at the expense of security (tradeoffs, remember!). Administrators choose the maximum length of valid sessions before a user is forced to authenticate again. Here you’ll want to again balance between ease of use and security.

## In Conclusion

In the case of login failures, knowledge is power. Instrument your current login success and failure rates with granular data about each outcome. Understand why users are failing to authenticate, and take action accordingly. 

Doing so  will lead to the positive business outcomes associated with authenticated users, and maybe some beautiful looking charts, too.

