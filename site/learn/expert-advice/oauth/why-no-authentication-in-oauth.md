---
layout: advice
title: Authentication and OAuth
description: Authentication isn't defined in the OAuth specifications. Why is that?
image: advice/what-is-oauth/expert-advice-what-is-oauth-and-why-should-you-use-it.png
author: Dan Moore
category: OAuth
date: 2022-09-27
dateModified: 2022-09-27
---

OAuth, a standard for securely delegating authorization information, and OIDC, a profile written on top of it to securely share user profile data, both rely heavily on authentication of the user. Users are also known as "resource owners". Authentication takes place at an authorization server, such as FusionAuth.

The authorization server issues access tokens only after the user has been authenticated.

However, there is next to no guidance in the OAuth protocol definitions about how to actually authenticate the user. Should developers:

* Use a username and password?
* A magic link?
* Delegate to a third party?
* Require a TOTP code?
* Start a WebAuthn ceremony?
* Do two or more of the above?

Why exactly is 'authentication' undefined in the OAuth and OIDC specifications?

## The Types of Factors

First off, there are four main categories of ways to authenticate. The end goal is for the user to provide proof of who they are. Each individual method is called a "factor". 

There are four broad types of factors:

* What the user knows. For example, a password.
* What the user has, such as a mobile phone.
* What the user is; this could be a fingerprint or handprint.
* Where the user is, possibly ascertained by using GPS or known network configuration.

Factors must be kept secure. If they can be shared, they should not be, in order to ensure that the authenticating user is associated with the correct account.

Next, let's look at OAuth.

## The OAuth Token Issuing Process

The OAuth flow process is essentially:

* The user (or, more precisely, some software acting on behalf of the user) tries to access a protected resource
* The protected resource redirects the user to the authorization server
* The authorization server authenticates the user
* The user is sent a token
* The token is presented to a protected resource
* The protected resource validates the token
* The user is granted access to a protected resource

This is a high level, truncated version, and there's a lot more, but let's keep it simple.

If you'd like more details (oh, yes, many more) about the OAuth process, please check out [the Modern Guide to OAuth](/learn/expert-advice/oauth/modern-guide-to-oauth).

## What About the Specs

Since the Authorization Code grant is the primary user-facing OAuth grant, let's take a closer look at that grant.

If you examine the specifications, it's clear that authentication is critical to this grant. From [RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749), the OAuth2 standard, the authorization server is:

> The server issuing access tokens to the client after successfully authenticating the resource owner and obtaining authorization.

What else does RFC 6749 have to say about authentication of the end user?

In section 1.3.1, there's this:

> Before directing the resource owner back to the client with the authorization code, the authorization server authenticates the resource owner and obtains authorization.  Because the resource owner only authenticates with the authorization server, the resource owner's credentials are never shared with the client.

So it's clear that:

1. Authentication happens at the authorization server and only the authorization server
2. The resource owner's credentials are never shared with other parts of the system, including the client which is requesting access to any protected resources.

And yet, the *means* of authentication is never defined.

How about the [OAuth 2.1 draft](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-05), currently under development? It's very similar to the OAuth2 document in general. But the 2.1 draft has an expanded section 1.3.1:

> Before directing the resource owner back to the client with the authorization code, the authorization server authenticates the resource owner, and may request the resource owner's consent or otherwise inform them of the client's request.  Because the resource owner only authenticates with the authorization server, the resource owner's credentials are never shared with the client, and the client does not need to have knowledge of any additional authentication steps such as multi-factor authentication or delegated accounts.

Here you start to learn something about the authentication process: there are "additional steps", such as multi-factor authentication. But there's still no clear definition of how the authorization server should verify the user is who they say they are.

Well, OAuth is about authorization, not authentication. Maybe we're looking in the wrong place.

Perhaps OIDC spells out how you should authenticate the user? There is, after all, an [entire section titled "Authentication"](https://openid.net/specs/openid-connect-core-1_0.html#Authentication).

This section starts:

>  OpenID Connect performs authentication to log in the End-User or to determine that the End-User is already logged in. OpenID Connect returns the result of the Authentication performed by the Server to the Client in a secure manner so that the Client can rely on it. For this reason, the Client is called Relying Party (RP) in this case. 
and a bit further on covers the authentication process explicitly.

>  If the request is valid, the Authorization Server attempts to Authenticate the End-User or determines whether the End-User is Authenticated, depending upon the request parameter values used. The methods used by the Authorization Server to Authenticate the End-User (e.g. username and password, session cookies, etc.) are beyond the scope of this specification. An Authentication user interface MAY be displayed by the Authorization Server, depending upon the request parameter values used and the authentication methods used. 

So not only is method of authentication not defined, it is *explicitly* declared out of scope:

>  The methods used by the Authorization Server to Authenticate the End-User ... are beyond the scope of this specification.

Okay.

So none of the specifications lay out what authentication looks like, though there are suggestions and hints.

Why is this?

## Separation of Concerns

The concept of separation of concerns is a common pattern in software. Developers break software up into different components. Each component is responsible for different functionality. For example, some are responsible for creating the user interface, others for data access.

The OAuth and OIDC specifications do not define authentication. Instead, they focus on the precursors and artifacts of an authentication event.

This means that the authorization server can authenticate the user to whatever level of certainty it needs, based on what it knows. It can require more than one factor, it can leverage WebAuthn for biometric assurances, or it can use a magic link for ease of use.

There are specifications focused on authentication levels. One is [NIST 800-63-3](https://pages.nist.gov/800-63-3/sp800-63-3.html) which defines the three levels of "Authenticator Assurance".

These three levels are creatively named:

* AAL1
* AAL2
* AAL3

(Well, it is a document produced by the US government.)

If you look at the NIST specification, the first level, AAL1, "provides some assurance that the claimant controls an authenticator bound to the subscriber’s account. AAL1 requires either single-factor or multi-factor authentication using a wide range of available authentication technologies. Successful authentication requires that the claimant prove possession and control of the authenticator through a secure authentication protocol."

This means that for AAL1, you have the most flexibility, but less than total "assurance that the claimant controls an authenticator bound" to the user account. 

The next level, AAL2, is a step up and "provides high confidence that the claimant controls authenticator(s) bound to the subscriber’s account. Proof of possession and control of two distinct authentication factors is required through secure authentication protocol(s). Approved cryptographic techniques are required at AAL2 and above."

AA2 offers "high confidence" that the user is who they say they are, because of additional factors and cryptographic techniques.

AAL3 is the highest level and "provides very high confidence that the claimant controls authenticator(s) bound to the subscriber’s account. Authentication at AAL3 is based on proof of possession of a key through a cryptographic protocol. AAL3 authentication SHALL use a hardware-based authenticator and an authenticator that provides verifier impersonation resistance; the same device MAY fulfill both these requirements. In order to authenticate at AAL3, claimants SHALL prove possession and control of two distinct authentication factors through secure authentication protocol(s). Approved cryptographic techniques are required."

This level offers an even higher level of confidence and is quite specific about the kind of authentication factors that are allowed: you need a hardware authenticator and one which provides impersonation resistance. The latter can be done by binding the authentication session to a private key controlled by the user.

There are more specifics in that document. Lots and lots of specifics.

There are other frameworks that discuss authentication in depth, such as the [Trusted Digital Identity Framework](https://www.dta.gov.au/our-projects/digital-identity/trusted-digital-identity-framework) and the [UK digital identity & attributes trust framework](https://www.gov.uk/government/publications/uk-digital-identity-attributes-trust-framework-updated-version).

Ignoring the means of authentication is a great example of separating concerns. Doing so allows OAuth2 and OIDC to focus on the nitty gritty details about the interactions between the resource owner, authorization server, and resource server.

## Future Proofing OAuth

By leaving the authentication method specifics to the authorization server, the OAuth and OIDC specifications remain relevant even when new methods of authentication are invented. For example, neither WebAuthn or FaceID existed when RFC 6749 was published, and consumer facing fingerprint recognition was in its infancy. 

Because the precise method of authentication is explicitly out of scope, these methods can be used in the process of obtaining an access token, *if the authorization server requires it*.

The determination of the appropriate level of assurance for the login process is entirely up to the authorization server.

## Context Specific Authentication

In addition to future proofing benefits, with this architecture, an authorization server can introduce functionality strengthening authentication at the authorization server *without affecting any dependent applications*. When this happens, applications that rely on the authorization server have improved security at zero cost.

Examples of such functionality include:

* requiring additional factors during authentication
* requiring specific factors for certain categories of users, such as admin users
* adding a CAPTCHA to prevent bot activity or credential stuffing
* implementing server side checks for suspicious behavior, such as frequent password reset requests from the same IP address

All of this functionality is the responsibility of the authorization server. Each can be added without affecting any protected resources or applications which depend on the token, when it is finally issued.

As RFC 6749 says, using this indirection removes "the resource server's need to understand a wide range of authentication methods." This allows flexibility around the factors of authentication; they can be adjusted to match the risk of the authentication event.

The authorization server can also, as mentioned in the OAuth 2.1 draft, authenticate the user by delegating to an external identity store. This allows different user stores to be the system of record for a given user. Again, the downstream resource servers which depend on the authorization server need never know where the user was actually authenticated.

## It's Not Only Authentication

Funnily enough, authentication isn't the only major topic skirted by OAuth and OIDC. Another critical question that is not answered by these specifications is "How is the user account provisioned in the authorization server?"

While there are [specifications like SCIM](http://www.simplecloud.info/) that cover this, for OAuth and OIDC they are out of scope. The user account is assumed to be present at the authorization server, and there's no mention of how it happens.

## Summing Up

OAuth and OIDC allow users to securely delegate access to resources using tokens as credentials. They depend on the correct authentication of the user at the authorization server, yet they don't define in detail what such authentication entails.

By declaring the specifics of the authentication process out of scope, these specifications remain flexible and relevant even as requirements and expectations around secure authentication change over time.

