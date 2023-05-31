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

* A Linux machine. The step-by-step instructions in this article are based on a [CentOS Linux machine](https://www.centos.org). If you want to work on a different OS, check out this [setup guide](/docs/v1/tech/5-minute-setup-guide) for more information.
* [Docker Engine](https://docs.docker.com/engine/) and [Docker Compose](https://docs.docker.com/compose/).
* [Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm). 
* Experience with [Next.js](https://nextjs.org/) framework and application development.
* The [Git client tool](https://git-scm.com/downloads) _(optional)_.

## Installing FusionAuth

{% include posts/install-fusionauth.md %}

### Starting FusionAuth

{% include posts/sso/starting.md %}

### Configure FusionAuth

Now you need to configure FusionAuth by creating an application and registering the user.

This setup allows users in FusionAuth to sign in to the Next.js application automatically once they are authenticated by FusionAuth.

### Set up the application

{% include posts/sso/setup.md
callbackUrl='http://localhost:3000/api/auth/callback/fusionauth'
oauthDetailsImage='/assets/img/blogs/nextjs-single-sign-on/fusionauth-callback.png'
beforeSavingInstructions='Go back to the beginning of the page and select the _"JWT"_ tab. There, click the _"Enabled"_ switch and change both _"Access token signing key"_ and _"Id token signing key"_ to `Auto generate a new key on save...`.'
%}

### Register the user

{% include posts/sso/register-user.md %}

### Kickstart

Instead of manually setting up FusionAuth using the admin UI as you did above, you can use Kickstart. This tool allows you to get going quickly if you have a fresh installation of FusionAuth. Learn more about how to use [Kickstart](/docs/v1/tech/installation-guide/kickstart).

Here's an example [Kickstart file](https://github.com/FusionAuth/fusionauth-example-nextjs-single-sign-on/blob/main/kickstart/kickstart.json) which sets up FusionAuth for this tutorial.

## Create the Next.js application

You have two options here. You can either clone a working example, or build the app from scratch.
### Clone the demo repository

If you want to run an already working application, you can clone the demo project from this [GitHub repository](https://github.com/FusionAuth/fusionauth-example-nextjs-single-sign-on) using the following command.

```shell
git clone git@github.com:FusionAuth/fusionauth-example-nextjs-single-sign-on.git
```

Since you've cloned a working rep, you don't need to follow the next section. If you'd like to understand more about what was done in the demo application, feel free to read them. 

Either way, continue configuring the [Environment variables](#environment-variables) to proceed with this tutorial.

## Create your own Next.js application

If you want to create your own application instead of using our demo project, you can create a new Next.js application by running the command below.

```shell
npx create-next-app name-of-your-application
```

> If it is your first time creating a Next.js application, you'll be prompted to install the `create-next-app` package. Just type `y` to accept it.

The `create-next-app` wizard will ask you a few questions on how to set up your application. Answer them like shown.

```
✔ Would you like to use TypeScript with this project? … No
✔ Would you like to use ESLint with this project? … Yes
✔ Would you like to use `src/` directory with this project? … Yes
? Would you like to use experimental `app/` directory with this project? … No
✔ What import alias would you like configured? … @/*
```

Enter the directory for the application you created and start up the application by running these commands.

```shell
cd name-of-your-application
npm run dev
```

Browse to [localhost:3000](http://localhost:3000). If the installation went successful, you should see the default welcome page from Next.js.

Now that you have the application running, let's implement the authentication process by using [NextAuth.js](https://next-auth.js.org), a complete open-source solution.

### Installing NextAuth.js

{% include _callout-note.liquid content="We recommend you look at the [NextAuth.js Getting Start guide](https://next-auth.js.org/getting-started/example) for the most up-to-date instructions." %}

First, install NextAuth.js.

```shell
npm install next-auth
```

Now, you need to create a file named exactly like `[...nextauth].js` in `src/pages/api/auth`.

First, make the directory:

```shell
mkdir src/pages/api/auth
```

Then create a file named `[...nextauth].js` in that directory.

Next, you'll configure the [built-in support for FusionAuth](https://next-auth.js.org/providers/fusionauth). Doing so ensures every request to the `/api/auth/*` path is handled by NextAuth.js.

```jsx
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-nextjs-single-sign-on/main/src/pages/api/auth/%5B...nextauth%5D.js %}
```

### Exposing session state

To allow components to check whether the current user is logged in, change `src/pages/_app.js` to have your application rendered inside a `<SessionProvider>` context, like shown below.

```jsx
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-nextjs-single-sign-on/main/src/pages/_app.js %}
```

This will make the [`useSession()`](https://next-auth.js.org/getting-started/client#usesession) React Hook accessible to your entire application.

Now, create a component that will either render a "Log in" or "Log out" button, depending on the session state, in a `src/components/login-button.jsx` file.

```jsx
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-nextjs-single-sign-on/main/src/components/login-button.jsx %}
```

Then, you change your home component located at `src/pages/index.js` to include the `<LoginButton />` component inside `<main>`.

```jsx
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-nextjs-single-sign-on/main/src/pages/index.js %}
```

## Environment variables

If you cloned the demo repository, you can copy `.env.local.dist` to `.env.local` and change the values there. If not, create a `.env.local` file and fill in the details from your FusionAuth application.

```ini
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-nextjs-single-sign-on/main/.env.local.dist %}
```

## Testing

Start the HTTP server by running the following command.

```shell
npm run dev
```

Browse to [localhost:3000](http://localhost:3000).

{% include _image.liquid src="/assets/img/blogs/nextjs-single-sign-on/before-login.png" alt="The initial nextjs screen." class="img-fluid" figure=true %}

Click the "Log in" button to be taken to a page with a "Sign in with FusionAuth" button.

{% include _image.liquid src="/assets/img/blogs/nextjs-single-sign-on/ask-for-login.png" alt="The sign-in button screen." class="img-fluid" figure=true %}

After clicking it, you should be redirected to your FusionAuth login screen.

{% include _image.liquid src="/assets/img/blogs/nextjs-single-sign-on/login-screen.png" alt="The FusionAuth sign-in screen." class="img-fluid" figure=true %}

Enter the correct credentials created when you set up FusionAuth and submit the form. You'll arrive back at your Next.js application home screen, with your email address displayed and a "Log out" button.

{% include _image.liquid src="/assets/img/blogs/nextjs-single-sign-on/after-login.png" alt="The nextjs application after logging in." class="img-fluid" figure=true %}

## Next steps

What's next?

You could:

* Make FusionAuth [look like your nextjs application using themes](/docs/v1/tech/themes/).
* [Learn more about OAuth](/learn/expert-advice/oauth/modern-guide-to-oauth/).
* Build out a real nextjs application with a protected page.

Happy coding!
