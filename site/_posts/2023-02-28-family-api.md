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

For extra security, you can restrict the permissions for the key. For our app, we only need to enable the get action for `api/user`, the get and post actions for `api/user/consent`, and the get, post, and put actions for `/api/user/family`. This will let the key get basic user information, modify permissions to view the app, create a family and assign users to it. If you leave the key with no explicitly assigned permissions, it will be an all-powerful key that can control all aspects of your FusionAuth app. You should avoid doing this!

{% include _image.liquid src="/assets/img/blogs/family-api/family-api-api-key.png" alt="Limiting the scope of the created API key." class="img-fluid" figure=false %}

## Creating and registering users

The application will have two users: a "child" user who will request access to the site and a "parent" user who can grant or revoke the child user's permission at any time. 

Let's create the parent user first. Navigate to `Users` and click the `Add` button. Select a tenant and supply an email address. Untoggle the `Send email to set up password` switch to directly supply a password. For display purposes, provide a `First Name`. By default, a user must be at least 21 years old in order to be designated as a family owner, so supply an appropriate `Birthdate` as well. This requirement can be modified in the [tenant configuration](https://fusionauth.io/docs/v1/tech/core-concepts/tenants#family).

{% include _image.liquid src="/assets/img/blogs/family-api/family-api-parent-user.png" alt="Creating the parent user." class="img-fluid" figure=false %}

Repeat this process for the child user. By default, the child user's `Birthdate` can be anything or left blank. Record the `User Id` of both users, as you will need them when adding the users to a family.

{% include _image.liquid src="/assets/img/blogs/family-api/family-api-user-id.png" alt="The unique Id of the created user" class="img-fluid" figure=false %}

Then, register both users to the application. Click the `Manage` button for each user and click the `Add registration` button. Select the application from the dropdown. You do not need to supply a username or any other information in order to register a user.

{% include _image.liquid src="/assets/img/blogs/family-api/family-api-registration-select-application.png" alt="Selecting the application to register a user to." class="img-fluid" figure=false %}

## Adding users to a family

Now that you've created your two users and registered them to your application, you can assign both users to their appropriate family roles via the [Family API](https://fusionauth.io/docs/v1/tech/apis/families). Execute the following command in your terminal.

```sh
curl -X POST <YOUR_FUSIONAUTH_URL>/api/user/family \
-H "Authorization: <YOUR_API_KEY>" \
-H "Content-Type: application/json" \
-d '{
  "familyMember" : {
    "userId": "<PARENT_USER_ID>",
    "owner": true,
    "role": "Adult"
  }	
}'
```

Here, `<YOUR_FUSIONAUTH_URL>` is your fully-qualified domain name, including the protocol, for example `https://local.fusionauth.io`, `<YOUR_API_KEY>` is the key that you created in the `Setting up a FusionAuth API key` section, and `<PARENT_USER_ID>` is the `User Id` of the parent user that you just recorded. Record the `Id` value in the response JSON that is returned upon executing the request. You will need it to add the child user to this family.

The request to add the child user to the family is similar, but has a few key differences. First, since the family already exists, you will use a `PUT` request rather than a `POST` request. Second, you need to supply the unique Id for the family in the request's URL. Finally, the `owner` and `role` values will be different.

Execute the following command in your terminal.

```sh
curl -X PUT <YOUR_FUSIONAUTH_URL>/api/user/family/<YOUR_FAMILY_ID> \
-H "Authorization: <YOUR_API_KEY>" \
-H "Content-Type: application/json" \
-d '{
  "familyMember" : {
    "userId": "<CHILD_USER_ID>",
    "owner": false,
    "role": "Child"
  }	
}'
```

## Creating a consent

You are almost ready to build your custom application and leverage your FusionAuth configuration to enable permission-based access to your site. Now, you just have to add a [consent](https://fusionauth.io/docs/v1/tech/apis/consents#overview), which will enable the parent user to grant or revoke access to the child user. 

Navigate to `Settings -> Consents` and click the `Add` button. Supply a name for the consent. By default, the minimum age of self-consent is 13, meaning any user aged 13 or older can access the site without needing permission from a parent user. You can modify this value if you wish. For the purposes of this guide, just make sure this number is higher than the age of your child user. If you did not supply a `Birthdate` for your child user, you can leave this value as-is, since a blank `Birthdate` will cause a user's age to be stored as -1.

{% include _image.liquid src="/assets/img/blogs/family-api/family-api-add-consent.png" alt="Creating the consent" class="img-fluid" figure=false %}

## Setting up Express

Your FusionAuth configuration is now ready to go, and you can start building your application using Express. 

To get started, you should:
-   Scaffold a new Express application.
-   Install the scaffolded dependencies.
-   Install the helper libraries, and the FusionAuth Typescript client.
-   Start the server to ensure everything is installed and working.

Here are the commands to do it:

```bash
npx express-generator --view=pug fusionauth-example-family
cd fusionauth-example-family
npm install
npm install @fusionauth/typescript-client pkce-challenge express-session
npm start
```

If all went well, the server should start successfully and you can visit `http://localhost:3000`.

{% include _image.liquid src="/assets/img/blogs/family-api/family-api-express-server.png" alt="Express app default home page" class="img-fluid" figure=false %}

## Building the application

Our application will have only two pages apart from the FusionAuth login page: a landing page that will redirect the user to the FusionAuth login page, and a home page from which a parent user can grant or revoke permission for the child user to view the page.

For the landing page, add the following to `views/index.pug`. 

```js
extends layout

block content
  h1= title
  p Welcome to #{title}

  - var clientId = '<YOUR_CLIENT_ID>'
  if user
    p Hello #{user.firstName}
    if family
      - var self = family.filter(elem => elem.id == user.id)[0]
      - family = family.filter(elem => elem.id != user.id)
      if family.length > 0
        p Confirmed children
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
    if self.status == "Active"
      h2 Restricted Section
      p This is a restricted section. Only authorized users can view it.
  else
    a(href='<YOUR_FUSIONAUTH_URL>/oauth2/authorize?client_id='+clientId+'&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth-redirect&scope=offline_access&code_challenge='+challenge+'&code_challenge_method=S256') Login
```

Replace `<YOUR_CLIENT_ID>` with the Id of your FusionAuth application and `<YOUR_FUSIONAUTH_URL>` with the fully-qualified URL of your FusionAuth instance, including the protocol. For example, `<YOUR_CLIENT_ID>` might look like `7d31ada6-27b4-461e-bf8a-f642aacf5775` and `<YOUR_FUSIONAUTH_URL>` might look like `https://local.fusionauth.io`.

You can use the `express-session` middleware package to facilitate the storage and usage of session information in your app. In the `app.js` file, add the following line at the top:

```js
var expressSession = require('express-session');
```

To use the package, add the following line under `app.use(cookieParser());`:

```js
app.use(expressSession({resave: false, saveUninitialized: false, secret: 'fusionauth-node-example'}));
```

At this point, your application has a `Login` link that will redirect you to the FusionAuth login page, but it does not yet have the necessary information to complete the login. To do this, you need to add a route.

# Adding Express routes

You've got the basic framework and authorization code set up. Now you can add some routes. You can start with the `login` route to handle the redirect to FusionAuth.

First, you can define your dependencies. In the `routes/index.js` file, add the following code under the `var router = express.Router();` line:

```js
const pkceChallenge = require('pkce-challenge').default;
const {FusionAuthClient} = require('@fusionauth/typescript-client');
const clientId = '<YOUR_CLIENT_ID>';
const clientSecret = '<YOUR_CLIENT_SECRET>';
const client = new FusionAuthClient('<YOUR_API_KEY>', '<YOUR_FUSIONAUTH_URL>');
const consentId = '<YOUR_CONSENT_ID>';
```

The `pkceChallenge` package enables your application to utilize a Proof Key for Code Exchange (PKCE), which ensures that every step of the authorization flow is handled by FusionAuth and not a malicious actor. Here, you are also importing the FusionAuth TypeScript client as well as several parameters that allow your application to communicate with your FusionAuth configuration. `<YOUR_CLIENT_ID>` and `<YOUR_CLIENT_SECRET>` can be found in FusionAuth under `Applications -> Your Application`. In a production environment, you should use environment variables here to prevent your client secret from leaking. `<YOUR_API_KEY>` can be found under `Settings -> API Keys` and `<YOUR_CONSENT_ID>` can be found under `Settings -> Consents`. 

Now, in the `GET home page` section, replace the `res.render('index', { title: 'Express' });` line with the following:

```js
    let family = [];
    //generate the pkce challenge/verifier dict
    pkce_pair = pkceChallenge();
    req.session.verifier = pkce_pair['code_verifier']
    req.session.challenge = pkce_pair['code_challenge']
    if (req.session.user && req.session.user.id) {

        // build our family object for display
        client.retrieveFamilies(req.session.user.id)
            .then((response) => {
                if (response.response.families && response.response.families.length >= 1) {
                    // adults can only belong to one family
                    let children = response.response.families[0].members.filter(elem => elem.role != 'Adult');
                    //include current user in children list
                    children = children.concat(response.response.families[0].members.filter(elem => elem.userId == req.session.user.id))
                    let getUsers = children.map(elem => {
                        return client.retrieveUser(elem.userId);
                    });
                    Promise.all(getUsers).then((users) => {
                        users.forEach(user => {
                            family.push({"id": user.response.user.id, "email": user.response.user.email});
                        });
                    }).then(() => {
                        let getUserConsentStatuses = children.map(elem => {
                            return client.retrieveUserConsents(elem.userId);
                        });
                        return Promise.all(getUserConsentStatuses);
                    }).then((consentsResponseArray) => {
                        // for each child, we'll want to get the status of the consent matching our consentId and put that in the family object, for that child.
                        const userIdToStatus = {};
                        const userIdToUserConsentId = {};
                        consentsResponseArray.forEach((oneRes) => {
                            const matchingConsent = oneRes.response.userConsents.filter((userConsent) => userConsent.consent.id == consentId)[0];
                            if (matchingConsent) {
                                const userId = matchingConsent.userId;
                                userIdToUserConsentId[userId] = matchingConsent.id;
                                userIdToStatus[userId] = matchingConsent.status;
                            }
                        });
                        family = family.map((onePerson) => {
                            onePerson["status"] = userIdToStatus[onePerson.id];
                            onePerson["userConsentId"] = userIdToUserConsentId[onePerson.id];
                            return onePerson;
                        });
                        //}).then(() => {
                        res.render('index', {
                            family: family,
                            user: req.session.user,
                            title: 'Family Example',
                            challenge: pkce_pair['code_challenge']
                        });
                    });
                } else {
                    res.render('index', {family: family, user: req.session.user, title: 'Family Example', challenge: pkce_pair['code_challenge']});
                }
            }).catch((err) => {
            console.log("in error");
            console.error(JSON.stringify(err));
        });
    } else {
        res.render('index', {family: family, user: req.session.user, title: 'Family Example', challenge: pkce_pair['code_challenge']});
    }
```

Quite a lot seems to be happening here, but for now just understand that you are setting up all of the information required by FusionAuth for a successful login. Now, you can make sure that information is correctly applied upon hitting the `Login` button by adding the following code at the end of the file, right before the `module.exports = router;` line:

```js
/* OAuth return from FusionAuth */
router.get('/oauth-redirect', function (req, res, next) {
    // This code stores the user in a server-side session
    client.exchangeOAuthCodeForAccessTokenUsingPKCE(req.query.code,
        clientId,
        clientSecret,
        'http://localhost:3000/oauth-redirect',
        req.session.verifier)
        .then((response) => {
            req.session.state = req.query.state;
            return client.retrieveUserUsingJWT(response.response.access_token);
        })
        .then((response) => {
            req.session.user = response.response.user;
        })
        .then((response) => {
            if (req.session.state == "confirm-child-list") {
                res.redirect(302, '/confirm-child-list');
                return
            }
            res.redirect(302, '/');

        }).catch((err) => {
        console.log("in error");
        console.error(JSON.stringify(err));
    });

});
```

The last piece of the puzzle is to handle the granting and revocation of consent by the parent user for the child user to access the site. Add the following code underneath what you just added.

```js
/* Change consent */
router.post('/change-consent-status', function (req, res, next) {
    if (!req.session.user) {
        // force signin
        res.redirect(302, '/');
    }

    const userConsentId = req.body.userConsentId;
    let desiredStatus = req.body.desiredStatus;
    if (desiredStatus != 'Active') {
        desiredStatus = 'Revoked';
    }

    if (!userConsentId) {
        console.log("No userConsentId provided!");
        res.redirect(302, '/');
    }

    const patchBody = {userConsent: {status: desiredStatus}};
    client.patchUserConsent(userConsentId, patchBody)
        .then((response) => {
            res.redirect(302, '/');
        }).catch((err) => {
        console.log("in error");
        console.error(JSON.stringify(err));
    });
});
```

## Testing

We are done with the coding. Type `npm start` at the console to start up the server. Then navigate to `localhost:3000` in a private window. This ensures that your main admin login to FusionAuth is not a confounding factor while logging in.  

You should see the landing page looking something like this:

{% include _image.liquid src="/assets/img/blogs/family-api/family-api-testing-landing-page.png" alt="The main page when logged out" class="img-fluid" figure=false %}

Clicking on "Login" should redirect you to your FusionAuth installation.

{% include _image.liquid src="/assets/img/blogs/consents-app/login-page.png" alt="The FusionAuth login page" class="img-fluid" figure=false %}

First, login as the child user. You should see a very simple home page with no restricted information.

{% include _image.liquid src="/assets/img/blogs/family-api/family-api-testing-child-revoked.png" alt="The child user logs in but cannot see any restricted information" class="img-fluid" figure=false %}

Close the private window and open a new one. Repeat the steps above, this time signing in as the parent user. You should see an option to grant the child user consent to view the restricted section.

{% include _image.liquid src="/assets/img/blogs/family-api/family-api-testing-grant-consent.png" alt="The parent user logs in and can grant or revoke consent for the child user" class="img-fluid" figure=false %}

Close the private window and open a new one. Login as the child user again. This time, the restricted section should appear.

{% include _image.liquid src="/assets/img/blogs/family-api/family-api-testing-child-granted.png" alt="The child user logs in and can see the restricted section" class="img-fluid" figure=false %}

## Where to next with Express and FusionAuth?

That’s the basics of our Express + FusionAuth app done. The app has a fully featured authentication system, along with user consents, without the hassle and possible risks of implementing all of that code ourselves. The complete code is hosted on GitHub [here](<todo>).

Of course, you would need to add more interesting features to this app for it to be useful. But being able to take care of the authentication, consents, and general security with just a small amount of configuration code leaves a lot more time for your application's more useful and critical features.

For a production environment, you would also need to do a bit more work in making sure FusionAuth was really safe. In our example, we used the default password provided with Docker for our database, left debug mode on, and ran FusionAuth locally, co-hosted with our Express application. For a safer setup, you would run FusionAuth on its own infrastructure, physically separate from the Express app, and take more care around production configuration and deployment. FusionAuth gives you all of the tools to do this easily.
