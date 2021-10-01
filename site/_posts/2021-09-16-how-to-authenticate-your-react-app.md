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

We will do the following in this tutorial:

- Set up FusionAuth
- Create a user in FusionAuth
- Create a basic React UI
- Create an Express backend server
- Link all three of these things together using API calls
- Log a user in
- Log a user out

All of this is going to happen using the OAuth 2.0 Authorization Code Flow. In a nutshell, FusionAuth and your Express server communicate via a trusted network to authenticate a user who is logging in from your React frontend. They authenticate by passing authorization codes and tokens to and from each other, to prove the user is who the user is.  Its a little complicated, but the most important thing to remember is *all of the tokens and auth code grant communication happens on a trusted server side and your React application never validates user information or even knows or anything about the user the entire time*. This way hackers can't come in and get user data from your React app, at all.  You can learn more about that particular flow in detail in our [Modern Guide to OAuth](https://fusionauth.io/learn/expert-advice/oauth/modern-guide-to-oauth/).  

## Set up FusionAuth

### Use Kickstart

Instead of manually setting up FusionAuth using the admin UI, you can use Kickstart. This lets you get going quickly if you have a fresh installation of FusionAuth. Learn more about how to use [Kickstart](/docs/v1/tech/installation-guide/kickstart/). Here's an example [Kickstart file](https://github.com/FusionAuth/fusionauth-example-kickstart/blob/master/example-apps/path-to-kickstart-here) which sets up FusionAuth for this tutorial.  We recommend only doing this after you have a little experience manually configuring FusionAuth, though, as manual configuration will teach you more about authorization and what is happening under the hood.

You'll need to edit that Kickstart file and update the application name, API Key, and redirect URLs.

### Manual Configuration

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

### Create a User and Link them to Your FusionAuth App

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

## Create the ReactUI


### Set up the Project Folders and Configuration

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


### Write the React Application

Now, we're going to write the React frontend. This will mostly be a UI which makes a couple of API calls to FusionAuth and our Node/Express backend.

First off, lets get React talking to Node/Express. Inside of client/src/index.js:

```js
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

Now we will work on some conditional rendering, to make sure our state is updating properly. If a user is logged in, we are going to display their email with a greeting. We won't send a request to the express server quite yet, we will just mock this to make sure we can do this in the first place.

Let's make a greeting component.  In `client/src/components`, create a new `Greeting` component.  

`touch client/src/components/Greeting.js`

Go into the Greeting component and and add the following:

```js
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
      <span> {message} </span>
    );
  }
}
```

Now update `index.js`  to the following:

```js
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

## Create the Express Server

*"Wait", you may say, "why do I need an Express server? Can't I just use Router?"*

Again, a good question. This has to do with the authorization code grant, which is the OAuth grant are using in this tutorial. This grant relies on a user interacting with a browser, but still needs a server-side component to handle passing tokens and authorization codes to and from the authorization server, aka FusionAuth.  This keeps all of your sensitive access objects on the server-side of your app, and makes them far less likely to be intercepted and hacked.  If you want to learn more about the nuts and bolts of how the authorization code grant works, check out the [Modern Guide to OAuth](https://fusionauth.io/learn/expert-advice/oauth/modern-guide-to-oauth/).

### Configure the folders and packages

First off, install express in your dependency.  In your root folder, install:

```
npm i express
```

Then, create a script in `sever/package.json` that starts our web server when we start it with `npm start`

```js
...
"scripts": {
  "start": "node server/index.js"
},
...
```

First
```
npm init -y
```

to create a `package.json`:

Second, run

```
npm install express cors express-session request
```

What did you just install?
- cors, so that you can avoid CORS errors.
- express, so that you can use the Express package.
- express-session, so that you can save data in a server-side session.
- request, so that you can format HTTP requests in an organized fashion.

### Write the Express Server

First, lets draw a `user` route in server/routes/user.js:

```js
// server/routes/user.js

const express = require('express');
const router = express.Router();
const config = require('../../client/src/config');

router.get('/', (req, res) => {
  res.send({
    user: {
      email: 'dinesh@fusionauth.io'
    }
  });
});

module.exports = router;
```

Why is this in an object? The reason is FusionAuth will ultimately send us the user object when a user logs in, so we are configuring our server to be able to  handle that.


* A note about the user object: the user object has several properties that it automatically ships with. Email is one of them, and of course username, etc. etc.  For more information on what sorts of data you can get on a user, check out our [user API docs](https://fusionauth.io/docs/v1/tech/apis/users/#retrieve-a-user).

Next, in `server/index.js` let's import & use express with `const app = express()`, call our first route,  `/user`, and then start our server.

```js
const express = require("express");

const PORT = process.env.PORT || 3001;

const config = require('../client/src/config');

// configure Express app and install the JSON middleware for parsing JSON bodies
const app = express();
app.use(express.json());

// use routes
app.use('/user', require('./routes/user'));

// start server
app.listen(config.serverPort, () => console.log(`FusionAuth example app listening on port ${config.serverPort}.`));
```

When our React client sends a request to localhost:9000/user, it will get a response based on whatever we send back in server/routes/user.js. So what about that mock email we made in our React UI? Well, we've moved that email from React's state to our server component, wrapped in a user object.

Next, let's update our React UI so that we are not using the mock user email anymore, but an actual user called from FusionAuth via the Express server:

client/src/index.js

  ```js

  // ...

constructor(props) {
  super(props);
  this.state = {
    body: {} // this is the body from /user
  };
}

render() {
  return (
    <div id='App'>
      <header>
        <h1>FusionAuth Example: React</h1>
        <Greeting body={this.state.body}/>
      </header>
    </div>
  );
}

// ...
  ```

client/components/Greeting.js

```js
// ...

let message = (this.props.body.user)
  ? `Hi, ${this.props.body.user.email}!`
  : "Please log in.";

// ...
```


In the next section, we’ll replace our fake user with a real one. Before we do that, let’s set up our React app to fetch the user from /user whenever the page loads (or “when the component mounts” in React lingo):

client/app/index.js

```js

// ...

componentDidMount() {
  fetch(`http://localhost:${config.serverPort}/user`, {
    credentials: 'include' // fetch won't send cookies unless you set credentials
  })
  .then(response => response.json())
  .then(response => this.setState(
    {
      body: response
    })
  );
}

// ...
```

One thing to note about our code above is that we need to specify the credentials: 'include' option to the fetch function. This is required since eventually we will be hooking up to a server-side session and without this setting the browser won’t send over the cookie that Express uses for server-side sessions.

Now you can try the React client again. *Depending on your setup, you might have gotten a CORS error*; check the browser console. Fortunately, you thought of this, and installed the cors package. Use it in your server.js like so:

```js
const express = require('express');
const cors = require('cors');
const config = require('../config');

// configure Express app and install the JSON middleware for parsing JSON bodies
const app = express();
app.use(express.json());

// configure CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// ...
```

Awesome! So if you go to localhost:3000, you should see the user displayed, right? Well, not quite. We have to add login functionality first!

## Logging in

User sign-in is one of the key features of FusionAuth.  Let’s see how it works.

Redirecting to FusionAuth
First thing’s first: we need a “log in” button in the React client:

client
└─app
  ├─components
  │ ├─Greeting.js
  │ └─LogInOut.js*
  └─index.js
Just like we did in Greeting, we’ll use this.props.body.user to determine whether or not the user is logged in. We can use this to make a link to either localhost:9000/login or localhost:9000/logout, the former of which we’ll set up in just a second.

Let's create the `LogInOut` component to start.  

Make a new file in client/src/components

```
touch client/src/components/LogInOut.js

```

Then, create a simple login and log out component in this new file:

```js
import React from 'react';

export default class LogInOut extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let message = (this.props.body.user)
      ? 'sign in'
      : 'sign out';

    let path = (this.props.body.user)
      ? '/login'
      : '/logout';

    return (
      <a href={this.props.uri + path}>{message}</a>
    );
  }
}
```
File: client/app/components/LogInOut.js

Why am I using a normal <a> link here instead of a fetch request, like we did for /user? In order to leverage FusionAuth’s OAuth system with the Authorization Code Grant, we have to redirect the browser over to FusionAuth. While you might want to avoid redirecting away from the React app, this workflow adds a lot of security and also provides an ideal separation of concerns. Plus, you can style the FusionAuth login page to look like your application, which means the user won’t even realize they’ve been redirected.

We could write a link directly to FusionAuth, but I think it’s cleaner to go through the Express app, because the FusionAuth OAuth workflow requires a somewhat complex URL to start.

Now, import that component in your client/index.js

```js

// ...

import LogInOut from './components/LogInOut.js';

// ...


<header>
  <h1>FusionAuth Example: React</h1>
  <Greeting body={this.state.body}/>
  <LogInOut body={this.state.body} uri={`http://localhost:${config.serverPort}`}/>
</header>

// ...
```

Your full `src/index.js`  should look like this:

```js
import React from 'react';
import ReactDOM from 'react-dom';
import Greeting from './components/Greeting.js';
import LogInOut from './components/LogInOut.js';
import './index.css';

const config = require('./config.js');

  class App extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        body: {} // this is the body from /user
      };
    }

    componentDidMount() {
      fetch(`http://localhost:${config.serverPort}/user`, {
        credentials: 'include' // fetch won't send cookies unless you set credentials
      })
        .then(response => response.json())
        .then(response => this.setState(
          {
            body: response
          })
        );
    }

      render() {
        return (
          <div id='App'>
          <header>
            <h1>FusionAuth Example: React</h1>
            <Greeting body={this.state.body}/>
            <LogInOut body={this.state.body} uri={`http://localhost:${config.serverPort}`}/>
            </header>
          </div>
        );
      }
    }

ReactDOM.render(<App/>, document.querySelector('#main'));
```
 Remember the structure we detailed earlier:

React client <-> Express server <-> FusionAuth
(mostly UI)      (our code)         (pre-made auth)

We’ll use this principle and add in another Route to our Express application to start the login process and *redirect the browser over to FusionAuth*.  We do this on the server side, because the communication between our server and FusionAuth is over a trusted network, not over the open web. This is a very important component of building secure login experiences.

We’ll add our new login route to handle this:

server
├─routes
│ ├─login.js*
│ └─user.js
└─index.js

Whenever we add a new route, we need to let `server/index.js` know, just like we did with `/user`. In `server/index.js`:

```js
// ...

// use routes
app.use('/user', require('./routes/user'));
app.use('/login', require('./routes/login'));

// ...
```

When a user goes to /login, we redirect them off of the Express sever and onto FusionAuth’s login page. Remember, we installed FusionAuth so that we don’t have to handle the login process at all!  

*Note: there is a way to use your own custom login with iFrame, but that is outside the scope of this tutorial*

Now, lets configure our `server/routes/login.js` file to do just that:

```js
const express = require('express');
const router = express.Router();
const config = require('../../client/src/config');

router.get('/', (req, res) => {
  res.redirect(`http://localhost:${config.fusionAuthPort}/oauth2/authorize?client_id=${config.clientID}&redirect_uri=${config.redirectURI}&response_type=code`);
});

module.exports = router;
```

If that URI looks a bit messy, it’s because of the additional query parameters, which FusionAuth needs to process our request:

- `client_id` tells FusionAuth which app is making the request
- `redirect_uri` tells FusionAuth where to redirect the user to after login
- `response_type` tells FusionAuth which OAuth flow we’re using (Authorization Code in this example)

This is all standard OAuth auth code grant flow.

Try navigating to localhost:3000/login. You should see a FusionAuth login form:

// PICTURE HERE

When you successfully authenticate, you’ll just see Cannot GET /oauth-callback, because /oauth-callback doesn’t exist, yet. Remember, we added that as an Authorized redirect URL in the FusionAuth admin panel and as our redirectURI in config.js. This is the location that where FusionAuth redirects the browser back to after authentication in order to complete the OAuth workflow.

Code Exchange
Alright, time to add the /oauth-callback route:

server
├─routes
│ ├─login.js
│ ├─oauth-callback.js*
│ └─user.js
└─index.js

In `server.js`...

```js
// ...

// use routes
app.use('/user', require('./routes/user'));
app.use('/login', require('./routes/login'));
app.use('/oauth-callback', require('./routes/oauth-callback'));

// ...
```

/oauth-callback will receive an Authorization Code from FusionAuth as a URL parameter during the redirect. If you inspect your browser’s location, you’ll see that there’s a code parameter in the URL:

```
http://localhost:9000/oauth-callback?
  code=14CJG_fDl31E5U-1VHOBedsLESZQr3sgt63BcVrGoTU&
  locale=en_US&
  userState=Authenticated
```
An Authorization Code isn’t enough to access the user’s resources, though. For that, we need an Access Token. Again, this is standard OAuth, not something unique to FusionAuth. This step is called the Code Exchange, because we send the code to FusionAuth’s /token endpoint and receive an access_token in exchange.

Make a new file in server/routes called  `oauth-callback.js` and put in the following:

The exchange takes the form of a POST request:

```js

const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('../../config');

router.get('/', (req, res) => {
  request(
    // POST request to /token endpoint
    {
      method: 'POST',
      uri: `http://localhost:${config.fusionAuthPort}/oauth2/token`,
      form: {
        'client_id': config.clientID,
        'client_secret': config.clientSecret,
        'code': req.query.code,
        'grant_type': 'authorization_code',
        'redirect_uri': config.redirectURI
      }
    },

    // callback
    (error, response, body) => {
      // save token to session
      req.session.token = JSON.parse(body).access_token;

      // redirect to the React app
      res.redirect(`http://localhost:${config.clientPort}`);
    }
  );
});

module.exports = router;
```

The most important parts of the request are uri (which is where the request will get sent to) and form (which is the set of parameters FusionAuth expects). The OAuth token can endpoint only access form encoded data, which is why we are using the form option in our request call. You can check the FusionAuth docs to see what every endpoint expects to be sent, but here’s the gist of this request:

- The `client_id` and `client_secret` identify and authenticate our app, like a username and password
- The `code` is the Authorization Code we got from FusionAuth
- The `grant_type` tells FusionAuth we’re using the The OAuth Authorization Code Flow (as opposed to an implicit grant or PKCE or some other OAuh flow)
- The `redirect_uri`  is the URL we’re making the request from
- The callback lambda is invoked after FusionAuth receives our request and responds. We’re expecting to receive an access_token, which will come through in that body argument. We’ll save the access_token to session storage and redirect back to the React client.

Remember that request-followed-by-callback structure, because we’ll be using it again.

We’re almost done! The only thing left is to set up the server-side session storage for our Access Token.  In order to do this, we need to configure express-session. The following settings work great for local testing, but you’ll probably want to check the express-session docs before moving to production.

Add this to `server/index.js`

```js
// ...

// configure Express app and install the JSON middleware for parsing JSON bodies
const app = express();
app.use(express.json());

// configure sessions
app.use(session(
  {
    secret: '1234567890',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: 'auto',
      httpOnly: true,
      maxAge: 3600000
    }
  })
);
```

// ...

### Introspect and Registration - aka 'Displaying User Data'
Our React app looks for a user in `/user`. The Access Token that is granted to our Express server from FusionAuth isn’t human-readable, but we can pass it to FusionAuth’s `/introspect` endpoint to get a User Object (JSON like we showed earlier) from it. Its like saying 'Hey FusionAuth, you gave us this access token and so we can use that to access a user's data from you, because you trust your own access tokens.' We can get additional user-specific info from `/registration` as well.  Then we can display whatever we want to the end user based on that user object (well, anything that the object gives us access to) which is what we are going to do now.

If there’s a token in session storage, we’ll call `/introspect` to get info out of that token. Part of the info returned from `/introspect` is the boolean property `active`, which is true until the Access Token expires (you can configure how long Access Tokens live in the FusionAuth admin panel). If the token is still good, we’ll call `/registration` and return the JSON from both requests.

If there’s no token in session storage, or if the token has expired, we’ll return an empty object. Our React components use the existence of `this.props.body.user` to determine whether a user is logged in, so an empty body means there’s no active user.

Below is our new and improved `/user` route; it’s a lot like `/oauth-callback`, but with a layer of nesting. It looks like a lot, but we’ll break it up piece-by-piece.

In `server/routes/user.js`:

```js
const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('../../config');

router.get('/', (req, res) => {
  // token in session -> get user data and send it back to the react app
  if (req.session.token) {
    request(
      // POST request to /introspect endpoint
      {
        method: 'POST',
        uri: `http://localhost:${config.fusionAuthPort}/oauth2/introspect`,
        form: {
          'client_id': config.clientID,
          'token': req.session.token
        }
      },

      // callback
      (error, response, body) => {
        let introspectResponse = JSON.parse(body);

        // valid token -> get more user data and send it back to the react app
        if (introspectResponse.active) {
          request(
            // GET request to /registration endpoint
            {
              method: 'GET',
              uri: `http://localhost:${config.fusionAuthPort}/api/user/registration/${introspectResponse.sub}/${config.applicationID}`,
              json: true,
              headers: {
                'Authorization': config.apiKey
              }
            },

            // callback
            (error, response, body) => {
              res.send(
                {
                  token: {
                    ...introspectResponse,
                  },
                  ...body
                }
              );
            }
          );
        }

        // expired token -> send nothing
        else {
          req.session.destroy();
          res.send({});
        }
      }
    );
  }

  // no token -> send nothing
  else {
    res.send({});
  }
});

module.exports = router;
```

First, the POST request to `/introspect`: this endpoint requires our Client ID and, of course, the Access Token we want to decode. Just like the token endpoint, this endpoint access form encoded data, so we are using the form option.

In the callback from that request, we’ll parse the body into usable JSON and check that active value. If it’s good, we’ll go ahead and make the `/registration` request, which requires a User ID (“subscriber” or sub in OAuth jargon) and our Client ID—we need both, because one user can have different data in each FusionAuth application.

Note that this step doesn’t actually require an Access Token. The data from FusionAuth’s `/api/user/registration` API can be retrieved for any user, including one that isn’t logged in. You could use this endpoint to show info on a user’s profile or other public page. This API in FusionAuth is not part of the OAuth specification but we added it to our example to show a more complete user data interaction. Also, this API requires that you pass in a FusionAuth API key in the Authorization header. Our example is pulling the FusionAuth API key from our global `config.js` file.

Finally, in the registration callback, we’ll parse the body returned from `/registration` and `res.send` everything back to the React client.

Now, go through the login process, and you should see “Welcome, [your email address]!”.

That’s login sorted. The next thing you’ll probably want to tackle is logout.

## Logging Out
Just like /login, we’ll create a /logout route to make logging out easily accessible anywhere in our React client:

server
├─routes
│ ├─login.js
│ ├─logout.js*
│ ├─oauth-callback.js
│ └─user.js
└─index.js

In `server/index.js`:
```js
// ...

// use routes
app.use('/user', require('./routes/user'));
app.use('/login', require('./routes/login'));
app.use('/oauth-callback', require('./routes/oauth-callback'));
app.use('/logout', require('./routes/logout'));

// ...
```

Our `/logout` route will wipe the user’s saved login by deleting:

- A browser cookie that connects the browser to the server-side session
- Our Express server-side session (and the token we store there)
- FusionAuth’s OAuth session for that user

The first two are accomplished by calling the function `req.session.destroy()`. The last is done by redirecting the user to FusionAuth’s `/ouath2/logout` endpoint.

In `server/routes/logout.js`:

```js
const express = require('express');
const router = express.Router();
const config = require('../../config');

router.get('/', (req, res) => {
  // delete the session
  req.session.destroy();

  // end FusionAuth session
  res.redirect(`http://localhost:${config.fusionAuthPort}/oauth2/logout?client_id=${config.clientID}`);
});

module.exports = router;
```

After cleaning up, FusionAuth will redirect to the React app, because we configured the main entry point of our React app as the Logout URL in FusionAuth.

Try it out. You can also watch cookies in your browser’s developer tools to see it working.


## Troubleshooting

FusionAuth has made troubleshooting easy. If you’ve missed a setting in your OAuth configuration, you will most likely see an error message come back telling you what you’ve missed. Check back through the settings above to make sure you have copied the correct information over from FusionAuth, and that you have saved both the OAuth settings as well as the Attribute Mapping in the miniOrange OAuth Client.

You might find that after a restart or a long time between logins, your FusionAuth instance will log out. When that happens, clicking the login on your login form will add an additional step for you to log into your FusionAuth instance again so that it can access the needed credentials.

## Take it Further

Some more interesting areas that you may want to cover on your own time are the following:
  - Handling tokens on the browser -  would you want to use a session, store it in memory, or some other format?
  - Using PKCE (pronounced 'Pixie') to give an additional layer of security to your React app's login workflows.
  - Exploring roles and self-registration.
  - Using iFrame to have a custom login screen.

We're working on a tutorial on iFrame as well as exploring roles in your React app, so keep your eyes peeled for those in the upcoming months!

OAuth is just one feature of FusionAuth, but you can see how easily you can set it up to make your login process more streamlined and trustworthy.
