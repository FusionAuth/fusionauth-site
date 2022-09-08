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

Single sign-on (SSO) is a key part of any customer identity and access management (CIAM) strategy. Why? Because your organziation will almost always have more than one application for your customers. Even if you being with only one custom application, SaaS tools such as support forums, a ticketing system, or a chat system require authentication, and you won't want your users to have to log in to more systems than necessary. 

<!--more-->

Integrating your applications with single sign-on means that your users can access all their applications with a single set of credentials such as a username and password.

Let's say you have two applications for which you want to enable single sign-on.

* The Pied Piper Video Chat application (PPVC)
* The Hooli Jobs application (they're always hiring)

You want to let users log in to the PPVC, and then, if they visit Hooli to apply for a job, have them be automatically signed in to the Hooli Jobs application. This is single sign-on in a nutshell.

This pattern scales to any number of applications, and can include commercial off the shelf apps that support OIDC (OpenID Connect) or SAML (Security Assertion Markup Language). If you have a suite of applications, you can provide a seamless single sign-on experience for all your users. 

But how does it actually work? This blog post will dig into that, but first, let's take a step back and talk about sessions.

## Sessions

Sessions are how servers know they've seen a client before. They are usually implemented with cookies if the application is browser based. In the SSO scenario, the following sessions exist:

* FusionAuth's session, also known as the single sign-on session
* The PPVC application's session
* The Hooli Jobs application's session

If a session doesn't exist for a given application, or it isn't valid, then it must be created or updated after the user has presented valid credentials and authenticated. For FusionAuth, the credentials are often a username and password. They could also be a passwordless flow or a login federated by a social provider like Google or a business directory like Azure AD.

For the other applications in this example, the credential, which proves authentication, is a valid FusionAuth token. 

## Single sign-on request flow diagrams

Here's the flow of an OIDC single sign-on login request. The home page of each application is unavailable to anonymous users. When a browser requests it, they are directed to the identity provider, FusionAuth, to authenticate.

{% plantuml source: _diagrams/blogs/sso/sso-login.plantuml, alt: "Single sign-on request flow during login." %}

You have different sessions managed by different applications, which can have varying lifetimes and storage mechanisms.

(If you are a stickler, you'll notice there is no token request from the apps to FusionAuth after the user authenticates. That is implied and required.)

The PPVC and Hooli Jobs applications delegate authentication to the single sign-on provider, and build their sessions on the foundation of the identity provider's session. That session is, in turn, tied to a user authentication event.

## SAML

SAML is an alternative to OIDC which also allows single sign-on. It is older, more complex, but well supported across a variety of applications, especially business focused ones.

SAML, in contrat to the simple redirect flow of OIDC, passes around signed and/or encrypted XML documents. 

Let's look at a difference scenario. Say you have two other applications: Zendesk and Gusto. Here you want to use SAML to integrate these applications with your identity provider.

Here's a diagram for a SAML flow. Technically this is an service provider (SP) initiated flow where the user is trying to access an application, such as Zendesk, before they are logged in.

{% plantuml source: _diagrams/blogs/sso/saml-sso-login.plantuml, alt: "SAML single sign-on request flow during login." %}

Why would you pick SAML over the cookie based flow mentioned above? The answer is widespread support. SAML has been around since 2005 and many many different kinds of commercial off the shelf and open source applications support it.

When evaluating your identity provider solution, think about what kinds of applications you want to support. Any business focused applications will likely support SAML, whereas support for OIDC is a lot easier to implement in your custom applications. For maximum flexibility, pick an identity provider which supports both. (FusionAuth does.)

## Beyond the browser

Both SAML and OIDC are browser based. They expect functionality such as HTTP redirects, cookies and the ability to interact using URLs. There are other single sign-on protocols that are useful for other kinds of applications. Kerberos is a common one for client server applications.

## Conclusion

SSO is a critical 

what is sso
how is it implemented
kerberos, website, saml

include the diagram
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

support for both
