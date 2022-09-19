﻿---
layout: blog-post
title: Is the OAuth Device grant right for your game authentication needs?
description: How can the OAuth Device Authorization grant help your users easily autenticate into your game?
author: Success Ologunsua
image: blogs/device-grant-gaming/oauth-device-grant-game-users.png
category: blog
excerpt_separator: "<!--more-->"
---

The OAuth device authorization grant is an extension of OAuth 2.0. Because OAuth is an authorization protocol, it enables users to gain access to an application or device by allowing it to use account information from another application or device.

<!--more-->

As the name implies, the device authorization grant enables game users to access websites or applications using a separate device on which they may already be authenticated, or which has superior input ability. This enables devices with no browser or limited input capability, such as game consoles, smart TVs, or fitness trackers, to get an access token after a successful authentication event.

_This blog post is an excerpt from [How the OAuth Device Authorization grant Can Make Your Users’ Lives Easier](/learn/expert-advice/gaming-entertainment/oauth-device-grant-gaming)._

### Use cases

With the OAuth device authorization grant, you’ll be able to do the following:

- **Third-party authentication:** Users can get access to a specific service of a website from another application without sharing passwords or other login details. For instance, when you log in to an app using “sign in with Google”, it asks you to grant permission to allow the app access to the main information of your Google account.

- **Cross-device authentication:** Users can sync and authorize devices such as their mobile phone, laptop, security system, or game console from a client service or browser without repeatedly logging in. For example, you can implement the OAuth device authorization grant in your game application so it has permission to access  files stored on Google Drive.

### Advantages of the OAuth Device Authorization grant

The device authorization grant provides fast, easy authentication to users. It offers other advantages as well:

- Users don’t have to struggle with on-screen TV keyboards in order to authenticate an external service on their smart TV. This also prevents the security risk of a malicious user recording the screen or watching the slow input of passwords.
- Third parties have fewer opportunities to access users’ passwords, reducing the probability of those passwords being compromised.
- Using features like scopes, users can select which functionalities or applications they want to grant access to, giving them more control over their data.

To learn more about the device grant, as well as to look at code for a game that authenticates using the grant, read [How the OAuth Device Authorization grant Can Make Your Users’ Lives Easier](/learn/expert-advice/gaming-entertainment/oauth-device-grant-gaming).

