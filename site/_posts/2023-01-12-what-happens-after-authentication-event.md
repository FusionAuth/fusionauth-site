---
layout: blog-post
title: What happens to the tokens after an OAuth Authorization Code grant?
description: What should you do with tokens returned after an OAuth grant? How can they be used by your application to ensure that only the correct users get access to data and functionality?
author: Dan Moore
image: TBD
category: article
tags: oauth authentication jwt cookie explainer mobile
excerpt_separator: "<!--more-->"
---

At the end of the OAuth Authorization Code grant, after a user presents their credentials at login, a code is returned which can be exchanged for one or more tokens at the token endpoint.

These tokens include an access token, an optional refresh token, and an optional id token. The access token is used to get access to different APIs and protected resources. The refresh token lets you mint new access tokens, and the id token is used by the client to display information about the user.

<!--more-->

What should you do with all of these tokens? How can they be used by your application to ensure that only the correct users get access to data and functionality?

{% plantuml source: _diagrams/blogs/after-authorization-code-grant/oauth-up-to-token.plantuml, alt: "The Authorization Code grant up to the point where tokens are requested from the token endpoint." %}

The FusionAuth team has helped hundreds of customers integrate our auth server into their applications. There are [many different ways you can choose to perform an integration](/learn/expert-advice/authentication/login-authentication-workflows), but the team recommends certain options that offer the best tradeoffs between functionality and security.

## Why Use The OAuth Authorization Code Grant

But first, why use the Authorization Code grant at all? There are, after all, simpler ways to offload authentication. For example, with FusionAuth, you can use the [Login API](/docs/v1/tech/apis/login) and pass the username and password directly from your application to FusionAuth, getting a token in return. Why bother with the OAuth dance of redirects.

When you use the Authorization Code grant, you stand on the shoulders of giants. Many many people have spent lots of time refining this grant, poking and fixing holes in its security, documenting it, and building libraries on top of it.

The FusionAuth team firmly believes that using standards based OAuth and OIDC grants to integrate a third party auth server into your application architecture allows you to leverage these benefits and maintain flexibility to migrate.

You also get the following benefits:

* Customer personally identifiable information is kept in one safe and secure location.
* You have one view of your customer across all your apps.
* Advanced authentication functionality such as MFA, enterprise single sign-on and login rate limiting can be implemented in one place for all applications.
* You can upgrade such authentication functionality without modifying downstream applications.
* You can offer single sign-on across all your custom, commercial and open source applications.
* Common login related workflows such as changing profile data or passwords can be centralized and managed by the auth server.

Once you've decided to use the Authorization Code grant, you need to store the tokens that result from it. There are two main options. 

## Store Tokens On The Client

The first option is to send the access token and refresh token down to the client. 

When using a browser, send these as `HTTPOnly`, secure cookies with a `SameSite` value of `Lax` or `Strict`.

If you choose this option, the browser, whether a simple HTML page with some JavaScript or a complicated single page application (SPA), makes requests against APIs, and the token is along for the ride.

As long as the APIs live on a common domain (or parent domain), the cookie will be sent. For example, the auth server can live at at `auth.example.com` and if you set the cookie domain to `.example.com`, APIs living at `api.example.com` and `todo.example.com`, or any other host under `.example.com`, will receive the token.

{% plantuml source: _diagrams/blogs/after-authorization-code-grant/client-side-storage.plantuml, alt: "Storing the tokens as secure, HTTPOnly cookies." %}

When using a native app, store these tokens in a secure location, such as the [iOS Keychain](https://developer.apple.com/documentation/security/keychain_services) or [Android internal data](https://developer.android.com/topic/security/best-practices#safe-data).

### Token Validation

Each API validates the token. They should check:

* the signature
* expiration time (the `exp` claim)
* not valid before time (the `nbf` claim)
* audience (the `aud` claim)
* issuer (the `iss` claim)
* any other specific claims

All of these should be validated before handing back any data or allowing any functionality. In fact, they should be validated before any additional processing is done, because if any of these checks fail, the requester is unknown.

The signature and standard claims checks can and should be done with a language specific open source library, such as [fusionauth-jwt (Java)](https://github.com/fusionauth/fusionauth-jwt), [node-jsonwebtoken (JavaScript)](https://github.com/auth0/node-jsonwebtoken), or [golang-jwt (golang)](https://github.com/golang-jwt/jwt). Checking other claims is business logic and should be handled by the API developer.

This validation approach assumes the token is signed and has internal structure. A JSON Web Token (JWT) meets these criteria, but there are others as well. JWTs are used by FusionAuth and other auth servers as the access token format, though this is not guaranteed by the [OAuth specification](https://www.rfc-editor.org/rfc/rfc6749#section-1.4).

If you don't have a token that has that internal structure, another option is to introspect the token by presenting it to the auth server.

{% plantuml source: _diagrams/blogs/after-authorization-code-grant/client-side-storage-introspection.plantuml, alt: "Storing the tokens as secure, HTTPOnly cookies and using introspection to validate them." %}

After a successful introspection, the returned JSON will assure the API server that the user is who they say they are.

### Using The Refresh Token

When using this approach, at some point the access token will expire, and the client should handle the expected access denied error. When you request a scope of `offline_access` for the initial auth server request, you will receive a refresh token.

{% plantuml source: _diagrams/blogs/after-authorization-code-grant/client-side-storage-refresh-token.plantuml, alt: "Using a refresh token." %}

After the access token expires, the client can present the refresh token to the auth server. That server can validate that the user's account is still active, there is still an extant session, or perform any other required checks.

If the account is still good and the user is still logged in, the auth server can issue a new access token, transparently extending your application's session.

### Benefits Of Client Stored Tokens

If you choose this path, you gain horizontal scalability. As long as your APIs are on the same base domain, they are presented with any request your application makes. 

As mentioned above, this approach is a perfect fit for a JavaScript, single page application pulling data from multiple APIs hosted by the same organization.

Using cookies means you are safe from XSS attacks, a common mechanism for attackers to gain access to tokens and to make requests masquerading as another user. `HTTPOnly`, secure cookies are not available to any JavaScript running on the page, so can't be accessed by malicious scripts.

If the APIs are on different domains, either use a proxy which can ingest the token, validate it and pass on requests to other domains, or use the session based approach, discussed later. Below is a diagram of using the proxy approach, where an API from `todos.com` is called through a proxy living at `proxy.example.com`.

{% plantuml source: _diagrams/blogs/after-authorization-code-grant/client-side-storage-with-proxy.plantuml, alt: "Using a proxy to access APIs on different domains." %}

### Alternatives To Client Stored Tokens In the Browser

Why use a browser cookie and not another storage mechanism such as memory or localstorage? Why not bind the cookie to the browser? All options have tradeoffs, and using cookies works for most of our customers.

Localstorage is a difficult option because, unless you also set a fingerprint cookie, as [recommmended by OWASP](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html#token-sidejacking), you are exposed to XSS attacks. Remember, all JavaScript running on the page has access to localstorage. If you do add a fingerprint to your token and send a cookie down with the same value, you'll be limited to sending requests to APIs running on the domain the cookie is locked to.

If you use an in-memory storage solution, when the browser is refreshed, the token goes poof. The user has to log in again, which is not a great experience.

Client binding measures, such as [Distributed Proof of Possession (DPoP)](https://www.ietf.org/archive/id/draft-ietf-oauth-dpop-12.html), remove the danger of XSS because the token can't be used without a private key only the proper client possesses. However, these approaches require additional setup on the client side and are relatively new. For example, as of this writing, DPoP is not yet an IETF standard. 

## Using Sessions

If client-side storage doesn't meet your needs, another option is to store the access token and refresh token in the server side session. The application can then use normal web sessions.

{% plantuml source: _diagrams/blogs/after-authorization-code-grant/session-storage.plantuml, alt: "Storing the tokens server-side in a session." %}

If you have received a valid token from the OAuth token endpoint, the user has authenticated. Use this approach if that's enough, or you need to retrieve data from other sources using secure, server-side methods. Below is an example of how you can proxy API requests through 

{% plantuml source: _diagrams/blogs/after-authorization-code-grant/session-storage-api-calls.plantuml, alt: "Proxying API calls using tokens stored in a server-side session." %}

Even if you don't use the token, you still get the benefits mentioned above that spring from the OAuth Authorization Code grant.

## The Id Token

What about the id token? This is provided when you specify a scope of `profile`, or any of the other OIDC scopes on the initial authentication request.

This token can be safely sent to the browser and stored in localstorage or a cookie accessible to JavaScript.

The id token should never contain any secrets nor be used to access protected data, but can be useful for displaying information about a user such as their name.

## Summing Up

Client-side storage of the tokens or server-side session storage handle the vast majority of systems integrating with the OAuth and OIDC standards for authenticating and authorizing users.

Client-side storage is a great choice when you have disparate APIs and want to support highly distributed clients such as mobile devices or browsers. Server-side session storage is simpler and easier to integrate into monolithic applications.

The FusionAuth team recommends using one of these two options after you obtain the token at the end of the Authorization Code grant.
