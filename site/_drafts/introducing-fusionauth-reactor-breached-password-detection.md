---
layout: blog-post
title: Introducing FusionAuth Reactor™ with Breached Password Detection
description: FusionAuth Version 1.15.0 introduces FusionAuth Reactor™ with Breached Password Detection. Ensure your users aren't using insecure passwords at login.
author: Bryan Giese
excerpt_separator: "<!--more-->"
categories: blog
tags:
image: blogs/version-1-15-0-reactor-editions.png
---

We said we would be cranking on new features and we meant it. Version 1.15.0 is now available and introduces an exciting new component called **FusionAuth Reactor™**.

<!--more-->
{% include _image.html src="/assets/img/blogs/fusionauth-reactor-header-2x.png" alt="FusionAuth Reactor heading" class="img-fluid w-100 w-xl-50 w-l-50 w-md-75 mt-2" figure=false %}
Built from a fire-forged, vibranium-authenticatium alloy, FusionAuth Reactor is a suite of new features that extends FusionAuth's core functionality. The first feature is now available for any paid Edition of FusionAuth (more about this below).

### Up First: Breached Password Detection
The first feature available as part of Reactor is **Breached Password Detection**. We collected hundreds of millions of compromised usernames and passwords from numerous breached databases. FusionAuth can now check passwords to ensure that they don’t exist in any of these databases.

Breached Password Detection can be enabled during these events:

- Account creation
- Password reset or change
- During login

This flexibility allows for retroactive password clean-up for existing users as well as restricting the use of breached passwords for new users. When Reactor determines that a password has been breached, FusionAuth can be configured to take one of these actions:

- Force a password change
- Notify the user by email
- Mark the user as having a breached password for later reporting and action

By activating this feature and combining it with our already powerful password constraints, you can ensure your users are secure and using the latest recommended password rules. Plus, as new breached databases become available on the dark web, we’ll be adding them to Reactor and your FusionAuth will automatically be updated.

### More Reactor Components on Tap
Stay tuned for more details on the upcoming Reactor features. Also, if you have [an idea you'd like to see added to FusionAuth, jump over to GitHub](https://github.com/FusionAuth/fusionauth-issues/issues) and let us know about it. We're always adding in new features suggested by our active user and developer community.

{% include _image.html src="/assets/img/blogs/fusionauth-editions-header-2x.png" alt="FusionAuth Editions heading" class="img-fluid w-100 w-xl-50 w-l-50 w-md-75 mt-2" figure=false %}
With the addition of FusionAuth Reactor, we've renamed our Support packages to **FusionAuth Editions**. Our new Editions will now include the premium features of Reactor as well as support for FusionAuth. Don’t worry though, FusionAuth still has a Community Edition that will always be free.

With the new FusionAuth Editions, you will get instant access to all of the Reactor features as well as access to FusionAuth support. Whether need a few questions answered or you need 24x7x365 access to the FusionAuth dev team, there is an Edition that has you covered.

You can [purchase the Premium or Enterprise Edition of FusionAuth](/pricing) directly from the website. Or feel free to [reach out to our sales team](/contact) to build a custom solution that fits your needs.

If you have any questions about FusionAuth Reactor, FusionAuth Editions, or anything else, don't be shy. Reply to us here, or [jump to the Community page](/community) and get connected where it works best for you. We have Open Office Hours every month, so sign up and drop in. We'd love to talk with you.

## Learn More About FusionAuth
FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available at the best price. We provide registration, login, SSO, MFA, data search, social login, user management and more, native HYPR integration for passwordless and biometric login and more, 100% free for unlimited users. [Find out more](/ "FusionAuth Home") about FusionAuth and download it today.

[Learn More](/){: .btn .btn-primary}
