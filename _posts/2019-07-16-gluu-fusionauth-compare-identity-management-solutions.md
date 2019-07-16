---
layout: blog-post
title: "Gluu and FusionAuth: Compare Identity Management Solutions"
description: "Compare the features and capability of Gluu and FusionAuth Identity Management Solutions"
author: Bryan Giese
excerpt_separator: "<!--more-->"
categories: blog
tags:
- comparison
image: blogs/gluu-fusionauth-comparison-main.png
---

Gluu and FusionAuth are powerful identity management solutions designed to eliminate the costly development and maintenance time required to build an in-house system. While they share some features, they have important differences. Use this information to compare Gluu and FusionAuth and determine which best matches your requirements.

<!--more-->

## What Gluu and FusionAuth Have In Common

Gluu and FusionAuth both provide the standard features of a modern identity management platform, as well as unique features designed for modern applications and businesses.

### Single-Tenant and On-Premises Capable
First, to provide a necessary option to SaaS platforms, both Gluu and FusionAuth can install locally or in private cloud instances as single-tenant solutions. This provides true data isolation and eliminates the possibility of data leakage between unrelated companies, whether accidentally or through hacker efforts. It also eliminates the risk of another company’s poor security practices enabling access to your customer’s data.

An additional benefit of a single-tenant solution is the higher degree of control over application and user data, allowing for easier compliance with complex regulatory restrictions. Germany’s Bundesdatenschutzgesetz, Australia’s Privacy Principles, Canada’s PIPEDA, and most recently the European Union’s GDPR all place different restrictions on how a customer’s personal data can be utilized and transmitted. Gluu and FusionAuth provide the expanded control required for data flow control and management necessary in many industries and countries.

For additional details on the benefits and pitfalls of single- and multi-tenant solutions [read this whitepaper](/blog/2018/12/03/single-tenant-vs-multi-tenant).

### Common Authentication Standards
It is essential for any identity platform to support current standards in order to integrate with the variety of protocols used across the web. Both Gluu and FusionAuth support OAuth, OpenID Connect, SAML and other common protocols for secure user registration and authentication. Support for frequently requested social logins such as Google, Facebook, and Twitter is included, although Gluu requires an additional 3rd party component.

Both platforms also support single sign-on (SSO) and a variety of multi-factor authentication (2FA/MFA) options to enable stronger user security for every application. These features are becoming increasingly necessary as cyber attacks become more sophisticated.

### Cost: Both Have a Free Option
Every company needs to control their costs, especially for essential components. Authorization and identity management is often given minimal attention, although it can have the greatest risk of cyber attack and data loss. Fortunately, both Gluu and FusionAuth have free options. Gluu offers their Gluu Server Community Edition (CE), a free, open source software that incorporates components from a variety of [open source projects](https://gluu.org/docs/ce/#license "Jump to Gluu site"). FusionAuth also provides their commercial platform for free, allowing developers to deploy it on any server for development or production use. _NOTE: Be sure to read **All Features from Day One** below_.

By offering free versions both Gluu and FusionAuth are providing an important option for startup, growth stage, and enterprise organizations. Most SaaS solutions jump to substantially higher pricing tiers as user counts increase, or require subscriptions to enterprise tiers to unlock commonly used features. Self-hosted options allow companies to control costs and minimize risks by using enterprise-level security and identity management from the beginning of any project.

## How Gluu and FusionAuth Are Different

[{% include _image.html src="/assets/img/blogs/gluu-fusionauth-comparison.png" alt="Gluu and FusionAuth Feature Comparison" class="float-left img-thumbnail mr-md-4 mt-md-4 mb-md-4" style="max-width: 600px;" figure=false %}](/resources/fusionauth-vs-gluu.pdf "Download the Gluu and FusionAuth Feature Comparison")

### All Features From Day One
Up above, we said that Gluu and FusionAuth both can be downloaded and deployed for free, and that is true. But there is an important difference: Gluu Server CE is a subset of the complete platform’s features–you will need to upgrade to their [VIP or Enterprise packages](https://www.gluu.org/pricing#vip "Jump to Gluu site") to unlock additional high availability functionality, two-factor authentication features, and vulnerability notifications.

FusionAuth takes a different approach. We provide our complete platform with no premium tiers, no enterprise-only features, and no sacrifices. You can download and deploy the entire platform with access to every feature with no restrictions, licenses, or barriers regardless of how many users you have. Whether you deploy it on your own servers or take advantage of our [FusionAuth Cloud managed hosting](/pricing/) you get every feature and function of the entire platform from day one. You also get all future upgrades, features, and patches without any additional fees.

### Ease of Installation
The installation process for Gluu and FusionAuth are drastically different. For Gluu, there is a [complex sequence of steps](https://gluu.org/docs/ce/installation-guide/ "Jump to Gluu site") including VM preparation, unique system configurations, domain settings, and multiple module downloads. There are also specific configuration steps depending on your platform–your Linux version, cloud provider, and VM choice all impact the steps you need to take to get the Gluu Server up and running. Additionally, you will need to purchase the VIP or Enterprise version of Gluu to deploy in containers such as Docker and Kubernetes. The entire process requires a deeper knowledge of server and system management as well as a substantial amount of time to complete.

In contrast, FusionAuth easily installs on any version of Linux, macOS, Windows, Docker, wherever. Simply use our Fast Path install to download and unpack everything you need in seconds. Our [Setup Wizard](/blog/2019/02/05/using-the-setup-wizard) will take over from there and guide you through the final steps so you are ready to integrate FusionAuth with your application. The upgrade process for new versions with additional features, upgrades, and patches is just as easy. Just download and install.

The bottom line is simple. Authentication and identity management are required components of every application, but they don’t bring in any revenue. The more time you spend setting up and managing your identity solution, the less time you can dedicate to building app features to delight your users and earn you money.

### Email Templates, Triggers, and Localization
FusionAuth gives you much more control of your users’ experience than Gluu, including full HTML capability in all your registration, login, and notification workflow emails. You can design and deliver messages that fit your brand in style, color, phrasing, imagery and whatever else you want to include. Simply design it and load it up and every email will be exactly what you need.

FusionAuth also lets you trigger event-based emails for any custom event. Simply set up an API call for the event and create an email for it and you are all set. Want to send a message to the user when they’ve hit a milestone like “over 100 visits”? No problem. You want to send an email to active users from a specific region who achieve a specific level during a unique week-long promotion? Got it. The uses and possibilities for this are endless, and can increase the interaction and engagement between you and your audience.

Another feature that sets FusionAuth apart from Gluu is email localization. In today’s worldwide marketplace, customers can come from anywhere in the world, but many companies struggle to deliver their products and services to the wide range of languages they encounter. FusionAuth allows you to create localized versions of any transactional email based on a user’s locale. You can create customized HTML and text email templates for the regional languages you support, and easily add additional options as your community grows.

### User Management, Reporting, and Analytics
A significant difference between Gluu and FusionAuth is how system administrators are able to organize, moderate, and monitor their users. FusionAuth was designed from the beginning as a complete identity management solution. We make it easy for administrators to not only authenticate users, but to manage and monitor user interactions within their applications. The intuitive web-based user interface allows admins to efficiently manage users with flexible search, segmentation, reward and discipline functionality.

FusionAuth also provides a selection of default user reports like daily/monthly active users, logins and registrations without any additional configuration or setup. Real-time dashboards provide a quick snapshot of current user statistics for at-a-glance updates of user activity. This is essential information for any growing company that needs to monitor the outcomes of their most recent initiatives.

### Configurable Password Encryption
Every application has different security requirements. Some need to be HIPAA compliant, while others can be less stringent. FusionAuth lets you pick the level of security you need, and adjust it as quickly as your requirements (or threats) evolve. We also allow you to use different password schemas for different groups of users, making it possible to consolidate multiple identity management systems into one efficient platform. This can be a completely transparent process without any downtime or customer friction. For more details, read about [how we migrated DataStax](/resources/datastax-case-study.pdf) from their previous solution.

These are just a few of the differences between Gluu and FusionAuth. To see more details on how Gluu and FusionAuth stack up, [download this feature comparison](/resources/fusionauth-vs-gluu.pdf "Gluu and FusionAuth Feature Comparison") or review the FusionAuth [documentation](/docs). If you have any specific questions, please [contact us](/contact "Contact Us")–we’re happy to discuss your unique requirements.

[Download the Gluu and FusionAuth Feature Comparison](/resources/fusionauth-vs-gluu.pdf "Gluu and FusionAuth Feature Comparison"){: .btn .btn-primary}

## Learn More About FusionAuth
FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available at the best price. We provide registration, login, SSO, MFA, data search, social login, user management and more, 100% free for unlimited users. [Find out more](/ "FusionAuth Home") about FusionAuth and download it today.

### Additional Comparisons

Interested in how FusionAuth compares to other solutions?
- [Active Directory](/blog/2018/09/14/active-directory-and-passport-ciam-comparison "Active Directory and FusionAuth")
- [Auth0](/blog/2018/10/19/auth0-and-fusionauth-a-tale-of-two-solutions "Auth0 and FusionAuth")
- [Cognito](/blog/2018/09/18/amazon-cognito-and-fusionauth-comparison "Amazon Cognito and FusionAuth")
- [Firebase](/blog/2018/10/02/firebase-and-fusionauth-ciam-comparison "Firebase and FusionAuth")
- [Gluu](/blog/2019/07/16/gluu-fusionauth-compare-identity-management "Gluu and FusionAuth")
- [Keycloak](/blog/2019/03/06/keycloak-fusionauth-comparison "Keycloak and FusionAuth")
- [Ping Identity](/blog/2018/10/08/quick-comparison-ping-identity-and-fusionauth "Ping Identity and FusionAuth")
- [Okta](/blog/2018/10/16/8-things-to-know-about-okta-and-fusionauth "Okta and FusionAuth")
- [OneLogin](/blog/2018/10/12/onelogin-and-fusionauth "OneLogin and FusionAuth")
