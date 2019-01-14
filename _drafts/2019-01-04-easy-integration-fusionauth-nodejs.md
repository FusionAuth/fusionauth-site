---
layout: blog-post
title: "Easy Integration of FusionAuth and Node.js"
description: Integrating FusionAuth into a Node.js application is straightforward. Just follow these steps and you'll be up and running in no time.
author: Tom Vilot
excerpt_separator: "<!--more-->"
categories: blog
tags:
- code
- nodejs
- programming
image: blogs/node-and-fusionauth-example-tiny.jpg
---
There are a variety of strategies for authentication in Node.js apps, but none provide the security, features and complete user management that come with FusionAuth. In this tutorial we'll start with simple Express application and show you how to add FusionAuth to register and authenticate users.
<!--more-->
We'll assume that you are using a unix command-line application like Power Shell on Windows or Terminal on OS X or a standard terminal on Linux. You will also need curl or some means of creating GET and POST requests to your localhost. I like [Postman](https://www.getpostman.com/ "Visit Postman site"). Let's get coding!


## Install and set up FusionAuth
1. Download and Install FusionAuth
2. Create an Application and API key. When you first log into the FusionAuth dashboard, you will see a page like this:

{% include _image.html src="/assets/img/blogs/initial-dashboard.png" alt="FusionAuth Dashboard" class="image-thumbnail" figure=false %}

In the "Missing Application" panel, click the "Setup" button.

{% include _image.html src="/assets/img/blogs/create-app.png" alt="Create Application" class="image-thumbnail" figure=false %}

Give your application a name. The ID will be auto-generated. Also, create at least one role named `user`. Then, choose the `API Keys` link in the sidebar.

{% include _image.html src="/assets/img/blogs/api-key-page.png" alt="API Key Page" class="image-thumbnail" figure=false %}

Just click the + in the upper right.

{% include _image.html src="/assets/img/blogs/create-api-key.png" alt="Create API Key" class="image-thumbnail" figure=false %}

The API key will be auto-generated. You do not need to change any of the endpoint settings. Click the save icon in the upper right. Now, if you go back to the main Dashboard, you should see a screen like this since we haven't done anything with email settings:

{% include _image.html src="/assets/img/blogs/dashboard-after.png" alt="Create API Key" class="image-thumbnail" figure=false %}

## Create a Node.js application with FusionAuth support
Use the steps below to initialize your project and add the fusionauth-node-client and express libraries to it.

1. Create a directory: `mkdir tutorial; cd tutorial`
1. `run npm init`
1. `run npm install express --save`
1. `run npm install fusionauth-node-client --save`

As a first test to ensure that you can connect to your FusionAuth service, create a test.js file, replacing the first parameter in the FusionAuthClient constructor `[your application ID here]` with a valid API key from your FusionAuth environment. Obviously, change the email address with a valid user in your FusionAuth environment:

```js
const {FusionAuthClient} = require('fusionauth-node-client');
const client = new FusionAuthClient(
    '[your application ID here]',
    'http://localhost:9011'
);

// Retrieve User by Email Address
client.retrieveUserByEmail('user@example.com')
       .then(handleResponse);

function handleResponse (clientResponse) {
  console.info(JSON.stringify(
    clientResponse.successResponse.user, null, 2)
  );
}
```

Run that with `node test.js`. You should get back a valid JSON response that looks something like this (obviously, with different values) :

```js
{
  "user": {
    "active": true,
    "email": "joe@example.com",
    "firstName": "Joe",
    "id": "19d20b50-f560-49cd-9005-abb768135462",
    "insertInstant": 1545011130252,
    "lastName": "Jones",
    "passwordChangeRequired": false,
    "passwordLastUpdateInstant": 1545011130647,
    "registrations": [
      {
        "applicationId": "3c219e58-ed0e-4b18-ad48-f4f92793ae32",
        "id": "0a8f196a-a684-474d-bbd3-2801d8f3ed42",
        "insertInstant": 1545011131020,
        "roles": [
          "admin"
        ],
        "usernameStatus": "ACTIVE",
        "verified": true
      }
    ],
    "tenantId": "35366165-6235-3461-3332-343732376164",
    "twoFactorDelivery": "None",
    "twoFactorEnabled": false,
    "usernameStatus": "ACTIVE",
    "verified": true
  }
}
```

Having verified you can connect to your FusionAuth service and retrieve a valid user, we can move on to building an Express application.

```
npm install express-session --save
```

And then create a simple `index.js`. This Express application handles user login, logout, and preventing access the `/profile` route if the user is not logged in. In a real world application, we would have this server behind an HTTPS connection and we would probably use POST instead of GET. Note, change `[your API key here]` with your valid API key and change `[your application ID here]` to your valid application ID.

```js
const express = require('express');
const path = require('path');
const router = express.Router();
const bodyParser = require('body-parser');
var session = require('express-session')

var app = express();

const {FusionAuthClient} = require('fusionauth-node-client');
const client = new FusionAuthClient(
    [your API key here]
    'http://localhost:9011'
);

const applicationId = [your application ID here];
const data = {
    user: null,
    token: null,
}


app.use(session({
    secret: 'fusionauth',
    resave: false,
    saveUninitialized: true,
}))

app.get('/', function(req, res) {
    res.send('Hello World!');
});

app.get('/logout', function(req, res) {
    req.session.destroy()
    res.send("Successfully logged out");
});

app.get('/login', function(req, res) {
    if (req.session.user) {
        console.log('user: ', req.session.user);
        res.send("We already have a user");
    } else {
        const obj = {
            'loginId': req.query.user,
            'password': req.query.password,
            'applicationId': applicationId
        };
        client.login(obj)
            .then(function(clientResponse) {
                req.session.user = clientResponse.successResponse.user;
                req.session.token = clientResponse.successResponse.token;
                console.log(JSON.stringify(clientResponse.successResponse, null, 8))
                res.redirect('/profile');
            })
            .catch(function(error) {
                console.log("ERROR: ", JSON.stringify(error, null, 8))
                res.send("Login failure");
            });

    }
});

app.get('/profile', function(req, res) {
    if (!req.session.user) {
        res.send("Login required");
    } else {
        res.send("Profile");
    }
});

app.listen(3000, function() {
    console.log('FusionAuth example app listening on port 3000!');
});
```

Let's break down the above code. After all the import statements, we have the standard Express invocation, `var app = express();` which creates our Express application. Next, we create the fusion auth client, but with your API key, and then define the `applicationId`. Then we initialize the data we will look for when a client attempts to access a resource:

```js
const {FusionAuthClient} = require('fusionauth-node-client');
const client = new FusionAuthClient(
    [your API key here]
    'http://localhost:9011'
);
const applicationId = [your application ID here];

const data = {
    user: null,
    token: null,
}

```

Then we setup the initial data we will store in our session:

```js
app.use(session({
    secret: 'fusionauth',
    resave: false,
    saveUninitialized: true,
}))
```

Note the `secret` field. This is used to verify the JavaScript Web Token (JWT). We will talk a little more about that when we look at the console output for the `/login handler`. If we were to implement JWT, we would use a real secret. The secret can be defined either in your Application dashboard or the System-wide settings. By default, when you create a new application, no secret is defined and the system-wide configuration is used which is defined in the **System -> Settings** dashboard panel, as illustrate here:

{% include _image.html src="/assets/img/blogs/json-settings.png" alt="System Settings" class="image-thumbnail" figure=false %}

We then define the four endpoints this server will respond to: `/`, `/logout`, `/login`, and `/profile`, along with the code that executes (the "handler") for each endpoint..

+ The root endpoint, `/` simply responds with **Hello World!**.

+ `/logout` simply destroys the session.

+ `/login` first checks to see if we already have a user associated with the session. If no user is on the session, it pulls the values of `user` and `password` from the `query` object on the Express `req` object. It then calls `client.login(obj)` with an object containing the `loginId`, `password`, and `applicationId`. `client.login()` returns a Promise object. We can chain that Promise using `.then()` upon success, and catch any exceptions using the `.catch()`.

The final route is `/profile`. This route handler simply checks to see if we have a user object. If not, we respond with `Login required`. If we have a user, we just respond with `Profile`. In a real world application, we would grab some profile information associated with this user from some database, fill out a template, and return HTML to the browser.

Now, simply run the application:

```
node index.js
```

Once the server is up and running, open your browser and go to [**http://localhost:3000**](http://localhost:3000/ "Localhost") which will display "**Hello World!**". Having verified the server is running, attempt to go to [**http://localhost:3000**](http://localhost:3000/ "Localhost Profile") which should display "**Login required**" in your browser. In a real world application, we would re-route the user to a login page.

Now go to [**http://localhost:3000/login?user=user@example.com&password=password**](http://localhost:3000/login?user=user@example.com&password=password "Localhost with credentials") replacing the user and password with valid credentials. Upon a successful login, you will be re-routed to `/profile`.

Let's take a look at what a FusionAuth response looks like. Notice the output of your server running in your terminal. We dump the contents of the response from FusionAuth at this line of the `/login` handler:

```js
console.log(JSON.stringify(clientResponse.successResponse, null, 8))
```

Your terminal output should contain something like this, obviously with different values:
```js
{
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NDY3NDgyODYsImlhdCI6MTU0Njc0NDY4NiwiaXNzIjoiYWNtZS5jb20iLCJzdWIiOiIxOWQyMGI1MC1mNTYwLTQ5Y2QtOTAwNS1hYmI3NjgxMzU0NjIiLCJhdXRoZW50aWNhdGlvblR5cGUiOiJQQVNTV09SRCIsImVtYWlsIjoidG9tQHZpbG90LmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlfQ.OEWj0QDIp7g2YDpuaohIIB5k8QXj8jqkUKO3_alSWLw",
        "user": {
                "active": true,
                "email": "user@example.com",
                "firstName": "Joe",
                "id": "19d20b50-f560-49cd-9005-abb768135462",
                "insertInstant": 1545011130252,
                "lastLoginInstant": 1546743821212,
                "lastName": "User",
                "passwordChangeRequired": false,
                "passwordLastUpdateInstant": 1545011130647,
                "registrations": [
                        {
                                "applicationId": "3c219e58-ed0e-4b18-ad48-f4f92793ae32",
                                "id": "0a8f196a-a684-474d-bbd3-2801d8f3ed42",
                                "insertInstant": 1545011131020,
                                "roles": [
                                        "admin"
                                ],
                                "usernameStatus": "ACTIVE",
                                "verified": true
                        }
                ],
                "tenantId": "35366165-6235-3461-3332-343732376164",
                "twoFactorDelivery": "None",
                "twoFactorEnabled": false,
                "usernameStatus": "ACTIVE",
                "verified": true
        }
}
```

The response contains two values: `token` and `user`. The `token` is a JavaScript Web Token (JWT) and the `user` is our logged in user. If you like, you can take the value of the `token` and plug it in at [https://jwt.io/](https://jwt.io/ "Jump to JWT.io"). The decoded data should look like this (with different values, of course):

```js
{
  "exp": 1546747421,
  "iat": 1546743821,
  "iss": "acme.com",
  "sub": "19d20b50-f560-49cd-9005-abb768135462",
  "authenticationType": "PASSWORD",
  "email": "user@example.com",
  "email_verified": true
}
```

A full discussion of JavaScript Web Tokens is beyond the scope of this tutorial, but as you can see the server responded with a basic JWT which **jwt.io** was able to decode. In a real world application, we would use JavaScript Web Tokens on every route where we needed to verify a user (and/or their roles), verify the signatures on those tokens, and take appropriate action if the token has expired (such as redirecting the user to the /`login` handler).

Finally, [http://localhost:3000/logout](http://localhost:3000/logout) should log the user out and display "**Successfully logged out**" in your browser.

## User Registration

Since user registration can take quite a few options, we will encode the request in a JSON object and POST to our application. Registration can be done as a two-step process (create the user, then create the registration) or as a single step (create the user and registration). We will do the single step for the sake of simplicity in this tutorial.

For this example, I used Postman to POST to [http://localhost:3000/register](http://localhost:3000/register "Localhost Register"). With Express 4, we will need `bodyParser` to parse the JSON. Near the top of the `index.js` file, we already have:

```js
const bodyParser = require('body-parser');
Now we just need to incorporate it into the application:

app.use(bodyParser.json());
Finally, add a route for handling the POST:

app.post('/register', function(req, res){
    client.register(null, req.body)
        .then(function(clientResponse) {
            res.send(clientResponse);
        })
        .catch(function(error) {
            console.log("ERROR: ", JSON.stringify(error, null, 8))
            res.send(error);
        });
});
```

Since this is a tutorial, we're not incorporating proper error handling. Also, we are not checking to see if we have a logged in user. In addition, note that we pass `null` as the first parameter in the `client.register()` call. This tells FusionAuth to generate a UUID for this user. You can optionally create your own UUID and pass it in place of null.

Restart the server, and POST to the register route. An example using curl (replace `[Your Application ID]` with your real `applicationId`):

```js
curl -X POST \
  http://localhost:3000/register \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "user": {
    "email": "robert@example.com",
    "username": "robert",
    "firstName": "Robert",
    "lastName": "Jackson",
    "password": "82klshig"
  },
  "sendSetPasswordEmail": false,
  "skipVerification": false,
  "registration": {
    "applicationId": "[Your Application ID]"
  }
}'
```

Since we just send back whatever response FusionAuth sends, you should see a successful response such as this:

```js
{
    "statusCode": 200,
    "errorResponse": null,
    "successResponse": {
        "registration": {
            "applicationId": "1d4016cd-27df-4e43-a10e-900c34188271",
            "id": "48e9262b-a76c-4f48-a8f5-f077b9357779",
            "insertInstant": 1541613485920,
            "usernameStatus": "ACTIVE",
            "verified": true
        },
        "user": {
            "active": true,
            "email": "robert@example.com",
            "firstName": "Robert",
            "id": "73efa604-5247-4cca-970e-120b8032f713",
            "insertInstant": 1541613485839,
            "lastName": "Jackson",
            "passwordChangeRequired": false,
            "passwordLastUpdateInstant": 1541613485895,
            "tenantId": "25268ea7-0f96-41af-a59d-a9baa03263e5",
            "twoFactorDelivery": "None",
            "twoFactorEnabled": false,
            "username": "robert",
            "usernameStatus": "ACTIVE",
            "verified": true
        }
    },
    "exception": null
}
```

To see an error response, simply re-submit the exact same registration request. You should get two errors: duplicate email address error and duplicate username error:

```js
{
    "statusCode": 400,
    "errorResponse": {
        "fieldErrors": {
            "user.email": [
                {
                    "code": "[duplicate]user.email",
                    "message": "A User with email = [robert@example.com] already exists."
                }
            ],
            "user.username": [
                {
                    "code": "[duplicate]user.username",
                    "message": "A User with username = [robert] already exists."
                }
            ]
        }
    },
    "successResponse": null,
    "exception": null
}
```
## Conclusion

That's all there is to it! Integrating FusionAuth with Node.js is easy and introduces minimal overhead in your code base. If you have any questions or comments, let us know in the comments below or [contact us](/contact "Contact us").
