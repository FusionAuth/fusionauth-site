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

Set the `typ` claim to a known value. This prevents one kind of JWT from being confused with a different kind.

### Signature algorithms

Choose the correct signing algorithm.


## As a client

## When consuming
Confirm that the `typ` claim is what you expect.
## In conclusion

This article discussed a number of ways that you can ensure your JWTs are not susceptible to misuse. 
