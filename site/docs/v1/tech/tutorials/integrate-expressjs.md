---
layout: doc
title: Integrate Your Express.js Application With FusionAuth
description: Integrate your Express.js application with FusionAuth
navcategory: getting-started
---

{% assign language = "TypeScript" %}
{% assign technology = "Express.js" %}
{% include docs/v1/tech/tutorials/_integrate-intro.liquid technology=technology %}

## Prerequisites

{% include docs/v1/tech/tutorials/_integrate-prerequisites.liquid prerequisites="Node.js" %}

## Download and Install FusionAuth

{% include docs/v1/tech/tutorials/_integrate-install-fusionauth.liquid %}

## Create a User and an API Key

{% include docs/v1/tech/tutorials/_integrate-add-user.liquid language=language %}

## Configure FusionAuth

Next, you need to set up FusionAuth.
This can be done in different ways, but we’re going to use the {{language}} client library.
The below instructions use {{technology}} from the command line, but you can use the client library with an IDE of your preference as well.

```shell
mkdir setup-fusionauth && cd setup-fusionauth
```

If you want, you can [login to your instance](http://localhost:9011) and examine the new application configuration the script created for you.

Now, let's install the client library.

```shell
npm install @fusionauth/typescript-client
```

Then copy and paste the following code into the `setup.js` file.

```javascript
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-client-libraries/main/typescript/setup.js %}
```

Then, you can run the setup class. This will create the FusionAuth configuration for your {{technology}} application.

```shell
node setup.js
```

## Create Your {{technology}} Application

Now you are going to create an {{technology}} application. While this section uses a simple {{technology}} application, you can use the same configuration to integrate your {{technology}} application with FusionAuth.

First, make a directory.

```shell
mkdir ../setup-expressjs && cd ../setup-expressjs
```

Create a `package.json` file with the following contents to set up the dependencies.

```json
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-node/master/package.json %}
```

Install the dependencies.

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

Once you’ve created these files, start up the {{technology}} application using this command:

```shell
npm start
```

You can now open up an incognito window and visit [the {{technology}} app](http://localhost:3000).
Log in with the user account you created when setting up FusionAuth, and you’ll see the email of the user next to a logout link.
