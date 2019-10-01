---
layout: blog-post
title: "Is FusionAuth GDPR Compliant?"
description: FusionAuth is one of the few GDPR compliant identity and authentication solutions available.
author: Brian Pontarelli
excerpt_separator: "<!--more-->"
categories: blog
tags:
- FusionAuth
- CIAM
- white paper
- resources
- identity
- gdpr
image: blogs/gdpr-is-fusionauth-gdpr-compliant.jpg
---
It's been about a year since the [General Data Protection Regulation (GDPR)](http://eur-lex.europa.eu/legal-content/EN/TXT/?uri=uriserv:OJ.L_.2016.119.01.0001.01.ENG&amp;toc=OJ:L:2016:119:FULL "Jump to GDPR site") became fully enforceable. Are you compliant yet? We started making FusionAuth GDPR compliant as soon as the regulation was adopted, although to be honest, there wasn’t a lot we needed to do. We fully agree with these regulations and feel they provide effective guidelines that any application should follow with their users’ personal data. If you are trying to catch up with the GDPR news, [read our Developer's Guide to the GDPR here](/blog/2019/01/29/white-paper-developers-guide-gdpr "Get the Developer's Guide to the GDPR") and you'll have a good idea of what you should be aware of. Our developers have been working with these concepts for years now, so it was exciting to see our caution around user data validated.

<!--more-->
## Why Is FusionAuth GDPR Compliant?

It’s simple. We understand that Customer Identity and Access Management (CIAM) is a necessary component, but it’s not the core value of your application. It’s much like the front door to a brick and mortar store. It doesn’t make money, but if it’s weak and insecure it increases your risk of losing everything you’ve built. You don’t build the locks for your front door, so why ask your team to focus on user management? [FusionAuth](/ "FusionAuth Home") is designed to allow your team to focus on developing your application’s core value proposition, not building and maintaining a user access management system.

We developed FusionAuth from the beginning with strict security in mind. Our identity experts deal with user CIAM every day so we understand the complexities and subtleties that modern authentication and access management demands. We are focused on staying ahead of current best practices so we can provide the most secure and flexible solution on the market. We even build in additional flexibility that allows FusionAuth to increase its strength as threats become more sophisticated.

## Here are a few of the features that keep FusionAuth GDPR compliant:

**Data protection:** When we host FusionAuth for our customers, it is always protected by strict server security, firewalls, and encryption.

**Data isolation:** FusionAuth is single-tenant. This provides two main benefits. First, it means that your user data is not commingled with other companies. Second, we can host FusionAuth anywhere on nearly any server. This allows us to isolate your user data in a specific country if requested.

**Data retrieval:** FusionAuth provides an easy API to collect any data stored for a user. This includes any custom data you might have provided to FusionAuth.

**Data deletion:** In addition to retrieving user data, FusionAuth provides an API to quickly delete all user data, including behavior data such as IP addresses and login timestamps.

**User data abstractions:** FusionAuth provides the ability to pseudonymize user data through the use of opaque tokens and complex user ids. Without access to the FusionAuth database, these ids would be impossible to match to a user's data. This protects against user data being utilized or identified if captured during transmission.

**Password constraints:** FusionAuth provides a complete set of password constraints that comply with the latest NIST regulations. ([View the list here](/resources/password-security-compliance-checklist.pdf "Password Security Checklist PDF")) Additionally, FusionAuth provides a method of configuring the password hashing algorithm including a method of upgrading the algorithm used when users log in.

**Breach notification:** FusionAuth has a strict breach notification policy that allows any company to quickly notify users and comply with the GDPR. We make every effort to notify our customers of any breach (or even a suspected breach) within 24 hours.

## Learn More: Developer’s Guide to the GDPR

The GDPR has brought substantial changes to the way developers plan applications. It doesn’t restrict the types of applications and experiences developers can build, but it does place the need for data privacy ahead of the business needs of the company. To learn more about the GDPR and how it will impact developers' responsibilities, download our [**Developer’s Guide to the GDPR**](/blog/2019/01/29/white-paper-developers-guide-gdpr "Get the Developer's Guide to the GDPR"). It covers the essential information developers need to understand to stay compliant and avoid steep fines possible under the regulation.

[Get the Guide](/blog/2019/01/29/white-paper-developers-guide-gdpr "Get the Developer's Guide to the GDPR"){: .btn .btn-primary}

<!--
- FusionAuth
- Resources
- White Paper
-->
