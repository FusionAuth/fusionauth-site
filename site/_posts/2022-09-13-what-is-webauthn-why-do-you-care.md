---
layout: blog-post
title: What is WebAuthn and why should you care?
description: WebAuthn is a new standard which secures user accounts and improves user experience. What could be better?
author: Dan Moore
image: blogs/what-is-webauthn/what-is-web-authn.png
category: article
tags: topic-webauthn webauthn security user-experience
excerpt_separator: "<!--more-->"
related_resources:
  - 
    url: /learn/expert-advice/authentication/webauthn-explained
    title: WebAuthn Explained
  - 
    url: /blog/2022/10/27/introducing-biometric-authentication
    title: Introducing biometric authentication
---

WebAuthn is a new way for people to authenticate themselves to web applications. It's a widely supported standard years in the making. All major browsers work with it, which makes it easy for developers to incorporate WebAuthn into websites.

WebAuthn, commonly called "passkeys", allows users to leverage the power of biometric methods via a simple browser-native user experience.

<!--more-->

Am I overstating things? Is WebAuthn really all that?

Read on and decide for yourself.

## What is WebAuthn?

WebAuthn is a way for users to authenticate to applications running in the browser. Just like a username and password, WebAuthn provides credentials, but it identifies people with a different method. WebAuthn requires a special piece of hardware or software called an "authenticator".

WebAuthn removes the need for an application or user store to save off private, valuable data such as a hashed password. Instead, the application stores a public key. The corresponding private key is held securely by each user's authenticator.

The type of asymmetric keys that an authenticator supports, how the public key is distributed to the webapp, and how the keypair is used to authenticate a user are all specified by WebAuthn and related standards.

## Why consider WebAuthn?

Let's walk through a scenario to illustrate the value of WebAuthn. Say you run a website that sells clownwear (it's the next iteration of athleisure, except instead of wicking fabric, there are clown noses and big wigs). You've titled this business "Cosmo's Clown Store". You want customers and potential customers to log in, in order to undertake typical shopping tasks, such as favoriting items and placing orders.

This website is aimed at normal folks since there is not a whole lot of crossover between the geek and clownwear market, so you want to make login easy.

However, it is also an ecommerce company. If someone's credentials are stolen, they could be on the hook for the illicit credit card transactions, and your brand will suffer. You need to balance authentication security with an easy user experience. 

In doing your research, you come across a couple of options. You wonder "Why would I choose to implement WebAuthn? Aren't the current solutions for credentials just fine?"

### What's wrong with current options

Let's briefly look at common solutions for securing customer accounts:

* Passwords
* Password managers
* Multi-factor authentication (MFA)

Passwords are a well-known technology. They've been around since the 1960s and have the virtue of being well understood by most users. Users remember a username and password pair, and provide those to the application during the authentication process to prove who they are. However, passwords have a built-in tension. For each and every user, they must choose a password that is memorable, but difficult to guess. That's a difficult balance.

There's also the fact that many passwords have been compromised and are in the hands of people who would misuse them. [Have I Been Pwned](https://haveibeenpwned.com/) has over eleven billion accounts (that is, username and password combinations). This wouldn't be such a problem if users didn't reuse passwords across different applications and sites. But since they do, usernames and passwords don't meet Cosmo's Clown Store's needs. 

Next, consider password managers. These are built into modern browsers. There are also third party offerings like 1Password and LastPass. If you use the former, passwords aren't easily portable between different systems. There are also user experience issues with non-standard login forms. If you use the latter, the central servers which store password hashes are a hugely valuable target. Finally, as a webapp, you can't force users to use a password manager; at best you can strongly suggest it. Given the clownwear loving audience you are targeting, this means Cosmo's Clown Store will pass on this option as well.

Finally, additional factors of authentication, or [MFA](/learn/expert-advice/authentication/multi-factor-authentication) are a common way to increase account security. Your user accounts are more secure when requiring a time based code from a device or other additional factor of authentication. But will your users be okay with the experience? The friction involved in providing the additional factor can cause issues. And remember, you don't want to get in the way of customers logging in; otherwise you won't be able to sell them the red clown noses they so desperately desire.

All of these options are workable, but none are great. WebAuthn, in contrast, improves both security and user experience during login.

## Basics of WebAuthn

There are four entities which interact during a WebAuthn authentication event. Here's a diagram of the players:

{% include _image.liquid src="/assets/img/blogs/what-is-webauthn/webauthn-players.svg" alt="WebAuthn entities." class="img-fluid" figure=true %} 

The four entities are:

* The user (yellow smiley face)
* The authenticator (orange box)
* The browser (white globe)
* The website (blue box)

When a user attempts to login via WebAuthn, the communication goes from the website to the browser to the authenticator to the user (what the diagram shows), and then back up the chain.

WebAuthn is pretty useless by itself. WebAuthn standardizes the communication between the browser and a website. There's a related standard called CTAP2 which specifies the communication between the browser and an authenticator.

{% include _image.liquid src="/assets/img/blogs/what-is-webauthn/webauthn-ctap.svg" alt="WebAuthn and CTAP2." class="img-fluid" figure=true %} 

Together, WebAuthn and CTAP2 comprise a standard called FIDO2.

## What is an authenticator?

Of the four entities that participate in a WebAuthn login, you are likely familiar with users, browsers, and websites.

But what is the deal with authenticators?

An authenticator is simply a piece of hardware or software that fulfills these criteria:

* It knows how to talk CTAP2
* It can safely generate public and private keys

That's it.

There are two major categories of authenticators: platform and cross-platform. Platform authenticators are tied to one device, like a computer or tablet. They are often implemented in software, and can be built into the operating system as well.

Cross-platform authenticators are independent pieces of hardware which can be plugged into different devices. Examples of cross-platform authenticators include YubiKeys or Trezors.

There are options when it comes to authenticators, but what makes WebAuthn really exciting is that all of the major operating systems have implemented platform authenticators.

The operating systems often offer authentication methods which would be difficult for normal web developers to build or access outside of WebAuthn. This includes:

* Face ID from Apple
* Android fingerprint identification
* Windows Hello facial recognition

If you implement WebAuthn, you gain access to all of these authentication methods with little effort.

There are other authenticators which serve different purposes. The hardware authenticators fit certain use cases such as workforce or employee login. But they aren't a fit for for the Cosmo's Clown Store consumer ecommerce use case; normal folks typically don't have hardware authenticators.

## What does a WebAuthn process look like?

Let's get down to the nuts and bolts of implementing WebAuthn. To authenticate a user, you have to call this method in the browser. (It is a method on the `navigator` object because we're never going to forget Netscape Navigator.)

```javascript
navigator.credentials.get(options);
```

Of course, you might be wondering what is in the `options` object. Here's an excerpt, but there are quite a few variations. 

```javascript
options =  {
  publicKey: {
    rpId: "cosmosclownstore.com", // the identifier of the website
    challenge: “..." // one-time random string to prevent replay attacks
    userVerification: "preferred", // if you want the user to authenticate or just indicate presence
    // and more!
  }
}
```

When you make this function call, a request is made to the authenticator which interacts with the user. This is the part that CTAP2 takes care of. If all goes well, the user proves their identity and the authenticator populates and returns a results object, the `assertionResponse` below.

```javascript
navigator.credentials.get(options)
  .then(function (assertionResponse) {
    // Send authentication status to server 
  }).catch(function (err) {
    // No acceptable authenticator or user refused. 
  });
```

The following is a subset of the `assertionResponse` object, which has a number of fields:

```javascript
{
  signature : ..., // the signature generated by the private key over the contents of the response
  authenticatorData: {
    rpIdHash : ..., // hash of the requesting party Id to ensure you aren't getting a response from a different site
    flags : ..., // bit array including authentication results. This is what you check to ensure the user is authenticated.
    // and more!
  }, 
  clientDataJSON: {
    type: "webauthn.get",
    challenge: ... // should match initial challenge sent to prevent replay attacks.
    // and more!
  }
}
```

At this point, you post the data to cosmosclownstore.com, which validates the results. It should do that by checking the `signature`, `challenge` and `flags` fields. If these all check out, the user has authenticated, the same as if they'd used a username and password.

## The rest of the story

WebAuthn makes the interaction pretty simple. One FusionAuth developer said that the most complicated part of the browser implementation was converting to and from base64 to a byte array.

There is more, of course. You need to register the user's authenticator with your website, which is how you get the public key to check the signature. Registration uses a similar JavaScript call that I won't cover in this post, but there are examples linked below.

Other considerations include:

* how to store the public keys and associate them with a user
* what kind of WebAuthn options do you need to support
* how and when to prompt the user to login

But the communication with the authenticator? That's all taken care of by WebAuthn.

## Browser support

WebAuthn is a protocol describing communication between the browser and the website, and all major browsers support WebAuthn.

{% include _image.liquid src="/assets/img/blogs/what-is-webauthn/webauthn-browser-support.png" alt="Browser support for WebAuthn." class="img-fluid" figure=true %} 

Sorry, all you IE users! Other than that, if you use a browser, you should be good.

## Where can you learn more?

I hope I've convinced you that WebAuthn is worth a look. This is a standard with real world implementations. Websites like Best Buy are using this in the wild.

{% include _image.liquid src="/assets/img/blogs/what-is-webauthn/best-buy-webauthn.png" alt="WebAuthn login form at Best Buy." class="img-fluid" figure=true %} 

If you want to implement it yourself, learn more here: 

* [The WebAuthn standard](https://www.w3.org/TR/webauthn-2/)
* [The Mozilla Developer Network documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)
* [The Yubico WebAuthn Developer Guide](https://developers.yubico.com/WebAuthn/WebAuthn_Developer_Guide/)

