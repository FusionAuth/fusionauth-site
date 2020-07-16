---
layout: advice
title: Revoking JWTs & JWT Expiration
description: How to use and revoke JWTs for effective and efficient authorization management. Examples, diagrams & more.
author: Brian Pontarelli
image: advice/revoking-jwts-article.png
category: Tokens
related:
date: 2019-11-04
dateModified: 2020-06-25
---

I have been talking with developers about JSON Web Tokens (JWTs) recently and one question keeps coming up: "How do I revoke a JWT?"

If you poke around online, you'll find that the most common answers are:

- Set the duration of the JWT to a short period (a few minutes or seconds)
- Implement complicated blacklisting techniques
- Store every JWT so you can validate them

There is not a simple solution because JWTs are designed to be portable, decoupled identities. Once you authenticate against an identity provider (IdP) and get back a JWT, you don't need to ask the IdP if the JWT is valid. This is particularly powerful when you use RSA public/private key signing. The IdP signs the JWT using the private key and then any service that has the public key can verify the integrity of the JWT.

Here's a diagram that illustrates this architecture:

{% include _image.liquid src="/assets/img/blogs/jwt-revoke_350.png" alt="Revoking JWTs" class="img-fluid" figure=false %}

The Todo Backend in the diagram can use the JWT and the public key to verify the JWT and then pull the user's id (in this case the subject) out of the JWT. The Todo Backend can then use the user's id to perform operations on that user's data. However, because the Todo Backend isn't verifying the JWT with the IdP, it has no idea if an administrator has logged into the IdP and locked or deleted that user's account.

There are a few options that are worth considering.

## Check with the IdP

If you have the Todo Backend call the `introspect` endpoint against every JWT it encounters, per [RFC 7662](https://tools.ietf.org/html/rfc7662), then you are guaranteed that if a JWT is revoked on the IdP, the Todo Backend will immediately be notified of any revoked JWTS.

From the RFC, the `active` value of the response is defined as:

> Boolean indicator of whether or not the presented token is currently active.  The specifics of a token's "active" state will vary depending on the implementation of the authorization server and the information it keeps about its tokens, but a "true" value return for the "active" property will generally indicate that a given token has been issued by this authorization server, has not been revoked by the resource owner, and is within its given time window of validity (e.g., after its issuance time and before its expiration time).

Of course, this comes at a cost. The JWT is no longer a decoupled store of identity, because it must be validated every time the Todo Backend is accessed. You could still choose to use JWTs because of their flexibility and message integrity, however. It may make sense to use an opaque token rather than a JWT, since the Todo Backend must consult the IdP on every call anyway.

[RFC 7009](https://tools.ietf.org/html/rfc7009) outlines a standard way to revoke OAuth 2.0 tokens. So, just pick an authorization server which supports that, right? Well, unfortunately, it isn't so simple. From section 3 of the RFC:

>  OAuth 2.0 allows deployment flexibility with respect to the style of access tokens.  The access tokens may be self-contained so that a resource server needs no further interaction with an authorization server issuing these tokens to perform an authorization decision of the client requesting access to a protected resource.  A system design may, however, instead use access tokens that are handles referring to authorization data stored at the authorization server.  This consequently requires a resource server to issue a request to the respective authorization server to retrieve the content of the access token every time a client presents an access token.

>   While these are not the only options, they illustrate the implications for revocation.  In the latter case, the authorization server is able to revoke an access token previously issued to a client when the resource server relays a received access token.  In the former case, some (currently non-standardized) backend interaction between the authorization server and the resource server may be used when immediate access token revocation is desired.  Another design alternative is to issue short-lived access tokens, which can be refreshed at any time using the corresponding refresh tokens.  This allows the authorization server to impose a limit on the time revoked when access tokens are in use.

Again, if you use "self-contained" access tokens such as JWTs, then the authorization server (the IdP) and the resource server (the Todo Backend) must have some non-standardized "backend interaction" in order to invalidate a JWT.

If you have have non self-contained access tokens, then the "resource server [issues] a request to the respective authorization server to retrieve the content of the access token every time a client presents an access token". Again, in that case, JWTs don't buy you much.

## Rotate the keys

If you are using a symmetric signing algorithm like HMAC and you can quickly distribute the shared key, you can rotate it. This will essentially invalidate all outstanding JWTs, so this is not an option to use lightly. However, rotating the keys may be a good choice depending on the number JWTs you have outstanding and the impact of a revoked JWT being accepted. If, for instance, there are few clients with JWTs and there is significant system impact if a revoked JWT is accepted by the Todo Backend, then rotating the keys may be acceptable.

If you are using an asymmetric signing algorithm, then this option is less effective. How quickly the revoked JWT is no longer accepted by the Todo Backend depends on how often the Todo Backend retrieves public keys. That duration is the maximum time that an revoked JWT will be accepted. 
## Reduce the duration of the JWT

The most common solution is to reduce the duration of the JWT and revoke the refresh token so that the user can't generate a new JWT. With this setup, the JWT's expiration duration is set to something short (5-10 minutes) and the refresh token is set to something long (2 weeks or 2 months). At any time, an administrator can revoke the refresh token which means that the user must re-authenticate to get a new JWT. That is unless they happen to have a valid JWT.

Here's where things get tricky. That user now has 5 to 10 minutes to use the JWT before it expires. Once it expires, they'll attempt to use their current refresh token to get a new JWT. Since the refresh token has been revoked, this operation will fail and they'll be forced to login again.

It's this 5 to 10 minute window that freaks everyone out. So, how do we fix it?

## Webhooks

One method leverages a distributed event system that notifies services when refresh tokens have been revoked. The IdP broadcasts an event when a refresh token is revoked and other backends/services listen for the event. If you squint, you might see something similiar to the non-standardized "backend interaction" mentioned in RFC 7009. When an event is received, the backends/services update a local cache that maintains a set of users whose refresh tokens have been revoked. This cache is checked whenever a JWT is verified to determine if the JWT should be honored. 

This solution maintains the statelessness of JWTs because it is based on the expiration of the tokens and expiration instant of individual JWTs, not any communication with the IdP.

### Example: Revoking JWTs in FusionAuth

To illustrate this, I'm going to use [FusionAuth](https://fusionauth.io/)'s event and Webhook system as well as the `jwt.refresh-token.revoke` event. If you are building your own IdP or using another system, you might need to build out your own eventing system based on this article.

The FusionAuth **jwt.refresh-token.revoke** event looks like this:

```json
{
  "event": {
    "type": "jwt.refresh-token.revoke",
    "applicationTimeToLiveInSeconds": {
      "cc0567da-68a1-45f3-b15b-5a6228bb7146": 600
    },
    "userId": "00000000-0000-0000-0000-000000000001"
  }
}
```

Next, let's write a simple Webhook in our application that will receive this event and update the cache of JWTs. We'll call this cache a JWTManager. (NOTE: our example has a variable called `applicationId` that is a global variable that stores the id of the application itself - in this case it would be **cc0567da-68a1-45f3-b15b-5a6228bb7146**). Our code below is written in Node.js and uses the [FusionAuth Typescript client library](https://github.com/FusionAuth/fusionauth-typescript-client).

```js
/* Handle FusionAuth event. */
router.post('/fusionauth-webhook', function(req, res, next) {
  JWTManager.revoke(req.body.event.userId, req.body.event.applicationTimeToLiveInSeconds[applicationId]);
  res.sendStatus(200);
});
```

Here is how the JWTManager maintains the list of user ids whose JWTs should be revoked. Our implementation also starts a thread to clean up after itself so we don't run out of memory.

```js
export class JWTManager {
  public static revokedJWTs: object = {};
  constructor() {}

  /**
   * Checks if a JWT is valid. This assumes that the JWT contains a property named <code>exp</code> that is a
   * NumericDate value defined in the JWT specification and a property named <code>sub</code> that is the user id the
   * JWT belongs to.
   *
   * @param {object} jwt The JWT object.
   * @returns {boolean} True if the JWT is valid, false if it isn't.
   */
  public static isValid(jwt): boolean {
    const expiration = JWTManager.revokedJWTs[jwt.sub];
    return typeof(expiration) === 'undefined' || expiration === null || expiration < jwt.exp * 1000;
  }

  /**
   * Revokes all JWTs for the user with the given id using the duration (in seconds).
   *
   * @param {string} userId The user id (usually a UUID as a string).
   * @param {Number} durationSeconds The duration of all JWTs in seconds.
   */
  public static revoke(userId: string, durationSeconds: number): void {
    JWTManager.revokedJWTs[userId] = Date.now() + (durationSeconds * 1000);
  }

  /**
   * Cleans up the cache to remove old user's that have expired.
   * @private
   */
  static _cleanUp(): void {
    const now = Date.now();
    Object.keys(JWTManager.revokedJWTs).forEach((item, index, _array) => {
      const expiration = JWTManager.revokedJWTs[item];
      if (expiration < now) {
        delete JWTManager.revokedJWTs[item];
      }
    });
  }
}

/**
 * Set an interval to clean-up the cache, call .unref() to allow the process to exit without manually calling clearInterval.
 */
setInterval(JWTManager._cleanUp, 7000).unref();
```

Our backend also needs to ensure that it checks JWTs with the `JWTManager` on each API call. This has far less impact the client than calling out to the IdP, as it is in-memory. 

```js
router.get('/todo', function(req, res, next) {
  const jwt = _parseJWT(req);
  if (!JWTManager.isValid(jwt)) {
    res.sendStatus(401);
    return;
  }

  // ...
});
```

A few final configuration steps. Again, these are specific to FusionAuth and may be different for your auth management system. First, we need to make sure that JWT revocation webhooks are enabled in the tenant.

{% include _image.liquid src="/assets/img/expert-advice/revoking-jwts/enabling-webhooks-in-tenant.png" alt="Enabling webhooks for a FusionAuth tenant." class="img-fluid" figure=false %}

And then we configure our Webhook in FusionAuth, making sure to the `jwt.refresh-token.update` event is enabled:

{% include _image.liquid src="/assets/img/expert-advice/revoking-jwts/setting-up-a-webhook.png " alt="Set up a webhook in FusionAuth." class="img-fluid" figure=false %}

We can now revoke a user's refresh token and FusionAuth will broadcast the event to our Webhook. The Webhook then updates the JWTManager which will cause JWTs for that user to be revoked.

This solution works well even in large systems with numerous backends. It requires the use of refresh tokens and an API that allows refresh tokens to be revoked. The only caveat is to be sure that your JWTManager code cleans up after itself to avoid running out of memory. Also, if you are using a distributed system with multiple servers running the Todo Backend, you could store the list of revoked JWTs in redis or another in memory datastore and have the `JWTManager` update that when a webhook arrives.

If you are using FusionAuth, you can use the Webhook and Event system to build this feature into your application quickly. We are also writing `JWTManager` implementations into each of our client libraries so you don't have to write those yourself. At the time of this writing, the Java and Typescript clients both have a `JWTManager` you can use. The other languages might have a JWTManager implementation now but if they don't, just submit a support ticket or a Github issue and we will write one for you.

{% include _advice-get-started.liquid intro="If you are looking for a solution that provides support for events and Webhooks that can be used to implement this revocation strategy, FusionAuth has you covered." %}
