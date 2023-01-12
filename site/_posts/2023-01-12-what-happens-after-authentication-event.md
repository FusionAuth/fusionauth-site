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

The end of the OAuth authorization code grant, after a user has logged in, is one or more tokens. This is an access token, and an optional refresh token and id token.

What should you do with these?

<!--more-->

DIAGRAM of Authorization Code Grant

The FusionAuth team has helped hundreds of customers integrate our auth server into their system. There are [many different ways you can choose to perform such an integration](/learn/expert-advice/authentication/login-authentication-workflows).

When you use the Authorization Code grant, you stand on the shoulders of giants. Many many people have spent lots of times refining this grant, poking and fixing holes in its security, documenting it, and building libraries on top of it.

The FusionAuth team firmly believes that using standards based OAuth and OIDC grants to integrate a third party auth server into your application architecture allows you to leverage these benefits and maintain flexibility to migrate if need be.

At some point, you need to decide where to store the token that is the end result of the Authorization Code grant. 

There are two main choices. Which is the right way depends on your needs.

## Store Tokens On The Client

The first option is to send the access token and refresh token down to the client. You should send these as http only secure cookies with a samesite value of lax or strict.

If you choose this path, you can have a complicated SPA make requests against your API, as long as the APIs live on a common domain (or parent domain). For example, if you set the cookie domain to .example.com from an auth server living at auth.example, apis living at api.example.com, todo.example.com, and contacts.example.com can all receive the token.

DIAGRAM

### Token Validation


Each API can then validate the token to ensure that it is valid. It should check:

* signature
* expiration time
* audience
* issuer
* any other specific claims

DIAGRAM

All of these should be validated before handing back any data or allowing any functionality.

The signature and standard claims checks can and should be done with a library, but determiningg the validity of other specific claims is business logic and should be handled by the API developer.

Validation approahc  assumes the token has internal structure and is signed; a JWT meets these criteria. 

Otherwise, you should introspect the token, which involves presenting it to the authorizatoin server.

INTROSPECTION DIAGRAM

### Using The Refresh Token

At some point the access token will expire, and the client should handle the expected access denied error. When you request a scope of `offline_access` for the initial auth server request, you will receive a refresh token.

After the access token expires, the client can present the refresh token to the auth server. That server can validate that the user's account is still active, there is still an extant session, or perform any other validation.

If the account is still good, the auth server can then issue a new access token, transparently extending the session.

### Benefits Of Client Stored Tokens

If you choose this path, you gain horizontal scalability. As long as your APIs are on the same base domain, they are transparently presented with any request your application makes. (If they are not, you probably want the second option.) This is a perfect fit for a JavaScript, single page application which is pulling data from multiple APIs provided by the same organization.

You also are safe from XSS attacks, a common mechanism for attackers to gain access to tokens which allow them to make requests as another user. HTTPOnly, secure cookies are not available to any javascript running on the page.

If the APIs are on different domains, it is recommended to use a proxy which can ingest the token, validate it, and then pass on requests to other domains.

DIAGRAM

### Alternatives To Client Stored Tokens

Why a cookie and not another storage mechanism like in-memory or localstorage? Why not bind the cookie to the browser using DPoP? These all have tradeoffs, and using cookies have been found to work for many of our customers.

Localstorage is a difficult option because, unless you have a fingerprint your token, as recommmended by OWASP, you'll be prone to XSS attacks, where other Javascript running on the page has access to the token. And if you do fingerprint your JWT, you'll be limited to sending the JWT to APIs running on the domain the cookie is sent to.

If you use in-memory storage, when the SPA is refreshed, the token goes poof. The user has to log in again. Not a great experience.

Client binding measures remove the danger of XSS because the token can't be used without a private key that only the proper client possesses. However, they require additional complexity on the client side and are relatively new; for example, as of this writing, DPoP is not yet an IETF standard. 

## Using Sessions

Another option is to store the access token and refresh token in the session. Then the application can use normal web session. In this scenario, storing the token doesn't buy you much. However, you can make any other 

DIAGRAM

It's possible you'd present the token to other APIs, but in general, if you have received a valid token from the OAuth token endpoint, you are assured the user has authenticated. If that's enough, or you can pull information about the user from other sources using secure, server-side methods, you can use this method.

However, even though you don't use the token, you still get benefits from using an auth server:

* Customer personally identifiable information is kept in one safe and secure location
* You have one view of your customer across all your apps
* Advanced authentication functionality such as MFA, enterprise single sign-on and login rate limiting can be implemented in one place for all applications
* You can upgrade such authentication functionality without modifying downstream applications
* You can offer single sign-on across custom, commercial and open source applications
* Common login related workflows such as changing profile data or passwords can be centralized and implemented once.

You get these benefits if you use client side storage as well.

## The Id Token

What about the id token? This is provided when you specify a scope of `profile`, or any of the other OIDC scopes.

This token can be safely sent to the browser and stored in localstorage or a cookie accessible to javascript.

The id Token should never contain any secrets nor be used to access protected data, but can be useful for displaying infomration about a user such as their name.

## Summing Up

These two patterns should handle the vast majority of systems integrating the OAuth and OIDC standards for authenticating and authorizing users.
