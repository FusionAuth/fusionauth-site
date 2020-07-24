---
layout: blog-post
title: Adding social sign in to your Django web application using OAuth
description: In this tutorial, we'll build a basic Django web application using FusionAuth for an easier and safer way of handling user registration and authentication.
author: Gareth Dwyer
image: blogs/social-sign-in-django/headerimage.png
category: blog
tags: client-python
excerpt_separator: "<!--more-->"
---

In this article, we will discuss the step-by-step process of implementing the OAuth Authorization Code Grant in the Vue.js App. We’ll use FusionAuth as the IdP and also show you how to configure FusionAuth for this workflow.

<!--more-->

Our app will be able to

- log users in
- log users out
- read user data from FusionAuth
- write user data to FusionAuth

We will use Express for our backend server, which will act as a middleware between our Vue Client and FusionAuth and securely store Access Token, Client Id, Client Secret, etc.

**Prerequisites**

- Knowledge of Vue and Express concepts.
- Docker (optional, but preferred for installing FusionAuth).
- Node(12.x) /NPM on local machine.
- Any code editor of your choice.

You’ll also want to make sure your system meets the [memory, storage and CPU requirements](/docs/v1/tech/installation-guide/system-requirements) for FusionAuth.

If you get stuck at any time, feel free to refer to the finished app’s [GitHub repository](https://github.com/FusionAuth/fusionauth-example-vue).

## Setting up FusionAuth

If you don’t already have FusionAuth installed, we recommend the Docker Compose option for the quickest setup:

```shell
curl -o docker-compose.yml https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/docker-compose.yml
curl -o .env https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/.env
docker-compose up
```

Check out the [Download FusionAuth page](/download) for other installation options (rpm, deb, etc) if you don’t have Docker installed. You can further follow the [FusionAuth Installation Guide](/docs/v1/tech/installation-guide/fusionauth-app).

Once FusionAuth is running ( default at http://localhost:9011/), create a new application, this tutorial follows application named `fusionauth-vue-example`. 

Next is to configure our application, there are only two configurations that you need to change for this tutorial. In your application's **OAuth** tab 

- Set `Authorized redirect URLs` to `http://localhost:9000/oauth-callback`. This is the express server URL that will handle processing the FusionAuth callback.
- Set `Logout URL` to  `http://localhost:8081`. This is the URL where the FusionAuth server will redirect us after logout, this is the URL where the Vue app is serving. Makes sense that after logout you end up being on the main landing page of the application.

Click **Save**.

TBD Pic

Now, we will add a user to our application. Select Users on the dashboard, select **Manage** and go to the **Registration** tab. Then click `Add Registration`, and add yourself to the application you just created.

And it’s done. We can now start working on our initial Vue app. 

## Project Structure

Here is what this project looks like:

```
    fusionauth-example-vue
    ├─client
    └─server
```

All the express or server-side code will be in the `server` folder, and our Vue app will reside
 in the `client` folder. You don’t need to create folders right now, we will be doing so in the next steps.

## Creating Vue app

We will use official Vue CLI to initialize our project which is the best way to scaffold Single Page Applications. It provides batteries-included build setups for a modern front-end workflow. It takes only a few minutes to get up and running with hot-reload, lint-on-save, and production-ready builds. You can read more about this [here](https://vuejs.org/).

*Before we create our Vue app, I recommend installing the official Vuejs Extension to make debugging and inspection processes easier. You can download it from* [*here*](https://github.com/vuejs/vue-devtools)*.*

Use the following command to install Vue CLI globally:

```shell
    $ npm install -g @vue/cli
    # OR
    $ yarn global add @vue/cli
```

Now, to create a project run the following command inside the project directory:

```shell
    $ vue create client
```

You will be prompted to pick a preset. You can choose the **default preset** which comes with a basic **Babel + ESLint** setup or select **Manually select features** to customize the features according to you. 

This project will use the default Babel + ESLint setup. You can learn more about it [here](https://cli.vuejs.org/guide/installation.html).

Once the project is initialized, start the development server by running the following command 

```shell
    $ cd client
    $ npm run serve 
```

Head to http://localhost:8081/ 
This is how your app will look like

TBD Pic

## Remove sample code

*Note that based on the configuration you choose, you might see different project structures, and if you are not sure how to clean them, then just stick to this example.*

* Delete `components`, `views`, `router`, and  `assets` folders in `src`.
* Modify your `main.js` file to look like this

```javascript
    import Vue from 'vue';
    import App from './App.vue';
    
    Vue.config.productionTip = false;
    
    new Vue({
      render: (h) => h(App),
    }).$mount('#app');
```

* Modify your `App.vue` file to look like this:

```html
    <template>
      <div id='app'>
      </div>
    </template>
    
    <script>
    export default {
      name: 'app',
      components: {
      },
    };
    </script>
    
    <style>
    </style>
```

And it’s done. http://localhost:8081/ will be blank now.

> FUN FACT: You can load environment variables in most SPA’s (Single Page Applications) templates like Vue, React, etc. without installing any extra dependency. A minor difference is that you would have to add `VUE_APP_` in front of every environment variable. You can read more about this here - [Modes and Environment Variables](https://cli.vuejs.org/guide/mode-and-env.html#environment-variables).

## Express

We will use [Express.js](https://expressjs.com/) as our backend server. It is a super popular library that is widely used by developers.

> Fun fact - The letter **E**  in stacks like **MERN**, **MEVN**, or **MEAN** stands for Express. 

Inside our root directory, we will create another folder named `server` and initialize a NodeJS application in it. For this run the following command in your root directory 

```shell
    $ mkdir server
    $ cd server
    $ npm init -y
    $ npm install express cors morgan nodemon dotenv axios express-session query-string
```

We installed a lot of packages, so let’s discuss them.

- [cors](https://www.npmjs.com/package/cors) - Middleware that helps us to make cross-origin requests.
- [morgan](https://www.npmjs.com/package/morgan) - HTTP request logger middleware for node.js, you can even use this for production.
- [nodemon](https://www.npmjs.com/package/nodemon) - Restarting server every time we make a change is a hassle, nodemon automatically restarts the node application when file changes are detected.
- [dotenv](https://www.npmjs.com/package/dotenv) - Loads environment variable from  `.env` file. We will use this to secure our API key, Client Secret, Client Id, etc.
- [axios](https://www.npmjs.com/package/axios) - to make HTTP requests.
[](https://www.npmjs.com/package/express-session)- [express-session](https://www.npmjs.com/package/express-session) - helps us to store our access token securely
- [query-string](https://www.npmjs.com/package/query-string) -  to stringify form data that we send using axios.

Now, since we have installed `nodemon` to use it inside `package.json`, add the following scripts. 

```
     "scripts": {
            "start": "node index.js",
            "dev": "nodemon index.js"
        },
```

**Environment Variables**
Inside `server` folder create a `.env` file and store all your config (Client Id, Client Secret, SSH keys, or API credentials.) inside it

```
    SERVER_PORT = 9000
    FUSIONAUTH_PORT = 9011
    CLIENT_ID = 'c8642b18-5d1d-42b4-89fb-a37a5b750186'
    CLIENT_SECRET = 'oo06PflPxQrpfxqP8gY9ioOmfzQxARIW5R3BjJrlbS4'
    REDIRECT_URI = 'http://localhost:9000/oauth-callback'
    APLICATION_ID = 'c8642b18-5d1d-42b4-89fb-a37a5b750186'
    API_KEY = 'Dy9bphElA3L3_ayW86T5KvrZkyK1Gj5EDV_2m9i39ow'
```

You might notice that every environment variable is in CAPITAL LETTERS, it’s not a rule, just a convention to separate environment variables from your code variables.

A bit more explanation. `REDIRECT_URI`  is the same as the URL in  `Authorized redirect URLs`.  `APPLICATION_ID` is same as `CLIENT_ID`. You can change `SERVER_PORT` to whatever port you want; this tutorial will use port **9000** for the server.

Now, you may wonder where to get all this other information for `.env` file, just go to the application that you made earlier in the FusionAuth dashboard and click `View` button, the one with the green search button and you can just copy/paste `CLIENT_ID` and `CLIENT_SECRET`  from there.

TBD pic

We have not discussed how to create `API_KEY` here, you can learn more about it [here](https://fusionauth.io/docs/v1/tech/apis/authentication).

**Express Server**
Below is the code for a basic express server, notice that we make use of `dotenv` by adding the following code inside our `index.js`

```javascript
    require("dotenv").config();
```

We can then use environment variables by writing  `process.env.` in front of the environment variables name whenever we use them in our code. 

Since `.env` file is ignored when uploading to GitHub, you will notice `.env.example` in the GitHub source code. To run on the local machine, rename that file to `.env` and add your Client Id, Client Secret, etc.

Here is the sample code for an express server that makes use of all our installed packages

```javascript
    const express = require("express");
    const cors = require("cors");
    const morgan = require("morgan");
    
    // dotenv
    require("dotenv").config();
    
    const app = express();
    
    // Use our middlewares
    app.use(cors({ origin: true, credentials: true }));
    app.use(morgan("common"));
    app.use(express.json());
    
    // Provide a defualt port 
    const port =  process.env.SERVER_PORT || 3000;
    
    // Listen to server  
    app.listen(port, () => {
        console.log(`Listening on port ${port}`);
      });
```
      
To access our server from the browser, we will use the `cors` middleware. Remember to use `{ origin: true, credentials: true }` with `app.use(cors())` , you can read more about this [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

Run the following command to start the development server.

```shell
    $ npm run dev
```

Head over to http://localhost:9000/; you will see an error that is correct since we have not created any routes yet.

TBD Pic
![](https://paper-attachments.dropbox.com/s_41A638AB568946D29BF8A350B42F51304EFAAF396CFE14497A5C33D427FDA743_1594370999403_image.png)

This might be the only time we will run the server since we have installed `nodemon`, the server will automatically restart every time it detects a file change.

In your terminal, you can see  `morgan` in action.  Whnever a request is made to our server, it will log it in the terminal like this. 

```
    ::ffff:127.0.0.1 - - [10/Jul/2020:08:48:21 +0000] "GET / HTTP/1.1" 404 139
```

This can be very useful in debugging an application both in development and in production. 
Let’s create a simple route for our main page:

```javascript
//...
    // Main Page
    app.get("/", (req, res) => {
        res.send({
         message:"FusionAuth Example Vue"
        });
      });
//...
```

Now you can see a response at http://localhost:9000/

```
    {
      "message": "FusionAuth Example Vue"
    }
```

## Sign In

Now, we will start creating the Sign In functionality for our application.

Our Vue application is empty. Let’s first add a heading and a container where will render different components.

Inside `client/src/App.vue` add the following:
    
```html
    <template>
      <div id='app'>
    <header>
          <h1>FusionAuth Example Vue</h1>
        </header>
        <div id = 'container'></div>
      </div>
    </template>
    <script>
    export default {
      name: 'app',
      components: {
      },
    };
    </script>
    <style>
    h1 {
      text-align: center;
      font-size: 40px;
      font-family: Arial, Helvetica, sans-serif;
    }
    #container{
        box-sizing: border-box;
        border: 5px solid gray;
        border-radius: 15%;
        width: 400px;
        height: 400px;
        margin: auto;
    }
    </style>
```

CSS will not be discussed in this tutorial; it is up to your imagination to beautify this application with CSS or UI libraries. 

Here is how your app will look like now:

TBD pic

![](https://paper-attachments.dropbox.com/s_41A638AB568946D29BF8A350B42F51304EFAAF396CFE14497A5C33D427FDA743_1594812156640_image.png)

Now, based on whether the user is logged in or not, we will show different messages. For example, a message that says `Welcome, dinesh@fusionauth.io` should only be displayed if the user `dinesh@fusionauth.io` is logged in. 

We will first hard code this response and then modify it to change according to the response we get from FusionAuth.

Create a new vue file `Greeting.vue` in the `src` folder.  We will create a simple logic by which we can check whether a user is logged in or not, which is Conditional Rendering, to check if the `email` is present. You can read more about this [here](https://vuejs.org/v2/guide/conditional.html).

```html
    <template>
      <div class="greet">
        <h3 v-if="email">Welcome {{email}} </h3>
        <h3 v-else>You are not logged in</h3>
      </div>
    </template>
    <script>
    export default {
      name: 'Greet',
      props: ["email"],
    };
    </script>
    <style > 
    *{
        margin-top:30px;
        text-align: center;
        font-size: 20px;
        font-family: 'Courier New', Courier, monospace;
    }
    </style>
```

You will also something weird in the above code, we are using `email` to check whether the user is logged in or not, but where is this `email` value coming from?

The answer is we are passing this `email` as a prop from `App.vue` hence you can see a `prop` field in `<script> </script>`, it might not make sense as to why we are doing this now but remember we will have other functionalities or other components in our app which will need the response data that we get from the server and instead of calling for the same data in each individual component, it will be much better to call for it in our central `App.vue` file and then pass the required data as props. You can read more about this [here](http://localhost:8081/). XXX

Next, we need to import this file in our `App.vue` and send the data to `<Greet />` component which we will be done with `v-bind`

```html
    <template>
      <div id='app'>
    <header>
          <h1>FusionAuth Example Vue</h1>
        </header>
        <div id = 'container'>
          <Greet v-bind:email="email" />
        </div>
      </div>
    </template>
    <script>
    import Greet from './Greeting';
    export default {
      name: 'app',
      components: {
          Greet,
      },
      data(){
        return {
          email : 'dinesh@fusionauth.io'
        }
      }
    };
    </script>
    <style>
    h1 {
      text-align: center;
      font-size: 40px;
      font-family: Arial, Helvetica, sans-serif;
    }
    #container{
        box-sizing: border-box;
        border: 5px solid gray ;
        border-radius: 15%;
        width: 400px;
        height: 400px;
        margin: auto;
    }
    </style>
```
    
Go to http://localhost:8081/; you will see `Welcome dinesh@fusionauth.io`

TBD pic
![](https://paper-attachments.dropbox.com/s_41A638AB568946D29BF8A350B42F51304EFAAF396CFE14497A5C33D427FDA743_1594812668198_image.png)

Now comment out `email` in the `App.vue` `data()` call.

```javascript
    data(){
        return {
          //email : "dinesh@fusionauth.io"
          }
      }
```

Again head over to http://localhost:8081/
As you can see, since we have removed `email`, we are now seeing a not logged in the message.

TBD pic
![](https://paper-attachments.dropbox.com/s_41A638AB568946D29BF8A350B42F51304EFAAF396CFE14497A5C33D427FDA743_1594814521136_image.png)

We will now implement the same logic based on requests to our server.

## Getting User Info From the Express Server

We will create a `user` route in our express server to send fake user data to our application, and in the next step, we will replace it with a real one based on the request from FusionAuth.

In your `server` folder, create a new folder `routes` and inside that folder create a new file named `user.js`

```
    server
    ├──node_modules
    ├──routes
    │  └─user.js
    ├──index.js
    ├──package.json
    └─package-lock.json
``` 

Create  a new `get` route in `user.js`

```javascript
    const express = require('express');
    const router = express.Router();
    
    router.get('/', (req, res) => {
      res.send({
        user: {
          email: 'dinesh@fusionauth.io'
        }
      });
    });
    module.exports = router;
```

Now to use this route, add following to our `index.js` file.

```javascript
    app.use('/user', require('./routes/user'))
```

And it’s done, go to http://localhost:9000/user, and you will see the following response.

```json
    {
      "user": {
        "email": "dinesh@fusionauth.io"
      }
    }
```

Remember, a *real* User object returned from FusionAuth will have more properties than just an email address. It will look something like this:

```json
    {
        active: true,
        applicationId: '1ac76336-9dd9-4048-99cb-f998af681d3e',
        aud: '1ac76336-9dd9-4048-99cb-f998af681d3e',
        authenticationType: 'PASSWORD',
        email: 'rihcard@fusionauth.io',
        email_verified: true,
        exp: 1594893748,
        iat: 1594890148,
        iss: 'acme.com',
        roles: [],
        sub: 'abdee025-fa3c-4ce2-b6af-d0931cfb4cea'
      }
```

Now inside our `App.vue` file, we will use the `mounted()` lifecycle hook to make a call to our server.

```javascript
//...
      mounted() {
        fetch(`http://localhost:9000/user`, {
          credentials: "include" // fetch won't send cookies unless you set credentials
        })
          .then(response => response.json())
          .then(data=> console.log(data));
      }
//...
```

Here is the output of the above code in the console

```json
    {
      "user": {
        "email": "dinesh@fusionauth.io"
      }
    }
```

We can now use this object to check if the user is logged in or not. We will need to first define `email` as `null` in `data()`, if a response is received from the server-side we will update `email` with the received value which in this case is an object with a property of `email`.
    
```html
    <template>
      <div id="app">
        <header>
          <h1>FusionAuth Example Vue</h1>
        </header>
        <div id="container">
          <Greet v-bind:email="email" />
        </div>
      </div>
    </template>
    <script>
    import Greet from "./Greeting";
    export default {
      name: "app",
      components: {
        Greet
      },
      data() {
        return {
          email: null
        };
      },
      mounted() {
        fetch(`http://localhost:9000/user`, {
          credentials: "include" // fetch won't send cookies unless you set credentials
        })
          .then(response => response.json())
          .then(data => (this.email = data.user.email));
      }
    };
    </script>
    <style>
    h1 {
      text-align: center;
      font-size: 40px;
      font-family: Arial, Helvetica, sans-serif;
    }
    #container {
      box-sizing: border-box;
      border: 5px solid gray;
      border-radius: 15%;
      width: 400px;
      height: 400px;
      margin: auto;
    }
    </style>
```

The output of the above is the same as  when we have specified `email` in `data()`. 

TBD pic
![](https://paper-attachments.dropbox.com/s_41A638AB568946D29BF8A350B42F51304EFAAF396CFE14497A5C33D427FDA743_1594812668198_image.png)

If we comment `email` in `server/routes/user.js`, we will see `You are not logged in` message in our application. We can change the email in `server/routes/user.js` and see the corresponding DOM changes as follows.

```
    user:{
      email: 'richard@fusionauth.io'
    }
```

TBD pic
![](https://paper-attachments.dropbox.com/s_41A638AB568946D29BF8A350B42F51304EFAAF396CFE14497A5C33D427FDA743_1594815984474_image.png)


## Sending Data from FusionAuth

We will finally, instead of sending sample data, send actual data from FusionAuth. So, let’s code to make it happen.
For this, we will first need to create a `login` route, how can we send user data if there is no user logged in.

Create a new file `server/routes/login.js` and add this `route` to `index.js`.

```
    server
    ├──node_modules
    ├──routes
    │  ├─login.js
    │  └─user.js
    ├──index.js
    ├──package.json
    └─package-lock.json
```

In `index.js` 

```javascript
    // Routes
    app.use('/user', require('./routes/user'))
    app.use('/login', require('./routes/login'))
```

Here is the request that is made in `login.js`

```javascript
    const express = require('express');
    const router = express.Router();
    
    router.get('/', (req, res) => {
    
      const stateValue = Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15);
    
      req.session.stateValue = stateValue
    
      res.redirect(`http://localhost:${process.env.FUSIONAUTH_PORT}/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&state=${stateValue}`);
    });
    module.exports = router;
```

One important thing to notice is the endpoint that where we are making requests to, i.e., `/oauth2/authorize` , this endpoint will provide us with an Authorization Code, which we will discuss in a bit. You can read more about it [here](https://fusionauth.io/docs/v1/tech/oauth/endpoints#authorize).

Another thing is the `stateValue` or the state parameter, which is generally used as a Cross Site Request Forgery (CSRF) token, which is to maintain state between the request and the callback. Any value provided in this field will be returned on a successful redirect. We will later use this value in `oauth-callback` route. You can read more about this [here](https://openid.net/specs/openid-connect-core-1_0.html).

Let’s discuss the parameters we have used above:
 
`redirect_uri` informs FusionAuth where to redirect the user to after login.
`response_type` tells FusionAuth which OAuth flow we’re using (Authorization Code in this example).

Try navigating to http://localhost:9000/login. And if everything is correct, you will see an error, yes your code is working fine, no need to recheck. You will see an error like this.

TBD pic
![](https://paper-attachments.dropbox.com/s_41A638AB568946D29BF8A350B42F51304EFAAF396CFE14497A5C33D427FDA743_1594816942372_image.png)

If you go above in `login.js`, you will find that  `REDIRECT_URI` is set to `'http://localhost:9000/oauth-callback``'` in our `.env` file but we haven’t actually created that route yet, Did we? So this error makes sense. We're actually logged in because we signed into the FusionAuth Dashboard.

You seeing this error means that your request was processed without any error else if any of the credentials were wrong or there was some other error, you might see this kind of response.

TBD pic
![](https://paper-attachments.dropbox.com/s_41A638AB568946D29BF8A350B42F51304EFAAF396CFE14497A5C33D427FDA743_1594817187027_image.png)


 If you are still not satisfied, you can logout of the FusionAuth Dashboard at http://localhost:9011/ or visit this url in an incognito window.
 And again, visit http://localhost:9000/login, but this time, you will see a FusionAuth login form that gives the same error on logging.

![](https://paper-attachments.dropbox.com/s_41A638AB568946D29BF8A350B42F51304EFAAF396CFE14497A5C33D427FDA743_1594386414617_image.png)

## OAuth Callback

Now, let’s get rid of the error and create a `oauth-callback` route. Inside `routes` create a new file `oauth-callback.js`.

Add this route to `index.js` 

```javascript
//...
    // Routes
    app.use('/user', require('./routes/user'))
    app.use('/login', require('./routes/login'))
    app.use('/oauth-callback', require('./routes/oauth-callback'))
//...
```

During redirect, the `/oauth-callback` route will receive an Authorization Code from FusionAuth as a URL parameter. You can see it on the error page in the URL bar. It will be something like this.
Focus on `code=` 


    http://localhost:9000/oauth-callback?code=SSXVv3xkNTKEhnY4XzjUVvRZp7eyhgCuuREAgSeByrw&locale=en&userState=Authenticated

This Authorization Code is not sufficient to access user information, for that we will need `access_token`. To get `access_token` we will make a post request to `/oauth2/token`  endpoint with this Authorization Code.

Before we make that request, we will also need to store this `access_token`, we can’t store it in a variable, we need a secure way that doesn’t expose this `access_token` and prevent malicious activities.

We will store this `access_token` using `express-session` middleware, so we need to import `express-session` inside `index.js` file.

```javascript
//...
    const session = require("express-session")
//...
```

And then add the following to `index.js`. It might be worth checking out the [Express Session docs](https://github.com/expressjs/session#readme).

```javascript
    // configure sessions
    app.use(session(
      {
        secret: '1234567890', // don't use this secret in prod :)
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: 'auto',
          httpOnly: true,
          maxAge: 3600000
        }
      })
    );
```

Now, we can get back to `oauth-callback.js` files and make the post request to receive `access_token`.
Don’t let the below code confuse you, we will discuss it piece by piece.

```javascript
    const express = require("express");
    const router = express.Router();
    const axios = require("axios").default;
    const qs = require("query-string");
    
    const config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
    const url = `http://localhost:${process.env.FUSIONAUTH_PORT}/oauth2/token`;
    
    router.get("/", (req, res) => {
    // State from Server
    const stateFromServer = req.query.state;
    if (stateFromServer !== req.session.stateValue) {
      console.log("State doesn't match. uh-oh.");
      console.log(`Saw: ${stateFromServer}, but expected: &{req.session.stateValue}`);
      res.redirect(302, '/');
      return;
    }
      //post request to /token endpoint
      axios
        .post(
          url,
          qs.stringify({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code: req.query.code,
            grant_type: "authorization_code",
            redirect_uri: process.env.REDIRECT_URI,
          }),
          config
        )
        .then((result) => {
    
          // save token to session
          req.session.token = result.data.access_token;
          console.log(result)
          //redirect to Vue app
         res.redirect(`http://localhost:8081`);
        })
        .catch((err) => {
          console.error(err);
        });
    });
    module.exports = router;
```
    

We start with standard code for a route just like  `login.js`. And then we import `axios` and `querystring`. 
We then use `if` statement to check the state parameter; if it does not match, we `conole.log()` and error message.

We will use `axios`  to make post requests to `oauth2/token` endpoint, this is the complete URL that we will request to.

```javascript
    const url = `http://localhost:${process.env.FUSIONAUTH_PORT}/oauth2/token`;
```

Another thing you will notice is the config variable. The `oauth2/token` endpoint can only access form-encoded data, which is why we are explicitly telling it in the headers.

```javascript
    const config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
```

Now, let’s talk about the body of the request. If you go through the [FusionAuth docs](https://fusionauth.io/docs/v1/tech/oauth/endpoints#token), you will find these are standard request parameters that we need to send to `oauth2/token` endpoint in which some are optional and some are required. The `code` is the Authorization Code that we received from `oauth2/authorize` endpoint and `grant_type` tells FusionAuth we’re using the Authorization Code Flow.


```javascript
     qs.stringify({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code: req.query.code,
            grant_type: "authorization_code",
            redirect_uri: process.env.REDIRECT_URI,
          })
```

The `query-string` library stringifies this request object into query strings as you can see below. This saves us from doing this manually and makes code more readable.

```
    'client_id=1ac76336-9dd9-4048-99cb-f998af681d3e&client_secret=NLmIgHC65zHeHOPlQMmOMG4Nberle41GT85RUgijdqA&code=e_oTyBn_7WPTPgtFUjvEZk6TwBBLYajRi8NMixQehd0&grant_type=authorization_code&redirect_uri=http%3A%2F%2Flocalhost%3A9000%2Foauth-callback'
```

After  a successful post request, we use `.then()` to access the response from the endpoint, we store the `access_token` received to the session or `req.session.token`. The above code has a `console.log()` of this response so that you can see the response. We are only concerned with the `data` property. After storing this `access_token` we redirect to our Vue App.

```json
    data: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjcxNDcxZGE3ZiJ9.eyJhdWQiOiIxYWM3NjMzNi05ZGQ5LTQwNDgtOTljYi1mOTk4YWY2ODFkM2UiLCJleHAiOjE1OTQ4ODkzODAsImlhdCI6MTU5NDg4NTc4MCwiaXNzIjoiYWNtZS5jb20iLCJzdWIiOiJhYmRlZTAyNS1mYTNjLTRjZTItYjZhZi1kMDkzMWNmYjRjZWEiLCJhdXRoZW50aWNhdGlvblR5cGUiOiJQQVNTV09SRCIsImVtYWlsIjoiYXNodXNpbmdoMTU2NzNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImFwcGxpY2F0aW9uSWQiOiIxYWM3NjMzNi05ZGQ5LTQwNDgtOTljYi1mOTk4YWY2ODFkM2UiLCJyb2xlcyI6W119.Dcktd6933XI7iDEsH2RbR49lse-Mamx7B5k1q4hSz_o',
        expires_in: 3599,
        token_type: 'Bearer',
        userId: 'abdee025-fa3c-4ce2-b6af-d0931cfb4cea'
      }
    }
```

You can see how an `access_token` looks like. The axios request ends with a catch block to throw any error that we may encounter.
Now, head over to http://localhost:9000/login , if everything goes well, you will end up on your Vue application homepage because that is what we have set in `redirect_uri` and can see the response in the console(the terminal where you are running your server).

XXX stopped here
# Logout

So, we have a `login` route that the signs in a user and then redirects back to our Vue app. Before we add this `login` route in our Vue app, let’s create a `logout` route and add them together, you will understand why it makes sense to add them together in a bit.

Inside `server/routes` create a new file named `logout.js`.


    server
    ├──node_modules
    ├──routes
    │  ├─login.js
    │  ├─oauth-callback.js
    │  ├─logout.js
    │  └─user.js
    ├──index.js
    ├──package.json
    └─package-lock.json

Add then add this route to `index.js` 


    // Routes
    app.use('/user', require('./routes/user'))
    app.use('/login', require('./routes/login'))
    app.use('/logout', require('./routes/logout'))
    app.use('/oauth-callback', require('./routes/oauth-callback'))

Inside this `logout.js` file add the following.


    const express = require('express');
    const router = express.Router();
    router.get('/', (req, res) => {
      // delete the session
      req.session.destroy();
      // end FusionAuth session
      res.redirect(`http://localhost:${process.env.FUSIONAUTH_PORT}/oauth2/logout?client_id=${process.env.CLIENT_ID}`);
    });
    module.exports = router;

Compared to `oauth-callback.js` it is pretty simple, we first destroy the Express server-side  session(and the `token` we store there) and then redirect to `oauth2/logout` endpoint with Client Id. 

Head over to http://localhost:9000/logout and you will logout of FusionAuth, then head over to http://localhost:9000/login and you will see the login page which on submitting takes you back to your Vue application.

You might wonder why after **logging out** we **redirects back to our Vue app**, we didn’t write that in `logout.js` , this is happening because we configured the main entry point to our Vue App as Logout URL in FusionAuth, one of the two changes that we did. 


# User 

We have been using fake user up until now. Since we now have `access_token` stored in session we can use it to request actual user data from FusionAuth.

Modify the `user.js` like 


    const express = require("express");
    const router = express.Router();
    const axios = require("axios");
    const qs = require("querystring");
    
    router.get("/", (req, res) => {
      // token in session -> get user data and send it back to the vue app
      if (req.session.token) {
        axios
          .post(
            `http://localhost:${process.env.FUSIONAUTH_PORT}/oauth2/introspect`,
            qs.stringify({
              client_id: process.env.CLIENT_ID,
              token: req.session.token,
            })
          )
          .then((result) => {
            let introspectResponse = result.data;
            // valid token -> get more user data and send it back to the Vue app
            if (introspectResponse) {
              
              // GET request to /registration endpoint
              axios
                .get(
                  `http://localhost:${process.env.FUSIONAUTH_PORT}/api/user/registration/${introspectResponse.sub}/${process.env.APLICATION_ID}`,
                  {
                    headers: {
                      Authorization: process.env.API_KEY,
                    },
                  }
                )
                .then((response) => {
                  res.send({
                    introspectResponse: introspectResponse,
                    body: response.data.registration,
                  });
                })
            }
          // expired token -> send nothing 
            else {
              req.session.destroy();
              res.send({});
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
       // no token -> send nothing
       else {
        res.send({});
      }
    });
    module.exports = router;
    

Let’s discuss this step by step. 

First, we check if `access_token`  is present and then make a **POST** request to `oauth2/introspect` endpoint which requires Client ID and  Access Token. Like the `oauth2/token` endpoint, this endpoint access form-encoded data, so we are using the `query-string` library.

When this request is successful, we get a response object which contains `data` property that has all the information we need.


    {
      active: true,
      applicationId: '9d5119d4-71bb-495c-b762-9f14277c116c',
      aud: '9d5119d4-71bb-495c-b762-9f14277c116c',  
      authenticationType: 'PASSWORD',
      email: 'richard@fusionauth.io',
      email_verified: true,
      exp: 1594904052,
      iat: 1594900452,
      iss: 'acme.com',
      roles: [],
      sub: 'abdee025-fa3c-4ce2-b6af-d0931cfb4cea'   
    }

Then we make another request  to access more user information this time a **GET** request to the `/api/user/registration` API. This API requires User ID or the `sub` value of our response from `oauth2/introspect` endpoint. When this request is successful, we send all the data to our client via `res.send()` .
This is how the response from `/api/user/registration` looks like.


    {
        "applicationId": "9d5119d4-71bb-495c-b762-9f14277c116c",
        "data": "",
        "id": "c756e203-ea1f-491e-9446-b70ed4eecc17",
        "insertInstant": 1594898302209,
        "lastLoginInstant": 1594900452281,
        "username": "ashu",
        "usernameStatus": "ACTIVE",
        "verified": true
    }

The API key that we are passing in headers is not part of OAuth parameters and you will not find it in [User Registration API Docs](https://fusionauth.io/docs/v1/tech/apis/registrations#retrieve-a-user-registration). Still, we added this to show how you will use the API Key (in `Authorization` header) if you decide to explore more endpoints from the Docs that require the API key.

## Showing User Data

We can now access user’s information as available on FusionAuth, now next step is to display that data. In our `App.vue` we need to modify `mounted()`, since this time we are getting a response object that contains data from two endpoints.

We just need to one line in `App.vue`, instead of `data.user.email`, this time it will be `data.introspectResponse.email` . While we are doing this, let’s define `body` as null in `data()` and store `body` field of the response object inside it. 


     data() {
        return {
          email: null,
          body: null,
        };
      },
      mounted() {
        fetch(`http://localhost:9000/user`, {
          credentials: "include", ss you set credentials
        })
          .then((response) => response.json())
          .then((data) => {
            this.email = data.introspectResponse.email;
            this.body= data.body;
          });
      }

Everything else remains the same, we are now getting user information from FusionAuth in our application instead of fake user data. 
Go through the login process once again, and you should see “Welcome [your email address]”.

# Adding SignIn/SignOut in Vue

We have created the endpoints for `login`  and `logout`  so  let's add them in our Vue application. Create a new file named `Login.vue` and add the following


    <template>
      <h1 v-if="email"><a href='http://localhost:9000/logout'>Sign Out</a></h1>
      <h1 v-else><a href='http://localhost:9000/login'>Sign In</a></h1>
    </template>
    <script>
    export default {
      name: "Login",
      props: ["email"],
    };
    </script>

According to the above code, if the user is not logged in, `Sign In` will be shown else `Sign Out` will be shown, this `email` is passed from `App.vue` as a prop here, so let’s do that. In our `App.vue`
first import this file 


    import Login from "./Login";

And then add this to `components` 


    components: {
        Greet,
        Login 
      }

 
And finally use it inside `<template>  </template>`, 


        <div id="container">
          <Greet v-bind:email="email" />
          <Login v-bind:email="email" />
        </div>

Here is how it our application looks like now, we can now login and logout with a click.

![](https://paper-attachments.dropbox.com/s_41A638AB568946D29BF8A350B42F51304EFAAF396CFE14497A5C33D427FDA743_1594893599430_image.png)
![](https://paper-attachments.dropbox.com/s_41A638AB568946D29BF8A350B42F51304EFAAF396CFE14497A5C33D427FDA743_1594893751537_image.png)

# Changing User Info

This last section deals with setting user data from our application.

## set-user-data route

We will  create the `/set-user-data` route, so inside `routes` create `set-user-data.js` and add the following to it.


    const express = require("express");
    const router = express.Router();
    const axios = require("axios");
    const qs = require("query-string");
    router.post("/", (req, res) => {
     // POST request to /introspect endpoint
      axios
        .post(
          `http://localhost:${process.env.FUSIONAUTH_PORT}/oauth2/introspect`,
          qs.stringify({
            client_id: process.env.CLIENT_ID,
            token: req.session.token,
          })
        )
        .then((response) => {
          let introspectResponse = response.data;
        
          // PATCH request to /registration endpoint
          axios.patch(
            `http://localhost:${process.env.FUSIONAUTH_PORT}/api/user/registration/${introspectResponse.sub}/${process.env.APLICATION_ID}`,
            {
              registration: {
                data: req.body,
              },
            },
            {
              headers: {
                Authorization: process.env.API_KEY,
              },
            }
          ).catch(err=>{
              console.log(err)
          })
        })
        .catch((err) => {
          console.error(err);
        });
    
    });
    module.exports = router;
    

To ensure that we are updating the user currently logged in, we  extract token from our server which is done by making a **POST** request to `oauth/introspect` endpoint as we have already done in  `oauth2/user` route. 

Once this request is successful, we make a **PATCH** request to `/api/user/registration` API. If you go through the [Docs](https://fusionauth.io/docs/v1/tech/apis/registrations#update-a-user-registration), you will find that this API accepts both **PUT** and **PATCH** requests but here we are using **PATCH** since we only want to update a single resource and **PATCH** will merge the request parameters to the existing object. 

The `data` to send is stored inside the `registration` object which takes it value from `req.body` or body of the request. This `registration` is an object FusionAuth provides for storing arbitrary data related to a user’s registration in an application. We will be sending user data from our Vue app to the Express server via JSON in the body of a **POST** HTTP message.


## Setting User Data from Vue

Now that we have created our route for updating user data, let’s create a `text-area` in our Vue app, we will type the user data here which will be sent to the server when the `Submit` button is clicked.

In `client/src` create a new file named `Update.vue` and add the following to it.


    <template>
      <form>
        <textarea
          v-model="userData"
          placeholder="Update FusionAuth user data."
        ></textarea>
        <button type="submit" class="button">Submit</button>
      </form>
    </template>
    <script>
    export default {
      name: "Update",
      data() {
        return {
          userData: "",
        };
      },
    </script>
    <style>
    textarea {
      display: block;
      margin-left: auto;
      margin-right: auto;
    }
    button {
      margin-left: auto;
      margin-right: auto;
      margin-top: 5px;
    }
    </style>
    

One of the cool features of Vue is that by using  `v-model="userData``"`  and initializing `userData=``""` in `data()` , it creates a two-way data binding between `textarea` and `userData`.
We can now access whatever we type in `textarea` in `userData`. You can read more about it [here](https://vuejs.org/v2/guide/forms.html).

And then add this component to `App.vue` . It does not make sense to show this component when the user is not logged in. FFor that just add `v-if =` `"``email` with this component like this and like some of our other components it will check to see if the `email` is present or not, i.e., user is logged in or not.


    <Update v-if="email" />

Here is how our application looks like

![](https://paper-attachments.dropbox.com/s_41A638AB568946D29BF8A350B42F51304EFAAF396CFE14497A5C33D427FDA743_1594903024881_image.png)
![](https://paper-attachments.dropbox.com/s_41A638AB568946D29BF8A350B42F51304EFAAF396CFE14497A5C33D427FDA743_1594903073925_image.png)


We still haven’t configured the `Submit` button, so let do so to send whatever we type in `textarea` to our server. For this, we will create a function `update` inside the `methods()`.


      methods: {
        update: function() {
          fetch(`http://localhost:9000/set-user-data`, {
            credentials: "include",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userData: this.userData,
            }),
          }).catch((err) => {
              console.log(err);
            });
            this.userData=''
        },
      },

In the above function, we use `fetch()` to **POST** JSON-encoded data. Here  `credentials: "include",`  is used for cross-origin calls, if you are familiar with `fetch()` API, you will see that this is a simple **POST** request using `fetch()`, nothing fancy. You can read more about it [here](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).

Once we have sent `userData` to our server, we empty the `textarea` using `this.userData=``''`, since it is a two-way binding.

And now to bind this function to `submit` event we will add the following to the `form` tag.


    <form @submit.prevent="update">
    //
    </form>

Using `.prevent` stops the page from reloading whenever the Submit button is clicked. Now go to your Vue app and type some message in the `textarea` and click the Submit button. You can now see that message under **User data** in **Users** tab in the FusionAuth dashboard. 


![](https://paper-attachments.dropbox.com/s_41A638AB568946D29BF8A350B42F51304EFAAF396CFE14497A5C33D427FDA743_1594903545542_image.png)




----------
# Conclusion

Congrats, you have built a Vue app that can log in, log out, and modify user data. This article provides a good foundation for implementing OAuth using FusionAuth, and there are still so many features, components, and routes that you can create. 

Here are a few ideas of what you can do:


- [Register Users from the App itself.](https://fusionauth.io/docs/v1/tech/apis/registrations#create-a-user-and-registration-combined)
- Secure your server using middlewares like [Helmet,](https://www.npmjs.com/package/helmet) 
- Explore third party OAuth like [Google](https://fusionauth.io/docs/v1/tech/apis/identity-providers/google), [Twitter,](https://fusionauth.io/docs/v1/tech/apis/identity-providers/twitter) etc.

Check out the [FusionAuth APIs](https://fusionauth.io/docs/v1/tech/apis/) for even more options.

