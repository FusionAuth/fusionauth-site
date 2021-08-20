---
layout: blog-post
title: Announcing FusionAuth 1.30
description: The FusionAuth 1.30 releases a robust suite of Advanced Threat Detection features, a JWT vending machine, myriad webhook events, and more.
author: Akira Brand
image: blogs/release-1-30/product-update-fusionauth-1-30.png
category: blog
tags: topic-troubleshooting, feature-advanced-threat-detection
excerpt_separator: "<!--more-->"
---

We're excited to announce the release of version 1.30.0 of FusionAuth. This version shipped on August 12, 2021. 1.30.0 includes a robust Advanced Threat Detection feature, adds 38 webhook events, resolves issues for FusionAuth community members and customers, and more! 

<!--more-->

This release contained a number of features, enhancements, and bug fixes. Please see the [release notes](/docs/v1/tech/release-notes/#version-1-30-0) for a full breakdown of the changes between 1.29 and 1.30.0. 

There are a few items worth calling out.

## JWT Vending Machine

There are scenarios where a user does not yet exist, or is in the process of being created and needs access to services. This may be an anonymous user, who will never authenticate, or a future user, who is using the site, but has not yet authenticated. Imagine a prospective user clicking around a recipe site. They may want to save recipes without signing in.  But when they do finally create an account and sign in, they expect their saved recipes to still be attached to their account.  In these cases we cannot yet authenticate to FusionAuth.

To solve this, we have created the possibility of opening an API that allows a JWT to be created with a payload defined by the API called.  This would require an API key, so the caller must be privileged.  

When you call the endpoint with the below input: , you'll get back a signed JWT, which, when decoded and validated, will look like the below output: "

Endpoint: /api/jwt

```

{
  "claims": {
     "roles": [ "awesome" ],
     "id": 42
   }
}
```

Using this ability, a new user on your app can start interacting with the app as a unique user, before needing to create an account. Then, once they do create an account, the unique Id can be used to ensure any saved profile data is retained. 

## Threat Detection Feature

This is a paid feature, available to enterprise-level customers only. If you already on enterprise, turning this feature on requires a support ticket, as we are rolling this out over time. 

Flagging and responding to suspicious behavior is a huge advantage in any cybersecurity product, so naturally, we incorporated this functionality into the ever-evolving FusionAuth platform. In this release of FusionAuth, we use IP location data, user fingerprinting, and other indicators around user events to signal suspicious behavior. 

While the entirety of this feature is too large to cover here, we want to call out a few notable aspects.

Customizable rate limiting per user for specific requests such as:
 - Failed login.
 - Forgot password.
 - Send email verification.
 - And more.

{% include _image.liquid src="/assets/img/blogs/release-1-30/rate-limiting.png" alt="Example of the rate limiting settings on the admin dashboard." class="img-fluid" figure=false %}
 
Captcha - Uses additional (re)captcha to guard against brute force attacks. 
- Adds a (re)captcha for login pages.
- Includes support for Google ReCaptcha v2, Google ReCaptcha v3, HCaptcha and Hcaptcha Enterprise.

Location aware security
- Includes the geographic location where a Forgot/Reset Password email was created, so the recipient can identify if the location is genuinely their request or not. 
- Flags suspicious IP addresses on login and sends an email to notify the user of a new login with the IP's approximate location.
- Calculates 'impossible travel' to see if a user could realistically login in different locations around the globe in a reasonable time frame. (This does not provide support if your user is a quantum being...)
- When a login request occurs from an unexpected IP addresses, sends a user an email to notify them of a new login with an approximate location of the IP address. 

To learn more, you can take a look at our [release notes](/docs/v1/tech/release-notes/#version-1-30-0). 

## Webhook Events

We've added 38 webhook events to help you monitor what is going on with your app.  These webhooks cover an entire breadth of creating, updating, and deleting a user, as well as the user registration and password reset lifecycle. Lastly, we've added some webhook events to monitor any kickstart files you may create and also webhooks to monitor the behavior of JWTs. 

We're working on the documentation for these webhooks, which will be available [here](https://fusionauth.io/docs/v1/tech/apis/webhooks/#overview) shortly.

## The rest of it

Some of the other enhancements and fixes included in this release:

* Search on `oldValue`, `newValue`, and `reason` in the Audit Log.
* More themed pages have access to the currently logged user using the `currentUser` variable.
* When an IdP has a linking mode other than Create Pending Link, the token is now stored correctly in the Identity Provider Link object.
* Making an API request to `/api/two-factor/login` with an empty JSON body, an exception now occurs instead of returning a validation error with a `400` status code. This has been fixed. 

## Upgrade at will

The [release notes](/docs/v1/tech/release-notes/#version-1-30-0) are a guide of the changes, fixes, and new features. Please read them carefully to see if any features you use have been modified.

If you'd like to upgrade your self-hosted FusionAuth instance, see our [upgrade guide](/docs/v1/tech/installation-guide/upgrade/). 

If you have a FusionAuth Cloud deployment, proceed to the "Deployments" tab on your [account dashboard](https://account.fusionauth.io/account/deployment/){:target="_blank"} and upgrade your servers. If you have any questions about the upgrade, [please open a support ticket](https://account.fusionauth.io/account/support/){:target="_blank"}.

Or, if we've piqued your interest and you'd like to use FusionAuth, [check out your options](/pricing/).
