---
layout: doc
title: Lambda Guide
description: Creating and testing lambdas with FusionAuth
navcategory: developer
---

## Overview

This guide shows you how to create a simple lambda manually, update it programmatically, and test it with unit and integration tests. You can familiarize yourself with lambdas by reading the [FusionAuth lambda documentation](/docs/v1/tech/lambdas).

## Prerequisites

To follow this guide, you need

- [Node.js version 18](https://nodejs.org/en/download) or later, and
- [Docker](https://www.docker.com/get-started/).

### Lambda Limitations


{% include _callout-note.liquid content="<p>Remember the following limitations of lambdas when planning what they'll do:<ul><li>Lambdas do not have full access to JavaScript libraries, nor can they load them currently.</li> <li>The console methods take only one argument.</li><li>HTTP requests are not available in the Community or Starter FusionAuth plans.</li><li>If you set the Identity Provider <a href='/docs/v1/tech/identity-providers/#linking-strategies'>linking strategy</a> to 'Link Anonymously', no lambdas will be used for external authentication.</li> </ul></p>"%}

## Set Up The FusionAuth Sample Project

Download or use Git to clone the [testing-lambdas repository](https://github.com/FusionAuth/fusionauth-example-testing-lambdas). Open a terminal in the directory you just created and start FusionAuth with Docker.

```bash
docker-compose up
```

This command will run FusionAuth and set up a sample application with an API Key and a User, configured in the `kickstart.json` file in the `kickstart` subdirectory.

 {% include _callout-important.liquid
    content=
    "The `.env` and `kickstart.json` files contain passwords. In a real application, always add these files to your `.gitignore` file and never commit secrets to version control."
    %}

## Manually Create A Simple Lambda

Let's start by making a simple lambda to test that it works on your machine.

- Log in to the [FusionAuth admin UI](`http://localhost:9011/admin).
- <p>Navigate to <span class="breadcrumb">Customizations -> Lambdas</span>.</p>
- Click the <i/>{:.ui-button .green .fa .fa-plus} button at the top right to add a new lambda.
- <p>Enter the <span class="field">Id</span> "f3b3b547-7754-452d-8729-21b50d111505".</p>
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

{% include docs/_image.liquid src="/assets/img/docs/guides/lambda/populate-lambda.png" alt="Creating a JWT populate lambda" class="img-fluid bottom-cropped" width="1200" figure=false %}

Save the lambda.

Now activate the lambda for the example app.

- Navigate to <span>Applications</span>{:.breadcrumb} and click the <i/>{:.ui-button .blue .fa .fa-edit} button on the "Example app".
- Click on the <span>JWT</span>{:.breadcrumb} tab.
- <p>Toggle <span class="uielement">Enabled</span> to on.</p>
- <p>Under <span class="breadcrumb">Lambda Settings</span>, select the lambda you created, called "[ATest]" for the <span class="field">Access Token populate lambda</span>.</p>
- Click the <i/>{:.ui-button .blue .fa .fa-save} button to save the changes.

{% include docs/_image.liquid src="/assets/img/docs/guides/lambda/edit-application.png" alt="Enabling the lambda in an application" class="img-fluid" width="1200" figure=false %}

You can now test that the new lambda writes to the event log and returns extra data in the JWT. The repository you downloaded contains two directories.
- `complete-application` — This is the result of the work you will complete in this guide if you need to refer to the finished files. Do not work in this directory.
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
Log in to the app at `http://localhost:3000` with user `richard@example.com` and password `password`. In the FusionAuth admin UI, navigate to <span>System -> Event Log</span>{:.breadcrumb} and you will see a log entry of the invocation of your "Hello World" lambda. The entire HTTP response is logged in the test app terminal. The JWT is a long alphanumeric line at the end of the response. It should look something like below.

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImd0eSI6WyJhdXRob3JpemF0aW9uX2NvZGUiXSwia2lkIjoiMWU1NmM0OWU4In0.eyJhdWQiOiJkZGQwNTAyMS0wNjgyLTQ4NWUtYThlMi1kMDMyOTY0YjAyMTEiLCJleHAiOjE2ODkyNjQwNzEsImlhdCI6MTY4OTI2MDQ3MSwiaXNzIjoiYWNtZS5jb20iLCJzdWIiOiIwYTkzOTYwNi0zNmVjLTQ1M2ItOTM0Mi04ZWZmOTE3ZjJhZWYiLCJqdGkiOiIyYmZlMjUwNy1hZWM0LTRjOTEtYWY5Yy1hOWVhYjQzNmQ4MGYiLCJhdXRoZW50aWNhdGlvblR5cGUiOiJQQVNTV09SRCIsImVtYWlsIjoiZXJsaWNoQGV4YW1wbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImFwcGxpY2F0aW9uSWQiOiJkZGQwNTAyMS0wNjgyLTQ4NWUtYThlMi1kMDMyOTY0YjAyMTEiLCJzY29wZSI6Im9mZmxpbmVfYWNjZXNzIiwicm9sZXMiOltdLCJzaWQiOiIzNDk5MTAxMS1kNzUxLTRlOTctYWZiNi0zNzQ2N2RlYTc5YWIiLCJhdXRoX3RpbWUiOjE2ODkyNjA0NzEsInRpZCI6ImNiY2VkOWVhLWQ3NzgtZDBlYi03ZjU4LWE0MGYxY2VlNWFhYiIsIm1lc3NhZ2UiOiJIZWxsbyBXb3JsZCEifQ.3DOvP8LRAp6pIh0guUjJjYbNwZKzruVWre8Xq8x_S8k
```

Copy this token from your terminal and paste it into the <span>Token</span>{:.field} text box on the [FusionAuth Online JWT Decoder](/dev-tools/jwt-decoder). You'll see `"message": "Hello World!"` in the <span>Payload</span>{:.uielement} box, showing you that your new lambda ran correctly.

## Programmatically Update A Lambda

Let's take a look at how to update your lambda programmatically using the FusionAuth API. Refer to the [APIs](/docs/v1/tech/apis/) documentation for more.

### Understand The Client Libraries

Although you can use the [lambda API](/docs/v1/tech/apis/lambdas) directly by making HTTP requests, it's much easier to use one of the provided [client libraries](/docs/v1/tech/client-libraries/).

There are two ways to do this using JavaScript:

- The [TypeScript client library](https://github.com/FusionAuth/fusionauth-typescript-client), documented [here](/docs/v1/tech/client-libraries/typescript), should be used for any browser or Node code you write in JavaScript or TypeScript. It provides a straightforward way of calling the underlying HTTP API.
- The [Node CLI](https://github.com/FusionAuth/fusionauth-node-cli) is a set of commands you can run in the terminal to perform a few advanced functions, such as uploading a new theme or lambda to your FusionAuth application. The Node CLI is a wrapper on the TypeScript client library and operates at a higher level of abstraction. It is helpful to manage lambdas, but you can always drop down to the Typescript client library if needed.

### Create An API Key

The API, CLI, and Client Library all need an API Key to access FusionAuth.

The kickstart configuration file used by FusionAuth already created a sample API Key with superuser privileges. For more information on managing API keys, please refer to the following [guide](/docs/v1/tech/apis/authentication#managing-api-keys). If you need to create another key in future applications, you can perform the following steps, but you don't need to for this tutorial.

- Navigate to  <span>Settings -> API Keys</span>{:.breadcrumb} and click the <i/>{:.ui-button .green .fa .fa-plus} button at the top right.
- <p>In the <span class="field">Key</span> field enter a name.</p>
- You can either leave all the toggle buttons for the Endpoints blank to give the key all permissions or enable the buttons for the following endpoints:
  - `/api/lambda`
  - `/api/lambda/search`
  - `/api/login`
  - `/api/user`
  - `/api/user/registration`

  These endpoints are necessary to perform actions on lambdas, such as updating and deleting, and to mimic user actions to test the lambdas, such as logging in.
- Save the API key.

### Use The Lambda CLI

First, install the Node CLI library. Open a terminal in your app folder and use the following commands.

```bash
npm install --save-dev @fusionauth/cli
npx fusionauth --help
```

You should see the FusionAuth logo and a usage help message.

The lambda commands that the CLI provides match operations in the underlying TypeScript client library: `update`, `delete`, and `retrieve`.

Now you can retrieve the "[ATest]" lambda you created earlier. This is a useful way to check that a lambda you've created has been successfully uploaded for your app.

```bash
npx fusionauth lambda:retrieve f3b3b547-7754-452d-8729-21b50d111505 --key lambda_testing_key
```

The lambda will be saved to a file, where the file name is the UUID of your lambda. So it should look like this: `./lambdas/f3b3b547-7754-452d-8729-21b50d111505.yaml`.

Let's update the lambda to say "Goodbye World!" instead of "Hello World!" and re-upload it. Open the file in a text editor, change the value of the <span>body</span>{:.field} property to the following.

{% raw %}
```
body: |
  function populate(jwt, user, registration) {
    jwt.message = 'Goodbye World!';
    console.info('Goodbye World!');
  }
```
{% endraw %}

Save the file and upload the lambda with the following command.

```bash
npx fusionauth lambda:update f3b3b547-7754-452d-8729-21b50d111505 --key lambda_testing_key
```

You can check that the lambda in FusionAuth now says "Goodbye World!" by viewing the ["[ATest]" lambda details](http://localhost:9011/admin/lambda).

{% include docs/_image.liquid src="/assets/img/docs/guides/lambda/updated-lambda.png" alt="Update lambda" class="img-fluid bottom-cropped" width="1200" figure=false %}

### CLI Limitations
The Node CLI allows you only to create, retrieve, and update lambdas. You can delete a lambda that is not in use by an application with `lambda:delete`, but there is no way to link or unlink a lambda with an application without using the admin UI, API, or a client library. For example, to link a lambda with an application in the Typescript client library, you could use code similar to the following.

```ts
const request: ApplicationRequest = { "application": { "lambdaConfiguration": {accessTokenPopulateId: "f3b3b547-7754-452d-8729-21b50d111505"} };
await new FusionAuthClient(apiKey, host).patchApplication(applicationId, request);
```

## Testing Overview

Lambdas run arbitrary code at certain points in an authentication flow. For example, you can use lambdas to:

- Get user information from an external provider (like a first name or photo from Facebook) or the User object in FusionAuth to put in a JWT.
- Call an external service at login, for example, to send any suspicious login attempt to a private Slack channel monitored by administrators.

In both these cases, there are two types of tests you can perform:

- **Integration test**: Check if the lambda has uploaded and is running correctly by logging in and seeing if the expected output happens.
- **Unit test:** You don't upload the lambda, but instead create a mock FusionAuth event that calls the lambda in your code and checks that the lambda does what it is supposed to.

Each of these types of lambda tests is outlined below.

### Test Library

There are many JavaScript test libraries available, and everyone has their preference. This guide uses a simple library for demonstration so that you can generalize the tests to your favorite library. The tests below use [`tape`](https://github.com/ljharb/tape), which implements the [Test Anything Protocol (TAP)](https://en.wikipedia.org/wiki/Test_Anything_Protocol), a language-agnostic specification for running tests that's been in use since 1987. The tests also use [fetch-mock](https://www.wheresrhys.co.uk/fetch-mock/) to mock `fetch` calls from your lambda.

Install the following in your test app terminal.

```bash
npm install --save-dev tape
npm install --save-dev faucet # a little test-runner to give neat tape output
npm install --save-dev fetch-mock
npm install --save-dev jsonwebtoken # to decode the JWT
npm install --save-dev uuid # to make a random user Id
```

{% include _callout-note.liquid content=" The `fetch()` method is available natively from Node LTS version 18. In earlier versions, `fetch` was provided by libraries, so many popular mocking libraries for `fetch` (such as [Nock](https://github.com/nock/nock)) won't work with modern Node in 2023." %}

### Integration Test: Verify JWT Population

The first of the two tests you're going to write is an integration test. It will verify that your updated lambda is populating the JWT with a "Goodbye World" message when you log in programmatically.

#### Create A User

Before you can write any tests, you need a test user profile to log in with. The test app `package.json` includes a reference to the `@fusionauth/typescript-client` discussed earlier, so you can use that to create a test user programmatically.

Make a new file called `userCreator.js` in the app folder and paste the following code into it.

```js
{% remote_include 'https://raw.githubusercontent.com/FusionAuth/fusionauth-example-testing-lambdas/main/complete-application/userCreator.js' %}
```

The code above has two functions:

- The `createRandomUser` function, which creates a User request object with `const request` and then sends it to `fusion.register()`. Details on this can be found in the [TypeScript client library interface](https://github.com/FusionAuth/fusionauth-typescript-client/blob/master/src/FusionAuthClient.ts).
- The `deleteUser` function, which you can use in the tests to delete the user just created.

Run the code to test user creation with the following command.

```bash
node userCreator.js
```

In FusionAuth, click on <span>Users</span>{:.breadcrumb} to check that a new user called `lambdatestuser` has been created. You can delete the `createRandomUser(uuidv4());` line in `test.js` as each test will use a new temporary user. This will allow you to add multiple lambda tests while avoiding potential conflicts between test users and permissions.

#### Write The Test

Now you will test that the lambda returns "Goodbye World", which will confirm that the CLI `update` command worked.

Create a file called `userLogin.js` and add the following code.

```js
{% remote_include 'https://raw.githubusercontent.com/FusionAuth/fusionauth-example-testing-lambdas/main/complete-application/userLogin.js' %}
```

This helper file allows your tests to log in to FusionAuth programmatically. The `login` function calls the FusionAuth Typescript library. It then decodes the JWT response and returns its `message` property.

Now create a test file that will use it, `test_1.js`, and add the following code.

```js
{% remote_include 'https://raw.githubusercontent.com/FusionAuth/fusionauth-example-testing-lambdas/main/complete-application/test_1.js' %}
```

This file starts with a declaration of constant variables that match the `kickstart.json` and `.env` files. The `login` function is called by the `tape` function `test`. This test specifies the name of the test, says that it expects exactly one assertion to occur with `plan`, checks that calling `login` returns the property you expect from the lambda updated earlier, and exits. Even if the test fails, the `finally` clause will delete the temporary user created.

Run it with the following command.

```bash
node test_1.js
```

The output should be as follows.

```bash
TAP version 13
# test login returns JWT with "Goodbye World"
User c82aced2-b25b-4390-a4a2-72562b9bc13b created successfully
ok 1 should be truthy
User c82aced2-b25b-4390-a4a2-72562b9bc13b deleted successfully

1..1
# tests 1
# pass  1

# ok
```

When your code has several tests, and you want a colorful, concise summary, you can use the following instead.

```bash
node test_1.js | npx faucet
```

The output should be as follows.

```bash
✓ test login returns JWT with "Goodbye World"
# tests 1
# pass  1
✓ ok
```

### Unit Test: Call An External Service

The next test you'll write is a unit test that verifies your lambda locally using a fake mock service and not in FusionAuth. The benefit of this test is that you can test your logic works without needing an external service to be reliable at the time of testing. The danger is that your test might pass locally, but the lambda might fail on FusionAuth due to it running on a different JavaScript environment with different restrictions and configuration.

Let's take an example where you check if users have email addresses from a country sanctioned by the United States, such as North Korea or Cuba. You call the external site `https://issanctioned.example.com` with an email address, and you're told whether or not the domain is banned.

Create a file called `test_2.js` and add the following code.

```js
{% remote_include 'https://raw.githubusercontent.com/FusionAuth/fusionauth-example-testing-lambdas/main/complete-application/test_2.js' %}
```

This test function uses `fetchMock` to mock the external service that would be called from the lambda function in FusionAuth. The first test checks if North Korea (`.kp`) is banned and the second if Canada (`.ca`) is allowed. The mocks for the JWT, user, and registration objects are all simple `{}` objects you can pass as parameters to the `populate()` lambda. This is the lambda function that would run on FusionAuth, similar to the "Hello World" function described earlier.

Finally, run the tests.

```bash
node test_2.js  | npx faucet
```

The output should be as follows

```bash
✓ test lambda rejects sanctioned emails and accepts others
# tests 2
# pass  2
✓ ok
```

If all your unit tests for a lambda pass, you can safely upload it to FusionAuth manually or with the CLI for further testing.

If your HTTP Connect fetch request fails when deployed to FusionAuth, please review the [documentation](/docs/v1/tech/lambdas/#using-lambda-http-connect). In particular, ensure you are using a license and have purchased the correct plan (Essentials or Enterprise).

### Unit Test: Populate JWT From FusionAuth

In this final unit test, let's look at how to check user information available in FusionAuth to determine custom fields to return to your app. You are also going to download the lambda code to test from FusionAuth programmatically, instead of hardcoding the `populate` function into your test.

There are two objects related to login to consider. The first is the JWT fields that are returned to your app by default.

```js
{% remote_include '/docs/src/json/jwt/login-response.json' %}
```

The second object is the user supplied to your `populate()` function in a lambda.

```js
{% remote_include '/docs/src/json/users/login-response.json' %}
```

You can see that the user object has data that the JWT does not, like names, birthdates, and languages, that you might want to add in a lambda. You can also add logic in the lambda to manipulate these fields before returning them to your app.

To demonstrate, let's write a lambda function that returns permissions to your app based on the user's role.

In the FusionAuth admin UI, open the `[ATest]` lambda function you created earlier and overwrite it with the following code.

```js
function populate(jwt, user, registration) {
  jwt.permissions = [];
  if (user.registrations[0].roles.includes("admin"))
    jwt.permissions.push("all");
  else if (user.registrations[0].roles.includes("editor")) {
    jwt.permissions.push("read");
    jwt.permissions.push("write");
  } else if (user.registrations[0].roles.includes("viewer"))
    jwt.permissions.push("read");
}
```

This lambda function `populate` adds a `permissions` array to the JWT returned.

Create a file called `test_3.js` and add the following code.

```js
{% remote_include 'https://raw.githubusercontent.com/FusionAuth/fusionauth-example-testing-lambdas/main/complete-application/test_3.js' %}
```

The test function downloads the lambda from FusionAuth using `getLambda()`, runs `eval` it to make it available in memory, and calls it, passing it a mock `user` object. You need to mock only the fields the lambda needs in this parameter. In this test, you've added a `roles` array inside application `registrations`.

Run the test.

```bash
node test_3.js
```

The output is as follows.

```bash
TAP version 13
# test lambda rejects returns permissions based on role
ok 1 Check admin and viewer has all permissions
ok 2 Check editor has write permission
ok 3 Check editor has read permission

1..3
# tests 3
# pass  3

# ok
```

Note that using `eval` in JavaScript is a massive security risk. Anyone with access to your FusionAuth admin UI can put malicious code into your lambdas that could use Node.js to access your local disk, or send passwords over the Internet. To keep safe, run your tests only in a Docker or LXC container with no disk access to your physical machine, and no passwords stored in the container.

### How To Run All The Tests
If you want to run your entire test suite, use the following command.

```bash
npx tape test_*.js | npx faucet
```

All tests should be green, as follows.

```bash
✓ test login returns JWT with "Goodbye World"
✓ test lambda rejects sanctioned emails and accepts others
✓ test lambda rejects returns permissions based on role
# tests 6
# pass  6
✓ ok
```