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

#### Examples

Here are a few examples of web applications that use this mode:

* https://fusionauth.io (click on the Login button in the header)
* TODO Add more here

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

You might be wondering if the **Third-party login and registration** mode can work with the **Local login and registration** mode. Absolutely! This is what I like to call **Nested federated identity** (it's like a [https://www.youtube.com/watch?v=N-i9GXbptog](hot pocket in a hot pocket)). Basically, your application provides its registration and login forms by leveraging an OAuth server like FusionAuth. It also allows users to sign in with Facebook by enabling that feature of the OAuth server (FusionAuth calls this the **Facebook Identity Provider**). It's a little more complex, but the flow looks something like this:

1. A user visits TWGTL and wants to sign up and manage their ToDos.
2. They click the "Sign Up" button on the homepage.
3. This button takes them over to the OAuth server to the login page. On this page, there is an button to "Login with Facebook" and the user clicks that.
4. This button takes them over to Facebook's OAuth server.
5. They log into Facebook.
6. Facebook presents the user with the permission screen based.
7. Facebook redirects the browser back to TWGTL's OAuth server, which reconciles out the user's account.
8. TWGTL's OAuth server redirects the user back to the TWGTL application.
9. The user is logged into TWGTL.

The nice part about this workflow is that TWGTL doesn't have to worry about integrating with Facebook or any other provider or reconciling the user's account. That's all handled by the OAuth server. It's also possible to delegate to additional OAuth servers and make the nesting deeper than 2 levels.

### First-party login and registration

The **First-party login and registration** mode is the inverse of the **Third-party login and registration** mode. Basically, if you happen to be Facebook in the examples above and your customer is TWGTL, you are providing the OAuth server to TWGTL. You are also providing a way for them to call your APIs on behalf of your users. This type of setup is not just reserved from the massive social networks, more and more companies are offering this service to their customers and partners. In many cases, companies are also leveraging software products to provide this feature.

### Enterprise login and registration

The **Enterprise login and registration** mode is when your application allows users to sign up or log in with an enterprise identity provider such as a corporate Active Directory. This mode is very similar to the **Third-party login and registration** mode with a few differences. First, it rarely requires the user to grant permissions to your application using the "permission grant screen". Instead, the user does not have the option to grant or restrict permissions for your application. The permissions are usually managed in the enterprise directory (Active Directory for example) or in your application directly.

Second, this mode does not apply to all users. In most cases, this mode is only available to a subset of users who exist in the enterprise directory. The rest of your users will either login directly to your application or through the **Third-party login and registration** mode.

Outside of these differences, this mode behaves the same as the **Third-party login and registration** mode. 

This is the final mode where users can register and login to your application. The remaining modes are used entirely for authorization, usually to APIs. We'll cover those next. 

### Third-party service authorization

The third-party service authorization mode is quite different than the **Third-party login and registration** mode. Here, the user is already logged into your application. The login could have been through a native form (that we discussed above) or using the **Local login and registration** mode, the **Third-party login and registration** mode, or the **Enterprise login and registartion** mode. Since the user is already logged in, all they are doing is granting access for your application to call APIs with a third-party. 

For example, let's say a user has an account with TWGTL, but each time they complete a ToDo, they want to let their Twitter followers know. To accomplish this, TWGTL provides a Twitter integration that will automatically send a Tweet when the user completes the ToDo. The integration uses the Twitter APIs and those require an access token to call. In order to get an access token, the TWGTL application needs to log the user into Twitter via OAuth (technically Twitter is stuck on OAuth 1.0 but the concept is the same). 

To hook all of this up, TWGTL needs to add a button to the user's profile page that says "Connect to Twitter". Notice it doesn't say "Login with Twitter" since the user is already logged in. Once the user clicks this button, they will be take to Twitter's OAuth server to login and grant the necessary permissions for TWGTL to Tweet for them. The workflow looks like this:














#### Examples

* (Buffer is a great example of this)[https://support.buffer.com/hc/en-us/articles/360038865673-Connecting-your-social-accounts-to-Buffer-Publish]
* (Zapier is another great example)[https://zapier.com/help/doc/how-get-started-facebook-pages]

### First-party service authorization

The First-party service authorization mode is the inverse of the **Third-party service authorization** mode. This is when another application wishes to call your APIs on behalf of one of your users. Here, your application is the "third-party service" we discussed above and asks the user if they want to grant the other application specific permissions. Basically, if you are building the next Facebook and want developers to integrate with your APIs, you'll need to support this OAuth mode.

With this mode, your OAuth server might display a permission screen to the user that asks if they want to grant the third-party application permissions to your APIs. This isn't strictly required and depends on your requirements.

#### Examples



### Machine-to-machine authorization

The machine-to-machine authorization mode is different than the previous modes we've covered. This mode does not involve users at all. Rather, it allows an application to interact with another application. Normally, this is via backend services communicating with each other via APIs. Here, one backend needs to be granted access to the other backend. We'll call the first backend the source and the second backend the target. To accomplish this, the source authenticates with the OAuth server. The OAuth server proves the identity of the source and then returns a token that the source will use to call the target. This process can also include permissions that are used by the target to authorize the call the source is making. 

### Device login and registration

WRITE ME


## Grants

Now that we have covered the OAuth modes, let's dig into how these are actually implemented using the OAuth grants. OAuth grants are:

* Authorization Code Grant
* Implicit Grant
* Resource Owner's Password Grant
* Client Credentials Grant
* Device Grant

We'll cover each grant type below and discuss how it is used for each of the OAuth modes above.

### Authorization Code Grant

This is the most common OAuth grant and also the most secure. It relies on a user interacting with a browser (Chrome, Firefox, Safari, etc.) in order to handle OAuth modes 1 though 6 above. This grant requires the interaction of a user, so it isn't usable for the machine-to-machine authorization mode. All of the other modes fit well into this grant type but have slightly different steps. First, let's look at the steps that are the same between all of the OAuth modes:

1. The user's browser, which might be embedded in a mobile or desktop application, takes the user to the OAuth server. This location is called the Authorize endpoint.
2. The user might registration or log in, depending the OAuth mode and requirements.
3. Once the user is signed up or logged in, the OAuth server redirects back to your application. This redirect contains an `Authorization Code` as a URL parameter and is called the `redirect_uri`.
4. The browser performs a request to your application backend based on the `redirect_uri` (including the `Authorization Code`).
5. Your application backend calls the OAuth server to exchange the `Authorization Code` for tokens. This location is call the Token endpoint.

Here is a diagram that illustrates this workflow visually:

{% plantuml source: _diagrams/learn/expert-advice/oauth/modern-oauth-authorization-code-grant-common.plantuml, alt: "Diagram of the OAuth Authorization Code flow." %}

These are the common components of all of the OAuth modes. The differences between the modes exist before step 1, after step 6, or between step 2 and 3. Let's go over each mode and how the steps differ.

#### Local login and registration

This mode requires that the user initially opens your application and needs to login (or registration) before they can use specific features. For example, if you are working on an ecommerce web application, users might need to create accounts and log in before they are allowed to make purchases. This process can be handled using the workflow above, with a few additional steps before and after. Here are the additional steps:

1. The user opens your app.
2. The user either clicks the login or register button, or navigates to a location that requires them to be logged in to access.
3. **COMMON STEPS FROM ABOVE**
4. Your application backend stores the tokens from the OAuth server in a session or in the browser.
5. Your application backend redirects the user back to a location that allows them to continue to use the features of your app.

These additional steps should feel very natural to all users since it is how we use most applications. We most log into them before we can use them. Here is our diagram with the new steps.

{% plantuml source: _diagrams/learn/expert-advice/oauth/modern-oauth-authorization-code-grant-local.plantuml, alt: "Diagram of the OAuth Authorization Code flow for local login and registration." %}

#### Third-party service authorization

This mode requires that the user is already logged into your application and is connecting another account. A good way to handle the initial login is using the **Local login and registration** mode. Once the user is logged in, they might click a button or a link that says "Connect your Facebook account". This link/button kicks off the OAuth process. Taking these extra items into account, here are the additional steps for this OAuth mode.

1. The user clicks on their account settings in your application.
3. The user clicks the "Connect ..." button to allow your application to call APIs of the third-party on their behalf.
4. **COMMON STEPS 1-2 FROM ABOVE**
5. The OAuth server displays a permission screen that asks if the user wishes to grant your application specific permissions.
6. The user accepts (or rejects) the permission grants.
7. **COMMON STEPS 3-5 FROM ABOVE** 
5. Your application backend stores the tokens from the OAuth server on the user's profile. These can be used at any time to make API calls to the third-party. For example, you might use the user's GMail account to send reports via email each night. 
6. Your application backend redirects the user back to their account, showing the connection to the third-party is active.

As you can see, there are quite a few differences between this mode and the **Local login and registration** mode. Not only are there additional steps before and after the common steps, but also a couple of additional steps in the middle. The reason for this is that the your application is asking for permissions to a third-party. Therefore, it is common that the third-party OAuth server confirms that the user is okay granting them. Similarly, your application backend needs to store the tokens from the third-party OAuth server somewhere they will be persistent.

Here's another diagram that illustrates this workflow:

{% plantuml source: _diagrams/learn/expert-advice/oauth/modern-oauth-authorization-code-grant-third-party.plantuml, alt: "Diagram of the OAuth Authorization Code flow authorizing a third-party." %}

#### Third-party login and registration

WRITE ME

### Implicit Grant

Before diving into each grant type, let's quickly cover the Implicit Grant. We will not be discussing this grant in detail in this guide. It is now recommended that no one implement this grant type because it is highly insecure and error-prone. Let's quickly examine why this grant is being deprecated.

Unlike the Authorization Code Grant, the Implicit Grant does not redirect the browser back to your application backend with an Authorization Code. Instead, it puts the OAuth token directly on the URL as part of the redirect. These URLS look like this:

`https://my-app.com/#token-goes-here`

The token is added to the redirect URL after the `#` symbol, which means it is technically the location portion of the URL.