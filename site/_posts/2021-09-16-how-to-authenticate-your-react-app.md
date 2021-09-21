---
layout: blog-post
title: How to Authenticate Your React App with FusionAuth
description: In this tutorial, you’ll learn how to implement a secure login/logout and route authorization with React and FusionAuth
author: Akira Brand
image: blogs/joomla-sso-fusionauth/how-to-set-up-single-sign-on-sso-between-fusionauth-and-joomla-header-image.png
category: blog
tags: tutorial-react tutorial-javascript client-react client-javascript tutorial-integration
excerpt_separator: "<!--more-->"
---

Whenever you create a website that allows a user to create and interact with their own account, an authentication component is must-have.  The problem, however, is that most hand-rolled authentication servers are not robust enough to keep up with the most current, secure authentication workflows. Whats more, since security is not always seen as a business priority, hand-rolled authentication servers can quickly become an internal tool that is not often touched, prone to disrepair and easy hacker exploitation.  

<!--more-->

In this tutorial, you will learn how to integrate a React app with FusionAuth to abstract all of the problems of making and maintaining an auth server away from you, so you can focus your development time on your app's features. We'll start with downloading and configuring FusionAuth, then create a static login/logout React component, then build login/logout functionality where a user can log in and log out as well as create an account, [and finish up with authorizing certain routes based on a user's login status.] We will use an API-first approach so that you have more freedom and control of how your app looks on the login and logout page.

## What is Authentication?

You use authentication every day, whether you realize it or not. Every time you log in to a website, you have used authentication. Every time you use Facebook or Google to sign onto another service, you have used authentication. As a React developer, you will most likely write web apps that make use of a login or create user feature, and display certain data based on a certain user's credentials.  All of this functionality makes heavy use of authentication. But what exactly is authentication?

In short, authentication is the process of a client proving that they are who they say they are to an external server so that they can access resources specific to them. Think of it like showing a passport to a customs agent to visit another country. In order to enter, you must present valid, verified proof from your country’s government that verifies you are who you say you are.  Authentication workflows such as OAuth 2.0 make similar use of verified, trusted objects such as tokens, which are passed around between clients, authentication servers, and resource servers to prove that a user is who they say they are. Only once that proof is verified is the user allowed to access the resource they want, such as a bank account, social media homepage, or email.

While it is possible to write your own authentication solutions, it is often best to use an open source tool or external service like FusionAuth with enterprise projects, as authentication servers are complex and require a decent amount of maintenance, and if you are not able to dedicate a good amount of developer hours and knowledge to maintaining your auth workflows, they can become easily exploited and result in data loss.  You can also use an 'identity provider', which is a way of authenticating users with an external trusted service such as Facebook or Google, however, this is outside the scope of this tutorial.

## What is FusionAuth?

FusionAuth is a complete auth platform that saves your team time and resources by handling everything to do with authentication and identity access management. It allows you to quickly implement complex standards like OAuth, OpenID Connect, and SAML and build out additional login features to meet compliance requirements, such as integrating with external identity providers (IDPs).

## Before you begin

There are a few things that you need to have in place before you get started:

* You need to have either a FusionAuth Cloud account or install their self-hosted version, available for free. Follow the [FusionAuth 5-Minute Setup Guide](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide/) to get started with your installation.  
* Make sure your Node version is at least 14.17.6, as we use this version in this tutorial.  
* We use React 17.0.2, and suggest you use the same or most recent stable build.

Once you have installed all the required components listed above, log into your FusionAuth instance to get started configuring authentication on your site.

## Configure an Application in FusionAuth

Now, you must configure an application in FusionAuth as well as link the user account with which you’ll log in.

*"But wait a minute!" you may ask. "Why do I have to make another app in FusionAuth? Don't I already have a React App? What is this extra application all about?  I thought I could just import FusionAuth functionality into my React app?"*

These are great questions. Currently, we don't have a React SDK, therefore you can't directly import FusionAuth functionality into your JavaScript or React projects.  Instead, FusionAuth is a separate auth solution wrapped in a separate 'app' that developers can interact with via API calls.  So, instead of being something like a JavaScript library that you port into your own JavaScript projects and pull functionality from, FusionAuth actually acts as an entirely separate application that you configure to work with your React app and server of your choosing via API calls. This does have some benefits, however, such as far more layers of security, and more control over using FusionAuth as a user data store.

So, from here, navigate to the administrative user interface, and go to Applications. Click the green **+** button to add a new application to your FusionAuth instance. Follow these steps to create your OAuth application to use with your React app:

* Add a name for your application. I'm calling mine `React Auth`, and I suggest you do the same.
* Under the `OAuth` tab, configure the “Authorized redirect URL” to where you want FusionAuth to send your users *after* they have completed login.  In this case, enter `http://localhost:3000/oauth-callback`
* Under the same `OAuth` tab, configure the “Logout URL” to where FusionAuth sends the user after they (surprise!) log out. Enter in `http://localhost:8080/logout`.

Click the blue save button in the top-right to finish the configuration.

This is what your configuration might look like:

picture here

Congratulations! You now have a FusionAuth app to use with your React app.  

## Create a User and Link them to Your FusionAuth App

For the next step, we will link a user to your brand-new FusionAuth app, ReactAuth, via the dashboard. This is where another useful feature of FusionAuth comes into play, as a 'user data store', aka a centralized location where you can manage all the users of your app in a friendly UI environment. Of course, you can register users from your app if you want to build that functionality in later on, but that is beyond this tutorial's scope.  

* Select `users` from the left-hand side menu.
* Select `add user`.
* Give the user a fake email and deselect `send email to setup password`.
* Give the user a simple password. May I suggest `password`?
* Click the `save` icon on the top right.
* Go back to `users`.
* Select `manage` under the `action` tab for your new user.
* Select `add registration`. In the dropdown menu, select `React Auth`. If you don't see it, double check that you remembered to push `save` when you created your application.

Well done! You now have at least one user that is linked to your `React Auth` app. Not bad for your app being in development.

## Setting up FusionAuth using Kickstart

Instead of manually setting up FusionAuth using the admin UI, you can also use Kickstart. This lets you get going quickly if you have a fresh installation of FusionAuth. Learn more about how to use [Kickstart](/docs/v1/tech/installation-guide/kickstart/). Here's an example [Kickstart file](https://github.com/FusionAuth/fusionauth-example-kickstart/blob/master/example-apps/path-to-kickstart-here) which sets up FusionAuth for this tutorial.

You'll need to edit that Kickstart file and update the application name and redirect URLs.

## Write the React Application

We're going to use both Express and React for this application, so let's start with our folder structure. From the command line, run the following commands:

Make a parent folder called `reactauthapp`:

```
mkdir reactauthapp
```

This folder will hold both the front and back end files.

`cd` into that parent folder, and then run:
```
npx create-react-app client
```
This creates a React app inside the parent directory.

Now, make a `server.js` file in the parent directory with:

```
touch server.js
```

This will hold our Express server.

Lastly, in the `reactauthapp` folder, run:

```bash
npm init -y
```
Confirm that a package.json was created in the root `reactauthapp` folder.

At the end, your folder structure should look like this:

```
reactauthapp
  client
  server.js
  package.json
```

To cover all of your bases, I recommend `cd`-ing into your `client` folder and running

```
npm start
```

to make sure your React app starts up correctly.


## Write the Express Server

*"Wait", you may say, "why do I need an Express server? Can't I just use Router?"*

Again, a good question. You need an Express server, because there needs to be somewhere for the access token to be stored that isn't on the browser to pass

## Testing Your Login and Logout

Visit your React site on localhost:3000 and you should see your login form with a `login` button (or a button with whatever label you’ve put on it for your site).

Picture here

Clicking on the login button with the correct user credentials should log you straight into the website.

Picture here

Clicking log out will then log you out of the site and you’ll see the login form once more.

Double-check that your URLS also match up properly.

More TBD

## Troubleshooting

FusionAuth has made troubleshooting easy. If you’ve missed a setting in your OAuth configuration, you will most likely see an error message come back telling you what you’ve missed. Check back through the settings above to make sure you have copied the correct information over from FusionAuth, and that you have saved both the OAuth settings as well as the Attribute Mapping in the miniOrange OAuth Client.

You might find that after a restart or a long time between logins, your FusionAuth instance will log out. When that happens, clicking the login on your login form will add an additional step for you to log into your FusionAuth instance again so that it can access the needed credentials.

Add any additional troubleshooting here

## Conclusion

OAuth is just one feature of FusionAuth, but you can see how easily you can set it up to make your login process more streamlined. And you can make your React apps blow everyones minds with FusionAuth.

More TBD
