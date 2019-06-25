---
layout: blog-post
title: "FusionAuth 1.7 Release Provides Advanced Consent Management and Family Relationship Models"
description: "FusionAuth 1.7 provides advanced consent management and family relationship modeling allowing you to quickly comply with complex COPPA and data control regulations."
author: Bryan Giese
excerpt_separator: "<!--more-->"
categories: blog
tags:
- release notes
image: blogs/fusionauth-1-7-consent-family-model.png
---
Summer is here and so is FusionAuth 1.7! This release adds sophisticated Consent Management and Family Relationship Models that simplify obtaining and tracking individual and parental consent choices. There are also a few changes and minor fixes in this release for issues discovered by QA testers and our community of users on [Stackoverflow](https://stackoverflow.com/questions/tagged/fusionauth "Jump to Stackoverflow") and [Github](https://github.com/FusionAuth/fusionauth-issues/issues/ "Jump to Github"). We’ve included some of the highlights of the 1.7 release below, and visit the [release notes and documentation](/docs/v1/tech/release-notes/#version-1-7-0) for the full details.
<!--more-->

## What's New: Consent Management

If you’ve been on a website anytime in the last year, you’ve probably seen a notice, alert or popup asking for your permission to track your data. This is a common example of acquiring user consent (AKA opt-in consent) and if not recorded and tracked properly per user, could result in fines and penalties from a variety of regulatory agencies in the US and Europe. FusionAuth’s new consent APIs allow applications to easily manage and track user consent for parental permission, marketing emails, website tracking and more.
One of the most important uses of the new consent APIs is managing parental consent. In 1998, Congress enacted the [Children’s Online Privacy Protection Act (COPPA)](https://www.ftc.gov/tips-advice/business-center/guidance/complying-coppa-frequently-asked-questions) to give parents control over the information collected from their children while online. These same concepts are included in the European Union’s GDPR requirements, and both regulations can levy severe penalties for sites or applications that violate their tenants. Here’s how FusionAuth helps applications comply with these regulations:
- **Consent Tracking** - All consent data is stored, tracked and available through FusionAuth’s API.
- **Minimum Age** - Apps can set a minimum age where consent is required–by default it is 13. If a child under 13 registers, they will need to obtain parental consent to continue.
- **Localization of Minimum Age** - The age of parental consent can be different from country to country. FusionAuth can automatically use the minimum age value in each country for individual users in order to comply with their specific regulations.
- **Built-in COPPA Email + and COPPA VPC** - FusionAuth ships with these consent models ready to activate.
- **Additional Consent Models** - Additional consent formats can be added through the consent management interface and the consent APIs.
- **Consent Management Emails** - All email workflows for consent management are built-in and ready to enable. Initial consent, revoking consent, secondary notifications and email plus are all configured for immediate use.
- **Data Control** - FusionAuth’s API provides full data access and control allowing developers to add, edit, and delete any user data as required by regulations. ([Read here for more details on how FusionAuth is GDPR compliant](/blog/2019/03/19/is-fusionauth-gdpr-compliant))

An important component of consent management is the concept of families. This defines who is authorized to provide consent for a child. The next part of the FusionAuth 1.7 release covers this concept in detail.

## New Family and Relationship Model

When dealing with families, older identity platforms are most often built to support the “Leave It To Beaver” family model that has one set of parents for a few immediate children. In reality, modern family groups are more complex, and so is the task of managing family relationships within an application. FusionAuth 1.7 provides the flexibility to manage family and guardian structures in any form. Here are the most important details:
- **Unlimited Adults** - Families can have any number of adults to allow for the many different guardians in a child’s life. Parents, grandparents, partners, guardians and more can listed as an adult within a family group allowing them to make decisions for associated children.
- **Unlimited Children** - Families can be large, so of course one family can have any number of children.
- **Children in Multiple Families** - One of the most important elements of this update is that children can exist in multiple families. This allows FusionAuth to manage relationships that span multiple homes with complex parenting responsibilities.

This is a brief overview of our Family and Consent APIs. For more details, visit the [release notes and API documentation](/docs/v1/tech/release-notes/#version-1-7-0).  


## Additional Updates & Fixes

The FusionAuth 1.7 release has several other updates and fixes that you should know about.

- Export of Audit Logs and Login Records to a zipped CSV in the UI and via API
- Login Record view that contains search and pagination capability. In the UI see **System > Login Records**.
- Retention policy for Audit Logs and Login Records. This feature is disabled by default and may be configured to retain data for a specific number of days.
- We fixed an error where some time zones were not correctly discovered during login.
- A bug when importing bcrypt hashes that contain a ```.``` (dot) was fixed. Thank you to **Diego Souza Rodrigues** for discovering this issue!
- Better support for third party 2FA devices such as an RSA key fob.
- We fixed an issue where managed domains were not being returned properly for a SAML v2 IdP configuration.

## FusionAuth Is Always Improving
We test and update FusionAuth constantly to ensure that we are providing you with the most flexible and powerful identity and access management solution. If you find a bug or have any questions, let us know either at [GitHub](https://github.com/FusionAuth/fusionauth-issues "Jump to GitHub") or [StackOverflow](https://stackoverflow.com/questions/tagged/fusionauth "Jump to StackOverflow") and we’ll take a look.

## FusionAuth's Recent Awards
Speaking of improving, FusionAuth recently received a few awards and certificates from the identity and access management industry. If you haven’t seen them, take a moment to read what we’ve been able to achieve in the last few months.
- [FusionAuth Snags Product of the Year](/blog/2019/06/17/iam-product-of-the-year')
- [FusionAuth Recognized with Rising Star and Great User Experience Award](/blog/2019/05/30/fusionauth-recognized-industry-distinctions-comparecamp)

## Learn More About FusionAuth

FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available at the best price. We provide registration, login, passwordless login, SSO, MFA, data search, social login, user management and more, 100% free for unlimited users.

[Learn More](/ "FusionAuth Home"){: .btn .btn-primary}
