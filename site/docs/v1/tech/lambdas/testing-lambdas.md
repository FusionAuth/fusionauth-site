---
layout: doc
title: Testing lambdas with FusionAuth
description: Testing lambdas with FusionAuth
navcategory: customization
---

## Overview

This guide shows you how to create a simple lambda manually, update it programmatically, and test it with unit and integration tests. You can familiarize yourself with lambdas by reading the [FusionAuth lambda documentation](/docs/v1/tech/lambdas).

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Set Up the FusionAuth Sample Project](#set-up-the-fusionauth-sample-project)
- [Manually Create a Simple Lambda](#manually-create-a-simple-lambda)
- [Programmatically Update a Lambda](#programmatically-update-a-lambda)
  - [Understand the Client Libraries](#understand-the-client-libraries)
  - [Create an API Key](#create-an-api-key)
  - [Use the Lambda CLI](#use-the-lambda-cli)
  - [API Limitations](#api-limitations)
- [Testing Overview](#testing-overview)
  - [Test Library](#test-library)
  - [Integration Test: Verify JWT population](#integration-test-verify-jwt-population)
    - [Create a User](#create-a-user)
    - [Write the Test](#write-the-test)
  - [Unit Test: Call an External Service](#unit-test-call-an-external-service)

## Prerequisites

To follow this guide, you need
- [Node.js version 18](https://nodejs.org/en/download) or later, and
- [Docker](https://www.docker.com/get-started/).

{% include docs/_lambda_limitations.adoc %}

## Set Up the FusionAuth Sample Project
Download, or use git to clone, the [testing-lambdas repository](https://github.com/RichardJECooke/fusionauth-testing-lambdas). Open a terminal in the directory you just created and start FusionAuth with Docker.
```bash
docker-compose up;
```
This command will run FusionAuth, including a sample application with an API Key and a User, configured by the kickstart.json file in the kickstart subdirectory.

 {% include _callout-important.liquid
    content=
    "<The `.env` and `kickstart.json` files contain passwords. In a real application, always add these files to your `.gitignore` file and never commit secrets to version control.>"
    %}

## Manually Create a Simple Lambda

Let's start by making a simple lambda to test that it works on your machine.

- Log in to the [FusionAuth admin UI](`http://localhost:9011/admin).
- <p>Navigate to <span class="breadcrumb">Customizations -> Lambdas</span>.</p>
- Click the <i/>{:.ui-button .green .fa .fa-plus} button at the top right to add a new lambda.
- <p>Enter the <span class="field">Id</span> "f3b3b547-7754-452d-8729-21b50d111505"</p>
- <p>Enter the <span class="field">Name</span> "[ATest]" (to put it at the top of the list of lambdas alphabetically).</p>
- <p>Select the <span class="field">Type</span> "JWT Populate".</p>
- <p>Leave the <span class="field">Engine</span> as "GraalJS".</p>
- <p>Enable <span class="uielement">Debug Enabled</span> so that you can see messages in the event log.</p>
- Add the following line: `jwt.message = 'Hello World!';` to the body of the `populate` function.

The body should now be similar to below.

```js
function populate(jwt, user, registration) {
  jwt.message = 'Hello World!';
  console.info('Hello World!');
}
```

{% include docs/_image.liquid src="/assets/img/docs/customization/lambdas/testing-lambdas/populate-lambda.png" alt="Creating a JWT populate lambda" class="img-fluid bottom-cropped" width="1200" figure=false %}

Save the lambda.

Now activate the lambda for the test app.

- Navigate to <span>Applications</span>{:.breadcrumb} and click the <i/>{:.ui-button .blue .fa .fa-edit} button on the example app.
- Click on the <span>JWT</span>{:.breadcrumb} tab.
- <p>Toggle <span class="uielement">Enabled</span> to on.</p>
- <p>Under <span class="breadcrumb">Lambda Settings</span>, select the lambda you created, called "[ATest]" for the <span class="field">Access Token populate lambda</span>.</p>
- Click the <i/>{:.ui-button .blue .fa .fa-save} button to save the changes.

{% include docs/_image.liquid src="/assets/img/docs/customization/lambdas/testing-lambdas/edit-application.png" alt="Enabling the lambda in an application" class="img-fluid" width="1200" figure=false %}

You can now test that the new lambda writes to the event log and returns extra data in the JWT. The repository you downloaded contains two directories.
- `complete-application` — This is the result of the work you will complete in this guide, if you need to refer to the finished files. Do not work in this directory.
- `app` — This contains a basic application to which you will add tests in this guide. Work in this directory.

Open the `routes/index.js` file in the `app` directory.

Add a line in the OAuth redirect route handler to write the JWT to the console at login. The start of the function should now look like the code below.

```js
router.get('/oauth-redirect', function (req, res, next) {
  console.dir(res);
```

Save the file and start the test app with the following command.

```js
npm start
```
Log in to the app at `http://localhost:3000` with user `richard@example.com` and password `password`. In the FusionAuth admin UI, navigate to <span>System -> Event Log</span>{:.breadcrumb} and you will see a log entry for your "Hello World" lambda. The entire HTTP response is logged in the test app terminal. The JWT is a long alphanumeric line at the end of the response. It should look something like below.

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImd0eSI6WyJhdXRob3JpemF0aW9uX2NvZGUiXSwia2lkIjoiMWU1NmM0OWU4In0.eyJhdWQiOiJkZGQwNTAyMS0wNjgyLTQ4NWUtYThlMi1kMDMyOTY0YjAyMTEiLCJleHAiOjE2ODkyNjQwNzEsImlhdCI6MTY4OTI2MDQ3MSwiaXNzIjoiYWNtZS5jb20iLCJzdWIiOiIwYTkzOTYwNi0zNmVjLTQ1M2ItOTM0Mi04ZWZmOTE3ZjJhZWYiLCJqdGkiOiIyYmZlMjUwNy1hZWM0LTRjOTEtYWY5Yy1hOWVhYjQzNmQ4MGYiLCJhdXRoZW50aWNhdGlvblR5cGUiOiJQQVNTV09SRCIsImVtYWlsIjoiZXJsaWNoQGV4YW1wbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImFwcGxpY2F0aW9uSWQiOiJkZGQwNTAyMS0wNjgyLTQ4NWUtYThlMi1kMDMyOTY0YjAyMTEiLCJzY29wZSI6Im9mZmxpbmVfYWNjZXNzIiwicm9sZXMiOltdLCJzaWQiOiIzNDk5MTAxMS1kNzUxLTRlOTctYWZiNi0zNzQ2N2RlYTc5YWIiLCJhdXRoX3RpbWUiOjE2ODkyNjA0NzEsInRpZCI6ImNiY2VkOWVhLWQ3NzgtZDBlYi03ZjU4LWE0MGYxY2VlNWFhYiIsIm1lc3NhZ2UiOiJIZWxsbyBXb3JsZCEifQ.3DOvP8LRAp6pIh0guUjJjYbNwZKzruVWre8Xq8x_S8k
```

Copy this token from your terminal and paste it into the <span>Token</span>{:.field} text box at the [FusionAuth Online JWT Decoder](https://fusionauth.io/dev-tools/jwt-decoder). You'll see `"message": "Hello World!"` in the <span>Payload</span>{:.uielement} box, showing you that your new lambda ran correctly.

## Programmatically Update a Lambda

Let's take a look at how to update your lambda programmatically using the FusionAuth API. Refer to the [APIs](/docs/v1/tech/apis/) documentation for more.

### Understand the Client Libraries

Although you can use the [lambda API](/docs/v1/tech/apis/lambdas) directly by making HTTP requests, it's much easier to use one of the provided [client libraries](/docs/v1/tech/client-libraries/).

There are two libraries for Javascript:

- The [TypeScript client library](https://github.com/FusionAuth/fusionauth-typescript-client), documented [here](/docs/v1/tech/client-libraries/typescript), should be used for any browser or Node code you write in JavaScript or TypeScript. It provides a straightforward way of calling the underlying HTTP API.
- The [Node CLI](https://github.com/FusionAuth/fusionauth-node-cli) is a set of commands you can run in the terminal to perform a few advanced functions, such as uploading a new theme or lambda to your FusionAuth application. The Node CLI is a wrapper on the TypeScript client library and operates at a higher level of abstraction. It is helpful to manage lambdas, but you can always drop down to the Typescript client library if needed.

### Create an API Key

The API, CLI, and Client Library all need an API Key to access FusionAuth.

The kickstart configuration file used by FusionAuth already created a sample API Key with superuser privileges. If you need to create another key in future applications, you can perform the following steps, but you don't need to for this tutorial.

- Navigate to  <span>Settings -> API Keys</span>{:.breadcrumb} and click the <i/>{:.ui-button .green .fa .fa-plus} button at the top right.
- <p>In the <span class="field">Key</span> field enter a name.</p>
- You can either leave all the toggle buttons for the Endpoints blank to give the key all permissions, or enable the buttons for the following endpoints:
  - `/api/lambda`
  - `/api/lambda/search`
  - `/api/login`
  - `/api/user`
  - `/api/user/registration`

  These endpoints are necessary to perform actions on lambdas, such as updating and deleting, and to mimic user actions to test the lambdas, such as logging in.
- Save the API key.

### Use the Lambda CLI

First, install the Node CLI library. Open a terminal in your app folder and use the following commands.

```bash
npm install --save-dev @fusionauth/cli;
npx fusionauth --help
```
You should see the FusionAuth logo and a usage help message.

The lambda commands that the CLI provides match operations in the underlying TypeScript client library: `create`, `delete`, and `retrieve`.

Now you can retrieve the "[ATest]" lambda you created earlier. This is a useful way to check that a lambda you've created has been successfully uploaded for your app.

```bash
npx fusionauth lambda:retrieve f3b3b547-7754-452d-8729-21b50d111505 --key lambda_testing_key
```

The lambda will be saved to a file, where the file name is the UUID of your lambda. So it should look like this: `./lambdas/f3b3b547-7754-452d-8729-21b50d111505.json`.

Let's update the lambda to say "Goodbye World!" instead of "Hello World!" and re-upload it. Open the file in a text editor, change the value of the <span class="field">body</span> property to the following.

```
"function populate(jwt, user, registration) {\r\n  jwt.message = 'Goodbye World!';\r\n  console.info('Goodbye World!');\r\n}"
```
Save the file and upload the lambda with the following command.

```bash
npx fusionauth lambda:update f3b3b547-7754-452d-8729-21b50d111505 --key lambda_testing_key;
```

You can check that the lambda in FusionAuth now says "Goodbye World" by viewing the ["[ATest]" lambda details](http://localhost:9011/admin/lambda).

{% include docs/_image.liquid src="/assets/img/docs/customization/lambdas/testing-lambdas/updated-lambda.png" alt="Update lambda" class="img-fluid bottom-cropped" width="1200" figure=false %}

### API Limitations

The FusionAuth API allows you only to retrieve and update lambdas. You can delete a lambda that is not in use by an application with `lambda:delete`, but there is no way to link or unlink a lambda with an application without using another configuration management mechanism such as the admin UI, Terraform, or a client library.

## Testing Overview

Lambdas run arbitrary code at certain points in an authentication flow. For example, they can be used for:

- Getting user information from an external provider, like a first name or photo from Facebook, or from the User object in FusionAuth, to put in a JWT.
- Calling an external service at login, like sending any suspicious login attempt to a private Slack channel that administrators monitor.

In both these cases, there are two types of tests you can perform:

- **Integration test**: Check if the lambda has uploaded and is running correctly by logging in and seeing if the expected output happens.
- **Unit test:** You don't upload the lambda, but instead create a mock FusionAuth event that calls the lambda in your code and checks that the lambda does what it is supposed to.

Each of these types of lambda test is outlined below.

### Test Library

There are many JavaScript test libraries available and everyone has their preference. Here you'll use a simple library so that you can generalize the tests to your favorite. The tests below use [`tape`](https://github.com/ljharb/tape), which implements the [Test Anything Protocol (TAP)](https://en.wikipedia.org/wiki/Test_Anything_Protocol), a language-agnostic specification for running tests that's been in use since 1987. You also need to use [fetch-mock](https://www.wheresrhys.co.uk/fetch-mock/) to mock `fetch` calls from your lambda.

Install the following in your test app terminal.

```bash
npm install --save-dev tape;
npm install --save-dev faucet; # a little test-runner to give neat tape output
npm install --save-dev fetch-mock;
npm install --save-dev jsonwebtoken; # to decode the JWT
npm install --save-dev uuid; # to make random user Id
```

{% include _callout-note.liquid content=" The `fetch()` method is available natively from Node LTS version 18. In earlier versions, `fetch` was provided by libraries, so many popular mocking libraries for `fetch` (such as [Nock](https://github.com/nock/nock)) won't work with modern Node in 2023." %}

### Integration Test: Verify JWT population

The first of the two tests you're going to write is an integration test. It will verify that your updated lambda is populating the JWT with a "Goodbye World" message when you log in programmatically.

#### Create a User

Before you can write any tests you need a test user profile to log in with. The test app `package.json` includes a reference to the `@fusionauth/typescript-client` discussed earlier, so you can use that to create a test user programmatically.

Make a new file in the app called `test.js` and paste the following code into it.

```js
{% remote_include 'https://raw.githubusercontent.com/RichardJECooke/fusionauth-testing-lambdas/main/complete-application/documentation_snippets/test_1.js' %}
```

The code above has three sections:

- A declaration of constant variables that match the `kickstart.json` and `.env` files.
- The `createRandomUser` function, which creates a User request object with `const request`, and then sends it to `fusion.register()`. Details on this can be found in the [TypeScript client library interface](https://github.com/FusionAuth/fusionauth-typescript-client/blob/master/src/FusionAuthClient.ts).
- The `deleteUser` function, which the tests you are going to write can use to delete the user just created.

Run the code to test user creation with the following command.

```bash
node test.js
```

In FusionAuth, click on <span>Users</span>{:.breadcrumb} to check that a new user called `lambdatestuser` has been created. You can delete the `createRandomUser(uuidv4());` line in `test.js`, as each test will use a new temporary user. This will allow you to add multiple lambda tests while avoiding potential conflicts between test users and permissions.

#### Write the Test

Now you will test that the lambda returns "Goodbye World", which will confirm that the CLI `update` command worked.

Add this code to the `test.js` file.

```js
{% remote_include 'https://raw.githubusercontent.com/RichardJECooke/fusionauth-testing-lambdas/main/complete-application/documentation_snippets/test_2.js' %}
```

The `login` function calls the FusionAuth Typescript library. It then decodes the JWT response and returns its `message` property.

This `login` function is called by the `tape` function `test`. This test gives the name of the test, says that it expects exactly one assertion to occur with `plan`, checks that calling `login` returns the property you expect from our lambda updated earlier, and exits. Even if the test fails, the `finally` clause will delete the temporary user created.

Run it with the following command.

```bash
node test.js
```

When your code has several tests, and you want a colorful concise summary, you can instead use the following.

```bash
node test.js | npx faucet
```

### Unit Test: Call an External Service

The next test you'll write is a unit test that verifies your lambda locally using a fake mock service and not in FusionAuth. The benefit of this test is that you can test your logic works without needing an external service to be reliable at the time of testing. The danger is that your test might pass locally, but the lambda might fail on FusionAuth due to it running on a different JavaScript environment with different restrictions and configuration.

Let's take an example where you check if users have email addresses from a country sanctioned by the United States, such as North Korea or Cuba. You call an external site, `https://issanctioned.example.com`, with an email address, and are told whether the domain is banned or not.

Add this new function to `test.js`:

```js
{% remote_include 'https://raw.githubusercontent.com/RichardJECooke/fusionauth-testing-lambdas/main/complete-application/documentation_snippets/test_3.js' %}
```

Now add the two tests below. The first checks that North Korea (`.kp`) is banned and the second that Canada (`.ca`) is allowed.

```js
{% remote_include 'https://raw.githubusercontent.com/RichardJECooke/fusionauth-testing-lambdas/main/complete-application/documentation_snippets/test_4.js' %}
```

You used `fetchMock` to mock the external service that would be called from FusionAuth. The mocks for the JWT, user, and registration objects are all simple `{}` objects you can pass as parameters to the `populate()` lambda.

Finally, run the tests.

```bash
node test.js  | npx faucet
```

If all your unit tests for a lambda pass, you can safely upload it to FusionAuth manually or with the CLI for further testing.

If your HTTP Connect fetch request fails when deployed to FusionAuth please review the [documentation](/docs/v1/tech/lambdas/#using-lambda-http-connect). In particular, ensure you are using a license and that you have purchased the correct plan (Essentials or Enterprise).