---
layout: blog-post
title: New Feature - Social Login for Facebook, Google, Twitter & More
description: It's easy to enable social logins like Facebook, Google, Twitter and OpenID Connect with FusionAuth.
author: Bryan Giese
categories: blog
image: blogs/identity-providers-screen.png
---

You need social? We got social. Our newest update to FusionAuth makes it simple to enable social logins like Facebook, Twitter, and Google for all your applications. You can also connect and configure any generic OpenID Connect-based identity providers with simple configuration steps. On successful registration, we call the provider API to retrieve and store user information so you have an up-to-date user record.
<!--more-->

{% include _image.html src="/assets/img/blogs/social-login-signin-screen.png" alt="Social Login Screen" class="float-left img-thumbnail mr-md-4" style="max-width: 200px;" figure=false %}

To get set up, simply go to **Settings > Identity Providers** in your FusionAuth dashboard. Then tap **Add provider** to select which to enable and configure. It's that easy. Read [the documentation here](/docs/v1/tech/identity-providers/).

## But wait, there's more!

Most auth solutions just authenticate users. FusionAuth always gives you advanced user management for all your users no matter how they decide to log in. Then you can assign permissions to individuals and groups, monitor user activity and generate detailed reports across all identity providers and applications.

Could you build all that on your own for every social network your users want? Maybe. Would it be worth the time, money and effort it would take to build and maintain it? Not a chance. Quit screwing around re-building authentication when it's already here for free. Put your dev time into the features that will earn you revenue.

Let us know what you think about this new feature, the tutorial and the video. Also, if you need assistance building your login theme, [reach out](/contact) and we can lend a hand.
