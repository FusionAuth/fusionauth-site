---
layout: blog-post
title: How single sign-on works
description: Single sign-on is a key part of the web experience. How does it typically work?
author: Dan Moore
image: blogs/sso-explanation/how-sso-works.png 
category: blog
tags: topic-single-sign-on
excerpt_separator: "<!--more-->"
---

Single sign-on (SSO) is a key part of any customer identity and access management (CIAM) strategy. Why? Because your organziation will almost always have more than one application for your customers. Even if you are starting out with only one custom application, SaaS tools such as support forums, a ticketing system, or a chat system will require authentication. 

Integrating your applications with single sign-on means that your users will be able to access all their applications with a single set of credentials such as a username and password.

But how does it actually work?

<!--more-->

what is sso
how is it implemented
kerberos, website

include the diagram

Let's These are the applications you'll build:

* Pied Piper
* Hooli

At the end of this guide, both applications will be running. You can then log in to Pied Piper. Then if you visit Hooli, you will be automatically signed in to that second application. If you sign out from either of them, you'll be signed out from both.

This pattern scales to any number of applications, and can include commercial off the shelf apps. If you have a suite of applications, you can provide a seamless single sign-on experience for all your users. 

[NOTE]
====
This guide illustrates a single sign-on scenario where FusionAuth is the system of record for your users.

If, instead, another datastore is your system of record, check out the link:/docs/v1/tech/identity-providers/[Identity Providers] documentation, which allows users to authenticate with third party login. This includes both social sign-on providers like Google as well as providers implementing standards such as OIDC.
====

* <<Concepts>>
* <<Request Flow Diagrams>>
* <<Prerequisites>>
* <<Set Up The Domains>>
* <<Configure The Applications In FusionAuth>>
* <<Set Up The User>>
* <<Set Up The Code>>
* <<Test The Results>>
* <<Other Scenarios>>
* <<Additional Configuration >>
* <<Limitations>>
* <<Additional Resources>>

== Concepts

It's worth spending a bit of time to discuss sessions. Sessions are how servers know they've seen the client, usually a browser, before. They are usually implemented with cookies, but the actual technologies used don't matter. In the SSO scenario, the following sessions exist:

* FusionAuth's session, also known as the single sign-on session
* The Pied Piper application's session
* The Hooli application's session

If a session doesn't exist for a given application, or expected values aren't present in it, then the session must be created or updated after the user has presented valid credentials. For FusionAuth, the credentials are a username and password, but for the other applications, the credential is a valid FusionAuth token. 

== Request Flow Diagrams

Here's the flow of a single sign-on login request.

++++
{% plantuml source: _diagrams/docs/guides/sso-login.plantuml, alt: "Single sign-on request flow during login." %}
++++

Here's the flow of the corresponding logout request.

++++
{% plantuml source: _diagrams/docs/guides/sso-logout.plantuml, alt: "Single sign-on request flow during logout." %}
++++

Above, note that FusionAuth automatically logs the user out of the Hooli application after the user chooses to log out of the Pied Piper application. The user does not have to log out of multiple applications. The logout URLs will be called for each application in this tenant, allowing you to transparently sign the user out of three, five or ten web applications. However, you can disable this setting too.


## Conclusion

SSO is a critical 
