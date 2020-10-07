---
layout: advice
title: Definitive Guide to OAuth
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

There are 7 OAuth modes that are commonly used today. The OAuth modes are:

* Local login
* Third-party service authorization
* Third-party login __(federated identity)__
* First-party service authorization
* First-party login __(reverse federated identity)__
* Enterprise login __(federated identity)__
* Machine-to-machine authorization

I've included notation on a few of the items above specifying which are federated identity workflows. The reason that I've changed the names here from just "federated identity" is that each case is slightly different. Plus, the term federated identity is often overloaded and mis-understood. To help clarify terms, I'm using "login" instead. However, this is generally the same as "federated identity" in that the user's identity is stored in an OAuth server and the authentication/authorization is delegated to that server.

Let's discuss each mode in a bit more detail.

### Local login

The local login mode is when you are using an OAuth workflow to log users into your application. In this mode, you own the OAuth server and the application. You might not have written the OAuth server, but you control it (like using a product such as FusionAuth). In fact, this mode usually feels like the user is logging directly into your application via a native login form.

What do we mean by a native login form? Most developers have at one time written their own login form directly into the UI of their application. They create a table called `users` and it stores the `username` and `password`. Then they write a form (HTML or some other UI) that collects the `username` and `password` and checks if they exist in the database. This type of implementation is what we call a native login form.

The only difference with the **Local login** mode is that you delegate the login to an OAuth server rather than writing everything by hand. Additionally, since you control the OAuth server and your application, it would be odd to ask the user to "authorize" your application. Therefore, this mode does not include the permission screens that we'll cover in the next few modes.

### Third-party service authorization

The third-party service authorization mode is quite different than the **Local login** mode. Here, the user is usually already logged into your application. Your application wants to use a set of APIs on behalf of or as the user. In order to use those APIs, the user has to grant your application permissions to do so. To accomplish this, your application asks the user to log into the third-party service using OAuth. During the login process, the third-party service usually shows the user a screen that asks for their permission to allow your application to make APIs on their behalf. Once the user allows this, your application will have permissions to call those APIs.

The classic example of this is authorizing an application to post on Twitter or another social network as you. Or granting access for an application to use your GMail account. Here's an example of the permission screen that Google uses:

<<IMAGE>>

While this might seem like a federated identity case, it can be argued that the user isn't identifying themselves to your application. They are simply authorizing your application to call APIs on their behalf. Therefore, I did not mark this case a federated identity case.

### Third-party login

The third-party login mode is the classic "Login with ..." buttons you see in many applications. These buttons let users sign up or log into your application by logging into one of their other accounts (i.e. Facebook or Google). Here, your application sends the user over to Facebook to log in. After they log in, they are usually presented with the same permission screen from the **Third-party service authorization** mode. After they allow the permissions, they are sent back to your application and are logged in.

The key here is that the user was both logged in, but also granted your application permissions to the service (i.e. Facebook). This is why so many applications leverage the "Login with Facebook" or other services integration. It gives them access to call the Facebook APIs on the user's behalf but also logs the user in.

This mode is a good example of federated identity. Here, the user's identity (username and password) is stored in the third-party system and they are using that system to sign-up or log into your application. 

### First-party service authorization

The First-party service authorization mode is the inverse of the **First-party service authorization** mode. This is when another application wishes to call your APIs on behalf of one of your users. Here, your application is the "third-party service" we discussed above and asks the user if they want to grant the other application specific permissions. Basically, your application provides an OAuth workflow exactly like Facebook and Google do.

### First-party login

The first-party login mode is the inverse of the **Third-party login** mode. This is when another application wishes to allow users to "Login with your application". They will add this button to their login form and if a user clicks it, they will be taken to your OAuth server to login. Once they login to your OAuth server, they will then be sign up or logged into the other application. From your application's perspective, this is the exact same as the **First-party service authorization** mode. We'll use these two modes interchangeably throughout the rest of this guide.

This is another example of federated identity except that a third-party application is federating to your OAuth server. That's why I marked it as "reverse federated identity".

### Enterprise login

The enterprise login mode is when your application allows users to sign up or log in with an enterprise identity provider. However, this mode is different than the **Third-party login** mode because it does not ask for the user's permissions. Here, the enterprise identity provider likely doesn't have an API that you need to call on behalf of the user. You are simply letting them sign up for or log into your application using their account in the third-party system.

A good example of this is when you let users login using a corporate Active Directory or Okta system. This allows your customers to manage the access controls for their employees in their corporate Active Directory instead of your application's admin UI.

This is another example of federated identity and the more traditional version of it. Here, your application is fully delegating the authentication of the user to an external system. In most cases, this requires the use of OpenID Connect in addition to basic OAuth. We'll cover that later in the guide.

### Machine-to-machine authorization

The machine-to-machine authorization mode is different than the previous modes we've covered. This mode does not involve users at all. Rather, it allows an application to interact with another application. Normally, this is via backend services communicating with each out via APIs. Here, one backend needs to be granted access to the other backend. We'll call the first backend the source and the second backend the target. To accomplish this, the source backend authenticates with the OAuth server. The OAuth server proves the identity of the source backend and then returns a token that the source backend will use to call the target backend. This process can also include permissions that are used by the target backend to authorize the source backend. 

## Grants

Now that we have covered the OAuth modes, let's dig into how these are actually implemented using the OAuth grants. OAuth grants are:

* Authorization Code Grant
* Implicit Grant
* Resource Owner's Password Grant
* Client Credentials Grant

We'll cover each grant type below and discuss how it is used for each of the OAuth modes above.

### Authorization Code Grant

This is the most common OAuth grant and also the most secure. It relies on a user interacting with a browser (Chrome, Firefox, Safari, etc.) in order to sign up and/or login to your application.

### Implicit Grant

Before diving into each grant type, let's quickly cover the Implicit Grant. We will not be discussing this grant in detail in this guide. It is now recommended that no one implement this grant type because it is highly insecure and error-prone. 