---
layout: advice
title: How Single Sign-on Works And Why You Should Care
description: Integrating single sign-on (SSO) into your applications means your users can access all your applications with one set of credentials, such as a username and password, a magic link, or a WebAuthn passkey.
author: Dan Moore
image: advice/how-sso-works/how-sso-works-header.png
category: Authentication
date: 2023-02-24
dateModified: 2023-02-24
---

Single sign-on (SSO) is a key part of any customer identity and access management (CIAM) strategy.

Why? Because your organization typically has more than one customer facing application. Even if you start with a custom application, SaaS tools such as support forums, ticketing systems, or chat require your customers to log in. SSO can minimize how many times a customer has to log in.

Integrating single sign-on into your applications means your users can access all their applications with one set of credentials, such as a username and password, a magic link, or a WebAuthn passkey.

Offering this allows you to have one view of the user, which is great for security and data consistency. 

Single sign-on also allows users to minimize the time they spend getting into your application and maximize the time spent using it.

## An SSO scenario

Let's say you have two applications for which you want to enable single sign-on.

* The Pied Piper Video Chat application (PPVC)
* The Hooli Jobs application (they're always hiring)

You want to let users log in to the PPVC, and then, if they visit Hooli to apply for a job, have them automatically signed in to the Hooli Jobs application. And you can have more than two applications behave this way.

This is single sign-on in a nutshell.

This pattern scales to any number of applications, and can include commercial off the shelf (COTS) apps that support OIDC (OpenID Connect) or SAML (Security Assertion Markup Language).

If you have a suite of applications, SSO can provide a seamless authentication experience for your users across the entire set of apps. A common suite of applications similar to this that you might have experienced is the Google suite. Gmail, Google Calendar, Google Drive and more all are entirely different applications running on different servers, but you can bounce between them without re-authentication.

But how does it actually work? This article will dive into this, but first, let's talk about sessions.

## Sessions

Sessions are how HTTP based servers "know" they've seen a client before. Sessions are typically implemented using cookies whenever the application is browser based.

In the SSO scenario above, the following sessions exist:

* The PPVC application's session
* The Hooli Jobs application's session
* The identity provider's session

If a session doesn't exist for a given application, or it isn't valid, then the session must be created or updated. This happens after the user has presented valid credentials and been authenticated.

For the other applications in this example, the credential, which proves authentication has occurred, is a valid token.

## Single sign-on request flow

Here's an OIDC single sign-on flow. The home page of each application is unavailable to anonymous users. When a browser requests it, they are directed to the identity provider to authenticate. However, the authentication at the identity provider happens only once.

{% plantuml source: _diagrams/learn/expert-advice/authentication/single-sign-on/sso-login.plantuml, alt: "Single sign-on request flow during login." %}

(If you are a stickler, you'll notice there is no request for a token from the apps to the identity provider after the user authenticates. That is implied and required.)

With SSO there are different sessions managed by different applications, which can have varying lifetimes and storage mechanisms.

The PPVC and Hooli Jobs applications delegate authentication to the single sign-on provider, and build their sessions on the foundation of the identity provider's session. That session is, in turn, tied to a user authentication event.

That's it. All that is required for single sign-on to work is:

* a browser that respect redirects
* a single source of truth for user authentication data (often called an identity provider)
* a defined protocol for an application to bounce an unauthenticated user to the identity provider
* a defined protocol for the identity provider to bounce requests back to the application 
* a sessions for each application (typically managed with cookies)

However, there are many use cases to consider, including:

* Account takeover
* Logout
* Account locking and revocation
* Loss of network access

Luckily, other folks have thought about these too, including standards bodies. Let's look at another implementation, using a standard.

## SAML SSO

SAML is an alternative to OIDC which also allows single sign-on. It is older, more complex, but well supported across many applications, especially B2B applications.

(Again, if you're a stickler, this is talking about SAMLv2, the latest version of SAML, codified in 2005.)

SAML, in contrast to the JWT based flow of OIDC, uses signed and/or encrypted XML documents to convey information about users. 

Let's look at a different scenario. Say you have two different applications: Zendesk and Gusto. You want to use SAML to integrate these applications with your identity provider.

Here's a diagram for a SAML flow. This is a service provider (SP) initiated flow, where the user is trying to access an application, such as Zendesk (the SP), when they are not logged in.

{% plantuml source: _diagrams/learn/expert-advice/authentication/single-sign-on/saml-sso-login.plantuml, alt: "SAML single sign-on request flow during login." %}

SAML is more complicated because of the breadth of the specification and because of the flexibility of XML. If you are looking to implement it, using a battle tested library is a good idea.

FusionAuth provides an [open source library for Java](https://github.com/FusionAuth/fusionauth-samlv2/) that is regularly tested and updated.

## Why Use SAML

Why would you pick SAML over the OIDC flow mentioned above? Widespread support. SAML has been around since 2005 and many many commercial off the shelf and open source applications support it.

When evaluating your identity provider solution, think about what kinds of applications you need to support.

Any business focused applications will typically support SAML, whereas support for OIDC is far easier to implement in your custom applications. Newer COTS applications may support OIDC.

For maximum flexibility, pick an identity provider which supports both standards.

## Beyond the browser

Both SAML and OIDC are browser based. They require functionality such as HTTP redirects, cookies and the ability to interact using URLs.

There are other single sign-on protocols useful for other kinds of applications, such as desktop applications. Kerberos is a common one for client server applications.

## Conclusion

Single sign-on is a key part of your application's authentication story. Your users care about it, even if they don't know it by name.

SSO doesn't have to be difficult. Leveraging standards like OIDC and SAML helps you integrate both custom and commercial off the shelf applications with an identity provider.

