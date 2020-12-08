---
layout: blog-post
title: GNAP is the next iteration of OAuth
description: What is GNAP and why should you care?
image: blogs/custom-admin-registration-form/manage-custom-user-profile-data-in-th-fusionauth-admin.png
author: Dan Moore
category: blog
excerpt_separator: "<!--more-->"
---

The Grant Negotiation and Authorization Protocol, also known as GNAP, is currently being formulated in an IETF working group. This protocol will not be backward compatible with OAuth 2. However, since it is a new major auth standard and is currently in development, you should give it some attention.

<!--more-->

GNAP in the discussion stage, but you can read the [draft I'm writing about here](https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-02.html). According to the [working group charter](https://datatracker.ietf.org/wg/gnap/about/), this standard will be released in multiple parts beginning in the middle of 2021. Additionally, they clearly state that GNAP will be backwards compatible with OAuth2 and OIDC, but it is going to solve similar problems:

> This group is chartered to develop a fine-grained delegation protocol for authorization, API access, user identifiers, and identity assertions. ... Although the artifacts for this work are not intended or expected to be backwards-compatible with OAuth 2.0 or OpenID Connect, the group will attempt to simplify migrating from OAuth 2.0 and OpenID Connect to the new protocol where possible.

## What's in a name?

Despite the title of this post, the authors of the specification don't call the standard "next gen OAuth". That's how I refer to it. 

The names for this proposed standard are confusing. Others have called it OAuth3. The standard grew out of two competing efforts, called TxAuth and OAuth.xyz. 

However, the specification is properly termed the Grant Negotiation and Authorization Protocol, or GNAP. GNAP, for those who are wondering, should be pronounced 'g-nap', though there was [some discussion](https://mailarchive.ietf.org/arch/msg/txauth/91n-mXRW_hQWMl-0cGx1j6sxHHI/) on the mailing list about the topic.

## What's wrong with OAuth

Why might you care, if you are happy using OAuth2 and OIDC for your standards based authentication needs? The core OAuth specification, good old [RFC 6749](https://tools.ietf.org/html/rfc6749), was released in 2012 and has some real strengths:

* The spec is widely supported and deployed.
* It can be, and has been, extended to support novel use cases, such as the device grant.
* By leveraging the work of the experts who wrote the RFC as well as commercial and open source tools, you can build a complicated, secure auth system without a security PhD.
* OAuth2 is far easier for clients to implement than other protocols solving similar problems, such as SAML.

But nothing is perfect. OAuth2 also has some flaws, including:

* The tight coupling of the auth process to redirects and a browser as the client.
* Archaic developer ergonomics, including the use of form parameters.
* There are several ways to limit tokens to the clients which requested them ([DPOP](https://tools.ietf.org/html/draft-ietf-oauth-dpop-02) and [MTLS](https://tools.ietf.org/html/rfc8705) are options; this is also known as "Proof of possession"), but these solutions are not widely deployed. Most OAuth systems issue bearer tokens, with the concomitant security risks. 
* Discovery of OAuth endpoints is cumbersome. From the RFC: "The means through which the client obtains the location of the authorization endpoint are beyond the scope of this specification, but the location is typically provided in the service documentation." Translation: developer, look it up. There is an [RFC to help with this](https://tools.ietf.org/html/rfc8414), though.
* The mobile app experience for OAuth2 is suboptimal. The Security Best Current Practices document for mobile apps, [RFC 8252](https://tools.ietf.org/html/rfc8252), indicates that webviews should not be used: "This best current practice requires that native apps MUST NOT use embedded user-agents to perform authorization requests...". This means that your beautiful native app has to open a system browser when it comes time to authenticate. Not the best user experience.

A big issue with OAuth2 is complexity. Here are some of the RFCs that you may need to read as a user of OAuth:

{% include _image.liquid src="/assets/img//blogs/gnap-oauth2-next-gen/oauth2-spec-pyramid.svg" alt="The pyramid of OAuth2 specifications" class="img-fluid" figure=false %}

GNAP isn't alone in trying to fix some of these issues. [OAuth 2.1](/learn/expert-advice/oauth/differences-between-oauth-2-oauth-2-1/) is addressing some of them as well, but from my research, including reading the draft spec and reviewing discussion on the mailing list, GNAP aims to address them more fully.

## Things that excite me about GNAP

First, it's worth reiterating that GNAP is still changing. There's a lot of discussion on the [mailing list](https://mailarchive.ietf.org/arch/browse/txauth/) and you can also see changes in the [GitHub repo](https://github.com/ietf-wg-gnap/gnap-core-protocol/). It appears that the draft is being edited there. The features below may be in, out, or modified if you are reading this post months after it was published.

Second, if you prefer your auth content spoken rather than written, I also recorded a video about GNAP. Plus beer gardens!

{% include _youtube-video.liquid youtubeid="n8xAFjzJsTU" %}

Below are some of the exciting GNAP features which will help make OAuth style auth easier to use when this specification is published and implemented.

### Distinct roles for the Requesting Party and Resource Owner 

In the typical OAuth authorization code grant, the owner of a resource, who can grant delegate access to the protected resources, is assumed to be the person who requested the grant. 

This is often the case, as when I grant a photo printing service access to my Flickr account. Wait, is it 2012? I meant my Google Photos account. 

But sometimes the entity requesting permission may be different from the entity which needs to grant permission, the "Resource Owner" or RO. In GNAP, this entity is termed the "Requesting Party" and has the acronym RQ, maybe because RP already is taken by a common auth term: "Relying Party". The RQ drives the "Resource Client", or RC, which could be a browser or some other device. The RQ wants access to protected resources, which live on the "Resource Server", or RS.

From the specification:

> The RQ interacts with the RC to indicate a need for resources on behalf of the RO. This could identify the RS the RC needs to call, the resources needed, or the RO that is needed to approve the request. Note that the RO and RQ are often the same entity in practice.

### Multiple access tokens

With GNAP, a client can ask for multiple access tokens in one grant request. This would allow software to request different access levels for different resources. 

This is of course possible now with multiple grant requests, but making this easier will help build systems with more granular sets of permissions. For instance, you could request `read` privileges on one resource and `read/write` privileges on another, but only ask the owner of the resources to authenticate and approve these permissions once.

Here's an example of how such a request might look, pulled from the draft specification:

```json
{ 
  "resources": {
    "token1": [
      {
        "type": "photo-api",
        "actions": [
          "read",
          "write",
          "dolphin"
        ],
        "locations": [
          "https://server.example.net/",
          "https://resource.local/other"
        ],
        "datatypes": [
          "metadata",
          "images"
        ]
      },
      "dolphin-metadata"
    ],
    "token2": [
      {
        "type": "walrus-access",
        "actions": [
          "foo",
          "bar"
        ],
        "locations": [
          "https://resource.other/"
        ],
        "datatypes": [
          "data",
          "pictures",
          "walrus whiskers"
        ]
      }
    ]
  }
}
```

You can see that the resources to which access is requested can be rich JSON objects, as the `photo-api` resource is. They can also be simple strings, as is `dolphin-metadata`.

### Interactions are first class concepts

In GNAP, the "Requesting Client", also known as the RC, declares what kind of interactions it supports. The "Authorization Server", also known as the AS, responds to the request with a supported interaction which can be used to interact with the "Resource Owner", or RO. In some cases it may be used to interact with the RC as well; the specification is a bit fast and loose here. 

Having these interactions defined in the spec as first class objects provides an extension point for adding future interactions. Examples of defined interactions include:

* Redirect: "redirect[ing] to an arbitrary URL" using the browser.
* App: "launch[ing] an application URL" on a mobile device.
* Callback: a URL to which the AS should send the RO after the AS is done with this interaction.
* User code: a short code which can be displayed, similar to the device grant.

There's also support for "no interaction" between the RC and the RO, which is useful if you have an out of band method by which the RC and the RO can communicate.

### Continuation of a grant

Grant requests in OAuth2 are typically one and done. If circumstances change, you start a new grant. With GNAP, if the AS determines a grant can be continued, you get a grant identifier. This might be part of the response received from an AS for such a grant:

```json
{
  "continue": {
    "access_token": {
      "value": "80UPRY5NM33OMUKMKSKU",
      "key": true
    },
    "uri": "https://server.example.com/continue",
    "wait": 60
  }
}
```

The `access_token` in the above snippet is the grant identifier and can be presented to the AS if the grant should be modified or continued. It's a bit confusing, because this `access_token` isn't related to access to the resource servers in any direct manner.

Being able to continue a grant lets a client step up or step down access if their circumstances change. For example, when a client first interacts with a resource, it might need write access, but later only need read access. With GNAP, the client can revise the grant request to get a new token tied to fewer privileges. This ensures that the client only has privileges it needs when it needs it.

In some cases, such as the step down scenario, where fewer privileges are needed, the authorization server may not even communicate with the resource owner. From the spec:

> ... [When] the RC realizes that it no longer needs "write" access and therefore modifies its ongoing request, here asking for just "read" access instead of both "read" and "write" as before. ... The AS replaces the previous resources from the first request, allowing the AS to determine if any previously-granted consent already applies. In this case, the AS would likely determine that reducing the breadth of the requested access means that new access tokens can be issued to the RC. The AS would likely revoke previously-issued access tokens that had the greater access rights associated with them.

You can also cancel grants, if the client no longer needs access to protected resources. This is done with a `DELETE` call using the aforementioned `access_token`.

> If the RC wishes to cancel an ongoing grant request, it makes an HTTP DELETE request to the continuation URI.

This will also require the AS to revoke tokens associated with this request.

### Keys keys everywhere

Cryptographic keys are woven deeply into GNAP, and are referenced many times in the grant request workflow. Here's an excerpt of an example request, pulled from the draft spec, from a client:

```json
{
  "client": {
    "display": {
      "name": "My Client Display Name",
      "uri": "https://example.net/client"
    },
    "key": {
      "proof": "jwsd",
      "jwk": {
        "kty": "RSA",
        "e": "AQAB",
        "kid": "xyz-1",
        "alg": "RS256",
        "n": "kOB5rR4Jv0GMeL...."
      }
    }
  },
}
```

The `key` value of the `client` object is the key which signed the request. Many [formats are supported](https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-02.html#name-binding-keys). 

In some cases, the `key` attribute could have the value `true`, in which case the token in that response is bound to the key of the client, which has previously been presented to the AS. 

Fear not! Bearer tokens still work. They didn't abandon that construct, which has been so successful in the OAuth2 ecosystem; if that's what you want, the `key` attribute should have the value of `false`:

> If the key value is the boolean false, the access token is a bearer token sent using the HTTP Header method defined in RFC6750.

### Identity built in

Unlike OAuth, an authorization framework which doesn't have the concept of identity, GNAP includes user identity features. 

A client may request information about the owner of a resource in the initial grant request. If the Authorization Server determines that the owner has granted permission to release this information, either actively or passively, it can be returned. Here's an example of such a response from the draft:

```json
{
  "user": {
    "sub_ids": [ {
      "subject_type": "email",
      "email": "user@example.com"
    } ],
    "assertions": {
      "id_token": "eyj..."
    }
  }
}
```

The reverse case is available as well. If the client knows who the owner is, it can present identity claims. If a client presents such claims and the authorization server trusts they are tied to the resource owner, the owner may not need to be consulted for delegation decisions. This trust can be built through request signing.

From the specification:

> If the AS trusts the RC to present verifiable assertions, the AS MAY decide, based on its policy, to skip interaction with the RO, even if the RC provides one or more interaction modes in its request.

### Developer ergonomics

OAuth requires you to use requests with the `application/x-www-form-urlencoded` media type. All of the interactions are built using form parameters. This is a stable format, guaranteed to be usable by many different clients and most programming languages. 

However, many modern APIs use `application/json` as the media format. JSON has its flaws; why oh why can't we have comments in JSON? But JSON is more flexible and allows richer object structures. And you aren't forced to do so. You can collapse many objects into simple strings; you don't have to use nested structures if you don't want to.

With GNAP, you can identify resources, interactions and other entities by reference as well. You can use these to refer to the entity in other operations. For example, here's a reference to an interaction which can be used to modify an existing grant, as discussed in the "Continuation of a grant" section.

```json
{
  "interact_ref": "4IFWWIKYBC2PQ6U56NL1"
}
```

All references may be static or dynamically generated. In either case, they allow easier communication between the AS and the RC. From the spec:

> Many parts of the RC's request can be passed as either a value or a reference. The use of a reference in place of a value allows for a client to optimize requests to the AS.

With GNAP there is one endpoint starting off any interaction. In true [HATEOAS](https://en.wikipedia.org/wiki/HATEOAS) fashion, clients start from one well known endpoint and follow links embedded in received JSON documents to other endpoints. No more consulting documentation to find out which endpoints you have to call when.

## What should you do?

Whew. That's a lot of new functionality. What should you do about GNAP?

First, If OAuth2 works for you, keep using it. Of course, make sure you use it properly, with all the security suggestions outlined by OAuth 2.1, including the PKCE extension. But it's not going anywhere.

Twitter recently updated from OAuth1, which was published as a standard in 2010 so it's likely that systems will still be running OAuth2 in three years. In fact, my colleagues laughed when I mentioned three years; they think it'll be more like a decade.

If you are an authorization server vendor, or you build your own OAuth servers, then you should:

* Keep an eye on the draft. There's more in there worth examining, and it's changing fast.
* Join the mailing list and contribute if you can, as many members of the identity community already have. I've seen new folks join the mailing list and be welcomed with their feedback.
* Watch for or build a reference implementation. Justin Richer, one of the editors of the spec, has committed to transitioning [OAuth.XYZ](https://oauth.xyz/) to being an implementation of GNAP: "GNAP will one day be a formal standard, and as that standardization process takes place, XYZ will transition to being an implementation of that standard. "

If you are a user of OAuth, you can take a more relaxed position. However, you should still review the GNAP spec and see if it fits your use cases better, especially as the specification becomes more concrete. 

In particular, review the migration path for the major OAuth grants. Have a discussion with your authorization server vendor, or with the maintainers of open source libraries you use, to see what their plans are for GNAP.

## Additional resources

Here are some additional resources, should this have whetted your appetite for all things GNAP.

* [The GNAP WG charter](https://datatracker.ietf.org/wg/gnap/about/)
* [The GNAP mailing list](https://mailarchive.ietf.org/arch/browse/txauth/)
* [The GNAP GitHub repo](https://github.com/ietf-wg-gnap/gnap-core-protocol/)
* An InfoWorld article: ["GNAP: OAuth the next generation"](https://www.infoworld.com/article/3596345/gnap-oauth-the-next-generation.html)


