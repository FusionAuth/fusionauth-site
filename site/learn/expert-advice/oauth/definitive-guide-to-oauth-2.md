---
layout: advice
title: The Definitive Guide to OAuth version 2.0
description: This article is a detailed overview of the OAuth 2 protocol and how it is implemented and used.
image: advice/everything-about-oauth.png
author: Matt Boisseau
header_dark: true
category: OAuth
---

<!-- links -->
[CORS]:					https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
[5-Minute Setup Guide]:	https://fusionauth.io/docs/v1/tech/5-minute-setup-guide
[RFC6749]:				https://tools.ietf.org/html/rfc6749
<!-- images -->
[placeholder]:			../assets/img/troopers-404.png
<!--TODO: for each grant type how-to, incl. numbered diagram to correspond with numbered steps-->

What is OAuth? For that matter, what is authorization? Do you need it? How do you use it?

Everything you wanted to know about OAuth is in one convenient location: **right here**.
Start with the basics or jump right to the info you need.

<!-- TOC depthto:2 -->

- [1. The Basics](#1-the-basics)
	- [1.1. What is OAuth?](#11-what-is-oauth)
	- [1.2. How Does OAuth Work?](#12-how-does-oauth-work)
	- [1.3. How Do I Use OAuth?](#13-how-do-i-use-oauth)
- [2. Your App](#2-your-app)
	- [2.1. Can Your App Keep a Secret?](#21-can-your-app-keep-a-secret)
	- [2.2. How Do Users Interact With Your App?](#22-how-do-users-interact-with-your-app)
- [3. Choosing an OAuth Flow](#3-choosing-an-oauth-flow)
	- [3.1. Code Flow](#31-code-flow)
	- [3.2. Code Flow + PKCE](#32-code-flow--pkce)
	- [3.3. Device Flow](#33-device-flow)
	- [3.4. Client Credentials Flow](#34-client-credentials-flow)
	- [3.5. User Credentials Flow](#35-user-credentials-flow)
	- [3.6. Implicit Flow](#36-implicit-flow)
- [4. Authentication in OAuth](#4-authentication-in-oauth)
	- [4.1. OpenID Connect](#41-openid-connect)
- [5. Implementing OAuth Flows Step-by-Step](#5-implementing-oauth-flows-step-by-step)
	- [5.1. Code Flow](#51-code-flow)
	- [5.2. Code Flow + PKCE](#52-code-flow--pkce)
	- [5.3. Device Flow](#53-device-flow)
	- [5.4. Client Credentials Flow](#54-client-credentials-flow)
	- [5.5. User Credentials Flow](#55-user-credentials-flow)
	- [5.6. Implicit Flow](#56-implicit-flow)
- [6. Using Access Tokens](#6-using-access-tokens)
	- [6.1. Opaque Tokens](#61-opaque-tokens)
	- [6.2. JWTs](#62-jwts)
- [7. OAuth Jargon Glossary](#7-oauth-jargon-glossary)

<!-- /TOC -->

# 1. The Basics

**COMMENT (BP): Let's avoid empty sections like this**

## 1.1. What is OAuth?

**COMMENT (BP): Make your voice more personal. Here's an example:**
```
Before we dig into the details about OAuth, let's break down the name OAuth into it's pieces
and describe each one:
```

**OAuth** is an **O**pen standard for **Auth**orization.

**Authorization** is the act of granting permission.
When an app wants to use your data (location, photos, documents, etc.), it has to ask for permission.
You can choose whether or not to authorize the app, usually by clicking on `Allow` or `Decline`.

**Standard**s are not hard restrictions or specific implementations.
A standard is basically the set of rules that the industry has agreed is best.

**Open** means that the standard is publicly available and open for modification.
You can read the OAuth 2.0 specification [here][RFC6749].
The specification defines what OAuth is and how it is implemented and used (along with a healthy ecosystem of recommended tweaks).

**COMMENT (BP): Technically this partially correct. OAuth is a set of guidelines for how an application can ask ask a user for permission to various things like their data, resources or to take actions on their behalf. This permission is granted by the user through an authorization server. That server might be an identity provider or some other system that is the authoritative source of truth for that user**

So, what is OAuth?
It's an ever-evolving set of guidelines for creating apps that can request permission from users.

## 1.2. How Does OAuth Work?

Imagine a fictional compression app, named Pied Piper, wants to let users compress their files in Google Drive.

Before OAuth, a common "solution" was for Pied Piper to collect each user's Google username and password.
Pied Piper could then log into Google Drive *as the users*, and grab the files to compress. And it doesn't stop there.
If Pied Piper wanted to later compress more files when the user was asleep, it would need to store the user's Google username and password somewhere
so that it could use it later. The username and password would have to be stored in plain-text in order for Pied Piper to use it in the future.
If your first thought is, "I don't want to give my Google password to random apps," and your second thought is, "they are storing my username and password
in plain text," then you already understand why OAuth is a huge improvement.

With OAuth, Pied Piper can ask a trusted OAuth provider to get permission from the user to access their resources (i.e. files in their Google Drive).

**COMMENT (BP): You mentioned FusionAuth in this section, but I think it is going to be really confusing. Let's mention FusionAuth later and use Google here**

Here's the OAuth process of the user granting permissions to Pied Piper in a bit more detail:

**COMMENT (BP): Diagram needed??**

1. **Pied Piper registers with Google.**

	Most apps don't handle their own authorization; they use an OAuth provider, like Google.
	OAuth providers have put in a lot of work to make this easy for you (**COMMENT (BP): who is "you" in this case? Should this be "developers"**.
	Users' trust in your OAuth provider is trust you don't have to establish on your own.

1. **Pied Piper asks Google to get consent from the user.**

    **COMMENT (BP): FusionAuth doesn't have pop-ups and most providers are moving away from them. I might talk about directing them to the OAuth Providers UI. From there, they might need to login, but they might also be already logged in. After they authenticate, they are asked for permission**
    
	When the app wants to access a user's data, it needs to ask for permission.
	The app redirects the user to its OAuth provider; this takes the familiar form of a popup asking the user to click "Allow."
	If the user does click "Allow", the OAuth provider gives the app a **Grant**, which is a receipt for the user's consent.

1. **Pied Piper "logs in" with Google** **COMMENT (BP): I'd avoid using "logs in" here**

	The app needs to prove that it got consent and that it is who it says it is.
	The app presents the **Grant** to the OAuth provider, as well as its **Secret**.
	If everything looks good to the OAuth provider, the app receives an **Access Token**, which is a ticket that allows the app into specific parts of the user's data for a specific amount of time.

1. **Pied Piper makes an API call to Google Drive.**

	The user's data is accessible via a resource server, which is a locked API; the app needs a ticket to get in.
	When the app makes an API call, it also sends the **Access Token**; the resource server can verify the token's authenticity with the same OAuth provider that issued it.
	If the **Access Token** is legit and hasn't expired, the resource server will send back the data requested in the API call.

This workflow is a standard way for applications to integrate with third-party OAuth providers like Google. Usually this is necessary if the application wants
to call APIs of the third-party as the user. Our example calls the Google Drive API as the user in order to access the user's files. However, it could also be that the OAuth provider is not a
third-party, but is just a part of the application (like a separate microservice). This case uses the same workflow, but the last step is not used. Instead, the
**Access Token** is used by the application to call its own APIs.

**COMMENT (BP): Do we need a diagram of the "Local OAuth Provider" to distinguish it from the "Third-Party Provider"? Or perhaps we break this into 2 sections. One for third-party OAuth and one for local OAuth. Then we could describe the local one in more detail.**

## 1.3. How Do I Use OAuth?

If you're here, it's likely that you're interested in using OAuth in your own app.
If you want to get up and running ASAP, check out FusionAuth's [5-Minute Setup Guide].

We'll assume that you are interested in leveraging OAuth to log users into your application and the OAuth provider will be a local identity provider. 
That is to say that the identity provider is used mainly for authentication rather than the Google example from above where the application wanted access to Google APIs as well. 
When setting up a local OAuth provider and integrating your application with it, the steps are as follows:

<!-- BG- Should all endpoints used below be defined in this section? userinfo, device authorize, introspect are not. do endpoints need to be clarified?-->
<!-- MB	2020-02-14 Good point. I don't think this is the right section, but we're missing that info in general.-->

<!-- BG- Do we need to say that anyone can set up an OAuth provider to verify their own users? It's not a central id for the world, just an app or set of apps that verify against it.-->
<!-- MB	2020-02-14 Our target audience for this article is those who will be using a provider. I personally think it's less confusing to just say "pick a provider," but I'm open to more discussion on the topic.-->

1. **Registration.**

	After you pick an OAuth provider (like FusionAuth) and install it, you'll need to configure the OAuth settings. Each OAuth provider is different, but 
	the end result is you'll they'll ask for some basic details about your app.

	You'll get two important pieces of identification: a `client_id` and `client_secret`.
	These are basically your app's username and password.

	You'll also pick a `redirect_uri`; the next step takes users away from your app, so your OAuth provider needs to know how to get them back.

1. **Authorization.**

	When your app needs a user's data, it will need to ask for permission..
	Redirect the user to your OAuth provider's `authorize` endpoint.
	Your OAuth provider will authenticate the user and ask them to click `Allow` or `Deny`.

	Assuming they click on `Allow`, the user will be redirected back to your app (via your `redirect_uri`).
	Your OAuth provider will also send you a `code`.

1. **Code Exchange.**

	A `code` can be exchanged for an `access_token`.
	Make a POST request to your OAuth provider's `token` endpoint.
	This is where your `client_secret` comes in; your OAuth provider will use this to authenticate your app.

	Now that both the app and user have proven their identities and agreed on sharing data, your OAuth provider will send you an `access_token`.

1. **API Request.**

	The only reason you didn't go straight to making API requests for the user's data is because the API wants an `access_token.`
	Now that you have one, you can request away.

	When you send an `access_token` to the API, it can in turn send it to your OAuth provider for verification: "is this legit?"
	Once the API is satisfied, it will send you the user's data.

As you read on, refer back to these steps.
This is the skeleton of OAuth; some approaches (or "flows") will add layers on top or remove some bones, but it's always ultimately OAuth underneath.

# 2. Your App

There's more than one way to implement OAuth.
The way described in the previous section is the most common: **Code Flow**.

Before you dive in, you should figure out a few things about your app's restrictions and requirements; maybe one of the other flows is a better fit.

## 2.1. Can Your App Keep a Secret?

### 2.1.1. Server-Based Apps

Server-based apps are also known as "confidential clients," because they can keep a `client_secret` confidential.
Typically, this means they run on a server, with only the UI running on users' computers.

In practice, this means that, in order to use a `client_secret`, any requests to your Oauth provider's `token` endpoint must come from the server your app is installed on.

### 2.1.2. Client-Based Apps

Client-based apps are also known as "public clients," because they are installed or downloaded wholesale onto users' computers, which means the `client_secret` is installed or downloaded onto users' computers.
Info stored on users' computers is considered "public."
If the `client_secret` is public, even temporarily, it can be copied and used to impersonate your app.

In practice, this means that you'll need to use an alternative method for authenticating your app; that's what the PKCE extension is for.
Check out **Code Flow + PKCE**.

## 2.2. How Do Users Interact With Your App?

### 2.2.1. Uh, the Normal Way?

If your users access your app with a mouse, keyboard, or touchscreen, then you don't need to worry about **Device Flow** or **Client Credentials Flow**.

### 2.2.2. Through a Smart TV or Other IoT Device

We've all tried typing long usernames and passwords with a TV remote or game controller.
It's not fun.
Luckily, there's a flow just for that; **Device Flow** gives users a short code to type in on their phone or computer.

### 2.2.3. They Don't

If your app doesn't require human consent, it can still utilize OAuth to verify other apps or even itself.
This is often referred to as M2M (machine to machine) interaction.
You'll be needing **Client Credentials Flow**.

# 3. Choosing an OAuth Flow
<!-- BG-  Wonder if it would be useful to have graphics or pages for each flow that shows data received and data returned. Next buttons to go from step to step. just an idea. -->
<!-- MB	2020-02-14 I definitely want flowcharts for the step-by-steps below. I worry that it would be overwhelming in this section. If we can figure out some clever minimal graphics for each flow, that would be great. Not sure what you mean by "next buttons."-->

## 3.1. Code Flow

**Recommended for:** server-based (confidential) apps.

This is the most common and standard flow.
It's not unreasonable to say that the other flows are based on this one.

[See how to implement this flow, step-by-step.](#51-code-flow)

## 3.2. Code Flow + PKCE

**Recommended for:** client-based (public) apps.

PKCE (pronounced "pixie") is an extension that allows client-based to use **Code Flow**.
Because client-based apps can't keep a `client_secret`, this flow has you generating and hashing a new, cryptographically random `code_verifier` for every authorization.
Prior to PKCE, client-based apps had to use **Implicit Flow**, which is now deprecated.

[See how to implement this flow, step-by-step.](#52-code-flow--pkce)

## 3.3. Device Flow

**Recommended for:** apps installed on devices without keyboards.

If you use device flow, your app with show a `user_code` and `verification_uri` to the user.
Your app will then periodically ask your OAuth provider if the user has navigated to `verification_uri` and entered `user_code` yet.

[See how to implement this flow, step-by-step.](#53-device-flow)

## 3.4. Client Credentials Flow

**Recommended for:** apps that don't need human input.

Unsurprisingly, the biggest difference with this flow is that it skips the **Authorization** step, because there is no user to ask.
This means that all your app has to do is trade its `client_id` and `client_secret` for an `access_token`.

[See how to implement this flow, step-by-step.](#54-client-credentials-flow)

## 3.5. User Credentials Flow

**Not recommended for most apps.**

This flow has your app taking users' usernames and passwords directly, which is basically what OAuth is designed to prevent.
The danger (from a user's perspective) is that an app could store the credentials to use later, without the users' consent.
Still, this can be useful for apps that have built up a lot of trust with their users, such as those developed by OAuth providers, themselves.

[See how to implement this flow, step-by-step.](#55-user-credentials-flow)

## 3.6. Implicit Flow

**Not recommended for most apps.**

This flow is deprecated, and for good reason; it skips the **Code Exchange** step entirely, getting an `access_token` instead of a `code`.
Because the **Authorization** step ends in a redirect, the `access_token` is exposed in the redirect URI parameters; these parameters can easily be copied out of a browser's URL bar.
Anyone who holds your `access_token` is able to make API requests as if they are your app.

Before [CORS] was widely available in modern browsers, this was the only way for client-based apps to avoiding exposing their `client_secret`s.
Now, you're better off using **Code Flow + PKCE**, unless your app is somehow unable to utilize [CORS].

[See how to implement this flow, step-by-step.](#56-implicit-flow)

# 4. Authentication in OAuth

OAuth has no concept of identity; it only specifies methods of authorization.
If you read the OAuth spec, you'll see repeated disclaimers that OAuth is not an authentication framework.
That doesn't mean you don't need it; it just means there's a bit more to learn.

## 4.1. OpenID Connect

The standard for authentication in OAuth is OpenID Connect (OIDC).
<!-- BG-  not sure what an authentication layer here means and how different than OAuth.-->
<!-- MB	2020-02-14 See above section under §4. OAuth = authorization. OIDC adds authentication. I didn't want to get too in the weeds about OIDC specifics--do you think more detail would help here?-->

OIDC is an authentication layer built on top of OAuth 2.0.
If your OAuth provider is OIDC certified, you can get an `id_token` along with your `code`.
The `id_token` is a signed JWT that contains user profile information, such as name, email address, phone number, etc.
That profile information can be trusted due to the signature, which can be verified by using your OAuth provider's `userInfo` endpoint.

More on JWTs can be seen in the [Using Access Tokens](#6-using-access-tokens) section.

To indicate that you want an ID token, simply include `openid` in the `scope` of your authorization request.

# 5. Implementing OAuth Flows Step-by-Step

## 5.1. Code Flow

[Not sure if this is the right flow for your app?](#3-choosing-an-oauth-flow)

1. Redirect the user to your OAuth provider's `authorize` endpoint.
You'll need to include the following parameters:

	| parameter          | value                                 | purpose                                                                       |
	|:-------------------|:--------------------------------------|:------------------------------------------------------------------------------|
	| `client_id`        | your client ID                        | tells your OAuth provider which app is making a request                       |
	| `redirect_uri`     | your redirect URI                     | tells your OAuth provider where to redirect users after authorization is done |
	| `response_type`    | `code`                                | indicates that you're expecting an authorization code in response             |
	| `scope` (optional) | space-separated list of access levels | tells your OAuth provider which specific data you're trying to get            |
	| `state`            | random string                         | used to verify the response from your OAuth provider and prevent CSRF attacks |

	*Example URI:*

	```
	https://oauth-provider.com/oauth2/authorize?
		client_id=06494b74-a796-4723-af44-1bdb96b48875&
		redirect_uri=https%3A%2F%2Fwww.piedpiper.com%2Flogin&
		response_type=code&
		state=E7bMSVO7DlxkFueN&
		scope=openid%20profile%20email
	```

	When the user gets there, your OAuth provider will show a page with your app's name and logo, the scope of the request, an `Allow` button, and a `Decline` button.

	Depending on the implementation, the user will also hit an authentication layer, in which they will log in with username-password, social media, biometrics, or whatever other options your OAuth provider allows.

1. Your Oauth provider will redirect the user to your `redirect_uri` along with some parameters:

	| parameter | value                                                | purpose                                                                       |
	|:----------|:-----------------------------------------------------|:------------------------------------------------------------------------------|
	| `code`    | the authorization code from your OAuth provider      | proof that the user gave consent                                              |
	| `state`   | the same random string you gave in the previous step | used to verify the response from your OAuth provider and prevent CSRF attacks |

	*Example URI:*

	```
	https://www.piedpiper.com/login?
		code=+WYT3XemV4f81ghHi4V+RyNwvATDaD4FIj0BpfFC4Wzg&
		state=E7bMSVO7DlxkFueN
	```

	Verify that `state` is the same as the one you sent; if it's not, someone other than your OAuth provider is trying to execute a CSRF attack.<!--TODO: link to CSRF attack on wikipedia or something-->
	Save `code` for the next step; you'll need it to get an access token.

1. Make an HTTP request to your OAuth provider's `token` endpoint.
You'll need to include the following parameters:

	| parameter       | value                                           | purpose                                                      |
	|:----------------|:------------------------------------------------|:-------------------------------------------------------------|
	| `client_id`     | your client ID                                  | tells your OAuth provider which app is making a request      |
	| `client_secret` | your client secret                              | used by your OAuth provider to authenticate your app         |
	| `code`          | the authorization code from your OAuth provider | proof that the user gave consent                             |
	| `grant_type`    | `authorization_code`                            | indicates that you're using an authorization code as a grant |
	| `redirect_uri`  | the same redirect URI as you gave in step 1     | used by the OAuth provider to verify your token request      |

	*Example POST request:*

	```
	POST /oauth2/token HTTP/1.1
	Host: oauth-provider.com

	client_id=3c219e58-ed0e-4b18-ad48-f4f92793ae32&
	client_secret=_UctTBl5PG89-vCwrOo0FqYLywnUC4hSjx927sLjuzM&
	code=+WYT3XemV4f81ghHi4V+RyNwvATDaD4FIj0BpfFC4Wzg&
	grant_type=authorization_code&
	redirect_uri=https%3A%2F%2Fwww.piedpiper.com%2Flogin
	```

1. Your OAuth provider will respond with JSON, including the `access_token`:

	| parameter                  | value                     | purpose                                                     |
	|:---------------------------|:--------------------------|:------------------------------------------------------------|
	| `access_token`             | a JWT or opaque token     | used to make API calls and access the user's data           |
	| `expires_in`               | integer number of seconds | number of seconds the app has before `access_token` expires |
	| `refresh_token` (optional) | an opaque token           | used to get new `access_tokens` after they expire           |

	*Example JSON:*

	```json
	{
		"access_token" : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTc3ODYyMDAwLCJleHAiOjE1Nzc4NjIwMDAsInJvbGVzIjpbIm1vZGVyYXRvciIsInVzZXIiXX0.oinbs9H_CzT7Bl79ZL_tHLmfE53YyTlUFv284il_YCw",
		"expires_in" : 3600,
		"refresh_token": "ze9fi6Y9sMSf3yWp3aaO2w7AMav2MFdiMIi2GObrAi-i3248oo0jTQ"
	}
	```

	That's the end of the Authentication Grant Flow!
	See [Using Access Tokens](#using-access-tokens) for what to do next.

## 5.2. Code Flow + PKCE

[Not sure if this is the right flow for your app?](#3-choosing-an-oauth-flow)

1. Generate a new `code_verifier` and `code_challenge` for every request.
The verifier can be any cryptographically random string, and the challenge is a SHA-256 hashed version of that string.
For most environments, libraries exist for both cryptographic randomization and SHA-256.

1. Redirect the user to your OAuth provider's `authorize` endpoint.
You'll need to include the following parameters:

	| parameter               | value                                     | purpose                                                                                                               |
	|:------------------------|:------------------------------------------|:----------------------------------------------------------------------------------------------------------------------|
	| `client_id`             | your client ID                            | tells your OAuth provider which app is making a request                                                               |
	| `code_challenge_method` | `S256`                                    | indicates that you used SHA-256 to hash `code_verifier` into `code_challenge`                                         |
	| `code_challenge`        | SHA-256 hashed version of `code_verifier` | will be compared with `code_verifier` in a later step, which allows your OAuth provider to authenticate your app      |
	| `redirect_uri`          | your redirect URI                         | tells your OAuth provider where to redirect users after authorization is done                                         |
	| `response_type`         | `code`                                    | indicates that you're expecting an authorization code in response                                                     |
	| `scope` (optional)      | space-separated list of access levels     | tells your OAuth provider which specific data you're trying to get                                                    |
	| `state`                 | a random string                           | used to verify the response from your OAuth provider and prevent CSRF attacks                                         |

	*Example URI:*

	```
	https://oauth-provider.com/oauth2/authorize?
		client_id=06494b74-a796-4723-af44-1bdb96b48875&
		redirect_uri=https%3A%2F%2Fwww.piedpiper.com%2Flogin&
		response_type=code&
		code_challenge=E8AD0F7972B90735CDF7E12CB5623027E33DE10B7E7956A8C77E32C16B9532F9&
		code_challenge_method=S256&
		state=E7bMSVO7DlxkFueN&
		scope=openid%20profile%20email
	```

	When the user gets there, your OAuth provider will show a page with your app's name and logo, the scope of the request, an `Allow` button, and a `Decline` button.

	Depending on the implementation, the user will also hit an authentication layer, in which they will log in with username-password, social media, biometrics, or whatever other options your OAuth provider allows.

1. Your Oauth provider will redirect the user to your `redirect_uri` along with some parameters:

	| parameter | value                                                | purpose                                                                       |
	|:----------|:-----------------------------------------------------|:------------------------------------------------------------------------------|
	| `code`    | the authorization code from your OAuth provider      | proof that the user gave consent                                              |
	| `state`   | the same random string you gave in the previous step | used to verify the response from your OAuth provider and prevent CSRF attacks |

	*Example URI:*

	```
	https://www.piedpiper.com/login?
		code=+WYT3XemV4f81ghHi4V+RyNwvATDaD4FIj0BpfFC4Wzg&
		state=E7bMSVO7DlxkFueN
	```

	Verify that `state` is the same as the one you sent; if it's not, someone other than your OAuth provider is trying to execute a CSRF attack.<!--TODO: link to CSRF attack on wikipedia or something-->
	Save `code` for the next step; you'll need it to get an access token.

1. Make an HTTP request to your OAuth provider's `token` endpoint.
You'll need to include the following parameters:

	| parameter       | value                                           | purpose                                                                                                                  |
	|:----------------|:------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------|
	| `client_id`     | your client ID                                  | tells your OAuth provider which app is making a request                                                                  |
	| `code_verifier` | the random string generated in step 1           | will be compared with the `code_challenge` you sent in step 2, which allows your OAuth provider to authenticate your app |
	| `code`          | the authorization code from your OAuth provider | proof that the user gave consent                                                                                         |
	| `grant_type`    | `authorization_code`                            | indicates that you're using an authorization code as a grant                                                             |
	| `redirect_uri`  | the same redirect URI as you gave in step 2     | used by the OAuth provider to verify your token request                                                                  |

	*Example POST request:*

	```
	POST /oauth2/token HTTP/1.1
	Host: oauth-provider.com

	client_id=3c219e58-ed0e-4b18-ad48-f4f92793ae32&
	code_verifier=zfLfZKs05SjlQOJv&
	code=+WYT3XemV4f81ghHi4V+RyNwvATDaD4FIj0BpfFC4Wzg&
	grant_type=authorization_code&
	redirect_uri=https%3A%2F%2Fwww.piedpiper.com%2Flogin
	```

1. Your OAuth provider will respond with JSON, including the `access_token`:

	| parameter                  | value                     | purpose                                                     |
	|:---------------------------|:--------------------------|:------------------------------------------------------------|
	| `access_token`             | a JWT or opaque token     | used to make API calls and access the user's data           |
	| `expires_in`               | integer number of seconds | number of seconds the app has before `access_token` expires |
	| `refresh_token` (optional) | an opaque token           | used to get new `access_tokens` after they expire           |

	*Example JSON:*

	```json
	{
		"access_token" : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTc3ODYyMDAwLCJleHAiOjE1Nzc4NjIwMDAsInJvbGVzIjpbIm1vZGVyYXRvciIsInVzZXIiXX0.oinbs9H_CzT7Bl79ZL_tHLmfE53YyTlUFv284il_YCw",
		"expires_in" : 3600,
		"refresh_token": "ze9fi6Y9sMSf3yWp3aaO2w7AMav2MFdiMIi2GObrAi-i3248oo0jTQ"
	}
	```

	That's the end of the Authentication Grant Flow +PKCE!
	See [Using Access Tokens](#using-access-tokens) for what to do next.

## 5.3. Device Flow

[Not sure if this is the right flow for your app?](#3-choosing-an-oauth-flow)

1. Make an HTTP request to your OAuth provider's `device_authorize` endpoint.
You'll need to include the following parameters:

	| parameter          | value                                 | purpose                                                            |
	|:-------------------|:--------------------------------------|:-------------------------------------------------------------------|
	| `client_id`        | your client ID                        | tells your OAuth provider which app is making a request            |
	| `scope` (optional) | space-separated list of access levels | tells your OAuth provider which specific data you're trying to get |

	*Example POST request:*

	```
	POST /oauth2/device_authorize HTTP/1.1
	Host: oauth-provider.com

	client_id=3c219e58-ed0e-4b18-ad48-f4f92793ae32&
	scope=openid%20profile%20email
	```

1. Your OAuth provider will respond with JSON including the following parameters:

	| parameter          | value                                      | purpose                                                                   |
	|:-------------------|:-------------------------------------------|:--------------------------------------------------------------------------|
	| `device_code`      | a random string                            | used by your OAuth provider to identify the user's device                 |
	| `expires_in`       | integer number of seconds                  | number of seconds the user has before `user_code` expires                 |
	| `interval`         | integer number of seconds                  | number of seconds your app should wait between `token` endpoint requests  |
	| `user_code`        | a random string                            | short code for the user to type in after navigating to `verification_uri` |
	| `verification_uri` | URI pointing to your OAuth provider's site | short web address for the user to type in a browser                       |

	*Example JSON:*

	```json
	{
		"device_code": "e6f_lF1rG_yroI0DxeQB5OrLDKU18lrDhFXeQqIKAjg",
		"verification_uri": "https://oauth-provider.com/device",
		"user_code": "FBGLLF",
		"expires_in": 600,
		"interval": 5
	}
	```

	Display `verification_uri` and `user_code` on the device.
	The user will type the URI in another browser and arrive at a page on your OAuth provider's site.
	Your OAuth provider will show a page with your app's name and logo, the scope of the request, and a form to enter the `user_code`.
	(Entering the code is basically the same as clicking `Allow` in [Authorization Code Flow](#authorization-code-flow).)

	Depending on the implementation, the user will also hit an authentication layer, in which they will log in with username-password, social media, biometrics, or whatever other options your OAuth provider allows.

1. Make HTTP requests to your OAuth provider's `token` endpoint.
Because there's no way to know if the user has finished entering the `user_code`, you'll need to check repeatedly.
The `interval` parameter from step 2 tells you how long to wait between requests.

	You'll need to include the following parameters:

	| parameter     | value                       | purpose                                                      |
	|:--------------|:----------------------------|:-------------------------------------------------------------|
	| `client_id`   | your client ID              | tells your OAuth provider which app is making a request      |
	| `device_code` | the device code from step 2 | used by your OAuth provider to identify the user's device    |
	| `grant_type`  | `device_code`               | indicates that you're using a device code as a grant         |

	*Example POST request:*

	```
	POST /oauth2/token HTTP/1.1
	Host: oauth-provider.com

	client_id=3c219e58-ed0e-4b18-ad48-f4f92793ae32&
	device_code=e6f_lF1rG_yroI0DxeQB5OrLDKU18lrDhFXeQqIKAjg&
	grant_type=device_code
	```

	If the user hasn't typed in their code, yet, your OAuth provider will respond with an `authorization_pending` error:

	```json
	{
		"error": "authorization_pending"
	}
	```

1. Once the user has finished authorizing, your OAuth provider will respond with JSON, including the `access_token`:

	| parameter                  | value                     | purpose                                                     |
	|:---------------------------|:--------------------------|:------------------------------------------------------------|
	| `access_token`             | a JWT or opaque token     | used to make API calls and access the user's data           |
	| `expires_in`               | integer number of seconds | number of seconds the app has before `access_token` expires |
	| `refresh_token` (optional) | an opaque token           | used to get new `access_tokens` after they expire           |

	*Example JSON:*

	```json
	{
		"access_token" : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTc3ODYyMDAwLCJleHAiOjE1Nzc4NjIwMDAsInJvbGVzIjpbIm1vZGVyYXRvciIsInVzZXIiXX0.oinbs9H_CzT7Bl79ZL_tHLmfE53YyTlUFv284il_YCw",
		"expires_in" : 3600,
		"refresh_token": "ze9fi6Y9sMSf3yWp3aaO2w7AMav2MFdiMIi2GObrAi-i3248oo0jTQ"
	}
	```

	That's the end of the Device Flow!
	See [Using Access Tokens](#using-access-tokens) for what to do next.

## 5.4. Client Credentials Flow

[Not sure if this is the right flow for your app?](#3-choosing-an-oauth-flow)

1. Make an HTTP request to your OAuth provider's `token` endpoint.
You'll need to include the following parameters:

	| parameter          | value                                 | purpose                                                            |
	|:-------------------|:--------------------------------------|:-------------------------------------------------------------------|
	| `client_id`        | your client ID                        | tells your OAuth provider which app is making a request            |
	| `client_secret`    | your client secret                    | used by your OAuth provider to authenticate your app               |
	| `grant_type`       | `client_credentials`                  | indicates that you're using client credentials as a grant          |
	| `scope` (optional) | space-separated list of access levels | tells your OAuth provider which specific data you're trying to get |

	*Example POST request:*

	```
	POST /oauth2/token HTTP/1.1
	Host: oauth-provider.com

	client_id=3c219e58-ed0e-4b18-ad48-f4f92793ae32&
	client_secret=_UctTBl5PG89-vCwrOo0FqYLywnUC4hSjx927sLjuzM&
	grant_type=client_credentials&
	scope=openid%20profile%20email
	```

1. Your OAuth provider will respond with JSON, including the `access_token`:

	| parameter                  | value                     | purpose                                                     |
	|:---------------------------|:--------------------------|:------------------------------------------------------------|
	| `access_token`             | a JWT or opaque token     | used to make API calls and access the user's data           |
	| `expires_in`               | integer number of seconds | number of seconds the app has before `access_token` expires |
	| `refresh_token` (optional) | an opaque token           | used to get new `access_tokens` after they expire           |

	*Example JSON:*

	```json
	{
		"access_token" : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTc3ODYyMDAwLCJleHAiOjE1Nzc4NjIwMDAsInJvbGVzIjpbIm1vZGVyYXRvciIsInVzZXIiXX0.oinbs9H_CzT7Bl79ZL_tHLmfE53YyTlUFv284il_YCw",
		"expires_in" : 3600,
		"refresh_token": "ze9fi6Y9sMSf3yWp3aaO2w7AMav2MFdiMIi2GObrAi-i3248oo0jTQ"
	}
	```

	That's the end of the Authentication Grant Flow!
	See [Using Access Tokens](#using-access-tokens) for what to do next.

## 5.5. User Credentials Flow

[Not sure if this is the right flow for your app?](#3-choosing-an-oauth-flow)

1. Get the user's `username` and `password`.
This is usually done with a form.
Don't store these credentials; use temporary variables and throw them out after authorization.

1. Make an HTTP request to your OAuth provider's `token` endpoint.
You'll need to include the following parameters:

	| parameter       | value                  | purpose                                                 |
	|:----------------|:-----------------------|:--------------------------------------------------------|
	| `client_id`     | your client ID         | tells your OAuth provider which app is making a request |
	| `client_secret` | your client secret     | used by your OAuth provider to authenticate your app    |
	| `grant_type`    | `password`             | indicates that you're using user credentials as a grant |
	| `password`      | `password` from step 1 | used by the OAuth provider to authenticate the user     |
	| `username`      | `username` from step 1 | used by the OAuth provider to authenticate the user     |

	*Example POST request:*

	```
	POST /oauth2/token HTTP/1.1
	Host: oauth-provider.com

	client_id=3c219e58-ed0e-4b18-ad48-f4f92793ae32&
	client_secret=_UctTBl5PG89-vCwrOo0FqYLywnUC4hSjx927sLjuzM&
	grant_type=password&
	username=matt-boisseau&
	password=R7qq4YAx3q9S
	```

1. Your OAuth provider will respond with JSON, including the `access_token`:

	| parameter                  | value                     | purpose                                                     |
	|:---------------------------|:--------------------------|:------------------------------------------------------------|
	| `access_token`             | a JWT or opaque token     | used to make API calls and access the user's data           |
	| `expires_in`               | integer number of seconds | number of seconds the app has before `access_token` expires |
	| `refresh_token` (optional) | an opaque token           | used to get new `access_tokens` after they expire           |

	*Example JSON:*

	```json
	{
		"access_token" : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTc3ODYyMDAwLCJleHAiOjE1Nzc4NjIwMDAsInJvbGVzIjpbIm1vZGVyYXRvciIsInVzZXIiXX0.oinbs9H_CzT7Bl79ZL_tHLmfE53YyTlUFv284il_YCw",
		"expires_in" : 3600,
		"refresh_token": "ze9fi6Y9sMSf3yWp3aaO2w7AMav2MFdiMIi2GObrAi-i3248oo0jTQ"
	}
	```

	That's the end of the User Credentials Flow!
	See [Using Access Tokens](#using-access-tokens) for what to do next.

## 5.6. Implicit Flow

[Not sure if this is the right flow for your app?](#3-choosing-an-oauth-flow)

Implicit Flow was designed as a workaround for [public apps](#public-clients) (those that can't keep a confidential secret) before the [CORS] was available in modern browsers.

Implicit Flow simply skips the code exchange step that would require authentication with a client secret.
Instead, you ask for the access token directly in the authorization redirect.
This means that the access token is exposed in the redirect URI parameters (see step 2).
For this reason, Implicit Flow is **not recommended**; instead, you should use [Authorization Code Flow +PKCE](#authorization-code-flow-pkce).

If you still want to use Implicit Flow, keep in mind that tokens should be as short-lived as possible.
When it comes to potentially exposed tokens, less active time means less to gain for would-be attackers.
Refresh tokens are long-lived by design, and are therefore too risky to expose.

1. Redirect the user to your OAuth provider's `authorize` endpoint.
You'll need to include the following parameters:

	| parameter          | value                                 | purpose                                                                       |
	|:-------------------|:--------------------------------------|:------------------------------------------------------------------------------|
	| `client_id`        | your client ID                        | tells your OAuth provider which app is making a request                       |
	| `redirect_uri`     | your redirect URI                     | tells your OAuth provider where to redirect users after authorization is done |
	| `response_type`    | `token`                               | indicates that you're expecting an access token in response                   |
	| `scope` (optional) | space-separated list of access levels | tells your OAuth provider which specific data you're trying to get            |
	| `state`            | random string                         | used to verify the response from your OAuth provider and prevent CSRF attacks |

	*Example URI:*

	```
	https://oauth-provider.com/oauth2/authorize?
		client_id=06494b74-a796-4723-af44-1bdb96b48875&
		redirect_uri=https%3A%2F%2Fwww.piedpiper.com%2Flogin&
		response_type=token&
		state=E7bMSVO7DlxkFueN&
		scope=openid%20profile%20email
	```

	When the user gets there, your OAuth provider will show a page with your app's name and logo, the scope of the request, an `Allow` button, and a `Decline` button.

	Depending on the implementation, the user will also hit an authentication layer, in which they will log in with username-password, social media, biometrics, or whatever other options your OAuth provider allows.

1. Your Oauth provider will redirect the user to your `redirect_uri` along with some parameters:

	| parameter      | value                     | purpose                                                                       |
	|:---------------|:--------------------------|:------------------------------------------------------------------------------|
	| `access_token` | a JWT or opaque token     | used to make API calls and access the user's data                             |
	| `expires_in`   | integer number of seconds | number of seconds the app has before `access_token` expires                   |
	| `state`        | random string             | used to verify the response from your OAuth provider and prevent CSRF attacks |

	*Example URI:*

	```
	https://www.piedpiper.com/login?
		access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTc3ODYyMDAwLCJleHAiOjE1Nzc4NjIwMDAsInJvbGVzIjpbIm1vZGVyYXRvciIsInVzZXIiXX0.oinbs9H_CzT7Bl79ZL_tHLmfE53YyTlUFv284il_YCw&
		expires_in=600&
		state=E7bMSVO7DlxkFueN
	```

	Verify that `state` is the same as the one you sent; if it's not, someone other than your OAuth provider is trying to execute a CSRF attack.<!--TODO: link to CSRF attack on wikipedia or something-->

	That's the end of the Implicit Flow!
	See [Using Access Tokens](#using-access-tokens) for what to do next.

# 6. Using Access Tokens

After successfully using one of the above authorization grant flows, you should have an access token, which is either an opaque token or a JWT.

## 6.1. Opaque Tokens

An opaque token is really just a randomly generated string.
It doesn't contain any info on its own; instead, it works only as an API key.
Include an access token with your requests to the resource server; the resource server will use the token to validate the request.

*Example opaque token:*

```
ppRbXeycI6Wu0K9WzbgGQadUoS7P
```

## 6.2. JWTs

A JWT contains base64-encoded JSON data, which can be retrieved by manually decoding or passing the JWT back to your OAuth provider's `introspect` endpoint.
The JSON payload might include data like the user's roles, which authentication type they used, their email address, etc.
A JWT can also be included with API requests, just like an opaque token.

*Example encoded JWT:*

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTc3ODYyMDAwLCJleHAiOjE1Nzc4NjIwMDAsInJvbGVzIjpbIm1vZGVyYXRvciIsInVzZXIiXX0.oinbs9H_CzT7Bl79ZL_tHLmfE53YyTlUFv284il_YCw
```

A JWT is separated into three parts with `.`s.
Each part is base64-encoded.

The first chunk is the header, which tells us basic info about the JWT, like the algorithm used to hash it, and its filetype.

*Example decoded JWT header:*

```json
{
	"alg": "HS256",
	"typ": "JWT"
}
```

The second chunk is the payload, which might include data like the user's roles, which authentication type they used, their email address, etc.

*Example decoded JWT payload:*

```json
{
	"exp": 1577862000,
	"iat": 1577862000,
	"name": "John Doe",
	"roles": ["moderator", "user"],
	"sub": "1234567890"
}
```

A JWT also has a digital signature, which means that the data within can be verified and trusted.
They can be signed using a shared secret (known to both your OAuth provider and the resource server or a public/private key pair (with private kept by the OAuth provider to ensure it stays confidential).
In the example below, `oF0125yWqU*^` is the shared secret.

*Example decoded JWT signature:*

```
HMACSHA256(
	base64UrlEncode(header) + "." +
	base64UrlEncode(payload),
	oF0125yWqU*^
)
```

# 7. OAuth Jargon Glossary

<!--TODO: consider using &nbsp;s to keep term names clean-->

| OAuth term                | definition in plain English                                                                                        |
|:--------------------------|:-------------------------------------------------------------------------------------------------------------------|
| access token              | short-lived pass used to access user's data from the resource server                                               |
| authentication (authN)    | the act of verifying a user's or an app's identity                                                                 |
| authorization (authZ)     | the act of giving consent to an app                                                                                |
| authorization grant       | affirmation from OAuth provider that user gave consent                                                             |
| authorization request     | redirection of user to OAuth provider's "Authorize" endpoint                                                       |
| authorization server (AS) | OAuth provider                                                                                                     |
| client                    | app that wants to access user's data                                                                               |
| client ID                 | app's public username, used by OAuth provider to identify the app                                                  |
| client secret             | app's private password, used by OAuth provider to authenticate the app                                             |
| code verifier             | random, hashed string used in place of a secret when it's not possible to keep a secret                            |
| protected resource        | user's data                                                                                                        |
| redirect URL              | location on the app where the user lands after authorization                                                       |
| refresh token             | long-lived pass used to get new access tokens                                                                      |
| resource owner (RO)       | user who owns data                                                                                                 |
| resource server (RS)      | API used to access user's data                                                                                     |
| state                     | random string sent with authorization request and returned with authorization code, used to verify the transaction |
| token exchange            | exchange of client id/secret and authorization code for access token                                               |

<!-- BG-  Is it inaccurate to have a biometric or hardware key in the graphic-->
<!-- MB	2020-02-14 OAuth/OIDC don't specify any specific authentication method. What graphic are you referring to here?-->

<!-- BG-  Are you planning diagrams at the beginning of each flow? -->
<!-- MB	2020-02-14 Absolutely. I think it's hard to follow otherwise. Ideally, these diagrams have numbers corresponding to the numbered steps.-->

<!-- BG-  Do we want to show implicit grants if not a good choice? Strong warning? Any reasons should use it? At all? -->
<!-- MB	2020-02-14	I thought the same about omitting it, but Brian said that people will be wanting to know about it. Strong warning is my preference in that case. Would love "warning" admonitions, but they are sadly unavailable in markdown.-->

<!-- BG-  Section 7 - authN and authZ - never mentioned before, but now in the glossary? Why? -->
<!-- MB	2020-02-14	They're common shorthand for authentication and authorization. They appear in the official OIDC spec. I imagine the following use case: see "authN" -> go to your favorite OAuth guide (this one) -> crtl+f "authN"-->

<!-- BG-  Are there places we can link out to the login workflows article in here? Crosslinking is good. -->
<!-- MB	2020-02-14	Agreed on crosslinking. Ideally, almost every topic here would have another, more detailed article on the FA site.-->

<!-- BG-  I suspect we could submit each of the flows as different articles to Dzone, hacker noon, medium, and other pubs. -->
<!-- MB	2020-02-14	See above comment. I think the more detailed crosslink articles would be more suitable for this? I definitely think we should go for it, either way.-->

<!-- BG-  Without graphics, the rendered page of this article seems more like a lot of summary bullets than an 'everything' doc. I could be wrong though, this could be a perfect concise summary.  -->
<!-- MB	2020-02-14	I try not to be wordy if I can help it. Maybe I'm projecting, but I have very little patience when browsing something like this. Overly brief is a common point of feedback for my work, so I don't doubt that it could use a bit of fluffing--can you note any specific sections that seem too brief?-->

<!-- BG-  Is there room in here for common misconceptions? What people usually get wrong, common pitfalls -->
<!-- MB	2020-02-14	Great idea. Definitely adding this.-->

<!-- BG-  Is there anything we can say about the coming changes/cleanup in Oauth 2.1? Even to summarize or allude to direction? -->
<!-- MB	2020-02-14	In the spirit of a "living doc," I omitted this section for now. Could add a short section with a "watch this space" kind of attitude.-->

<!-- MB	2020-02-14 Do you want me to go through and add sketchy versions of the graphics I think are necessary throughout? Then you can just focus on making sure they're brand-accurate and properly formatted? Or I could just give textual descriptions if you prefer.-->