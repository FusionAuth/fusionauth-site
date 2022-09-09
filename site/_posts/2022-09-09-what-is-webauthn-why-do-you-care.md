---
layout: blog-post
title: What is WebAuthn and why do you care?
description: WebAuthn is a new standard which helps secure user accounts and also improves user experience. What could be better?
author: Dan Moore
image: blogs/sso-explanation/how-sso-works.png 
category: blog
tags: topic-single-sign-on
excerpt_separator: "<!--more-->"
---

WebAuthn is a revolutionary new way for people to authenticate themselves. It's a widely supported standard years in the making, and all all major browsers work with it. This makes it easy for developers to incorporate it into their website. WebAuthn allows users to leverage the power of biometric, device and other types of authentication via a simple, consistent, browser-native user experience.

<!--more-->

Am I overstating things? Read on and decide for yourself.

## What is WebAuthn?

WebAuthn is another way for users to authenticate online. It is a different type of credentials than the typical username/email and password. It requires something called an "authenticator".

The most important thing about WebAuthn is that it removes the need for a system to store a hashed password. Instead, the system stores a public key. The corresponding private key is held securely by the authenticator.

The types of asymmetric keys that this keypair supports, how the public key is distributed to the system, and how the public/private keypair is used to authenticate a user is all specified by the WebAuthn standard.

## Why consider WebAuthn?

Let's walk through a scenario to illustrate the value of WebAuthn. You're running a website that sells clownwear (it's the next iteration of athleisure, except instead of wicking fabric you have clown noses and big wigs). It's called "Cosmo's Clown Store", and you want your users to be able to log in to favorite items and place orders.

This website is aimed at normal folks (not a whole lot of crossover between the geek and clownwear market), but it is also an ecommerce company, so if someone's credentials are stolen, they could be on the hook for the illicit credit card transactions. You want to balance security of authentication with an easy user experience. 

Why would you choose to implement WebAuthn? Aren't the current solutions for credentials just fine?

### What's wrong with current solutions

Let's look at three common current solutions for securing customer accounts:

* Passwords
* Password managers
* Multi-factor authentication (MFA)

Passwords are a well known technology. They've been around since the 1960s and have the virtue of being well understood by many users. However, there's a tension when you require passwords. You want someone to choose a password that is memorable, but difficult to guess. That's a hard balance.

There's also the issue that many many passwords have been leaked. [Have I Been Pwned](https://haveibeenpwned.com/) has over eleven billion accounts (that is, username and password combinations) that have been compromised. This wouldn't be such a problem if passwords weren't reused across different applications and sites. But since they are, Cosmo's Clown Store isn't going to use them. 

Next up, password managers. These are built into many browsers and there are also third party offerings like 1Password and LastPass. If you use the former, the passwords aren't portable and may have issues with non-standard login forms. If you use the latter, the central servers that store the passwords become a big giant target. Plus, you can't force your users to use a password manager; you can at best suggest it strongly.

Finally, additional factors of authentication, or [MFA](/learn/expert-advice/authentication/multi-factor-authentication). You can make your user accounts more secure by requiring a time based code from a device or other aditional factor of authentication. But will your users be happy? The additional friction involved in providing the additional factor might cause issues.

WebAuthn allows you to leverage support from all the browsers to improve both security and user experience during a login.

## Basics of WebAuthn

There are four entities in a WebAuthn authentication. Here's a diagram of the players:

{% include _image.liquid src="/assets/img/blogs/what-is-webauthn/webauthn-players.svg" alt="WebAuthn entities." class="img-fluid" figure=true %} 

* The user (the yellow smiley face)
* The authenticator (orange box)
* The browser (white globe)
* The website (blue box)

When a user attempts to login via WebAuthn, the communication goes from the website to the browser to the authenticator to the user, and then back up the chain, all the way to the website.

WebAuthn is actually pretty useless by itself. WebAuthn specifies the communication between the browser and a website. There's a sister standard called CTAP2 which specifies the communication between the browser and an authenticator. Together, WebAuthn and CTAP2 are a standard called FIDO2.

{% include _image.liquid src="/assets/img/blogs/what-is-webauthn/webauthn-ctap.svg" alt="WebAuthn and CTAP2." class="img-fluid" figure=true %} 

## What is an authenticator?

Of the four entities that participate in a WebAuthn login, you are likely know about users, browsers, and websites. But what is the deal with authenticators?

An authenticator is a piece of hardware or software that fulfills these criteria:

* It knows how to talk CTAP2
* It can safely generate public and private keys

That's it.

There are two major categories of authenticators: platform and cross-platform. Platform authenticators are tied to one device, like a computer or tablet. Cross-platform authenticators are independent pieces of hardware which can be pluged into multiple computing devices, like a Yubikey or Trezor device.

There's a wide variety of options when it comes to authenticators, but what makes WebAuthn really exciting is that all of the major operating systems have implemented it as platform authenticators. The operating systems often tie the authentication attempt into methods which would be extremely difficult for normal web developers. This includes:

* Face ID from Apple
* Android fingerprint identification
* Windows Hello facial recognition

If you implement WebAuthn, you get access to all of these authentication methods for free.

There are other authenticators out there for different purposes as well. As mentioned, there are hardware authenticators. These are good for certain use cases, but not for Cosmo's Clown Store; normal people don't have hardware authenticators.

## What does WebAuthn look like?

From the browser perspective, to authenticate a user, you have to call this method (against the `navigator` object because we're never going to forget Netscape Navigator):

```javascript
navigator.credentials.get(options);
```

Of course, you have to create the `options` object. Here's an example, but there are quite a few variations. 

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

When you make the call, the request is made to the authenticator which interacts with the user. If all goes well, the user authenticates and the authenticator populates and returns an object.

```javascript
navigator.credentials.get(options)
  .then(function (assertionResponse) {
    // Send authentication status to server 
  }).catch(function (err) {
    // No acceptable authenticator or user refused. 
  });
```

The following information is a subset of the `assertionResponse`:

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

At this point, you can post the data to the website, which can validate the results to ensure it knows the user. It should do that by checking the `signature`. After that, the user is logged in, just the same as if they'd used a username and password.

For completeness, you also need to make a call to register the user's authenticator with your website. That's how you get the public key. That's a similar set of JavaScript operations that I won't examine here, but there's examples in the MDN, linked below.

One FusionAuth developer said that the most complicated part of the browser implementation was converting to and from base64 to a byte array.

There's a lot more to implement, but that's the basics. Other things you need to think about are how to store the public keys, what kind of options to support, how and when to prompt the user to login, and more.

But the actual communication with the authenticator? That's all taken care of.

## Support

WebAuthn is the protocol between the browser and the website. The browser is responsible for talking to the authenticators. All the major browsers support WebAuthn.

{% include _image.liquid src="/assets/img/blogs/what-is-webauthn/webauthn-browser-support.png" alt="Browser support for WebAuthn." class="img-fluid" figure=true %} 

Sorry, all you IE users! Other than that, if you use a browser, you should be good.

## Where can you learn more?

I hope I've convinced you that WebAuthn is worth a look.

This is a real standard, with websites like Best Buy using this in the wild.

{% include _image.liquid src="/assets/img/blogs/what-is-webauthn/best-buy-webauthn.png" alt="WebAuthn login form at Best Buy." class="img-fluid" figure=true %} 

If you want to implement it yourself, you can learn more here: 

* [The WebAuthn standard](https://www.w3.org/TR/webauthn-2/)
* [The Mozilla Developer Network documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)
* [The Yubico WebAuthn Developer Guide](https://developers.yubico.com/WebAuthn/WebAuthn_Developer_Guide/)
