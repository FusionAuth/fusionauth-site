---
layout: blog-post
title: What happens after an OAuth authentication event
description: We all have them. Line of business applications that have their own user datastore. How can you update them to use a centralized user datastore?
author: Dan Moore
image: blogs/upgrade-php-application/securing-your-legacy-php-business-application-with-oauth.png
category: tutorial
tags: oauth authentication jwt cookie explainer
excerpt_separator: "<!--more-->"
---

At the end of the OAuth Authorization Code grant, after a user has logged in, one or more tokens are presented. This happens when you make a request to the tokeen endpoint. 

These tokens include an access token, an optional refresh token, and an optional id token. The access token is used to get access to different APIs and protected resources. The refresh token lets you mint new access tokens, and the id token is used by the client to display information about the user.

<!--more-->

What should you do with all of these tokens? How can they be used by your application to ensure that only the correct users get access to data and functionality?

DIAGRAM of Authorization Code Grant

The FusionAuth team has helped hundreds of customers integrate our auth server into their applications. There are [many different ways you can choose to perform an integration](/learn/expert-advice/authentication/login-authentication-workflows), but the team has learned that certain options are best.

## Why Use The OAuth Authorization Code Grant

But first, why use the Authorization Code grant at all? There are, after all, simpler ways to offload authentication. If you want to use FusionAuth, you can use the [Login API](/docs/v1/tech/apis/login).

When you use the Authorization Code grant, you stand on the shoulders of giants. Many many people have spent lots of times refining this grant, poking and fixing holes in its security, documenting it, and building libraries on top of it.

The FusionAuth team firmly believes that using standards based OAuth and OIDC grants to integrate a third party auth server into your application architecture allows you to leverage these benefits and maintain flexibility to migrate if need be.

So, if you are convinced that the Authorization Code grant makes sense, you need to store the tokens that result from the Authorization Code grant. 

There are two main options. Which is the right way depends on your needs.

## Store Tokens On The Client

The first option is to send the access token and refresh token down to the client. 

Send these as `HTTPOnly`, secure cookies with a `SameSite` value of `Lax` or `Strict`.

If you choose this option, the browser, whether a simple HTML page with some JavaScreipt or a complicated SPA, makes requests against APIs, and the token is along for the ride.

As long as the APIs live on a common domain (or parent domain), the cookie will be sent. For example, the auth server can live at at `auth.example.com` and if you set the cookie domain to `.example.com`, apis living at `api.example.com`, `todo.example.com`, and `contacts.example.com` will all receive the token.

DIAGRAM

### Token Validation

Each API validates the token. They should check:

* the signature
* expiration time (the `exp` claim)
* not valid before time (the `nbf` claim)
* audience (the `aud` claim)
* issuer (the `iss` claim)
* any other specific claims

DIAGRAM

All of these should be validated before handing back any data or allowing any functionality. In fact, they should be validated before any additional processing is done, because if any of these checks fail, the requester is unknown.

The signature and standard claims checks can and should be done with a library. Checking other claims is business logic and should be handled by the API developer.

This validation approach assumes the token has internal structure and is signed; a JWT meets these criteria and is used by FusionAuth and other auth servers.

If you don't have a token that meets these criteria, introspect the token by presenting it to the auth server.

INTROSPECTION DIAGRAM

After a successful introspection, the returned JSON will assure the API server that the user is who they say they are.

### Using The Refresh Token

When using this approach, at some point the access token will expire, and the client should handle the expected access denied error. When you request a scope of `offline_access` for the initial auth server request, you will receive a refresh token.

After the access token expires, the client can present the refresh token to the auth server. That server can validate that the user's account is still active, there is still an extant session, or perform any other required checks.

If the account is still good and the user is still logged in, the auth server can issue a new access token, transparently extending your application's session.

### Benefits Of Client Stored Tokens

If you choose this path, you gain horizontal scalability. As long as your APIs are on the same base domain, they are presented with any request your application makes. 

As mentioned above, this approach is a perfect fit for a JavaScript, single page application pulling data from multiple APIs hosted by the same organization.

Using cookies means you are safe from XSS attacks, a common mechanism for attackers to gain access to tokens and to make requests masquarading as another user. `HTTPOnly`, secure cookies are not available to any JavaScript running on the page, so can't be accessed by malicious scripts.

If the APIs are on different domains, either use a proxy which can ingest the token, validate it and pass on requests to other domains, or use the session based approach, detailed below.

PROXY DIAGRAM

### Alternatives To Client Stored Tokens

Why a cookie and not another storage mechanism like such as memory or localstorage? Why not bind the cookie to the browser? All options have tradeoffs, and using cookies works for most of our customers.

Localstorage is a difficult option because, unless you have a fingerprint your token, as [recommmended by OWASP](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html#token-sidejacking), you'll be prone to those XSS attacks, since all JavaScript running on the page has access to the token. If you do fingerprint your token, you'll be limited to sending it to APIs running on the domain the cookie is sent to, anyway.

If you use an in-memory storage solution, when the browser is refreshed, the token goes poof. The user has to log in again, which is not a great experience.

Client binding measures remove the danger of XSS because the token can't be used without a private key that only the proper client possesses. However, these approaches require additional setup on the client side and are relatively new; for example, as of this writing, DPoP is not yet an IETF standard. 

## Using Sessions

If client side storage doesn't work, another option is to store the access token and refresh token in the server side session. The application can use normal web sessions. In this scenario, storing the token doesn't buy you much. 

DIAGRAM

It's possible you'd present the token to other APIs, but in general, if you have received a valid token from the OAuth token endpoint, the user has authenticated. If that's enough, or you can pull information about the user from other sources using secure, server-side methods, you can use this approach.

Even though you don't use the token, you still get benefits from using an auth server:

* Customer personally identifiable information is kept in one safe and secure location.
* You have one view of your customer across all your apps.
* Advanced authentication functionality such as MFA, enterprise single sign-on and login rate limiting can be implemented in one place for all applications.
* You can upgrade such authentication functionality without modifying downstream applications.
* You can offer single sign-on across custom, commercial and open source applications.
* Common login related workflows such as changing profile data or passwords can be centralized and therefore implemented one time.

Please note you get these benefits if you use client side storage as well.

## The Id Token

What about the id token? This is provided when you specify a scope of `profile`, or any of the other OIDC scopes on the initial authentication request.

This token can be safely sent to the browser and stored in localstorage or a cookie accessible to JavaScript.

The id token should never contain any secrets nor be used to access protected data, but can be useful for displaying infomration about a user such as their name.

## Summing Up

Client side storage of the tokens or server-side session storage handle the vast majority of systems integrating with the OAuth and OIDC standards for authenticating and authorizing users.

The FusionAuth team recommends using one of these two options after you retrieve the token at the end of the Authorization Code grant.
