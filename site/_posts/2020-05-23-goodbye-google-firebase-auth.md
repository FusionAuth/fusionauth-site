---
layout: blog-post
title: Good Bye Google Firebase Authentication
description: 
author: Hunter Melnick
image: blogs/news/blog-fusionauth-1-16.png
category: blog
excerpt_separator: "<!--more-->"
---

So. You want to add more security, more customization, and integrate all the bells
and whistles into your platform?

Well, like a lot of you, my standard used to be using Google Firebase Authentication for my
authentication needs because it is quick and easy.

But now folks there's a better way...

<!--more-->

Welcome to FusionAuth!

## Installation & Integration

I chose the self-hosting option when I installed FusionAuth, because it is free and
I'm all about saving money. 

Though the setup for both Google Firebase Authentication and FusionAuth were quick, you can't
get any quicker using Docker. I tried various installations
of FusionAuth, installing with Docker, Linux and on Windows. Enhancing the
search capabilities with the ElasticSearch integration furthers the speed of the
FusionAuth platform. ElasticSearch integration is not currently offered by Google
Firebase Authentication.

With a variety of [integrations](/docs/v1/tech/integrations/), including Kafka, CleanSpeak and Twilio. The
ability to have quality communication methods at your finger-tips are now possible
inside an already easy to use platform.

When I set up my instance of FusionAuth I chose to integrate with Twilio and it
took only seconds. I simply plugged in my information and then used their built-in
testing to send myself a quick test text message to test out the integration. That's
what I call quick two factor authentication integration.

FusionAuth recently hit a [100 million users in a load test](/blog/2019/02/26/got-users-100-million). Enhanced scalability is one
many features that set FusionAuth apart from the competitors, including Google
Firebase Authentication. When you need to plan to go from a 10,000 users to that million or more mark,
you will be happy to know that FusionAuth has you covered.

There is nothing worse than having customers who can't login to use your services.
FusonAuth performs rigorous [penetration testing](/features/security-data-compliance) to constantly assess the security
of their solution and to find more ways to improve and create additional security
measures. 

I don't have a million users on my apps right now, but I know if things
go well then I have the ability to scale accordingly. Now I can focus my energies
on marketing and creating new features and spend less effort on preparation for
scalability.

## Customization

FusionAuth offers an unprecedented amount of flexibility in being able to
customize just about everything. From [email templates](/docs/v1/tech/email-templates/) to [themes and localization](/docs/v1/tech/themes/) to
individual [application settings](/docs/v1/tech/core-concepts/applications). When you want to create an authentication platform
uniquely suited to your needs it seems that FusionAuth is more than suited to
handling those needs. 

I took the time to customize my roles, groups, logging
preferences, email templates, and application settings. Having the ability to create
multiple unique roles for different applications in FusionAuth was helpful to say
the least. 

TBD image of roles

I ended up creating custom web hooks to setup specific triggers within
my applications. Even changing the theme styles for my login page and registration
page were easier than I thought. Seems like anything that I would need to
customize was available to be customized. And, I have to say that my logo
looks smoothly integrated in the top left of the screen.

This flexibility throughout FusionAuth encourages a high amount of customization
of your platform. While Google Firebase Authentication is built in a much simpler way for a
broader appeal to those who want to get started with authentication, FusionAuth
works on finishing what Google Firebase Authentication began.

I enjoy the sleek interface of FusionAuth and the ability to easily see the most
recent logins on the main page; including a graph representing the logins by hour.
The [reporting and metrics](/docs/v1/tech/apis/reports) of FusionAuth make analyzing your authentication
platform a breeze. 

TBD image

Unfortunately, Google Firebase Authentication's metrics and usage reporting
are almost non-existent. Currently, Google Firebase Authentication only is able to see the phone
verifications under the Usage tab.

Google Firebase Authentication does have a couple advanced features such as limiting one
account per email address which prevents users from creating multiple accounts
using the same email address with different authentication providers. Google Firebase
Authentication also allows you to manage your sign-ups by IP addresses, making sure that a
single IP address can only sign-up so many users, the default being a 100 users.

Want to know when a user fails to log in or maybe when a user account is
deactivated? The advanced built-in web hooks from FusionAuth give you the
ability to customize web hooks for each application; including the security type,
authentication of the web hooks, and setup user actions based on web hook
execution states.

TBD image

## Enhanced Security

Identity providers are important, but vary depending on your specific needs. Being
able to have third party logins, through Google Sign In, FaceBook, Twitter.
can enhance the ease of signing up users to your application. Both Google Fire
Authentication support a variety of [identity providers](/docs/v1/tech/identity-providers/); what sets FusionAuth apart is
their integration with [HYPR](/docs/v1/tech/identity-providers/hypr).

HYPR is a passwordless Multi-Factored-Authentication (MFA) that greatly speeds
up passwordless authentication. It runs silently in the background and makes it
easy for your users to enroll multiple mobile devices with their desktops and
laptops.

## Reactor

Power up your Reactor! Reactor takes the next leap forward in protecting your
users. Reactor features [Breached Password Detection](/docs/v1/tech/reactor#breached-password-detection) and is a paid feature, but
when you need the increased security I think that this advanced feature is worth the
money. You are talking about assisting your customers in protecting their identity.

Imagine your customer's data gets breached from another database. Then, a hacker
attempts to authenticate using that stolen data with FusionAuth, the hacker is
prevented from logging in until the real user has changed their breached password.
This ensures enhanced security. Many databases get breached and having this
higher level of security to offer your customers (and of course giving them peace
of mind) is invaluable to your goal offering premium customer service. Google
Firebase Authentication could care less, as long as the password is correct your user will be
authenticated, with no background verification method utilized. 

## Good Bye Google Firebase Authentication

In my opinion, the main difference between Google Firebase Authentication and FusionAuth is
that FusionAuth offers you highly customized and secure solutions that scale in a
manner that won't break your bank. I know that I didn't cover everything that
FusionAuth and Google Firebase Authentication have to offer (that could probably take a small book). 

If you haven't checked out FusionAuth, then I recommend that now is the time for you to
make the change. So... Good Bye Google Firebase Authentication... you were helpful when I
was new to the world of authentication, but now you are my past.
