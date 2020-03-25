---
layout: blog-post
title: FusionAuth 1.4 Adds Self-Service Registration, TypeScript Client Library & More
description: FusionAuth 1.4 is now available adding Self-Service Registration, Typescript Client Library and more.
author: Daniel DeGroff
image: blogs/fusionauth-self-service-registration-typescript.jpg
category: blog
excerpt_separator: "<!--more-->"
---

FusionAuth 1.4 was just released and is available for [direct download](/download) and through our [FastPath one-line install](/). It includes new features, a few changes, and some minor fixes for issues discovered by our excellent community and QA testers. Get the brief overview below, and visit our [release notes](/docs/v1/tech/release-notes#version-1-4-0) for the full details.

<!--more-->

## New Features


**Self-Service Registration**<br>
<img src="/assets/img/blogs/register-form.png" alt="Register User" class="float-right mb-3 ml-3" style="width: 225px;"/>
It's easier than ever for users to set up a new account or register for new applications. We now give you the option to enable self-service registration for any one of your applications. This eliminates the need to build detailed registration forms and is perfect for when you want users up and running quickly.

You can start super simple and just collect an email and password, and optionally ask for their name and phone number. This new form can also be customized using our theme feature. See our [Theme Tutorial](/docs/v1/tech/themes/) for additional information. Get started by navigating to your FusionAuth application (`Settings -> Applications`) to `Edit` an application. Under `Options`, click on the `Registration` tab. Here you'll find the Self-service Registration configuration.



**TypeScript Client Library**<br>
If you're integrating FusionAuth with a TypeScript application, [this library](/docs/v1/tech/client-libraries/typescript) will speed up your development time. All of our client libraries are open source and hosted on our [GitHub account](https://github.com/FusionAuth "Jump to GitHub"). You can fork and tweak them as well as look over the code to learn how the client libraries work. If we are missing a language, open a [GitHub Issue](https://github.com/FusionAuth/fusionauth-issues/issues "Jump to GitHub") as a Feature Request.

**Enhanced User Login Report**<br>
Real-time reporting is essential to monitor your applications. Who wants week- or even day-old reports with no details? In this release we have enhanced our User Login Report to allow you to narrow the report to a single user by using a rich text search field. Watch the video below to see it in action.

<div class="d-flex justify-content-center mb-5 mt-1 youtube">
<iframe src="https://www.youtube.com/embed/IPB8Rig52PI" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## Fixes & Updates

- The FusionAuth [System Requirements](/docs/v1/tech/installation-guide/system-requirements) have been updated. Please review the updated requirements to ensure you meet the minimum supported versions of operating systems and databases.
- There was an issue where silent configuration mode would fail when using Docker Compose. This only occurred in FusionAuth versions prior to `1.1.0` because the silent configuration was not updating the database schema automatically.
- In our testing we discovered that installations with multiple tenants could delete a tenant with an API key not assigned to it. This has been corrected so when there are multiple tenants, a tenant may only be deleted using an API key that is not assigned to any tenant.
- MySQL 8.0.13 changed their SSL/TLS handling causing FusionAuth connections to incorrectly handle public keys. This has been fixed by allowing FusionAuth to perform a secondary request to MySQL to fetch the public key.
- We corrected an issue where if an existing FusionAuth user logs in with a social login provider it could cause them to be unable to log in to FusionAuth directly using their original credentials.
- We fixed an issue reported by [StanislavKD](https://github.com/StanislavKD) that was related to a user's SSO session. Get the full details in this support thread:  [Github Issue #59: Using a access token for a lock account](https://github.com/FusionAuth/fusionauth-issues/issues/59 "Jump to GitHub")

We test and update FusionAuth constantly to ensure that we are providing you with the most flexible and powerful identity and access management solution. If you find a bug or have any questions, let us know in either [GitHub](https://github.com/FusionAuth/fusionauth-issues "Jump to GitHub") or [StackOverflow](https://stackoverflow.com/questions/tagged/fusionauth "Jump to StackOverflow") and we'll take a look.

## Learn More About FusionAuth

FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available at the best price. We provide registration, login, SSO, MFA, data search, social login, user management and more, 100% free for unlimited users.

[Find out more about FusionAuth](/ "FusionAuth Home") and download it today.
