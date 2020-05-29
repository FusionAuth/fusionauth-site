---
layout: advice
title: Building a Secure Signed JSON Web Token
description: How to use and revoke JWTs for effective and efficient authorization management. Examples, diagrams & more.
author: Dan Noore
image: advice/revoking-jwts-article.png
category: Tokens
related:
date: 2020-05-28
dateModified: 2020-05-28
---

JSON Web Tokens (JWTs) get a lot of hate online for being insecure. Tom Ptacek, founder of [Latacora](https://latacora.com/) a security consultancy, had this to say about [JWTs in 2017](https://news.ycombinator.com/item?id=14292223):

> So, as someone who does some work in crypto engineering, arguments about JWT being problematic only if implementations are "bungled" or developers are "incompetent" are sort of an obvious "tell" that the people behind those arguments aren't really crypto people. In crypto, this debate is over.
>
> I know a lot of crypto people who do not like JWT. I don't know one who does.

JWTs can be complicated, but they’re still used all over the place. They’re flexible, [standardized](https://tools.ietf.org/html/rfc7519), stateless, portable, easy to understand, extendable, and have libraries to help you generate and consume them in almost every programming language.

This article will discuss how you can securely integrate JWTs into your system and how you can make sure your JWTs remain secure. However, every situation is different. You know your security needs and should adjust these recommendations based on them. I wouldn't advise a bank to follow the same practices as a 'todo' application, so take your situation into account when implementing these recommendations. I'm going to recommend the most secure options.

## Definitions

* creator: the system which creates the JWTs.
* consumer: a system which consumes a JWT.
* client: a system which holds a token and presents it to other systems.
* claim: a piece of information asserted about the subject of the JWT. Some are standardized, others are application specific.

## Out of scope

In this article, we'll only be discussing signed JWTs, the most common type of token. The signing behavior is [standardized](https://tools.ietf.org/html/rfc7515). There are also standards for [encrypting JSON data](https://tools.ietf.org/html/rfc7516) but signed JWTs are far more common, and have most possible insecurities, so we'll focus on them. When I refer to a JWT in this article, I'm talking about a signed token, not an encrypted one.

## For everyone

When you are working with JWTs in any capacity, you should be aware of the footguns that are available to you (to, you know, let you shoot yourself in the foot). 

The first is that a signed JWT is like a postcard. Anyone who gets a hold of it can read it. Though this may look unreadable:

```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJmdXNpb25hdXRoLmlvIiwiZXhwIjoxNTkwNzA4Mzg1LCJhdWQiOiIyMzhkNDc5My03MGRlLTQxODMtOTcwNy00OGVkOGVjZDE5ZDkiLCJzdWIiOiIxOTAxNmI3My0zZmZhLTRiMjYtODBkOC1hYTkyODc3Mzg2NzciLCJuYW1lIjoiRGFuIE1vb3JlIiwicm9sZXMiOlsiUkVUUklFVkVfVE9ET1MiXX0.8QfosnY2ZledxWajJJqFPdEvrtQtP_Y3g5Kqk8bvHjo
```

It's trivial to decode it using [any number of online tools](/learn/expert-advice/dev-tools/jwt-debugger).

So keep any data that you wouldn't want in the hands of someone else outside of your JWT. When you sign and send an JWT, or when you decode and receive it, you're guaranteed the contents didn't change, you're not guaranteed the contents were not seen.

A corollary of that is that any information you do send should be checked for unintentional leakage. This would include things like identifiers. If I send over a value like `123` for an id and someone else sees it, that means that they'll have a pretty good idea that there is an entity with the id of `122`. Use a GUID or random string as an identifier instead.

Use TLS for transmitting JWTs. No duh.

Don't send JWTs using any HTTP method that may get inadvertently cached or logged. So don't append the JWT to a `GET` request as a parameter. Instead, use HTTP headers or `POST` the JWT as a part of a request body. Sending the JWT value as part of a `GET` request exposes the JWT to being stored in a proxy, a browser cache, or even in web server access logs. 

If you are using OAuth, this is where you need to be careful with the Implicit grant, because if not implemented correctly, it can send the JWT (the access token) as a request parameter. Oops. XXX verify this

Only use UTF-8 in your JWT. Avoid any other encoding. XXX not sure this is security

## When creating JWTs

When you are creating a JWT, the first thing you should do is ensure you are using a library. Don't implement this yourself. There are lots of [great libraries out there](https://jwt.io/#libraries-io). Use one.

Set the `typ` claim to a known value. This prevents one kind of JWT from being confused with one of a different type. 

### Signature algorithms

Choose the correct signing algorithm. You have two families of options, a symmetric algorithm like HMAC or an asymmetric choice like RSA or elliptic curve (ECC). The "none" algorithm, which doesn't sign the JWT and allows anyone to generate a token with any payload they want, should not be used.  XXX secret/key term misuse?

There are two main factors in algorithm selection. The first is performance. A choice like HMAC will perform better. Here are the benchmark results using the `ruby-jwt` library, which encoded and decoded a JWT using both HMAC and RSA algorithms 50,000 times:

```
hmac encode
  4.620000   0.008000   4.628000 (  4.653274)
hmac decode
  6.100000   0.032000   6.132000 (  6.152018)
rsa encode
 42.052000   0.048000  42.100000 ( 42.216739)
rsa decode
  6.644000   0.012000   6.656000 (  6.665588)
ecc encode
 11.444000   0.004000  11.448000 ( 11.464170)
ecc decode
 12.728000   0.008000  12.736000 ( 12.751313)
```

Don't focus on the absolute numbers, they're going to change based on the programming language, particular run and server horsepower. Instead, look at the ratios. RSA encoding took approximately 9 times as long as HMAC encoding. ECC took almost two and a half times as long to encode and twice as long to decode. The code is [available](https://github.com/FusionAuth/fusionauth-example-ruby-jwt/blob/master/benchmark_algos.rb). Symmetric signatures are simply faster than asymmetric options. However, the symmetric nature of HMAC also has security implications, unless you trust and control your JET consumers. The token consumer can create a JWT indistinguishable from a token from the creator, because both have access to the algorithm and the shared secret.

The second factor in choosing the correct algorithm is distributing the secret. HMAC requires a shared secret to decode and encode the token. This means you need some way to get the secret to both the creator and consumer of the JWT. If you control both, this is not a problem; you can just put the secret in whatever secrets management solution you use and have both entities pull the secret from there. However, if you want outside entities to be able to verify your tokens without sharing a secret, choose an asymmetric option. This might happen if the consumer is operated by a different organizational department or perhaps a different business, but still needs to verify the authenticity of a JWT. The JWT creator can use the [JWK](https://tools.ietf.org/html/rfc7517) specification to publish the public keys in a well known location, and then the consumer of the JWT can validate it using that key. 

There needs to be much less trust of the token consumer with RSA or similar algorithms. The token consumer doesn't need any access to the key used to encode the token, and so cannot generate a JWT.

If you have a choice between elliptic curve and RSA, choose elliptic curve cryptography, as it's easier to configure correctly, more modern, has fewer attacks, and is faster. You might have to use RSA if either party doesn't support ECC.

### Claims

Make sure you set your claims appropriately. The JWT specification is clear:

> The set of claims that a JWT must contain to be considered valid is context dependent and is outside the scope of this specification.

Therefore no claims are required by the RFC. But the following registered claims should be part of your secure token creation:

* `iss` identifies the issuer of the JWT. It doesn't really matter what this string is as long as it is unique, doesn't leak information about the internals of the issuer, and is known by the consumer.
* `aud` identifies the audience of the JWT. This can be a scalar or an array value, but in either case it should also be known by the consumer.
* `nbf` and `exp` claims determine the timeframe that the token is valid. The `nbf` claim can be useful if issuing a token to be used in the future. The `exp` claim should always be set.

### Revocation 

Because it is difficult to invalidate JWTs once issued--one main selling point is that they are stateless--you should keep their lifetime on the order of hours or minutes, rather than days or months. This way they expire quickly.

But there are times, such as a data breach or user logging out, when you'll need to revoke tokens, either across a system or on a granular basis. There are a few choices, in increasing order of impact to token consumer:

* let tokens expire
* implement [RFC 7009](https://tools.ietf.org/html/rfc7009) 
* use a 'time window' solution
* rotate keys

Read more about [revoking JWTs](/learn/expert-advice/tokens/revoking-jwts)

### Keys

It's important to use a long, random key when you are using a symmetric algorithm. Don't share this key with any other systems. 

Longer keys are more secure, but take longer to generate signatures. To find the appropriate tradeoff, make sure you benchmark the performance. The [JWK RFC](https://tools.ietf.org/html/rfc7518) does specifies minimum key lengths for the various algorithms.

The minimum for HMAC:
> A key of the same size as the hash output (for instance, 256 bits for "HS256") or larger MUST be used with this algorithm.

The minimum for RSA:
> A key of size 2048 bits or larger MUST be used with these algorithms.

The minimum key length for ECC is not specificed in the RFC. Please consult the RFC for more specifics about other algorithms. 

You should rotate your JWT signing keys regularly. Ideally you'd set this up in an automated fashion. This will render all tokens signed with the old key invalid, so plan accordingly.

## As a client

A client can be a browser, a mobile phone or something else. A client receives a token from a token creator. They are then responsible for only two things:

* passing the token on to any token consumers for authentication and authorization purposes
* storing the token securely

They should send the token to token consumers over a secure connection, typically TLS.

The client must store the token securely. How to do that depends on what the client actually is.

For a browser, you should avoid storing the JWT in localstorage. You should store it in a cookie with the following flags:

* `Secure` to ensure the cookie is only sent over TLS.
* `HttpOnly` so that no rogue JavaScript can access the token.
* `SameSite` set to `Lax` or `Strict`. Either of these will ensure that the cookie is only sent to the domain it is associated with.

An alternative to a cookie would be to use [a web worker](https://gitlab.com/jimdigriz/oauth2-worker) to store the token outside of the main JavaScript context.

For a mobile device, you can store the token in a secure location. For example, on an Android device, you'd want to store a JWT in [internal storage with a restrictive access mode](https://developer.android.com/training/articles/security-tips#StoringData) or in [shared preferences](https://developer.android.com/reference/android/content/SharedPreferences). For an iOS device, storing the JWT [in the keychain](https://developer.apple.com/documentation/security/keychain_services) is the best option.

For other types of clients, use the best practices for storing data securely.

## When consuming

JWTs must be consumed as carefully as they are crafted. When you are consuming a JWT, you must verify the JWT to make sure it was signed correctly, verify and sanitize the claims. Similar to token creation, don't roll your own implementation, but instead use existing libraries.

First you want to validate that the JWT signature is as expected. This includes making sure the algorithm that the JWT was signed with (based on the header) is what you use to decode it, and then using the correct secret or key to validate that the signature matches.

Then you want to verify the claims are as expected. This includes all the implementation specific registered claims that were set on creation: `iss` and `aud`. You as a consumer should know the correct issuer identifier. And you should also verify that the JWT was meant for you; that is, you are the audience.

Make sure the `typ` claim, in the header, is the expected value as well. Check that the JWT is within its valid lifetime; that is before the `exp` value and after the `nbf` value, if present.

If any of these validations fail, the consumer should give minimal information to the client. Just as you should not reveal whether the issue was with the username or password on a failed authentication attempt, you should return the same error message and status code, `403`, for any invalid token. This minimizes the information that an attacker can gain by creating JWTs and sending them to your system.

If you are going to do any lookups on values in a claim, make sure you sanitize those values. For instance, if you are going to run a database query based on a claim, make sure you use a parameterized query.

## In conclusion

JWTs are an extremely flexible technology, and can be used in many ways. This article discussed a number of steps you can take, as either a creator, client or consumer of tokens, to  ensure your JWTs are not susceptible to misuse. 

## References

* https://tools.ietf.org/html/rfc7519 
* https://tools.ietf.org/html/rfc8725 
* https://blog.trailofbits.com/2019/07/08/fuck-rsa/
