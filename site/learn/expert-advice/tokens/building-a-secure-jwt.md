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

JSON Web Tokens (JWTs) get a lot of hate online for being insecure. Tom Ptacek, founder of [Latacora](https://latacora.com/), a security consultancy, had this to say about [JWTs in 2017](https://news.ycombinator.com/item?id=14292223):

> So, as someone who does some work in crypto engineering, arguments about JWT being problematic only if implementations are "bungled" or developers are "incompetent" are sort of an obvious "tell" that the people behind those arguments aren't really crypto people. In crypto, this debate is over.
>
> I know a lot of crypto people who do not like JWT. I don't know one who does.

JWTs can be hard to use well, but they’re still common. They have other benefits too, they’re flexible, [standardized](https://tools.ietf.org/html/rfc7519), stateless, portable, easy to understand, and extendable. They also have libraries to help you generate and consume them in almost every programming language.

This article will help make sure your JWTs are unassailable. It'll cover how you can securely integrate tokens into your systems. I'm going to recommend the most secure options. 

However, every situation is different. You know your data and risk factors, so please learn these best practices and then apply them using judgement. I wouldn't advise a bank to follow the same security practices as a 'todo' SaaS application; take your needs into account when implementing these recommendations. 

## Definitions

* creator: the system which creates the JWTs. In the world of OAuth this is often called an Authorization Server or AS.
* consumer: a system which consumes a JWT. In the world of OAuth this is often called the Resource Server or RS. These consume a JWT to determine if they should allow access to a Protected Resource such as an API.
* client: a system which retrieves a token from the creator, holds it, and presents it to other systems like a consumer.
* claim: a piece of information asserted about the subject of the JWT. Some are standardized, others are application specific.

## Out of scope

In this article, we'll only be discussing signed JWTs. Signing of JSON data structures is [standardized](https://tools.ietf.org/html/rfc7515). There are also standards for [encrypting JSON data](https://tools.ietf.org/html/rfc7516) but signed tokens are more common, so we'll focus on them. When I refer to a JWT in this article, I'm talking about a signed token, not an encrypted one.

## Security considerations

When you are working with JWTs in any capacity, be aware of the footguns that are available to you (to, you know, let you shoot yourself in the foot). 

The first is that a signed JWT is like a postcard. Anyone who has access to it can read it. Though this may look illegible, it's trivial to decode:

```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJmdXNpb25hdXRoLmlvIiwiZXhwIjoxNTkwNzA4Mzg1LCJhdWQiOiIyMzhkNDc5My03MGRlLTQxODMtOTcwNy00OGVkOGVjZDE5ZDkiLCJzdWIiOiIxOTAxNmI3My0zZmZhLTRiMjYtODBkOC1hYTkyODc3Mzg2NzciLCJuYW1lIjoiRGFuIE1vb3JlIiwicm9sZXMiOlsiUkVUUklFVkVfVE9ET1MiXX0.8QfosnY2ZledxWajJJqFPdEvrtQtP_Y3g5Kqk8bvHjo
```

You can decode it using [any number of online tools](/learn/expert-advice/dev-tools/jwt-debugger), because it's just three base 64 encoded strings joined by a period.

Keep any data that you wouldn't want in the hands of someone else outside of your JWT. When you sign and send a token, or when you decode and receive it, you're guaranteed the contents didn't change. You're not guaranteed the contents are unseen.

A corollary of that is that any information you do send should avoid unintentional data leakage. This would include information such as identifiers. If my JWT includes a value like `123` for an id, that means anyone viewing it has a pretty good idea that there is an entity with the id of `122`. Use a GUID or random string for identifiers instead. Likewise, because tokens are not encrypted, use TLS for transmitting them. 

Don't send JWTs using an HTTP method that may be cached or logged. So don't append the token to a `GET` request as a parameter. If you must send it in a GET request, use an HTTP header. You can also use other HTTP methods such as `POST`, which sends the JWT as a part of a request body. Sending the token value as part of a `GET` URL might result in the JWT being stored in a proxy's memory or filesystem, a browser cache, or even in web server access logs. 

If you are using OAuth, be careful with the Implicit grant, because if not implemented correctly, it can send the JWT (the access token) as a request parameter or fragment. For example, the [Docusign esign REST API](https://developers.docusign.com/esign-rest-api/guides/authentication/oauth2-implicit#step-1-obtain-the-access-token) delivers the access token as a URL fragment. Oops. 

## Creating tokens

When you are creating a JWT, use a library. Don't implement this RFC yourself. There are lots of [great libraries out there](https://openid.net/developers/jwt/). Use one.

Set the `typ` claim of your JWT header to a known value. This prevents one kind of token from being confused with one of a different type. 

### Signature algorithms

Choose the correct signing algorithm. You have two families of options, a symmetric algorithm like HMAC or an asymmetric choice like RSA or elliptic curve (ECC). The `"none"` algorithm, which doesn't sign the JWT and allows anyone to generate a token with any payload they want, should not be used.  

There are two main factors in algorithm selection. The first is performance. A symmetric signing algorithm like HMAC is simply faster. Here are the benchmark results using the `ruby-jwt` library, which encoded and decoded a token 50,000 times:

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

Don't look at the absolute numbers, they're going to change based on the programming language, what's happening on the system during a benchmark run and CPU horsepower. Instead, focus on the ratios. RSA encoding took approximately 9 times as long as HMAC encoding. ECC took almost two and a half times as long to encode and twice as long to decode. The code is [available](https://github.com/FusionAuth/fusionauth-example-ruby-jwt/blob/master/benchmark_algos.rb) if you'd like to take a look. Symmetric signatures are faster than asymmetric options. 

However, the shared secret required for options like HMAC has security implications. The token consumer can create a JWT indistinguishable from a token built by the creator, because both have access to the algorithm and the shared secret.

The second factor in choosing the correct signing algorithm is secret distribution. HMAC requires a shared secret to decode and encode the token. This means you need some method to provide the secret to both the creator and consumer of the JWT. If you control both parties and they live in a common environment, this is not typically a problem; you can add the secret to whatever secrets management solution you use and have both entities pull the secret from there. However, if you want outside entities to be able to verify your tokens, choose an asymmetric option. This might happen if the consumer is operated by a different department or business. The token creator can use the [JWK](https://tools.ietf.org/html/rfc7517) specification to publish public keys, and then the consumer of the JWT can validate it using that key. 

By using public/private key cryptography to sign the tokens, the issue of a shared secret is bypassed. Because of this, using an asymmetric option allows a creator to provide JWTs to token consumers that are not trusted. No system lacking the private key can generate a valid token.

If you have a choice between RSA and elliptic curve cryptography for a public/private key signing algorithm, choose elliptic curve cryptography, as it's easier to configure correctly, more modern, has fewer attacks, and is faster. You might have to use RSA if other parties don't support ECC.

### Claims

Make sure you set your claims appropriately. The JWT specification is clear:

> The set of claims that a JWT must contain to be considered valid is context dependent and is outside the scope of this specification.

Therefore no claims are required by the RFC. But to maximize security, the following registered claims should be part of your token creation:

* `iss` identifies the issuer of the JWT. It doesn't matter exactly what this string is as long as it is unique, doesn't leak information about the internals of the issuer, and is known by the consumer.
* `aud` identifies the audience of the token. This can be a scalar or an array value, but in either case it should also be known by the consumer.
* `nbf` and `exp` claims determine the timeframe that the token is valid. The `nbf` claim can be useful if you are issuing a token for future use. The `exp` claim, a time beyond which the JWT is no longer valid, should always be set.

### Revocation 

Because it is difficult to invalidate JWTs once issued--one of their benefits is that they are stateless, which means that their holders don't need to reach out to any server to verify they are valid--you should keep their lifetime on the order of hours or minutes, rather than days or months. Such quick expiration means that should they fall into the wrong hands, access lifetimes are limited.

But there are times, such as a data breach or a user logging out of your application, when you'll want to revoke tokens, either across a system or on a more granular level. You have a few choices here. These are in order of how much effort implementation would require from the token consumer:

* let tokens expire. No effort required here.
* have the creator rotate the secret or private key. This invalidates all extant tokens.
* use a 'time window' solution in combination with webhooks. Read more about this option and [revoking JWTs](/learn/expert-advice/tokens/revoking-jwts) in general.

### Keys

It's important to use a long, random secret when you are using a symmetric algorithm. Don't choose a key that is in use in any other system. 

Longer keys or secrets are more secure, but take longer to generate signatures. To find the appropriate tradeoff, make sure you benchmark the performance. The [JWK RFC](https://tools.ietf.org/html/rfc7518) does specify minimum lengths for the various algorithms.

The minimum secret length for HMAC:
> A key of the same size as the hash output (for instance, 256 bits for "HS256") or larger MUST be used with this algorithm.

The minimum key length for RSA:
> A key of size 2048 bits or larger MUST be used with these algorithms.

The minimum key length for ECC is not specified in the RFC. Please consult the RFC for more specifics about other algorithms. 

You should rotate your token signing keys regularly. Ideally you'd set this up in an automated fashion. Rotation renders all tokens signed with the old key invalid, so plan accordingly.

## Holding tokens

Clients request and hold tokens. A client can be a browser, a mobile phone or something else. A client receives a token from a token creator. They are then responsible for two things:

* passing the token on to any token consumers for authentication and authorization purposes
* storing the token securely

They should deliver the JWT to consumers over a secure connection, typically TLS.

The client must store the token securely as well. How to do that depends on what the client actually is. For a browser, you should avoid storing the JWT in localstorage. You should instead keep it in a cookie with the following flags:

* `Secure` to ensure the cookie is only sent over TLS.
* `HttpOnly` so that no rogue JavaScript can access the cookie.
* `SameSite` with a value of `Lax` or `Strict`. Either of these will ensure that the cookie is only sent to the domain it is associated with.

An alternative to a cookie with these flags would be using [a web worker](https://gitlab.com/jimdigriz/oauth2-worker) to store the token outside of the main JavaScript context.

For a mobile device, store the token in a secure location. For example, on an Android device, you'd want to store a JWT in [internal storage with a restrictive access mode](https://developer.android.com/training/articles/security-tips#StoringData) or in [shared preferences](https://developer.android.com/reference/android/content/SharedPreferences). For an iOS device, storing the JWT [in the keychain](https://developer.apple.com/documentation/security/keychain_services) is the best option.

For other types of clients, use platform specific best practices for securing data at rest.

## Consuming a JWT

Tokens must be examined as carefully as they are crafted. When you are consuming a JWT, verify the JWT to ensure it was signed correctly, and validate and sanitize the claims. Just like with token creation, don't roll your own implementation; use existing libraries.

Verify that the JWT signature matches the content. Any library should be able to do this, but ensure that the algorithm that the token was signed with, based on the header, is used to decode it. 

Then you want to validate the claims are as expected. This includes any implementation specific registered claims set on creation, as well as the issuer (`iss`) and the audience (`aud`) claims. A consumer should know the issuer it expects, based on out of band information such as documentation. You should also ensure the JWT is meant for you.

Other claims matter too. Make sure the `typ` claim, in the header, is as expected. Check that the JWT is within its lifetime; that is before the `exp` value and after the `nbf` value, if present. If you're concerned about clock skew, you can allow a few minutes of leeway.

If any of these claims fail to match expected values, the consumer should provide only minimal information to the client. Just as authentication servers should not reveal whether a failed login was due to an non-existent username or invalid password, you should return the same error message and status code, `403`, for any invalid token. This minimizes the information an attacker can learn by generating JWTs and sending them to you.

If you are going to use claims for further information processing, make sure you sanitize those values. For instance, if you are going to query a database based on a claim, use a parameterized query.

## In conclusion

JWTs are a flexible technology, and can be used in many ways. This article discussed a number of steps you can take, as either a creator, client or consumer of tokens, to ensure your JWTs are as secure as possible.

## References

* [The JWT RFC](https://tools.ietf.org/html/rfc7519)
* [JWT best practices](https://tools.ietf.org/html/rfc8725)
