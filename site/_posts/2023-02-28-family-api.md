---
layout: blog-post
title: Using the Family API
description: Using the Family API to control access
author: Dean Rodman Bradley Van Aardt
category: blog
tags: client-node tutorial tutorial-express tutorial-node
excerpt_separator: "<!--more-->"
---

In this tutorial, we'll build a basic Node.js + [Express](http://expressjs.com) web application which grants conditional access to users in a family structure. Specifically, a "child" user will request access to the site and then their "parent" user can grant or revoke their access at will.  

<!--more-->

The application itself is very simple: it will let users sign up via FusionAuth, allow them to set permissions for their children, and allow them to update those consents at any time. With these basics in place, you'll see how FusionAuth works and how it can extend the application to do whatever you need. You can also [skip ahead and view the code](<todo>), although much of the application is defined in FusionAuth as detailed in this guide.

## Prerequisites

We'll explain nearly everything that we use, but we expect you to have:
-   Basic Node.js knowledge and a Node.js environment set up.
-   Preferably basic [Express](http://expressjs.com) knowledge (or knowledge of a similar web framework, or of the middleware concept).
-   Docker and Docker Compose set up as we'll set up FusionAuth using these.
    
It'll also help if you know the basics of OAuth or authentication in general.

## Why FusionAuth instead of plain Passport?

[Passport](https://www.passportjs.org) is a one of the commonly used authentication systems in Express apps. It is very powerful, and allows you to hook into social providers, openID and OAuth providers, or use a local authentication strategy. This sounds like everything you'll ever need, but there are still a few missing pieces. For example, you still need to construct your own login page and other account functionality such as changing passwords, forgotten password resets, 2FA, email verification, account protection and more. Setting up custom web app authentication is always more complicated than it seems.

You'd also need to implement functionality to allow users to update their profile information. Part of users profile and account data is inevitably consent permissions. Most apps will need to gather user's consent for activities such as sending marketing updates, or sharing the user's data with affiliates and other third-parties. This would normally require coding, storing and maintaining with custom solutions. However, since it is an integral part of user identity, FusionAuth has consent management built-in.

The great news is that combining Passport with FusionAuth makes a complete system, which takes care of all aspects of authentication and identity. It also means that much of your app's authentication capability can be configured through FusionAuth, rather than writing code and modifying your app. For example, you can easily add registration form fields whenever you need to, without changing code or redeploying your app.

With this setup, authentication, identity and consent concerns are taken care of entirely by FusionAuth.

The image below shows how this works.

{% include _image.liquid src="/assets/img/blogs/consents-app/architecture.png" alt="Important private data goes in FusionAuth. Everything else in Node-Express. User consent information also stored and managed by FusionAuth" class="img-fluid" figure=false %}

Your application logic and all public information can be handled by Node.js + Express. Anything sensitive, such as personally identifiable information (PII), passwords, and consent permissions is handled by FusionAuth.

This allows you to focus a majority of your security efforts on the FusionAuth installation. It also means that if you create more applications, they can piggyback on your centralised authentication instead of having to re-implement authentication for every application that you build. You can also create a multi-tenant configuration allowing you to easily have logically separate environments for different clients.

Also, any integrations that you set up with other providers (e.g. Twitter, Google, Apple sign-in) can be done once, instead of per application.

## Installing and configuring FusionAuth with Docker Compose

There are [various ways](/docs/v1/tech/installation-guide/fusionauth-app) to install FusionAuth depending on your system, but the easiest way is to use Docker and Docker Compose. Instructions are [here](/docs/v1/tech/installation-guide/docker). Currently, to install and run FusionAuth you would run (again, assuming you have Docker installed) the following commands:

```bash
curl -o docker-compose.yml https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/docker-compose.yml
https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/docker-compose.override.yml
curl -o .env https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/.env
docker-compose up
```

Note that this uses a public `.env` file containing hard-coded database passwords and is not suitable for production use.

### Configuring FusionAuth

FusionAuth should now be running and reachable at `http://localhost:9011`, if you've installed it locally. The first time you visit, you'll be prompted to set up an admin user and password. Once you've done this, you'll be prompted to complete three more setup steps, as shown below.

{% include _image.liquid src="/assets/img/blogs/consents-app/fusionauth-setup1.png" alt="FusionAuth prompts us with the setup steps that we need to complete." class="img-fluid" figure=false %}

We'll skip step **#3** in this tutorial, but sending emails (to verify email addresses and do password resets) is a vital part of FusionAuth running in production, so you'll want to do that when you go live.

### Creating an application

Click "Setup" under "Missing Application" and call your new app "Family-Api-App", or another name of your choice. It'll get a Client Id and Client Secret automatically - save these, as we'll use them in the code. Later, we'll set up a Node.js + Express application which will run on `http://localhost:3000`, so configure the Authorized URLs accordingly. You should add:

- `http://localhost:3000/oauth-redirect` to the Authorized redirect URLs.
- `http://localhost:3000/` to the Authorized request origin URLs.
- `http://localhost:3000/logout` to the Logout URL.

Make sure that `PKCE` is set to `Required.` Your application should look like this.
  
{% include _image.liquid src="/assets/img/blogs/family-api/family-api-create-application.png" alt="Configuring the application URLs in FusionAuth." class="img-fluid" figure=false %}

Click the Save button at the top right for your changes to take effect.

## Setting up a FusionAuth API key

Once the user has logged in via the FusionAuth application, we can retrieve their FusionAuth profile and consent permissions using the [FusionAuth Typescript module](https://www.npmjs.com/package/@fusionauth/typescript-client), provided with an API key.

Navigate to Settings and then API Keys, then add a key. Add a name for the key and take note of the generated key value.

{% include _image.liquid src="/assets/img/blogs/consents-app/gettingapikey.png" alt="Getting the API key from FusionAuth." class="img-fluid" figure=false %}

For extra security, you can restrict the permissions for the key. For our app, we only need to enable the get, post and put actions for `/api/user/family` which will let the key create a family and assign users to it. If you leave the key with no explicitly assigned permissions, it will be an all-powerful key that can control all aspects of your FusionAuth app. You should avoid doing this!

{% include _image.liquid src="/assets/img/blogs/family-api/family-api-api-key.png" alt="Limiting the scope of the created API key." class="img-fluid" figure=false %}

## Creating users

The application will have two users: a "child" user who will request access to the site and a "parent" user who can grant or revoke the child user's permission at any time. 

Let's create the parent user first. Navigate to `Users` and click the `Add` button. Select a tenant and supply an email address. Untoggle the `Send email to set up password` switch to directly supply a password. By default, a user must be at least 21 years old in order to be designated as a family owner, so supply an appropriate `Birthdate` as well. This requirement can be modified in the [tenant configuration](https://fusionauth.io/docs/v1/tech/core-concepts/tenants#family).

{% include _image.liquid src="/assets/img/blogs/family-api/family-api-parent-user.png" alt="Creating the parent user." class="img-fluid" figure=false %}

Now, repeat this process for the child user. By default, the child user's `Birthdate` can be anything or left blank.

## Setting up Express

To get started, you should:
-   Scaffold a new Express application.
-   Install the scaffolded dependencies.
-   Start the server to ensure everything is installed and working.

Here are the commands to do it:

```bash
npx express-generator --view=pug fusionauth-example-family
cd fusionauth-example-family
npm install
npm start
```

If all went well, the server should start successfully and you can visit `http://localhost:3000`.

{% include _image.liquid src="/assets/img/blogs/family-api/family-api-express-server.png" alt="Express app default home page" class="img-fluid" figure=false %}

## Building the application

Our application will only one page apart from the FusionAuth login page: a home page from which a "parent" user can grant or revoke permission for "child" users to view the page.

Add the following to `views/index.pug`. 

```js
  - var clientId = '<YOUR_CLIENT_ID>'
  if user
    p Hello #{user.firstName}
    p 
      a(href='/confirm-child-list') View children to confirm
    p Confirmed children
    if family
      ul 
        each val in family
           form(action='/change-consent-status', method='POST')
              p #{val.email}
                |
                Consent #{val.consentstatus}
                input(type='hidden', name='userConsentId', value=val.userConsentId) 
                |  
                if val.status == "Active"
                  input(type='submit', value='Revoke Consent')
                  input(type='hidden', name='desiredStatus', value='Revoked') 
                else
                  input(type='hidden', name='desiredStatus', value='Active') 
                  input(type='submit', value='Grant Consent')
  else
    a(href='<YOUR_FUSIONAUTH_URL>/oauth2/authorize?client_id='+clientId+'&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth-redirect&scope=offline_access&code_challenge='+challenge+'&code_challenge_method=S256') Login
```

Replace `<YOUR_CLIENT_ID>` with the Id of your FusionAuth application and `<YOUR_FUSIONAUTH_URL>` with the fully-qualified URL of your FusionAuth instance, including the protocol. For example, `<YOUR_CLIENT_ID>` might look like `7d31ada6-27b4-461e-bf8a-f642aacf5775` and `<YOUR_FUSIONAUTH_URL>` might look like `https://local.fusionauth.io`.

# Adding Express routes

We've got the basic framework and authorization code set up. Now we can add some routes. We'll start with the `login` route to handle the redirect to FusionAuth.

Add this code under the `app.use("/", indexRouter);` line:

```js
app.get("/login", passport.authenticate("oauth2"));
```

Note that we don't need to add a router or view for the login redirect to FusionAuth to work. Passport will check whether the user needs to be logged in, and if so will send them to FusionAuth for authentication.

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
On successful authentication or failure, we'll redirect to the homepage. Let's update that now to show the login status, and provide a link to the users profile page. Open the `index.js` file in the `routes` folder, and update the `get` route to the following:

```js
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', "authenticated": req.isAuthenticated() });
});
```

Passport adds a function `isAuthenticated()` to the `req` object. Querying this function tells us whether the user is logged in. We add this to the keys and values passed to the index view, so that we can show a different message based on the user's authentication status.

Now open the `index.hbs` file in the `views` folder, and update the code to the following:

{% raw %}
```html
<h1>{{title}}</h1>
<p>Welcome to {{title}}</p>

{{#if authenticated}}
  <p>You are logged in!</p>
  <p>
    You can now visit your <a href="/users/me">profile page</a>
  </p> 
{{else}}
  <p>
    <a href="/login">Login Here</a>
  </p>
{{/if}}
```
{% endraw %}

This will notify the user if they are logged in or not, and point them to the relevant action.

## Adding a members only area

Now that we have the basic login and authentication mechanics set up, we can add a restricted route that is only available to users that are logged in. This route will show the user their profile, and a link to update their information.

In the `users.js` file in the `routes` folder, replace the code with the following:

```js
var express = require("express");
var router = express.Router();
var { FusionAuthClient } = require("@fusionauth/typescript-client");

const fusionClient = new FusionAuthClient(
  "<YOUR_FUSION_API_KEY>",
  "https://<YOUR_FUSIONAUTH_URL>"
);

/* GET users listing. */
router.get("/me", async function (req, res, next) {
  const user = req.user;
  // Get the user's consent info:
  let userConsents = {};
  try {
    const response = await fusionClient.retrieveUserConsents(user.id);
    userConsents = response.response.userConsents;
  } catch (err) {
    console.log(err);
  }
  res.render("me", {
    profile: JSON.stringify(user, null, "\t"),
    consents: JSON.stringify(userConsents, null, "\t"),
  });
});

module.exports = router;
```

Replace the parameter `<YOUR_FUSIONAUTH_URL>` with the URL your FusionAuth instance is located at (normally `http://localhost:9011` for local docker installs). Replace `<YOUR_FUSION_API_KEY>` with the API key created earlier.

This code sets up a FusionAuth client link, so that we can read the user's consent information from [the API](https://fusionauth.io/docs/v1/tech/apis/consents#retrieve-a-user-consent). It also creates a `/users/me` route, which is used to retrieve the users profile information. In the route, we grab the `user` object from the `req` parameter. Recall this was added by Passport earlier in the setup. Then we make a call to the FusionAuth API to retrieve the user's consent information, passing in the user's `id` as the parameter. We simply stringify the user object and consents and send it to the `me` handlebars template to render. In a production app, you'd want to display this a bit nicer, and maybe search for the specific fields and consents you want to display. You'd access a user's consents exactly the same way, through the API, when determining what kind of marketing channel they'd prefer. This would typically be called in a background worker process, or serverless function.

We need to create the handlebars template for this route. Create a new file in the "views" folder, called `me.hbs`. Add the following code to the file:

{% raw %}
```html
<h1>{{title}}</h1>
<p>Welcome to {{title}}</p>

<p>
  You can update your
  <a target="_blank"
    href="<YOUR_FUSIONAUTH_ACCOUNT_LINK>"
  >profile here</a>
</p>


<h2>Profile Info</h2>
<p>
  {{profile}}
</p>

<h2>Consent Permissions</h2>
<p>
  {{consents}}
</p>
```
{% endraw %}


This is a template that has placeholders for the dump of the raw user information, as well as the user consents. 

There is also a link for the user to update their information on FusionAuth, using the custom self-service form created earlier. To update the value for `<YOUR_FUSIONAUTH_ACCOUNT_LINK>`, navigate to Applications in FusionAuth. Click the "View" button next to your application, and scroll down to the "Account URL" value. Copy the url, and replace `<YOUR_FUSIONAUTH_ACCOUNT_LINK>` in the code above with it.

Now, we need to secure the route to this profile page to users that are authenticated. To help with that, we'll use the [`connect-ensure-login`](https://github.com/jaredhanson/connect-ensure-login) middleware we installed earlier. Update the `users` route in the `app.js` file from:

```js
app.use('/users', usersRouter);
```

to:

```js
app.use('/users', ensureLoggedIn('/login'), usersRouter);
```

The `ensureLoggedIn` middleware checks if the user is authenticated before proceeding to the router (or following middleware). It redirects to the `login` page if the user is not logged in.

## Testing

We are done with the coding. Type `npm start` at the console to start up the server. Then navigate to `localhost:3000`, preferably in a private tab. This ensures that your main admin login to FusionAuth is not a confounding factor while logging in.  

You should see the main page looking something like this:

{% include _image.liquid src="/assets/img/blogs/consents-app/not-logged-in.png" alt="The main page when logged out" class="img-fluid" figure=false %}

Clicking on "Login Here" should redirect you to your FusionAuth installation.

{% include _image.liquid src="/assets/img/blogs/consents-app/login-page.png" alt="The FusionAuth login page" class="img-fluid" figure=false %}

Clicking the "Create an account" link should render the custom registraton form configured earlier. Notice that it has 3 steps:

{% include _image.liquid src="/assets/img/blogs/consents-app/registration-steps.png" alt="The custom registration page, with multiple steps" class="img-fluid" figure=false %}

Enter all the information, and click "Register" at the end of the steps. You should then be redirected back to your Express app, with a new message on the home page:

{% include _image.liquid src="/assets/img/blogs/consents-app/logged-in.png" alt="The root page message for logged in users" class="img-fluid" figure=false %}

Clicking on the "profile page" link should take you to `users/me`, showing 2 JSON objects representing your profile on FusionAuth, along with the raw data from the consents API. Notice in each consent that there is a property `status`. This will be either `active` or `revoked`. You can use these values when checking to send information to the user through each channel. 

{% include _image.liquid src="/assets/img/blogs/consents-app/users-me.png" alt="The users/me page showing the user's FusionAuth profile" class="img-fluid" figure=false %}

Clicking the "profile page" link will redirect to FusionAuth, where the user can view and update their information and consent permissions via the self-service form created earlier. Once navigated to the FusionAuth hosted profile page, clicking on the "Edit" pencil icon button in the top right will allow the user to update their profile. 



## Where to next with Express and FusionAuth?

That’s the basics of our Express + FusionAuth app done. The app has a fully featured authentication system, along with user consents, without the hassle and possible risks of implementing all of that code ourselves. The complete code is hosted on GitHub [here](https://github.com/fusionauth/fusionauth-example-express-consents).

Of course, you would need to add more interesting features to this app for it to be useful. But being able to take care of the authentication, consents, and general security with just a small amount of configuration code leaves a lot more time for your application's more useful and critical features.

For a production environment, you would also need to do a bit more work in making sure FusionAuth was really safe. In our example, we used the default password provided with Docker for our database, left debug mode on, and ran FusionAuth locally, co-hosted with our Express application. For a safer setup, you would run FusionAuth on its own infrastructure, physically separate from the Express app, and take more care around production configuration and deployment. FusionAuth gives you all of the tools to do this easily.
