---
layout: blog-post
title: "Outsourcing auth: how to get buy-in from your team"
description: Who are the players you'll need to work with to make an outsourced auth implementation successful?
image: blogs/team-buy-in-outsource-auth/outsourcing-auth-how-to-get-buy-in-from-your-team-header-image.png
author: Joe Stech
category: blog
excerpt_separator: "<!--more-->"
---

Single sign-on (SSO) allows lets your users access two or more applications with one single set of credentials. Properly implemented, it makes your users' lives easier, as they sign in once and don't have to sign in when they move between various applications.

<!--more-->

Google has created a great single sign-on experience. You sign into gmail.com and then visit calendar.google.com or drive.google.com to access your calendar or files. The various systems know who you are without you ever re-authenticating. If you sign out from one of these applications, you're signed out from every one.

FusionAuth has built-in single sign-on support; this tutorial will walk through setting it up for two applications. There'll be a Pied Piper application and a Hooli application. Each application will be fairly simple, with the only functionality being greeting the user. The actual implementation of useful functionality behind the protection of authentication is left as an exercise for the reader.

If you want to follow along, you can check out the code in the [SSO application GitHub repo](https://github.com/FusionAuth/fusionauth-example-node-sso).

## Prerequisites

You will need FusionAuth and Node installed. 

For FusionAuth installation instructions, please visit [the 5 minute setup guide](/docs/v1/tech/5-minute-setup-guide/).

To test if you have node installed, run:

```shell
node -v
```

and you should see a message like this:

```shell
v14.4.0
```

## Configure application domains 

Single sign-on applications typically live on different domains, or at least different paths. Let's create two different domains that both point to your local computer to simulate the real world in this tutorial. 

Edit your hosts file; on macOS, this file lives at `/etc/hosts`. Look for the line starting with `127.0.0.1`. This is the IP address of your computer, and we want to map additional names to that address.

Doing so will let you enter `piedpiper.local:3000` in your browser and retrieve a page running from a local node application.

Add this text to the line starting with `127.0.0.1`:

```
 hooli.local piedpiper.local
```

The line will look like this after you are done (assuming you haven't edited this file before):

```
127.0.0.1       localhost hooli.local piedpiper.local
```

After you are done with this tutorial, you can remove the `hooli.local` and `piedpiper.local` lines.

## Configure FusionAuth

You'll need to configure the applications in FusionAuth and also register the end user you'll use to test single sign-on.

This tutorial will create and configure the applications using the adminstrative user interface, rather than the API. It'll also use the default tenant. Though FusionAuth supports multiple tenants, for this tutorial you'll keep everything in one tenant.

Navigate to "Applications" and create two new applications; one named "Pied Piper" and one named "Hooli". For each of these, set the name appropriately. 

You'll also need to configure the "Authorized redirect URL" and the "Logout URL". Both of these fields are on the "OAuth tab".

The "Authorized redirect URL" field has to include all valide redirect URLs. The values here tell FusionAuth where it can send the user after they've signed in. This field can have many values, but for this tutorial it'll only have one. 

For the Pied Piper application, add `http://piedpiper.local:3000/oauth-redirect`. For the Hooli application, add `http://hooli.local:3001/oauth-redirect`.

The "Logout URL" is the URL to which the user is sent after they log out from this application. However, it serves another purpose when SSO is enabled. By default, this URL is requested by FusionAuth when a user is sent to the FusionAuth logout URL, `/oauth2/logout`. This allows a user to be automatically logged out of all applications in a tenant with one click of a logout link.

For the Pied Piper application, set the "Logout URL" to `http://piedpiper.local:3000/endsession`. For the Hooli application, set it to `http://hooli.local:3001/endsession`. 

You'll build out both those endpoints, `oauth-redirect` and `endsession` in code later on.

Here's what the Pied Piper application screen should look like when properly configured:

image TBD 

Click "Save" for each application.

Next you need to get the client id and the client secret for each application. Navigate to "Applications" and view each application you just created. Click the green magnifying glass and note the "Client Id" and "Client Secret" strings:

image TBD [Looking up the Client Id and Client Secret values.,width=1200,role=bottom-cropped]

The next setup step is making sure that you have a user who is registered for both the Pied Piper and Hooli applications. If you followed the 5 minute guide above, you'll have one user. You can register that user for both applications, or create a new user. In either case, you'll navigate to the "Users" tab and modify the user in the administrative user interface. In a production environment you would either enable self service registration or use the API to create users based on other systems, but for illustration purposes using the admin UI is fine.

Here's what the user details of a user registered for both the Pied Piper and Hooli applications will look like:

image TBD
image::guides/single-sign-on/user-registration-docs.png[Registering a user for both applications.,width=1200]

Finally, an optional configuration change is how long an SSO session should last. This SSO timeout is set at the tenant level. If you want to change it, navigate to "Tenants" and then choose your tenant. Go to the "OAuth" tab and change the "Session timeout" value to be the number of seconds you want your SSO sessions to last.

image TBD
image::guides/single-sign-on/tenant-single-sign-on-session-timeout.png[Configuring the single sign-on session length.,width=1200,role=bottom-cropped]

## The SSO Node applications

The next step is to write the code. Both of these applications are pretty simple, as mentioned. They have one page which you can access if you are not logged in. This page is pretty bare, but in a real application could explain the benefits of signing up or of buying the application. 

Then they each have a home page where a person is greeted by name. For a real application, you'd provide the real service on this page. These pages are protected and a user must have logged in to access them. 

The crucial point of this tutorial is that the Hooli application home page is accessible when a user has logged into Pied Piper, and vice versa. That's the magic of single sign-on. In this codebase you'll see how little plumbing you have to do to make this happen when you use FusionAuth as your datastore.

As mentioned above, the code is available under an open source license on [GitHub](https://github.com/fusionauth/fusionauth-example-node-sso). Feel free to clone the repository and play around with it, but below you'll create each part of the app step by step.

You will create the Pied Piper application first. Once this is running, you can copy most of the code for to set up the Hooli application. Make a `piedpiper` directory and `cd` to it.

```shell
mkdir piedpiper && cd piedpiper
```

### package.json

Here's the `package.json` file. Create this file and save it.

```json
{
  "name": "fusionauth-node-example-sso-piedpiper",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "start": "node ./bin/www"
  },
  "dependencies": {
    "@fusionauth/typescript-client": "^1.22.0",
    "cookie-parser": "~1.4.4",
    "debug": "~2.6.9",
    "express": "~4.16.1",
    "express-session": "1.17.0",
    "http-errors": "~1.6.3",
    "morgan": "~1.9.1",
    "pug": "2.0.0-beta11"
  }
}
```

Next you want to run `npm install` to get all needed libraries. 

The only other interesting thing to note is that this file has a `script` entry which allows you to start the server. The script that actually starts the server is what you will create next.

### Starting the server

This script starts up the express server and should be placed in `bin/www`. That may sound familiar because it is in the `package.json`.

```javascript
#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('fusionauth-node-example:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
```

Frankly, this code isn't that interesting with regards to single sign-on but you need it to start the server! So it is included for completeness. 

What it does at a high level: 

* Looks for a port from the environment or uses `3000` as a default. 
* Registers error handling routines. 
* Starts up a server listening on the configured port, passing the requests to code in `app.js`.

`app.js` is another bit of necessary plumbing, so you'll create that next.

### The express server

Each application is going to be using the express framework; you'll configure the individual routes, among other settings, in a file called `app.js`. Create this in the root `piedpiper` directory.

Here's the entire `app.js` file:

```javascript
----
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var express = require('express');
var expressSession = require('express-session');
var path = require('path');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressSession({resave: false, saveUninitialized: false, secret: 'fusionauth-node-example', cookie: {maxAge: 60000}}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
```

That's a lot of code! However, most of it isn't specific to the Pied Piper application. Take a look at an excerpt of the interesting bits:

```javascript
----
//...
var indexRouter = require('./routes/index');

//...
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//...
app.use(expressSession({resave: false, 
                        saveUninitialized: false, 
                        secret: 'fusionauth-node-example', 
                        cookie: {maxAge: 60000}
                       }));
//...
app.use('/', indexRouter);
//...
----

Takeaways from the excerpt:

* The `indexRouter` variable is configured by the `routes/index.js` file. 
* The `pug` view engine will be used for this application.
* The `pug` files should live in the `views` directory. 
* This application has a session lifetime of 60 seconds (the `maxAge` setting expects milliseconds). 
* `indexRouter` is handles the root path, so all application requests fielded by this server will be handled by code in that file.

Why is the session lifetime so short? Mostly so that you can experiment with SSO without waiting for a long time. In a production application, you'd want to tweak this based on your security expectations as well as thinking about the load on the FusionAuth server. Note that even if a user's session expires in the Pied Piper application, they won't be forced to log in again unless their SSO session has also expired. 

The routes and views code will be built out in the next sections, and will illustrate that auto login functionality.

### index.js

This file creates the various routes which will handle the pages discussed above:

* The login page, available to unauthenticated users
* The home page, which greets users

It also has a few other routes which don't have corresponding pages:

* A `logout` route, which lets people, well, log out.
* An `endsession` route, which ends the session and sends the user to the login page.
* An `oauth-redirect` route which handles the bulk of the interesting logic. 

Here's `index.js`. If you are building this application, put this code at `routes/index.js`.

```javascript
----
const express = require('express');
const router = express.Router();
const {FusionAuthClient} = require('@fusionauth/typescript-client');

const clientId = '85a03867-dccf-4882-adde-1a79aeec50df';
const clientSecret = '7gh9U0O1wshsrVVvflccX-UL2zxxsYccjdw8_rOfsfE';
const client = new FusionAuthClient('noapikeyneeded', 'http://localhost:9011');
const hostName = 'piedpiper.local';
const port = 3000;
const title = 'Pied Piper';

const loginUrl = 'http://localhost:9011/oauth2/authorize?client_id='+clientId+'&response_type=code&redirect_uri=http%3A%2F%2F'+hostName+'%3A'+port+'%2Foauth-redirect&scope=offline_access';
const logoutUrl = 'http://localhost:9011/oauth2/logout?client_id='+clientId;

/* GET home page. */
router.get('/', function (req, res, next) {

  if (!req.session.user) {
    res.redirect(302, loginUrl);
    return;
  }
  res.render('index', {user: req.session.user, title: title + ' App', clientId: clientId, logoutUrl: "/logout", loginUrl: loginUrl});
});

/* Login page if we aren't logged in */
router.get('/login', function (req, res, next) {
  res.render('login', {title: title + ' Login', clientId: clientId, loginUrl: loginUrl});
});

/* Logout page */
router.get('/logout', function (req, res, next) {
  req.session.user = null;
  res.redirect(302, logoutUrl);
});

/* End session for global SSO logout */
router.get('/endsession', function (req, res, next) {
  req.session.user = null;
  res.redirect(302, "/login");
});

/* OAuth return from FusionAuth */
router.get('/oauth-redirect', function (req, res, next) {
  // This code stores the user in a server-side session
  client.exchangeOAuthCodeForAccessToken(req.query.code,
                                         clientId,
                                         clientSecret,
                                         'http://'+hostName+':'+port+'/oauth-redirect')
      .then((response) => {
        return client.retrieveUserUsingJWT(response.response.access_token);
      })
      .then((response) => {
        if (response.response.user.registrations.length == 0 || (response.response.user.registrations.filter(reg => reg.applicationId === clientId)).length == 0) {
          console.log("User not registered, not authorized.");
          res.redirect(302, '/');
          return;
        }
      
        req.session.user = response.response.user;
      })
      .then((response) => {
        res.redirect(302, '/');
      }).catch((err) => {console.log("in error"); console.error(JSON.stringify(err));});
});

module.exports = router;
```

Again, that's a lot of code! Let's break it up and look at each section in turn.

```javascript
const express = require('express');
const router = express.Router();
const {FusionAuthClient} = require('@fusionauth/typescript-client');

const clientId = '85a03867-dccf-4882-adde-1a79aeec50df';
const clientSecret = '7gh9U0O1wshsrVVvflccX-UL2zxxsYccjdw8_rOfsfE';
const client = new FusionAuthClient('noapikeyneeded', 'http://localhost:9011');
const hostName = 'piedpiper.local';
const title = 'Pied Piper';
const port = 3000;

const loginUrl = 'http://localhost:9011/oauth2/authorize?client_id='+clientId+'&response_type=code&redirect_uri=http%3A%2F%2F'+hostName+'%3A'+port+'%2Foauth-redirect&scope=offline_access';
const logoutUrl = 'http://localhost:9011/oauth2/logout?client_id='+clientId;

//...
```

At the start of the file is configuration values, library `require` statements and constants. 

You'll need to change this section a bit. Update both the `clientId` and `clientSecret` variables with what you recorded above when configuring the Pied Piper application. Make sure that the second argument to the `client` constructor matches your FusionAuth installation, typically `\http://localhost:9011`. If you are using a different host for FusionAuth, also change the `loginUrl` and `loginUrl` values.

The first argument to the `client` constructor is `noapikeyneeded` because the client interactions performed do not require an API key. However, if you build on this applications to make them do something useful, such as updating user data or adding consents, change that value to a [real API key](/docs/v1/tech/apis/authentication/#manage-api-keys).

Next up, the home page route. This is the page that will show the user's data.

```javascript
//...

/* GET home page. */
router.get('/', function (req, res, next) {

  if (!req.session.user) {
    res.redirect(302, loginUrl);
    return;
  }
  res.render('index', {user: req.session.user, title: title +' App', clientId: clientId, logoutUrl: "/logout", loginUrl: loginUrl});
});
//...
```

Users can't view the home page if they aren't signed in. However, this is a design choice; you could show text for anonymous users and other text for users who have been authenticated. 

Here, the code checks for a user value in the session. If it absent, the user is redirected to `loginUrl`, which is the FusionAuth login page configured previously. 

The route that handles the login page is up next.

```javascript
//...
/* Login page if we aren't logged in */
router.get('/login', function (req, res, next) {
  res.render('login', {title: title +' Login', clientId: clientId, loginUrl: loginUrl});
});
//...
```

This login page is available to anonymous users. For this tutorial, only a link to login is shown, but, as mentioned above, typically this page would have text and images illustrating the benefits of this application.

Now, let's check out the logout route.

```javascript
//...
/* Logout page */
router.get('/logout', function (req, res, next) {
  req.session.user = null;
  res.redirect(302, logoutUrl);
});
//...
```

This route does two things:

* Removes the user object from the session 
* Redirects to the FusionAuth logout URL

The removal signs the user out of the Pied Piper application. The redirection will sign the user out of the SSO session and all other applications; in this case, that is just the Hooli application, but if there were five other applications, the user would be signed out of all of them.

How does that happen? Glad you asked, as the next route to check out, the `endsession` route, plays an integral role in that convenient feature.

```javascript
//...
/* End session for global SSO logout */
router.get('/endsession', function (req, res, next) {
  req.session.user = null;
  res.redirect(302, "/login");
});
//...
``

FusionAuth requests this route from the Pied Piper application when a user logs out from the Hooli application and any other application in this tenant. That means that this endpoint is responsible for logging the user out. This URL was configured in the FusionAuth application above. 

While similar in functionality to the `/logout` endpoint, it is separate. While each endpoint destroys the session, they need to send the browser to different places afterward. For `endession`, the request should forward to a page accessible to unauthenticated users. For `/logout` the user needs to be sent to the FusionAuth `logout` URL.

Let's take a look at the `oauth-redirect` route next.

```javascript
//...
/* OAuth return from FusionAuth */
router.get('/oauth-redirect', function (req, res, next) {
  // This code stores the user in a server-side session
  client.exchangeOAuthCodeForAccessToken(req.query.code,
                                         clientId,
                                         clientSecret,
                                         'http://'+hostName+':'+port+'/oauth-redirect')
      .then((response) => {
        return client.retrieveUserUsingJWT(response.response.access_token);
      })
      .then((response) => {
        if (response.response.user.registrations.length == 0 || (response.response.user.registrations.filter(reg => reg.applicationId === clientId)).length == 0) {
          console.log("User not registered, not authorized.");
          res.redirect(302, '/');
          return;
        }
      
        req.session.user = response.response.user;
      })
      .then((response) => {
        res.redirect(302, '/');
      }).catch((err) => {console.log("in error"); console.error(JSON.stringify(err));});
});

module.exports = router;
----

This is the part of the code that is responsible for catching the authorization code `GET` from FusionAuth, which occurs after the user has logged in there. 

This code then retrieves an access token, and calls `retrieveUserUsingJWT` to get the user object. 

Next, the user's registrations are checked. If the user isn't registered for this application, we send them to the home page, which will send them to the login page. If they user is registered, the user object is put in the session. That's what the protected pages like the home page, will check for to determine if a user is logged in.

The last bit of the `index.js` returns the configured `router` object. 

That's pretty much it for the Pied Piper application code.  As mentioned above, coding features that might actually be useful is left as an exercise for the reader.

### Views

Now you will create the views. As configured in `app.js`, each of these will be placed in the `views` subdirectory. 

The layout view is first:

```pug
doctype html
html
  head
    title= title
    link(rel='stylesheet', href='/stylesheets/style.css')
  body
    h2 Pied Piper | 
       a(href='http://hooli.local:3001') Hooli
    block content
```

The content placed into any of the child views of this layout is displayed using the `block content` directive. Above the content is a text menu where users can switch between the Pied Piper and Hooli applications. 

Second, you can put this code in `login.pug`: 

```pug
extends layout

block content
  h1= title
  a(href=loginUrl) Login

  p Welcome to #{title}
```

This is the login page discussed before, and is available to users who have not logged in.

The next view file to look at is the home page, which should be placed at `views/index.pug`.

```
extends layout

block content
  h1= title

  p Hello #{user.firstName}
  a(href=logoutUrl) Log out

  p Welcome to #{title}
```

This is where the user is welcomed by name. Here you can display other information on the user object, or other information that should be accessible only by this user.

Side note: there is some CSS in this application; the CSS is available in the [GitHub repository](https://github.com/fusionauth/fusionauth-example-node-sso), but won't be reviewed here.

Next, create the sibling Hooli application.

### Setting up the Hooli application

The Pied Piper and Hooli applications would, in a real world scenario, have different functionality. For instance, the Pied Piper application might deliver compression software and the Hooli application might sell the Hooliphone. 

For this tutorial, though, the applications are going to be almost identical. After all, the point is to show how to set up single sign-on, not change the world.

To create the Hooli application, do the following:

* Use a different terminal window so that you can have both Node applications running at once.
* Copy all the same files under a directory called `hooli`.
* Modify `index.js` to use the correct values. Change the title to 'Hooli', the hostname to `hooli.local`, the port to `3001` and the Client Id and Client Secret to the values for the Hooli application you captured when first configuring FusionAuth.
* The `layout.pug` file has to be modified so that the menu provides a link to the Pied Piper application, rather than the Hooli application. Don't forget the port!
```pug
doctype html
html
  head
    title= title
    link(rel='stylesheet', href='/stylesheets/style.css')
  body
    h2
      a(href='http://piedpiper.local:3000') Pied Piper
      |
      || Hooli
    block content

You will need to start the Hooli application with a different port: `3001`, otherwise the two applications will fight over the port and one will fail to start.

```shell
PORT=3001 npm start
```

And that's it. You've just created a second application. 

### Test it out

You've created the Pied Piper node application from scratch, including the `package.json`, startup scripts, routes and views. Now it is time to put it to the test. Start the Pied Piper application:

```shell
PORT=3000 npm start
```

You can visit `http://piedpiper.local:3000/login`. Click on the Hooli link and you'll be prompted to authenticate. Hit the back button and then click the login link.

You'll be redirected to the FusionAuth login screen. (Side note: [this page can be themed to look like any website](/docs/v1/tech/themes/).) 

Log in as the user which you registered for both applications. 

You'll be greeted with a welcome message. Now, click the Hooli link and you'll end up at the Hooli home page without having to authenticate.

You can then log out by clicking any of the logout links. One caveat, however. If you are using Safari or Chrome on macOS, multi application logout won't work due to browser quirks with iframes and cookies. Setting up a proxy and configuring everything to run over TLS, then it will work. Logging out on FireFox works whether you use TLS or not.

## Next steps

If you want to push the boundaries of what you can build with FusionAuth, consider the following additional functionality.

* Create a third application, like "Raviga", and add it to the menu.
* Create an `admin` and a `user` role in each application and show different text to a user with each role.
* Create a second protected page which shows the user's profile data, such as last name, email and phone number . Extract out the `logged in` check to a function.
* Get logout working using TLS. Here's a [sample apache configuration](https://github.com/FusionAuth/fusionauth-contrib/blob/master/Reverse%20Proxy%20Configurations/apache/apache.ssl.conf) to get you started.

Happy coding!
