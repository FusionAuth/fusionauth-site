---
layout: blog-post
title: "Device Authorization Grant"
description: FusionAuth 1.11.0 adds Device Authorization Grant. Find out what this even means.
author: Matthew Altman & Trevor Smith
excerpt_separator: "<!--more-->"
categories: blog
tags:
- FusionAuth
- identity
- device
image: 
---

Have you ever had to authorize a device (Roku, AppleTV, XBox, etc) to enable a service for which you have subscribed (NetFlix, Amazon, Pandora, HBO, etc)?
We sure have. And we've experienced a broad range of usability with some solutions.
We have a large customer in the media provider industry who also needs such a solution. Read on to see what this latest feature looks like in FusionAuth.

<!--more-->

{% include _image.html src="/assets/img/blogs/roku_remote.png" class="img-fluid float-right mr-md-5" figure=false %}
## The problem
Logging into an account shouldn't be that difficult. But when you throw an Internet connected device into the mix, that doesn't have a traditional keyboard, then usability becomes a big issue.
Using a D-pad on a game controller, or the arrow keys on a remote control, to fumble your way through a virtual keyboard in order to enter your username and password can be a nightmare.
And since you're entering very long values which also have special characters and mixed-case, it's highly likely you will accidentally enter it wrong and have to start all over again.
<br/><br/><br/>

## The solution
In order to address this issue there is a proposed standard for the [Oauth2 Device Authorization Grant](https://tools.ietf.org/html/rfc8628).

{% include _image.html src="/assets/img/blogs/roku_activate.png" class="img-fluid mb-4 mt-2 mx-auto d-block" figure=false %}

We don't blame you if you didn't read that entire specification. So we read it for you, and the short of it is this...

When you initiate the login flow on a device, that device calls out to the Authorization Server (FusionAuth) which responds with a very short code and a URL.
These are displayed on the screen and the user is instructed to browse to that URL with another device (smartphone, tablet, computer) and enter the code.
The user will then need to log into the account for which they're trying to connect the device to. It will be much easier this time since they're on a device with a more friendly input.
Once the login is successful, then the original device is also instantly logged in, since it's been asking the Authorization Server periodically if the user has approved and completed authentication.

Our customer has a need for exactly that. To enable their users to log into their app on a variety of set-top boxes, using an easy and intuitive mechanism, in order to access media from their account.
We at FusionAuth are providing this functionality for our customer, and ultimately for all of our customers, released in version 1.11.0.

## What it looks like in FusionAuth
Some new configuration has been added in the FusionAuth admin site, as well as the API, to support this.
The Oauth configuration for an Application has a new Grant Type of `Device`, which enables the Device Authorization Grant workflow in FusionAuth.
Also required for the grant is the `Device Verification URL`. This is the URL that will be displayed to the end user where they will enter their short code.

The Advanced Configuration for a Tenant also has some new configuration. The `Device Grant User Code` generator is where you can specify what that short code looks like. It can be all numbers, all alpha, both, or encoded bytes (however, we don't recommend using encoded byte codes for interactive work-flows).
We've taken the liberty to remove 'zero', 'one', and vowels from the possible characters to help remove issues with characters that look similar, and to eliminate naughty words from accidentally being generated.  You can also specify how long you want this code to be. 
The `Device Grant Code` duration is the time in seconds that the code will remain valid. To reduce brute force hacking the code can't be valid forever, but this value is configurable for your needs.

The app that is installed on the device will call our new `/oauth2/device_authorize` endpoint to initiate the flow. This will respond with:
- `user_code` - the short code that the user will be prompted to enter
- `verification_uri` - the URL the user will be asked to browse to in order to enter the code
- `verification_uri_complete` - the same URL but has the user_code appended onto it, so you can do cool things like generate a QR Code so the user can simply scan it and not even have to enter the code
- `device_code` - this is a unique code that is tied to the user_code; the device uses this to poll FusionAuth 
- `expires_in` - how long until the code is no longer valid
- `interval` - how often the device should poll FusionAuth

So once the device has all of this information and displays the URL and Code to the user, then it starts repeatedly making calls to the FusionAuth `/oauth2/token` endpoint.
There are a few different errors that it may receive back:
- `authorization_pending` - this is the normal one that just means the user hasn't entered their code yet, so the device should keep trying
- `slow_down` - the device is calling FusionAuth too fast, it should slow down a little bit
- `access_denied` - the user denied the authorization request, the device should stop trying
- `expired_token` - the code has expired, the device should stop trying and possibly ask to restart everything

Or, after the user has entered their code and logged in, then the call will succeed and return the `access_token` and optional `refresh_token`. The device has what it needs and is done at this point.

While the device is busy asking "Are we there yet?", the user has browsed to the URL displayed to them. This can be a simple form hosted by the customer, or it can be redirected to our already created and themeable `oauth2/device` page.
If the customer has their own page, it will simply need to call `oauth2/device/validate` in order to validate the code entered by the user, and if the code is good, then call `oauth2/authorize`.

That's it! The rest of the logic added to our existing `/oauth2/token` and `/oauth2/authorize` endpoints will handle the checking and validating of the `device_code` and `user_code`, including their expiration.

## Play with it
Read the new tutorial that explains how to implement this in more detail.

Check out the updated API docs which lay out changes and additions to the [Oauth2 API](/docs/v1/tech/oauth/endpoints).

Download [fusionauth-device-grant-example](https://github.com/FusionAuth/fusionauth-device-grant-example) which is a toy example app that represents the device side of the workflow. With it and [FusionAuth](/) you can have a complete working example of the Device Authorization Grant.

## FusionAuth Is Always Improving
We test and update FusionAuth constantly to ensure that we are providing you with the most flexible and powerful identity and access management solution. If you find a bug or have any questions, let us know either at [GitHub](https://github.com/FusionAuth/fusionauth-issues "Jump to GitHub") or [StackOverflow](https://stackoverflow.com/questions/tagged/fusionauth "Jump to StackOverflow") and we’ll take a look.

## Learn More About FusionAuth
FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available at the best price. We provide registration, login, passwordless login, SSO, MFA, data search, social login, user management and more, 100% free for unlimited users.

[Learn More](/ "FusionAuth Home"){: .btn .btn-primary}
