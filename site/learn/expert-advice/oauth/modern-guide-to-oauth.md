---
layout: advice
title: Modern Guide to OAuth
description: No just another OAuth tutorial. This guide walks you through all of the real uses cases of OAuth in clear and simple detail.
image: advice/oauth-device-authorization-article.png
author: Brian Pontarelli
category: OAuth
date: 2020-10-06
dateModified: 2020-10-06
---

I know what you are thinking, is this really another guide to OAuth 2.0? Well, yes and no. This guide is different than most of the others out there because it covers all of the ways that we actually use OAuth. It also covers all of the details you need to be an OAuth expert without reading all the specifications and writing your own OAuth server.

If that sounds good to you, keep reading!

## OAuth overview

OAuth 2.0 is a set of specifications that allow developers to easily delegate the authentication and authorization of their users to someone else. While the specifications don't specifically cover authentication, in practice this is a core piece of OAuth, so we will cover it in depth (because that's how we roll). 

What does that mean? It means that your application sends the user over to an OAuth server, they login, and then are sent back to your application. However, there are a couple of different situations and end results of this process that we will cover in the next section.  

## OAuth modes

None of the specifications cover how OAuth is actually integrated into applications. They also don't cover the different workflows or processes that leverage OAuth. They leave almost everything up to the implementor (the person that writes the OAuth Server) and integrator (the person that integrates their application with the OAuth server). Rather than just reword the information in the specifications, let's create a vocabulary for real-world integrations and implementations of OAuth. We'll call them **OAuth modes**.

There are 8 OAuth modes that are commonly used today. The OAuth modes are:

1. Local login and registration
2. Third-party login and registration _(federated identity)_
3. First-party login and registration _(reverse federated identity)_
4. Enterprise login and registration _(federated identity)_
5. Third-party service authorization
6. First-party service authorization
7. Machine-to-machine authentication and authorization
8. Device login and registration

I've included notation on a few of the items above specifying which are federated identity workflows. The reason that I've changed the names here from just "federated identity" is that each case is slightly different. Plus, the term federated identity is often overloaded and mis-understood. To help clarify terms, I'm using "login" instead. However, this is generally the same as "federated identity" in that the user's identity is stored in an OAuth server and the authentication/authorization is delegated to that server.

Let's discuss each mode in a bit more detail.

### Local login and registration

The **Local login and registration** mode is when you are using an OAuth workflow to registration or log users into your application. In this mode, you own the OAuth server and the application. You might not have written the OAuth server, but you control it (like using a product such as FusionAuth). In fact, this mode usually feels like the user is signing up or logging directly into your application via native forms and there is no delegation at all.

What do we mean by native forms? Most developers have at one time written their own login and registration forms directly into an application. They create a table called `users` and it stores the `username` and `password`. Then they write the registration and the login forms (HTML or some other UI). The registration form collects the `username` and `password` and checks if the user exist in the database. If they don't, the application inserts the new user into the database. The login form collects the `username` and `password` and checks if it exists in the database and logs the user in if it does. This type of implementation is what we call native forms.

The only difference with the **Local login and registration** mode is that you delegate the login and registration process to an OAuth server rather than writing everything by hand. Additionally, since you control the OAuth server and your application, it would be odd to ask the user to "authorize" your application. Therefore, this mode does not include the permission screens that we'll cover in the next few modes.

So, how does this work in practice? Let's take a look at the steps for a fictitious web application called "The World's Greatest ToDo List" or "TWGTL" (pronounced Twig-Til) for short:

1. A user visits TWGTL and wants to sign up and manage their ToDos.
2. They click the "Sign Up" button on the homepage.
3. This button takes them over to the OAuth server. In fact, it takes them directly to the registration form that is part of the OAuth workflow (specifically the Authorization Code Grant which is covered later in this guide).
4. They fill out the registration form and click "Submit".
5. The OAuth server ensures this is a new user and creates their account.
6. The OAuth server redirects the browser back to TWGTL, which logs the user in.
7. The user begins using TWGTL and adds their current ToDos.
8. Later, the user comes back to TWGTL and needs to sign it in order to check of some of their ToDos. They click the `My Account` link at the top of the page.
9. This takes the user to the OAuth server's login page.
10. The user types in their username and password.
11. The OAuth server confirms their identity.
12. The OAuth redirects the browser back to TWGTL, which logs the user in.

That's it. The user feels like they are registering and logging into TWGTL directly, but in fact, TWGTL is delegating this all to the OAuth server. The user is non-the-wiser so this is why we call this mode *Local login and registration*.

<<IMAGE OR VIDEO HERE MAYBE?>> 

### Third-party login and registration

The **Third-party login and registration** mode is implemented with the classic "Login with ..." buttons you see in many applications. These buttons let users sign up or log into your application by logging into one of their other accounts (i.e. Facebook or Google). Here, your application sends the user over to Facebook to log in. In most cases, your application will need to use one or more APIs from the OAuth provider (in this case Facebook) in order to retrieve information about the user or do things on behalf of the user (for example sending a message on behalf of the user). In order to use those APIs, the user has to grant your application permissions to do so. To accomplish this, the third-party service usually shows the user a screen that asks for certain permissions. In the Facebook example, Facebook will present a screen that might ask the user to share their email with you. Once the user grants these permissions, your application can call the Facebook APIs using an access token (which we will cover in detail later in this guide). We'll refer to these screens as the "permission grant screen" throughout the rest of the guide.

Here's an example of the Facebook permission screen:

<<IMAGE>>

After the user has logged into the third-party OAuth server and granted your application permissions, they are redirect back to your application and logged into it.

The key part of this mode is that the user was both logged in, but also granted your application permissions to the service (i.e. Facebook). This is why so many applications leverage the "Login with Facebook" or other social integrations. It gives them access to call the Facebook APIs on the user's behalf but also logs the user in.

**NOTE:** Social logins are the most common examples of this, but there are plenty of other third-party OAuth servers outside of social (GitHub for example).

This mode is a good example of federated identity. Here, the user's identity (username and password) is stored in the third-party system and they are using that system to registration or log into your application.

So, how does this work in practice? Let's take a look at the steps for our TWGTL application to use Facebook to register and log users in:

1. A user visits TWGTL and wants to sign up and manage their ToDos.
2. They click the "Login with Facebook" button on the homepage.
3. This button takes them over to Facebook's OAuth server.
4. They log into Facebook (if they aren't already logged in).
5. Facebook presents the user with the permission screen based on the permissions TWGTL needs. This is done using OAuth scopes, which we will cover later in this guide.
6. Facebook redirects the browser back to TWGTL, which logs the user in. TWGTL also calls the Facebook API to retrieve the user's information.
7. The user begins using TWGTL and adds their current ToDos.
8. Later, the user comes back to TWGTL and needs to sign it in order to check of some of their ToDos. They click the `My Account` link at the top of the page.
9. This takes the user back to Facebook and they repeat the same process as above.

You might be wondering if the **Third-party login and registration** mode can work with the **Local login and registration** mode. Absolutely! This is what I like to call **Nested federated identity** (it's like a [hot pocket in a hot pocket](https://www.youtube.com/watch?v=N-i9GXbptog)). Basically, your application provides its registration and login forms by leveraging an OAuth server like FusionAuth. It also allows users to sign in with Facebook by enabling that feature of the OAuth server (FusionAuth calls this the **Facebook Identity Provider**). It's a little more complex, but the flow looks something like this:

1. A user visits TWGTL and wants to sign up and manage their ToDos.
2. They click the "Sign Up" button on the homepage.
3. This button takes them over to the OAuth server to the login page. On this page, there is an button to "Login with Facebook" and the user clicks that.
4. This button takes them over to Facebook's OAuth server.
5. They log into Facebook.
6. Facebook presents the user with the permission screen.
7. Facebook redirects the browser back to TWGTL's OAuth server, which reconciles out the user's account.
8. TWGTL's OAuth server redirects the user back to the TWGTL application.
9. The user is logged into TWGTL.

The nice part about this workflow is that TWGTL doesn't have to worry about integrating with Facebook or any other provider or reconciling the user's account. That's all handled by the OAuth server. It's also possible to delegate to additional OAuth servers and make the nesting deeper than 2 levels.

### First-party login and registration

The **First-party login and registration** mode is the inverse of the **Third-party login and registration** mode. Basically, if you happen to be Facebook in the examples above and your customer is TWGTL, you are providing the OAuth server to TWGTL. You are also providing a way for them to call your APIs on behalf of your users. This type of setup is not just reserved from the massive social networks, more and more companies are offering this service to their customers and partners. In many cases, companies are also leveraging software products to provide this feature.

### Enterprise login and registration

The **Enterprise login and registration** mode is when your application allows users to sign up or log in with an enterprise identity provider such as a corporate Active Directory. This mode is very similar to the **Third-party login and registration** mode with a few differences. First, it rarely requires the user to grant permissions to your application using the "permission grant screen". Instead, the user does not have the option to grant or restrict permissions for your application. The permissions are usually managed in the enterprise directory (Active Directory for example) or in your application directly.

Second, this mode does not apply to all users. In most cases, this mode is only available to a subset of users who exist in the enterprise directory. The rest of your users will either login directly to your application or through the **Third-party login and registration** mode. In some cases, the user's email address is used to determine how they are logged in. You might have noticed some login forms that only ask for your email on the first step like this:

<<IMAGE>>

This allows the OAuth server to determine where to send the user to login or if they should login locally.

Outside of these differences, this mode behaves the same as the **Third-party login and registration** mode. 

This is the final mode where users can register and login to your application. The remaining modes are used entirely for authorization, usually to APIs. We'll cover those next. 

### Third-party service authorization

The third-party service authorization mode is quite different than the **Third-party login and registration** mode. Here, the user is already logged into your application. The login could have been through a native form (that we discussed above) or using the **Local login and registration** mode, the **Third-party login and registration** mode, or the **Enterprise login and registration** mode. Since the user is already logged in, all they are doing is granting access for your application to call APIs with a third-party. 

For example, let's say a user has an account with TWGTL, but each time they complete a ToDo, they want to let their Twitter followers know. To accomplish this, TWGTL provides a Twitter integration that will automatically send a Tweet when the user completes a ToDo. The integration uses the Twitter APIs and those require an access token to call. In order to get an access token, the TWGTL application needs to log the user into Twitter via OAuth (technically Twitter is stuck on OAuth 1.0 but the concept is the same). 

To hook all of this up, TWGTL needs to add a button to the user's profile page that says "Connect your Twitter account". Notice it doesn't say "Login with Twitter" since the user is already logged in. Once the user clicks this button, they will be taken to Twitter's OAuth server to login and grant the necessary permissions for TWGTL to Tweet for them. 

<<IMAGE MAYBE>>

The workflow for this mode looks like this:

1. A user visits TWGTL and logs into their account.
2. They click the "My Profile" link.
3. On their account page, they click the "Connect your Twitter account" button.
4. This button takes them over to Twitter's OAuth server.
5. They log into Twitter.
6. Twitter presents the user with the permission screen and asks if TWGTL can Tweet on their behalf. The user grants TWGTL this permission.
7. Twitter redirects the browser back to TWGTL where it calls Twitter's OAuth server to get an access token.
8. TWGTL stores the access token in its database and can now call Twitter APIs.

### First-party service authorization

The First-party service authorization mode is the inverse of the **Third-party service authorization** mode. This is when another application wishes to call your APIs on behalf of one of your users. Here, your application is the "third-party service" we discussed above and asks the user if they want to grant the other application specific permissions. Basically, if you are building the next Facebook and want developers to integrate with your APIs, you'll need to support this OAuth mode.

With this mode, your OAuth server might display a permission screen to the user that asks if they want to grant the third-party application permissions to your APIs. This isn't strictly required and depends on your requirements.

### Machine-to-machine authorization

The **Machine-to-machine authorization** mode is different than the previous modes we've covered. This mode does not involve users at all. Rather, it allows an application to interact with another application. Normally, this is via backend services communicating with each other via APIs.

<<IMAGE MAYBE>> 

Here, one backend needs to be granted access to the other backend. We'll call the first backend the source and the second backend the target. To accomplish this, the source authenticates with the OAuth server. The OAuth server confirms the identity of the source and then returns a token that the source will use to call the target. This process can also include permissions that are used by the target to authorize the call the source is making.

### Device login and registration

The **Device login and registration** mode is used to login (or register) to a user's account on a device that doesn't have a rich input device like a keyboard. In this case, a user wants to connect the device to their account, usually to ensure their account is active and the device is allowed to use their account. 

A good example of this mode is setting up a streaming app on an Apple TV or Roku. In order to ensure you have a subscription to the streaming service, the app needs to verify the user's identity and connect to their account. The app on the Apple TV device displays a code and a URL and asks the user to visit the URL. The workflow for this mode is as follows:

1. The user opens the app on the device.
2. The device displays a code and a URL.
3. The user types in the URL displayed by the device on their phone or computer.
4. The user is taken to the OAuth server and asked for the code.
5. The user submits this form and is taken to the login page.
6. The user logs into the OAuth server.
7. The user is taken to a "Finished" page.
8. A few seconds later, the device is connected to the user's account.

## Grants

Now that we have covered the OAuth modes, let's dig into how these are actually implemented using the OAuth grants. OAuth grants are:

* Authorization Code Grant
* Implicit Grant
* Resource Owner's Password Grant
* Client Credentials Grant
* Device Grant

We'll cover each grant type below and discuss how it is used for each of the OAuth modes above.

### Authorization Code Grant

This is the most common OAuth grant and also the most secure. It relies on a user interacting with a browser (Chrome, Firefox, Safari, etc.) in order to handle OAuth modes 1 though 6 above. This grant requires the interaction of a user, so it isn't usable for the **Machine-to-machine authorization** mode. All of the interactive modes above are the same, except when a permission screen is displayed. Otherwise, the workflow is consistent.

<<OVERVIEW NEEDED HERE SO THEY KNOW WHAT THE AUTHORIZE ENDPOINT, AUTHORIZATION CODE, AND TOKEN ENDPOINT ARE>>

In this section we will also cover PKCE (Proof Key for Code Exchange - pronounced Pixy). PKCE is a security layer that sits on top of the authorization code grant to ensure that authorization codes can't be stolen or reused. The basics of PKCE is that the application generates a secret key (called the code verifier) and hashes it using SHA 256. This hash is one-way, so it can't be reversed by an attacker. The application then sends the hash to the OAuth server, which stores it. Later, when the application is getting tokens from the OAuth server, it will send it the secret key and the OAuth server will verify everything. This is a good protection against attackers that can intercept the authorization code, but don't have the secret key.

Let's take a look at how you implement this grant using a prebuilt OAuth server (like FusionAuth).

First, we need to add a "Login" or "My Account" link/button to our application; or if you are using one of the authorization modes from above (for example the **Third-party service authorization** mode), you'll add a "Connect to XYZ" link/button. There are two ways to connect this link/button to the OAuth server:

1. Set the `href` of the link to the full URL that starts the OAuth authorization code grant.
2. Set the `href` to a controller in the application backend that does a redirect.

Option #1 is an older integration that is often not used in practice. There are a couple of reasons for this. First, the URL is long and not all that nice looking. Second, if you are going to use any enhanced security measures like PKCE and `nonce`, you'll need to have code that generates extra pieces of data to include on the redirect. We'll cover PKCE and OpenID Connect's `nonce` parameter as we setup our application integration.

Before we dig into option #2, let's quickly take a look at how option #1 is often implemented. 
 
First, you'll need to determine the URL that starts the grant with your OAuth server as well as include all of the necessary parameters required by the specification. We'll use FusionAuth as an example, since it has a consistent URL pattern. Let's say you are running FusionAuth and it is deployed to `https://login.twgtl.com`. The URL for the OAuth authorize endpoint will also be located at:

```
https://login.twgtl.com/oauth2/authorize
```

Next, you would insert this URL with a bunch of parameters (which we will go over below) into an anchor tag like this:

```html
<a href="https://login.twgtl.com/oauth2/authorize?[a bunch of parameters here]">Login</a>
```

This anchor tag would take the user directly to the OAuth server to start the Authorization Code Grant. As we discussed above, this method is not generally used. Let's take a look at how Option #2 is implemented instead.

Rather than point the anchor tag directly at the OAuth server, we'll point it at the TWGTL backend instead. To make everything work, we need to write code that will handle the request for `/login` and redirect the browser to the OAuth server. Here's our updated anchor tag that points at the backend:

```html
<a href="https://app.twgtl.com/login">Login</a>
``` 
 
Next, we need to write the controller for `/login` in the application. Here's a simple JavaScript snippet using NodeJS that accomplishes this:

```javascript
router.get('/login', function (req, res, next) {
  res.redirect(302, `https://login.twgtl.com/oauth2/authorize?[a bunch of parameters here]`);
});
```

This code immediately redirects the browser to the OAuth server. However, the OAuth server will reject the request because it doesn't contain the required parameters to be valid. The parameters that are defined in the OAuth specifications are:

* `client_id` - this identifies the application you are logging into. In OAuth, this is referred to as the `client`. This value will be provided to you by the OAuth server.
* `redirect_uri` - this is the URL in your application that the OAuth server will redirect the user back to after they log in. This URL must be registered with the OAuth server and it must point to a controller in your app (rather than just a static page).
* `state` - technically this is optional, but it is useful for preventing various security issues. This parameter is echoed back to your application by the OAuth server. It can be anything you might need to be persisted across the OAuth workflow. If you have no other need for this parameter, I suggest setting it to a large randomly generated string.
* `response_type` - this should always be set to `code` for this grant type. This tells the OAuth server you are using the authorization code grant.
* `scope` - this is also an optional parameter, but in same of the modes from above, this will be required by the OAuth server. This parameter is a space separated list of strings. You might also need to include the `offline` scope in this list if you plan on using refresh tokens in your application (we'll cover this later in the guide as well).
* `code_challenge` - this an optional parameter, but provides support for PKCE. This is useful when there is not a backend that can handle the final steps of the Authorization Code Grant. This is known as a "public client". There aren't many cases of applications that specifically don't have backends, but if you have something like a mobile application and you aren't able to leverage a server-side backend for OAuth, you must implement PKCE to protect your application from security issues. The security issues surrounding PKCE are out of the scope of this guide, but you can find numerous articles online about them.
* `code_challenge_type` - this is an optional parameter, but if you implement PKCE, you must specify how your PKCE `code_challenge` parameter was create. It can either be `plain` or `s256`. We never recommend using anything except `s256` which uses SHA-256 secure hashing for PKCE.
* `nonce` - this is an optional parameter and is used for OpenID Connect. We don't go into much detail of OpenID Connect in this guide, but we will cover a few aspects including ID tokens and `nonce`. Basically, this `nonce` parameter will be included in the ID token that the OAuth server generates and we can verify that when we retrieve the ID token later in the guide.

Let's update our controller from above with all of these values. While we don't actually need to use PKCE for this guide, it doesn't hurt anything to add it.

```javascript
const clientId = '9b893c2a-4689-41f8-91e0-aecad306ecb6';
const redirectURI = encodeURI('https://app.twgtl.com/oauth-callback');
const scopes = encodeURIComponent('profile offline openid');

router.get('/login', function (req, res, next) {
  const state = generateAndSaveState(req, res);
  const codeChallenge = generateAndSaveCodeChallenge(req, res);
  const nonce = generateAndSaveNonce(req, res);
  res.redirect(302, 
    `https://login.twgtl.com/oauth2/authorize?` +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectURI}&` + 
    `state=${state}&` + 
    `response_type=code&` +
    `scope=${scopes}&` +
    `code_challenge=${codeChallenge}&` +
    `code_challenge_type=s256&` +
    `nonce=${nonce}`);
});
```

You'll notice that we have specified the `client_id`, which was likely provided to us by the OAuth server, the `redirect_uri`, which is part of our application, and a `scope` with the values `profile`, `offline`, and `openid` (space separated). These are all usually hardcoded values since they rarely change in practice. The other values change each time we make a request and are being generated in the controller. 

In order to properly implement the handling for the `state`, PKCE, and `nonce` handling, we need to save these values off somewhere they will be persisted across browser requests and redirects. There are two options for this:

1. Store the values in a server-side session.
2. Store the values in secure, http-only cookies (preferably encrypted).

Let's cover both of these options. First, let's write the code for each of our functions and store the values in a server-side session:

```javascript
const crypto = require('crypto');

// Helper method for Base 64 encoding that is URL safe
function base64URLEncode(str) {
  return str.toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
}

function sha256(buffer) {
  return crypto.createHash('sha256')
               .update(buffer)
               .digest();
}

function generateAndSaveState(req) {
  const state = base64URLEncode(crypto.randomBytes(64));
  req.session.oauthState = state;
  return state;
}

function generateAndSaveCodeChallenge(req) {
  const codeVerifier = base64URLEncode(crypto.randomBytes(64));
  req.session.oauthCode = codeVerifier;
  return base64URLEncode(sha256(codeVerifier));
}

function generateAndSaveNonce(req) {
  const nonce = base64URLEncode(crypto.randomBytes(64));
  req.session.oauthNonce = nonce;
  return nonce;
}
```

This code is using the `crypto` library to generate random bytes and converting those into URL safe strings. Each method is storing the values created in the session. You'll also notice that in the `generateAndSaveCodeChallenge` we are also hashing the random string using the `sha256` function. This is how PKCE is implemented such that the code verifier is saved in the session and the hashed version of it is sent as a parameter to the OAuth server.

Here's the same code (minus the require and helper methods) modified to store each of these values in secure, HTTP only cookies:

```javascript
function generateAndSaveState(req, res) {
  const state = base64URLEncode(crypto.randomBytes(64));
  res.cookie('oauth_state', state, {httpOnly: true, secure: true});
  return state;
}

function generateAndSaveCodeChallenge(req, res) {
  const codeVerifier = base64URLEncode(crypto.randomBytes(64));
  res.cookie('oauth_code_verifier', codeVerifier, {httpOnly: true, secure: true});
  return base64URLEncode(sha256(codeVerifier));
}

function generateAndSaveNonce(req, res) {
  const nonce = base64URLEncode(crypto.randomBytes(64));
  res.cookie('oauth_nonce', nonce, {httpOnly: true, secure: true});
  return nonce;
}
```

You might be wondering if it is safe to be storing these values in cookies since the cookies will be sent back to the browser. We are setting each of these cookies to `httpOnly` and `secure`. These flags ensure that no malicious code in the browser (i.e. JavaScript) can read their values. If you want to secure this even further, you can also encrypt the values like this:

```javascript
const password = 'secret-password'
const key = crypto.scryptSync(password, 'salt', 24);
const iv = Buffer.alloc(16, 0);

function encrypt(value) {
    const cipher = crypto.createCipheriv('aes-192-cbc', key, iv);
    const encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function generateAndSaveState(req, res) {
  const state = base64URLEncode(crypto.randomBytes(64));
  res.cookie('oauth_state', encrypt(state), {httpOnly: true, secure: true});
  return state;
}

function generateAndSaveCodeChallenge(req, res) {
  const codeVerifier = base64URLEncode(crypto.randomBytes(64));
  res.cookie('oauth_code_verifier', encrypt(codeVerifier), {httpOnly: true, secure: true});
  return base64URLEncode(sha256(codeVerifier));
}

function generateAndSaveNonce(req, res) {
  const nonce = base64URLEncode(crypto.randomBytes(64));
  res.cookie('oauth_nonce', encrypt(nonce), {httpOnly: true, secure: true});
  return nonce;
}
```

Encryption is generally not needed, specifically for the `state` and `nonce` parameters since those are sent as plaintext on the redirect anyways, but if you need ultimate security, this is the best way to secure these values.

At this point, the user will be taken over to the OAuth server to login (or register). Technically, the OAuth server can manage the login and registration process however it needs. In some cases, a login won't be necessary because the user will already be authenticated with the OAuth server or they can be authenticated by other means (smart cards, hardware devices, etc). 

The OAuth 2.0 specification doesn't specify anything about this process. In practice though, 99.999% of OAuth servers use a standard login page that collects the user's username and password. We'll assume that the OAuth server provides a standard login page and handles the collection of the user's credentials and verification of them.

After the user has logged in, the OAuth server redirects them back to the application. The exact location of the redirect is controlled by the `redirect_uri` parameter that we passed on the URL above. In our example, this location is `https://app.twgtl.com/oauth-callback`. When the OAuth server redirects the browser back to this location, it will add a number of parameters to the URL. These are:

* `code` - this is the authorization code that the OAuth server created after the user was logged in. You'll exchange this code for tokens.
* `state` - this is the same value of the `state` parameter we passed to the OAuth server. This is echoed back to the application so that the application can verify that the `code` came from the correct location.

OAuth servers can add additional parameters as needed, but these are the only ones defined in the specifications. A full redirect URL might look like this:

```
https://app.twgtl.com/oauth-callback?code=123456789&state=foobarbaz
```

Remember that the browser is going to make an HTTP `GET` request to this URL. In order to securely complete the OAuth authorization code grant, you should write a server-side controller that handles this URL. This will allow you to securely exchange the authorization `code` parameter for tokens. Let's look at how a controller accomplishes this.

First, we need to know the location of the OAuth servers Token Endpoint. This is an API that the OAuth server provides that will validate the authorization `code` and exchange it for tokens. We are using FusionAuth as our example OAuth server and it has a consistent location for the Token endpoint. In our example, that location will be `https://login.twgtl.com/oauth2/token`.

We will need to make an HTTP `POST` request to the Token endpoint using form encoded data values for a number of parameters. Here are the parameters we need to send to the Token endpoint:

* `code` - this is the authorization code we are exchanging for tokens.
* `client_id` - this is client id that identifies our application.
* `client_secret` - this is a secret key that is provided by the OAuth server. This should never be made public and should only ever be stored on the server.
* `code_verifier` - this is code verifier value we created above and either stored in the session or in a cookie.
* `grant_type` - this will always be the value `authorization_code` to let the OAuth server know we are sending it an authorization code.
* `redirect_uri` - this is the redirect URI that we sent to the OAuth server above.

Here's a NodeJS controller that calls the Token endpoint using these parameters. It also verifies the `state` parameter is correct along with the `nonce` that should be present in the `id_token`. It also restores the saved `codeVerifier` and passes that to the Token endpoint to complete the PKCE handling.

```javascript
const request = require('request');

const clientId = '9b893c2a-4689-41f8-91e0-aecad306ecb6';
const clientSecret = 'setec astronomy';
const redirectURI = encodeURI('https://app.twgtl.com/oauth-callback');

router.get('/oauth-callback', function (req, res, next) {
  // Verify the state
  const reqState = req.query.state;
  const state = restoreState(req, res);
  if (reqState !== state) {
    res.redirect('/', 302); // Start over
    return;
  }

  const code = req.query.code;
  const codeVerifier = restoreCodeVerifier(req, res);
  const nonce = restoreNonce(req, res);

  // POST request to Token endpoint
  request(
    {
      method: 'POST',
      uri: `https://login.twgtl.com/oauth2/token`,
      form: {
        'client_id': clientId,
        'client_secret': clientSecret,
        'code': code,
        'code_verifier': codeVerifier,
        'grant_type': 'authorization_code',
        'redirect_uri': redirectURI
      }
    },
    (error, response, body) => {
      const json = JSON.parse(body);
      const accessToken = json.access_token;
      const idToken = json.id_token;
      const refreshToken = json.refresh_token;

      // Verify the nonce
      if (idToken !== null && idToken.nonce !== nonce) {
        res.redirect('/', 302); // Start over
        return;
      }

      // Write the tokens as cookies
      res.cookie('access_token', accessToken, {httpOnly: true, secure: true});
      res.cookie('id_token', idToken); // Not httpOnly or secure
      res.cookie('refresh_token', refreshToken, {httpOnly: true, secure: true});

      // Redirect to the To-do list
      res.redirect('/todos', 302);
    }
  );
});
```



### Implicit Grant

Before diving into each grant type, let's quickly cover the Implicit Grant. We will not be discussing this grant in detail in this guide. It is now recommended that no one implement this grant type because it is highly insecure and error-prone. Let's quickly examine why this grant is being deprecated.

Unlike the Authorization Code Grant, the Implicit Grant does not redirect the browser back to your application backend with an Authorization Code. Instead, it puts the OAuth token directly on the URL as part of the redirect. These URLS look like this:

`https://my-app.com/#token-goes-here`

The token is added to the redirect URL after the `#` symbol, which means it is technically the location portion of the URL.