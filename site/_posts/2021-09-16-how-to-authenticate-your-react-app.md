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

Whenever you create a website that allows a user to create and interact with their own account, an authentication component is must-have.  The problem, however, is that most hand-rolled authorization servers are not robust enough to keep up with the most current, secure authentication workflows. Whats more, since security is not always seen as a business priority, hand-rolled authorization servers can quickly become an internal tool that is not often touched, prone to disrepair and easy hacker exploitation.  

<!--more-->

In this tutorial, you will learn how to integrate a React app with FusionAuth to abstract all of the problems of making and maintaining an auth server away from you, so you can focus your development time on your app's features. We'll start with downloading and configuring FusionAuth, then create a static login/logout React component, then build login/logout functionality where a user can log in and log out as well as create an account, [and finish up with authorizing certain routes based on a user's login status.] We will use an API-first approach so that you have more freedom and control of how your app looks on the login and logout page.

## What is Authentication?

You use authentication every day, whether you realize it or not. Every time you log in to a website, you have used authentication. Every time you use Facebook or Google to sign onto another service, you have used authentication. As a React developer, you will most likely write web apps that make use of a login or create user feature, and display certain data based on a certain user's credentials.  All of this functionality makes heavy use of authentication. But what exactly is authentication?

In short, authentication is the process of a client proving that they are who they say they are to an external server so that they can access resources specific to them. Think of it like showing a passport to a customs agent to visit another country. In order to enter, you must present valid, verified proof from your country’s government that verifies you are who you say you are.  Authorization workflows such as OAuth 2.0 make similar use of verified, trusted objects such as tokens, which are passed around between clients, authorization servers, and resource servers to prove that a user is who they say they are. Only once that proof is verified is the user allowed to access the resource they want, such as a bank account, social media homepage, or email.

While it is possible to write your own authentication/authorization solutions, it is often best to use an open source tool or external service like FusionAuth with enterprise projects, as authorization servers are complex and require a decent amount of maintenance, and if you are not able to dedicate a good amount of developer hours and knowledge to maintaining your auth workflows, they can become easily exploited and result in data loss.  You can also use an external 'identity provider', which is a way of authenticating users with an external trusted service such as Facebook, Google, Spotify, or (surprise!) FusionAuth, however, this is outside the scope of this tutorial.

## What is Authorization?

While authentication is proving you are who you say you are, authorization is the process of allowing a user to access certain things based on their credentials.  Back to the passport analogy, a traveler may present a passport to a customs agent that proves they are who they say they are, and they may have an extra stamp in their passport that proves they are a diplomat or a journalist. Because of those stamps, they can now enter zones that are off-limits to regular travelers, such as conflict areas or diplomatic buildings.  In a similar fashion, if a user is a website admin and has the data to prove that they are, they can access certain parts of that website that a regular user cannot.  An 'authorization server', like FusionAuth, is a server that provides services to both authenticate and authorize users.

## What is FusionAuth?

FusionAuth is a complete auth platform that saves your team time and resources by handling everything to do with authentication and identity access management. It allows you to quickly implement complex standards like OAuth, OpenID Connect, and SAML and build out additional login features to meet compliance requirements, such as integrating with external identity providers (IDPs).

## Before you begin

There are a few things that you need to have in place before you get started:

* You need to have either a FusionAuth Cloud account or install their self-hosted version, available for free. Follow the [FusionAuth 5-Minute Setup Guide](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide/) to get started with your installation.  
* Make sure your Node version is at least 14.17.6, as we use this version in this tutorial.  
* We use React 17.0.2, and suggest you use the same or most recent stable build.

Once you have installed all the required components listed above, log into your FusionAuth instance to get started configuring authentication on your site.

## Setting up FusionAuth using Kickstart (Option 1 - For Experienced Users Only)

Instead of manually setting up FusionAuth using the admin UI, you can use Kickstart. This lets you get going quickly if you have a fresh installation of FusionAuth. Learn more about how to use [Kickstart](/docs/v1/tech/installation-guide/kickstart/). Here's an example [Kickstart file](https://github.com/FusionAuth/fusionauth-example-kickstart/blob/master/example-apps/path-to-kickstart-here) which sets up FusionAuth for this tutorial.  We recommend only doing this after you have a little experience manually configuring FusionAuth, though, as manual configuration will teach you more about authorization and what is happening under the hood.

You'll need to edit that Kickstart file and update the application name and redirect URLs.

## Manually Configure an Application in FusionAuth (Option 2 - Recommended)

Now, you must configure an application in FusionAuth as well as link the user account with which you’ll log in.

*"But wait a minute!" you may ask. "Why do I have to make another app in FusionAuth? Don't I already have a React App? What is this extra application all about?  I thought I could just import FusionAuth functionality into my React app?"*

These are great questions. Currently, we don't have a React SDK, therefore you can't directly import FusionAuth functionality into your JavaScript or React projects.  Instead, FusionAuth is a separate auth solution wrapped in a separate authorization server that developers can interact with via API calls.  So, instead of being something like a JavaScript library that you port into your own JavaScript projects and pull functionality from, FusionAuth actually is an entirely separate application that you configure to work with your React app and server of your choosing via API calls.  Think of it like a MongoDB or Postgres database, but which handles auth, rather than storing data.  This does have some benefits, however, such as far more layers of security, and more control over using FusionAuth as a user data store.

So, from here, navigate to the administrative user interface, and go to Applications. Click the green **+** button to add a new application to your FusionAuth instance. Follow these steps to create your OAuth application to use with your React app:

* Add a name for your application. I'm calling mine `React Auth`, and I suggest you do the same.
* Under the `OAuth` tab, configure the “Authorized redirect URL”. This is where you want FusionAuth to redirect the authorization code. For this case, we are explicitly redirecting it to your app's Express backend. You need to configure this because if you *don't* and a hacker later steals your authorization code, they can redirect your app anywhere they want - like to their malicious hacker server! That will cause you a whole heap of issues. In this case, enter `http://localhost:3000/oauth-callback`
* Under the same `OAuth` tab, configure the “Logout URL” to where FusionAuth sends the user after they (surprise!) log out. Enter in `http://localhost:3001/logout`.

Click the blue save button in the top-right to finish the configuration.

This is what your configuration might look like:

picture here

Congratulations! You now have a FusionAuth app to use with your React app.  

## Create a User and Link them to Your FusionAuth App

For the next step, we will link a user to your brand-new FusionAuth app, ReactAuth, via the dashboard. This is where another useful feature of FusionAuth comes into play, as a 'user data store', aka a centralized location where you can manage all the users of your app in a friendly UI environment. Of course, you can register users from your app if you want to build that functionality in later on, but that is beyond this tutorial's scope.  

* Select `users` from the left-hand side menu.
* Select the green plus sign on the top left to add a user. I used `test@fusionauth.io`
* Give the user a dummy email and deselect `send email to setup password`.
* Give the user a simple password. May I suggest `password`?
* Click the `save` icon on the top right.
* Go back to `users`.
* Select `manage` under the `action` tab for your new user.
* Select `add registration`. In the dropdown menu, select `React Auth`. If you don't see it, double check that you remembered to push `save` when you created your application.

Well done! You now have at least one user that is linked to your `React Auth` app. Not bad for your app being in development.


## Set up the Project Folders and Configuration

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
This creates a React app inside the parent directory. `npx` ships with node, so don't worry about needing to run anything else to install it.

Now, create a `server` folder to hold our express server.

```
mkdir server
```

Change into that server directory and make a `index.js` file inside of it.

```
cd server
touch index.js
```

This will hold our Express server.

Lastly, change back into the parent `reactauthapp` folder, and run:

```bash
npm init -y
```
Confirm that a package.json was created in the root `reactauthapp` folder.

At the end, your folder structure should look like this:

```
reactauthapp
  client
  - public
  - src
  ...
  server
  - index.js
  package.json
```

To cover all of your bases, I recommend `cd`-ing into your `client` folder and running

```
npm start
```

to make sure your React app starts up correctly.

Lastly, it is useful to create a config file in your `client/src` directory.  In your `client/src` folder, create a `config.js` like so:

```
touch config.js
```

Inside of that config file, you are going to copy the OAuth info from the FusionAuth admin panal.  *You must copy your own info!*

Here's an example of what it will look like:

//screenshot here


## Write the React Application

Now, we're going to write the React frontend. This will mostly be a UI which makes a couple of API calls to FusionAuth and our Node/Express backend.

First off, lets get React talking to Node/Express. Inside of client/src/index.js:

```
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const config = require('../../config');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <div id='App'>
        <header>
          <h1>FusionAuth Example: React</h1>
        </header>
      </div>
    );
  }
}

ReactDOM.render(<App/>, document.querySelector('#Container'));
```

Navigate to `localhost:3000` and confirm that everything is working properly.

Now we will work on some conditional rendering. If a user is logged in, we are going to display their email with a greeting. We won't send a request to the express server quite yet, we will just mock this to make sure we can do this in the first place.

Let's make a greeting component.  In `client/src/components`, create a new `Greeting` component.  

`touch client/src/components/Greeting.js`

Go into the Greeting component and and add the following:

```
import React from 'react';

export default class Greeting extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let message = (this.props.email)
      ? `Hi, ${this.props.email}!`
      : "You're not logged in.";

    return (
      <span>{message}</span>
    );
  }
}
```

Now update `index.js`  to the following:

```
import Greeting from './components/Greeting.js'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: 'test@fusionauth.io'
    };
  }

  render() {
    return (
      <div id='App'>
        <header>
          <h1>FusionAuth Example: React</h1>
          <Greeting email={this.state.email}/>
        </header>
      </div>
    );
  }
}

ReactDOM.render(<App/>, document.querySelector('#main'));

```

This is a relitively simple conditional rendering: if the user is logged in, a welcome message displays. If not, then a 'please log in' message displays.

Now, let's set state based on a call to our Express server. But first, we need to set up that server!

## Write the Express Server  

*"Wait", you may say, "why do I need an Express server? Can't I just use Router?"*

Again, a good question. This has to do with the authorization code grant, which is the OAuth grant are using in this tutorial. This grant relies on a user interacting with a browser, but still needs a server-side component to handle passing tokens and authorization codes to and from the authorization server, aka FusionAuth.  This keeps all of your sensitive access objects on the server-side of your app, and makes them far less likely to be intercepted and hacked.  If you want to learn more about the nuts and bolts of how the authorization code grant works, check out the [Modern Guide to OAuth](https://fusionauth.io/learn/expert-advice/oauth/modern-guide-to-oauth/).

First off, install express in your dependency.  In your root folder, install:

```
npm i express
```

Then, create a script in `sever/package.json` that starts our web server when we start it with `npm start`

```
...
"scripts": {
  "start": "node server/index.js"
},
...
```

Also, unless you want to tear your hair out with repeated CORS errors, go ahead and install the following NPM package.

First `npm init -y` to create a `package.json`:

Second, run
`npm install cors express express-session request`

What did you just install?

- cors, so that you can make cross-origin requests.
- express, so that you can use the Express package.
- express-session, so that you can save data in a server-side session.
- request, so that you can format HTTP requests in an organized fashion.

So, firstly we will set up express with `const app = express()`, call the `/user` route, and then start our server. 


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

## Take it Further

Some more interesting areas that you may want to cover on your own time are the following:
  - Handling tokens on the browser -  would you want to use a session, store it in memory, or some other format?
  - Using PKCE (pronounced 'Pixie') to give an additional layer of security to your React app's login workflows.
  - Exploring roles and self-registration.
  - Using iFrame to have a custom login screen.

We're working on a tutorial on iFrame as well as exploring roles in your React app, so keep your eyes peeled for those in the upcoming months!

OAuth is just one feature of FusionAuth, but you can see how easily you can set it up to make your login process more streamlined and trustworthy.

More TBD
