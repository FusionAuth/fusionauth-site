---
layout: blog-post
title: "FusionAuth 1.6 Adds SAML Support and More"
description: FusionAuth 1.6 adds SAML support and much more in this new release. Download and upgrade now!
author: Daniel DeGroff
excerpt_separator: "<!--more-->"
categories: blog
tags:
- release notes
image: blogs/fusionauth-1-6-saml.png
---

If you haven't seen it [on Github](https://github.com/FusionAuth/fusionauth-issues/issues/ "Jump to Github") yet, we are always taking feedback and suggestions on what our clients need from FusionAuth. This week we are releasing version 1.6 and stoked to deliver this one to you. We've got a few new features and some minor fixes for issues discovered by QA testers and our community of users on [Stackoverflow](https://stackoverflow.com/questions/tagged/fusionauth "Jump to StackOverflow") and Github. Get the brief overview below, and visit our [release notes](/docs/v1/tech/release-notes/#version-1-6-0) for the full details.

<!--more-->

## New Feature - SAMLv2 Support

Recently We received several specific requests to support SAML, and at first we were a little resistant. As [Scott Barden](https://github.com/scopendo) asks in the feature request discussion "Isn't this skating to where the puck has already been?" We know there are better options than SAML and want to encourage devs to move to more modern solutions. Even Azure Active Directory appears to be dropping their SAML support in new versions. 

Unfortunately, SAML isn't going anywhere anytime soon. G Suite uses it for custom apps, and there are many IT groups that have older Active Directory instances that either don't support OIDC yet, or the team only knows SAML and they aren't changing. No problem, we understand.

**Bottom line:** Even though it's old and broken, SAML will be around for a while so we will support it. For everyone that needs it, we have it for you. If you don't, ignore it and learn about our other updates below.

## Additional updates

ADDMORE - Lambda support and Event Log


## Fixes & Updates

The FusionAuth 1.6 release has many other updates and fixes that you should know about. Here a few and visit our [release notes](/docs/v1/tech/release-notes/#version-1-6-0) for the full details.
- We fixed an issue with Passwordless login if no email template is configured or if Passwordless login is disabled.
- If you are using the Implicit Grant and you have Self Service Registration enabled for the same application, the redirect after the registration check will assume you are using the Authorization Code grant. Thanks to [Whiskerch](https://github.com/whiskerch) for reporting this issue in GitHub Issue [#102](https://github.com/FusionAuth/fusionauth-issues/issues/102).
- Fixed an issue with OpenID Connect federated login.
- When you use the Refresh Grant with a Refresh Token that was obtained using the Authorization Code grant using the openid scope, the response will not contain an id_token as you would expect. This fixes GitHub Issue [#110](https://github.com/FusionAuth/fusionauth-issues/issues/110) - OIDC and Refresh Tokens. Thanks to [Fabiosimeoni](https://github.com/fabiosimeoni) for reporting this issue
- We fixed an issue with the urls in self service registration that caused a 400 error. Thanks to [Botnyx](https://github.com/botnyx) for opening this issue. [#118](https://github.com/FusionAuth/fusionauth-issues/issues/118)
- We fixed an "invalid_origin" error when using implicit grants. Thanks again to Botnyx opened this issue. [#119](https://github.com/FusionAuth/fusionauth-issues/issues/119)
https://github.com/FusionAuth/fusionauth-issues/issues/122
- Fixed an issue when using Sparkpost and TLS/SSL. Thanks to [Plunkettscott](https://github.com/plunkettscott) for catching this one.


## FusionAuth Is Always Improving
We test and update FusionAuth constantly to ensure that we are providing you with the most flexible and powerful identity and access management solution. If you find a bug or have any questions, let us know either at [GitHub](https://github.com/FusionAuth/fusionauth-issues "Jump to GitHub") or [StackOverflow](https://stackoverflow.com/questions/tagged/fusionauth "Jump to StackOverflow") and we’ll take a look.

## Learn More About FusionAuth

FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available at the best price. We provide registration, login, SSO, MFA, data search, social login, user management and more, 100% free for unlimited users.

[Learn More](/ "FusionAuth Home"){: .btn .btn-primary}
