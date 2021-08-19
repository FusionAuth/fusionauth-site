---
layout: blog-post
title: Announcing FusionAuth 1.30.0
description: The FusionAuth 1.30.0 releases a robust suite of Advanced Threat Detection features, a JWT vending machine, myriad webhook events, and more.
author: Akira Brand
image: blogs/release-1-30/product-update-fusionauth-1.30.png
category: blog
tags: topic-troubleshooting
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.30.0 of FusionAuth. This version shipped on August 12, 2021. 1.30.0 includes a robust Advanced Threat Detection feature, adds 38 webhook events, resolves issues for FusionAuth community members and customers, and more! 

<!--more-->

This release contained a number of features, enhancements, and bug fixes. Please see the [release notes](/docs/v1/tech/release-notes/#version-1-30-0) for a full breakdown of the changes between 1.29 and 1.30.0. 

There are a few items worth calling out.

## JWT Vending Machine

There are scenarios where a user does not yet exist, or is in the process of being created and needs access to services. This may be an anonymous user, or a future user. In these cases we cannot yet authenticate to FusionAuth because the user does not yet exist, or they may not yet have a password.

To solve this, we have created the possiblity of opening an API that allows a JWT to be created with a payload defined by the API called.  This would require an API key, so the caller must be privledged.  

Here is an example of the endpoint at work: 

Endpoint: /api/jwt

```

{
  "claims": {
     "roles": [ "awesome" ],
     "id": 42
   }
}
```

Using this ability, a new user on your app can start interacting with the app as a unique user, before needing to create an account. Then, once they do create an account, their unique Id is translated onto their profile. 

## Threat Detection Feature

Flagging and responding to suspicious behaviour is a huge advantage in any cybersecurity product, and we wanted to bring our customers as many advantages as we could in this arena. So, we created a large feature that has best-practice funtionality built in to deal with any sort of bizarre behaviours around user creation, user updates, and IP location and fingerprinting. 

While the entirety of this feature is too large to cover here, we want to call out a few notable aspects:

Rate limiting per user for specific requests such as:
 - Failed login
 - Forgot password
 - Send email verification
 - Send passwordless
 - Send registration verification
 - Send two-factor
 
Capcha - Uses additonal (re)captcha to guard against brute force attacks. 
- Adds a (re)captcha for login pages which use an email/password combination
- Adds support for Google ReCaptcha v2, Google ReCaptcha v3, HCaptcha and Hcaptcha Enterprise

IP Location Services
- Includes the IP address of the geographic location where a Forgot/Reset Password email was created, so the recipient can identify if the location is genuinely their request or not. 
- Flags suspicious IP adddresses on login and sends an email to notify the user of a new login with the IP's approximate location
- Calculates 'impossible travel' to see if a user could genuinely login in different locations around the globe in a reasonable time frame. (This does not provide support if your user is a quantum being...)
- With unexpected IP addresses, sends a user an email to notify them of a new login with an approximate location of the IP address. 

To learn more, you can take a look at our [release notes](/docs/v1/tech/release-notes/#version-1-30-0). 

## Webhook Events

We've added 38 webhook events to help you moniter what is going on with your app.  These webhooks cover an entire breadth of createing, updated, and deleting a user, as well as the user registration and password reset lifecycle. Lastly, we've added some webhook events to moniter any kickstart files you may create, as well as moniter JWT behavior with refresh tokens and public/private keypairs are updated. 

## The rest of it

Some of the other enhancements and fixes included in this release:

* search on `oldValue`, `newValue`, and `reason` in the Audit Log
* More themed pages have access to the currently logged in user using the `currentUser` varible
* Using an IdP with a linking mode other than Create Pending Link, the token is now stored correctly in the Identity Provider Link
* Making an API request to `/api/two-factor/login` with an empty JSON body, an exception now occurs instead of returning a validation error with a `400` status code. 

## Upgrade at will

The [release notes](/docs/v1/tech/release-notes/#version-1-30-0) are a guide of the changes, fixes, and new features. Please read them carefully to see if any features you use have been modified.

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/installation-guide/upgrade/). 

If you have a FusionAuth Cloud deployment, proceed to the "Deployments" tab on your [account dashboard](https://account.fusionauth.io/account/deployment/){:target="_blank"} and upgrade your servers. If you have any questions about the upgrade, [please open a support ticket](https://account.fusionauth.io/account/support/){:target="_blank"}.

Or, if we've piqued your interest and you'd like to use FusionAuth, [check out your options](/pricing/).
