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

claims

client

## Out of scope

In this article, we'll only be discussing signed JWTs, the most common form of JWT. The signing behavior is also [standardized](https://tools.ietf.org/html/rfc7515). There are also standards for [encrypting JSON data](https://tools.ietf.org/html/rfc7516) but signed JWTs are far more common, and have most possible insecurities, so we'll focus on them. When I refer to a JWT in this article, I'm talking about a signed JWT, not an encrypted one.

## For everyone

When you are working with JWTs in any capacity, you should be aware of the footguns that are available to you (to, you know, let you shoot yourself in the foot). 

The first is that a signed JWT is like a postcard. Anyone who gets ahold of it can read it. Even though this may look like garbage:

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

Choose the correct signing algorithm. You have two families of options, a symmetric algorithm like HMAC or an asymmetric choice like RSA or elliptic curve (ECC). The "none" algorithm, which doesn't sign the JWT and allows anyone to generate a token with any payload they want, should not be used. 

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

Don't focus on the absolute numbers, they're going to change based on the programming language, particular run and server horsepower. Instead, look at the ratios. RSA encoding took approximately 9 times as long as HMAC encoding. ECC took almost two and a half times as long to encode and twice as long to decode. The code is [available](https://github.com/FusionAuth/fusionauth-example-ruby-jwt/blob/master/benchmark_algos.rb). Symmetric signatures are simply faster than asymmetric options.

However, the symmetric nature of HMAC also has security implications, unless you trust and control your clients. The token consumer can create a JWT indistinguishable from a token created by the creator, because both have access to the algorithm and the shared secret.

However, the second factor in choosing the correct algorithm is distributing the secret. HMAC requires a shared secret to decode and encode the token. This means you need some way to get the secret to both the creator and consumer of the JWT. If you control both, this is not a problem; you can just put the secret in whatever secrets management solution you use and have both entities pull the secret from there. However, if you want outside entities to be able to verify your tokens without sharing a secret, choose an asymmetric option. This might happen if the consumer is operated by a different organizational department or perhaps a different business, but still needs to verify the authenticity of a JWT. The JWT creator can use the [JWK](https://tools.ietf.org/html/rfc7517) specification to publish the public keys in a well known location, and then the consumer of the JWT can validate it using that key. 

There needs to be much less trust of the token consumer with RSA or similar algorithms. The token consumer doesn't need any access to the key used to encode the token, and so cannot generate a JWT.

If you have a choice between elliptic curve and RSA, choose elliptic curve cryptography, as it's easier to configure correctly, more modern, has fewer attacks, and is faster. You might have to use RSA if either party doesn't support ECC.

### Keys

It's important to use a long, random key when you are using a symmetric algorithm. Don't share this key with any other systems. 

Longer keys are more secure, but take longer to generate signatures. To find the appropriate tradeoff, make sure you benchmark the performance. The [JWK RFC](https://tools.ietf.org/html/rfc7518) does specifies minimum key lengths for the various algorithms.

The minimum for HMAC:
> A key of the same size as the hash output (for instance, 256 bits for "HS256") or larger MUST be used with this algorithm.

The minimum for RSA:
> A key of size 2048 bits or larger MUST be used with these algorithms.

The minimum key length for ECC is not specificed in the RFC. Please consult the RFC for more specifics about other algorithms. 

You should rotate your keys regularly. Ideally you'd set this up in an automated fashion.. This will render all tokens signed with the old key invalid, so plan accordingly.

## As a client

## When consuming
Confirm that the `typ` claim is what you expect.
## In conclusion

This article discussed a number of ways that you can ensure your JWTs are not susceptible to misuse. 


## References

https://blog.trailofbits.com/2019/07/08/fuck-rsa/
https://tools.ietf.org/html/rfc8725 
