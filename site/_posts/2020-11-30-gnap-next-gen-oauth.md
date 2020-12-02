---
layout: blog-post
title: GNAP is the next iteration of OAuth
description: What is GNAP and why should you care?
image: blogs/custom-admin-registration-form/manage-custom-user-profile-data-in-th-fusionauth-admin.png
author: Dan Moore
category: blog
excerpt_separator: "<!--more-->"
---

The Grant Negotiation and Authorization Protocol, also known as GNAP, is currently being formulated in an IETF working group. This protocol will not be backward compatible with OAuth 2, yet it well worth paying attention to. 


<!--more-->

This protocol is in the early stages. (GNAP, for those who are wondering, should be pronounced 'nap'.)
According to the [working group charter](https://datatracker.ietf.org/wg/gnap/about/), this standard will be released in multiple parts beginning in the middle of 2021. Additionally, they very clearly call out that this is not going to be backwards compatible, but it is going to solve very similar problems as OAuth2 and OIDC.

> This group is chartered to develop a fine-grained delegation protocol for authorization, API access, user identifiers, and identity assertions. ... Although the artifacts for this work are not intended or expected to be backwards-compatible with OAuth 2.0 or OpenID Connect, the group will attempt to simplify migrating from OAuth 2.0 and OpenID Connect to the new protocol where possible.

## What's wrong with OAuth

Why might you care, if you are happy using OAuth2 and OIDC for your standards based authentication needs?  The core OAuth specification, good old [RFC 6749](https://tools.ietf.org/html/rfc6749), was released in 2012 and has some real strengths:

* The spec is widely supported and deployed.
* It can and has been extended to support novel uses, such as the device grant.
* You can build a secure system with delegation of permissiones with no security PhD required.
* It is far easier on clients than other similar protocols such as SAML.

But nothing is perfect. OAuth2 also has some flaws. Some of them include:

* It is tied tightly to redirects and the browser as a client.
* It has archaic developer ergonomics, including plentiful use of form parameters.
* Proof of possession is late to the game: there are several ways to limit tokens to clients that requested them ([DPOP](https://tools.ietf.org/html/draft-ietf-oauth-dpop-02), [MTLS](https://tools.ietf.org/html/rfc8705)), but most tokens are still bearer tokens, with all the risks. 
* Discovery of endpoints is slightly cumbersome. From the RFC: " The means through which the client obtains the location of the authorization endpoint are beyond the scope of this specification, but the location is typically provided in the service documentation."
* The mobile app experience is suboptimal. The BCP for mobile apps, [8252](https://tools.ietf.org/html/rfc8252), indicates that webviews should not be used: "This best current practice requires that native apps MUST NOT use embedded user-agents to perform authorization requests...". This means that your beautiful native app has to open a system browser when it comes time to authenticate. Not the best user experience.

A big issue with OAuth2 is complexity. Here are some of the RFCs that you may need to read as a user of OAuth.

PIC TBD

To be fair, [OAuth 2.1 is addressing some of these issues](/learn/expert-advice/oauth/differences-between-oauth-2-oauth-2-1/), but from my reading of the draft spec and discussion on the mailing list, GNAP aims to address them more fully.

## Things that excite me about GNAP

First, it's worth reiterating that GNAP is changing rapidly. There's a lot of discussion on the [mailing list](https://mailarchive.ietf.org/arch/browse/txauth/) and you can also see changes happening in the [GitHub issues list](https://github.com/ietf-wg-gnap/gnap-core-protocol/). All that is to say that these features may be in, out, or modified if you read this post months after it was posted.

Also, if you'd like, you can watch a video explaining more about GNAP.

{% include _youtube-video.liquid youtubeid="n8xAFjzJsTU" %}

The following things excite me about GNAP.

### Multiple access tokens

### Interactions are first class concepts


### Continuation of grant

### Keys keys everywhere


### Identity built in

### Developer ergonomics




## What should you do?

If OAuth2 works for you, keep using it
Authorization Code Grant with PKCE please
People will still be running OAuth2 in 3 years


Keep an eye on the draft
Check in
Join the mailing list
Contribute if you can
Reference implementations


Review to see if it fits your use cases better
Migration path for major OAuth grants
In draft right now



video




Why GNAP

OAuth2 successful

image ofk


