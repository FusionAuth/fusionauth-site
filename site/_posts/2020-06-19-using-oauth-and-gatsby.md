---
layout: blog-post
title: Using OAuth and PKCE to Add Authentication to Your Gatsby Site
description: 
author: Karl Hughes
image: blogs/golang-cli-device-grant/fusionauth-tutorial-building-a-cli-app-with-the-device-code-grant-and-golang.png
category: blog
tags: client-javascript
excerpt_separator: "<!--more-->"
---

Gatsby is one of the most popular JavaScript static site generators available. While static sites offer excellent performance, they only store state locally in the user's browser, so they can't provide features like user authentication natively. If you want to add authentication to your Gatsby site, FusionAuth is an excellent solution.

<!--more-->

In this blog post, you'll learn how to create a Gatsby site that uses FusionAuth to allow users to log in and access their profile securely. This application will use an [OAuth Authorization Code workflow and the PKCE extension](https://fusionauth.io/learn/expert-advice/oauth/definitive-guide-to-oauth-2#52-code-flow--pkce) to log users in and a Node application to store your access token securely. PKCE stands for Proof Key for Code Exchange, and is often pronounced PKCE.

At a high level, the authorization process looks like this:

{% plantuml source: _diagrams/blogs/gatsby/oauth-gatsby.plantuml, alt: "Diagram of the OAuth Authorization Code flow with PKCE extension using FusionAuth and Gatsby." %}

In this tutorial, you'll walk through the process step-by-step, but if you want to download the code, it is [available on Github](https://github.com/fusionauth/fusionauth-example-gatsby).

## What we'll cover
1. Setting up FusionAuth
2. Creating a new user
3. Creating a Node proxy application
4. Creating a Gatsby site
5. Conclusion and next steps

## What you'll need
- [FusionAuth](https://fusionauth.io/download)
- [Node JS](https://nodejs.org/en/) (10+ preferred)
- [npm](https://www.npmjs.com/) package manager
- Web browser

## Setting up FusionAuth
Before you start writing any code, download FusionAuth and get it running on your local machine. FusionAuth is available [for all major operating systems](https://fusionauth.io/download) or it can be [run in Docker](https://fusionauth.io/docs/v1/tech/installation-guide/docker).

Once you have FusionAuth running, log into the admin panel and create a new Application. This process [is outlined here](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide), but you'll need to add your application's URLs to the OAuth configuration:

- Add `http://localhost:9000/oauth-callback` to the "Authorized redirect URLs".
- Add `http://localhost:9000` to the "Authorized request origin URLs".
- Enter `http://localhost:8000` in the "Logout URL" field.

You'll also want to save the "Client Id" and "Client secret" values as you'll need them later.

{% include _image.liquid src="/assets/img/blogs/oauth-gatsby/application-setup.png" alt="FusionAuth configuration options for a Gatsby static site." class="img-fluid" figure=false %}

You'll also need to create an API key. Go to "Settings", then to "API Keys". You may create one with adminstrative privileges for the purposes of this tutorial. For a production application, please follow the principle of least privilege and limit the endpoints available to the key. Save the API key off as you'll need it later.

## Creating a new user
To test your Gatsby-based login, you'll need to add a new user and register them for your application in FusionAuth. From the Users page in FusionAuth, click "+" to add a user. Enter an email address and password for your new user and click the save button.

{% include _image.liquid src="/assets/img/blogs/oauth-gatsby/create-user.png" alt="Creating a new user in FusionAuth." class="img-fluid" figure=false %}

Next, click "Add registration" to link this user to the application you created in Step 1. Click the save button when you're finished.

{% include _image.liquid src="/assets/img/blogs/oauth-gatsby/register-user.png" alt="Registering a user in FusionAuth." class="img-fluid" figure=false %}

Now that a user is registered for your application, you can start building the Node app.

## Creating a Node proxy application
This project will use two separate applications: a Node app to securely store your access token and make calls to the FusionAuth API, and a Gatsby site to present information to the user. The Node app will have four endpoints: 

- `/login` - Generates the FusionAuth login URL with a PKCE challenge
- `/oauth-callback` - Trades the one-time authorization code and PKCE verifier for an access token which is added to session storage
- `/user` - Uses the access token and the FusionAuth `introspect` endpoint to get information about the current user
- `/logout` - Logs the user out and destroys the session

You'll create all the endpoints first, and then you'll see how to call them from Gatsby.

### Setting up the Node app
Before you get started, you need to create a new subdirectory and initialize an Express app. Use a [similar structure to the one outlined here](https://fusionauth.io/blog/2020/03/10/securely-implement-oauth-in-react):

```
fusionauth-gatsby
├─gatbsy
├─server
└─config.js
```

Your `config.js` file should contain all your FusionAuth information. Add the following to the file with your FusionAuth application's ID, client ID, and ports:

```
module.exports = {
  // FusionAuth info (copied from the FusionAuth admin panel)
  clientID: '5eb76e67-c65e-474d-ba23-4cb61b0c8414',
  clientSecret: 'BVS1NIgID3HWE5U38HYSb4DOie3UbIySOsJKLT41WWg',
  redirectURI: 'http://localhost:9000/oauth-callback',
  applicationID: '5eb76e67-c65e-474d-ba23-4cb61b0c8414',

  // Your FusionAuth api key
  apiKey: 'skAHV4mOEhz2zYQcG_5l4BkhsCzmtYTU8VGOi8Y40zo',

  // Ports
  clientPort: 8000,
  serverPort: 9000,
  fusionAuthPort: 9011
};
```

Within the `./server` directory, create a new [Express](https://expressjs.com/) app and install the [cors](https://www.npmjs.com/package/cors), [session](https://www.npmjs.com/package/express-session) and [request](https://www.npmjs.com/package/request) packages.

```bash
npm init
# Complete all the questions as appropriate
npm install express cors express-session request --save
```

Next, open up your `package.json` file and add a `"start"` script:

```package.json
...
"scripts": {
  "start": "node index.js"
},
...
```

Finally, create a new file in the `./server` directory called `index.js` that will initialize your Express app:

```index.js
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const config = require('../config');

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

// configure CORS
app.use(cors(
  {
    origin: true,
    credentials: true
  })
);

// use routes
app.use('/user', require('./routes/user'));
app.use('/login', require('./routes/login'));
app.use('/oauth-callback', require('./routes/oauth-callback'));
app.use('/logout', require('./routes/logout'));

// start server
app.listen(config.serverPort, () => console.log(`FusionAuth example app listening on port ${config.serverPort}.`));
```

In the following sections, you'll create the route files listed in the code above.

### Creating the login route
To generate a login URL, your application will need to create a PKCE verifier and challenge. It will send the challenge to FusionAuth via query string parameters along with your client ID and a redirect URL. 

Using PKCE adds an additional layer of security, as it is a one time use and guarantees that the Node application that generated the challenge is the same one that sent the verifier. Normally this PKCE is used where the client cannot keep a secret, such as a single page application. 

To generate a [PKCE challenge and verifier](https://www.oauth.com/oauth2-servers/pkce/), you'll need to use some of the [Node crypto functions](https://nodejs.org/api/crypto.html). Create a new folder in the `./server` directory called `helpers`. Add a new file called `pkce.js` to the folder. You will generate a verifier and challenge in this file:

```pkce.js
const crypto = require('crypto');

function base64URLEncode(str) {
  return str
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest()
}

module.exports.generateVerifier = () => {
  return base64URLEncode(crypto.randomBytes(32))
}

module.exports.generateChallenge = (verifier) => {
  return base64URLEncode(sha256(verifier))
}
```

The two exported functions, `generateVerifier` and `generateChallenge`, will be used in your login route to create a PKCE verifier. Create a new directory called `routes` in your `./server` directory and add a new file called `login.js` to it:

```login.js
const express = require('express');
const router = express.Router();
const config = require('../../config');
const pkce = require('../helpers/pkce');

router.get('/', (req, res) => {
  // Generate and store the PKCE verifier
  req.session.verifier = pkce.generateVerifier();

  // Generate the PKCE challenge
  const challenge = pkce.generateChallenge(req.session.verifier);

  // Redirect the user to log in via FusionAuth
  res.redirect(`http://localhost:${config.fusionAuthPort}/oauth2/authorize?`+
    `client_id=${config.clientID}&redirect_uri=${config.redirectURI}&response_type=code`+
    `&code_challenge=${challenge}&code_challenge_method=S256`);
});

module.exports = router;
```

Now when users visit `localhost:9000/login` the Node app will generate a PKCE verifier and challenge, save the verifier to session storage, and redirect the user to FusionAuth with the challenge in the URL. The FusionAuth app will store this challenge and make sure that the verifier sent in the OAuth callback is valid.

### Creating the OAuth callback
Once the user has entered their username and password, the FusionAuth server will check their credentials and redirect them to your Node app's OAuth callback endpoint with an authorization code. Your app will use that code and the PKCE verifier generated in the previous step to request a [long-lived access token](https://fusionauth.io/docs/v1/tech/oauth/tokens).

Again, adding PKCE adds another layer of security by proving that the entity which sent the challenge is now requesting an access token. Your Node app will store the access token returned by FusionAuth in session storage and redirect the user to the Gatsby profile page we'll create in the next step.

Create a new route called `oauth-callback.js` and add the following:

```oauth-callback.js
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
        'code_verifier': req.session.verifier,
        'grant_type': 'authorization_code',
        'redirect_uri': config.redirectURI
      }
    },

    // callback
    (error, response, body) => {
      // save token to session
      req.session.token = JSON.parse(body).access_token;

      // redirect to Gatsby
      res.redirect(`http://localhost:${config.clientPort}/profile`);
    }
  );
});

module.exports = router;
```

Your app now authenticates users and stores their access tokens in session storage. When you build the Gatsby application, you'll pass the session ID stored in a cookie to the Node app to access the current user endpoint.

Why not omit the Node application? Storing the access token in the browser is, in general, insecure. It's vulnerable to cross site scripting attacks. If you must store the access token in the browser, make sure it is stored as a `Secure` `HttpOnly` cookie. 

### Creating the current user route
FusionAuth includes an [`introspect` endpoint](https://fusionauth.io/docs/v1/tech/oauth/endpoints#introspect) that decodes the access token (represented by a JWT) and returns details about the current user. You will call this endpoint through your Node application by attaching the authorization token stored in the session.

Create a new route file called `user.js`:

```user.js
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

        // valid token -> get more user data and send it back to Gatsby
        if (introspectResponse.active) {
          request(
            // GET request to /registration endpoint
            {
              method: 'GET',
              uri: `http://localhost:${config.fusionAuthPort}/api/user/registration/`+
                `${introspectResponse.sub}/${config.applicationID}`,
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

Assuming the call is successful, this endpoint will return a decoded token object, which includes the current user's ID, email address, and authentication details. You will use this endpoint for the profile page in Gatsby.

### Creating the logout route
The last endpoint in your Node app allows users to log out. To fully log out of the application, you need to both destroy the Node application's session and redirect users to the FusionAuth [logout endpoint](https://fusionauth.io/docs/v1/tech/oauth/endpoints#logout).

Create a new route called `logout.js` and add the following:

```logout.js
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

Now that your server-side application is complete, you can test the login and logout flows.

Start the Node app using `npm start` and make sure FusionAuth is running locally. Visit `localhost:9000/login`, and you should be redirected to the FusionAuth login page. Log in, and you should be taken to the OAuth callback and then to `localhost:8000/profile`. That URL won't work (we'll create it in the Gatsby app next), but you should be able to go to `localhost:9000/logout` to end your session.

## Creating a Gatsby site
Now that you've set up FusionAuth and your server-side Node application, you are ready to create your new Gatsby site. The easiest way to get started is to install the Gatsby CLI:

```bash
npm install -g gatsby-cli
```

Once installed, you can create a new Gatsby site by running the following in your terminal in the root directory of your project:

```bash
gatsby new gatsby
```

There are other ways to set up and configure your Gatsby site, so be sure to read over [their documentation](https://www.gatsbyjs.org/docs/) to learn more.

### Creating the home page
The Gatsby site we create will include a home page and profile page. The home page will have a login link that takes the user to the Node app endpoint we created in the previous section.

Before you create the home page, create a new folder in the `./gatsby` directory called `helpers`. Add a new file within it called `auth.js`:

```
import config from "../../../config"

export const generateLoginUrl = () => {
  return `http://localhost:${config.serverPort}/login`
}
```

This function returns the login URL for your Node application. Next, update the `./gatbsy/src/pages/index.js` file to display a page title and login link:

```
import React from "react"
import Layout from "../components/layout"
import {
  generateLoginUrl,
} from '../helpers/auth';

const IndexPage = () => (
  <Layout>
    <h1>Home</h1>
    <p>
      <a href={generateLoginUrl()}>Login to get started</a>
    </p>
  </Layout>
)

export default IndexPage
```

To start your Gatsby app, navigate to the `./gatsby` directory in your terminal and run `gatsby develop`. Head over to `localhost:8000` in your browser where you should see a link to login.

{% include _image.liquid src="/assets/img/blogs/oauth-gatsby/gatsby-login-page.png" alt="A login link in Gatsby." class="img-fluid" figure=false %}

### Creating the profile page
The profile page will call the `/user` endpoint in your Node app and show users a logout link. Because this page is only available to authenticated users, you'll make it a [client-only route](https://www.gatsbyjs.org/docs/client-only-routes-and-user-authentication/). This prevents the page from being indexed in search engines or generated during static site generation.

First, open up the `gatsby-node.js` configuration file to create the client-only route. Add the following to the file:

```
// Client-only profile route
exports.onCreatePage = async ({ page, actions }) => {
  const { createPage } = actions
  if (page.path.match(/^\/profile/)) {
    page.matchPath = "/profile/*"
    createPage(page)
  }
}
```

Next, update the `helpers/auth.js` file created above. Add a new function called `generateLogoutUrl` that returns the Node app's logout endpoint:

```auth.js
...
export const generateLogoutUrl = () => {
  return `http://localhost:${config.serverPort}/logout`
}
```

And add another exported function called `getCurrentUser` which calls the Node app to get the current user from FusionAuth:

```auth.js
...
export const getCurrentUser = callback => {
  fetch(`http://localhost:${config.serverPort}/user`, {credentials: 'include'})
    .then(res => res.json())
    .then(data => {
      if (data && data.token) {
        callback(null, data.token)
      } else {
        throw new Error('Something went wrong and the user could not be found.')
      }
    })
    .catch(error => callback(error))
}
```

Finally, create a new page at `./gatsby/src/pages/profile.js`. Gatsby will automatically create a new route for any files in the `pages` directory. Open the new file and add the following:

```
import React from "react"
import Layout from "../components/layout"
import { generateLoginUrl, generateLogoutUrl, getCurrentUser } from '../helpers/auth';

class ProfilePage extends React.Component {
  state = {
    user: null,
  }

  componentDidMount() {
    getCurrentUser((error, user) => {
      if (!error && user) {
        this.setState({ user })
      } else {
        window.location.href = generateLoginUrl()
      }
    })
  }

  render() {
    return (
      <Layout>
        <h1>Profile</h1>
        {this.state.user ? (
          <p>You are currently logged in as {this.state.user.email}</p>
        ) : (
          ""
        )}
        <p>
          <a href={generateLogoutUrl()}>Logout</a>
        </p>
      </Layout>
    )
  }
}

export default ProfilePage
```

Your Gatsby application is now complete. In the final step, you'll test the entire login and logout flow.

### Testing the whole thing out
Start your FusionAuth server (if you haven't already) and your Node server using `npm start`. Navigate to your Gatsby app in the terminal and start it with `gatsby develop`. Visit `localhost:8000`. You should be able to:

- Get to the FusionAuth login page using the link on the Gatsby site's home page
- Be redirected to the profile page where your email address is shown
- Successfully log out by clicking the "Logout" button on your profile page

{% include _image.liquid src="/assets/img/blogs/oauth-gatsby/gatsby-profile-page.png" alt="The profile page in Gatsby." class="img-fluid" figure=false %}

You have now successfully implemented an OAuth authorization code workflow using the PKCE extension in Gatsby with FusionAuth. This method allows you to authenticate users securely without exposing your client secret or access token by proxying your calls to FusionAuth through your Node application.

## Conclusion and next steps
While I hope this tutorial helps you get started with user authentication using FusionAuth and Gatsby, there are several next steps you could take to make the application more robust:

- You could add user registration to allow users to self-register.
- You could use [higher order components](https://reactjs.org/docs/higher-order-components.html) to protect certain content or pages from unauthenticated users.
- You could use the access token saved in session storage to access another API.

If you have questions or need help integrating your FusionAuth application with Gatsby, feel free to leave a comment below.

