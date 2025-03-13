---
title: Components of JWTs Explained
description: Technical article explains JSON Web Tokens (JWT), their component parts, and how they are used for authentication. 
author: Dan Moore
icon: /img/icons/components-jwt-explained.svg
darkIcon: /img/icons/components-jwt-explained-dark.svg
section: Tokens
# date: 2022-02-24
# dateModified: 2022-02-24
---


A JSON Web Token (commonly shortened to JWT), is a token typically used with standard protocols such as [OAuth2](/articles/oauth/modern-guide-to-oauth). This article explains the component parts of a JWT, and helps explain how the JWT works.

Before we continue, it's important to note that JWTs are often mistakenly referred to as `JWT Tokens`. Adding the `Token` on the end would expand to `JSON Web Token Token`. Therefore, we leave off the trailing `Token` and simply use `JWT` in this article as it is the more correct name. Likewise, because JWTs are often used as part of an authentication and authorization process, some people refer to them as `Authentication Tokens` or `JWT Authentication Tokens`. Technically, a JWT is merely a token that contains [base64 encoded JSON](/dev-tools/base64-encoder-decoder). It can be used in many different use cases _including_ authentication and authorization. Therefore, we don't use this term in this article either, but we discuss how JWTs are used during the authentication process. 

Let's dig in! Here’s a freshly minted JWT. Newlines have been added for clarity, but they are typically not present.

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImY1ODg5MGQxOSJ9.eyJhdWQiO
iI4NWEwMzg2Ny1kY2NmLTQ4ODItYWRkZS0xYTc5YWVlYzUwZGYiLCJleHAiOjE2NDQ4ODQ
xODUsImlhdCI6MTY0NDg4MDU4NSwiaXNzIjoiYWNtZS5jb20iLCJzdWIiOiIwMDAwMDAwM
C0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJqdGkiOiIzZGQ2NDM0ZC03OWE5LTR
kMTUtOThiNS03YjUxZGJiMmNkMzEiLCJhdXRoZW50aWNhdGlvblR5cGUiOiJQQVNTV09SR
CIsImVtYWlsIjoiYWRtaW5AZnVzaW9uYXV0aC5pbyIsImVtYWlsX3ZlcmlmaWVkIjp0cnV
lLCJhcHBsaWNhdGlvbklkIjoiODVhMDM4NjctZGNjZi00ODgyLWFkZGUtMWE3OWFlZWM1M
GRmIiwicm9sZXMiOlsiY2VvIl19.dee-Ke6RzR0G9avaLNRZf1GUCDfe8Zbk9L2c7yaqKME
```

This may look like a lot of gibberish, but as you learn more about JWTs and how they are used in OAuth2 or authentication processes, it begins to make more sense.

There are a few types of JSON Web Tokens, but I’ll focus on signed JWTs as they are the most common. A signed JWT may also be called a JWS. It has three parts, separated by periods.

There’s a header, which in the case of the JWT above, starts with `eyJhbGc`. Then there is a body or payload, which above starts with `eyJhdWQ`. Finally, there is a signature, which starts with `dee-K` in the example JWT.

![The components of a JWT, visualized.](/img/shared/json-web-token.png)

How does a JWT work? Let’s break this example JWT apart and dig a bit deeper.

## The JWT Header Explained

`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImY1ODg5MGQxOSJ9` is the header of the JWT. The JWT header contains metadata about a JWT, including the key identifier, what algorithm was used to sign in and other information.

If you run the above header through a [base64 decoder](/dev-tools/base64-encoder-decoder):

```bash
echo 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImY1ODg5MGQxOSJ9'|base64 -d
```

You will see this JSON:

```
{"alg":"HS256","typ":"JWT","kid":"f58890d19"}%   
```

`HS256` indicates that the JWT was signed with a symmetric algorithm, specifically HMAC using SHA-256. 

The list of algorithms and implementation support level is below.

| "alg" Param Value | Digital Signature or MAC Algorithm             | Implementation Requirements |
|-------------------|------------------------------------------------|-----------------------------|
| HS256             | HMAC using SHA-256                             | Required                    |
| HS384             | HMAC using SHA-384                             | Optional                    |
| HS512             | HMAC using SHA-512                             | Optional                    |
| RS256             | RSASSA-PKCS1-v1_5 using SHA-256                | Recommended                 |
| RS384             | RSASSA-PKCS1-v1_5 using SHA-384                | Optional                    |
| RS512             | RSASSA-PKCS1-v1_5 using SHA-512                | Optional                    |
| ES256             | ECDSA using P-256 and SHA-256                  | Recommended+                |
| ES384             | ECDSA using P-384 and SHA-384                  | Optional                    |
| ES512             | ECDSA using P-521 and SHA-512                  | Optional                    |
| PS256             | RSASSA-PSS using SHA-256 and MGF1 with SHA-256 | Optional                    |
| PS384             | RSASSA-PSS using SHA-384 and MGF1 with SHA-384 | Optional                    |
| PS512             | RSASSA-PSS using SHA-512 and MGF1 with SHA-512 | Optional                    |
| none              | No digital signature or MAC performed          | Optional                    |

This table is drawn from RFC 7518. As only HS256 is required to be compliant with the spec, consult the software or library used to create JWTs for details on supported algorithms.

Other metadata is also stored in this part of the JWT. The `typ` header indicates the type of the JWT. In this case, the value is `JWT`, but other values are valid. For instance, if the JWT conforms to RFC 9068, it may have the value `at+JWT` indicating it is an access token.

[![A call to action image displaying a link to download an ebook on this topic.](/img/cta/jwt-guide-cta.png 'Download this article as an ebook')](/ebooks/breaking-down-json-web-tokens?utm_medium=cta&utm_source=articles&utm_campaign=jwt_ebook)

The `kid` value indicates what key was used to sign the JWT. For a symmetric key the `kid` could be used to look up a value in a secrets vault. For an asymmetric signing algorithm, this value lets the consumer of a JWT look up the correct public key corresponding to the private key which signed this JWT. Processing this value correctly is critical to signature verification and the integrity of the JWT payload.

Typically, you'll offload most of the processing of header values to a library. There are plenty of good open source JWT processing libraries. You should understand the values, but probably won't have to implement the actual processing.

## The JWT Token Body

The payload, or body, is where things get interesting. This section contains the data that this JWT was created to transport. If the JWT, for instance, represents a user authorized to access certain data or functionality, the payload contains user data such as roles or other authorization info.

Here's the payload from the example JWT:

```
eyJhdWQiOiI4NWEwMzg2Ny1kY2NmLTQ4ODItYWRkZS0xYTc5YWVlYzUwZGYiLCJleHAiOjE2NDQ4ODQxODUsImlhdCI6MTY0NDg4MDU4NSwiaXNzIjoiYWNtZS5jb20iLCJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJqdGkiOiIzZGQ2NDM0ZC03OWE5LTRkMTUtOThiNS03YjUxZGJiMmNkMzEiLCJhdXRoZW50aWNhdGlvblR5cGUiOiJQQVNTV09SRCIsImVtYWlsIjoiYWRtaW5AZnVzaW9uYXV0aC5pbyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhcHBsaWNhdGlvbklkIjoiODVhMDM4NjctZGNjZi00ODgyLWFkZGUtMWE3OWFlZWM1MGRmIiwicm9sZXMiOlsiY2VvIl19
```

If you run the sample payload through a [base64 decoder](/dev-tools/base64-encoder-decoder):

```bash
echo 'eyJhdWQiOiI4NWEwMzg2Ny1kY2NmLTQ4ODItYWRkZS0xYTc5YWVlYzUwZGYiLCJleHAiOjE2NDQ4ODQxODUsImlhdCI6MTY0NDg4MDU4NSwiaXNzIjoiYWNtZS5jb20iLCJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJqdGkiOiIzZGQ2NDM0ZC03OWE5LTRkMTUtOThiNS03YjUxZGJiMmNkMzEiLCJhdXRoZW50aWNhdGlvblR5cGUiOiJQQVNTV09SRCIsImVtYWlsIjoiYWRtaW5AZnVzaW9uYXV0aC5pbyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhcHBsaWNhdGlvbklkIjoiODVhMDM4NjctZGNjZi00ODgyLWFkZGUtMWE3OWFlZWM1MGRmIiwicm9sZXMiOlsiY2VvIl19' |base64 -d
```

You'll see this JSON:

```
{
  "aud": "85a03867-dccf-4882-adde-1a79aeec50df",
  "exp": 1644884185,
  "iat": 1644880585,
  "iss": "acme.com",
  "sub": "00000000-0000-0000-0000-000000000001",
  "jti": "3dd6434d-79a9-4d15-98b5-7b51dbb2cd31",
  "authenticationType": "PASSWORD",
  "email": "admin@fusionauth.io",
  "email_verified": true,
  "applicationId": "85a03867-dccf-4882-adde-1a79aeec50df",
  "roles": [
    "ceo"
  ]
}
```

Note that the algorithm to create signed JWTs can remove base64 padding, so there may be missing `=` signs at the end of the JWT. You may need to add that back in order to decode a JWT token. This depends on the length of the content. You can [learn more about it here](https://datatracker.ietf.org/doc/html/rfc7515#appendix-C). 

As mentioned above, the payload is what your application cares about, so let's take a look at this JSON more closely. Each of the keys of the object are called "claims". 

Some claims are well known with meanings dictated by standards bodies such as the IETF. You can view [examples of such claims here](https://www.iana.org/assignments/jwt/jwt.xhtml). These include the `iss` and `aud` claims from the example token. Both of these have defined meanings when present in the payload of a JWT.

There are other non-standard claims, such as `authenticationType`. These claims may represent business domain or custom data. For example, `authenticationType` is a proprietary claim used by FusionAuth to indicate the method of authentication, such as password, refresh token or via a passwordless link.

You may add any claims you want to a JWT, including data useful to downstream consumers of the JWT. As you can see from the `roles` claim, claims don't have to be simple JSON primitives. They can be any data structure which can be represented in JSON.

### Claims to Verify

When code is presented with a JWT, it should verify certain claims. At a minimum, these claims should be checked out:

* `iss` identifies the issuer of the JWT. It doesn't matter exactly what this string is (UUID, domain name, URL or something else) as long as the issuer and consumer of the JWT agree on valid values, and that the consumer validates the claim matches a known good value.
* `aud` identifies the audience of the token, that is, who should be consuming it. `aud` may be a scalar or an array value. Again, the issuer and the consumer of the JWT should agree on the specific values considered acceptable.
* `nbf` and `exp`. These claims determine the timeframe for which the token is valid. The `nbf` claim can be useful if you are issuing a token for future use. The `exp` claim, a time beyond which the JWT is no longer valid, should always be set. Unlike other claims, these have a defined value format: seconds since the UNIX epoch.

In addition to these, verify business domain specific claims. For instance, someone consuming the above JWT could deny access when `authenticationType` is an unknown value.

Avoid putting unused claims into a JWT. While there is no limit to the size of a JWT, in general the larger they are, the more CPU is required to sign and verify them and the more time it takes to transport them. Benchmark expected JWTs to have an understanding of the performance characteristics.

### Claims and Security

The claims of a signed JWT are visible to anyone who possesses the token.

As you saw above, all you need to view the claims in plaintext is a [base64 decoder](/dev-tools/base64-encoder-decoder), which is available at every command line and everywhere in the internet.

Therefore, you shouldn't put anything that should remain secret into a JWT. This includes:

* private information such as government Ids
* secrets like passwords
* anything that would leak information like an integer Id

Another security concern is related to the verification of the `aud` claim. Since consuming code already possesses the token, isn't verifying the `aud` claim extra work? The `aud` claim indicates who should receive this JWT, but the code already has it. Nope, always verify this claim.

Why?

Imagine a scenario where you have two different APIs. One is to create and manage todos and the other is a billing API, used to transfer money. Both APIs expect some users with a role of `admin`. However, that role means vastly different things in terms of what actions can be taken. 

If both the todo and billing APIs don't verify that any given JWT was created for them, an attacker could take a JWT from the todo API with the `admin` role and present it to the billing API.

This would be at best a bug and at worst an escalation of privilege with negative ramifications for bank accounts.

## The JWT Signature

The signature of a JWT is critical, because it guarantees the integrity of the payload and the header. Verifying the signature must be the first step that any consumer of a JWT performs. If the signature doesn't match, no further processing should take place.

While you can read the [relevant portion of the specification](https://datatracker.ietf.org/doc/html/rfc7515#page-15) to learn how the signature is generated, the high level overview is:

* the header is turned into a base64 URL encoded string
* the payload is turned into a base64 URL encoded string
* they are concatenated with a `.`
* the resulting string is run through the cryptographic algorithm selected, along with the corresponding key
* the signature is base64 URL encoded
* the encoded signature is appended to the string with a `.` as a separator

When the JWT is received, the same operations can be performed. If the generated signature is correct, the contents of the JWT are unchanged from when it was created.

## JSON Web Token Limits

In the specifications, there are no hard limits on length of JSON Web Tokens. In practical terms, think about:

* Where are you going to store the JWT
* What is the performance penalty of large JWTs

### Storage

JWTs can be sent in HTTP headers, stored in cookies, and placed in form parameters. In these scenarios, the storage dictates the maximum JWT length.

For example, the typical storage limit for cookies in a browser is typically 4096 bytes, including the name. The limit on HTTP headers varies widely based on software components, but 8192 bytes seems to be a common value.

Consult the relevant specifications or other resources for limits in your particular use case, but rest assured that JWTs have no intrinsic size limits.

### Performance Penalty

Since JWTs can contain many different kinds of user information, developers may be tempted to put too much in them. This can degrade performance, both in the signing and verification steps as well as in transport.

For an example of the former, here are the results of a benchmark from signing and verifying two different JWTs. Each operation was done 50,000 times. 

This first JWT had a body approximately 180 characters in length; the total encoded token length was between 300 and 600, depending on the signing algorithm used.

```
hmac sign
  1.632396   0.011794   1.644190 (  1.656177)
hmac verify
  2.452983   0.015723   2.468706 (  2.487930)
rsa sign
 28.409793   0.117695  28.527488 ( 28.697615)
rsa verify
  3.086154   0.011869   3.098023 (  3.109780)
ecc sign
  4.248960   0.017153   4.266113 (  4.285231)
ecc verify
  7.057758   0.027116   7.084874 (  7.113594)
```

The next JWT payload was of approximately 1800 characters, so ten times the size of the previous token. This had a total token length of 2400 to 2700 characters.

```
hmac sign
  3.356960   0.018175   3.375135 (  3.389963)
hmac verify
  4.283810   0.018320   4.302130 (  4.321095)
rsa sign
 32.703723   0.172346  32.876069 ( 33.072665)
rsa verify
  5.300321   0.027455   5.327776 (  5.358079)
ecc sign
  6.557596   0.032239   6.589835 (  6.624320)
ecc verify
  9.184033   0.035617   9.219650 (  9.259225)
```

You can see that the total time increased for the longer JWT, but typically not linearly. The increase in time taken ranges from about 20% for RSA signing to approximately 100% for HMAC signing.

Be mindful of additional time taken to transport longer JWT; this can be tested and optimized in the same way you would with any other API or HTML content.

## Conclusion

Signed JWTs have a header, body, and signature. Each plays a vital auth role in ensuring that JWTs can be used to safely store and transmit critical information, whether about identities or not. Understanding all three of these components are critical to the correct use of JWT as well.
