---
title: Is OAuth for Authentication or Authorization? | FusionAuth
description: Understand why OAuth is an authorization framework, not an authentication protocol. Learn the differences and how to use OAuth correctly in your application.
image: advice/no-auth-in-oauth/why-no-auth-in-oauth.png
author: Dan Moore
section: OAuth
date: 2022-10-19
dateModified: 2022-10-19
icon: /img/icons/no-auth-oauth.svg
darkIcon: /img/icons/no-auth-oauth-dark.svg
---

OAuth, a standard for securely delegating authorization information, and OIDC, a profile written on top of it to securely transmit user profile data, both rely on proper user authentication. (A user is also known as the 'resource owner'.) An architectural component known as the authorization server issues tokens, which provide access to data or functionality, only *after* the user has been authenticated to its satisfaction.

However, there is little guidance about how to actually authenticate the user. Should you use a username and password? A magic link? Delegate to a third party? Require a TOTP code? Some combination of these?

Why exactly is authentication undefined in OAuth/OIDC? Why is this critical process not precisely defined in these specifications?

While OAuth grants differ slightly (see [The Complete List](/articles/oauth/complete-list-oauth-grants) for all the variations), the grant flow is basically:

* The user (or, more precisely, some software acting on behalf of the user) tries to access a protected resource
* The protected resource redirects the user to the authorization server
* The authorization server authenticates the user
* The user is sent a token
* The token is presented to a protected resource
* The protected resource validates the token
* The user is granted access to a protected resource

This is a high level, truncated version, and there's a lot more, but let's keep it simple here. If you'd like even more details about the OAuth process, please check out [the Modern Guide to OAuth](/articles/oauth/modern-guide-to-oauth).

## Looking At the Standards

The Authorization Code grant is the main OAuth grant involving users, so let's start there.

### OAuth2 and OAuth2.1

If you look closely at the specifications, it's clear that authentication is critical to this grant. From [RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749), the OAuth2 standard, the authorization server is:

> The server issuing access tokens to the client after successfully authenticating the resource owner and obtaining authorization.

What else does it say about authentication of the end user? Well, in section 1.3.1, you see:

> Before directing the resource owner back to the client with the authorization code, the authorization server authenticates the resource owner and obtains authorization.  Because the resource owner only authenticates with the authorization server, the resource owner's credentials are never shared with the client.

It's clear that:

1. Authentication happens at the authorization server, and
2. The resource owner's credentials are never shared with other parts of the system, including the client which is requesting access to any protected resources.

However, the *means* of authentication is never defined in the specification.

How about the [OAuth 2.1 specification](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-06), currently under development? It's similar to the OAuth2 standard, but the 2.1 specification expanded section 1.3.1:

> Before directing the resource owner back to the client with the authorization code, the authorization server authenticates the resource owner, and may request the resource owner's consent or otherwise inform them of the client's request.  Because the resource owner only authenticates with the authorization server, the resource owner's credentials are never shared with the client, and the client does not need to have knowledge of any additional authentication steps such as multi-factor authentication or delegated accounts.

You start to learn something about the authentication process: the "additional steps" such as MFA are part of it. But there's no full definition of how the authorization server can or should verify who the user is.

Well, OAuth is about authorization, not authentication. Perhaps OIDC spells out how you should authenticate the user? Let's look at that next, since there is, after all, an [entire section titled "Authentication"](https://openid.net/specs/openid-connect-core-1_0.html#Authentication).

### OIDC

This section begins:

> OpenID Connect performs authentication to log in the End-User or to determine that the End-User is already logged in. OpenID Connect returns the result of the Authentication performed by the Server to the Client in a secure manner so that the Client can rely on it. For this reason, the Client is called Relying Party (RP) in this case.

and further on covers the authentication process briefly.

> If the request is valid, the Authorization Server attempts to Authenticate the End-User or determines whether the End-User is Authenticated, depending upon the request parameter values used. The methods used by the Authorization Server to Authenticate the End-User (e.g. username and password, session cookies, etc.) are beyond the scope of this specification. An Authentication user interface MAY be displayed by the Authorization Server, depending upon the request parameter values used and the authentication methods used.

So not only is authentication not defined, it is *explicitly* declared out of scope:

> The methods used by the Authorization Server to Authenticate the End-User ... are beyond the scope of this specification.

Okay. None of the specifications lay out what authentication looks like, though there are hints. Why is this?

## Separate Those Concerns

Separation of concerns is a common pattern in software systems. Developers break up systems into different components, with each component being responsible for a different piece of the system. Some parts are responsible for creating the user interface, others for data access.

In this case, the OAuth and OIDC specifications do not define authentication. Instead, they focus on the precursors to and artifacts of an authentication event.

Doing so means the authorization server can authenticate the user to whatever level of certainty it needs, based on what it knows.

There are standards around authentication certainty, such as [NIST 800-63-3](https://pages.nist.gov/800-63-3/sp800-63-3.html) which defines the three levels of "Authenticator Assurance".

These levels of certainty are creatively named:

* AAL1
* AAL2
* AAL3

If you examine that document, you'll see the first level, AAL1, "provides some assurance that the claimant controls an authenticator bound to the subscriber’s account. AAL1 requires either single-factor or multi-factor authentication using a wide range of available authentication technologies. Successful authentication requires that the claimant prove possession and control of the authenticator through a secure authentication protocol."

The next level, AAL2, is a step up and "provides high confidence that the claimant controls authenticator(s) bound to the subscriber’s account. Proof of possession and control of two distinct authentication factors is required through secure authentication protocol(s). Approved cryptographic techniques are required at AAL2 and above."

AAL3 is the highest level and "provides very high confidence that the claimant controls authenticator(s) bound to the subscriber’s account. Authentication at AAL3 is based on proof of possession of a key through a cryptographic protocol. AAL3 authentication SHALL use a hardware-based authenticator and an authenticator that provides verifier impersonation resistance; the same device MAY fulfill both these requirements. In order to authenticate at AAL3, claimants SHALL prove possession and control of two distinct authentication factors through secure authentication protocol(s). Approved cryptographic techniques are required."

There are more specifics in that document. Lots and lots of specifics.

There are other similar frameworks, such as the [Trusted Digital Identity Framework](https://www.dta.gov.au/our-projects/digital-identity/trusted-digital-identity-framework) and the [UK digital identity & attributes trust framework](https://www.gov.uk/government/publications/uk-digital-identity-attributes-trust-framework-updated-version).

Authentication is ignored in OAuth2 and OIDC because it is a separate concern. This allows OAuth2 and OIDC to focus on the nitty gritty details of getting the resource owner to the authorization server as well as generating access and identity tokens.

## Forward Compatibility

By leaving the details of authentication methods to the authorization server, the OAuth and OIDC specifications remain relevant even if new methods of authentication are invented. For example, neither WebAuthn or FaceID existed when RFC 6749 was published, but either can be part of an Authorization Code grant in 2022.

Because the precise method of authentication is out of scope, both WebAuthn and FaceID can both be used in the process of obtaining an access token, *if the authorization server requires it*. The determination of the appropriate level of assurance for the login process is entirely up to the authorization server.

## Transparently Improving Authentication

In addition to future proofing, an authorization server can strengthen authentication at the authorization server, and can do so *without affecting any dependent applications*. Examples of improvements include:

* requiring one or more additional factors of authentication
* requiring specific factors for certain users
* implementing server side checks for suspicious behavior, such as requesting 100 password reset emails from the same IP address
* adding a CAPTCHA to prevent bot activity or credential stuffing

All of these are the province of the authorization server and can be added without affecting any protected resources or applications which depend on the issued token.

As RFC 6749 says, using this indirection removes "the resource server's need to understand a wide range of authentication methods."

The authorization server can also, as mentioned in the OAuth 2.1 draft, authenticate the user by delegating to an external identity store (or more than one). This offers flexibility around the system of record for any given user.

## And Not Just Authentication

Funnily enough, authentication isn't the only major topic skirted by OAuth and OIDC. There are others.

Another question critical to identity not answered by these specifications is "How is the user provisioned in the authorization server?"

While there are [specifications like SCIM](/articles/identity-basics/what-is-scim) that cover this, for OAuth and OIDC they are out of scope.

## Conclusion

By depending on authentication of the end user, OAuth and OIDC allow users to securely delegate access to resources using tokens as credentials.

But by declaring the specifics of the authentication process out of scope, they remain flexible and relevant even as requirements and expectations around secure authentication change over time.

