---
layout: blog-post
title: What's new in OAuth 2.1?
description: A draft of the OAuth 2.1 specification was recently released. What's coming down the pike?
author: Dan Moore
image: blogs/fusionauth-example-angular/oauth-angular-fusionauth.png
category: blog
excerpt_separator: "<!--more-->"
---

OAuth is getting spiffed up a bit. The original OAuth 2.0 specification was released in October 2012 as [RFC 6749](https://tools.ietf.org/html/rfc6749). It replaced OAuth 1.0, released in April 2010. There have been some additions over the years. A new OAuth specification has been proposed and is currently under discussion. It was most recently updated on March 8, 2020. If approved, [OAuth 2.1](https://tools.ietf.org/html/draft-parecki-oauth-v2-1-01) will obsolete certain parts of Oauth 2.0 and mandate additional security best practices. The rest of the OAuth 2.0 specification will be retained. 

<!--more-->

This post assumes you are a developer or have other technical experience. It also assumes you are somewhat familiar with OAuth and the terms used. If you’d like an introduction to OAuth and why you’d consider using it, [Wikipedia is a good place to start](https://en.wikipedia.org/wiki/OAuth). This post discusses proposed changes to OAuth that might affect you if you are using OAuth in your application or if you implement the OAuth specification. 

## Why OAuth 2.1?

It's been a long time sincce OAuth 2.0 was released. A consolidation point release was in order. As outlined in a [blog post](https://aaronparecki.com/2019/12/12/21/its-time-for-oauth-2-dot-1) by Aaron Parecki, one of the authors of the OAuth 2.1 draft specification: 

> My main goal with OAuth 2.1 is to capture the current best practices in OAuth 2.0 as well as its well-established extensions under a single name. That also means specifically that this effort will not define any new behavior itself, it is just to capture behavior defined in other specs. It also won’t include anything considered experimental or still in progress.

So, this is not a teardown and scrape of OAuth 2.0. Instead, OAuth 2.1 consolidates the changes and tweaks to OAuth 2.0 that have been made over the past eight years, with a focus on increasing the security of OAuth servers. It establishes the best practices and can serve as a reference document. From the [ongoing mailing list discussion](https://mailarchive.ietf.org/arch/msg/oauth/Ne4Q9erPP7SpC5051sSy6XnLDv0/): "By design, [OAuth 2.1] does not introduce any new features to what already exists in the OAuth 2.0 specifications being replaced." Many of the new draft specification details are drawn from the [OAuth 2.0 Security Best Current Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-14) document.

However, in the name of security best practices, some of the more problematic grants will be removed.

At the end of the day, the goal is to have a single document detailing how to best implement and use OAuth, as both a client and a server. No longer will implementers have to hunt across multiple RFCs and documents to understand how a specified behavior is implemented or should be used.


## I use OAuth in my application, what does OAuth 2.1 mean to me?

Don’t panic. 

As mentioned above, the discussion process around this specification is ongoing. A draft RFC was posted to the IETF mailing list in mid March. As of the time of writing, the revision and discussion is still actively occurring. 

So, the short answer is "no one knows". 

The long answer is "truly, no one knows. It does seem like we’re early in the process, though." 

Even after OAuth 2.1 is released, it will likely be some time before it is widely implemented. Omitted grants may be supported with warnings forever. The exact changes to the specification are still up in the air, the release of the RFC is even further in the future and when it is released, you can still continue to use an OAuth 2.0 server if that serves your needs. 

That said, the biggest impact on people who use OAuth servers is likely to be updating clients if they use one of the removed grants: the Implicit grant or Resource Owner Password Credentials grant. 

## What is changing?

The draft RFC has added a section which outlines the major changes between OAuth 2.0 and OAuth 2.1. There may be other changes not captured there, however. There are six main changes: 

> The authorization code grant is extended with the functionality from PKCE ([RFC7636](https://tools.ietf.org/html/rfc7636)) such that the only method of using the authorization code grant according to this specification requires the addition of the PKCE mechanism

> Redirect URIs must be compared using exact string matching as per Section 4.1.3 of [OAuth 2.0 Security Best Current Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-14)

> The Implicit grant ("response_type=token") is omitted from this specification as per Section 2.1.2 of [OAuth 2.0 Security Best Current Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-14)

> The Resource Owner Password Credentials grant is omitted from this specification as per Section 2.4 of [OAuth 2.0 Security Best Current Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-14)

> Bearer token usage omits the use of bearer tokens in the query string of URIs as per Section 4.3.2 of [OAuth 2.0 Security Best Current Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-14)

> Refresh tokens must either be sender-constrained or one-time use as per Section 4.12.2 of [OAuth 2.0 Security Best Current Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-14)

Whew, that's a lot of jargon. We'll examine each of these in turn. But before we do, let’s define a few terms that will be used further on.

* A client is a piece of code that the user is interacting with; browsers, native apps or single page applications are all clients. 
* An OAuth server implements OAuth specifications and has or can obtain information about which resources are available to clients--in the RFCs this is called an Authorization Server, but this is also called an Identity Provider. Most users call it "the place I login". 
* A store is a server which doesn’t have any authentication functionality, but knows how to delegate to an OAuth server. It has a client id which allows the OAuth server to identify it. This is usually an application server of some kind.

### Authorization code grant and PKCE

> The authorization code grant is extended with the functionality from PKCE ([RFC7636](https://tools.ietf.org/html/rfc7636)) such that the only method of using the authorization code grant according to this specification requires the addition of the PKCE mechanism

Wow, that's a mouthful. Let’s break that down. The Authorization Code grant is one of common OAuth grants and is the most secure. If flow charts are your jam, here’s [a post explaining the Authorization Code grant](https://fusionauth.io/learn/expert-advice/authentication/webapp/oauth-authorization-code-grant-sessions).

The [Proof Key for Code Exchange (PKCE) RFC](https://tools.ietf.org/html/rfc7636) was published in 2015 and extends the authorization code grant flow to protect from an attack if part of the authorization flow happens over a non TLS connection, for example, between components of a native application. The request could also be modified if TLS has a vulnerability or if router firmware has been compromised and is spoofing DNS or downgrading from TLS to HTTP. PKCE requires an additional one time code to be sent to the OAuth server. This is used to validate the request has not been intercepted or modified. 


The OAuth 2.1 draft specification requires that the PKCE challenge must be used with every authorization code grant, protecting against the authorization code being hijacked by an attacker.

### Redirect URIs must be compared using exact string matching

> Redirect URIs must be compared using exact string matching as per Section 4.1.3 of [OAuth 2.0 Security Best Current Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-14)

Some OAuth grants, notably the Authorization Code grant, use a redirect URI to determine where to send the client after success. For example, here’s a FusionAuth screen where this is configured (it is the "Authorized redirect URLs"):

{% include _image.html src="/assets/img/blogs/whats-new-in-oauth-2-1/admin-application-configuration.png" alt="Application configuration" class="img-fluid" figure=false %}

In this case, the only allowed value is `http://localhost:3000/oauth-callback` but you have configure multiple values. The client application specifies which one of these the user who is signing in should be redirected to.

It would be convenient to support wildcards in this redirect URI list. At FusionAuth, we hear this request from clients who want to simplify their development or CI environments. Every time a new server is spun up, the redirect URI configuration must be updated to include the new URI. Additionally, the redirect URI sometimes may have additional dynamic parameters useful to the final redirect resource, like `trackingparam=123&specialoffer=abc`, appended to the URL before the OAuth flow began. A URL with dynamic parameters doesn't match any of the configured redirect URIs, and so the redirect fails.

For example, if a CI system built an application for every feature branch, it might have the hostname dans-sample-application-1551.herokuapp.com, for a fix for bug #1551. If I wanted to make sure that I could login, I’d have to update the redirect URI settings for my OAuth server to include a specific redirect URI: `https://dans-sample-application-1551.herokuapp.com/oauth-callback`. And then the next build, for bug #1552, I’d have to add `https://dans-sample-application-1552.herokuapp.com/oauth-callback` and so forth. Obviously it’d be easier to use something like `https://dans-sample-application-*.herokuapp.com/oauth-callback` as the value, which lowers the tedium (of course, if you are using FusionAuth, you can [update your application configuration as part of the CI build process](https://fusionauth.io/docs/v1/tech/apis/applications#update-an-application)).  XXX maybe use the params example

However, not using an exact string comparison for the redirect URI before redirecting is a security risk. If the redirect URI matching is more flexible, an attacker could redirect a user to an open redirect server controlled by them, and then on to a malicious destination; OWASP discusses the [perils of such open redirect servers](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html#dangerous-url-redirects). While this would require compromising the request, using an exact match for redirect URI reduces risk.

### The Implicit grant is removed

> The Implicit grant ("response_type=token") is omitted from this specification as per Section 2.1.2 of [OAuth 2.0 Security Best Current Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-14)

The implicit grant flow is inherently insecure when used in a single page application (SPA). If you use this flow, you’ll be insecure. You’ll get an access token that is either in the URL fragment, and accessible to any JavaScript running on the page, or is stored in localstorage and is therefore accessible to any JavaScript running on the page, or is in a non HttpOnly cookie, and therefore accessible to any JavaScript running on the page.[g][h] (Is there an echo in here?) In all cases, an attacker gaining an access token is allowed to, well, access resources as the end user. 


Access tokens are not one time use, and can live from minutes to days depending on your server configuration, so if stolen, the resources they protect are no longer secure. You may think "well, I don’t have any malicious JavaScript on my site". Have you audited all your code, and its dependencies, and their dependencies, and their dependencies? (There’s that echo again.) Do you audit all your code automatically? Extensive dependency trees can cause issues: someone took over an [open source library](https://snyk.io/blog/malicious-code-found-in-npm-package-event-stream/) and added malicious code that was downloaded millions of times. 

Here’s an [article about the least insecure way to use the implicit grant for an SPA](https://fusionauth.io/learn/expert-advice/authentication/spa/oauth-implicit-grant-jwts-cookies). This solves the issue by redirecting to the SPA after setting an HttpOnly cookie. In the end it basically recreates the Authorization Code grant, illustrating how the Implicit grant can't be made secure.

The draft specification omits the Implicit grant. The "OAuth 2.0 Security Best Current Practices" document, however, stops short of prohibiting the Implicit grant, stating instead: 

> In order to avoid these issues, clients SHOULD NOT use the implicit grant (response type "token") … unless the  unless access token injection in the authorization response is prevented and the aforementioned token leakage vectors are [mitigated] 

From my perspective this means that the omission of this grant in the final RFC is still not a done deal. However, if the final version of the OAuth 2.1 spec omits the Implicit grant, a compliant OAuth 2.1 server will not support this flow. If you use this grant in your application, you’ll have to replace it with a different one if you want to be compliant with OAuth 2.1. May we suggest the Authorization Code grant? 

### The Resource Owner Password Credentials grant is removed

> The Resource Owner Password Credentials grant is omitted from this specification as per Section 2.4 of [OAuth 2.0 Security Best Current Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-14)

This grant was added to the OAuth2.0 specification with an eye toward making migration to OAuth compliant servers easier. In this grant, the store receives the username and password (or other credentials) and passes it on to the OAuth server. Here’s [an article breaking down each step of the Resource Owner Password Credentials grant](https://fusionauth.io/learn/expert-advice/authentication/webapp/oauth-resource-owner-password-credentials-grant-jwts-refresh-tokens-cookies). This grant is often used for mobile applications. While this grant made it easier to integrate with OAuth with minimal application change, it breaks the delegation pattern and makes the OAuth flow less secure. No longer can you leave the work of securing your user’s credentials and data up to the OAuth server so you can focus on building your own app. Now you must ensure that your application backend is just as secure, since it will be sent the username and passwords as well. 


Unlike the Implicit grant, the "OAuth 2.0 Security Best Current Practices" document requires that this grant no longer be allowed: 

> The resource owner password credentials grant MUST NOT be used. 

It’s a good bet that this grant is going to be omitted in the final RFC. If you have a mobile application using this grant, you can either update the client to use an Authorization Code grant using PKCE or keep using your OAuth2.0 compliant system.

### No bearer tokens in the query string

> Bearer token usage omits the use of bearer tokens in the query string of URIs as per Section 4.3.2 of [OAuth 2.0 Security Best Current Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-14)

Bearer tokens, also known as access tokens, allow access to protected resources and therefore must be secured. These days, most tokens are JWTs. Clients store them securely and then use them to make API calls back to the application server. The Application server then uses the token to identify the user that is calling the API. When first defined in [RFC 6750](https://tools.ietf.org/html/rfc6750), such tokens were allowed in headers, POST bodies or query strings. The draft OAuth 2.1 spec prohibits the bearer token from being sent in a query string. This is a particular issue with the Implicit grant flow, which is omitted from the OAuth 2.1 specification.

A query string and, more generally, any data in the URL, is never private. JavaScript executing on a page can access it. A URL or components thereof may be captured in server log files, caches, or browser history. In general if you want to pass information privately over the internet, use TLS and put the sensitive information in a POST body or HTTP header.

### Limiting refresh tokens 

> Refresh tokens must either be sender-constrained or one-time use as per Section 4.12.2 of [OAuth 2.0 Security Best Current Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-14)

[Refresh tokens](https://tools.ietf.org/html/rfc6749#section-6) allow a client to retrieve new access tokens without reauthentication. This is helpful if you need access to a resource for longer than an access token might provide, or if you need infrequent access (such as being logged into your email for months or years). As such, they are typically longer lived than access tokens. Therefore you should take twice as much care when it comes to securing a refresh token. 


If they are acquired by an attacker, the attacker can create access tokens at will. Obviously at that point the resource which the access tokens protect will no longer be secure. As an example of how to secure refresh tokens, here’s [a post that uses the Authorization Code grant](https://fusionauth.io/learn/expert-advice/authentication/spa/oauth-authorization-code-grant-jwts-refresh-tokens-cookies) which stores refresh tokens securely using HttpOnly cookies and a limited cookie domain. Incidentally, never share your refresh tokens between different devices.

The OAuth 2.1 draft specification provides two options for refresh tokens: they can be one time use or tied to the sender with a cryptographic binding. 

One time use means that after a refresh token (call it refresh token A) is used to retrieve an access token, it becomes invalid. Of course, the OAuth server can also send a new refresh token (call it refresh token B) along with the access token. In this case, once the newly delivered access token expires, the client can request another access token using that refresh token B, and so on and so on. The change to single use refresh tokens may require changing client code to store the new refresh token.

The other recommended option is to ensure the OAuth server cryptographically binds the refresh token to the client. The options mentioned in the the "OAuth 2.0 Security Best Current Practices" document are [OAuth token binding](https://www.ietf.org/archive/id/draft-ietf-oauth-token-binding-08.txt) or Mutual TLS authentication [RFC 8705](https://tools.ietf.org/html/rfc8705). This binding ensures the request came from the client to which the refresh token was issued. 

To sum up, the OAuth 2.1 spec has changes to ensure your refresh tokens are protected by requiring them to one time use or by requiring cryptographic proof of the client they are associated with. 

## What’s unchanged?


These are the major changes in the proposed OAuth 2.1 RFC. The OAuth 2.1 spec is built on the foundation of the OAuth 2.0 spec and, except as noted, inherits all behavior not explicitly omitted or changed. For example, the Client Credentials grant, often used for server to server authentication, continues to be available in the draft OAuth 2.1 specification.

## Can you use OAuth 2.1 right now?

Well no. As of right now, there’s nothing stamped "OAuth 2.1." And the draft spec isn’t finalized. But if you follow best practices around security, you can reap the benefits of this consolidated draft, and prepare yourself for when it is released. FusionAuth has an eye toward the future and already has support for many of these changes.

When writing a client application, avoid the Implicit grant and the Resource Owner Password Credentials grant. However, as these are part of the OAuth 2.0 specification, they are currently supported by FusionAuth.

Some steps to make sure your OAuth server (or your own server, if you run your own OAuth server) is taking:
* Using PKCE whenever you use the authorization code grant. ([FusionAuth highly recommends using PKCE.](https://fusionauth.io/docs/v1/tech/oauth/#example-authorization-code-grant))
* Make sure that your redirect URIs are compared using exact string matches, not wildcarded. (FusionAuth has you covered: ["URLs that are not authorized [configured in the application] may not be utilized in the redirect_uri"](https://fusionauth.io/docs/v1/tech/core-concepts/applications#oauth).)
* Make sure bearer tokens are never present in the query string. (FusionAuth doesn’t support access tokens in any grant except the Implict Grant. But you shouldn’t be using that anyway.)
* Limit your refresh tokens to make sure they are not abused. (FusionAuth forces refresh tokens be tied to the client to which the refresh token was sent, but doesn’t, as of now, follow the cryptographic signing behavior outlined in the OAuth 2.1 draft.)


## Future directions

> It's tough to make predictions, especially about the future." - Yogi Berra


Please note that this specification is under active discussion on the OAuth mailing list. If you are interested in following or influencing this RFC, review the [discussion archives](https://mailarchive.ietf.org/arch/browse/oauth/) and/or [join the mailing list](https://www.ietf.org/mailman/listinfo/oauth). 

Beyond this draft RFC, which is going to consolidate best practices but leave most of OAuth2.0 untouched, there’s also an OAuth3 working group, [reimagining the protocol from the ground up](https://oauth.net/3/). The OAuth3 specification is further from release than the OAuth2.1 specification.




todo
- check for 'store' usage, think about replacing that
- remove the word 'flow' where possible
- make sure all grants are capitalized
- consider params
- what about image?
