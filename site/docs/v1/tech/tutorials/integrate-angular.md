---
layout: doc
title: Integrate Your Angular Application With FusionAuth
description: Integrate your Angular application with FusionAuth
navcategory: getting-started
prerequisites: nodejs
technology: Angular
language: TypeScript
---

{% include docs/integration/_intro.md %}

## Prerequisites

{% include docs/integration/_prerequisites.md %}

## Download and Install FusionAuth

{% include docs/integration/_install-fusionauth.md %}

## Create a User and an API Key

{% include docs/integration/_add-user.md language=page.language %}

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

Then copy and paste the following code into `setup.js`. This file uses the [FusionAuth API](/docs/v1/tech/apis/) to configure an Application, CORS, and more to allow for easy integration.

```javascript
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-client-libraries/main/typescript/setup-angular.js %}
```

Then, you can run the setup script.

```shell
fusionauth_api_key=YOUR_API_KEY_FROM_ABOVE node setup.js
```

{% include _callout-note.liquid content="The setup script is designed to run on a newly installed FusionAuth instance with only one user and no tenants other than `Default`. To follow this guide on a FusionAuth instance that does not meet these criteria, you may need to modify the above script. <br><br> Refer to the [Typescript client library](/docs/v1/tech/client-libraries/typescript) documentation for more information." %}

If you are using PowerShell, you will need to set the environment variable in a separate command before executing the script.

```shell
$env:fusionauth_api_key='YOUR_API_KEY_FROM_ABOVE'
node setup.js
```

If you want, you can [log into your instance](http://localhost:9011) and examine the new Application the script created for you.

## Create Your {{page.technology}} Application

Now you are going to create an {{page.technology}} application. While this section uses a simple {{page.technology}} application, you can use the same steps to integrate any {{page.technology}} application with FusionAuth.

First, create a simple {{page.technology}} template using `@angular/cli`. Using this lets you easily integrate FusionAuth.

```shell
npx -p @angular/cli ng new setup-angular --defaults
```

You can start up the server and visit the URL displayed to ensure the default application works.

```shell
cd setup-angular
npx ng serve
```

You will want to open another terminal window to continue. Edit `src/app/app.component.html` to make changes to the view to test out the automatic reloading.

{% capture callout_content %}If you are using a different port than 4200 for your {{page.technology}} app, update the redirect URL in the setup script, or modify it manually. It needs to match.{% endcapture %}
{% include _callout-tip.liquid content=callout_content %}

Now, let's install the [FusionAuth Angular SDK](https://www.npmjs.com/package/@fusionauth/angular-sdk).

```shell
npm install @fusionauth/angular-sdk
```

Add the following to `src/app/app.module.ts` to import the FusionAuth Angular SDK. This file should look similar to this, but make sure you update the attributes of the provider if you modify the port:

```typescript
{% remote_include https://raw.githubusercontent.com/fusionauth/fusionauth-example-angular-guide/main/src/app/app.module.ts %}
```

Now, let us add a login, register, and logout button to your {{page.technology}} application. Open up `src/app/app.component.html` and replace the content with the following:

```html
{% remote_include https://raw.githubusercontent.com/fusionauth/fusionauth-example-angular-guide/main/src/app/app.component.html %}
```

Then, replace the content of `src/app/app.component.ts` with the following code:

```typescript
{% remote_include https://raw.githubusercontent.com/fusionauth/fusionauth-example-angular-guide/main/src/app/app.component.ts %}
```

In this code, you are adding in the FusionAuth login and logout buttons, as well as a welcome message which will only show up if the user is logged in.

## Testing the Authentication Flow

You can now open up an incognito window and visit [the {{page.technology}} app](http://localhost:4200). View the page and log in with the user you configured.

{% include _image.liquid src="/assets/img/docs/quickstarts/angular/angular-app.png" alt="The sample Angular application." class="img-fluid" figure=true %}

You have successfully added login, registration, and logout to an Angular application.

You now have an access token safely stored as a cookie. Any requests you make to an API on the same domain will receive the access token. The API can then validate the token and return data or otherwise offer functionality.

The full code for this guide can be found [here](https://github.com/fusionauth/fusionauth-example-angular-guide).
