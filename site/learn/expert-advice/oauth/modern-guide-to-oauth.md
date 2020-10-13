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

None of the specifications cover how OAuth is actually integrated into applications. They also don't cover the different workflows or processes that leverage OAuth. They leave almost everything up to the implementor (the person that writes the OAuth Server) and integrator (the person that integrates their application with the OAuth server). Rather than just reword the information in the specifications, let's create a vocabulary for real-world integrations and implementations of OAuth. We'll call them OAuth Modes.

There are 8 OAuth modes that are commonly used today. The OAuth modes are:

1. Local login and registration
2. Third-party service authorization
3. Third-party login and registration _(federated identity)_
4. First-party service authorization
5. First-party login and registration _(reverse federated identity)_
6. Enterprise login and registration _(federated identity)_
7. Machine-to-machine authorization
8. Device login and registration

I've included notation on a few of the items above specifying which are federated identity workflows. The reason that I've changed the names here from just "federated identity" is that each case is slightly different. Plus, the term federated identity is often overloaded and mis-understood. To help clarify terms, I'm using "login" instead. However, this is generally the same as "federated identity" in that the user's identity is stored in an OAuth server and the authentication/authorization is delegated to that server.

Let's discuss each mode in a bit more detail.

### Local login and registration

The local login and registration mode is when you are using an OAuth workflow to registration or log users into your application. In this mode, you own the OAuth server and the application. You might not have written the OAuth server, but you control it (like using a product such as FusionAuth). In fact, this mode usually feels like the user is signing up or logging directly into your application via native forms.

What do we mean by native forms? Most developers have at one time written their own login and registration forms directly into the UI of their application. They create a table called `users` and it stores the `username` and `password`. Then they write the registration and the login forms (HTML or some other UI). The registration form collects the `username` and `password` and checks if they exist in the database and inserts if it doesn't exist. The login form collects the `username` and `password` and checks if it exists in the database and logs the user in if it does. This type of implementation is what we call native forms.

The only difference with the **Local login and registration** mode is that you delegate the login and registration process to an OAuth server rather than writing everything by hand. Additionally, since you control the OAuth server and your application, it would be odd to ask the user to "authorize" your application. Therefore, this mode does not include the permission screens that we'll cover in the next few modes.

#### Examples

* https://fusionauth.io (click on the Login button in the header)
* https://santasnorthpole.com/user/login

### Third-party service authorization

The third-party service authorization mode is quite different than the **Local login and registration** mode. Here, the user is usually already logged into your application. Your application wants to use a set of APIs on behalf of or as the user. In order to use those APIs, the user has to grant your application permissions to do so. To accomplish this, your application asks the user to log into the third-party service using OAuth. During the login process, the third-party service usually shows the user a screen that asks for their permission to allow your application to make APIs on their behalf. Once the user allows this, your application will have permissions to call those APIs.

The classic example of this is authorizing an application to post on Twitter or another social network as you. Or granting access for an application to use your GMail account. Here's an example of the permission screen that Google uses:

<<IMAGE>>

While this might seem like a federated identity case, it can be argued that the user isn't identifying themselves to your application. They are simply authorizing your application to call APIs on their behalf. Therefore, I did not mark this case a federated identity case.

#### Examples

* (Buffer is a great example of this)[https://support.buffer.com/hc/en-us/articles/360038865673-Connecting-your-social-accounts-to-Buffer-Publish]
* (Zapier is another great example)[https://zapier.com/help/doc/how-get-started-facebook-pages]

### Third-party login and registration

The third-party login and registration mode are the classic "Login with ..." buttons you see in many applications. These buttons let users sign up or log into your application by logging into one of their other accounts (i.e. Facebook or Google). Here, your application sends the user over to Facebook to log in. After they log in, they are usually presented with the same permission screen from the **Third-party service authorization** mode. After they allow the permissions, they are sent back to your application and are logged in.

The key here is that the user was both logged in, but also granted your application permissions to the service (i.e. Facebook). This is why so many applications leverage the "Login with Facebook" or other social integrations. It gives them access to call the Facebook APIs on the user's behalf but also logs the user in.

**NOTE:** Social logins are the most common examples of this, but there are plenty of other third-party OAuth servers outside of social (GitHub for example).

This mode is a good example of federated identity. Here, the user's identity (username and password) is stored in the third-party system and they are using that system to registration or log into your application.

### First-party service authorization

The First-party service authorization mode is the inverse of the **Third-party service authorization** mode. This is when another application wishes to call your APIs on behalf of one of your users. Here, your application is the "third-party service" we discussed above and asks the user if they want to grant the other application specific permissions. Basically, if you are building the next Facebook and want developers to integrate with your APIs, you'll need to support this OAuth mode.

With this mode, your OAuth server might display a permission screen to the user that asks if they want to grant the third-party application permissions to your APIs. This isn't strictly required and depends on your requirements.

#### Examples



### First-party login and registration

The first-party login and registration mode is the inverse of the **Third-party login and registration** mode. This is when another application wishes to allow users to "Login with Pied Piper" (if you happen to be the author of PiedPiper net for example). They will add this button to their login form and if a user clicks it, they will be taken to your OAuth server to login. Once they login to your OAuth server, they will then be sign up or logged into the other application. From your application's perspective, this is the exact same as the **First-party service authorization** mode. We'll use these two modes interchangeably throughout the rest of this guide.

This is another example of federated identity except that a third-party application is federating to your OAuth server. That's why I marked it as "reverse federated identity".

### Enterprise login and registration

The enterprise login and registration mode is when your application allows users to sign up or log in with an enterprise identity provider. However, this mode is different than the **Third-party login and registration** mode because it does not ask for the user's permissions. Here, the enterprise identity provider likely doesn't have an API that you need to call on behalf of the user. You are simply letting them sign up for or log into your application using their corporate account.

A good example of this is when you let users login using a corporate Active Directory or an HR system. This allows your customers to manage the access controls for their employees in their corporate Active Directory instead of your application's admin UI.

This is another example of federated identity and the more traditional version of it. Here, your application is fully delegating the authentication of the user to an external system. In most cases, this requires the use of OpenID Connect in addition to basic OAuth. We'll cover that later in the guide.

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