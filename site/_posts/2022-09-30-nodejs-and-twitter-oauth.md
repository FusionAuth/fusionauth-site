---
layout: blog-post
title: Adding Twitter sign in to your Node.js + Express web application using OAuth
description: In this tutorial, we'll build a basic Express web application using FusionAuth to handle login via Twitter.
author: Bradley Van Aardt
category: blog
tags: client-node tutorial tutorial-express tutorial-node
excerpt_separator: "<!--more-->"
---

In this tutorial, we'll build a basic Nodejs + [Express](http://expressjs.com) web application which does user registration and authentication via FusionAuth. We'll also hook FusionAuth into Twitter's authentication system, to allow users to easily log in to your app via Twitter. 

<!--more-->

The application itself is very simple: it will let users sign up via Twitter, and give them access to a "secret" area where their FusionAuth profile is displayed to them. With these basics in place, you'll see how FusionAuth works and how it can extend the application to do whatever you need. You can, as always, [skip ahead and view the code](https://github.com/fusionauth/fusionauth-example-express-twitter).

## What you'll need to follow along

We'll explain nearly everything that we use, but we expect you to have:
-   Basic Node.js knowledge and a Node.js environment set up
-   Preferably basic [Express](http://expressjs.com) knowledge (or knowledge of a similar web framework, or of the middleware concept)
-   Docker and Docker Compose set up as we'll set up FusionAuth using these.
    
It'll also help if you know the basics of OAuth or authentication in general.

## Why FusionAuth instead of plain Passport?

[Passport](https://www.passportjs.org) is a one of the commonly used authentication systems in Express apps. It is very powerful, and allows you to hook into social providers, openID and OAuth providers, or use a local authentication strategy. This sounds like everything you'll ever need, but there are still a few missing pieces. For example, you still need to construct your own login page and other account functionality such as resetting passwords, forgotten password resets, 2FA, email verification, account protection and more. Setting up custom web app authentication is always more complicated than it seems

The great news is that combining Passport with FusionAuth makes a complete system, which takes care of all aspects of authentication. It also means that much of your app's authentication capability can be configured through FusionAuth, rather than writing code and modifying your app. For example, you can easily add social login providers whenever you need, without changing code or redeploying your app. 

With this setup, authentication concerns are taken care of entirely by FusionAuth

{% include _image.liquid src="/assets/img/blogs/social-sign-in-twitter-express/architecture.png" alt="Important private data goes in FusionAuth. Everything else in Node-Express. FusionAuth coordinates with other identity providers" class="img-fluid" figure=false %}

The image above shows how this works. Your application logic and all public information can be handled by Nodejs + Express. Anything sensitive, such as personally identifiable information (PII), is handled by FusionAuth.

This allows you to focus a majority of your security efforts on the FusionAuth installation. It also means that if you create more applications, they can piggyback on your centralised authentication instead of having to re-implement authentication for every application that you build. You can also create a multi-tenant configuration allowing you to easily have logically separate environments for different clients.

Also, any integrations that you set up with other providers (e.g. Twitter sign in) can be done once, instead of per application.

## Installing and configuring FusionAuth with Docker Compose

There are [various ways](/docs/v1/tech/installation-guide/fusionauth-app) to install FusionAuth depending on your system, but the easiest way is to use Docker and Docker Compose. [Instructions are here](/docs/v1/tech/installation-guide/docker). Currently, to install and run FusionAuth you would run (again, assuming you have Docker installed).

```bash
curl -o docker-compose.yml https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/docker-compose.yml
https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/docker-compose.override.yml
curl -o .env https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/.env
docker-compose up
```

Note that this uses a public `.env` file containing hard-coded database passwords and is not suitable for production use.

For Twitter integration, we recommend setting up FusionAuth on a publicly available URL. This is because Twitter does not redirect to `localhost` addresses for [OAuth callbacks](https://stackoverflow.com/questions/800827/twitter-oauth-callbackurl-localhost-development). Some developers have luck setting a local `hosts` file entry, or using `127.0.0.1` instead of `localhost`, but the most reliable option is to host FusionAuth on a publicly accessible URL. Bear in mind the extra security considerations of this option.

### Configuring FusionAuth

FusionAuth should now be running and reachable on your chosen URL, or `http://localhost:9011` if you've installed it locally. The first time you visit, you'll be prompted to set up an admin user and password. Once you've done this, you'll be prompted to complete three more set up steps, as shown below.

{% include _image.liquid src="/assets/img/blogs/social-sign-in-twitter-express/fusionauth-setup1.png" alt="FusionAuth prompts us with the setup steps that we need to complete." class="img-fluid" figure=false %}

We'll skip step **#3** in this tutorial, but sending emails (to verify email addresses and do password resets) is a vital part of FusionAuth running in production, so you'll want to do that.

### Creating an Application

Click "Setup" under "Missing Application" and call your new app "Twitter Express", or another name of your choice. It'll get a Client Id and Client Secret automatically - save these, as we'll use them in the code. Later, we'll set up a Nodejs + Express application which will run on `http://localhost:3000`, so configure the Authorized URLs accordingly. You should add:

- `http://localhost:3000/auth/callback` to the Authorized redirect URLs
- `http://localhost:3000/` to the Authorized request origin URL
- `http://localhost:3000/` to the Logout URL
  
{% include _image.liquid src="/assets/img/blogs/social-sign-in-twitter-express/fusionauth-urlconf.png" alt="Configuring the application URLs in FusionAuth." class="img-fluid" figure=false %}

Click the Save button in the top right for your changes to take effect.

## Setup a FusionAuth API Key

Once the user has logged in via the FusionAuth application, we can retrieve their FusionAuth Profile using the [FusionAuth Typescript module](https://www.npmjs.com/package/@fusionauth/typescript-client), provided with an API key.

Navigate to Settings and then API Keys, then add a key. Add a name for the key and take note of the generated key value. 

{% include _image.liquid src="/assets/img/blogs/social-sign-in-twitter-express/gettingapikey.png" alt="Getting the API key from FusionAuth." class="img-fluid" figure=false %}

For extra security, you can restrict the permissions for the key. For our app, we only need to enable the actions for `/api/user/`, which will let the key carry out basic actions on users. If you leave the key with no explicitly assigned permissions, it will be an all-powerful key that can control all aspects of your FusionAuth app.

{% include _image.liquid src="/assets/img/blogs/social-sign-in-twitter-express/gettingapikey-limited-scope.png" alt="Limiting the scope of the created API key." class="img-fluid" figure=false %}

### Creating an application on Twitter

In order to allow our users to sign in to our app using their Twitter account, you'll need to sign up for a [developer account on Twitter](https://developer.twitter.com). The full instructions for doing this are [available here](/docs/v1/tech/identity-providers/twitter).


Use `https://<YOUR_FUSIONAUTH_URL>/oauth2/callback` (where `https://<YOUR_FUSIONAUTH_URL>` is your FusionAuth installation address) for the Callback URI / Redirect URL. This will allow our FusionAuth app to talk to Twitter servers and have them authenticate users on our behalf, as shown below.

{% include _image.liquid src="/assets/img/blogs/social-sign-in-twitter-express/twitter-callbacks.png" alt="Adding authorized URLs to Google." class="img-fluid" figure=false %}

Once you've set up everything on Twitter, you'll need to complete your setup by adding Twitter as an identity provider to FusionAuth and copying in the API Key and Secret that you received from Twitter. These are different values than the FusionAuth application's Client Id and Client Secret. You can find the detailed steps for [setting up Twitter as a third-party login via FusionAuth here](/docs/v1/tech/identity-providers/twitter).

In the next step, make sure that you have enabled the Twitter integration and turn on "Create registration" for your Fusion + Express app. Also don't forget to hit the save button.

{% include _image.liquid src="/assets/img/blogs/social-sign-in-twitter-express/twitter-fusion.png" alt="Enabling Twitter registration in our application." class="img-fluid" figure=false %}

Now we've done most of the admin. Let's build a Nodejs + Express app!

## Setting up Express

To get started, you should:
-   Scaffold a new Express application
-   Install the scaffolded dependencies
-   Install Passport and helper libraries, and the FusionAuth Typescript client
-   Start the server to ensure everything is installed and working

Here are the commands to do it:

```bash
npx express-generator --view=hbs fusion-twitter
cd fusion-twitter 
npm install
npm install passport passport-oauth2 connect-ensure-login express-session @fusionauth/typescript-client
npm start
```

If all went well, the server should start successfully and you can visit `http://localhost:3000`.

{% include _image.liquid src="/assets/img/blogs/social-sign-in-twitter-express/express-server.png" alt="Express app default home page" class="img-fluid" figure=false %}

## Building the Application

Our application will only have three pages, including the FusionAuth login page.

1. A home page - a public page showing how many users our app has and inviting users to log in.
2. The login / sign up page (redirected to FusionAuth) with options to use a username/password or to sign in with Twitter.
3. A logged in private "Member's Only" page. This will display the user's profile retrieved from FusionAuth


## Add and Initialise dependencies

To start, we'll add the references needed for [Passport](https://www.passportjs.org), the [Passport-oauth2](https://www.passportjs.org/packages/passport-oauth2/) strategy, enabling sessions using [Express Sessions](https://github.com/expressjs/session). We'll also add a ref to the [FusionAuth typescript](https://www.npmjs.com/package/@fusionauth/typescript-client) client.

Open the `app.js` file. Below the line `var logger = require('morgan');` add in the following:

```js
var passport = require("passport");
var OAuth2Strategy = require("passport-oauth2").Strategy;
var passOAuth = require("passport-oauth2");
var { FusionAuthClient } = require("@fusionauth/typescript-client");
var session = require("express-session");
const { ensureLoggedIn } = require('connect-ensure-login');
```

Now, we can initialize and add Passport and the session handler to the Express pipeline. Add the following just below the `app.use(express.static(path.join(__dirname, 'public')));` line:

```js
app.use(session({ secret: "TOPSECRET" }));
app.use(passport.initialize());
app.use(passport.session());
```

Replace the `TOPSECRET` string with a string of your choosing. This secret is used to sign the session information in the cookie. Normally, this is kept secret, as anyone who has access to the secret could construct a session cookie that looks legitimate to the server and give them access to any account on the server. You can also add an environment variable to store this secret, rather than store it in the code repo.

We'll also need to initialize the FusionAuth client with the API key created earlier. This will allow us to retrieve the user profile from FusionAuth after a successful login. Add the following code just below the previous code added:

```js
const fusionClient = new FusionAuthClient(
  "<YOUR_FUSION_API_KEY>",
  "https://<YOUR_FUSIONAUTH_URL>"
);
```

Replace the parameter `<YOUR_FUSIONAUTH_URL>` with the URL your FusionAuth instance is located at. Replace `<YOUR_FUSION_API_KEY>` with the API key created earlier. 


Now we can initialize the [Passport strategy](https://www.passportjs.org/concepts/authentication/strategies/). We'll be connecting to FusionAuth using OAuth2, so we'll use the [passport-oauth2](https://www.passportjs.org/packages/passport-oauth2/) strategy. Add the following code directly below the code you've just added:

```js
passport.use(
  new OAuth2Strategy(
    {
      authorizationURL: "https://<YOUR_FUSIONAUTH_URL>/oauth2/authorize",
      tokenURL: "https://<YOUR_FUSIONAUTH_URL>/oauth2/token",
      clientID: "<YOUR_FUSIONAUTH_APP_CLIENTID>",
      clientSecret: "<YOUR_FUSIONAUTH_APP_CLIENT_SECRET>",
      callbackURL: "http://localhost:3000/auth/callback",
    },
    function (accessToken, refreshToken, profile, cb) {
      // Get the user profile from Fusion:
      fusionClient
        .retrieveUserUsingJWT(accessToken)
        .then((clientResponse) => {
          return cb(null, clientResponse.response.user);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  )
);
```

Replace the parameter `<YOUR_FUSIONAUTH_URL>` with the URL your FusionAuth instance is located at. Replace `<YOUR_FUSIONAUTH_APP_CLIENTID>`, and `<YOUR_FUSIONAUTH_APP_CLIENT_SECRET>` with the values you saved during the FusionAuth application setup earlier.

This snippet of code sets up the OAuth parameters for the passport strategy. The strategy has a callback which is invoked when a successful authorization and token call has been completed to FusionAuth. The FusionAuth client has a handy method to retrieve a user by the JWT returned from the authorization process. We can use this to get the user, and return it to the passport strategy callback. This user will then also be passed to out session handler to save, and added to the `req` parameter in subsequent middleware handlers as `req.user`. To enable this, add the following code, below the code you just added:

```js
passport.serializeUser(function (user, done) {
  process.nextTick(function () {
    done(null, user);
  });
});

passport.deserializeUser(function (user, done) {
  process.nextTick(function () {
    done(null, user);
  });
});

```

# Add express routes

We've got the basic framework and authorization code set up. Now we can add some routes. We'll start with the `login` route to handle the redirect to FusionAuth, which will in turn handle the calls to Twitter. 

Add this code under the `app.use("/", indexRouter);` line:

```js
app.get("/login", passport.authenticate("oauth2"));
```
Note that we don't need to add a router or view for the login redirect to FusionAuth to work. Passport will check that if the user needs to be logged in, and if so will send them to FusionAuth for authentication. 

After authentication, FusionAuth will redirect to the callback route we provided in the Passport OAuth setup, as well as in the authorized callback route earlier. We can add this route now. Add the following code under the `login` route:

```js
app.get(
  "/auth/callback",
  passport.authenticate("oauth2", { failureRedirect: "/" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);
```

On successful auth or failure, we'll redirect to the home page. Let's update that now to show the login status, and provide a link to the "members only" area. Open the `index.js` file in the `routes` folder, and update the `get` route to the following:

```js
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', "authenticated": req.isAuthenticated() });
});
```

Passport adds a function `isAuthenticated()` to the `req` object. Querying this function tells us if the user is logged in or not. We add this to the keys and values passed to the index view, so that we can show a different message based on the user's authentication status. 

Now open the `index.hbs` file in the `views` folder, and update the code to the following:

{% raw %}
```html
<h1>{{title}}</h1>
<p>Welcome to {{title}}</p>

{{#if authenticated}}
  <p>You are logged in!</p>
  <p>
    You can now visit the super secure <a href="/users/me">members only area</a>
  </p> 
{{else}}
  <p>
    <a href="/login">Login Here</a>
  </p>
{{/if}}
```
{% endraw %}

This will notify the user if they are logged in or not, and point them to the relevant page. 


## Adding a member's only area

Now that we have the basic login and auth mechanics set up, we can add a restricted route, that is only available to users that are logged in. 

In the `users.js` file in the `routes` folder, modify the `get` route to the following:

```js
router.get('/me', function(req, res, next) {
  const user = req.user; 
  res.send('You have reached the super secret members only area! Authenticated as : ' + JSON.stringify(user, null, '\t'));
});

```
Now, we need to secure the route to this page to users that are authenticated. To help with that, we'll use the [`connect-ensure-login`](https://github.com/jaredhanson/connect-ensure-login) middleware we installed earlier. Update the `users` route in the `app.js` file from:

```js
app.use('/users', usersRouter);
```
to:

```js
app.use('/users', ensureLoggedIn('/login'), usersRouter);
```

The `ensureLoggedIn` middleware checks if the user is authenticated before proceeding to the router (or following middleware). It redirects to the `login` page if the user is not logged in. 

## Testing it all

We are done with the demo. Type `npm start` at the console to start up the server. Then navigate to `localhost:3000`, preferably in a private tab. This ensures that your main admin login to FusionAuth is not a confounding factor while logging in.  

You should see the main page looking something like this:

{% include _image.liquid src="/assets/img/blogs/social-sign-in-twitter-express/not-logged-in.png" alt="The main page when logged out" class="img-fluid" figure=false %}


Clicking on "Login Here" should redirect you to your FusionAuth installation, with a Twitter button as a login option:

{% include _image.liquid src="/assets/img/blogs/social-sign-in-twitter-express/login-page.png" alt="The FusionAuth login page, with Twitter as an option" class="img-fluid" figure=false %}

Clicking the "Login with Twitter" button should redirect you to Twitter to complete the authentication:

{% include _image.liquid src="/assets/img/blogs/social-sign-in-twitter-express/twitter-page.png" alt="The Twitter page asking permission to authenticate you to your FusionAuth instance" class="img-fluid" figure=false %}

Entering your Twitter credentials should now redirect you back to the app's root page, where you should see a logged in message:

{% include _image.liquid src="/assets/img/blogs/social-sign-in-twitter-express/logged-in.png" alt="The root page message for logged in users" class="img-fluid" figure=false %}

Clicking on the "members only area" link should take you to `users/me`, showing a JSON object representing your profile on FusionAuth (with the username from Twitter). 

{% include _image.liquid src="/assets/img/blogs/social-sign-in-twitter-express/users-me.png" alt="The users/me page showing the user's FusionAuth profile" class="img-fluid" figure=false %}

## Where to next with Express and FusionAuth?

That’s the basics of our Express + Twitter + FusionAuth app done. The app has a fully featured authentication system, without the hassle and possible risks of implementing all of that code ourselves. The complete code is hosted on GitHub [here](https://github.com/fusionauth/fusionauth-example-express-twitter)

Of course, you would need to add more interesting features to this app for it to be useful. But being able to take care of the authentication, social sign in, and general security with just a small amount of config code leaves a lot more time for your application's more useful and critical features. 

For a production environment, you would also need to do a bit more work in making sure FusionAuth was really safe. In our example, we used the default password provided with Docker for our database, left debug mode on, and ran FusionAuth locally, co-hosted with our Express application. For a safer setup, you would run FusionAuth on its own infrastructure, physically separate from the Express app, and take more care around production configuration and deployment. FusionAuth gives you all of the tools to do this easily.




