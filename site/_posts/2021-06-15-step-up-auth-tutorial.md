---
layout: blog-post
title: Step up authentication with JavaScript and FusionAuth
description: 
author: Milecia McGregor
image: blogs/sunfinity-fusionauth-python/sunfinity-self-hosts-fusionauth-for-a-huge-win-in-control-productivity-and-cost-header-image.png
category: blog
tags: tutorial tutorial-javascript topic-mfa 
excerpt_separator: "<!--more-->"
---

Broken authentication is the second most prevalent security risk for web applications according to the [OWASP Top 10](https://owasp.org/www-project-top-ten/). When it isn't implemented correctly, it leaves your app vulnerable to attacks that could leak highly sensitive information, like a user's banking information.

Since JavaScript is widely used on both the front-end and back-end, it's important to know how we handle security risks and some of the packages that are commonly used.

<!--more-->

On the front-end, we do things like form validation and make sure we aren't storing any credentials or secret tokens in the code. On the back-end, we check for packages that have known vulnerabilities, do additional data validation, and handle user roles. Some packages that are widely used for security on the front-end and back-end include: [validatorjs](https://www.npmjs.com/package/validatorjs), [retirejs](https://retirejs.github.io/retire.js/), [helmetjs](https://helmetjs.github.io/) and [csrf](https://www.npmjs.com/package/csurf).

## OAuth methods

Once you've protected your app against some of the easier to handle attacks, you can focus your attention on your authentication flow. There are a couple kinds of OAuth flows that can help you guard your app from attackers gaining access to user information through their login credentials.

### The Authorization Code grant

This is the most secure way to implement OAuth. This grant type is used to exchange an authorization code from the front-end to get an access token from the back-end. After the user returns to the web app using a defined redirect URL, the app will get the authorization code from the redirect URL and use it to request an access token. If the authorization code is verified, then the user will be authenticated and have access to the application.

### PKCE

PKCE (Proof Key for Code Exchange) is an extension to the Authorization Code flow we described earlier. This was originally designed to protect mobile apps, but it can also prevent authorization code injection. It works by creating a secret on the client and then using the secret again when we exchange the authorization code for the access token.

### Warning about implicit flow

You might hear about the Implicit flow because it's convenient to use when working with JAMStack apps, but it has been deprecated because it leaves a huge security vulnerability open. Instead of redirecting back to the app from the server with an authorization code, it puts the access token right in the URL as part of the redirect.

Don't implement this flow no matter how much time it might save. All a third party app would have to do is steal the access token from a user's URL to gain access to protected resources.

## What is step up authentication

One of the best defenses we have against user authentication attacks comes in the form of adding multiple layers to our authentication process. Multi-factor authentication (MFA) is a commonly used process. Step up authentication is another option that can add defense in depth.

Step up is a good compromise between setting up authentication quickly and limiting access to sensitive data. It uses a set of dynamic rules to determine when a user should need further authentication to access private resources. In many cases, users want to access data that is less sensitive regularly and continuously completing an MFA process is a roadblock for them.

When implemented correctly, step up adds that extra security to make it more difficult for attackers to access higher functionality. The tricky part is when step up isn't implemented the right way. That can lead to adding friction to the app for users or potentially giving away more access than intended.

Step up becomes a practical choice for apps that need to be created quickly, don't want to default to MFA for all access, or  want to add more security to an existing app. For example, if someone logs into their bank app and they want to do more than check their balance, the app would ask for some other form of authentication before allowing privileged actions.

This lets users see the info they want quickly and it provides protection against attackers sending money to a different account or changing account info, like a mailing address. Having this extra layer of security in place can save users' from account fraud and it doesn't have to take long to implement. 

There are plenty of tools you can use to add OAuth authentication to your app. For this tutorial we'll be using FusionAuth to handle our Authorization Code and Step up implementations.

## Setting up the authentication project

You can start by [downloading the self-hosted version of FusionAuth](/download/). You will need a license key to take advantage of the email MFA we'll be using to add step up auth in just a bit. You can get a [two week free trial of the developer edition](/pricing/) to test out the Reactor features, including email MFA. If you only want to use Google authenticator or a similar TOTP app, you won't need a license.

Since the purpose of this article is implementing step up, we'll do a brief overview of how the authorization code implementation works.

### Authorization code overview

As mentioned earlier, the authorization code flow is the most secure way to implement OAuth. Here's some pseudocode outlining the steps that are taken in a normal authorization code flow.

* Users click the login button on the client-side.
* They get redirected to the FusionAuth login page.
* They login and will get redirected to a preset URL and it will have the authorization code as part of the URL.
* This authorization code is then exchanged for an access token through the /oauth2/token FusionAuth endpoint.
* Lastly, the token is verified by checking the user information stored in the token and the user is given access to the app or their login returns failed.

The setup for the authorization code part of the app in this GitHub repo TBD in the _step up-auth_ directory. It's based on the app created in a [React OAuth tutorial](/blog/2020/03/10/securely-implement-oauth-in-react/) if you want a deeper dive into the Authorization Code grant implementation. 

In the _client_ directory, you have a front-end React app. It's a very basic layout that just shows the user some data after they log in.

![the client-side app after logging in](0_react-app-w-login) TBD

The server-side is where all of the heavy-lifting of the auth implementation lies. In the _server_ directory, you have a little Express app with several routes that handle different parts of the OAuth process. There are routes to handle logging in, logging out, reading user data, and writing user data. This is where we start to use the FusionAuth endpoints.

## Adding step up authentication

Having an app with some kind of authentication in place and needing to add more to it is common. You may already be requiring MFA but only when a device is new or every thirty days. But then you release a new feature that lets users take a privileged action. In this case, we'll add the ability to send a singing telegram message (implementation of actually sending the message left as an exercise for the user) You want extra security before the system responds to such a request.

This is where step up shines.

We'll add another route to the server-side code and this will handle our step up flow.

First, we need to start the process with one of FusionAuth's endpoints in a new file in the _server > routes_ directory called _step up-start.js_.

```javascript
const express = require("express");
const router = express.Router();
const request = require("request");
const config = require("../../config");

router.get("/", (req, res) => {
  // step up auth for further access
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

      // response from step up start
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

We're checking to see if the user is already logged in so we know that they have access to request permission for advanced functionality. Then we call the `two-factor/start` endpoint. This is where we pass in the parameters needed by FusionAuth in the `form` to start the step up request.

The response will look something like this.

```javascript
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

Although the `code` here is generated by FusionAuth, you do have the option to specify a custom code in your request. We'll send both this `twoFactorId` and `methods` array to the front-end to give users an option of how they authenticate. For example, if they have set up three different email addresses at which they can receive MFA codes, we can let them select which one they'd prefer to receive the code at. 

Before we jump to the front-end though, let's finish things on the back-end. We'll make another file called _step up-fin.js_. This will handle the rest of the authentication after a user has entered their code and we need to verify it.

```javascript
const express = require("express");
const router = express.Router();
const request = require("request");
const config = require("../../config");

router.get("/", (req, res) => {
  // get two factor id from step up auth request after user has submitted the code
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

Using the `twoFactorId` and the id of the authentication method the user selected, we'll send a request to send the user a code to their preferred method. Lastly, we'll take the code we get from the user's input and submit it with their IP address and a few other credentials.

If the code is correct we'll get a user object back. We send the front-end the `isStepUpAuthed` based on whether or not that user object is returned, then we can give them access to the ‘send singing telegram' functionality, or not. .

### Updating the frontend

There's not much we need to add to the front-end, just a button for requesting more access, a dropdown to hold the MFA methods, and a component to allow the user to add new info.

In the _client_ directory, we're going to modify a few files. These aren't going to be the prettiest additions so we'll leave the CSS up to you. To start with, we'll add the button to request more access.

In the _LogInOut.js_ file, add the following lines to add a new button next to the existing log in/log out button.

```javascript
<a style={{ marginLeft: "24px" }} href={this.props.uri + "/step up-start"}>
  Send Singing Telegram
</a>
```

This is how a user will kick off the step up auth process. Once they've done this, we'll get back the `twoFactorId` and the array with the MFA methods they have available.

Next, we need to modify the _index.js_ file in the _client > app_ directory. This is where we'll add the MFA dropdown and be able to give users the ability to update their data.

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
    fetch(`http://localhost:${config.serverPort}/step up-fin`, {
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
          <h1>FusionAuth Example: Step up</h1>
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
              It's up to you to actually send that telegram, but <a href="https://www.babaloons.com/" target="_blank">here's a link to a service</a> that handles that for you!
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

The majority of this file is the same as the original from the React tutorial we are building on. We've just added a couple of methods and elements. The `showMethods` function just shows the dropdown list. The `finStepUp` method is what we call once a user has selected an MFA option.

Inside the `render` method, we've added the dropdown list and a condition to show the ability to edit user data. The dropdown list takes the array we received in the `step up-start` call and maps all of the options for us and is only displayed if the user has requested more access.

Then if the code they entered for MFA is verified, we receive a boolean that displays the element that allows them to change user data.


## Additional Security Considerations

Having step up authentication in place helps protect users even if an attack occurs. Since it requires additional authentication an attacker wouldn't be able to perform actions like transfering money or getting credit card information without having access to another factor of authentication. This allows you to add another layer of protection on top of such sensitive actions.

Step up requires extra authentication to access functionality that opens a higher security risk while allowing users to see the less sensitive information they usually want to see. The functionality that requires this extra authentication is based on different conditions that can change dynamically depending on a user's roles and permissions or it could be a preset list of actions that need MFA.

One of the biggest benefits of using step up auth is that it makes the user experience better. Although users will have to set up MFA, which can be a hassle, they won't have to go through the MFA process as often with step up and you'll still keep the level of security you wanted.

You might hear step up authentication and MFA referred to interchangeably, but they aren't the same thing. MFA refers to any authentication method that involves more than one method of authentication. Typically a username and password are the first method, and MFA layers on another. It uses other methods like emailed links or biometrics. 

Step up authentication, on the other hand, uses MFA when elevated actions are requested. The initial login might work using just a username and password, or perhaps allow a user to 'remember' previous MFA succes.

## Conclusion

When you implement authentication for an app, you want to follow the OAuth best practices to protect your app from as many vulnerabilities as possible. There are a number of authentication flows that work securely to fit any app.

Step up authentication makes less sensitive information easily accessible to users while requiring further authentication when  more privileged actions. It's relatively fast to implement and can be maintained or used as an addition to another authentication method.

