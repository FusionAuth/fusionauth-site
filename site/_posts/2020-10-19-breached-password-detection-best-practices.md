---
layout: blog-post
title: Breached password detection best practices
description: How can you protect your systems and users from known, breached passwords?
author: David Polstra
image: blogs/migrating-users-legacy-datastore/how-to-migrate-your-legacy-user-data-to-a-centralized-auth-system.png
category: blog
tags: feature-breached-password-detection
excerpt_separator: "<!--more-->"
---

Breached password detection may be the wave of the future, but some third-party solutions are better than others. Performance, flexibility, ease of use, user experience, and value can vary greatly. Keep these best practices in mind when choosing the solution that is right for your organization.

<!--more-->

*These best practices originally appeared in our Breached Password Detection White Paper. To learn about the severity of the problem, what NIST recommends and more, [download it today](https://fusionauth.io/resources/breached-password-detection-white-paper/).*

## Prioritize ease of setup, implementation, and use

Choose a scalable product that simplifies identity authentication and management. Make sure the solution requires minimal developer integration time, making it ideal for organizations that want to integrate an identity access and management solution into their business for immediate use.

You should be able to enable breached password detection and then choose the options and rules that make the most sense for your business. If you need varied configurations for different applications, use a multi-tenant feature to create separate tenants and configure them individually. You should also be able to specify password settings.

## Prioritize user experience

Choose a solution with out-of-the-box features that enable real-time detection and mitigation and accommodate the ever-evolving breached password landscape. The flexibility and performance of the solution should be matched by the strength of the user experience the solution provides. 

Companies tend to implement complex password policies, requiring users to follow convoluted password rules. The user experience suffers. And these policies don’t suffice, as users work around them in ways that are harmful to system security. The goal should be to meet users where they currently are, not where we want them to be. User experience, including minimal user interference unless a problem is detected, should be a top priority.

## Implement an extra layer of security

The solution should offer features that include anomaly detection. Security features should be able to differentiate between different types of attacks, identify which API calls are reliable, and recognize user access anomalies immediately. Breached password protection should work in context with other features, such as limiting the number of failed logins, blocking login attempts made from suspicious or malicious IP addresses, and blocking attackers from brute-force entry into user accounts.

In addition, make sure these credentials remain secure as they are being examined. They should never be stored on disk. They should always be encrypted in transit.

## Keep your datasets up to date

To secure your systems, your solution provider will need to research and catalog lists of plaintext passwords. They may start with Have I Been Pwned, the Hasso-Plattner-Institute site, DeHashed, GhostProject, or other sources that include billions of compromised credentials and accounts and provide secure hash algorithms (SHAs). Make sure your datasets include additional common words and character sequences even if they are not present in any public data breach. (call out)

New breaches happen daily. Make sure your provider researches new datasets early and often to keep those datasets up to date.

## Prevent all known compromised credentials from entering your system 

Configure your authentication system to check for breached passwords anytime a user registers, a user logs in, or a user’s password is changed (by the user or an administrator). If any user provides a publicly known password, the system should reject the operations they are attempting immediately.

## Keep unencrypted passwords safe

Some providers analyze passwords asynchronously to determine if they have been breached. Asynchronous password checks require providers to store the password somewhere, usually in a database and often in plaintext. Passwords also might be stored in memory for long periods of time. Avoid this huge security hole at all costs. Consult with your provider to ensure they are never storing plaintext passwords in a database or in memory for extended periods of time.

## Detect and mitigate breaches in real time
Only 43% of users who had accounts on breached domains changed their passwords. One study concludes, "[P]assword breach notifications are failing dramatically, both at causing users to take action and at causing users to take constructive action."

Suppose a user signs up on Example.com with a great password. Next, they sign up on your site with the same great password. Then Example.com is breached. Example.com may send out a notice, but your user may not receive it or may not change their password in response.

Make sure your solution immediately checks if a password has been breached when a user logs in. Most systems check passwords latently. Make sure all password-based login attempts can be checked in real time, matches can be blocked in real time, and users can be instantly alerted and forced to change their passwords.

## Create breached password detection protocols based on possible impacts

Set up your authentication system to check for and prevent the use (or reuse) of breached passwords. Doing so allows users to pick the unique password they want while still keeping their accounts secure.

The million-dollar question: what, if any, action should you take upon user login? One option is to not check for compromised passwords during login. Choose this option only if login performance is of the utmost importance or if you don’t protect any data but instead use authentication for reporting.

If you check for compromise only when passwords are created at registration or modified by users, you’ll end up with users who have credentials leaked by breaches external to your system after account creation. As a result, your system will be exposed to the possibility of unauthorized access. Make sure that the performance win is worth the possible security consequences. (call out)

When you find a user with a breached password, the next step should depend on the level of harm unauthorized access could cause. In increasing order of user impact, you could:

* Record the result, which will update statistics (and optionally fire an event to a webhook, allowing other systems to take action).
* Email the user to tell them their password has been compromised.
* Force the user to change the password before their authentication can be completed.
* Lock the account and prohibit use until the password has been changed.
* Reset the password and confirm unauthorized access did not occur.

## Choose built-in reporting and analytics

The administrative user interface of your identity system or your breached password solution provider should make it easy to search for users who have compromised credentials, lock accounts, and reach out to your customers. On a customer-by-customer basis you should also be able to see how many of your users have had breached passwords and ensure your authentication system can notify external systems of critical events.

You need to be able to run reports and analytics to determine if compromised passwords have any patterns and to know how many of your users have been affected. All configurable actions taken when a vulnerability is detected should be logged for reporting and analysis.

