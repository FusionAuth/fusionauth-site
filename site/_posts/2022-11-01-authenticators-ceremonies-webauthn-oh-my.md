---
layout: blog-post
title: Authenticators, Ceremonies, and WebAuthn, oh my!
description: A dive into WebAuthn terminology.
author: Ikeh Aakinyemi
image: blogs/webauthn-terminology/webauthn-terminology-header.png
category: article
tags: topic-webauthn webauthn 
excerpt_separator: "<!--more-->"
---

Unless you use two-factor authentication (2FA) with your password logins, you're prone to cyberattacks. This is where [Web Authentication (WebAuthn)](https://webauthn.guide) can help.

WebAuthn is an authentication standard that uses [asymmetric cryptographic](https://www.techtarget.com/searchsecurity/definition/asymmetric-cryptography) keys to authenticate users instead of passwords, mitigating cyberattacks. With WebAuthn, users can authenticate using their devices (with biometrics) without having to remember their passwords, store them, or worry about them getting compromised. The WebAuthn credentials are also known as "passkeys".

<!--more-->

In this guide, you'll learn more about WebAuthn and why it matters. You'll also explore some use cases where WebAuthn is important and see how it can help prevent cyberattacks.

## What Is WebAuthn

User’s passwords are often weak, reused, and can be easily hijacked. The site [haveibeenpwned](https://haveibeenpwned.com) has over 11 billion accounts that have been compromised. Because of this, they're not suited for guarding sensitive accounts like banking or social media applications. While MFA offers additional security, WebAuthn is even better when it comes to guarding sensitive data since it uses passwordless authentication.

WebAuthn provides a means for servers to authenticate users using cryptographic keys (private and public) in place of passwords. The private and public keys are used to authenticate users, and the public key is stored in the server (also known as a relying party or RP), while the private key is stored locally in the user's device.

The server uses a credential id to identify the user. On the other hand, the user's device contains the private key that corresponds to the public key (which is stored in the server and is useless without a corresponding private key). 

## Why You Need WebAuthn

You might be wondering why you should use WebAuthn instead of using a more robust password from a password generator. Or you may be considering adding 2FA for more security, which is an improvement but still prone to cyberattacks (for example, phishing) [compared to WebAuthn](https://www.slashid.dev/blog/webauthn-antiphishing#:~:text=WebAuthn%20Anti%2DPhishing,superior%20authentication%20method.).

Here are a few of the reasons WebAuthn is the superior choice for keeping your application secure:

* WebAuthn helps resolve significant security problems related to data breaches, phishing, and attacks against 2FA methods. Phishing attacks are usually disguised emails or messages luring users to click on malicious links with the intent of stealing sensitive data like login credentials. With WebAuthn, attackers can't gain access to your data using login credentials stolen from your device since WebAuthn uses cryptographic keys to authenticate users and the private key never leaves the device nor is accessible to the user.
* It's easier to use since users have to manage fewer passwords.
* It eliminates the need for servers to store passwords. With passwords, if a server happens to be compromised, the user might be at risk if the password wasn’t hashed properly. With WebAuthn, if the server is compromised, the server only stores the public key, which requires the private key (stored in the user's device) to complete the authentication.
* It's easier for attackers to steal a user's password than to steal their device. Even if an attacker does steal a device, they still need to bypass the device's security (for example, biometrics or facial recognition system).
* WebAuthn is easy to implement because it consists of [browser APIs that can be easily used by developers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API#examples).
* It offers a smooth authentication experience for users.

## How WebAuthn Works

WebAuthn consists of three components: the authenticator (the user's device), the web browser, and the server (RP). In essence, the user initiates a login via the browser, the browser then prompts the user to authenticate using their device (via fingerprint or facial recognition, for example), and then if successful, the user is logged into the web application.

However, this is only a basic view of the process. To understand the process in more depth, you need to look at the two main flows of WebAuthn: the registration flow and the authentication flow. (They are called "ceremonies" in the specification.)

### The Registration Flow

Before users can authenticate, their device(s) must be registered on the server of the RP. This way, the RP creates the credentials that the user can use to authenticate, and the process looks like this:

1. The user visits the web application of the RP and initiates registration.
2. The server creates a challenge key for registration, which is only used once.
3. The challenge key, along with the user's info, is sent to the user's device via the browser.
4. The user is prompted to authenticate themselves (this could be via fingerprint, facial recognition, or other forms depending on the device; the specific method is called an "authorization gesture").
5. After the authorization gesture authenticates the user, the authenticator (the user's device) creates a new key pair (the public and private keys). 
6. The authenticator uses the private key to sign the challenge and then sends the public key and a credential identifier alongside the challenge over to the server.
7. The server validates the credibility of the private key by using the public key to evaluate the signed challenge.
8. The server associates the credentials with the user's account for future authentication purposes and redirects them to the application.

### The Authentication Flow

After a user's device is registered with the RP, the user can be authenticated. There are six steps involved in the WebAuthn authentication process:

1. The user initiates a login via the browser.
2. The server (RP) creates and sends a unique challenge to the authenticator via the browser.
3. The authenticator receives the challenge and other data.
4. The user is prompted to authenticate themselves (again, this could be via fingerprint, facial recognition, or other forms depending on the device).
5. After the authorization gesture authenticates the user, the authenticator creates a cryptographic signature and sends it back to the server along with other data.
6. The server verifies the signature of the unique challenge that it sent to the user (in step 2) using the public key stored by the server during the registration flow. Upon successful verification, the user is logged into the web application.

## WebAuthn vs. FIDO 2

WebAuthn was developed by the [World Wide Web Consortium (W3C)](http://www.w3.org/), which is the international standards organization for the world wide web. Meanwhile, Fast Identity Online 2 (FIDO2) was created by [FIDO Alliance](https://fidoalliance.org/) with the aim of creating passwordless authentication. WebAuthn is a core component of [FIDO2 specifications](https://fidoalliance.org/fido2/).

The FIDO Alliance decided to partner with W3C to make FIDO2 authentication a standard for the web. WebAuthn became a part of the FIDO2 specification, and a [set of browser APIs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API) was finalized, which are widely used today for passwordless authentication.

## Common WebAuthn Terminology

If you're looking to enter into the WebAuthn space, it can be helpful to understand the following terminology:

### Cross-Platform vs. Single-Platform

[Cross-platform authenticators](https://developers.yubico.com/WebAuthn/WebAuthn_Developer_Guide/Platform_vs_Cross-Platform.html.) (also known as roaming authenticators) are authenticators that can be used with another device, like a [YubiKey](https://www.yubico.com/), to perform authentication.

[Single-platform authenticators](https://developers.yubico.com/WebAuthn/WebAuthn_Developer_Guide/Platform_vs_Cross-Platform.html) (also known as platform authenticators) are authenticators that are built into the device, like Android pattern gestures or biometrics, iOS Face ID, or voice unlocks.

### User Presence vs. User Verification 

User presence indicates the user's current state (for example, whether someone is present). For instance, an authenticator may have a button a person pushes to indicate they are in possession of it. In this situation, a user is present, but as a relying party, you don't know which user. User presence is always tested during a WebAuthn ceremony.

On the other hand, user verification is concerned with proving the identity of the user, for example by requiring a PIN or facial recognition before they are allowed access.

### First Factor vs. Second Factor

First factor authentication means that the user is identified and authenticated. This is often done with a username and password. The username identifies the user and the password authenticates them. 

A second factor authentication uses another factor for authentication. This second factor doesn't need to identify the user, since that was accomplished with the first factor. By requiring a second factor of authentication, the authenticating system is more certain of who is authenticating. A typical example is when a user tries to log in to an application, and then gets an OTP sent to their email which they can use to complete authentication.

### Biometric Recognition vs. Biometric Authenticator

Biometric recognition is automated identification of a user's physical or behavioral traits (for example, fingerprints, voice unlocks, and facial recognition system). In contrast, biometric authenticators are the hardware that is capable of processing biometric recognitions (for example, retina scans and fingerprint scans).

### Authorization Gesture

An authorization gesture is one or more physical movements by a user interacting with an authenticator as part of credential enrollment. For instance, this can include setting up Face ID scans on an iPhone where the user is required to rotate their head to capture different angles of their faces.

### Relying Party

The relying party is the web application using WebAuthn to authenticate the user (for example, your application, [FusionAuth](https://fusionauth.io/), or Auth0).

### Authenticator

The authenticator is a device or software with which the user performs the authorization gesture required for authentication.

> Please note that for WebAuthn, authentication verifies identities, but authorization means the user gives consent for their authenticator to complete a flow.

## Conclusion

In this article, you learned what WebAuthn is, what its benefits are, what its purpose is, and why it's more secure than just using passwords. You also learned how WebAuthn works in terms of its registration and authentication flows.

WebAuthn is a web standard used in the browser and can be implemented into your application using its [browser APIs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API).

