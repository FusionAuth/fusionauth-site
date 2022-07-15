---
layout: blog-post
title: FusionAuth Remix demo
description: Example of how Remix works with FusionAuth
author: Joyce Park
image: blogs/connecting-fusionauth-remix/connecting-fusionauth-remix-runapp.png
category: blog
tags: remix remix-run
excerpt_separator: "<!--more-->"
---

Remix is the new hotness in web development! It is an attempt to solve some of the performance issues of React by cleverly splitting up server-side code (called Loaders and Actions) from the functionality that absolutely must be shipped to the client, such as JavaScript and CSS for transitions. It also offers benefits in accessibility through a commitment to using web standards and progressive enhancement. Remix allows for almost all parts of the stack to be easily swapped out, e.g. you can choose from several different datastores that are pre-packaged with Remix for your convenience.

However, new users should be aware that the authentication functionality currently shipped with the basic Remix package does not conform to current best practices.

<!--more-->

In this post we will explain what problems this might cause for developers, and how to upgrade to a better solution with less work. FusionAuth provides a free-to-use OIDC server, so our example will use FusionAuth. In principle the same solution will work with any identity provider which supports OAuth2 and OIDC.

## Why not use Remix's authentication?

The Remix team ships an auth solution with the Indie and Blues stacks, and a very similar one with the Grunge stack. You can see components like join, login/logout, and protected pages in the Notes sample app (`/app/routes/notes`) and in the Jokes sample app that you can build by following the [documentation](https://remix.run/docs/en/v1/tutorials/jokes). Basically these sample apps check the database to see if a user with a particular username and password exists, and if so they set an encrypted session cookie with the `userId`. Subsequent page loads that require auth will check for the existence of the userId in the database and redirect elsewhere if it doesn't exist.

This solution is appealingly straightforward and might be sufficient for low-risk uses like a demo application. Most people aren't going to care too much about protecting their joke collection. With the Jokes app, authentication primarily identifies who added which joke to the app. But modern auth solutions give you far higher levels of security and functionality.

For instance, an auth server such as FusionAuth can very easily allow you to:

* Offer federated login by [trusted sources](/docs/v1/tech/identity-providers/) such as Google, Facebook, or Apple
* Set up your org as an source of authentication and authorization for multiple apps
* [Protect your own APIs](/docs/v1/tech/guides/api-authorization) from unauthorized access
* Limit the scope of authentication to a specific domain or client
* [Theme your login and other authentication workflow pages](/docs/v1/tech/themes/) to match your Remix app 

Most importantly, they let you sleep easily at night knowing that your solution has been built and audited by security professionals for years and will be maintained far into the future.

But to get these benefits, you need to adopt modern standards and practices, the sooner the better. As a bonus, adopting a standards-based third-party auth server will result in less code than a hand-rolled solution.

## Setting up FusionAuth with Remix

We've prepared a small package illustrating how to log in and out of a Remix application, as well as requiring authentication for a given component. To follow along, clone [this repository](https://github.com/FusionAuth/fusionauth-example-remix) and run `npm install`. 

There's one somewhat unusual feature of this example, which is that we chose file-based rather than cookie-based session storage. With file-based storage, only ["only the session ID is stored in the cookie"](https://remix.run/docs/en/v1/api/remix#createfilesessionstorage-node). A common security principle is to avoid having sensitive data on a client such as a browser or mobile app whenever possible. This principle is the reason this example uses file based session storage.

Additionally, FusionAuth always recommends a corresponding server component for every front-end application. For instance our [React demo](https://github.com/FusionAuth/fusionauth-example-react-2.0) has a client written in React that talks to an Express server which talks to the FusionAuth server. If you compare Remix to React, one of the biggest differences is that Remix has the server built in, so there's no need to run a separate server process.

File-based session storage has one drawback that is only relevant at a certain scale: once you need more than one Remix server, you will have to pin each user to a particular server for the duration of that session. However most developers are unlikely to encounter that kind of problem -- or by the time you do, you'll have the resources to solve it. For example, you can switch to the [Cloudflare KV session storage](https://remix.run/docs/en/v1/api/remix#createcloudflarekvsessionstorage-cloudflare-workers).

## Installing FusionAuth

For this example, you will also need a working FusionAuth instance. There are [various ways](/docs/v1/tech/installation-guide/fusionauth-app) to install FusionAuth depending on your system, but the easiest way is to use Docker and Docker Compose. [Instructions are here](/docs/v1/tech/installation-guide/docker). Assuming you have Docker installed, start FusionAuth by running these commands:

```bash
curl -o docker-compose.yml https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/docker-compose.yml
https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/docker-compose.override.yml
curl -o .env https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/.env
docker-compose up
```

You'll want to do this from a different directory than the cloned remix application, otherwise the `.env` files will collide. The `.env` file used by this Docker Compose command contains hard-coded database passwords and is not suitable for production use.

## Configuring FusionAuth

Next, create a user and an application in FusionAuth, since that is going to be your user data store. Navigate to \http://localhost:9011 and go through the [setup wizard](/docs/v1/tech/tutorials/setup-wizard) to create your first user.

Next, create an application in FusionAuth. The application represents the Remix application in FusionAuth. You can learn more about [users](/docs/v1/tech/core-concepts/users) and [applications](/docs/v1/tech/core-concepts/applications). 

Go to the "Applications" page and create an application (using the `+` sign). Then configure the application like this:

{% include _image.liquid src="/assets/img/blogs/connecting-fusionauth-remix/fusionauth-config.png" alt="FusionAuth config for Remix" class="img-fluid." figure=true %}

* Set `Authorized redirect URLs` to `http://localhost:3000/auth/callback`
* Set `Logout URL` to `http://localhost:3000/logout`
* Enable the "Authorization Code grant"

After saving the application configuration, you will see a list of applications. Edit your application again to see the Client Id and Client Secret values.

{% include _image.liquid src="/assets/img/blogs/connecting-fusionauth-remix/fusionauth-config-highlighted.png" alt="Finding the Client Id and Client Secret." class="img-fluid" figure=true %}

## Finish configuring Remix

Now, switch back to your terminal and to the directory where you cloned the Remix example repository. Copy the `env.example` file in the cloned remix repository to `.env` and edit the file.

Here's an example of the `.env` file, with values filled out. Some of your values will be different:

```
CLIENT_ID="85a03867-dccf-4882-adde-1a79aeec50df"
CLIENT_SECRET="b4xOdsBUWHQkkU3BOqAxSilfttI4TJv9eI_LOj8zVgE"
AUTH_URL="http://localhost:9000"
AUTH_CALLBACK_URL="http://localhost:3000/auth/callback"
```

## Test it out

At this point you should be ready to fire up the Remix server. Do so by running `npm start` in the directory where your `.env` file is.

Try out the example at a default address of `http://localhost:3000`. Click the login link. That will take you to the `/login` route.

If you are not logged in, the `/login` route will redirect you to the FusionAuth login, which you can [customize easily](/docs/v1/tech/themes/) with your own CSS, HTML and more! These pages looks like this out of the box:

{% include _image.liquid src="/assets/img/blogs/connecting-fusionauth-remix/dinesh-login.png" alt="FusionAuth login screen" class="img-fluid" figure=true %}

After you log in, you will be redirected to `/auth/callback` which checks your login and then sends you along to the dashboard.

## More details

Once you've done all this configuration, auth is easy because all the heavy lifting is being done by FusionAuth. Let's look at some code!

The `/login` route looks like this:

```js
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

This is all the app code you need to protect any route. As you can see, you use the `authenticator.authenticate` method, and redirect to either the `/dashboard` or the `/error` route on success or failure, respectively.

What is the `authenticator` all about? 

If you open the `/app/auth.server` file, you should see something like this (slightly simplified here):

```js
import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/session.server";
import { OAuth2Strategy } from "remix-auth-oauth2";

// Create an instance of the authenticator. 
// specify we are using session storage
// then specify the use of the OAuth2 authentication strategy
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

      // here we are simply verifying the user successfully authenticated, 
      // but you could also look the user up using the userInfo endpoint 
      // or FusionAuth APIs in order to get more profile data, such as roles.
      console.log("Successful authentication by FusionAuth!")
    }
  ),
  // this is optional, but if you set up more than one OAuth2 instance you will
  // need to set a custom name to each one
  "FusionAuth"
);
```

This code leans very heavily on [@sergiodxa's](https://twitter.com/sergiodxa) OAuth work for Remix, the npm packages `remix-auth` and `remix-auth-oauth2`. It will handle all the tedious boilerplate necessary to negotiate between Remix apps and an OAuth2 server like FusionAuth. The `OAuth2Strategy` configuration informs FusionAuth what app you are trying to log in from, and where you want to go afterwards.

If you are not logged in, our Remix `/login` route will redirect you to the FusionAuth login page mentioned above:

{% include _image.liquid src="/assets/img/blogs/connecting-fusionauth-remix/dinesh-login.png" alt="FusionAuth login screen" class="img-fluid" figure=true %}

If you log in, you will be redirected to `/auth/callback` which checks your login again in code that should be familiar since it's almost identical to the `/login` route:

```js
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

From there you'll be sent to `/dashboard` which is just a message saying you're logged in. If you then try the same click path again, you will get passed through to `/dashboard` without being forced to reauthenticate!

## Next steps

As mentioned above, in addition to outsourcing login, there are other features you get when using an external auth server such as FusionAuth. You can configure it for extra functionality that would be a pain to build yourself. Some examples: 

* only allowing a certain number of login attempts before locking a user account
* adding additional login providers such as Google or Facebook
* enabling MFA to provide additional security for your users
* setting policies around password strength

If these interest you, you'll want to [look at the FusionAuth docs](/docs/v1/tech/).

## Conclusion

Remix is an exciting solution for app development because it magically handles dividing up the codebase into server-side and client-side functions. 

This division gives you deployment options and flexibility.

When paired with FusionAuth, you can focus on building your app rather than worrying about authentication. 
