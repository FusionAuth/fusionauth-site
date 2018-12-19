---
layout: blog-post
title: Revoking JWTs
author: Brian Pontarelli
excerpt_separator: "<!--more-->"
categories:
- Technology
- FusionAuth
tags:
- API
- Identity Management
- JWT
- JSON Web Tokens
- Webhooks
---
<p><span style="font-weight: 400;">I have been talking with developers about JSON Web Tokens (JWTs) recently and a one question keeps coming up: “How do I revoke a JWT?”</span></p>
<p>If you poke around online, you’ll find that the most common answers are:</p>
<ul>
<li style="font-weight: 400;"><span style="font-weight: 400;">Set the duration of the JWT to a short period (a few minutes)</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Implement complicated blacklisting techniques</span></li>
</ul>
<p><span style="font-weight: 400;">There is not a simple solution because JWTs are designed to be portable, decoupled, identities. Once you authenticate against an identity provider (IdP) and get back a JWT, you don’t need to ask the IdP if the JWT is valid. This is particularly powerful when you use RSA public/private key signing. The IdP signs the JWT using the private key and then any service that has the public key can verify the integrity of the JWT.</span></p>
<p><span style="font-weight: 400;">Here’s a diagram that illustrates this architecture:</span></p>
<p><a href="/blog/wp-content/uploads/2017/05/jwt-revoke_350.png"><img class="alignnone wp-image-7937 size-full" src="" alt="jwts" width="700" height="392"></a></p>
<p><span style="font-weight: 400;">The Todo Backend can use the JWT and the public key to verify the JWT and then pull the user’s id (in this case the subject) out of the JWT. The Todo Backend can then use the user’s id to perform operations on that user’s data. However, because the Todo Backend isn’t verifying the JWT with the IdP, it has no idea if an administrator has logged into the IdP and locked or deleted that user’s account.</span><!--more--></p>
<h2><span style="font-weight: 400;">Reduce the duration of the JWT</span></h2>
<p><span style="font-weight: 400;">The most common solution is to reduce the duration of the JWT and revoke the refresh token so that the user can’t generate a new JWT. With this setup, the JWT’s expiration duration is set to something short (5 or 10 minutes) and the refresh token is set to something long (2 weeks or 2 months). At any time, an administrator can revoke the refresh token which means that the user must re-authenticate to get a new JWT. That is unless they happen to have a valid JWT.</span></p>
<p><span style="font-weight: 400;">Here’s where things get tricky. That user basically has 5 to 10 minutes to use the JWT before it expires. Once it expires, they’ll use their current refresh token to try and get a new JWT. Since the refresh token has been revoked, this operation will fail and they’ll be forced to login again. </span></p>
<p><span style="font-weight: 400;">It’s this 5 to 10 minute window that freaks everyone out. So how do we fix it?</span></p>
<h2><span style="font-weight: 400;">Webhooks </span></h2>
<p><span style="font-weight: 400;">One way is leveraging a distributed event system that notifies services when refresh tokens have been revoked. The IdP broadcasts an event when a refresh token is revoked and other backends/services listen for the event. When an event is received the backends/services update a local cache that maintains a set of users whose refresh tokens have been revoked. This cache is then checked whenever a JWT is verified to determine if the JWT should be revoked or not. This is all based on the duration of JWTs and expiration instant of individual JWTs.</span></p>
<h3><span style="font-weight: 400;">FusionAuth </span></h3>
<p><span style="font-weight: 400;">To illustrate this, I’m going to use </span><a href="/products/identity-user-management"><span style="font-weight: 400;">FusionAuth</span></a><span style="font-weight: 400;">’s event and Webhook system as well as the </span><i><span style="font-weight: 400;">jwt.refresh-token.revoke</span></i><span style="font-weight: 400;"> event. If you are building your own IdP or using another system, you might need to build out your own eventing system based on this article.</span></p>
<p><span style="font-weight: 400;">The FusionAuth </span><i><span style="font-weight: 400;">jwt.refresh-token.revoke</span></i><span style="font-weight: 400;"> event look like this:</span></p>
<pre class="lang:js decode:true">{
  "event": {
    "type": "jwt.refresh-token.revoke",
    "applicationTimeToLiveInSeconds": {
      "cc0567da-68a1-45f3-b15b-5a6228bb7146": 600
    },
    "userId": "00000000-0000-0000-0000-000000000001"
  }
}</pre>
<p><span style="font-weight: 400;">Next, let’s write a simple Webhook in our application that will receive this event and update the JWTManager. (NOTE: our example has a variable called <em>applicationId</em> that is a global variable that stores the id of the application itself - in this case it would be <em>cc0567da-68a1-45f3-b15b-5a6228bb7146</em>).</span></p>
<pre class="lang:js decode:true">/* Handle FusionAuth event. */
router.post('/fusionauth-webhook', function(req, res, next) {
  JWTManager.revoke(req.body.event.userId, req.body.event.applicationTimeToLiveInSeconds[applicationId]);
  res.sendStatus(200);
});
</pre>
<p><span style="font-weight: 400;">Here is how the JWTManager maintains the list of user ids whose JWTs should be revoked. Our implementation also starts a thread to clean up after itself so we don’t run out of memory.</span></p>
<pre class="lang:js decode:true">const JWTManager = {
  revokedJWTs: {},

  /**
   * Checks if a JWT is valid. This assumes that the JWT contains a property named &lt;code&gt;exp&lt;/code&gt; that is a
   * NumericDate value defined in the JWT specification and a property named &lt;code&gt;sub&lt;/code&gt; that is the user id the
   * JWT belongs to.
   *
   * @param {object} jwt The JWT object.
   * @returns {boolean} True if the JWT is valid, false if it isn't.
   */
  isValid: function(jwt) {
    const expiration = JWTManager.revokedJWTs[jwt.sub];
    return expiration === undefined || expiration === null || expiration &lt; jwt.exp * 1000;
  },

  /**
   * Revokes all JWTs for the user with the given id using the duration (in seconds).
   *
   * @param {string} userId The user id (usually a UUID as a string).
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
    Object.keys(JWTManager.revokedJWTs).forEach((item, index, _array) =&gt; {
      const expiration = JWTManager.revokedJWTs[item];
      if (expiration &lt; now) {
        delete JWTManager.revokedJWTs[item];
      }
    });
  }
};

/**
 * Set an interval to clean-up the cache.
 */
setInterval(JWTManager._cleanUp, 7000);
</pre>
<p><span style="font-weight: 400;">Our backend also needs to ensure that it checks JWTs with the JWTManager on each API call. </span></p>
<pre class="lang:js decode:true">router.get('/todo', function(req, res, next) {
  const jwt = _parseJWT(req);
  if (!JWTManager.isValid(jwt)) {
    res.sendStatus(401);
    return;
  }

  // ...
});
</pre>
<p><span style="font-weight: 400;">And finally we configure our Webhook in FusionAuth:</span></p>
<p><a href="/blog/wp-content/uploads/2017/05/webhooks.png"><img class="alignnone size-full wp-image-7905" src="" alt="webhooks" width="1238" height="900"></a></p>
<p><span style="font-weight: 400;">We can now revoke a user’s refresh token and FusionAuth will broadcast the event to our Webhook. The Webhook then updates the JWTManager which will cause JWTs for that user to be revoked.</span></p>
<p><span style="font-weight: 400;">This solution works well even in large systems with many backends. It requires the use of refresh tokens and an API that allows refresh tokens to be revoked. The only caveat is to be sure that your JWTManager code cleans up after itself to avoid running out memory.</span></p>
<p><span style="font-weight: 400;">If you are using FusionAuth, you can use the Webhook and Event system to build this feature into your application quickly. We are also writing JWTManager implementations into each of our client libraries so you don’t have to write those yourself. At the time of this writing, the Java client had a JWTManager you can use. The other languages might have a JWTManager implementation now but if they don’t, just submit a support ticket or a Github issue and we will write one for you.</span></p>
<p>The example application built for this article is on Github here: <a href="https://github.com/FusionAuth/fusionauth-jwt-revoke-example">https://github.com/FusionAuth/fusionauth-jwt-revoke-example</a></p>
<h2>developerWorks Live Webcast</h2>
<p>If you’d rather watch a video of this tutorial, you’re in luck. Brian Pontarelli, CEO of FusionAuth, will cover how to implement a JWT revoke strategy to reduce the vulnerability window in a live coding event.</p>
<p><a href="https://zoom.us/webinar/register/5c91bf2c1088a304c5b9141539e44ee6?cm_mc_uid=98033846935014969056868&amp;cm_mc_sid_50200000=">Register in advance for this webinar.</a></p>
