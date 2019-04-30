---
layout: blog-post
title: "FusionAuth 1.6 Adds SAML Support and More"
description: FusionAuth 1.6 adds SAML support and much more in this new release. Download and upgrade now!
author: Daniel DeGroff
excerpt_separator: "<!--more-->"
categories: blog
tags:
- release notes
image: blogs/fusionauth-1-6-saml-lambda.png
---

If you haven't seen it [on Github](https://github.com/FusionAuth/fusionauth-issues/issues/ "Jump to Github") yet, we are always taking feedback and suggestions on what our clients need from FusionAuth. This week we are releasing version 1.6 and stoked to deliver it to you. We've got a few new features and some minor fixes for issues discovered by our community of users on [Stackoverflow](https://stackoverflow.com/questions/tagged/fusionauth "Jump to StackOverflow") and Github. Get the brief overview below, and visit our [release notes](/docs/v1/tech/release-notes/#version-1-6-0) for the full details.

<!--more-->

## New Feature - SAMLv2 IdP Support

Recently we received several specific requests to support SAML, and at first we were a little resistant. As [Scott Barden](https://github.com/scopendo) asks in the feature request discussion "Isn't this skating to where the puck has already been?" We know there are better options than SAML and want to encourage devs to move to more modern solutions. Even Azure Active Directory appears to be dropping their SAML support in new versions. So why'd we do it?

The truth is SAML isn't going anywhere anytime soon. G Suite uses it for custom apps, and there are many IT groups that have older Active Directory instances that either don't support OIDC yet, or the team only knows SAML and they aren't changing. No problem, we understand.

**Bottom line:** Even though it's (IMHO) old and broken, SAML will be around for a while so we will support it. For everyone that needs it, we have it for you. If you don't, ignore it and learn about our other updates below. **NOTE:** The SAML specification is complex and not all SAML v2 Service Providers are specification compliant (this is another reason we resisted it). Make sure you test your implementation thoroughly. If you run into problems open a GitHub issue and we will try to help.

## More New Hotness

### Lambda Support
Lambdas are user defined JavaScript functions executed at runtime to perform various functions. We had several requests for this feature on Github, and have worked through the most common use cases. In this release, Lambdas can be used to customize the claims returned in a JWT, reconcile a SAML v2 response or an OpenID Connect response when using these Identity Providers. See the [Lambda API](https://fusionauth.io/docs/v1/tech/lambdas/overview) and the new Lambda settings in the UI **Settings > Lambdas**, and let us know if you would like additional use cases that we don't currently cover.

### Event Log
We've added a new event log designed to assist developers while debugging integrations. You'll find it in the UI under **System > Event Log**. It includes SMTP Transport errors, Lambda execution exceptions, Lambda debug output, SAML IdP integration errors and more! Check it out and let us know how we can make it better for you.

### Duplicate Email Templates
[Davidmw](https://github.com/davidmw) was the first to ask if we could make it easy to duplicate existing email templates as the basis for a new template, so he gets the credit. Version 1.6 adds the ability to duplicate any existing template with a click so you can customize it further as needed. No more starting from scratch on each new email!
{% include _image.html src="/assets/img/duplicate-email-template-view.png" alt="Duplicate Email Template Example" class="img-fluid full mb-4" figure=false %}

## Fixes & Updates

The FusionAuth 1.6 release has additional updates and fixes that you should know about. The details are in the [release notes](/docs/v1/tech/release-notes/#version-1-6-0) but here are a few.
- There is a database schema change and an upgrade is required. You will be prompted to upgrade the database by maintenance mode.
- We fixed an issue with [Passwordless login](/blog/2019/03/28/fusionauth-passwordless) if no email template is configured or if Passwordless login is disabled.
- If you are using the Implicit Grant and you have Self Service Registration enabled for the same application, the redirect after the registration check will assume you are using the Authorization Code grant. Thanks to [Whiskerch](https://github.com/whiskerch) for reporting this issue in GitHub Issue [#102](https://github.com/FusionAuth/fusionauth-issues/issues/102).
- Fixed an issue with OpenID Connect federated login.
- GitHub Issue [#110](https://github.com/FusionAuth/fusionauth-issues/issues/110) - OIDC and Refresh Tokens is fixed. Thanks to [Fabiosimeoni](https://github.com/fabiosimeoni) for reporting this issue
- We fixed an issue with the urls in self service registration causing a 400 error. Thanks to [Botnyx](https://github.com/botnyx) for opening this issue. [#118](https://github.com/FusionAuth/fusionauth-issues/issues/118)
- Thanks again to Botnyx for finding an "invalid_origin" error when using implicit grants. [#119](https://github.com/FusionAuth/fusionauth-issues/issues/119) is fixed.
- Fixed an issue when using Sparkpost and TLS/SSL. Thanks to [Plunkettscott](https://github.com/plunkettscott) for catching this one.


## FusionAuth Is Always Improving
We test and update FusionAuth constantly to ensure that we are providing you with the most flexible and powerful identity and access management solution. If you find a bug or have any questions, let us know either at [GitHub](https://github.com/FusionAuth/fusionauth-issues "Jump to GitHub") or [StackOverflow](https://stackoverflow.com/questions/tagged/fusionauth "Jump to StackOverflow") and we’ll take a look.

## Learn More About FusionAuth

FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available at the best price. We provide registration, login, SSO, MFA, data search, social login, user management and more, 100% free for unlimited users.

[Learn More](/ "FusionAuth Home"){: .btn .btn-primary}
