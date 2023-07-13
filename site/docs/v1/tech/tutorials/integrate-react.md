---
layout: doc
title: Integrate Your React Application With FusionAuth
description: Integrate your React application with FusionAuth
navcategory: getting-started
prerequisites: nodejs
technology: React
language: JavaScript
---

## Integrate Your {{page.technology}} Application With FusionAuth

{% include docs/integration/_intro.md %}

This tutorial uses the hosted backend. 

{% include docs/_hosted-backend-warning.md %}

## Prerequisites

{% include docs/integration/_prerequisites.md %}

## Download and Install FusionAuth

{% include docs/integration/_install-fusionauth.md %}

## Create a User and an API Key

{% include docs/integration/_add-user.md language=page.language %}

## Configure FusionAuth

Next, you need to set up FusionAuth. This can be done in different ways, but we’re going to use the Typescript client library. The below instructions use `npm` on the command line, but you can use the client library with an IDE of your preference as well.

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

Then copy and paste the following file into `setup-react.js`. This file uses the [FusionAuth API](/docs/v1/tech/apis/) to configure an Application, CORS and more to allow for easy integration. 

```javascript
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-client-libraries/main/typescript/setup-react.js %}
```

Then, you can run the setup script.

{% include _callout-note.liquid content="The setup script is designed to run on a newly installed FusionAuth instance with only one user and no tenants other than `Default`. To follow this guide on a FusionAuth instance that does not meet these criteria, you may need to modify the above script. <br><br> Refer to the [Typescript client library](/docs/v1/tech/client-libraries/typescript) documentation for more information." %}

```shell
fusionauth_api_key=YOUR_API_KEY_FROM_ABOVE npm run setup-react
```

If you are using PowerShell, you will need to set the environment variable in a separate command before executing the script.

```shell
$env:fusionauth_api_key='YOUR_API_KEY_FROM_ABOVE'
npm run setup-react
```

If you want, you can [log into your instance](http://localhost:9011){:target="_blank"} and examine the new Application the script created for you.

## Create Your {{page.technology}} Application

Now you are going to create a {{page.technology}} application. While this section uses a simple {{page.technology}} application, you can use the same steps to integrate any {{page.technology}} application with FusionAuth.

First, make a directory:

```shell
mkdir ../setup-react && cd ../setup-react
```

Next, create a simple {{page.technology}} template using vite. Using this lets you easily integrate FusionAuth. For a production application you'll probably use something like [NextJS or Remix](/docs/quickstarts/#single-page-app).

```shell
npm create vite@latest react-app -- --template react
```

Now, change into the `react-app` directory and install the needed packages.

```shell
cd react-app && npm install
```

You can start up the server and visit the URL displayed to ensure the default application works.

```shell
npm run dev
```

You'll want to open another terminal window to continue. Edit `src/App.jsx` to make changes to the view to test out the automatic reloading.

{% capture callout_content %}If you are using a different port than 5173 for your {{page.technology}} app, update the redirect URL in the setup script, or modify it manually. It needs to match.{% endcapture %}
{% include _callout-tip.liquid content=callout_content %}

Now, let's install the [FusionAuth React SDK](https://www.npmjs.com/package/@fusionauth/react-sdk).

```shell
npm install @fusionauth/react-sdk
```

Update `src/main.jsx` to wrap your app with `FusionAuthProvider`. This file should look similar to this, but make sure you update the attributes of the provider if you modify the port:

```jsx
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-react-guide/main/src/main.jsx %}
```

Now, let's add a login and logout button to your {{page.technology}} application. Open up `src/App.jsx` and replace the content with the following:

```jsx
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-react-guide/main/src/App.jsx %}
```

In this code, you are adding in the FusionAuth login and logout buttons, as well as a welcome message which will only show up if the user is logged in.

## Testing the Authentication Flow

You can now open up an incognito window and visit [the {{page.technology}} app](http://localhost:5173). View the page and log in with the user you configured. If you used the setup script, it will be `richard@example.com`.

{% include docs/_image.liquid src="/assets/img/docs/quickstarts/react/react-app.png" alt="The sample React application." class="img-fluid" figure=true %}

You've successfully added login and logout to a React application.

You now have an access token safely stored as a cookie. Any requests you make to an API on the same domain will receive the access token. The API can then validate the token and return data or otherwise offer functionality.

{% comment %}
TODO update to point to an API that looks for a JWT in the correct cookie
{% endcomment %}
