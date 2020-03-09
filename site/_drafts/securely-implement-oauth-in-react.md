---
layout: blog-post
title: How to Securely Implement OAuth in React
description: This post describes how to securely implement OAuth in a React application using the Authorization Code Grant (with FusionAuth as the IdP).
header_dark: false
image: blogs/oauth-react-fusionauth.png
category: blog
author: Matt Boisseau
date: 2020-03-09
dateModified: 2020-03-09
---

In this post, we'll walk step-by-step through implementing the OAuth Authorization Code Grant in a React app. This is the most secure way to implement OAuth and often overlooked for single-page applications that use technologies like React. We'll use FusionAuth as the IdP and also show you how to configure FusionAuth for this workflow. 

Our app will be able to:

- log users in
- log users out
- read user data from FusionAuth
- write user data to FusionAuth

In addition to React, we'll use a NodeJS backend. One major benefit of using a backend server is that we can safely store and use a Client Secret, which is the most secure way to integrate OAuth 2.0 Authorization Code Flow with our React app.

If you're in-the-know on OAuth stuff, you're probably aware that some people use PKCE (or the rightfully deprecated Implicit Flow) to get around the Client Secret constraint. We're sticking to Authorization Code Flow, because setting up a server is the most secure solution for the majority of cases and quite simple once you know how. Don't know what any of that means? Don't worry about it — you don't need to know anything about OAuth to follow this example. 

What do you need to know? Well, this example app will be much easier to follow if you have at least some knowledge of:

- React
	- components
	- state and props
	- binding
- NodeJS/Express
	- packages and modules
	- routing
	- HTTP requests (like `GET` and `POST`)

The general idea of this app is that the Express server acts as a middleman between the React client and FusionAuth. The React client will make requests to the Express server, which will make requests to FusionAuth before sending information back to the React client. Other than FusionAuth's login form, the user will only ever see React-rendered pages.

Conceptually, our app will look like this:

```
React client <-> Express server <-> FusionAuth
(mostly UI)      (our code)         (pre-made auth)
```

Literally, it might look something like this:

{% include _image.html src="/assets/img/blogs/fusionauth-example-react/app-finished.png" class="img-fluid" figure=false %}

(Although, you're on your own for CSS.)

If you want to peek at the source code for the exact app pictured above, you can grab it from [its GitHub respository](https://github.com/FusionAuth/fusionauth-example-react). You can follow along with that code or use it as a jumping-off point for your app.

Also, we put together a [complete workflow diagram for the Authorization Code Grant with a single-page application](/learn/expert-advice/authentication/spa/oauth-authorization-code-grant-sessions) that can help further explain how this process works. You can review that workflow to get a better understanding of how SPAs can leverage OAuth.

---

## 0. Setup

I know you're eager, but we need to set up our FusionAuth installation, directory structure, and Node packages. This seriously only takes a few minutes.

### FusionAuth

If you don't already have FusionAuth installed, I recommend the Docker Compose option for the quickest setup:

```zsh
curl -o docker-compose.yml https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/docker-compose.yml
curl -o .env https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/.env
docker-compose up
```

(Check out the [Download FusionAuth page](https://fusionauth.io/download) for other installation options.)

Once FusionAuth is running (by default at [localhost:9011](http://localhost:9011)), create a new Application. The only configuration you need to change is `Authorized redirect URLs` on the `OAuth` tab. Since our Express server will be running on `localhost:9000`, we'll set this to `http://localhost:9000/oauth-callback`. Click the blue `Save` at the top-right to finish the configuration.

{% include _image.html src="/assets/img/blogs/fusionauth-example-react/admin-edit-application.png" class="img-fluid" figure=false alt="FusionAuth application edit page" %}

A login feature isn't very useful with zero users. It's possible to register users from your app or using FusionAuth's self-service registration feature, but we'll manually add a user for this example. Select `Users` from the menu. You should see your own account; it's already registered to FusionAuth, which is why you can use it to log into the admin panel.

{% include _image.html src="/assets/img/blogs/fusionauth-example-react/admin-manage-user.png" class="img-fluid" figure=false %}

Select `Manage` and go to the `Registrations` tab. Click on `Add Registration`, pick your new application, and then `Save` to register yourself.

FusionAuth configuration: **DONE**. 

Leave this tab open, though; we'll be copy/pasting some key values out of it in a minute.

### Directory Structure

The last step before digging into some JavaScript is creating the skeleton of our Express server and React client. These will be completely separate Node apps and they will communicate over HTTP using standard browser requests and API calls via AJAX.

You can choose to organize and name your files however you see fit. Just keep in mind that this article will probably be easier to follow if you follow my setup.

My project looks like this:

```
fusionauth-example-react
├─client
├─server
└─config.js
```

- `client` is the directory for the React client
- `server` is the directory for the Express server
- `config.js` is where we'll store constants needed by both `client` and `server`

#### React

A popular way to create a new React app is the creatively named `create-react-app`. This basically handles everything for you and drops in plenty of boilerplate. If you use this tool, run it from the `fusionauth-example-react` root folder, because it creates its own directory.

```zsh
npx create-react-app client
```

If you don't want the bloat, or if you're just stubborn and like to do everything yourself, I recommend the awesome [_Create React Project without create-react-app_](https://dev.to/vish448/create-react-project-without-create-react-app-3goh) by dev.to user Vishang.

#### Express

Our server will use Express. If you haven't used it before, it's a super common Node framework that makes our lives a lot easier. I think a lot of devs who say they work in Node actually mean they work in Express.

Install it like this:

```zsh
cd server
npm init -y
npm install cors express express-session request
```

Wait, what are those other things you just installed?

- `cors` lets us make cross-origin requests without annoying errors telling us we're not allowed to
- `express-session` helps us save data in a server-side session
- `request` makes formatting HTTP requests totally painless (and neatly organized)

It's hard-mode without these packages, but you do you.

### Config

---

**BRIAN EDITED TO HERE**

---

Finally, we need some constants across both Node apps:

```js
module.exports = {

  // OAuth information plus some FusionAuth info that is needed (copied from the FusionAuth admin panel)
  clientID: '5f651593-cc27-4f81-a6f8-7a9a68300cf6',
  clientSecret: 'EEOFEsMk2rRjBvEpkCecT5I7ICMGctpLBIiSo5uSzoQ',
  redirectURI: 'http://localhost:9000/oauth-callback',
  applicationID: '5f651593-cc27-4f81-a6f8-7a9a68300cf6',
  apiKey: 'bf69486b-4733-4470-a592-f1bfce7af580',

  // ports
  clientPort: 8080,
  serverPort: 9000,
  fusionAuthPort: 9011
};
```
{: .legend}
`File: config.js`

Saving things this way saves us from a lot of `CMD-F` pain when changing things, especially if we're re-using this example as the base of a new single-page app.

The OAuth and FusionAuth configuration above will not match your application. I copied it out of my FusionAuth admin panel. This is the only code in the whole article you can't just copy/paste, seriously. The best place to find your values is this `View` button in the Applications page:

{% include _image.html src="/assets/img/blogs/fusionauth-example-react/admin-view-application.png" class="img-fluid" figure=false %}

(Also, if you do want to copy/paste everything, just [clone the GitHub repo](https://github.com/FusionAuth/fusionauth-example-react) with everything already in it. You'll still have to change this config file, though. No way around that).

Alright, we're ready to start coding! You can keep FusionAuth and React running, but you'll need to restart Node/Express every time you make a change.

---

## 1. Working Between React and Express

User sign-in is one of the key features of FusionAuth. (Isn't that why you're following this example?) Let's see how it works.

### Changing Content for the Logged-In User

We'll start with a pretty standard React app:

```
client
└─app
  └─index.js*
```

```jsx
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
{: .legend}
`File: client/index.js`

If you need a refresher on React basics, check out the [official docs](https://reactjs.org/docs/getting-started.html).

Load up `localhost:8080` to make sure React is working as expected.

Now, we're going to want to show different stuff based on whether or not a user is logged in. For example, a greeting that says `Welcome, dinesh@fusionauth.io` is only going to make sense if the user `dinesh@fusionauth.io` is logged in.

In a bit, we're going to get information about the current user (like their email address) by sending a request to our Express server. For now, we'll just pretend a user is logged in and set the user's email address in `state`.

```
client
└─app
  ├─components
  │ └─Greeting.js*
  └─index.js
```

```jsx
...

import Greeting from './components/Greeting.js';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      email: 'dinesh@fusionauth.io'
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

...
```
{: .legend}
`File: client/index.js`

The logic in `<Greeting>` doesn't need to be complicated: Is there an email address? Then there's a user logged in. Otherwise, there's not.

```jsx
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
{: .legend}
`File: client/components/greeting.js`

Try it out. Load up `localhost:8080` and you should see `Welcome, dinesh@fusionauth.io` (or whatever email address you typed in `state`). Comment out the `email` object to simulate logging out:

```jsx
this.state = {
  // email: 'dinesh@fusionauth.io'
};
```
{: .legend}
`File: client/index.js`

Next, we'll set `state` based on a call to our server.

### Getting User Info From the Express Server

To make a call to a server, we first need to get one up and running.

The heart of an Express app is your `index.js`. That's what we title the heart of most apps. The React side of our application wll also have an `index.js` file, so keep that in mind as you will likely have the same headache I do of constantly opening the wrong one.

```
server
└─index.js*
```

The following Express index is pretty standard, so I'm not going to go too deep on how it works; the [official Express docs](https://expressjs.com/en/starter/hello-world.html) do a better job of explaining it than I would, anyway.

We'll initialize `app`, set up a `/user` route (for our React client to get user info from), and start the server on `localhost:9000`:

```js
const express = require('express');
const config = require('../config');

// configure Express app
const app = express();

// use routes
app.use('/user', require('./routes/user'));

// start server
app.listen(config.serverPort, () => console.log(`FusionAuth example app listening on port ${config.serverPort}.`));
```
{: .legend}
`File: server/index.js`

When our React client sends a request to `localhost:9000/user`, it will get a response based on whatever we send back in `server/routes/user.js`. So, we can move the pretend user email from `state` to here, like this:

```js
const express = require('express');
const router = express.Router();
const config = require('../../config');

router.get('/', (req, res) => {
  res.send({
    token: {
      email: 'dinesh@fusionauth.io'
    }
  });
});

module.exports = router;
```
{: .legend}
`File: server/routes/user.js`

Note that I've wrapped `email` in a `token` object. That's because an Access Token is ultimately what we'll get back from FusionAuth when a user actually logs in. `email` is one of the token's included values, so we'll be good to go if we set it up like this ahead of time.

Of course, we'll need to tweak the React app:

```jsx
...

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

...
```
{: .legend}
`File: client/index.js`

```jsx
...

let message = (this.props.body.token)
  ? `Hi, ${this.props.body.token.email}!`
  : "You're not logged in.";

...
```
{: .legend}
`File: client/components/greeting.js`

Note that we're now using the existence of `token` to determine whether or not a user is logged in. We can use this for every future component: send `body`, check for `token`, use the values inside `token`.

Remember, a _real_ Access Token sent from FusionAuth will have more than just an email address. It will look something like this:

```json
"token": {
  "active": true,
  "applicationId": "5f651593-cc27-4f81-a6f8-7a9a68300cf6",
  "aud": "5f651593-cc27-4f81-a6f8-7a9a68300cf6",
  "authenticationType": "PASSWORD",
  "email": "dinesh@fusionauth.io",
  "email_verified": true,
  "exp": 1583357477,
  "iat": 1583353877,
  "iss": "acme.com",
  "roles": [],
  "sub": "00000000-0000-0000-0000-000000000004"
}
```

In the next section, we'll replace our fake `token` with a real one. Before we do that, let's set up our React app to `fetch` the `token` from `/user` whenever the page loads (or "when the component mounts" in React lingo):


```js
...

componentDidMount() {

  // make the request to /user
  fetch(`http://localhost:${config.serverPort}/user`)

    // convert the response to usable JSON
    .then(response => response.json())

    // update this.state.body
    .then(response => this.setState({
      body: response
    }));
}

...
```
{: .legend}
`File: client/app/index.js`

Try the React client again. Depending on your setup, you might have gotten a CORS error; check the browser console. If you want to know why this happens, check out the helpful MDN doc on [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors). Fortunately, we thought of this, and installed the `cors` package. Activate its power like this:

```js
const express = require('express');
const cors = require('cors');
const config = require('../config');

// configure Express app
const app = express();
app.use(cors({
  origin: true,
  credentials: true
}));

...
```
{: .legend}
`File: server/index.js`

Boom. Goodbye, annoying CORS error.

The React page should look just like when you were "logged in" after writing an email address in `state`. However, we're now getting that email from our Express server. You can simulate logging out by commenting out the `token`:

```js
res.send({
  // token: {
  //   email: 'dinesh@fusionauth.io'
  // }
});
```
{: .legend}
`File: server/routes/user.js`

Next, we'll replace that fake `token` with a real one from FusionAuth—our React client will indirectly retrieve the information from FusionAuth by using Express as a middleman.

---

## 2. Logging In

User sign-in is one of the key features of FusionAuth. (Isn't that why you're following this example?) Let's see how it works.

### Redirecting to FusionAuth

First thing's fist: we need a "log in" button in the React client:

```
client
└─app
  ├─components
  │ ├─Greeting.js
  │ └─LogInOut.js*
  └─index.js
```

Just like we did in `Greeting`, we'll use `this.props.body.token` to determine whether or not the user is logged in. We can use this to make a link to either `localhost:9000/login` or `localhost:9000/logout`, the former of which we'll set up in just a second.

```jsx
import React from 'react';

export default class LogInOut extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {

    let message = (this.props.body.token)
      ? 'sign out'
      : 'sign in';

    let path = (this.props.body.token)
      ? '/logout'
      : '/login';

    return (
      <a href={this.props.uri + path}>{message}</a>
    );
  }
}
```
{: .legend}
`File: client/app/components/LogInOut.js`

Why is this a normal `<a>` link when we used a `fetch` request for `/user`? Because this is the single time our users will actually be redirected away from the React client—they need to get to the FusionAuth login page.

We could write a link directly to FusionAuth, but I think it's cleaner to go through the Express app. Remember the structure we detailed earlier:

```React <-> Express <-> FusionAuth```

```
server
├─routes
│ ├─login.js*
│ └─user.js
└─index.js
```

Whenever we add a new route, we need to let `server/index.js` know, just like we did with `/user`:

```js
...

// use routes
app.use('/user', require('./routes/user'));
app.use('/login', require('./routes/login'));

...
```
{: .legend}
`File: server/index.js`

When a user goes to `/login`, we actually want to redirect them off of the Express sever and onto FusionAuth's login page. Remember, we installed FusionAuth so that we don't have to handle the login process at all!

```js
const express = require('express');
const router = express.Router();
const config = require('../../config');

router.get('/', (req, res) => {
  res.redirect(`http://localhost:${config.fusionAuthPort}/oauth2/authorize?client_id=${config.clientID}&redirect_uri=${config.redirectURI}&response_type=code`);
});

module.exports = router;
```
{: .legend}
`File: server/routes/login.js`

If that URI looks a bit messy, it's because of the attached query parameters, which FusionAuth needs to process our request:

- `client_id` tells FusionAuth which app is making the request
- `redirct_uri` tells FusionAuth where to redirect the user to after login
- `response_type` tells FusionAuth which OAuth flow we're using (Authorization Code in this example)

This is all standard OAuth flow.

Try navigating to `localhost:9000/login`. You should see a FusionAuth login form:

{% include _image.html src="/assets/img/blogs/fusionauth-example-react/app-login.png" class="img-fluid" figure=false %}

When you successfully authenticate, you'll just see `Cannot GET /oauth-callback`, because `/oauth-callback` doesn't exist, yet. What's `/oauth-callback`? Remember, we added that as an `Authorized redirect URL` in the FusionAuth admin panel and as our `redirectURI` in `config.js`; it's where FusionAuth redirects to after authentication.

### Code Exchange

Alright, time to add the `/oauth-callback` route:

```
server
├─routes
│ ├─login.js
│ ├─oauth-callback.js*
│ └─user.js
└─index.js
```

```js
...


// use routes
app.use('/user', require('./routes/user'));
app.use('/login', require('./routes/login'));
app.use('/oauth-callback', require('./routes/oauth-callback'));

...
```
{: .legend}
`File: server/index.js`


`/oauth-callback` will receive an Authorization Code from FusionAuth. Follow that `/login` link—you can see the `code` in the URL:

```
http://localhost:9000/oauth-callback?code=14CJG_fDl31E5U-1VHOBedsLESZQr3sgt63BcVrGoTU&locale=en_US&userState=Authenticated
```

An Authorization Code isn't enough to access the user's resources, though. For that, we need an Access Token. Again, this is standard OAuth, not something unique to FusionAuth. This step is called the Code Exchange, because we send the `code` to FusionAuth's `/token` endpoint and receive an `access_token` in exchange.

This is the basic skeleton of a request:

```js
const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('../../config');

router.get('/', (req, res) => {

  request(

    // POST request to /token endpoint
    {
      // use POST method
      // target /token
      // set request header
      // add parameters
    },

    // callback
    (error, response, body) => {
      // save token to session
      // redirect to root
    }
  );
});

module.exports = router;
```
{: .legend}
`File: server/routes/oauth-callback.js`

The POST request for the Code Exchange looks like this:

```js
...

// POST request to /token endpoint
{
  method: 'POST',
  uri: `http://localhost:${config.fusionAuthPort}/oauth2/token`,
  headers: {
    'Content-Type': 'application/json'
  },
  qs: {
    'client_id': config.clientID,
    'client_secret': config.clientSecret,
    'code': req.query.code,
    'grant_type': 'authorization_code',
    'redirect_uri': config.redirectURI
  }
},

...
```
{: .legend}
`File: server/routes/oauth-callback.js`

The most important parts of the request are the `uri` (which is where the request will get sent to) and the `qs` (which is the set of parameters FusionAuth expects). You can check the FA docs to see what every endpoint expects to be sent, but here's the gist of this batch:

- `client_id` and `client_secret` identify and authenticate our app, like a username and password
- `code` is the Authorization Code we got from FusionAuth
- `grant_type` tells FusionAuth we're using the Authorization Code Flow
- `redirect_uri` in this case is the URL we're making the request from (`http://localhost:9000/oauth-redirect`)

The callback occurs after FusionAuth gets our request and responds. We're expecting to receive an `access_token`, which will come through in that `body` argument. We'll save the `access_token` to session storage and redirect back to the React client.

```js
...

// callback
(error, response, body) => {

  // save token to session
  req.session.token = JSON.parse(body).access_token;

  // redirect to root
  res.redirect(`localhost:${config.clientPort}`);
}

...
```
{: .legend}
`File: server/routes/user.js`

We're almost done! The only thing holding us back is that session storage isn't actually set up yet—we need to configure `express-session`. The following settings work great for local testing, but you'll probably want to check the [`express-session` docs](https://www.npmjs.com/package/express-session) before moving to production.

```js
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const config = require('../config');

// configure Express app
const app = express();
app.use(session({
  secret: '1234567890',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: 'auto',
    httpOnly: true,
    maxAge: 3600000
  }
}));

...
```
{: .legend}
`File: server/index.js`

### Introspect and Registration

Remember that our React app looks for a `token` in `/user`. The Access Token isn't human-readable, but we can pass it through FusionAuth's `/introspect` to get JSON data out of it. We can get even more user-specific info from `/registration`.

If there's a `token` in session storage, we'll call `/introspect` to get info out of that `token`. Part of its info is the boolean `active`, which is `true` until the Access Token expires. (You can configure how long Access Tokens live in the FusionAuth admin panel.) If it's still good, we'll call `/registration` and return the bodies from both requests.

If there's no `token` in session storage, or if the `token` is expired, we'll return an empty object. Remember that our React components use the existence of `this.props.body.token` to determine whether a user is logged in, so an empty `body` means there's no active user.

Here's the skeleton of our new-and-improved `/user`:

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
      {},

      // callback
      (error, response, body) => {

        // valid token -> get more user data and send it back to the react app
        if (/* token is active */) {

          request(

            // GET request to /registration endpoint
            {},
      
            // callback
            (error, response, body) => {
              // send bodies from both requests
            }
          );
        }

        // expired token -> send nothing 
        else {
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
{: .legend}
`File: server/routes/user.js`

`/introspect` requires our Client ID and, of course, the Access Token we want to decode:

```js
...

// POST request to /introspect endpoint
{
  method: 'POST',
  uri: `http://localhost:${config.fusionAuthPort}/oauth2/introspect`,
  headers: {
    'Content-Type': 'application/json'
  },
  qs: {
    'client_id': config.clientID,
    'token': req.session.token
  }
},

...
```
{: .legend}
`File: server/routes/user.js`

In the callback from the `/introspect` request, we'll parse the body into usable JSON and check that `active` value. If it's good, we'll go ahead and make the `/registration` request, which requires a User ID (`sub` in OAuth jargon) and our Application ID—we need both, because one user can have different data in each FusionAuth application.

Note that this step doesn't actually require an Access Token—the data from `/registration` can be accessed for a logged-out user. You could use this endpoint to show info on a user's profile or other public page. For that reason, you shouldn't use registration to store a user's protected resources.

```js
...

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
        headers: {
          'Authorization': config.apiKey
        }
      },

      // callback
      (error, response, body) => {}
    );
  }

  // expired token -> send nothing 
  else {
    res.send({});
  }
}

...
```
{: .legend}
`File: server/routes/user.js`

Finally, in the second callback, we'll parse the body returned from `/registration` and send everything back to the React client.

```js
...

// callback
(error, response, body) => {

  let registrationResponse = JSON.parse(body);

  res.send({
    token: {
      ...introspectResponse,
    },
    ...registrationResponse
  });
}

...
```
{: .legend}
`File: server/routes/user.js`

Now, go through the login process, and you should see "Welcome, [your email address]!".

So, that's login sorted. The next thing you'll probably want to tackle is logout.

---

## 3. Logging Out

Just like `/login`, we'll create a `/logout` route to make logging out easily accessible anywhere in our React client:

```
server
├─routes
│ ├─login.js
│ ├─logout.js*
│ ├─oauth-callback.js
│ └─user.js
└─index.js
```

```js
...

// use routes
app.use('/user', require('./routes/user'));
app.use('/login', require('./routes/login'));
app.use('/oauth-callback', require('./routes/oauth-callback'));
app.use('/logout', require('./routes/logout'));

...
```
{: .legend}
`File: server/index.js`

Our `/logout` route will wipe the user's saved login by deleting:

- FusionAuth's session for that user
- our Express server's session (and the `token` we store there)
- a browser cookie that remember the user

The first of these is done by making a request to FusionAuth's `/logout` endpoint. The others are done locally with `res.clearCookie` and `req.session.destroy`.

After cleaning up, we'll redirect to the React app, and everything will be completely reset.

```js
const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('../../config');

router.get('/', (req, res) => {

  request(

    // GET request to /logout endpoint
    {
      method: 'GET',
      uri: `http://localhost:${config.fusionAuthPort}/oauth2/logout`,
      qs: `client_id=${config.clientID}`
    },

    // callback
    (error, response, body) => {

      // clear cookie and session (otherwise, FusionAuth will remember the user)
      res.clearCookie('JSESSIONID');
      req.session.destroy();

      // redirect to root
      res.redirect(`localhost:${config.clientPort}`);;
    }
  );
});

module.exports = router;
```
{: .legend}
`File: server/routes/logout.js`

Try it out. You can watch cookies in your browser's developer tools to see it working.

Next, we'll show how you can modify a user's registration data from your app (the same data we grab from `/registration`).

---

## 4. Changing User Info

We can modify everything about a user's registration (such as their username and assigned roles) by making requests the same `/registration` endpoint from `/user`. The only difference is that we'll use `PUT` or `PATCH` to _send_ information instead of _receive_ information.

### Setting User Data from Express

The last route we'll make for this example is `/set-user-data`:

```
server
├─routes
│ ├─login.js
│ ├─logout.js
│ ├─oauth-callback.js
│ ├─set-user-data.js*
│ └─user.js
└─index.js
```

```js
...

// use routes
app.use('/user', require('./routes/user'));
app.use('/login', require('./routes/login'));
app.use('/oauth-callback', require('./routes/oauth-callback'));
app.use('/logout', require('./routes/logout'));
app.use('/set-user-data', require('./routes/set-user-data'));

...
```
{: .legend}
`File: server/index.js`

In this route, we'll send the `registration` JSON object back to FusionAuth. If we use `PATCH` instead of `PUT`, we can send only the parts we want to update, instead of the entire `registration` object.

```js
const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('../../config');

router.get('/', (req, res) => {

  request(

    // PATCH request to /registration endpoint
    {
      method: 'PATCH',
      uri: `http://localhost:${config.fusionAuthPort}/api/user/registration/${req.query.userID}/${config.applicationID}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': config.apiKey
      },
      body: JSON.stringify({
        'registration': {
          'data': {
            'userData': req.query.userData
          }
        }
      })
    }
  );
});

module.exports = router;
```
{: .legend}
`File: server/routes/set-user-data.js`

Here, we update `registration.data`, which is an empty object FusionAuth provides for storing arbitrary data related to a user.

Note that we use `req.query` to assign the User ID and the value of `registration.data.userData`. This allows us to easily send information from our React client by including it as a query parameter in the URI.

### Setting User Data from React

We'll add a `<textarea>` to the React client for editing `registration.data.userData`. This component will need a method that allows it to `setState` within `App`, because that's where `body` (and therefore `registration`) is stored in our React client. This means we'll need add the method to `App` and bind it before passing it down as a prop to the `<textarea>` component.

```jsx
...

constructor(props) {
  
  ...

  this.handleTextInput = this.handleTextInput.bind(this);
}

handleTextInput(event) {
  // update this.state.body.registration.data.userData
  // save the change in FusionAuth
}

render() {
  return (
    <div id='App'>
      <header>
        <Greeting body={this.state.body}/>
        <LogInOut body={this.state.body} uri={`http://localhost:${config.serverPort}`}/>
      </header>
      <main>
        <UserData body={this.state.body} handleTextInput={this.handleTextInput}/>
      </main>
    </div>
  );
}

...
```
{: .legend}
`File: client/app/index.js`

The method itself is pretty simple; `event.target.value` will be the contents of the `<textarea>`, so we just apply that value to `registration.data` and use `setState` to update the value in React. We also have to update it on the FusionAuth side, so we can retrieve it with `/user`; that's what `/set-user-data` is for.

```js
...

handleTextInput(event) {

  // update this.state.body.registration.data.userData
  let body = this.state.body;
  body.registration.data = { userData: event.target.value };
  this.setState({
    body: body
  });

  // save the change in FusionAuth
  fetch(`http://localhost:${config.serverPort}/set-user-data?userData=${event.target.value}&userID=${this.state.body.token.sub}`);
}

...
```
{: .legend}
`File: client/app/index.js`

The last thing to do is add the `UserData` component, which will be a `<textarea>`. We can lock it using the `readonly` attribute when there's no user logged in, and we can apply our `handleTextInput` method to the `onChange` event.

```
client
└─app
  ├─components
  │ ├─Greeting.js
  │ ├─LogInOut.js
  │ └─UserData.js*
  └─index.js
```

```jsx
import React from 'react';

export default class LogInOut extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {

    // placeholder text for the textarea
    let placeholder = 'Anything you type in here will be saved to your FusionAuth user data.';

    // textarea (locked if user not logged in)
    let input = (this.props.body.token)
      ? <textarea placeholder={placeholder} onChange={this.props.handleTextInput}></textarea>
      : <textarea placeholder={placeholder} readOnly></textarea>;

    // JSX return
    return (
      <div id='UserData'>
        {input}
      </div>
    );
  }
}
```
{: .legend}
`File: client/app/components/UserData.js`

`userData` can be inspected in the FusionAuth admin panel:

{% include _image.html src="/assets/img/blogs/fusionauth-example-react/admin-user-data.png" class="img-fluid" figure=false %}

However, it's a good idea to set the `<textarea>`'s `defaultValue` to the `userData`. This has two advantages: first, it allows us to inspect `userData` and confirm that it's maintained; second, it allows the user to edit the `userData`, rather than overwrite it each time.

```js
...

// the user's data.userData (or an empty string if uninitialized)
let userData = (this.props.body.registration && this.props.body.registration.data)
  ? this.props.body.registration.data.userData
  : '';

// textarea (locked if user not logged in)
let input = (this.props.body.token)
  ? <textarea placeholder={placeholder} onChange={this.props.handleTextInput} defaultValue={userData}></textarea>
  : <textarea placeholder={placeholder} readOnly></textarea>;

...
```
{: .legend}
`File: client/app/components/UserData.js`

Type in whatever you want and watch the value change. You can log in and out as much as you want, and FusionAuth will maintain the user's data.

---

## 5. What Next?

So your React app can log in, log out, and modify user data—what next?

You'll probably want to let users [register from the app itself](https://fusionauth.io/docs/v1/tech/apis/registrations#create-a-user-and-registration-combined), instead of manually adding them via the admin panel.  
Maybe you want to [change how the FusionAuth login form looks](https://fusionauth.io/docs/v1/tech/apis/themes).  
For extra security, you can [enable and send two-factor codes](https://fusionauth.io/docs/v1/tech/apis/two-factor).  
You can even let users log in via a third-party, like [Facebook](https://fusionauth.io/docs/v1/tech/apis/identity-providers/facebook) or [Google](https://fusionauth.io/docs/v1/tech/apis/identity-providers/google).

In all of these cases, remember what you learned from this example:

1. create a new route in Express
1. make a request to the relevant FusionAuth endpoint (including any parameters listed in the docs) and send data to React with `res.send`
1. use `fetch` to call your Express routes from React, and save the response using `setState`

Check out the [FusionAuth APIs](https://fusionauth.io/docs/v1/tech/apis/) for even more options.
