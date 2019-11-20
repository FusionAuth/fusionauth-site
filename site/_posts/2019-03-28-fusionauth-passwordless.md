---
layout: blog-post
title: FusionAuth 1.5 Adds Passwordless Login
description: FusionAuth 1.5 adds passwordless login and more. Download and upgrade now!
author: Daniel DeGroff
excerpt_separator: "<!--more-->"
categories: blog
tags:
- release notes
image: blogs/fusionauth-1-5-passwordless.png
---

Logging in without a password? In what fantasy land can that be secure?!? The fact is it can be much more secure than traditional passwords, and is now supported in our newest release. FusionAuth 1.5 is now available for [direct download](/download),  [FastPath one-line install](/docs/v1/tech/installation-guide/fast-path), [Homebrew](/docs/v1/tech/installation-guide/homebrew) or [Docker](/docs/v1/tech/installation-guide/docker). It includes new features, a few changes, and minor fixes for issues discovered by QA testers and our growing community of users. Get the brief overview below, and visit our [release notes](/docs/v1/tech/release-notes#version-1-5-0) for the full details.

<!--more-->

## New Feature - Passwordless Login

For years, one of the most common ways hackers use to access servers, data, and accounts has been to guess, steal, phish, or otherwise obtain the username and password of an authorized user. Unfortunately selecting, changing, updating, remembering, and managing passwords for the multiple accounts that most people have these days has become a monumental task of its own, and too many people end up ignoring safe password guidelines, leading to more hacking and more data breaches.

**So why don't we get rid of passwords altogether? Ok, good idea. Done.**

<img src="/assets/img/blogs/login-magic-link.png" alt="Login with a magic link" class="float-right mb-3 ml-3" style="width: 250px;"/>

The FusionAuth 1.5 release now allows passwordless login via user email, providing a secure way to authenticate users without complex password `r3qu!r3mENt5` that nobody can remember. Users simply type in their email address and get a secure email with a link back to the site. When they click the link, they are authenticated and can enter the site or application without issue. If a malicious user tries to login with your email address, they'll never see the email, and won't be able to get gain access.

In case passwordless is brand new to you, this concept isn't something we just invented. It's been used by Microsoft in Outlook, Office, Skype, and Xbox Live. Passwordless is also a keystone technology of [WebAuthn](https://www.theverge.com/2019/3/4/18249895/web-authentication-webauthn-world-wide-web-consortium-w3c-standard-browsers) recommended by the World Wide Web Consortium (w3c) and supported by all major browsers. 

If you're still not getting it, read more about passwordless [here](https://nakedsecurity.sophos.com/2018/11/22/the-passwordless-web-explained/). As passwords continue to be proven difficult to secure, more sites and applications will rely on passwordless authentication solutions in one form or another.

**Why isn't it used by everyone already?**

Because change is hard and many applications that store user credentials were not built with this type of flexibility in mind. This is why we added it to FusionAuth. We specialize in removing pain from authentication so that every site and application can take advantage of the ever evolving methods of authentication.

**Watch the video below to see it in action.**

<div class="d-flex justify-content-center mb-5 mt-1 youtube">
<iframe src="https://www.youtube.com/embed/hMqxo68ZJlw" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## Fixes & Updates

While we are pretty excited about passwordless login, the FusionAuth 1.5 release has many other updates and fixes that you should know about. Here are just a few to get you started, and visit our [release notes](/docs/v1/tech/release-notes#version-1-5-0) for the full details.

- Added support for the OAuth2 / OpenID Connect Implicit Grant. See the OAuth 2.0 & OpenID Connect Overview and OAuth 2.0 Endpoints for additional information.
- OAuth2 grants can now be enabled or disabled per application.
- Change Password API can be called using a JWT providing additional support for the Change Password workflow in a single page web application.
- The Change Password API can return a One Time password (OTP) allowing for a more seamless user experience when performing a change password workflow.
- When using the Change Password workflow the user will be automatically logged in upon completing the change password required during login.
- We improved the Two Factor Login API to provide additional support and ease of use in a single page web application.
- We adjusted the workflow when a user has 2FA enabled and a password change is required during login. Now the 2FA will occur before the change password workflow.
- The `id_token` is now signed with the `client_secret` when `HS256`, `HS384` or `HS512` is selected as the signing algorithm. This is necessary for compliance with OpenID Connect Core 3.1.3.7 ID Token Validation. This fixes [Github Issue #57](https://github.com/FusionAuth/fusionauth-issues/issues/57 "Jump to GitHub"). Thanks to [Garogat](https://github.com/Garogat) for reporting this issue.
- A change to the Docker build for permissions reduced the overall FusionAuth app image by ~200 MB.


## FusionAuth Is Always Improving
We test and update FusionAuth constantly to ensure that we are providing you with the most flexible and powerful identity and access management solution. If you find a bug or have any questions, let us know either at [GitHub](https://github.com/FusionAuth/fusionauth-issues "Jump to GitHub") or [StackOverflow](https://stackoverflow.com/questions/tagged/fusionauth "Jump to StackOverflow") and we'll take a look.

## Learn More About FusionAuth

FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available at the best price. We provide registration, login, SSO, MFA, data search, social login, user management and more, 100% free for unlimited users.

[Learn More](/ "FusionAuth Home"){: .btn .btn-primary}
