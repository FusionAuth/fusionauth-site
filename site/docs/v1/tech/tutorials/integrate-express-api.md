---
layout: doc
title: Integrate Your Express API With FusionAuth
description: Integrate your Express API with FusionAuth
navcategory: getting-started
prerequisites: Node.js
language: TypeScript
technology: Express
---

{% include docs/integration/_intro-api.md %}

## Prerequisites

{% include docs/integration/_prerequisites.md %}

## Download and Install FusionAuth

{% include docs/integration/_install-fusionauth.md %}

## Create a User and an API Key

{% include docs/integration/_add-user.md %}

## Configure FusionAuth

Next, you need to set up FusionAuth. This can be done in different ways, but we are going to use the {{page.language}} client library. The instructions below use `npm` on the command line, but you can use the client library with an IDE of your preference as well.

First, make a directory:

```shell
mkdir setup-fusionauth && cd setup-fusionauth
```

Now, copy and paste the following code into `package.json`.

```javascript
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-client-libraries/main/typescript/package.json %}
```

Now you need to install the dependencies in `package.json`.

```shell
npm install
```

Then copy and paste the following code into `setup.js`. This file uses the [FusionAuth API](/docs/v1/tech/apis/) to configure an Application and more to allow for easy integration.

```javascript
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-client-libraries/main/typescript/setup-express.js %}
```

Then, you can run the setup script.

{% include _callout-note.liquid content="The setup script is designed to run on a newly installed FusionAuth instance with only one user and no tenants other than `Default`. To follow this guide on a FusionAuth instance that does not meet these criteria, you may need to modify the script above. <br><br> Refer to the [Typescript client library](/docs/v1/tech/client-libraries/typescript) documentation for more information." %}

```shell
fusionauth_api_key=YOUR_API_KEY_FROM_ABOVE node setup.js
```

If you are using PowerShell, you will need to set the environment variable in a separate command before executing the script.

```shell
$env:fusionauth_api_key='YOUR_API_KEY_FROM_ABOVE'
node setup.js
```

If you want, you can [log into your instance](http://localhost:9011) and examine the new Application the script created for you.

## Create Your {{page.technology}} API

Now you are going to create an {{page.technology}} API. While this section uses a simple {{page.technology}} API, you can use the same steps to integrate any {{page.technology}} API with FusionAuth.

First, make a directory.

```shell
mkdir ../setup-express-api && cd ../setup-express-api
```

Create a `package.json` file with the following contents to set up the dependencies.

```json
{% remote_include https://raw.githubusercontent.com/fusionauth/fusionauth-example-express-api/master/package.json %}
```

Now, install the needed packages.

```shell
npm install
```

You are going to create some files in different directories, so pay attention to the final directory structure that you should have after completing these steps.
```
├── app.js
├── bin
│   └── www
├── middlewares
│   └── authentication.js
├── package.json
├── package-lock.json
├── routes
│   └── index.js
```

First, you need to set up the web server. Create a `bin` directory and a `www` file with the following content.

```javascript
{% remote_include https://raw.githubusercontent.com/fusionauth/fusionauth-example-express-api/master/bin/www %}
```

Next, to define routes for your API, create a `routes` directory and an `index.js` file with the contents below.

```javascript
{% remote_include https://raw.githubusercontent.com/fusionauth/fusionauth-example-express-api/master/routes/index.js %}
```

To validate the access token, create a `middlewares` directory and an `authentication.js` file with the contents below.

```javascript
{% remote_include https://raw.githubusercontent.com/fusionauth/fusionauth-example-express-api/master/middlewares/authentication.js %}
```

To finish the API, create an `app.js` file in the root directory. This will be the main entrypoint for your API.

```javascript
{% remote_include https://raw.githubusercontent.com/fusionauth/fusionauth-example-express-api/master/app.js %}
```

Once you have created these files, you can test the API.

Now, open the terminal window and run:

```shell
npm start
```

Visit [http://localhost:3000/messages](http://localhost:3000/messages), you'll get an error:

```json
{"error":"Missing token cookie and Authorization header"}
```

Your API is protected. Now, let's get an access token so authorized clients can get the API results.

## Testing the API Flow

There are a number of ways to get an access token, as mentioned, but for clarity, let's use the login API to mimic a client.

Run this command in a terminal window:

```shell
curl -H 'Authorization: YOUR_API_KEY_FROM_ABOVE' \
     -H 'Content-type: application/json' \
     -d '{"loginId": "YOUR_EMAIL", "password":"YOUR_PASSWORD","applicationId": "e9fdb985-9173-4e01-9d73-ac2d60d1dc8e"}' \
    http://localhost:9011/api/login 
```

Replace `YOUR_EMAIL` and `YOUR_PASSWORD` with the username and password you set up previously.

This request will return something like this:

```json
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-site/master/site/docs/src/json/users/login-response.json %}
```

Grab the `token` field (which begins with `ey`). Replace YOUR_TOKEN below with that value, and run this command:

```shell
curl --cookie 'app.at=YOUR_TOKEN' http://localhost:3000/messages
```

Here you are placing the token in a cookie named `app.at`. This is for compatibility with the FusionAuth best practices and [the hosted backend](/docs/v1/tech/apis/hosted-backend).

If you want to store it in a different cookie or send it in the header, make sure you modify the middleware and restart the {{page.technology}} API.

This will result in the JSON below.

```json
{"messages":["Hello"]}
```
