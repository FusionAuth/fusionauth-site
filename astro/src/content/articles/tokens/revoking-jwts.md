---
title: How to Manage JWT Expiration and Revoke JWTs | FusionAuth
description: Understand how to manage JWT expiration and revoke JWTs effectively to maintain secure user sessions and prevent unauthorized access in your application.
author: Brian Pontarelli
icon: /img/icons/revoking-jwts.svg
darkIcon: /img/icons/revoking-jwts-dark.svg
section: Tokens
---

I have been talking with developers about JSON Web Tokens (JWTs) recently and one question keeps coming up: "How do I revoke a JWT?"

If you poke around online, you'll find that the most common answers are:

- Set the duration of the JWT to a short period (a few minutes or seconds)
- Implement complicated blacklisting techniques
- Store every JWT so you can validate them

There is not a simple solution because JWTs are designed to be portable, decoupled identities. Once you authenticate against an identity provider (IdP) and get back a JWT, you don't need to ask the IdP if the JWT is valid. This is particularly powerful when you use RSA public/private key signing. The IdP signs the JWT using the private key and then any service that has the public key can verify the integrity of the JWT.

Here's a diagram that illustrates this architecture:

<div class="flex justify-center p-4 w-full">
<img src="/img/articles/revoking-jwts/jwt-revoke_350.png" alt="Revoking JWTs"/>
</div>

The ToDo Backend in the diagram can use the JWT and the public key to verify the JWT and then pull the user's Id (in this case the subject) out of the JWT. The ToDo Backend can then use the user's Id to perform operations on that user's data. However, because the ToDo Backend isn't verifying the JWT with the IdP, it has no idea if an administrator has logged into the IdP and locked or deleted that user's account.

## Reduce the duration of the JWT

The most common solution is to reduce the duration of the JWT and revoke the refresh token so that the user can't generate a new JWT. With this setup, the JWT's expiration duration is set to something short (5-10 minutes) and the refresh token is set to something long (2 weeks or 2 months). At any time, an administrator can revoke the refresh token which means that the user must re-authenticate to get a new JWT. That is unless they happen to have a valid JWT.

[![A call to action image displaying a link to download an ebook on this topic.](/img/cta/jwt-guide-cta.png 'Download this article as an ebook')](/ebooks/breaking-down-json-web-tokens?utm_medium=cta&utm_source=articles&utm_campaign=jwt_ebook)

Here's where things get tricky. That user basically has 5 to 10 minutes to use the JWT before it expires. Once it expires, they'll use their current refresh token to try and get a new JWT. Since the refresh token has been revoked, this operation will fail and they'll be forced to login again.

It's this 5 to 10 minute window that freaks everyone out. So, how do we fix it?

## Webhooks

One way is leveraging a distributed event system that notifies services when refresh tokens have been revoked. The IdP broadcasts an event when a refresh token is revoked and other backends/services listen for the event. When an event is received the backends/services update a local cache that maintains a set of users whose refresh tokens have been revoked. This cache is checked whenever a JWT is verified to determine if the JWT should be revoked or not. This is all based on the duration of JWTs and expiration instant of individual JWTs.

### Example: Revoking JWTs in FusionAuth

To illustrate this, I'm going to use [FusionAuth](/)'s event and Webhook system as well as the *jwt.refresh-token.revoke* event. If you are building your own IdP or using another system, you might need to build out your own eventing system based on this article.

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

Next, let's write a simple Webhook in our application that will receive this event and update the JWTManager. (NOTE: our example has a variable called `applicationId` that is a global variable that stores the Id of the application itself - in this case it would be **cc0567da-68a1-45f3-b15b-5a6228bb7146**). Our code below is written in Node.js and uses the [FusionAuth Node client library](https://github.com/FusionAuth/fusionauth-node-client).

```js
/* Handle FusionAuth event. */
router.post('/fusionauth-webhook', function(req, res, next) {
  JWTManager.revoke(req.body.event.userId, req.body.event.applicationTimeToLiveInSeconds[applicationId]);
  res.sendStatus(200);
});
```

Here is how the JWTManager maintains the list of user Ids whose JWTs should be revoked. Our implementation also starts a thread to clean up after itself so we don't run out of memory.

```js
const JWTManager = {
  revokedJWTs: {},

  /**
   * Checks if a JWT is valid. This assumes that the JWT contains a property named <code>exp</code> that is a
   * NumericDate value defined in the JWT specification and a property named <code>sub</code> that is the user Id the
   * JWT belongs to.
   *
   * @param {object} jwt The JWT object.
   * @returns {boolean} True if the JWT is valid, false if it isn't.
   */
  isValid: function(jwt) {
    const expiration = JWTManager.revokedJWTs[jwt.sub];
    return expiration === undefined || expiration === null || expiration < jwt.exp * 1000;
  },

  /**
   * Revokes all JWTs for the user with the given Id using the duration (in seconds).
   *
   * @param {string} userId The user Id (usually a UUID as a string).
   * @param {Number} durationSeconds The duration of all JWTs in seconds.
   */
  revoke: function(userId, durationSeconds) {
    JWTManager.revokedJWTs[userId] = Date.now() + (durationSeconds * 1000);
  },

  /**
   * Cleans up the cache to remove old user's that have expired.
   * @private
   */
  _cleanUp: function() {
    const now = Date.now();
    Object.keys(JWTManager.revokedJWTs).forEach((item, index, _array) => {
      const expiration = JWTManager.revokedJWTs[item];
      if (expiration < now) {
        delete JWTManager.revokedJWTs[item];
      }
    });
  }
};

/**
 * Set an interval to clean-up the cache.
 */
setInterval(JWTManager._cleanUp, 7000);
```

Our backend also needs to ensure that it checks JWTs with the JWTManager on each API call.

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
And finally we configure our Webhook in FusionAuth:

![Set up a webhook in FusionAuth](/img/articles/revoking-jwts/webhooks.png)

We can now revoke a user's refresh token and FusionAuth will broadcast the event to our Webhook. The Webhook then updates the JWTManager which will cause JWTs for that user to be revoked.

This solution works well even in large systems with numerous backends. It requires the use of refresh tokens and an API that allows refresh tokens to be revoked. The only caveat is to be sure that your JWTManager code cleans up after itself to avoid running out memory.

If you are using FusionAuth, you can use the Webhook and Event system to build this feature into your application quickly. We are also writing JWTManager implementations into each of our client libraries so you don't have to write those yourself. At the time of this writing, the Java and Node clients both have a JWTManager you can use. The other languages might have a JWTManager implementation now but if they don't, just submit a support ticket or a GitHub issue and we will write one for you.

