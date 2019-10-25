---
layout: blog-post
title: "How To: OAuth Device Authorization for Roku, AppleTV, and XBox"
description: "How To: OAuth Device Authorization for Roku, AppleTV, and XBox and more. FusionAuth's 1.11.0 update makes it simple."
author: Matthew Altman & Trevor Smith
excerpt_separator: "<!--more-->"
categories: blog
tags:
- FusionAuth
- identity
- device
image: blogs/oauth-device-authorization-grants.png

---

If you have a modern entertainment device like a Roku, AppleTV, XBox, Playstation, etc., there's a good chance that at some point you will want to connect to one or more subscription services like NetFlix, Amazon, Pandora, or HBO. In theory it should be easy. It's your device and your service, so just turn it on and go right? Sadly, no. We've gone through it, and the reality is it's not the best way to start off an evening of relaxation. Depending on the device and the service, you're almost guaranteed to hit a broad range of usability issues. TV remotes and game controllers were never designed to handle the kind of text input that is frequently used to get everything connected. We were recently asked by one of our clients, a large media provider, to provide a solution to this problem and OAuth Device Authorization Grants were the key to it all.  

<!--more-->

{% include _image.html src="/assets/img/blogs/roku_remote.png" class="img-fluid float-right mr-md-5" figure=false %}
## The Problem
We login to accounts all the time using our phones and computers. We know how to do that. It shouldn't be that difficult on another device, right? The problem is Internet connected boxes like XBox and AppleTV don't have a readily available keyboard or tap input system. Suddenly usability becomes a big issue. Fumbling your way through a virtual keyboard to enter your username and password using a D-pad on a game controller or the arrow keys on a remote control can be a nightmare. And since most services ask you to enter very long, complex keycodes with all sorts of special characters and mixed-case letters, it's highly likely you will accidentally enter it wrong and have to start all over again.
<br/><br/><br/>

## The Solution
In order to address this issue there is a proposed standard for the [Oauth2 Device Authorization Grant](https://tools.ietf.org/html/rfc8628).

{% include _image.html src="/assets/img/blogs/roku_activate.png" class="img-fluid mb-4 mt-2 mx-auto d-block" figure=false %}

There's twenty pages of details there, so we don't blame you if you didn't read the entire specification. We read it, and here's the short of it. (For this example, we are trying to connect our Roku device to a Netflix subscription.)

- When you initiate the login flow on the Roku, the Roku calls out to an Authorization Server.
- The Authorization Server responds with a very short code and a URL.
- The short code and URL are displayed on the Roku screen.
- The user is instructed to browse to that URL with another device like a smartphone and enter the code.
- The user then needs to use the smartphone to login to their Roku account. It should be much easier this time since they're on their smartphone with a more friendly input.
- Once the login is successful, then the Roku is instantly logged in since it's been asking the Authorization Server periodically if the user has completed authentication and has been approved.

In general, that's the whole flow. Pretty simple, right? If you are integrating this into your application, make sure you understand all the details of the specification. It provides useful details on items like security and usability that will give your users a more secure and easy-to-follow experience.

## What It Looks Like in FusionAuth
Recently, one of our clients had this exact need, and asked us if we could add it to the FusionAuth platform. They wanted their users to be able to log into their app on a variety of set-top boxes in order to access media from their account. It needed to be an easy and intuitive mechanism so users didn't get frustrated and abandon the process. Of course we said yes, and are happy to announce that we are releasing this powerful feature in version 1.11.0.

### OAuth Configuration Grant Type
To accomplish this, we added new configuration options in the API and the FusionAuth admin site. First, the OAuth configuration for an Application has a new Grant Type of `Device`, which enables the Device Authorization Grant workflow in FusionAuth. We also added a `Device Verification URL` which is required for the grant. This is the URL that will be displayed to the end user where they will enter their short code. Ideally, this is a very short, branded URL.

### Device Grant User Code
We also added new configuration to Advanced Configuration for a Tenant. The `Device Grant User Code` generator is where you can specify what the short code that the user receives looks like. It can be all numbers, all alpha, both, or encoded bytes. (We don't recommend using encoded byte codes for interactive work-flows, but you can do it.)
We've taken the liberty to remove 'zero', 'one', and vowels from the possible characters to help eliminate issues with characters that look similar, and to prevent profanity from accidentally being generated. You can also specify how long you want this code to be.
The `Device Grant Code` duration is the time in seconds that the code will remain valid. To reduce brute force hacking the code can't be valid forever, but this value is configurable for your needs.

### How It Works
The app that is installed on the device will call our new `/oauth2/device_authorize` endpoint to initiate the flow. This will respond with:
- `user_code` - The short code that the user will be prompted to enter.
- `verification_uri` - The URL the user will be asked to browse to in order to enter the code.
- `verification_uri_complete` - The same URL but has the `user_code` appended onto it. This let's you do cool things like generate a QR Code so the user can simply scan it and not even have to enter the code.
- `device_code` - This is a unique code that is tied to the `user_code`; the device uses this to poll FusionAuth.
- `expires_in` - Defines how long until the code is no longer valid.
- `interval` - Defines how often the device should poll FusionAuth.

Once the device has all of this information and displays the URL and Code to the user, it starts repeatedly making calls to the FusionAuth `/oauth2/token` endpoint.
There are a few different errors that it may receive back:
- `authorization_pending` - This is the normal one that just means the user hasn't entered their code yet, so the device should keep trying.
- `slow_down` - The device is calling FusionAuth too fast, it should slow down a little bit.
- `access_denied` - The user denied the authorization request, the device should stop trying.
- `expired_token` - The code has expired, the device should stop trying and possibly ask to restart everything.

While the device is busy asking "Are we there yet?", the user should be browsing to the URL displayed to them on their screen. This can be a simple form hosted by the client, or it can be redirected to our pre-built and themeable `oauth2/device` page.
If the customer has their own page, it will simply need to call `oauth2/device/validate` in order to validate the code entered by the user. If the code is good, then call `oauth2/authorize`.

After the user has entered their code and logged in, then the call will succeed and return the `access_token` and optional `refresh_token`. The device has what it needs and is done at this point.

That's it! The rest of the logic added to our existing `/oauth2/token` and `/oauth2/authorize` endpoints will handle the checking and validating of the `device_code` and `user_code`, including their expiration.

## Try It Yourself
We're excited to offer this new feature in FusionAuth, and hope you take the time to try it out for yourself. For more information:
- Read this [tutorial](/docs/v1/tech/oauth/overview#example-device-authorization-grant) that explains how to implement this with specific code examples.
- Check out the updated API docs which lay out changes and additions to the [Oauth2 API](/docs/v1/tech/oauth/endpoints).
- Download [fusionauth-device-grant-example](https://github.com/FusionAuth/fusionauth-device-grant-example) which is a toy example app that represents the device side of the workflow. With it and [FusionAuth](/) you can have a complete working example of the Device Authorization Grant.

## FusionAuth Is Always Improving
We test and update FusionAuth constantly to ensure that we are providing you with the most flexible and powerful identity and access management solution. If you find a bug or have any questions, let us know either at [GitHub](https://github.com/FusionAuth/fusionauth-issues "Jump to GitHub") or [StackOverflow](https://stackoverflow.com/questions/tagged/fusionauth "Jump to StackOverflow") and we’ll take a look.

## Learn More About FusionAuth
FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available at the best price. We provide registration, login, passwordless login, SSO, MFA, data search, social login, user management and more, 100% free for unlimited users.

[Learn More](/ "FusionAuth Home"){: .btn .btn-primary}
