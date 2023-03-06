---
layout: blog-post
title: Using the Family API
description: Using the Family API to control access
author: Dean Rodman
category: blog
tags: client-node tutorial tutorial-express tutorial-node
excerpt_separator: "<!--more-->"
---

In this tutorial, we'll build a basic Node.js + [Express](http://expressjs.com) web application which grants conditional access to users in a family structure. Specifically, a parent user will be able to grant access to child users to restricted areas of an application.  

<!--more-->

The application itself is very simple: it will let users sign up via FusionAuth, allow them to set grant consent for children in their family to access certain features of an application, and allow them to update those consents at any time. With these basics in place, you'll see how FusionAuth works and how it can extend the application to do whatever you need. You can also [skip ahead and view the code](https://github.com/ritza-co/fusionauth-family-api-example/tree/main/app). Note that there is configuration of FusionAuth needed, as detailed in this guide, so you will need to complete that before running the code.

You can also use [these kickstart files](https://github.com/ritza-co/fusionauth-family-api-example/tree/main/kickstart) to automatically handle the configuration of FusionAuth. You can find more information regarding kickstart files [here](https://fusionauth.io/docs/v1/tech/installation-guide/docker#kickstart)

## Prerequisites

We'll explain nearly everything that we use, but we expect you to have:

- Basic Node.js knowledge and a Node.js environment set up.
- Preferably basic [Express](http://expressjs.com) knowledge (or knowledge of a similar web framework, or of the middleware concept).
- Docker and Docker Compose set up as we'll set up FusionAuth using these.

It'll also help if you know the basics of OAuth or authentication in general.

## Installing and configuring FusionAuth with Docker Compose

There are [various ways](/docs/v1/tech/installation-guide/fusionauth-app) to install FusionAuth depending on your system, but the easiest way is to use Docker and Docker Compose. Instructions are [here](/docs/v1/tech/installation-guide/docker). Currently, to install and run FusionAuth you would run (again, assuming you have Docker installed) the following commands:

```bash
curl -o docker-compose.yml https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/docker-compose.yml
curl -o .env https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/.env
docker-compose up
```

Note that this uses a public `.env` file containing hard-coded database passwords and is not suitable for production use.

### Configuring FusionAuth

FusionAuth should now be running and reachable at `http://localhost:9011`, if you've installed it locally. The first time you visit, you'll be prompted to set up an admin user and password. Once you've done this, you'll be prompted to complete three more setup steps, as shown below.

{% include _image.liquid src="/assets/img/blogs/family-api/family-api-initial-setup.png" alt="FusionAuth prompts us with the setup steps that we need to complete." class="img-fluid" figure=false %}

We'll skip step **#3** in this tutorial, but sending emails (to verify email addresses and do password resets) is a vital part of FusionAuth running in production, so you'll want to do that when you go live.

### Creating an application

Click "Setup" under "Missing Application" and call your new app "Family-Api-App", or another name of your choice. It'll get a "Client Id" and "Client Secret" automatically - save these, as we'll use them in the code. Later, we'll set up a Node.js + Express application which will run on `http://localhost:3000`, so configure the Authorized URLs accordingly. You should add:

- `http://localhost:3000/oauth-redirect` to the "Authorized redirect URLs".
- `http://localhost:3000/` to the "Authorized request origin URLs".
- `http://localhost:3000/logout` to the "Logout URL".

Make sure that "PKCE" is set to `Required.` Proof Key for Code Exchange (PKCE) was originally intended for public clients like native mobile or desktop apps that couldn’t safely store a client secret. Now it is recommended even on confidential clients like web apps where the client secret is under secure control to protect against authorization code injection attacks. Your application should look like this:
  
{% include _image.liquid src="/assets/img/blogs/family-api/family-api-create-application.png" alt="Configuring the application URLs in FusionAuth." class="img-fluid" figure=false %}

Click the "Save" button at the top right, for your changes to take effect.

## Setting up a FusionAuth API key

Once the user has logged in via the FusionAuth application, we can retrieve their profile, consents, and family information from FusionAuth using the [FusionAuth Typescript module](https://www.npmjs.com/package/@fusionauth/typescript-client), provided with an API key.

Navigate to "Settings" and then "API Keys", then add a key. Add a name for the key and take note of the generated key value.

Following the principle of least privilege, you can restrict the permissions for the key. For our app, we only need to enable the `GET` action for `api/user`, the `GET` and `PATCH` actions for `api/user/consent`, and the `GET`, `POST`, and `PUT` actions for `/api/user/family`. This will let the key get basic user information, grant or revoke consents to view the app, create a family and assign users to it. If you leave the key with no explicitly assigned permissions, it will be an all-powerful key that can control all aspects of your FusionAuth app. You should avoid doing this!

{% include _image.liquid src="/assets/img/blogs/family-api/family-api-api-key.png" alt="Limiting the scope of the created API key." class="img-fluid" figure=false %}

## Creating and registering users

The application will have two users: a parent user and a child user. The parent user will be able to grant consent for the child user to access certain features of the application.

Let's create the parent user first. Navigate to "Users" and click the "Add" button. Select a "Tenant" and supply an email address. Untoggle the "Send email to set up password" switch to directly supply a password. For display purposes, provide a "First Name". By default, a user must be at least 21 years old in order to be designated as a family owner, so supply an appropriate "Birthdate" as well. This requirement can be modified in the [tenant configuration](https://fusionauth.io/docs/v1/tech/core-concepts/tenants#family).

{% include _image.liquid src="/assets/img/blogs/family-api/family-api-parent-user.png" alt="Creating the parent user." class="img-fluid" figure=false %}

Repeat this process for the child user. By default, the child user's "Birthdate" can be anything or left blank. Record the "User Id" of both users, as you will need them when adding the users to a family.

{% include _image.liquid src="/assets/img/blogs/family-api/family-api-user-id.png" alt="The unique Id of the created user" class="img-fluid" figure=false %}

Then, register both users to the application. Click the "Manage" button for each user and click the "Add registration" button. Select the application from the dropdown. You can leave out the other information.

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

Here, `<YOUR_FUSIONAUTH_URL>` is your fully-qualified domain name, including the protocol, for example `https://local.fusionauth.io`. `<YOUR_API_KEY>` is the key that you created in the "Setting up a FusionAuth API key" section, and `<PARENT_USER_ID>` is the "User Id" of the parent user that you just recorded. Record the `Id` value in the response JSON that is returned upon executing the request. This is the Id of the newly created family in FusionAuth. You will need the Id to add the child user to this family.

The request to add the child user to the family is similar, but has a few key differences. First, since the family already exists, you will use a `PUT` request rather than a `POST` request. Second, you need to supply the unique Id for the family `<YOUR_FAMILY_ID>` in the request's URL and you also need to supply the child `<CHILD_USER_ID>` which is "User Id" of the child noted earlier. Finally, the `owner` and `role` values will be different.

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

Navigate to "Settings" then "Consents" and click the "Add" button. Supply a "Name" for the consent. By default, the minimum age of self-consent is `13`, meaning any user aged `13` or older can access the site without needing permission from a parent user. You can modify this value if you wish. For the purposes of this guide, just make sure this number is higher than the age of your child user. If you did not supply a "Birthdate" for your child user, you can leave this value as-is, since a blank "Birthdate" will cause a user's age to be stored as `-1`.

{% include _image.liquid src="/assets/img/blogs/family-api/family-api-add-consent.png" alt="Creating the consent" class="img-fluid" figure=false %}

## Setting up Express

Your FusionAuth configuration is now ready to go, and you can start building your application using Express.

To get started, you should:

- Scaffold a new Express application.
- Install the scaffolded dependencies.
- Install the helper libraries, and the FusionAuth Typescript client.
- Start the server to ensure everything is installed and working.

Here are the commands to perform the above steps:

```bash
npx express-generator --view=pug fusionauth-example-family
cd fusionauth-example-family
npm install
npm install @fusionauth/typescript-client pkce-challenge express-session
npm start
```

If all went well, the server should start successfully, and you can visit `http://localhost:3000`.

{% include _image.liquid src="/assets/img/blogs/family-api/family-api-express-server.png" alt="Express app default home page" class="img-fluid" figure=false %}

## Building the application

The application will have only one page apart from the FusionAuth login page. This page will dynamically display a list of children if the current user is a parent user, and a restricted section if the current user is either an adult or a child who has been granted permission to view it by a parent user. It will also have a login link that will redirect the user to the FusionAuth login page if they are not authenticated.

For the landing page view, add the following to `views/index.pug`.

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
      if family.length > 0 && self.role == "Adult"
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
      p This is a restricted section. Only authorised users can view it.
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

At this point, your application has a `Login` link that will redirect you to the FusionAuth login page, but it does not yet have the necessary callback route to complete the login. The page also references view models, which will be created next.

## Creating Express Routes

There are 3 main routes needed:

1. The home page route, which will also create and populate the view models referenced in the view created above.
2. The OAuth callback route, which FusionAuth will call after a successful login.
3. A route to update the consent of the chosen child.

First, include the dependencies and credentials needed by all routes. In the `routes/index.js` file, add the following code under the `var router = express.Router();` line:

```js
const pkceChallenge = require('pkce-challenge').default;
const {FusionAuthClient} = require('@fusionauth/typescript-client');
const clientId = '<YOUR_CLIENT_ID>';
const clientSecret = '<YOUR_CLIENT_SECRET>';
const client = new FusionAuthClient('<YOUR_API_KEY>', '<YOUR_FUSIONAUTH_URL>');
const consentId = '<YOUR_CONSENT_ID>';
```

The `pkceChallenge` package enables your application to utilize a Proof Key for Code Exchange (PKCE). PKCE is a security layer that sits on top of the Authorization Code grant to ensure that authorization codes can’t be stolen or reused. Here, you are also importing the [FusionAuth TypeScript client](https://fusionauth.io/docs/v1/tech/client-libraries/typescript) as well as several parameters that allow your application to communicate with your FusionAuth configuration. `<YOUR_CLIENT_ID>` and `<YOUR_CLIENT_SECRET>` can be found in FusionAuth under "Applications" then "Your Application". In a production environment, you should use environment variables here to prevent your client secret from leaking. `<YOUR_API_KEY>` can be found under "Settings" then "API Keys" and `<YOUR_CONSENT_ID>` can be found under "Settings" then "Consents".

## Adding the OAuth Callback Route

After authentication, FusionAuth will redirect to the callback route we provided in the login link to FusionAuth, as well as in the authorized callback route set in the FusionAuth application earlier. We can add this route now. Add the following route to the `routes/index.js` file.

```js
router.get('/oauth-redirect', async function (req, res, next) {
    try {
        const response = await client.exchangeOAuthCodeForAccessTokenUsingPKCE(
            req.query.code,
            clientId,
            clientSecret,
            'http://localhost:3000/oauth-redirect',
            req.session.verifier
        );

        req.session.state = req.query.state;

        const userResponse = await client.retrieveUserUsingJWT(
            response.response.access_token
        );

        req.session.user = userResponse.response.user;

        res.redirect(302, '/');
    } catch (err) {
        console.log('in error');
        console.error(JSON.stringify(err));
    }
});
```

This route exchanges the `Authentication Code` returned from FusionAuth, along with PKCE verifier code, for a JWT, which is then used to get the user profile of the authenticated user. The user profile is then added to the session, and the client redirected back to the home page.

## Add Home Route

The Home route has a bit of logic needed. Essentially, what we need to do is:

1. Get the family of the logged in user.
2. Find all the child members of the family.
3. Get the family role of the logged in user.
4. Get all the UserConsents of the family members.
5. Join the UserConsents with the profiles.
6. Display the child profiles, along with their consents.

Since this is a lot of logic, the route will call out to helper functions to gather all the information.

In the `index.js` file replace the route which renders the home page `router.get('/', function(req, res, next)` with the following:

```js
router.get('/', async function (req, res, next) {
    try {
        let familyProfiles = [];
        const pkce_pair = pkceChallenge();
        req.session.verifier = pkce_pair['code_verifier'];
        req.session.challenge = pkce_pair['code_challenge'];
        if (req.session.user && req.session.user.id) {
            const response = await client.retrieveFamilies(req.session.user.id);
            if (response.response.families && response.response.families.length >= 1) {
                let familyMembers = response.response.families[0].members.filter(elem => elem.role !== 'Adult' || elem.userId === req.session.user.id);
                const userProfiles = await getUserProfiles(familyMembers);
                userProfiles.forEach(user => {
                    let self = familyMembers.filter(elem => elem.userId == user.response.user.id)[0];
                    user.response.user.role = self.role;
                });
                familyProfiles = buildFamilyArray(userProfiles);
                const consentsResponseArray = await getUserConsentStatuses(familyMembers);
                familyProfiles = updateFamilyWithConsentStatus(familyProfiles, consentsResponseArray);
            }
        }
        res.render('index', {
            family: familyProfiles,
            user: req.session.user,
            title: 'Family Example',
            challenge: pkce_pair['code_challenge']
        });
    } catch (error) {
        console.error("in error");
        console.error(JSON.stringify(error));
        next(error);
    }
});
```

The above code makes use of several named functions, which you now have to implement.  If anything goes wrong, the error text will be displayed in the console.

The `familyMembers` array is a filtered version of the entire family that only contains children, and the currently logged in adult. In other words, we remove any other adults from the family, as we won't need to set consents for them, but we do want to keep the family role information for the currently logged in adult. Note that, when building the `familyMembers` array, the filter criterion is `!== 'Adult'`, not `=== 'Child'` as you might expect. This is because FusionAuth also allows users to be designated as [`Teen`](https://fusionauth.io/docs/v1/tech/apis/families#add-a-user-to-a-family) to allow for further granularity when organizing consents, though that is outside the scope of this guide.

The first function to implement is `getUserProfiles()`, which gathers all user profiles in the family. This is needed because the [Family API call](https://fusionauth.io/docs/v1/tech/apis/families#retrieve-a-family) only returns a subset of each family member's information. We'd like to get the `usernames`/`emails` as well, which are available through the `client.retrieveUser` function.

```js
async function getUserProfiles(familyUsers) {
    const getUsers = familyUsers.map(elem => client.retrieveUser(elem.userId));
    const profiles = await Promise.all(getUsers);
    return profiles;
}
```

Next is `getUserConsentStatuses()`, which gathers information about each user's consent permissions.

```js
async function getUserConsentStatuses(users) {
    const getUserConsentStatuses = users.map(elem => client.retrieveUserConsents(elem.userId));
    const consentsResponseArray = await Promise.all(getUserConsentStatuses);
    return consentsResponseArray;
}
```

Each of the above two functions asynchronously processes the `familyMembers` array into new objects that contain key information. Now, you can implement the functions that make use of those objects.

First is `buildFamilyArray()`, which filters key information from the object returned from `getUserProfiles` to build a view model to display.

```js
function buildFamilyArray(users) {
  const family = [];
  users.forEach(user => {
    family.push({"id": user.response.user.id, "email": user.response.user.email, "role": user.response.user.role});
  });
  return family;
}
```

Next is `updateFamilyWithConsentStatus()`, which adds consent information to each element in the array returned from `buildFamilyArray()`. This data will then be pushed to the landing page so that it can dynamically display the information appropriate for the current user.

```js
function updateFamilyWithConsentStatus(family, consentsResponseArray) {
    const userIdToStatus = {};
    const userIdToUserConsentId = {};
    consentsResponseArray.forEach((consent) => {
        const matchingConsent = consent.response.userConsents.filter((userConsent) => userConsent.consent.id == consentId)[0];
        if (matchingConsent) {
            const userId = matchingConsent.userId;
            userIdToUserConsentId[userId] = matchingConsent.id;
            userIdToStatus[userId] = matchingConsent.status;
        }
    });
    return family.map((member) => {
        member["status"] = userIdToStatus[member.id];
        member["userConsentId"] = userIdToUserConsentId[member.id];
        return member;
    });
}
```

## Adding the Change Consent Route

The last piece of the puzzle is to handle the granting and revocation of consent by the adult user for the child user to access the site. Add the following route underneath the last one just added.

```js
/* Change consent */
router.post('/change-consent-status', async function (req, res, next) {
    if (!req.session.user) {
        // force signin
        res.redirect(302, '/');
    }
    const userConsentId = req.body.userConsentId;
    let desiredStatus = req.body.desiredStatus;
    if (desiredStatus != 'Active') {
        desiredStatus = 'Revoked';
    }

    // check current user is an adult
    const response = await client.retrieveFamilies(req.session.user.id);
    if (response.response.families && response.response.families.length >= 1) {
        let self = response.response.families[0].members.filter(elem => elem.userId == req.session.user.id)[0];
        if (self.role !== 'Adult') {
            res.send(403, 'Only Adult users can change consents');
        }
    }

    if (!userConsentId) {
        return res.send(400, 'No userConsentId provided!');
    }

    const patchBody = { userConsent: { status: desiredStatus } };
    try {
        const response = await client.patchUserConsent(userConsentId, patchBody);
        res.redirect(302, '/');
    } catch (err) {
        console.log('in error');
        console.error(JSON.stringify(err));
        next(err);
    }
});
```

## Testing

We are done with the coding. Type `npm start` at the console to start up the server. Then navigate to `http://localhost:3000` in a private window. This ensures that your main admin login to FusionAuth is not a confounding factor while logging in.  

You should see the landing page looking something like this:

{% include _image.liquid src="/assets/img/blogs/family-api/family-api-testing-landing-page.png" alt="The main page when logged out" class="img-fluid" figure=false %}

Clicking on "Login" should redirect you to your FusionAuth installation.

{% include _image.liquid src="/assets/img/blogs/family-api/login-page.png" alt="The FusionAuth login page" class="img-fluid" figure=false %}

First, login as the child user. You should see a very simple home page with no restricted information.

{% include _image.liquid src="/assets/img/blogs/family-api/family-api-testing-child-revoked.png" alt="The child user logs in but cannot see any restricted information" class="img-fluid" figure=false %}

Close the private window and open a new one. Repeat the steps above, this time signing in as the parent user. You should see an option to grant the child user consent to view the restricted section.

{% include _image.liquid src="/assets/img/blogs/family-api/family-api-testing-grant-consent.png" alt="The parent user logs in and can grant or revoke consent for the child user" class="img-fluid" figure=false %}

Close the private window and open a new one. Login as the child user again. This time, the restricted section should appear.

{% include _image.liquid src="/assets/img/blogs/family-api/family-api-testing-child-granted.png" alt="The child user logs in and can see the restricted section" class="img-fluid" figure=false %}

## Where to next with Family API and Consents?

That’s the basics of our Express Family API example app done. The app has a fully featured authentication system, along with parental controls, without the hassle and possible risks of implementing all of that code ourselves. The complete code is hosted on GitHub [here](https://github.com/ritza-co/fusionauth-family-api-example).

Of course, you would need to add more interesting features to this app for it to be useful. But being able to take care of the authentication, parental controls, consents, and general security with just a small amount of configuration code leaves a lot more time for your application's more useful and critical features.

For a production environment, you would also need to do a bit more work in making sure FusionAuth is secured. In our example, we used the default password provided with Docker for our database, left debug mode on, and ran FusionAuth locally, co-hosted with our Express application. For a safer setup, you would run FusionAuth on its own infrastructure, physically separate from the Express app, and take more care around production configuration and deployment. FusionAuth gives you all of the tools to do this easily.
