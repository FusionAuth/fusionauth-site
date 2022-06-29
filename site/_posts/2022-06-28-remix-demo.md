---
layout: blog-post
title: FusionAuth Remix demo
description: Example of how Remix works with FusionAuth or any OAuth2 server
author: Joyce Park
image: blogs/connecting-fusionauth-remix/connecting-fusionauth-remix-runapp.png
category: blog
tags: remix, remix-run
excerpt_separator: "<!--more-->"
---

Remix is the new hotness in web development! It is an attempt to solve some of the perceived performance issues of React by cleverly splitting up server-side code (called Loaders and Actions) from the functionality that absolutely must be shipped to the client-side, such as JavaScript and CSS for transitions. It also offers benefits in accessibility through a commitment to using web standards and progressive enhancement, and allows for almost all parts of the stack to be easily swapped out, e.g. you can choose from several different datastores that are pre-packaged with Remix for your convenience.

However, new users should be aware that the authentication functionality currently shipped with the basic Remix package does not conform to current best practices.

<!--more-->

In this post we will explain what problems this might cause for developers, and how to upgrade to a better solution with less work. We are FusionAuth and we build auth servers so our example will naturally use the FusionAuth server, but in principle the same solution should work with any auth service supports OAuth2 and OIDC.

## Why not use Remix's authentication?

The Remix team ships an auth solution with the Indie and Blues stacks, and a very similar one with the Grunge stack. You can see components like join, login/logout, and protected pages in the Notes sample app (`app/routes/notes`) and in the Jokes sample app that you can build by following the [documentation](https://remix.run/docs/en/v1/tutorials/jokes). Basically these sample apps check the database to see if a user with a particular username and password exists, and if so they set an encrypted session cookie with the userId. Subsequent pageloads that require auth will check for the existence of the userId in the database and redirect elsewhere if it doesn't exist.

This solution is appealingly straightforward and might be sufficient for low-risk uses like the demo -- most people aren't going to care too much about protecting their joke collection, in this case authentication mostly is intended to identify who added which joke to the app -- but modern auth solutions give you far higher levels of security if deployed properly. For instance, an OAuth2 and OIDC compliant authentication server such as FusionAuth can now very easily allow you to:

* Offer external authentication by trusted sources such as Google, Facebook, or Apple (known as Identity Providers)
* Set up your org as an Identity Provider for other apps
* Access external APIs that require specific kinds of authentication
* Protect your own APIs from unauthorized access
* Limit the scope of authentication to a specific domain or client
* Let you sleep easily at night knowing that your solution has been professionally security audited for years

But to do so, you need to adopt modern standards and practices -- and the sooner the better. In fact adopting a standards-based third-party server will result in less code than a hand-rolled solution.

## Setting up FusionAuth with Remix

We've prepared a small package with just the parts of Remix that are necessary to show how to log in and out, and require authentication for a given component. Clone [this repository](https://github.com/FusionAuth/fusionauth-example-remix) and install dependencies, and be sure to check the README.

There's one somewhat unusual feature of this example, which is that we chose file-based rather than cookie-based session storage. One of the principles of authentication is that you should avoid moving sensitive data around to and from the user-facing client whenever possible, which is why we always recommend a server component for every front-end technology. For instance our [React demo](https://github.com/FusionAuth/fusionauth-example-react-2.0) has a client written in React that talks to an Express server which talks to the FusionAuth server. If you compare Remix to React, one of the biggest differences is that Remix has the server built in, so there's no need to run a separate server process.

File-based session storage has one drawback that is only relevant at scale: once you need more than one Remix server, you will have to pin each user to a particular server for the duration of that session. However most developers are unlikely to encounter that kind of problem -- or by the time you do, you'll have the resources to solve it.

You will also need a working FusionAuth instance. The easiest way to get this for testing purposes is to have a short conversation with a member of our [Sales team](https://fusionauth.io/contact) who will be able to provision a cloud instance for you. The second fastest way is to use the Docker install. The third fastest way is to use the Fast Path install detailed in our [Five Minute Setup Guide](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide). In all cases you should install the development data included in our [Kickstart project](https://github.com/FusionAuth/fusionauth-example-kickstart/tree/master/fusionauth).

Once you have a FusionAuth instance, you should be able to go to the admin page and configure your FusionAuth instance like this:

<img src="/assets/img/blogs/connecting-fusionauth-remix/fusionauth-config.png" />

Then you must copy some values to `env.example` and change the name of the file to .env to set environment variables. At this point you should be ready to fire up the Remix server and try out the example.

## Using FusionAuth with Remix

Once you've done all this, auth will be trivially easy -- because all the hard lifting is being done by FusionAuth. Navigate to `http://localhost:3000` and click the login link. That will redirect you to the FusionAuth login -- which you can customize easily with your own CSS! -- and if you loaded the Kickstart data as directed you should now be able to log in as `dinesh@fusionauth.io` with password `password`. You will be redirected to `auth/callback` and from there dumped into `dashboard`. Try the same clickpath again and see what happens! If you want to make sure this was not a fluke, try the `/logout` route.

Literally every time you need to add authenticatiion to a view, you merely call `authenticator.authenticate` with a successRedirect and a failureRedirect as shown in `app/routes/auth.callback.tsx`. Yes it really is that simple to get the best authentication in the business!
