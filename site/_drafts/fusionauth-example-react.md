---
layout: advice
title: How to Implement FusionAuth in React
description: FusionAuth makes it easy to add login and user data to your React app.
header_dark: true
image: TODO
category: example
author: Matt Boisseau
date: 2020-03-03
dateModified: 2020-03-03
---

## What We'll Make

In this article, we'll walk step-by-step through implementing FusionAuth in a React app.

Our app will be able to:

- log users in
- log users out
- read user data from FusionAuth
- write user data to FusionAuth

In addition to React, we'll use a NodeJS backend. One major benefit of using a backend server is that we can safely store and use a Client Secret, which is the most secure way to integrate OAuth 2.0 Authorization Code Flow with our React app.

If you're in-the-know on OAuth stuff, you're probably aware that some people use PKCE (or the rightfully deprecated Implicit Flow) to get around the Client Secret constraint. We're sticking to Authorization Code Flow, because setting up a server is really the most secure solution for most cases and quite simple once you know how. Don't know what any of that means? Don't worry about it — you don't need to know anything about OAuth to follow this example. What do you need to know? Well, this example app will be much easier to follow if you have at least some knowledge of:

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
(mostly UI)    (our code)     (pre-made auth)
```

Literally, it might look something like this:

{% include _image.html src="/assets/img/advice/fusionauth-example-react/app-finished.png" class="img-fluid" figure=false %}

(Although, you're on your own for CSS.)

If you want to peek at the source code for the exact app pictured above, you can grab it from [its GitHub respository](https://github.com/FusionAuth/fusionauth-example-react). You can follow along with that code or use it as a jumping-off point for your app.

## Contents

Want to skip ahead or pick up where you left off?

1. [Connecting React and Express](#1-connecting-react-and-express)
  - [Redirecting](#redirecting)
  - [Fetching User Info From Express](#fetching-user-info-from-express)
1. [Logging In](#2-logging-in)
  - [Redirecting to FusionAuth](#redirecting-to-fusionauth)
  - [Code Exchange](#code-exchange)
  - [Introspect and Registration](#introspect-and-registration)
1. [Logging Out](#3-logging-out)
1. [Changing User Info](#4-changing-user-info)
1. [What Next?](#5-what-next)

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

{% include _image.html src="/assets/img/advice/fusionauth-example-react/admin-edit-application.png" class="img-fluid" figure=false alt="FusionAuth application edit page" %}

A login feature isn't very useful with zero users. It's possible to register users from your app, but we'll manually add a user for this example. Select `Users` from the menu. You should see your own account; it's already registered to FusionAuth, which is why you can use it to log into the admin panel.

{% include _image.html src="/assets/img/advice/fusionauth-example-react/admin-manage-user.png" class="img-fluid" figure=false %}

Select `Manage` and go to the `Registrations` tab. Click on `Add Registration`, pick your new application, and then `Save` to register yourself.

FusionAuth configuration: DONE. Leave this tab open, though; we'll be copy/pasting some key values out of it in a minute.

### Directory Structure

The last step before digging into some JavaScript is creating the skeleton of our Express server and React client. These will be completely separate Node apps; they only communicate via HTTP requests.

You can choose to organize and name your files however you see fit; just keep in mind that this article will probably be easier to follow if you just do what I do.

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

Our server will use Express. If you haven't used it before, it's a Node framework that makes our lives a lot easier. I think a lot of devs who say they work in Node actually mean they work in Express.

Install it like this:

```zsh
cd server
npm init -y
npm install cors express express-session request
```

Wait, what are those other things you just installed?

- `cors` lets us make cross-origin requests without annoying errors telling us we're not allowed
- `express-session` helps us save data to session storage
- `request` makes formatting HTTP requests totally painless (and neatly organized)

It's hard mode without these packages, but you do you.

### Config

Finally, we need some constants across both Node apps. Most of these are just copied from the FusionAuth admin panel. Saving things this way saves us from a lot of `CMD-F` pain when changing things, especially if we're re-using this example as the base of a new FusionAuth app.

```js
module.exports = {

  // FusionAuth info (copied from the FusionAuth admin panel)
  clientID: '5603c20d-3e32-4971-b7eb-8e9f023fc524',
  clientSecret: 'viCMOPW73hlUVyE4ja_sOdL5rGEU4GuVFY_yuy8rJ7A',
  redirectURI: 'http://localhost:9000/oauth-redirect',
  applicationID: '5603c20d-3e32-4971-b7eb-8e9f023fc524',
  apiKey: 'gojIS0unvaFpHKXzCIjz95DtbSmLZFBS4cQYT8Our7g',

  // ports
  clientPort: 8080,
  serverPort: 9000,
  fusionAuthPort: 9011
};
```

The FusionAuth info above will not match your application. I copied it out of my own FusionAuth admin panel. Seriously, this is the only code in the whole article you can't just copy/paste. (Also, if you're doing that, just [clone the GitHub repo](https://github.com/FusionAuth/fusionauth-example-react) with everything already in it. You'll still have to change this config file, though. No way around that.)

Alright, we're ready to start coding! Keep FusionAuth and React running. You'll need to restart Express every time you make a change.

---

## 1. Connecting React and Express

First, we'll show how to exchange info between React and Express.

### Redirecting

The heart of an Express app is your `index.js`. That's what we title the heart of most apps, including React, so keep that in mind as you join me in constantly opening the wrong one.

```
server
└─index.js*
```

The following Express index is pretty standard, so I'm not going to go too deep on how it works; the [official Express docs](https://expressjs.com/en/starter/hello-world.html) do a better job of explaining it than I would, anyway.

We'll initialize `app`, set up a `/` route (the root route), and start the server on `localhost:9000`:

```js
const express = require('express');
const config = require('../config');

// configure Express app
const app = express();

// use routes
app.use(`/`, require(`./routes/_`));

// start server
app.listen(config.serverPort, () => console.log(`FusionAuth example app listening on port ${config.serverPort}.`));
```
{: .legend}
`File: server/index.js`

When a user goes to (or is redirected to) the `/` route, the code in `_.js` will execute. (I wish we could name the file `.js`, but that's just not an option, because `require` doesn't include the filetype, which turns poor, elegant `.js` into an empty string.) This root path is great for serving the single page of a single page application. Because React is running on its own separate Node instance, we'll just use `/` to redirect to `localhost:8080/`.

```
server
├─routes
│ └─_.js*
└─index.js
```

```js
const express = require('express');
const router = express.Router();
const config = require('../../config');

router.get('/', (req, res) => {
  res.redirect(`http://localhost:${config.clientPort}`);
});

module.exports = router;
```
{: .legend}
`File: server/routes/_.js`


Try it out—navigate to [localhost:9000](http://localhost:9000). You should land on [localhost:8080](http://localhost:8080). Now, from anywhere else in our Express server, we can easily serve the React client with `res.redirect('/')`.

### Adding New Routes

Next, we'll set up the `/user` route to return info about the currently logged in user.

```
server
├─routes
│ ├─_.js
│ └─user.js*
└─index.js
```

Whenever we create a new route, we need to add it to the route map:

```js
...

// use routes
app.use(`/`, require(`./routes/_`));
app.use(`/user`, require(`./routes/user`));

...
```
{: .legend}
`File: server/index.js`

But doing that every time sucks. [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) and all that. Notice that these follow a simple pattern—we can make adding new routes a lot easier with `Array.forEach`:

```js
...

// use routes
let routes = [
  '_',
  'user'
];
routes.forEach(route => app.use(`/${route.replace(/^_$/, '')}`, require(`./routes/${route}`)));

...
```
{: .legend}
`File: server/index.js`

Note that we replace `'_'` with `''` to cover the only case in which the route path won't match the file path. (`_.js` strikes again.)

### Fetching User Info From Express

Our React client will make a request to `/user` to get information about the user. The most important info is the Access Token, which is what we use to determine if a user is logged in or not. In OAuth terms, an Access Token is like a temporary keycard that we can use to access the user's resources.

A real token will look something like this:

```json
"token": {
  "active": true,
  "applicationId": "5603c20d-3e32-4971-b7eb-8e9f023fc524",
  "aud": "5603c20d-3e32-4971-b7eb-8e9f023fc524",
  "authenticationType": "PASSWORD",
  "email": "matt@fusionauth.io",
  "email_verified": true,
  "exp": 1583266119,
  "iat": 1583266109,
  "iss": "acme.com",
  "roles": [],
  "sub": "22c78afe-c412-4061-bfb5-9bb5fa43b596"
}
```

Well, actually, it looks like this until we decode it:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

Fortunately, FusionAuth can decode it for us. More on that later. For now, we'll just send some fake info to stand in for an Access Token. A decoded token will include info about the user, like their email address. We're going to display the user's email address, anyway (like "Welcome, matt@fusionauth.io!"), so that's what we'll throw in:

```js
const express = require('express');
const router = express.Router();
const config = require('../../config');

router.get('/', (req, res) => {
  res.send({
    token: {
      email: 'test@test.com'
    }
  });
});

module.exports = router;
```
{: .legend}
`File: server/routes/user.js`

Try navigating to [localhost:9000/user](http://localhost:9000/user). You'll see the `token` printed out in the browser. We want to use it in our React client, so we'll make a request to `/user` from React.

A good way to keep things organized in your React client is to save everything returned by FusionAuth in one state parameter. Here, I've named it `body`, because an HTTP request returns a body, and we're making an HTTP request to get this info.

The simple logic goes like this: if `this.state.token` exists, there's a user logged in; otherwise, there isn't a user logged in.

So, we'll set `body` to an empty object, and pass it to any component that needs it.

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import Greeting from './components/Greeting.js';

const config = require('../../config');

class App extends React.Component {

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
          <Greeting body={this.props.body}/>
        </header>
      </div>
    );
  }
}

ReactDOM.render(<App/>, document.querySelector('#Container'));
```
{: .legend}
`File: client/app/index.js`


If you want to see the entire `body`, like when we navigated directly to `/user`, throw this in your JSX:

```js
<pre>{JSON.stringify(this.state.body, null, '\t')}</pre>
```

This will be useful for understanding the data FusionAuth returns, but it's not really something you'd want to show users.

In the `Greeting` component, we can use the existence of `this.props.body.token` to display either a welcome message or a prompt to log in.

```
client
└─app
  ├─components
  │ └─Greeting.js*
  ├─index.css
  ├─index.html
  └─index.js
```

```jsx
import React from 'react';

export default class Greeting extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {

    let message = (this.props.body.token)
      ? `Hi, ${this.props.body.token.email}!`
      : "You're not logged in.";

    return (
      <span>{message}</span>
    );
  }
}
```
{: .legend}
`File: client/components/Greeting.js`

Load up the React client. It should say `You're not logged in.`, because there's no `token` in `this.state.body`. We'll get the `token` from `/user` in a `fetch` request:


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


Try the React client again. Depending on your setup, you might have gotten a CORS error; check the browser console. Fortunately, this is an easy fix:

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

Now, the `Greeting` should read `Welcome, test@test.com!`, because there is a `token` in `this.state.body`.

Next, we'll replace that fake `token` with a real one from FusionAuth.

---

## 2. Logging In

User sign-in is one of the key features of FusionAuth. Let's see how it works.

### Redirecting to FusionAuth

We'll write our request to FusionAuth in `/login`, so that we only have to redirect to http://localhost:9000/login any time we want to have a user sign in.

```
server
├─routes
│ ├─_.js
│ ├─login.js*
│ └─user.js
└─index.js
```

Remember to add every new route to the route map:

```js
...

// use routes
let routes = [
  '_',
  'login',
  'user'
];

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

Try navigating to http://localhost:9000/login. You should see a FusionAuth login form. When you successfully authenticate, you'll just see `Cannot GET /oauth-callback`, because `/oauth-callback` doesn't exist, yet. Before we add that route, let's add a link to `/login` in the React client:

```
client
└─app
  ├─components
  │ ├─Greeting.js
  │ └─LogInOut.js*
  ├─index.css
  ├─index.html
  └─index.js
```

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

Note that the `/login` link won't be visible if a user is logged in. We can disable that fake token to "log out."

```js
...

res.send({
  // token: {
  //   email: 'test@test.com`
  // }
});

...
```
{: .legend}
`File: server/routes/user.js`

### Code Exchange

Because FusionAuth is redirecting to `/oauth-callback`, we need to add that route:

```
server
├─routes
│ ├─_.js
│ ├─login.js
│ ├─oauth-callback.js*
│ └─user.js
└─index.js
```

```js
...

// use routes
let routes = [
  '_',
  'login',
  'oauth-callback'
  'user'
];

...
```
{: .legend}
`File: server/index.js`


`/oauth-callback` will receive an Authorization Code from FusionAuth. Follow that `/login` link—you can see the `code` in the URL, something like:

```
http://localhost:9000/oauth-callback?code=14CJG_fDl31E5U-1VHOBedsLESZQr3sgt63BcVrGoTU&locale=en_US&userState=Authenticated
```

An Authorization Code isn't enough to access the user's resources; for that, we need an Access Token. We won't get into the reason for this two-step process in this article, but rest assured that it's absolutely necessary. To get the Access Token, we'll make an HTTP request to FusionAuth's `/token` endpoint.

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


The POST request looks like this:

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

The most important parts of the request are the `uri` (which is where the request will get sent to) and the `qs` (which is the set of parameters FusionAuth expects; you can check the FA docs to see what every endpoint expects).

The callback occurs after FusionAuth gets our request and replies. We're expecting to receive an `access_token` in that `body` argument. We'll save the `access_token` to session storage and redirect back to the React client.

```js
...

// callback
(error, response, body) => {

  // save token to session
  req.session.token = JSON.parse(body).access_token;

  // redirect to root
  res.redirect('/');
}

...
```
{: .legend}
`File: server/routes/user.js`

We're almost done! Session storage isn't set up yet—we need to configure `express-session`. The following settings work great for local testing, but you'll probably want to check the [`express-session` docs](https://www.npmjs.com/package/express-session) before moving to production.

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

If there's a `token` in session storage, we'll call `/introspect` to get info out of the `token`. Part of that info is the boolean `active`, which is `false` if the Access Token has expired. If it's still good, we'll call `/registration` and return the bodies from both requests.

If there's no `token` in session storage, or if the `token` is expired, we'll return an empty object. Remember that an empty `body` tell the React client that no user is logged in.

Here's the skeleton of `/user`:

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

`/introspect` requires our Client ID and the Access Token:

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

In the callback from the `/introspect` request, we'll parse the body into usable JSON and check that `active` value. If it's good, we'll make the `/registration` request, which requires a User ID (`sub` in OAuth jargon) and our Application ID.

Note that `/registration` doesn't actually require an Access Token—this specific data can be accessed for a logged-out user, because it is public information. It's up to the design of your app whether or not you want to check for an active Access Token before calling `/registration`.

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

So, that's login sorted. Next, we'll tackle logout.

---

## 3. Logging Out

Just like `/login`, we'll create a `/logout` route to make logging out easily accessible anywhere in our React client:

```
server
├─routes
│ ├─_.js
│ ├─login.js
│ ├─logout.js*
│ ├─oauth-callback.js
│ └─user.js
└─index.js
```

```js
...

// use routes
let routes = [
  '_',
  'login',
  'logout',
  'oauth-callback'
  'user'
];

...
```
{: .legend}
`File: server/index.js`

Our `/logout` route will wipe the user's saved login by deleting:

- FusionAuth's session for that user
- our Express server's session (and the `token`)
- a browser cookie that remember the user

The first of these is done by making a request to FusionAuth's `/logout` endpoint. The others are done locally with `res.clearCookie` and `req.session.destroy`.

After cleaning up, we'll redirect to `/`, and everything will be completely reset.

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
      res.redirect('/');
    }
  );
});

module.exports = router;
```
{: .legend}
`File: server/routes/logout.js`

Try it out. Note that session data will be wiped whenever you restart the Express server, but the other information will remain.

Next, we'll show how you can modify a user's registration data from your app.

---

## 4. Changing User Info

We can modify everything about a user's registration (such as their username and assigned roles) directly by making requests that same `/registration` endpoint. The only difference is that we'll use `PUT` or `PATCH` to send information instead of receive information.

### Setting User Data from Express

The last route we'll make for this example is `/set-user-data`:

```
server
├─routes
│ ├─_.js
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
let routes = [
  '_',
  'login',
  'logout',
  'oauth-callback',
  'set-user-data'
  'user'
];

...
```
{: .legend}
`File: server/index.js`

In this route, we'll send the `registration` JSON object back to FusionAuth (as opposed to getting `registration` from FusionAuth). If we use `PATCH` instead of `PUT`, we can send only the parts we want to update, instead of the entire `registration` object.

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

Note that we use `req.query` to assign the User ID and the value of `registration.data.userData`. This allows us to easily send information from our React client by including it in the URI.

### Setting User Data from React

We'll add a `<textarea>` to the React client for editing `registration.data.userData`. This component will need a method that allows it to `setState` within `App`, because that's where `body` (and therefore `registration`) is stored in our React client. This means we'll need add the method to `App` and bind it before passing it down as a prop to the `<textarea>` component.

`client/app/index.js`

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
  ├─index.css
  ├─index.html
  └─index.js
```

`client/app/components/UserData.js`

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

{% include _image.html src="/assets/img/advice/fusionauth-example-react/admin-user-data.png" class="img-fluid" figure=false %}

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
