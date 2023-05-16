---
layout: doc
title: Integrate Your Express.js API With FusionAuth
description: Integrate your Express.js API with FusionAuth
navcategory: getting-started
prerequisites: Node.JS
language: JavaScript
technology: Express.js
---

{% include docs/integration/_intro_api.md %}

## Prerequisites

{% include docs/integration/_prerequisites.md %}

## Download and Install FusionAuth

{% include docs/integration/_install-fusionauth.md %}

## Create a User and an API Key

{% include docs/integration/_add-user.md language=page.language %}

## Configure FusionAuth

Next, you need to set up FusionAuth. This can be done in different ways, but we are going to use the {{page.language}} client library. The below instructions use `npm` on the command line, but you can use the client library with an IDE of your preference as well.

First, make a directory:

```shell
mkdir setup-fusionauth && cd setup-fusionauth
```

Now, copy and paste the following file into `package.json`.

```javascript
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-client-libraries/main/typescript/package.json %}
```

Now you need to install the dependencies in `package.json`.

```shell
npm install
```

Then copy and paste the following file into `setup.js`. This file uses the [FusionAuth API](/docs/v1/tech/apis/) to configure an Application and more to allow for easy integration.

```javascript
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-client-libraries/main/typescript/setup.js %}
```

Then, you can run the setup script.

{% include _callout-note.liquid content="The setup script is designed to run on a newly installed FusionAuth instance with only one user and no tenants other than `Default`. To follow this guide on a FusionAuth instance that does not meet these criteria, you may need to modify the above script. <br><br> Refer to the [Typescript client library](/docs/v1/tech/client-libraries/typescript) documentation for more information." %}

```shell
fusionauth_api_key=YOUR_API_KEY_FROM_ABOVE npm run setup
```

If you are using PowerShell, you will need to set the environment variable in a separate command before executing the script.

```shell
$env:fusionauth_api_key='YOUR_API_KEY_FROM_ABOVE'
npm run setup
```

If you want, you can [log into your instance](http://localhost:9011) and examine the new Application the script created for you.

## Create Your {{page.technology}} API

Now you are going to create a {{page.technology}} API. While this section uses a simple {{page.technology}} API, you can use the same steps to integrate any {{page.technology}} API with FusionAuth.

First, make a directory.

```shell
mkdir ../setup-express-api && cd ../setup-express-api
```

Create a `package.json` file with the following contents to set up the dependencies.

```json
{% remote_include https://raw.githubusercontent.com/sonderformat-llc/fusionauth-example-express-api/master/package.json %}
```

Now, install the needed packages.

```shell
npm install
```

First, you need to set up the web server. Create a `bin` directory and a `www` file with the following content.

```javascript
{% remote_include https://raw.githubusercontent.com/sonderformat-llc/fusionauth-example-express-api/master/bin/www %}
```

Next, to define routes for your API, create a `routes` directory and an `index.js` file with the contents below.

```javascript
{% remote_include https://raw.githubusercontent.com/sonderformat-llc/fusionauth-example-express-api/master/routes/index.js %}
```

To validate the access token, create a `middlewares` directory and an `authentication.js` file with the contents below.

```javascript
{% remote_include https://raw.githubusercontent.com/sonderformat-llc/fusionauth-example-express-api/master/middlewares/authentication.js %}
```

To finish the API, create an `app.js` file in the root directory. This will be the main entrypoint for your API.

```javascript
{% remote_include https://raw.githubusercontent.com/sonderformat-llc/fusionauth-example-express-api/master/app.js %}
```

To test the {{page.technology}} API, we will use a small vanilla javascript application. Create an `app` directory and an `index.html` file with the contents below.

```javascript
{% remote_include https://raw.githubusercontent.com/sonderformat-llc/fusionauth-example-express-api/master/app/index.html %}
```

Once you have created these files, start up the {{page.technology}} API using this command:

```shell
npm start
```

And in a second terminal window, run the following command to start the test application:

```shell
npx http-server app -p 5173
```

Open [the test application](http://localhost:5173) in an incognito window and use the buttons to test the functionality.

* Login — Log into FusionAuth
* Call API — Make a request to the {{page.technology}} API
* Refresh Token — Call the FusionAuth hosted backend API to refresh the access token.
* Retrieve FusionAuth user information — Call the FusionAuth hosted backend API to retrieve the user information.
* Logout — Log out of FusionAuth
