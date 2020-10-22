---
layout: advice
title: Differences between OAuth 2 and OAuth 2.1
description: The OAuth 2.1 draft will soon be published as an RFC. Why did they write it? How were the OAuth 2 specifications modified? What will you have to change?
image: advice/oauth-device-authorization-article.png
author: Dan Moore
category: OAuth
date: 2020-10-20
dateModified: 2020-10-20

---

OAuth 2.1 is consolidating best practices learned over the eight years since Oauth 2 was published. The original OAuth 2.0 specification was released in October 2012 as [RFC 6749](https://tools.ietf.org/html/rfc6749) and [RFC 6750](https://tools.ietf.org/html/rfc6750). It replaced OAuth 1.0, released in April 2010. There have been a number of extensions and modifications to OAuth 2 over the subsequent years. 

A new OAuth specification has been proposed and is currently under discussion. At this time, the specification was most recently updated on July 30, 2020. If approved, [OAuth 2.1](https://tools.ietf.org/html/draft-ietf-oauth-v2-1-00) will obsolete certain parts of Oauth 2.0 and mandate security best practices. The rest of the OAuth 2.0 specification will be retained. 

That bears repeating. Nothing new will be added. This is an explicit design goal of OAuth 2.1.

This article assumes you are a developer or have analogous technical experience and are familiar with OAuth and the terms used in the various corresponding standards. If you’d like an introduction to OAuth and why you’d consider using it, [Wikipedia is a good place to start](https://en.wikipedia.org/wiki/OAuth). This article covers proposed changes to OAuth that might affect you if you are either using OAuth in your application or if you build software which implements OAuth. 

## Why OAuth 2.1?

It's been a long time since OAuth 2.0 was released, so a consolidation point release will help make implementation simpler. As outlined in a [blog post](https://aaronparecki.com/2019/12/12/21/its-time-for-oauth-2-dot-1) by Aaron Parecki, one of the authors of the OAuth 2.1 draft specification: 

> My main goal with OAuth 2.1 is to capture the current best practices in OAuth 2.0 as well as its well-established extensions under a single name. That also means specifically that this effort will not define any new behavior itself, it is just to capture behavior defined in other specs. It also won’t include anything considered experimental or still in progress.

OAuth 2.1 is not a scrape and rebuild of OAuth 2.0. Instead, OAuth 2.1 captures and consolidates changes and tweaks made to OAuth 2.0 over the past eight years. There's a particular focus on better default security. It establishes best practices and will serve as a reference document going forward. 

Here's a suggested description pulled from the [ongoing mailing list discussion](https://mailarchive.ietf.org/arch/msg/oauth/Ne4Q9erPP7SpC5051sSy6XnLDv0/): 

> By design, [OAuth 2.1] does not introduce any new features to what already exists in the OAuth 2.0 specifications being replaced.

Many of the details are drawn from the [OAuth 2.0 Security Best Current Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-14) document. In the name of security best practices, some of the more problematic grants will be removed.

At the end of the day, the goal of OAuth 2.1 is to have a single document explaining how to best implement and use OAuth, as both a client and an authorization server. No longer will developers be required to hunt across multiple RFCs and standards documents to understand how a particular behavior should be implemented or used.

## How will OAuth 2.1 affect you?

If you use OAuth in your application, don’t panic. 

As mentioned above, the discussion process around this specification is ongoing. A draft was posted to the IETF mailing list in mid July and was adopted by the OAuth working group in July 2020. As of the time of writing, the draft is being reviewed and fine tuned. 

You may ask, when will it be available? The short answer is "no one knows". 

The long answer is "truly, no one knows. It does seem like we're getting along in the process, though." 

Even after OAuth 2.1 is released, it will likely be some time before it is widely implemented. Omitted grants may be supported with, with nags or warnings, forever. The exact changes to the specification are still being discussed and the publishing of an RFC is further in the future. Finally, when OAuth 2.1 is released, you can continue to use an OAuth 2.0 server if that meets your needs. 

That said, when OAuth 2.1 is released the largest impact on anyone using OAuth for authentication or authorization in their applications will be adapting to the removal of two OAuth 2.0 specified grants: the Implicit grant and the Resource Owner Password Credentials grant. 

## What is changing from OAuth 2.0 to OAuth 2.1?

The draft RFC has a [section](https://tools.ietf.org/id/draft-ietf-oauth-v2-1-00.html#name-differences-from-oauth-20) outlining the major changes between OAuth 2.0 and OAuth 2.1. There may be changes not captured in that section but the authors' goals are to document all formal changes there. There are six such changes: 

> The authorization code grant is extended with the functionality from PKCE ([RFC7636](https://tools.ietf.org/html/rfc7636)) such that the default method of using the authorization code grant according to this specification requires the addition of the PKCE parameters

> Redirect URIs must be compared using exact string matching as per Section 4.1.3 of [OAuth 2.0 Security Best Current Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-15)

> The Implicit grant `("response_type=token")` is omitted from this specification as per Section 2.1.2 of [OAuth 2.0 Security Best Current Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-15)

> The Resource Owner Password Credentials grant is omitted from this specification as per Section 2.4 of [OAuth 2.0 Security Best Current Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-15)

> Bearer token usage omits the use of bearer tokens in the query string of URIs as per Section 4.3.2 of [OAuth 2.0 Security Best Current Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-15)

> Refresh tokens must either be sender-constrained or one-time use as per Section 4.12.2 of [OAuth 2.0 Security Best Current Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-15)

Whew, that's a lot. Let's examine each of these in turn. But before we do, let's define a few terms used in the rest of this article.

* A `client` is a piece of code that the user is interacting with; browsers, native apps or single-page applications are all clients. 
* An `OAuth server` implements OAuth specifications. It has or can obtain information about which resources are available to clients. In the RFCs this application is called an Authorization Server. This is also known as an Identity Provider. Most users call it "the place I sign in". 
* An `application server` doesn’t have any authentication functionality but instead delegates login requests to an OAuth server. It has an id which allows the OAuth server to identify it. 

### OAuth 2.1 change: The Authorization Code grant requires PKCE

> The authorization code grant is extended with the functionality from PKCE ([RFC7636](https://tools.ietf.org/html/rfc7636)) such that the default method of using the authorization code grant according to this specification requires the addition of the PKCE parameters

Wow, that's a lot. Let’s break that down. The Authorization Code grant is one of the most commonly used OAuth grants and is the most secure. If you're into flow charts, here's [a post explaining the Authorization Code grant](https://fusionauth.io/learn/expert-advice/authentication/webapp/oauth-authorization-code-grant-sessions) using a chart and walking through the grant step by step.

The [Proof Key for Code Exchange (PKCE) RFC](https://tools.ietf.org/html/rfc7636) was published in 2015 and extends the Authorization Code grant to protect from an attack if part of the authorization flow happens over a non TLS connection. For example, this occurs if there's communication between components of a native application. 

This attack could also happen if TLS has a vulnerability or if a user's router firmware has been compromised and is spoofing DNS or downgrading TLS to HTTP. PKCE requires an additional one-time code to be generated and sent to the OAuth server. This code validates the request has not been intercepted or modified. 

The OAuth 2.1 draft specification requires the PKCE challenge be used with every Authorization Code grant, protecting against the authorization code being hijacked by an attacker and being used to gain a token.

### OAuth 2.1 change: Redirect URIs must be compared using exact string matching

> Redirect URIs must be compared using exact string matching as per Section 4.1.3 of [OAuth 2.0 Security Best Current Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-14)

Some OAuth grants, notably the Authorization Code grant, are configured with one or more redirect URIs. One of these is then requested by the client when the grant starts. After the grant succeeds, the OAuth server sends the client to the requested redirect URI. 

Now, it would be convenient to support wildcards in this redirect URI list. At FusionAuth, we hear this request from folks who want to simplify their development or CI environments. Every time a new server is spun up, the redirect URI configuration needs to be updated to include the new URI. 

For example, if a CI system builds an application for every feature branch, it might have the hostname `dans-sample-application-1551.herokuapp.com`, assuming the feature branch contains a fix for issue #1551. If I wanted to login using the Authorization Code grant, I’d have to update the redirect URI settings for my OAuth server to include that redirect URI: `https://dans-sample-application-1551.herokuapp.com/oauth-callback`. 

When the next feature branch build happens, say for bug #1552, I’d have to add `https://dans-sample-application-1552.herokuapp.com/oauth-callback` and so on. Obviously, it’d be easier to set the redirect URI to a wildcard value such as `https://dans-sample-application-*.herokuapp.com/oauth-callback`. If this was the case, any URL matching that pattern would be acceptable to the OAuth server. 

An additional use case for a wild card redirect URI occurs when the final destination page needs dynamic parameters, like `trackingparam=123&specialoffer=abc`. These are usually appended to the redirect URI before the OAuth process begins. However, without wild cards, a URL with dynamic parameters won't match any of the configured redirect URIs, so the redirect fails.

However, allowing wildcard matching for the redirect URI is a security risk. If the redirect URI matching is flexible, an attacker could send a user to an open redirect server controlled by them, and then on to a malicious destination. OWASP also discusses the [perils of such open redirect servers](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html#dangerous-url-redirects). While this attack requires compromising the request in some fashion, using exact matching for redirect URIs eliminates this risk because the redirect URI is always a known value.

### OAuth 2.1 change: The Implicit grant is removed

> The Implicit grant ("response_type=token") is omitted from this specification as per Section 2.1.2 of [OAuth 2.0 Security Best Current Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-14)

The Implicit grant is inherently insecure when used in a single-page application (SPA). If you use this grant, your access token is exposed to any JavaScript running in the browser alongside your SPA. If you aren't careful, you'll get an access token that is in the URL fragment, stored in localstorage, or put in a non HttpOnly cookie. In all cases, an attacker gaining an access token is allowed to access resources as if they were the original user. This is not a good situation.

Access tokens are not necessarily one-time use, and can live from minutes to days depending on how the OAuth server is configured. If they are stolen, the resources they protect are no longer secure. You may think "well, I don’t have any malicious JavaScript on my site." Are you sure? Have you audited all your code, and its dependencies, and their dependencies, and their dependencies? Do you audit your code automatically? Extensive dependency trees can lead to unforeseen security issues: someone took over an [open source node library](https://snyk.io/blog/malicious-code-found-in-npm-package-event-stream/) and added malicious code that was downloaded millions of times. 

Here's an [article about the least insecure way to use the Implicit grant for an SPA](https://fusionauth.io/learn/expert-advice/authentication/spa/oauth-implicit-grant-jwts-cookies). In this situation, the access token is provided to the SPA as an HttpOnly cookie. In the end it basically recreates the Authorization Code grant, illustrating how the Implicit grant simply can't be made secure.

The OAuth 2.1 draft specification omits the Implicit grant. This means that any software implementing OAuth 2.1 won't have to implement this grant. If you use this grant in your application, you’ll have to replace it with a different one if you want to be compliant with OAuth 2.1. 

### OAuth 2.1 change: The Resource Owner Password Credentials grant is removed

> The Resource Owner Password Credentials grant is omitted from this specification as per Section 2.4 of [OAuth 2.0 Security Best Current Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-14)

This grant was added to the OAuth 2.0 specification with an eye toward making migration to OAuth compliant servers easier. In this grant, the application server receives the username and password (or other credentials) and passes it on to the OAuth server. Here's [an article breaking down each step of the Resource Owner Password Credentials grant](https://fusionauth.io/learn/expert-advice/authentication/webapp/oauth-resource-owner-password-credentials-grant-jwts-refresh-tokens-cookies). 

This grant is often used for native mobile applications. While this grant made it easier to migrate to OAuth with minimal application changes, it doesn't follow the typical delegation pattern. After all, the application server has full access to the credentials of the user, exactly what OAuth is designed to avoid. No longer can you leave the work of securing users' credentials and data to the OAuth server. With this grant, you must ensure that your application backend is just as secure.

If you have a mobile application using this grant, you can either update the client to use an Authorization Code grant using PKCE or keep using your OAuth 2.0 compliant system.

### OAuth 2.1 change: No bearer tokens in the query string

> Bearer token usage omits the use of bearer tokens in the query string of URIs as per Section 4.3.2 of [OAuth 2.0 Security Best Current Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-14)

Bearer tokens, also known as access tokens, allow access to protected resources and therefore must be secured. They are called bearer tokens because merely possessing them gives you access. They're like a set of house keys. 

These days, most tokens are JWTs. Clients store them securely and then use them to make API calls to the application server. The application server then uses the token to ensure the client calling the API has appropriate permissions. When first defined in [RFC 6750](https://tools.ietf.org/html/rfc6750), tokens were allowed in headers, POST bodies or query strings. The OAuth 2.1 draft prohibits sending a bearer token in a query string. 

A query string and, more generally, any string in a URL, is never private. JavaScript executing on a page can access it. A URL or components thereof may be recorded in server log files, caches, or browser history. In general, if you want to pass information privately over the internet, don't use anything in a URL. Instead, use TLS and put the sensitive information in a POST body or HTTP header.

### OAuth 2.1 change: Limiting refresh tokens 

> Refresh tokens must either be sender-constrained or one-time use as per Section 4.12.2 of [OAuth 2.0 Security Best Current Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-14)

[Refresh tokens](https://tools.ietf.org/html/rfc6749#section-6) allow a client to retrieve new access tokens without reauthentication by the resource owner. If you need access to a resource for longer than an access token lives, or if you need infrequent access, refresh tokens can help. One example of where a refresh token might be used is when a user is logged into their email for weeks or months. Every time an access token expires, the client can present a refresh token and get a new access token.

Refresh tokens are longer lived than access tokens and have a higher level of privilege, since they can be used to create entirely new access tokens. Therefore you should take more care when securing a refresh token. Never share your refresh tokens between different devices.

If they are acquired by an attacker, they can create access tokens at will. Obviously at that point, the resource which the access tokens protect will no longer be secured. As an example of how to secure refresh tokens, here’s a [post using the Authorization Code grant](https://fusionauth.io/learn/expert-advice/authentication/spa/oauth-authorization-code-grant-jwts-refresh-tokens-cookies) which stores refresh tokens using HttpOnly cookies with a constrained cookie domain, and you can learn more about [FusionAuth's access and refresh tokens here](/docs/v1/tech/oauth/tokens/).

The OAuth 2.1 draft provides two options for refresh tokens: they can be one-time use or tied to the sender with a cryptographic binding. 

With one time use refresh tokens, after a refresh token (call it refresh token A) is used to retrieve a new access token, it becomes invalid. The OAuth server may send a new refresh token (call it refresh token B) along with the requested access token. Once the newly delivered access token expires, the client can request another access token using refresh token B, and receive the new access token and refresh token C, and so on and so on. The change to one-time use refresh tokens may require changing client code to store the new refresh token on every refresh of the access token.

The other option is to ensure the OAuth server cryptographically binds the refresh token to the client. The options mentioned in the "OAuth 2.0 Security Best Current Practices" document include [OAuth token binding](https://www.ietf.org/archive/id/draft-ietf-oauth-token-binding-08.txt), Mutual TLS authentication [RFC 8705](https://tools.ietf.org/html/rfc8705) and [DPoP](https://tools.ietf.org/html/draft-ietf-oauth-dpop-01), among others. All of these binding methods ensure the request came from the client to which the refresh token was issued. 

To sum up, the OAuth 2.1 draft requires an OAuth server protect refresh tokens by requiring them to either be one-time use or by using cryptographic proof of client association. Both options protect these powerful tokens from being used by an attacker.

## What’s unchanged?

These are the major changes in the proposed OAuth 2.1 draft. The OAuth 2.1 spec is built on the foundation of the OAuth 2.0 RFCs and inherits all behavior not explicitly omitted or changed. For example, the Client Credentials grant, often used for server to server communication, will still be available.

## Can you use OAuth 2.1 right now?

As of now, there’s nothing stamped "OAuth 2.1". And the draft spec isn’t finalized. But if you follow best practices around security, you can reap the benefits of this consolidated draft, as well as prepare your applications for its release. 

When writing a client application, avoid the Implicit grant and the Resource Owner Password Credentials grant. 

Make sure your OAuth server is doing to following:
* Using PKCE whenever you use the Authorization Code grant.
* Make sure that your redirect URIs are compared using exact string matches, not wildcard or substring matching. 
* Make sure bearer tokens are never present in the query string. 
* Limit your refresh tokens, either by making them one time use or having them be sender constrained.

## Future directions

> It's tough to make predictions, especially about the future." - Yogi Berra

OAuth 2.1 is still under discussion on the OAuth mailing list. If you are interested in following or influencing this RFC, review the [discussion archives](https://mailarchive.ietf.org/arch/browse/oauth/) and/or [join the mailing list](https://www.ietf.org/mailman/listinfo/oauth).

Looking beyond OAuth 2.1, which aims to consolidate security best practices but leave most of the rest of OAuth 2.0 untouched, there’s also a "next gen" OAuth working group, [reimagining a Grant Negotiation and Authorization Protocol from the ground up](https://datatracker.ietf.org/wg/gnap/about/). The GNAP specification is further from release than the OAuth 2.1 specification.
