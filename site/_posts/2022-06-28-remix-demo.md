---
layout: blog-post
title: FusionAuth Remix demo
description: Example of how Remix works with FusionAuth
author: Joyce Park
image: blogs/connecting-fusionauth-remix/connecting-fusionauth-remix-runapp.png
category: blog
tags: remix, remix-run
excerpt_separator: "<!--more-->"
---

Remix is the new hotness in web development! It is an attempt to solve some of the perceived performance issues of React by cleverly splitting up server-side code (called Loaders and Actions) from the functionality that absolutely must be shipped to the client-side, such as JavaScript and CSS for transitions. It also offers benefits in accessibility through a commitment to using web standards and progressive enhancement, and allows for almost all parts of the stack to be easily swapped out, e.g. you can choose from several different datastores that are pre-packaged with Remix for your convenience.

However, new users should be aware that the authentication functionality currently shipped with the basic Remix package does not conform to current best practices.

<!--more-->

In this post we will explain what problems this might cause for developers, and how to upgrade to a better solution with less work. We are FusionAuth and we build auth servers so our example will naturally use the FusionAuth server, but in principle the same solution should work with any auth service that supports OAuth2 and OIDC.

## Why not use Remix's authentication?

The Remix team ships an auth solution with the Indie and Blues stacks, and a very similar one with the Grunge stack. You can see components like join, login/logout, and protected pages in the Notes sample app (`/app/routes/notes`) and in the Jokes sample app that you can build by following the [documentation](https://remix.run/docs/en/v1/tutorials/jokes). Basically these sample apps check the database to see if a user with a particular username and password exists, and if so they set an encrypted session cookie with the userId. Subsequent pageloads that require auth will check for the existence of the userId in the database and redirect elsewhere if it doesn't exist.

This solution is appealingly straightforward and might be sufficient for low-risk uses like the demo -- most people aren't going to care too much about protecting their joke collection, in this case authentication mostly is intended to identify who added which joke to the app -- but modern auth solutions give you far higher levels of security and functionality if deployed properly. For instance, an authentication server such as FusionAuth can very easily allow you to:

* Offer external authentication by [trusted sources](/docs/v1/tech/identity-providers/) such as Google, Facebook, or Apple
* Set up your org as an source of authentication and authorization for multiple apps
* [Protect your own APIs](/docs/v1/tech/guides/api-authorization) from unauthorized access
* Limit the scope of authentication to a specific domain or client
* [Theme your FusionAuth forms](/docs/v1/tech/themes/) to match your Remix app 
* Let you sleep easily at night knowing that your solution has been professionally security audited for years

But to do so, you need to adopt modern standards and practices -- and the sooner the better. In fact adopting a standards-based third-party server will result in less code than a hand-rolled solution.

## Setting up FusionAuth with Remix

We've prepared a small package with just the parts of Remix that are necessary to show how to log in and out, and require authentication for a given component. Clone [this repository](https://github.com/FusionAuth/fusionauth-example-remix) and install dependencies, and be sure to check the README.

There's one somewhat unusual feature of this example, which is that we chose file-based rather than cookie-based session storage. One of the principles of authentication is that you should avoid moving sensitive data around to and from the user-facing client whenever possible, which is why we always recommend a server component for every front-end technology. For instance our [React demo](https://github.com/FusionAuth/fusionauth-example-react-2.0) has a client written in React that talks to an Express server which talks to the FusionAuth server. If you compare Remix to React, one of the biggest differences is that Remix has the server built in, so there's no need to run a separate server process.

File-based session storage has one drawback that is only relevant at scale: once you need more than one Remix server, you will have to pin each user to a particular server for the duration of that session. However most developers are unlikely to encounter that kind of problem -- or by the time you do, you'll have the resources to solve it.

You will also need a working FusionAuth instance. The easiest way to get this for testing purposes is to have a short conversation with a member of our [Sales team](/contact) who will be able to provision a cloud instance for you. The second fastest way is to use the [Docker install](/docs/v1/tech/installation-guide/docker). The third fastest way is to use the Fast Path install detailed in our [Five Minute Setup Guide](/docs/v1/tech/5-minute-setup-guide). In all cases except the cloud instance you should install the development data included in our [Kickstart project](https://github.com/FusionAuth/fusionauth-example-kickstart/tree/master/fusionauth).

Once you have a FusionAuth instance, you should be able to go to the admin page and configure your FusionAuth instance like this:

{% include _image.liquid src="/assets/img/blogs/connecting-fusionauth-remix/fusionauth-config.png" alt="FusionAuth config for Remix" class="img-fluid" figure=true %}

Then you must copy some values to `env.example` and change the name of the file to `.env` to set the correct environment variables using data from the FusionAuth app. At this point you should be ready to fire up the Remix server and try out the example at a default address of `localhost:3000`.

## Using FusionAuth with Remix

Once you've done all this configuration, auth will be trivially easy -- because all the hard lifting is being done by FusionAuth. Let's look at some code!

Navigate to `http://localhost:3000` and click the login link. That will take you to the `/login` route, which looks like this:

```bash
import type { LoaderFunction } from "@remix-run/node"
import { authenticator } from "~/auth.server";

export let loader: LoaderFunction = async ({ request }) => {
  // If the user is already authenticated redirect to /dashboard directly
  return await authenticator.authenticate("FusionAuth", request, {
    successRedirect: "/dashboard",
    failureRedirect: "/error",
  },
  );
};
```

This is all the app code you need to protect any route. As you can see, you will merely be trying the `authenticator.authenticate` method, and redirecting to either the `/dashboard` or the `/error` route on success or failure.

What is this authenticator thing all about? If you open the `/app/auth.server` file, you should see something like this (slightly simplified here):

```bash
import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/session.server";
import { OAuth2Strategy } from "remix-auth-oauth2";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator<User>(sessionStorage);

authenticator.use(
    new OAuth2Strategy(
        {
            authorizationURL: `${process.env.AUTH_URL}/authorize`,
            tokenURL: `${process.env.AUTH_URL}/token`,
            clientID: process.env.CLIENT_ID || "",
            clientSecret: process.env.CLIENT_SECRET || "",
            callbackURL: process.env.AUTH_CALLBACK_URL || "",

        },
        async ({ accessToken, refreshToken, extraParams, profile, context }) => {
            // This function is MANDATORY for the system to work, and would be the
            // main cause of being redirected to the /error route
            console.log("Verified by FusionAuth!")
        }
    ),
    // this is optional, but if you setup more than one OAuth2 instance you will
    // need to set a custom name to each one
    "FusionAuth"
);
```

This code leans very heavily on @sergiodxa's OAuth work for Remix, the npm packages `remix-auth` and `remix-auth-oauth2`. It will handle all the tedious boilerplate necessary to negotiate between Remix apps and an OAuth2 authentication service like FusionAuth. As you can see, we just send some secret data -- and remember, this is all sent from the server side of Remix, not from client-side JavaScript! -- which helps tell FusionAuth what app you are trying to log in from, and where you want to go afterwards.

If you are not logged in, our Remix `/login` route will redirect you to the FusionAuth login -- which you can [customize easily](/docs/v1/tech/themes/) with your own CSS! -- which looks like this out of the box:

{% include _image.liquid src="/assets/img/blogs/connecting-fusionauth-remix/dinesh-login.png" alt="FusionAuth login screen" class="img-fluid" figure=true %}

and if you loaded the Kickstart data as directed you should now be able to log in as `dinesh@fusionauth.io` with password `password`. Any specifically login-related errors, like forgetting your password or not being registered, will be handled here.

If you log in successfully, you will be redirected to `/auth/callback` which checks your login again in code that should be familiar since it's almost identical to the `/login` route:

```bash
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { sessionStorage } from "~/session.server";
import { authenticator } from "~/auth.server";

export const loader: LoaderFunction = async ({request}) => {
  await authenticator.authenticate("FusionAuth", request, {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  });
}
```

and from there dumped into `/dashboard` which is just a message saying you're logged in. If you then try the same clickpath again, you will get passed through to `/dashboard` without logging in!

Yes it really is that simple to get the best authentication in the business! You can also configure FusionAuth to give you extra functionality that would be a pain to handroll, such as only allowing a certain number of login attempts before sending the user to a timeout. Remix is an exciting solution for app development because it magically handles dividing up the codebase into server-side and client-side functions, and we feel that this approach is very congruent with FusionAuth's authentication philosophy.
