---
layout: doc
title: Integrate Your Express.js Application With FusionAuth
description: Integrate your Express.js application with FusionAuth
navcategory: getting-started
prerequisites: Node.js
language: JavaScript
technology: Express.js
---

{% include docs/integration/_intro.md %}

## Prerequisites

{% include docs/integration/_prerequisites.md %}

## Download and Install FusionAuth

{% include docs/integration/_install-fusionauth.md %}

## Create a User and an API Key

{% include docs/integration/_add-user.md language=page.language %}

## Configure FusionAuth

Next, you need to set up FusionAuth. This can be done in different ways, but we’re going to use the {{page.language}} client library. The below instructions use `npm` on the command line, but you can use the client library with an IDE of your preference as well.

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

## Create Your {{page.technology}} Application

Now you are going to create a {{page.technology}} application. While this section uses a simple {{page.technology}} application, you can use the same steps to integrate any {{page.technology}} application with FusionAuth.

First, make a directory.

```shell
mkdir ../setup-expressjs && cd ../setup-expressjs
```

Create a `package.json` file with the following contents to set up the dependencies.

```json
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-node/master/package.json %}
```

Install the needed packages.

```shell
npm install
```

You are going to create some files in different directories, so pay attention to the final directory structure that you should have after completing these steps. 

```
├── app.js
├── bin
│   └── www
├── package.json
├── package-lock.json
├── routes
│   └── index.js
└── views
    ├── error.pug
    ├── index.pug
    └── layout.pug
```

To set up the web server, create a directory called `bin` and add the following to a `www` file.

```javascript
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-node/master/bin/www %}
```

To define pages for your application, create a `routes` folder and an `index.js` file there with the contents below.

```javascript
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-node/master/routes/index.js %}
```

The `views` directory will hold files responsible for rendering the pages.

First, create a file called `layout.pug` that will contain the main structure for your application.

```
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-node/master/views/layout.pug %}
```

Now, paste these contents in an `index.pug` file that will be rendered when visiting the main home page.

```
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-node/master/views/index.pug %}
```

Finally, add an `error.pug` file to render error messages.

```
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-node/master/views/error.pug %}
```

Stitch everything together by creating an `app.js` file that will be the main entrypoint for your application.

```javascript
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-node/master/app.js %}
```

Once you’ve created these files, you can test the application.

## Testing the Authentication Flow

Start up the {{page.technology}} application using this command:

```shell
npm start
```

You can now open up an incognito window and visit [the {{page.technology}} app](http://localhost:3000).

{% include _image.liquid src="/assets/img/docs/integrations/expressjs-integration/expressjs-preview.png" alt="Express.js application home page." class="img-fluid bottom-cropped" width="1200" figure=false %}

Log in with the user account you created when setting up FusionAuth, and you’ll see the name of the user next to a logout link.

{% include _image.liquid src="/assets/img/docs/integrations/expressjs-integration/expressjs-login-preview.png" alt="Express.js application home page." class="img-fluid bottom-cropped" width="1200" figure=false %}

Now, click <span>Logout</span>{:.uielement}. If successful, you should be brought back to the main homepage with the <span>Login</span>{:.uielement} button again.


The full code for this guide can be found [here](https://github.com/FusionAuth/fusionauth-example-node).
