---
layout: doc 
title: Testing lambdas with FusionAuth 
description: Testing lambdas with FusionAuth
navcategory: customization
---


This guide shows you how to create a simple lambda manually and programmatically, and how to test it with unit and integration tests.

## Prerequisites

You need to have a test instance of FusionAuth. If not, you can follow the [5 minute getting started guide](/docs/v1/tech/getting-started/5-minute-docker). You should also familiarize yourself with lambdas by reading the [Lambda documentation](/docs/v1/tech/lambdas).

You will log into FusionAuth at `http://localhost:9011/admin` with your [`fusionauth-example-5-minute-guide`](/docs/v1/tech/getting-started/5-minute-docker#5-configure-the-backend-to-complete-the-login) test app at `http://localhost:3000`.

## Creating a simple lambda manually

Let's start by making a simple lambda to test that it works on your machine:


- Log in to [FusionAuth admin](`http://localhost:9011/admin).
- <p>Navigate to <span class="breadcrumb">Customizations -> Lambdas</span>.</p>
- Click the <i/>{:.ui-button .green .fa .fa-plus} button at the top right to add a new lambda.
- <p>Leave the <span class="field">Id</span> blank.</p>
- <p>Enter the <span class="field">Name</span> "[ATest]" (to put it at the top of the list of lambdas alphabetically).</p>
- <p>Select the <span class="field">Type</span> "JWT Populate".</p>
- <p>Leave the <span class="field">Engine</span> on "GraalJS".</p>
- <p>Enable <span class="uielement">Debug Enabled</span> so that you can see messages in the event log.</p>
- Add the following line: `jwt.message = 'Hello World!';` to the body of the `populate` function.

The body should now look like this:

```js
function populate(jwt, user, registration)
{
    jwt.message = 'Hello World!';
    console.info('Hello World!');
}
```

{% include docs/_image.liquid src="/assets/img/docs/customization/lambdas/testing-lambdas/populate-lambda.png" alt="Creating a JWT populate lambda" class="img-fluid bottom-cropped" width="1200" figure=false %}

Save the lambda and note the lambda <span>Id</span>{:.field}. We'll use it later when testing.

Now activate the lambda for the test app:

- Navigate to <span>Applications</span>{:.breadcrumb} and click the <i/>{:.ui-button .blue .fa .fa-edit} button on your app.
- Click on the <span>JWT</span>{:.breadcrumb} tab.
- <p>Enable <span class="uielement">Enabled</span> toggle.</p>
- <p>Under <span class="breadcrumb">Lambda Settings</span>  select the lambda you created, called "[ATest]" for the <span class="field">Access Token populate lambda</span>.</p>
- Click the <i/>{:.ui-button .blue .fa .fa-save} button to save the changes.

{% include docs/_image.liquid src="/assets/img/docs/customization/lambdas/testing-lambdas/edit-application.png" alt="Enabling the lambda in an application" class="img-fluid" width="1200" figure=false %}

You can now test that the new lambda writes to the event log and returns extra data in the JWT. You need to open the `routes/index.js` file in the [fusionauth-example-5-minute-guide test app code](https://github.com/FusionAuth/fusionauth-example-5-minute-guide) that you cloned from GitHub:

Add a line in the OAuth redirect route handler `routes/index.js` to write the JWT to the console at login. The start of the function should now look like the code below:

```js
router.get('/oauth-redirect', function (req, res, next) {
    console.dir(res);
```

Save the file and start the test app with:

```js
npm start
```
Log in to the app at `http://localhost:3000/`. In the FusionAuth admin interface  <span>System -> Event Log</span>{:.breadcrumb} you will see a log entry for your Hello World lambda. In the test app terminal you'll see the entire HTTP response logged. At the bottom is a long alphanumeric line. That's the JWT. It should look something like:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImd0eSI6WyJhdXRob3JpemF0aW9uX2NvZGUiXSwia2lkIjoiMWU1NmM0OWU4In0.eyJhdWQiOiJkZGQwNTAyMS0wNjgyLTQ4NWUtYThlMi1kMDMyOTY0YjAyMTEiLCJleHAiOjE2ODkyNjQwNzEsImlhdCI6MTY4OTI2MDQ3MSwiaXNzIjoiYWNtZS5jb20iLCJzdWIiOiIwYTkzOTYwNi0zNmVjLTQ1M2ItOTM0Mi04ZWZmOTE3ZjJhZWYiLCJqdGkiOiIyYmZlMjUwNy1hZWM0LTRjOTEtYWY5Yy1hOWVhYjQzNmQ4MGYiLCJhdXRoZW50aWNhdGlvblR5cGUiOiJQQVNTV09SRCIsImVtYWlsIjoiZXJsaWNoQGV4YW1wbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImFwcGxpY2F0aW9uSWQiOiJkZGQwNTAyMS0wNjgyLTQ4NWUtYThlMi1kMDMyOTY0YjAyMTEiLCJzY29wZSI6Im9mZmxpbmVfYWNjZXNzIiwicm9sZXMiOltdLCJzaWQiOiIzNDk5MTAxMS1kNzUxLTRlOTctYWZiNi0zNzQ2N2RlYTc5YWIiLCJhdXRoX3RpbWUiOjE2ODkyNjA0NzEsInRpZCI6ImNiY2VkOWVhLWQ3NzgtZDBlYi03ZjU4LWE0MGYxY2VlNWFhYiIsIm1lc3NhZ2UiOiJIZWxsbyBXb3JsZCEifQ.3DOvP8LRAp6pIh0guUjJjYbNwZKzruVWre8Xq8x_S8k
```
  
Copy this token from your terminal and paste it into the <span>Encoded</span>{:.field} text box at [jwt.io](https://jwt.io). You'll see `"message": "Hello World!"` in the <span>Payload</span>{:.uielement} box at the bottom right, showing you that your new lambda ran correctly.

## Understanding the client libraries

We're now going to update our lambda programmatically — using the FusionAuth API. Refer to the [APIs](/docs/v1/tech/apis/) documentation for more.

Although you can use the [lambda API](/docs/v1/tech/apis/lambdas) directly by making HTTP requests, it's much easier to use one of the provided [client libraries](/docs/v1/tech/client-libraries/).

There are three very similar libraries, so let's differentiate them:

- The [Node library](https://github.com/FusionAuth/fusionauth-node-client), documented [here](/docs/v1/tech/client-libraries/node), is deprecated and can be completely ignored.
- The [Typescript client library](https://github.com/FusionAuth/fusionauth-typescript-client), documented [here](/docs/v1/tech/client-libraries/typescript), supersedes the old Node library and should be used for any browser or Node code you write in Javascript or Typescript. It provides a straightforward way of calling the underlying HTTP API.
- The [Node CLI](https://github.com/FusionAuth/fusionauth-node-cli) (command line interface) is a set of commands you can run in the terminal to perform a few advanced functions, such as uploading a new theme or lambda to your FusionAuth application. The Node CLI is a wrapper on the Typescript client library. This is a small library you'll use only in a few cases.

## Making API keys

Before you can use any of the API, CLI, or Client Library functionality you need to create an API key to allow you to access FusionAuth:

- Navigate to  <span>Settings -> API Keys</span>{:.breadcrumb} and click the <i/>{:.ui-button .green .fa .fa-plus} button at the top right.
- <p>In the <span class="field">Key</span> field enter "lambda_testing_key".</p>
- You can either leave all the toggle buttons for the Endpoints blank to give this key all permissions, or enable the buttons only for the following endpoints:
  - `/api/lambda`
  - `/api/lambda/search`
  - `/api/login`
  - `/api/user`
  - `/api/user/registration`
- Save the API key.

## Using the lambda CLI

We are going to work with the Node CLI library first. To install it, open a terminal in your app's folder and use the following commands:

```bash
npm install --save-dev @fusionauth/cli;
npx fusionauth --help
```
If successful, you should see the FusionAuth logo.

The lambda commands that the CLI provides match the names in the underlying Typescript client library: `create`, `delete`, and `retrieve`.

First you are going to retrieve the "[ATest]" lambda you created earlier. This is a useful way to check that a lambda you've created has been successfully uploaded for your app. Replace the Id in the command below with the one you noted earlier for your lambda:

```bash
npx fusionauth lambda:retrieve 1760a1c3-742a-4b74-b3e6-6ef1676ad77c --key lambda_testing_key
```

The lambda will be saved to the file `./lambdas/1760a1c3-742a-4b74-b3e6-6ef1676ad77c.json`.

Let's update the lambda to say "Goodbye World!" instead of "Hello World!" and re-upload it. Open the file in a text editor, change the value of the <span class="field">body</span> property to:

```
"function populate(jwt, user, registration) {\r\n  jwt.message = 'Goodbye World!';\r\n  console.info('Goodbye World!');\r\n}"
```
Save the file and upload the lambda with this command:

```bash
npx fusionauth lambda:update 1760a1c3-742a-4b74-b3e6-6ef1676ad77c --key lambda_testing_key;
```

You can check that the lambda in FusionAuth now says "Goodbye World" by viewing the ["[ATest]" lambda details](http://localhost:9011/admin/lambda).

{% include docs/_image.liquid src="/assets/img/docs/customization/lambdas/testing-lambdas/updated-lambda.png" alt="Update lambda" class="img-fluid bottom-cropped" width="1200" figure=false %}

## API limitations

The FusionAuth API allows you only to retrieve and update lambdas. You can delete a lambda that is not in use by an application with `lambda:delete`, but there is no way to link or unlink a lambda with an application without using the website.

## Testing overview

Lambdas are used for two main purposes:

- Getting user information from an external provider, like a first name or photo from Facebook.
- Calling an external service at login, like sending any suspicious login attempt to a private Slack channel that administrators monitor.

In both these cases there are two types of tests you can perform:

- **Integration test**: check if the lambda has uploaded and is running correctly by logging in and seeing if the expected output happens.
- **Unit test:** you don't upload the lambda, but instead create a mock FusionAuth event that calls the lambda in our own code and check that the lambda does what it is supposed to.

## Lambda limitations

Remember the following limitations of lambdas when planning what they'll do:

- Lambdas do not have full access to JavaScript libraries, nor can they load them currently. 
- `console` methods take only one argument. 
- HTTP requests are not available in the free or Starter version of FusionAuth.
- If you set the Identity Provider [linking strategy](/docs/v1/tech/identity-providers/#linking-strategies) to "Link Anonymously", no lambdas will be used for external authentication.


## Test library

There are many JavaScript test libraries available and everyone has their preference. We are thus going to use a simple library so that you can generalize the tests to your favorite. The tests below use [tape.js](https://github.com/ljharb/tape), which implements the [TAP](https://en.wikipedia.org/wiki/Test_Anything_Protocol) (Test Anything Protocol) — a language-agnostic specification for running tests that's been in use since 1987. We also need to use [fetch-mock.js](https://www.wheresrhys.co.uk/fetch-mock/) to mock `fetch` calls from our lambda.

Let's install them in our test app in the terminal:

```bash
npm install --save-dev tape;
npm install --save-dev faucet; # a little test-runner to give neat tape output
npm install --save-dev fetch-mock;
npm install --save-dev jsonwebtoken; # to decode the JWT
```

{% include _callout-note.liquid content=" `fetch()` is available natively from Node long term version 18 and higher. Before that `fetch` was provided by libraries. Thus many popular mocking libraries for `fetch`, such as [nock.js](https://github.com/nock/nock), actually won't yet work with modern Node in 2023." %}

## An integration test of JWT population

The first of the two tests you're going to write is an integration test. It will verify that your updated lambda is populating the JWT with "Goodbye World" message when you log in programmatically.

### Create a user

Before you can write any tests you need a user with which to login. The test app's `package.json` already includes a reference to the `@fusionauth/typescript-client` discussed earlier. We'll use that to create a test user programmatically.

Make a new file in the app called `test.js` and paste in this code:

```js
const client = require('@fusionauth/typescript-client');
const jwt = require('jsonwebtoken');
const test = require('tape');
const fetchMock = require('fetch-mock');

const applicationId = 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e';
const fusionUrl = 'http://localhost:9011';
const userId = 'c924cd34-879a-430d-a0ac-87a3f98df2dd';
const userPassword = 'password';
const userEmail = 'richard@example.com';
const username = 'lambdatestuser';

createUser();

async function createUser() {
    try {
        const request = {
            registration:  {
                applicationId: applicationId,
                username: username,
            },
            sendSetPasswordEmail: false,
            skipRegistrationVerification: true,
            skipVerification: true,
            user: {
                active: true,
                email: userEmail,
                password: userPassword,
                username: username,
                registrations: [{
                    applicationId: applicationId
                }]
            }
        };
        const fusion = new client.FusionAuthClient('lambda_testing_key', fusionUrl);
        const clientResponse = await fusion.register(userId, request);
        if (!clientResponse.wasSuccessful)
            throw Error(clientResponse);
        console.info('User created succesfully');
    }
    catch (e) {
        console.error('Error creating user: ');
        console.dir(e, { depth: null });
        process.exit(1);
    }
}
```

Change the <span>applicationId</span>{:.filed} value at the top to match the application Id of your Application in FusionAuth and run the code with the following command:

```bash
node test.js
```

Check in FusionAuth under <span>Users</span>{:.breadcrumb} that the new user, `lambdatestuser`, has been created. You can delete the `createUser();` line in `test.js` now that you have a user to work with.

The code above has three sections:

- A declaration of constant variables.
- Creation of the User request object with `const request`. Details on this can be found in the [Typescript client library interface](https://github.com/FusionAuth/fusionauth-typescript-client/blob/master/src/FusionAuthClient.ts)
- Making the request with the client library and checking the response with `await fusion.register(userId, request);`

### Write the test

Now that you have a user, to test that the lambda returns "Goodbye World", ensuring that the CLI `update` command worked, add this code to the `test.js` file:

```js
test('test login returns JWT with "Goodbye World"', async function (t) {
    t.plan(1);
    const result = await login();
    t.ok(result.toLowerCase().includes('goodbye world'));
    t.end();
});

async function login() {
    try {
        const request  = {
            applicationId: applicationId,
            loginId: userEmail,
            password: userPassword,
        };
        const fusion = new client.FusionAuthClient('lambda_testing_key', fusionUrl);
        const clientResponse = await fusion.login(request);
        if (!clientResponse.wasSuccessful)
            throw Error(clientResponse);
        const jwtToken = clientResponse.response.token;
        const decodedToken = jwt.decode(jwtToken);
        const message = decodedToken.message;
        return message;
    }
    catch (e) {
        console.error('Error: ');
        console.dir(e, { depth: null });
        process.exit(1);
    }
}
```

The `login` function calls the FusionAuth library in a similar way to `createUser`. It then decodes the JWT response and returns its `message` property.

This `login` function is called by the Tape.js `test` function. This test gives the name of the test, says that it expects exactly one assertion to occur with `plan`, checks that calling `login` returns the property you expect from our lambda updated earlier, and exits.

We can run it with:

```bash
node test.js
```

When your code has several tests and you want a colorful concise summary, you can instead use:

```bash
node test.js | npx faucet
```

In reality you'll want to create a random user at the beginning of each login test and remove it at the end. This will allow you to add multiple lambda tests while avoiding potential conflicts between test users and permissions.

## A unit test calling an external service

The next test you'll write is a unit test that verifies your lambda locally using a fake mock service and not in FusionAuth. The benefit of this is that you can test that your logic works without needing an external service to be reliable at the time of testing. The danger is that your test might pass locally, but the lambda might fail on FusionAuth due to it running on a different JS environment with different restrictions and configuration.

Let's take an example where you check if users have an email address that is from a country sanctioned by the United States, such as North Korea or Cuba. You call an external site, `https://issanctioned.example.com`, with an email address, and are told whether the domain is banned or not.

Add this new function to `test.js`:

```js
async function populate(jwt, user, registration) {
    const response = await fetch("https://issanctioned.example.com/api/banned?email=" + encodeURIComponent(user.email), {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });
    if (response.status === 200) {
        const jsonResponse = await response.json();
        jwt.isBanned = jsonResponse.isBanned;
    }
    else
        jwt.isBanned = false;
}
```

Now add the two tests below. The first checks that North Korea (`.kp`) is banned and the second that Canada (`.ca`) is allowed.

```js
test('test lambda rejects sanctioned emails and accepts others', async function (t) {
    t.plan(2);

    fetchMock.get('https://issanctioned.example.com/api/banned?email=kim%40company.kp', { isBanned: true });
    const jwt1 = {};
    await populate(jwt1, {email: 'kim@company.kp'}, {});
    t.true(jwt1.isBanned, 'Check North Korea email banned');

    fetchMock.get('https://issanctioned.example.com/api/banned?email=kim%40company.ca', { isBanned: false });
    const jwt2 = {};
    await populate(jwt2, {email: 'kim@company.ca'}, {});
    t.false(jwt2.isBanned, 'Check Canada email allowed');

    fetchMock.restore();
    t.end();
});
```

We used `fetchMock` to mock the external service that would be called from FusionAuth. The mocks for the JWT, user, and registration objects are all simple `{}` objects you can pass as parameters to the `populate()` lambda.

And finally, run the tests with:

```bash
node test.js  | npx faucet
```

If all your unit tests for a lambda pass, you can safely upload it to FusionAuth, either manually or with the CLI, for further testing.

If your HTTP Connect fetch request fails when deployed to FusionAuth please review the [documentation](/docs/v1/tech/lambdas/#using-lambda-http-connect).
