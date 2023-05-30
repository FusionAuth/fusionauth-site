---
layout: doc
title: Integrate Your .NET Core API With FusionAuth
description: Integrate Your .NET Core API With FusionAuth Using FusionAuth Hosted Backend
navcategory: getting-started
prerequisites: .NET Core, ASP.NET
technology: .NET Core
language: .NET Core
---

## Integrate Your {{page.technology}} API With FusionAuth

{% include docs/integration/_intro-api.md %}

FusionAuth has a [Hosted Backend APIs feature](/docs/v1/tech/apis/hosted-backend) that can make it easier to integrate your API with FusionAuth. These APIs provide a pre-built solution for getting your app up and running using the OAuth2 Authorization Code grant with PKCE. We have in the past shown you how to create these endpoints yourself but this solution allows you to get going with your app without writing any backend code dealing with OAuth2. The Hosted Backend APIs deal with the OAuth2 flow and store the client tokens in cookies for you. Your service API can then check the cookies to verify the user is authenticated and authorized. For this to work, your FusionAuth instance, frontend, and your API must all be hosted on the same domain.

## Prerequisites

{% include docs/integration/_prerequisites.md %}

Although this guide shows how to build the {{page.technology}} application using command line tools, you can also use [Visual Studio](https://visualstudio.microsoft.com) to build and debug the project.

## Download and Install FusionAuth

{% include docs/integration/_install-fusionauth.md %}

## Create a User and an API Key

{% include docs/integration/_add-user.md %}

## Configure FusionAuth

Next, you need to set up FusionAuth. This can be done in different ways, but we’re going to use the [{{page.language}} client library](/docs/v1/tech/client-libraries/netcore). You can use the client library with an IDE of your preference as well.

First, make a directory:

```shell
mkdir setup-fusionauth && cd setup-fusionauth
```

Then, create a {{page.technology}} project:

```shell
dotnet new console --output SetupFusionauth && cd SetupFusionauth
```

Then, you’ll need to import a few NuGet packages:

```shell
dotnet add package JSON.Net
dotnet add package FusionAuth.Client 
```

Now, copy and paste the following code into `Program.cs`.

```csharp
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-client-libraries/main/dotnet/Program.cs %}
```

Update the `application.oauthConfiguration.authorizedRedirectURLs` value to `http://localhost:3000/profile.html`. Update the `application.oauthConfiguration.logoutURL` value to `http://localhost:3000`.

You can then publish and run the application. Replace `<YOUR_API_KEY>` with the API key that you generated.

{% include _callout-note.liquid content="The setup script is designed to run on a newly installed FusionAuth instance with only one user and no tenants other than `Default`. To follow this guide on a FusionAuth instance that does not meet these criteria, you may need to modify the above script. <br><br> Refer to the  [.NET Core client library](/docs/v1/tech/client-libraries/netcore) documentation for more information.<br><br>The path to the SetupFusionauth executable will be different depending on your platform." %}

```shell
dotnet publish -r osx-x64
fusionauth_api_key=<YOUR_API_KEY> bin/Debug/net7.0/osx-x64/publish/SetupFusionauth 
```

If you are using PowerShell, you will need to set the environment variable in a separate command before executing the script.

```shell
$env:fusionauth_api_key='<your API key>'
```

If you want, you can [log into your instance](http://localhost:9011) and examine the new API configuration the script created for you. You'd navigate to the <span class="breadcrumb">Applications</span> tab to do so.

## Create Your {{page.technology}} API

Now you are going to create a {{page.technology}} API. While this section builds a simple {{page.technology}} API, you can use the same configuration to build a more complex {{page.technology}} API.

First, create the skeleton of the {{page.technology}} API. Dotnet has a nice generator to build this out.

```shell
dotnet new webapi -o MyAPI && cd MyAPI
```

Then, you’ll need to import a few NuGet packages:

```shell
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package System.IdentityModel.Tokens.Jwt
```

You can now start writing the code for your {{page.technology}} API. First, let's create a controller which gives back a JSON message. Create a file called `IdentityController.cs` in the `Controllers` folder, and add the following code to it.

```csharp
{% remote_include https://raw.githubusercontent.com/ritza-co/fusionauth-dotnet-api-example/main/MyAPI/Controllers/IdentityController.cs %}
```

This controller returns a JSON object with identity and claims of the user accessing the service.

Next, update the `Program.cs` file to look like this:

```csharp
{% remote_include https://raw.githubusercontent.com/ritza-co/fusionauth-dotnet-api-example/main/MyAPI/Program.cs %}
```

Note the changes in the `builder.Services.AddAuthentication()` section.This updates the authentication code to extract the JWT from the `app.idt` cookie. The `app.idt` cookie has an OpenID Connect JWT that contains the user's identity and claims. The `app.idt` cookie is set by the Hosted Backend APIs when the user logs in. The `app.idt` cookie is set to the same domain as the FusionAuth instance. This allows the {{page.technology}} API to read the cookie and extract the JWT. Also note that the issuer is set to `http://localhost:9011` which is the default FusionAuth URL. If you are using a different URL, you should update this value.  The dotnet authentication libraries will seamlessly validate the JWT, including the audience, and extract the identity and claims. There is no more you need to do on your part!

You can now start up your server. You should do it in a new terminal window so that you can continue to edit the {{page.technology}} code.

To see the results, you should publish this application and run it. There are [multiple ways of deploying an application](https://docs.microsoft.com/en-us/dotnet/core/deploying/), but publishing ensures your deployment process is repeatable. You can use the [RID catalog](https://learn.microsoft.com/en-us/dotnet/core/rid-catalog) to build different versions of this application for different platforms. Here’s the command to publish a standalone executable you could deploy behind a proxy like Nginx:

```shell
dotnet publish -r osx-x64
```

Then run  the executable:

```shell
ASPNETCORE_ENVIRONMENT=Development bin/Debug/net7.0/osx-x64/publish/MyAPI
```

You can use [cURL](https://curl.se) to see the output of the API: 

```shell
curl -v http://localhost:5000/identity
```

It should return with a `401 Unauthorized` response, indicating that the route is secure. The next step is to setup the FusionAuth Hosted Backend API and log in to get a JWT in a cookie that your API can read.

## Create a Login Redirect Page

To demonstrate how simple it is to use the Hosted Backend API, you are going to create a simple login page that redirects to the Hosted Backend API. This page will be a plain HTML page, with no special code or libraries. This page will manage the redirect to the FusionAuth Hosted Backend API login, which will handle the OAuth flow, and then have a button to call your API with the JWT cookie.

Create a new directory for the login page:

```shell
mkdir LoginPage && cd LoginPage
```

Then, create 2 new files: `index.html` and `profile.html`. Add the following code to the `index.html` file:

```html
{% remote_include https://raw.githubusercontent.com/ritza-co/fusionauth-dotnet-api-example/main/LoginPage/index.html %}
```

This page is the main page. It just has a link which redirects to FusionAuth's Hosted Backend API login route. Note the format of the URL in the anchor `href`: `GET /app/login/{clientId}?redirect_uri={redirectUri}&state={state}&scope={scope}`

In this case, `clientId` is `e9fdb985-9173-4e01-9d73-ac2d60d1dc8e`, as this is hardcoded in the setup script. For Applications added to FusionAuth through the UI, you can get the ClientId by browsing to the application in FusionAuth and viewing it.

The `redirect_uri` is the URL that the Hosted Backend API will redirect to after the login flow is complete. It will be redirected to the `profile.html` page in this case.

The `state` parameter is any information that you would like returned on successful login.

The `scope` is the OAuth scopes that you want to request. In this case, you are requesting the `openid` scope, which is required to get the `app.idt` cookie containing the JWT with the user's claims. You can request other scopes as well, such as `offline_access` to get a refresh token, which can be used to get a new access token when the current one expires. The refresh token is stored in a cookie called `app.rt`.

Now add the following to the `Profile.html` file:

```html
{% remote_include https://raw.githubusercontent.com/ritza-co/fusionauth-dotnet-api-example/main/LoginPage/profile.html %}
```

This page is the page that the Hosted Backend API will redirect to after the login flow is complete.

The page first calls the [`/me` route](/docs/v1/tech/apis/hosted-backend#me) which is part of FusionAuth Hosted Backend API. This route returns the identity of the currently logged in user.

The `Profile.html` page also has a button that calls the `identity` route of the {{page.technology}} API. Note that the `fetch` call for this button includes the `credentials: 'include'` option. This option tells the browser to include the cookies in the request, so that the {{page.technology}} API can read the `app.idt` cookie and extract the JWT.

If the API call is successful, the `identity` route will return the identity and claims of the user. If the API call is not successful, the `identity` route will return a `401 Unauthorized` response. In this case, the code will try refreshing the access token using the refresh token in the `app.rt` cookie. To do this, the code makes a `fetch` request to the [refresh token route](/docs/v1/tech/apis/hosted-backend#refresh) of the Hosted Backend API. If the refresh token is valid, FusionAuth's Hosted Backend API will return a new access token. The code then tries the `identity` route again with the new access token.


{% include _callout-note.liquid content="A note on CORS (Cross-Origin Resource Sharing): For this setup to work, all components, including the web page, the .NET Core API, and FusionAuth, must be on the same domain. This is because the `app.idt` JWT cookie and `app.rt` refresh cookie are set to the same domain as the FusionAuth instance. Since everything runs on the same domain, CORS won't usually be an issue. However, you'll be running all of this on `localhost` to test, with each component running on a different port. This will cause CORS issues. For this, we need to enable CORS on FusionAuth for the login webpage to access the FusionAuth Hosted Backend API. To do this, navigate to 'Settings', then 'System' on the sidebar, and then the 'CORS' tab. Enable CORS, and check 'GET', 'POST' and 'OPTIONS'. Enable 'Allow Credentials', and  add `http://localhost:3000` to the list of allowed origins." %}

{% include docs/_image.liquid src="/assets/img/docs/integrations/dotnet-hosted-api-integration/cors-settings.png" alt="CORS settings in FusionAuth for testing on Localhost" class="img-fluid bottom-cropped" width="1200" figure=false %}

You can now serve up the login and profile static pages. An easy way to do this is to use the [http-server](https://www.npmjs.com/package/http-server) package via `npx`. Change into the `LoginPage` directory and run the following command:

```shell
npx http-server -a localhost -p 3000
```

This will serve the website on `http://localhost:3000`

## Testing the API Flow

Navigate to the login webpage at `http://localhost:3000`. Click the "Login" button. This will redirect you to FusionAuth's Hosted Backend API login page. Enter the email and password of the user created in the setup script earlier for your FusionAuth instance. You will be redirected back to the login webpage, and the results from the `/me` FusionAuth endpoint alongside the "Call the API" button will be shown. Click this button. This will call the `identity` route of the {{page.technology}} API, which will echo back the identity and claims of the user, from the JWT in the `app.idt` cookie. You should see something similar to the following output:

{% include docs/_image.liquid src="/assets/img/docs/integrations/dotnet-hosted-api-integration/profile-output.png" alt="Output of the /me call and the dotnet API call" class="img-fluid bottom-cropped" width="1200" figure=false %}
