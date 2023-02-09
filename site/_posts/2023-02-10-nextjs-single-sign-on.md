---
layout: blog-post
title: Adding single sign-on to a Next.js app using OIDC
description: In this tutorial, we'll build a basic Next.js web application using FusionAuth to handle single sign-on.
author: Vinicius Campitelli
category: tutorial
tags: tutorial tutorial-nextjs tutorial-javascript nextjs javascript oidc
image: blogs/nextjs-single-sign-on/nextjs-sso.png
excerpt_separator: "<!--more-->"
---

Single sign-on (SSO) is a session and user authentication technique that permits a user to use one set of login credentials to authenticate with multiple apps. SSO works by establishing trust between a service provider, usually your application, and an identity provider, like FusionAuth.

<!--more-->

The trust is established through an out-of-band exchange of cryptographic credentials, such as a client secret or public key infrastructure (PKI) certificate. Once trust has been established between the service provider and the identity provider, SSO authentication can occur when a user wants to authenticate with the service provider. This will typically involve the service provider sending a token to the identity provider containing details about the user seeking authentication. The identity provider can then check if the user is already authenticated and ask them to authenticate if they are not. Once this is done, the identity provider can send a token back to the service provider, signifying that the user has been granted access.

SSO helps reduce password fatigue by requiring users to only remember one password and username for all the applications managed through the SSO feature. This also reduces the number of support tickets created for your IT team when a user inevitably forgets their password. In addition, SSO minimizes the number of times you have to key-in security credentials, limiting exposure to security issues like keystroke probing and exposure. Security is also enhanced by SSO because you can implement additional functionality such as MFA or anomalous behavior detection at the identity provider without adding any complexity to your application.

In this tutorial, you'll learn how to design and implement SSO using [Next.js](https://nextjs.org/), a popular React-based framework for JavaScript and FusionAuth as the OIDC provider. Any other OIDC compatible authentication server should work as well.

## Implementing SSO in a Next.js web app

As previously stated, in this tutorial, you'll be shown how to implement SSO in a Next.js web app. The Next.js demo application is integrated with FusionAuth, an authentication and authorization platform, and [NextAuth.js](https://next-auth.js.org), a complete open-source authentication solution, in this article.

Before you begin, you'll need the following:

* A Linux machine. The step-by-step instructions in this article are based on a [CentOS Linux machine](https://www.centos.org). If you want to work on a different OS, check out this [setup guide](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide) for more information.
* [Docker Engine](https://docs.docker.com/engine/) and [Docker Compose](https://docs.docker.com/compose/).
* Experience with Next.js framework and application development.
* The [Git client tool](https://git-scm.com/downloads) _(optional)_.

## Installing FusionAuth

Go through the [5-Minute Setup Guide](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide) to install FusionAuth in your machine. You have a few ways of doing so, but we recommend the [Docker](https://fusionauth.io/docs/v1/tech/getting-started/5-minute-docker) approach.

### Starting FusionAuth

{% comment %}
{% include posts/sso/starting.md %}
{% endcomment %}

### Configure FusionAuth

Now you need to configure FusionAuth.

First, you'll create a new RSA key to sign your JSON Web Tokens, then configure the application and register the user for the application.

This setup allows users in FusionAuth to sign in to the Next.js application automatically once they are authenticated by FusionAuth.

### Create a new RSA key

Create an RSA key pair to sign your JSON Web Tokens by going to _"Settings"_ &rarr; _"Key Master"_. Then, look at the _"Generate"_ button in the top right corner of the page. If it is _"Generate RSA"_, click it. If it is another option, click the _"⌄"_ button right next to it to display more options and then click _"Generate RSA"_.

In the dialog, fill in a name for your key, the issuer as your FusionAuth application domain and make sure that the _"Algorithm"_ is _"RSA using SHA-256"_. Click _"Submit"_ to save the key.

{% include _image.liquid src="/assets/img/blogs/nextjs-single-sign-on/rsa-jwt.gif" alt="Generating a new RSA key." class="img-fluid" figure=true %}

### Set up the application

{% comment %}
{% include posts/sso/setup.md
callbackUrl='http://localhost:3000/api/auth/callback/fusionauth'
oauthDetailsImage='/assets/img/blogs/nextjs-single-sign-on/fusionauth-callback.png'
beforeSavingInstructions='Go back to the beginning of the page and select the _"JWT"_ tab. There, click the _"Enabled"_ switch and change both _"Access token signing key"_ and _"Id token signing key"_ to your newly generated RSA signing key.'
%}
{% endcomment %}

### Register the user

{% comment %}
{% include posts/sso/register-user.md %}
{% endcomment %}

### Kickstart

Instead of manually setting up FusionAuth using the admin UI as you did above, you can use Kickstart. This tool allows you to get going quickly if you have a fresh installation of FusionAuth. Learn more about how to use [Kickstart](https://fusionauth.io/docs/v1/tech/installation-guide/kickstart).

Here's an example [Kickstart file](https://github.com/FusionAuth/fusionauth-example-nextjs/blob/main/kickstart/kickstart.json) which sets up FusionAuth for this tutorial.

## Method 1: Clone the demo repository

If you want to run an already working application, you can clone the demo project from this [GitHub repository](https://github.com/FusionAuth/fusionauth-example-nextjs) using the following command.

```shell
$ git clone git@github.com:FusionAuth/fusionauth-example-nextjs.git
```

Even though you do not need to actually execute the next steps, we do recommended that you read them to understand what was done in the demo application. After that, continue configuring the [Environment variables](#environment-variables).

## Method 2: Create your own Next.js application

If you want to create your own application instead of using our demo project, you can create a new Next.js application by running the command below.

```shell
$ npx create-next-app name-of-your-application
```

If it is your first time creating a Next.js application, you'll be prompted to install the `create-next-app` package. Just type `y` to accept it.

You can answer the questions from the wizard any way you want. Here are the ones that we used in our demo project.

```
✔ Would you like to use TypeScript with this project? … No
✔ Would you like to use ESLint with this project? … Yes
✔ Would you like to use `src/` directory with this project? … Yes
? Would you like to use experimental `app/` directory with this project? … No
✔ What import alias would you like configured? … @/*
```

There are several ways of [implementing authentication with Next.js](https://nextjs.org/docs/authentication, and we'll use [NextAuth.js](https://next-auth.js.org), a complete open-source authentication solution, in this article.

### Installing NextAuth.js

{% include _callout-note.liquid content="We recommend you look at the [NextAuth.js Getting Start guide](https://next-auth.js.org/getting-started/example) for more up-to-date instructions." %}

First, install NextAuth.js via one of the following three methods.

```shell
# Using npm
$ npm install next-auth

# Using yarn
$ yarn add next-auth

# Using pnpm
$ pnpm add next-auth
```

Now, you need to create a file named exactly like `[...nextauth].js` in `src/pages/api/auth` (you need to create the `auth` folder there) and configure the [built-in support for FusionAuth](https://next-auth.js.org/providers/fusionauth). This will make every request to `/api/auth/*` handled by NextAuth.js.

```jsx
import NextAuth from "next-auth"
import FusionAuthProvider from "next-auth/providers/fusionauth"

export const authOptions = {
    providers: [
        FusionAuthProvider({
            issuer: process.env.FUSIONAUTH_ISSUER,
            clientId: process.env.FUSIONAUTH_CLIENT_ID,
            clientSecret: process.env.FUSIONAUTH_CLIENT_SECRET,
            wellKnown: `${process.env.FUSIONAUTH_URL}/.well-known/openid-configuration`,
            tenantId: process.env.FUSIONAUTH_TENANT_ID, // Only required if you're using multi-tenancy
        }),
    ],
}

export default NextAuth(authOptions)
```

### Exposing session state

Change `src/pages/_app.js` to have your application rendered inside a `<SessionProvider>` context, like shown below.

```jsx
import {SessionProvider} from "next-auth/react"

export default function App({
                                Component,
                                pageProps: {session, ...pageProps},
                            }) {
    return (
        <SessionProvider session={session}>
            <Component {...pageProps} />
        </SessionProvider>
    );
}
```

Doing this, all your components will have access to the [`useSession()`](https://next-auth.js.org/getting-started/client#usesession) React Hook, which is responsible for checking if the user is logged in. To make things reusable, you can create a component that will either render a "Log in" or "Log out" button, depending on the session state, in a `src/components/login-button.jsx` file.

```jsx
import {useSession, signIn, signOut} from "next-auth/react"

export default function Component() {
    const {data: session} = useSession()
    if (session) {
        return (
            <>
                Logged in as {session.user.email} <br/>
                <button onClick={() => signOut()}>Log out</button>
            </>
        )
    }
    return (
        <>
            Not logged in <br/>
            <button onClick={() => signIn()}>Log in</button>
        </>
    )
}
```

Then, you change your home component located at `src/pages/index.js` to include the `<LoginButton />` component anywhere in that fragment.

```jsx
// Other imports...
import LoginButton from '@/components/login-button';

export default function Home() {
    return (
        /* Other lines of the Home component */
        <LoginButton/>
        /* Other lines of the Home component */
    )
}
```

## Environment variables

If you cloned the demo repository, you can copy `.env.local.dist` to `.env.local` and change the values there. If not, create it and fill in the details from your FusionAuth application.

```dotenv
FUSIONAUTH_ISSUER="<APP ISSUER FROM FUSIONAUTH>" # example: my-website.com
FUSIONAUTH_CLIENT_ID="<APP CLIENT ID FROM FUSIONAUTH>"
FUSIONAUTH_CLIENT_SECRET="<APP CLIENT SECRET FROM FUSIONAUTH>"
FUSIONAUTH_TENANT_ID="<TENANT ID>" # Leave blank if you only have the default tenant
FUSIONAUTH_URL="<ENTIRE FUSIONAUTH URL>" # example: http://localhost:9011
```

## Testing

Start the HTTP server by running one of three methods below.

```shell
# Using npm
$ npm run dev

# Using yarn
$ yarn dev

# Using pnpm
$ pnpm dev
```

Browse to [localhost:3000](http://localhost:3000) and click the _"Log in"_ button, where you'll be taken to a page with only a _"Sign in with FusionAuth"_ button. When clicking it, you should be redirected to your FusionAuth login screen. After entering the correct username and password (created when you set up FusionAuth), you arrive back at your Next.js application home screen, with your email address displayed and a _"Log out"_ button.
