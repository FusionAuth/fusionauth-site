---
layout: blog-post
title: Introducing FusionAuth Reactor™ with Breached Password Detection
description: FusionAuth Version 1.15.0 introduces FusionAuth Reactor™ with Breached Password Detection
author: Bryan Giese
excerpt_separator: "<!--more-->"
categories: blog
tags:
image: blogs/version-1-15-0-reactor-editions.png
---

We've been heads-down and cranking code for the first few weeks of 2020 and are excited to announce the release of FusionAuth Version 1.15.0. While [the last two releases have included several new features and fixes](/docs/v1/tech/release-notes), 1.15.0 has something we're super stoked about: **FusionAuth Reactor™**.

<!--more-->
{% include _image.html src="/assets/img/blogs/fusionauth-reactor-header-2x.png" alt="FusionAuth Reactor heading" class="img-fluid w-100 w-xl-50 w-l-50 w-md-75 mt-2" figure=false %}
Built with a fire-forged, vibranium-authenticatium alloy, FusionAuth Reactor is a set of advanced components that extend FusionAuth's core functionality. It's designed for applications that need to proactively address the rising threat of our hack-happy internet community, as well as eliminate dev time required for more complex use cases and integrations. The first bundle of components will be released over the next few weeks and includes features designed to prevent security meltdowns in any app.

### Up First: Breached Password Detection
The first feature available now in the Reactor toolset is **Breached Password Detection**. This component gathers publicly-available breached datasets, then compares your users' passwords to detect, expose and discourage the use of insecure username/password combinations for login.

Developers can choose to trigger a data comparison at account setup, during a password change, or at a user's next login. This flexibility allows for retroactive password clean-up in established databases, as well as on-going checks as new data sets become available. When a positive match is found, administrators can decide what action to take: require the user to immediately select a different password, notify the user by email, or internally log their use of a breached password for later action.

By activating this feature and combining it with our already powerful password constraint controls, users become more aware of password security strategies, and are less vulnerable to cross-site attacks. Another bonus is when a hacker releases the spoils of their hack on the web, FusionAuth gets more secure. Talk about PWNED!

### More Reactor Components on Tap
Stay tuned for more details on the upcoming Reactor components, and if you have [an idea you'd like to see added to FusionAuth, jump over to GitHub](https://github.com/FusionAuth/fusionauth-issues/issues) and let us know about it. We're always adding in new capability suggested by our active user and developer community.

{% include _image.html src="/assets/img/blogs/fusionauth-editions-header-2x.png" alt="FusionAuth Editions heading" class="img-fluid w-100 w-xl-50 w-l-50 w-md-75 mt-2" figure=false %}
Not every application will require advanced Reactor components. In fact, we have a few on the roadmap that only our largest enterprise clients have requested. So, in order to keep the FusionAuth core as lean as possible, we are introducing **FusionAuth Editions**. Don't worry, you still can download and deploy FusionAuth for free. That's the always available **FusionAuth Community Edition**, and that's not changing.

The difference is now, you're able to activate the advanced components of Reactor and get a support package with just a few clicks. Simply activate **FusionAuth Premium Edition** or **FusionAuth Enterprise Edition** and you'll get the Reactor components plus be able to choose the support options you need. Whether you need answers on workdays, or 24/7 "I'm up if you're up" support, we have an option that fits your needs and your budget. Check out the [FusionAuth Pricing](/pricing) page and let us know what you think.

If you have any questions about FusionAuth Reactor, FusionAuth Editions, or anything else, don't be shy. Reply to us here, or [jump to the Community page](/community) and get connected where it works best for you. We have Open Office Hours every month, so sign up and drop in. We'd love to talk with you.

## Learn More About FusionAuth
FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available at the best price. We provide registration, login, SSO, MFA, data search, social login, user management and more, native HYPR integration for passwordless and biometric login and more, 100% free for unlimited users. [Find out more](/ "FusionAuth Home") about FusionAuth and download it today.

[Learn More](/){: .btn .btn-primary}
