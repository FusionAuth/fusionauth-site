---
layout: blog-post
title: Step up authentication with JavaScript and FusionAuth
description: What is step up authentication and how can you use it to secure your app?
author: TODO
image: blogs/currentdesk-fusionauth/currentdesk-saved-thousands-of-dollars-by-choosing-fusionauth-header-image.png
category: blog
tags: client-javascript
excerpt_separator: "<!--more-->"
---

Broken authentication is the second most prevalent security risk for web applications according to the [OWASP Top 10](https://owasp.org/www-project-top-ten/). When it isn't implemented correctly, it leaves your app vulnerable to attacks that could leak highly sensitive information, like a user's banking information.


Since JavaScript is widely used on both the front-end and back-end, it's important to know how we handle security risks and some of the packages that are commonly used.


On the front-end, we do things like form validation and make sure we aren't storing any credentials or secret tokens in the code. On the back-end, we check for packages that have known vulnerabilities, do additional data validation, and handle user roles. Some packages that are widely used for security on the front-end and back-end include: [validatorjs](https://www.npmjs.com/package/validatorjs), [retirejs](https://retirejs.github.io/retire.js/), [helmetjs](https://helmetjs.github.io/), and [csrf](https://www.npmjs.com/package/csurf).

## OAuth methods

Once you've protected your app against some of the easier to handle attacks, you can focus your attention on your authentication flow. There are a couple kinds of OAuth grants that can help you guard your app from attackers gaining access to user information through their login credentials.

### Authorization Code Grant

This is the most secure way to implement OAuth. This grant type is used to exchange an authorization code from the front-end to get an access token from the back-end. After the user returns to the web app using a defined redirect URL, the app will get the authorization code from the redirect URL and use it to request an access token. If the authorization code is verified, then the user will be authenticated and have access to the application.

### PKCE

PKCE (short for Proof Key for Code Exchange) is an extension to the Authorization Code grant described earlier. This was originally designed to protect mobile apps, but it can also prevent authorization code injection. It works by creating a secret on the client and then using the secret again when we exchange the authorization code for the access token.

### Warning about the Implicit Grant

You might hear about the Implicit Grant because it's convenient to use when working with JAMStack apps, but it has been deprecated because it leaves a huge security vulnerability open. Instead of redirecting back to the app from the server with an authorization code, it puts the access token right in the URL as part of the redirect.

Don't implement this grant no matter how much time it might save. All a third party app would have to do is steal the access token from a user's URL to gain access to protected resources.

Now that the OAuth grants have been briefly covered, let's discuss step-up authentication.

## Background on step-up authentication

One of the best defenses we have against attacks against authentication is adding multiple layers to our authentication process. Multi-factor authentication (MFA) is a commonly used process. With MFA, an application requires more than one factor to prove a user is who they say they are. These additional factors could be a code, biometric proof, or other means. For more about MFA, check out TODO link to MFA expert advice TODO.

Step-up authentication is another option that can add defense in depth. Step-up is a good compromise between users being able to quickly authenticate and limiting access to sensitive data. It uses a set of dynamic rules to determine when a user should need further authentication to access private resources. 

In many cases, users want to access data that is less sensitive regularly. To continuously authenticate using multiple factors would be a roadblock for them.

When implemented correctly, step-up adds extra security to make it more difficult for attackers to access more privileged functionality. The tricky part is when step-up isn't implemented the right way. This can lead to adding friction to the app for users or potentially giving away more access than intended. Step-up is a practical choice for apps for which always requiring MFA for access doesn't make sense or for those that need more security. 

For example, if someone logs into their bank app, they can check their balance by logging in. When they want to do more than check that balance, the app can require additional authentication. This would help prevent an unauthorized privileged action, such as transferring money, from happening.

This pattern lets users easily see the info they want. At the same time, it provides additional protection against attackers harming users by sending money to a different account or changing sensitive account information like a mailing address. Having this extra layer of security in place can save users' from account fraud. It doesn't have to take long to implement. 

There are plenty of tools available to add OAuth authentication to your app. For this tutorial we'll be using FusionAuth to handle our Authorization Code and step-up implementations.

## Setting Up the Authentication Project

You can start by [downloading the self-hosted version of FusionAuth](/download/). You will need a license key to take fully follow along with this tutorial. An emailed code, the additional factor of authentication we'll be using to add step-up auth in just a bit requires a valid license. However, if you only want to use Google authenticator MFA (TOTP), you won't need a license. 

Since the purpose of this article is implementing step-up, we'll do a brief overview of how the Authorization Code grant implementation works. For more information check out the TODO link authentication flows TODO.

### Authorization Code Overview

As mentioned earlier, the Authorization Code grant is the most secure way to implement OAuth. Here's pseudocode outlining the steps that are taken in a normal authorization code flow.

* Users click the login button on the client-side.
* They get redirected to the FusionAuth login page.
* They log in and get redirected to a preset URL. This redirect includes the authorization code as part of the URL.
* This authorization code is then exchanged for an access token through a token endpoint. For FusionAuth, this endpoint is `/oauth2/token`.
* Lastly, the token is verified by the application by checking the user information stored in the token. Based on the values in this token, the user either receives or is denied access to the app.

## Set up

The sample application is in this [GitHub repo](https://github.com/flippedcoder/blog-examples) TODO update repo TODO in the `step-up-auth` directory. 

It's based on the app created in a [React and OAuth tutorial](/blog/2020/03/10/securely-implement-oauth-in-react/). Please review that tutorial if you want a deeper walkthrough of the Authorization Code grant implementation.

Similarly to the previous tutorial, you'll need node installed if you want to run thorugh this tutorial. Since this post builds on the previous tutorial, set up the original project first.

### Set up the application without step-up

The easiest way to do this is to clone this project (TODO need to create a copy of the react project as it exists TODO) 

Change directory to `client` and run `npm install`.

Change directory to `server` and run `npm install`.

#### Set up FusionAuth

TODO pull from reactjs tutorial and add a kickstart

#### Start up the application without step-up

Open up two terminals. Change to the `client` directory in one and the `server` directory in the other.

Run 

```
npm start
```

in each one.

You should be able to open an incognito browser window, visit `http://localhost:3000` and login to your application.

Now that the original code works, let's discuss the changes you will make.

### Step-up application overview

Let's walk through the components of this application. If you want to just get the updated application running, download the [GitHub repo](https://github.com/flippedcoder/blog-examples) TODO update repo TODO. Otherwise, follow along below.

In the `client` directory, you have a front-end React app. It's a very basic layout that just shows the user some data after they log in.

TODO IMAGE
{% include _image.liquid src="/assets/img/blogs/step-up-auth/0_react-app-w-login.png" alt="The client-side app after logging in." class="img-fluid" figure=false %}

The server-side is where all of the heavy-lifting of the implementation lies. In the `server` directory, you have a little Express app with several routes that handle different parts of the OAuth process. There are routes to handle logging in, logging out, reading user data, and writing user data. This is where we start to use the FusionAuth endpoints.

## Adding step-up authentication

Having an app with some kind of authentication in place and needing to add additional checks is a common use case. For instance, you may already be requiring MFA but only when a device is new or every thirty days. 

But then you release a new feature that lets users take a privileged action. In this case, we'll add the ability to send a singing telegram message (implementation of actually sending the message left as an exercise for the user). As you might expect, you want to be extra certain the user is who they say they are before before the system responds to such a request.

This is where step-up shines.

We'll add another route to the server-side code. This will handle our step-up flow.

First, we need to start the process with one of FusionAuth's endpoints in a new file in the `server/routes` directory called `step-up-start.js`.

TODO have we set up FusionAuth yet? need kickstart too TODO

TODO can we include from markdown? TODO
```javascript
const express = require("express");
const router = express.Router();
const request = require("request");
const config = require("../../config");

router.get("/", (req, res) => {
  // step-up auth for further access
  if (req.session.token) {
    request(
      // POST request to /two-factor endpoint
      {
        method: "POST",
        uri: `http://localhost:${config.fusionAuthPort}/api/two-factor/start`,
        headers: {
          Authorization: config.apiKey,
        },
        form: {
          loginId: req.session.token.email,
          applicationId: config.applicationID,
          state: {
            redirect_uri: config.redirectURI,
          },
        },
      },

      // response from step-up start
      (_, _, body) => {
        let mfaRes = JSON.parse(body);

        // get twoFactorId for later
        if (mfaRes.twoFactorId) {
          // array holding all of the two factor methods a user can choose from
          const mfaOptions = mfaRes.methods;

          res.send({
            mfaOptions: mfaOptions,
            twoFactorId: mfaRes.twoFactorId,
          });
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

This code covers a lot, so let's break it down. We're checking to see if the user is already logged in. If not, then they won't even have access to request permission for our advanced functionality. Then we call the `two-factor/start` endpoint. This is where we pass in the parameters needed by FusionAuth in the `form` to start the step-up request.

The response will look something like this.

```json
{
  "code" : "12WYT3XemV4f81ghHi4V+RyNwvATD4FIj0BpfFC4Wzg456",
  "methods" : [
    {
      "id" : "RIEP",
      "method" : "email",
      "email" : "richard@fusionauth.io",
      "lastUsed": true
    },
  ]
  "twoFactorId" : "EfpAUMCHLxCCAWyHXOVWPQd8ZY0a6U0e3YpYkHWKWwr"
}
```

We'll send both this `twoFactorId` and `methods` array to the front-end to give users a choice in the method used to authenticate during the step-up. For example, if they have set up three different email addresses at which they can receive MFA codes, we can let them select which one they'd prefer to receive the code at. 

Although the `code` here is generated by FusionAuth, you do have the option to specify a custom code in your request, should you have specific requirements for this. 

Before we jump to the front-end though, let's finish the needed changes on the back-end. Make another file called `step-up-fin.js`. This will handle the rest of the step-up authentication after a user has entered their code. After we have that, we need to verify the correct code was provided. TODO we vs you ? TODO

Here are the contents of `step-up-fin.js`.

```javascript
const express = require("express");
const router = express.Router();
const request = require("request");
const config = require("../../config");

router.get("/", (req, res) => {
  // get two factor id from step-up auth request after user has submitted the code
  if (req.twoFactorId) {
    const twoFactorId = req.twoFactorId;
    request(
      // POST request to send the MFA code
      {
        method: "POST",
        uri: `http://localhost:${config.fusionAuthPort}/api/two-factor/send?twoFactorId=${twoFactorId}`,
        json: true,
        headers: {
          Authorization: config.apiKey,
        },
        form: {
          methodId: req.mfaMethodId,
        },
      },


      // callback
      (error, response, body) => {
        request(
          // POST request to get user data with the auth code
          {
            method: "POST",
            uri: `http://localhost:${config.fusionAuthPort}/api/two-factor/login`,
            json: true,
            headers: {
              Authorization: config.apiKey,
            },
            form: {
              applicationId: config.applicationID,
              code: body.authCode,
              ipAddress: req.ip,
              twoFactorId: twoFactorId,
            },
          },
          (error, response, body) => {
            res.send({
              isStepUpAuthed: body?.token,
            });
          }
        );
      }
    );
  }

  // no twoFactorId -> send nothing
  else {
    res.send({});
  }
});

module.exports = router;
```

This code has two major sections. First, using the `twoFactorId` and the id of the authentication method the user selected, we'll send a request to send the user a code to their preferred method. 

Second, we'll take the code we get from the user's input and submit it with their IP address and a few other credentials. TODO does this work? how does form get submitted TODO

If the code is correct we'll get a user object back. We send the front-end a boolean,`isStepUpAuthed`, based on whether or not that user object is returned. Then the front-end can give them access to the "send singing telegram" functionality, or not.

TODO send singing telegram endpoint? TODO

### Updating the Front-end

There's not much we need to add to the front-end, just a button for requesting more access, a dropdown to hold the MFA methods, and a component to allow the user to submit the code.

In the `client` directory, we're going to modify a few files. These aren't going to be the prettiest additions; we'll leave the CSS up to you. To start with, we'll add the button to request more access.

In the `LogInOut.js` file, add the following lines to add a new button next to the existing log in/log out button.

```javascript
<a style={{ marginLeft: "24px" }} href={this.props.uri + "/step-up-start"}>
  Send Singing Telegram
</a>
```

This is how a user will kick off the step-up auth flow. Once they've done this, we'll get back the `twoFactorId` and the array with the MFA methods they have available.

Next, we need to modify the `index.js` file in the `client/app` directory. This is where we'll add the MFA dropdown and be able to give users the ability to update their data.

```javascript
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

import Greeting from "./components/Greeting.js";
import LogInOut from "./components/LogInOut.js";
import Response from "./components/Response.js";
import UserData from "./components/UserData.js";

const config = require("../../config");

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      body: {}, // this is the body from /user
      showDropdownOptions: false,
    };
    this.handleTextInput = this.handleTextInput.bind(this);
    this.finStepUp = this.finStepUp.bind(this);
    this.showMethods = this.showMethods.bind(this);
  }

  componentDidMount() {
    // ... unchanged
  }


  handleTextInput(event) {
    // ... unchanged
  }


  finStepUp(methodId) {
    fetch(`http://localhost:${config.serverPort}/step-up-fin`, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        twoFactorId: this.body.twoFactorId,
        mfaMethodId: methodId,
      }),
    });
  }

  showMethods(e) {
    this.setState({
      showDropdownOptions: true,
    });
  }

  render() {
    return (
      <div id="App">
        <header>
          <h1>FusionAuth Example: Step-up</h1>
          <Greeting body={this.state.body} />
          <LogInOut
            body={this.state.body}
            uri={`http://localhost:${config.serverPort}`}
          />
        </header>
        <main>
          {this.state.body.twoFactorId && (
            <div>
              <button onClick={this.showMethods}>Choose MFA method</button>
              {this.showDropdownOptions && (
                <div id="methodDropdown">
                  {this.state.body.mfaOptions.map((method) => (
                    <button onClick={this.finStepUp(method.id)}>
                      {method.method}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {this.state.body.isStepUpAuthed && (
            <>
              It's up to you to call the API or endpoint actually send that telegram, but <a href="https://www.babaloons.com/" target="_blank">here's a link to a service</a> that handles that for you!
            </>
          )}
          <Response body={this.state.body} />
        </main>
        <footer>
          <a href="https://fusionauth.io/docs/v1/tech/tutorials/">
            Learn how this app works.
          </a>
          <a href="https://twitter.com/fusionauth">
            Tweet your questions at us.
          </a>
        </footer>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.querySelector("#Container"));
```

TODO install react? TODO

The majority of this file is the same as the original from the tutorial referenced earlier. We've just added a couple of methods and elements. The `showMethods` function shows the dropdown list. The `finStepUp` method is what we call once a user has selected an MFA option.

Inside the `render` method, we've added the dropdown list and a condition to show the ability to edit user data. The dropdown list takes the array we received in the `step-up-start` call and maps all of the options for us and is only displayed if the user has requested more access.

If the code they entered for MFA is correct, we receive a boolean that displays the element that allows them to change user data.

## Additional Security Considerations

Having step-up authentication in place helps protect users even if someone's credentials are stolen. Since it requires additional authentication, unless the attacker had control of the additional factors, they wouldn't be able to perform privileged actions like transfering money or getting credit card information. Step-up authentication allows you to add another layer of protection to such sensitive actions.

The functionality that requires this extra authentication is based on different conditions that can change dynamically depending on a user's roles and permissions. Or, you could build a preset list of actions that need the additional step-up.

One of the biggest benefits of using step-up auth is that it makes the user experience better. Although users will have to set up MFA, which can lead to some grumbling, they won't have to go through the MFA process as often. And you'll still keep the level of security you wanted around privileged functionality.

You might hear step-up authentication and MFA referred to interchangeably, but they aren't the same thing. MFA refers to any authentication method that involves more than one method of authentication. Typically a username and password are the first method and MFA layers on another. It uses other methods like emailed links or biometrics. Step-up authentication is the act of requiring an additional layer of authentication when certain actions are requested. The initial login process is unaffected by the choice to implement step-up authentication.

## Conclusion

When you implement authentication for an app, follow the OAuth best practices to protect your app from as many vulnerabilities as possible. There are a number of authentication flows that work securely to protect your app.

Step-up authentication makes less sensitive information easily accessible to users while requiring further authentication when more privileged actions are undertaken. It's relatively fast to implement and can be maintained or used as an addition to other methods of protecting sensitive data.
