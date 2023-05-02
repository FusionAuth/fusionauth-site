---
layout: doc 
title: Integrate Your C# .NET Application With FusionAuth 
description: Integrate your C# .NET application with FusionAuth 
navcategory: getting-started
prerequisites: C# and dotnet
technology: .NET 7
language: C#
---

## Integrate Your {{page.technology}} Application With FusionAuth

{% include docs/integration/_intro.md %}

## Prerequisites

{% include docs/integration/_prerequisites.md %} 

Although this guide shows how to build the {{page.technology}} application using command line tools, you can also use [Visual Studio](https://visualstudio.microsoft.com) to build the project.

## Download and Install FusionAuth

{% include docs/integration/_install-fusionauth.md %}

## Create a User and an API Key

{% include docs/integration/_add-user.md %}

## Configure FusionAuth

Next, you need to set up FusionAuth. This can be done in different ways, but you’re going to use the {{page.language}} client library. The below instructions use `dotnet` from the command line, but you can use the client library with an IDE of your choice as well.

First, create a {{page.technology}} project in a new directory:

```shell
dotnet new console --output SetupFusionauth && cd SetupFusionauth
```

If you want, you can [login to your instance](http://localhost:9011) and examine the new application configuration the script created for you.

Now, copy and paste the following code into `Program.cs`.

```csharp
{% remote_include https://raw.githubusercontent.com/ritza-co/fusionauth-dotnet-integration/main/SetupFusionauth/Program.cs %}
```

Then, you’ll need to import a few NuGet packages:

```shell
dotnet add package JSON.Net # for debugging
dotnet add package FusionAuth.Client # for our client access
```

## Create Your {{page.technology}} Application

Now you are going to create a {{page.technology}} application. While this section uses a simple {{page.technology}} application, you can use the same configuration to integrate your {{page.technology}} application with FusionAuth.

You’ll use [Razor Pages](https://learn.microsoft.com/en-us/aspnet/core/razor-pages/?view=aspnetcore-7.0&tabs=visual-studio) and {{page.technology}}. This application will display common information to all users. There will also be a secured area, only available to an authenticated user. The [full source code](https://github.com/ritza-co/fusionauth-dotnet-integration) is available if you want to download it and take a look.

First, create a new web application using the `dotnet` CLI and go to that directory:

```shell
dotnet new webapp -o SetupDotnet && cd SetupDotnet
```

To see the results, you should publish this application and run it. There are [multiple ways of deploying an application](https://docs.microsoft.com/en-us/dotnet/core/deploying/), but publishing ensures your deployment process is repeatable. You can use the [RID catalog](https://learn.microsoft.com/en-us/dotnet/core/rid-catalog) to build different versions of this application for different platforms. Here’s the command to publish a standalone executable you could deploy behind a proxy like Nginx:

```shell
dotnet publish -r osx-x64
```

Then start up the executable.

```shell
ASPNETCORE_ENVIRONMENT=Development bin/Debug/net7.0/osx-x64/publish/SetupDotnet
```

{% include _image.liquid src="/assets/img/docs/integrations/dotnet-integration/dotnet-welcome-page.png" alt="Home page for .Net app" class="img-fluid bottom-cropped" width="1200" figure=false %}

You can hit `control-C` to exit this application.

You’ll also want to add a page to be secured, which you can aptly call "Secure". Add `Secure.cshtml` and `Secure.cshtml.cs` to the `SetupDotnet/Pages` directory.

Copy the following code into `Secure.cshtml`:

```html
@page
@model SecureModel
@{
    ViewData["Title"] = "I'm full of secure data";
}
<h1>@ViewData["Title"]</h1>

<p>TBD</p>
```

`Secure.cshtml.cs` should contain this code:

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace SetupDotnet.Pages
{
    public class SecureModel : PageModel
    {
        private readonly ILogger<SecureModel> _logger;

        public SecureModel(ILogger<SecureModel> logger)
        {
            _logger = logger;
        }

        public void OnGet()
        {
        }
    }
}
```

Don’t forget to add a navigation element to `Pages/Shared/_Layout.cshtml` after the "Privacy" list item:

```html
<li class="nav-item">
    <a class="nav-link text-dark" asp-area="" asp-page="/Secure">Secure</a>
</li>
```

Hit `control-C` to exit the application if you haven’t already. Then republish it and start it up again.

```shell
dotnet publish -r osx-x64 && ASPNETCORE_ENVIRONMENT=Development bin/Debug/net7.0/osx-x64/publish/SetupDotnet
```

Visit `http://localhost:5000` and view your new page. Click on <span class="uielement">Secure</span>.

{% include _image.liquid src="/assets/img/docs/integrations/dotnet-integration/dotnet-secure-page.png" alt="Secure page for .Net app" class="img-fluid bottom-cropped" width="1200" figure=false %}

You’ve added a page, but it isn’t secure yet. Let’s do that next.

## Handle login for your {{page.technology}} application

It’s always smart to leverage existing libraries as they are likely to be more secure and better handle edge cases. You’re going to add two new libraries to the application. Make sure you’re in the `SetupDotnet` directory and run these commands to add them.

```shell
dotnet add package Microsoft.AspNetCore.Authentication.OpenIdConnect
dotnet add package IdentityModel.AspNetCore
```

You need to protect the "Secure" page. You do this using the [Authorize filter attribute](https://docs.microsoft.com/en-us/aspnet/core/razor-pages/filter?view=aspnetcore-3.1#authorize-filter-attribute) on the backing class, from `Secure.cshtml.cs`:

```csharp
using Microsoft.AspNetCore.Authorization;

namespace setup_dotnet.Pages
{
    [Authorize]
    public class SecureModel : PageModel
    {
        // ...
    }
}
```

You’ll also display the claims contained in the JWT that FusionAuth creates upon authentication. Here `Secure.cshtml` iterates over the claims. Update that file with the following code. A claim is essentially the information the authentication server has shared about a subject in the JWT.

```html
{% remote_include https://raw.githubusercontent.com/ritza-co/fusionauth-dotnet-integration/main/SetupDotnet/Pages/Secure.cshtml %}
```

You also need to set up some services to specify how this page is protected. Create a `Startup.cs` file and add the following code:

```csharp
{% remote_include https://raw.githubusercontent.com/ritza-co/fusionauth-dotnet-integration/main/SetupDotnet/Startup.cs %}
```

Let’s go through some of the more interesting parts. First, you’re setting up authentication including the scheme and challenge method. You’ll be using cookies to store the authentication information and `"oidc"` for the authentication provider, which is defined further below.

```csharp
services.AddAuthentication(options =>
{
    options.DefaultScheme = "cookie";
    options.DefaultChallengeScheme = "oidc";
})
```

Here you configure the cookie, including setting the cookie name:

```csharp
.AddCookie("cookie", options =>
{
    options.Cookie.Name = Configuration["SetupDotnet:CookieName"];
    // ...
}
```

Finally, you set up the previously referenced authentication provider, `"oidc"`. You could have multiple providers. You create an [OpenIdConnectOptions](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.authentication.openidconnect.openidconnectoptions?view=aspnetcore-7.0) object to fully configure this provider. Setting `ResponseType = "code"` is what forces the use of the Authorization Code grant. You pull configuration information like the client Id from either `appsettings.json` or the environment. These are the values you saved when you were configuring FusionAuth (you’ll add them to `appsettings.json` a bit later). You’ll create an [OpenIdConnectOptions](https://docs.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.authentication.openidconnect.openidconnectoptions?view=aspnetcore-7.0) object to configure your provider. PKCE is turned on by default, so you’re ready for [OAuth 2.1](/blog/2020/04/15/whats-new-in-oauth-2-1).

```csharp
.AddOpenIdConnect("oidc", options =>
{
    options.Authority = Configuration["SetupDotnet:Authority"];

    options.ClientId = Configuration["SetupDotnet:ClientId"];
    options.ClientSecret = Configuration["SetupDotnet:ClientSecret"];
    options.Scope.Add("openid");
    options.ClaimActions.Remove("aud");

    options.ResponseType = "code";
    options.RequireHttpsMetadata = false;
});
```

You also need to turn on authentication for the application:

```csharp
app.UseAuthentication();
```

For debugging, add `IdentityModelEventSource.ShowPII = true;` to the very end of the `Configure` method. This makes it easier to see [errors in the OAuth flow](https://github.com/AzureAD/azure-activedirectory-identitymodel-extensions-for-dotnet/wiki/PII). But in production code, it must be removed.

```csharp
IdentityModelEventSource.ShowPII = true;
```

Here’s the `appsettings.json` file. You need to add the entire <span class="field">SetupDotnet</span> object so that the code above can be configured correctly. <span class="field">Authority</span> is just the location of the user identity server, in this case, FusionAuth.

```json
{% remote_include https://raw.githubusercontent.com/ritza-co/fusionauth-dotnet-integration/main/SetupDotnet/appsettings.json %}
```

Wait, where’s the client secret? This file is in Git, but you should not put secrets under version control. Instead, the client secret is provided on the command line via an environment variable. This change means the correct way to publish and start the web application is now (where you replace `<YOUR_CLIENT_SECRET>` with the client secret value, which for this example is `change-this-in-production-to-be-a-real-secret`):

```shell
dotnet publish -r osx-x64 && ASPNETCORE_ENVIRONMENT=Development SetupDotnet__ClientSecret=<YOUR_CLIENT_SECRET> bin/Debug/net7.0/osx-x64/publish/SetupDotnet
```

Once you’ve updated all these files, you can publish and start the application. You should be able to log in with a previously created user and see the claims. Go to `http://localhost:5000` and click on the <span class="uielement">Secure</span> page. You’ll be prompted to log in using FusionAuth’s default login page. You can [theme the login screen of FusionAuth](/docs/v1/tech/themes/) if you want to make the login page look like your company’s brand.

{% include _image.liquid src="/assets/img/docs/integrations/dotnet-integration/dotnet-login-page.png" alt="FusionAuth login page" class="img-fluid bottom-cropped" width="1200" figure=false %}

After you’ve signed in, you’ll end up at the "Secure" page and will see all claims encoded in the JWT.

{% include _image.liquid src="/assets/img/docs/integrations/dotnet-integration/dotnet-secure-page-claims.png" alt="Logged in page with claims" class="img-fluid bottom-cropped" width="1200" figure=false %}


## Logout

Currently, the app lets you log in but there’s no way to log out. Next, you’ll build the logout functionality and page. This will

- Remove the session cookie
- Redirect to the FusionAuth OAuth logout endpoint

 FusionAuth will then destroy its session and redirect the user back to the app’s configured logout URL.

Add the following file to the `Pages` directory and call it `Logout.cshtml.cs`:

```csharp
{% remote_include https://raw.githubusercontent.com/ritza-co/fusionauth-dotnet-integration/main/SetupDotnet/Pages/Logout.cshtml.cs %}
```

`OnGet` is the important method. Here you sign out using a method of the authentication library, delete the JWT cookie, and send the user to the FusionAuth OAuth logout endpoint.

Now add `Logout.cshtml`. No content is necessary. Just declare the page and model.

```html
{% remote_include https://raw.githubusercontent.com/ritza-co/fusionauth-dotnet-integration/main/SetupDotnet/Pages/Logout.cshtml %}
```

Don’t forget to add a `Logout` link to the navigation, but only if the user is signed in:

```html
@if (User.Identity.IsAuthenticated)
{
    <li class="nav-item">
        <a class="nav-link text-dark" asp-area="" asp-page="/Logout">Logout</a>
    </li>
}
```

## Conclusion

Your directory tree should look like this:

```text
├── docker-compose.yml
├── SetupFusionauth
│   ├── Program.cs
│   ├── setup-fusionauth.csproj
│   ├── setup-fusionauth.sln
└── SetupDotnet
    ├── appsettings.development.json
    ├── appsettings.json
    ├── bin/
        ├── ...
    ├── obj/
        ├── ...
    ├── Pages/
    │   ├── _ViewImports.cshtml
    │   ├── _ViewStart.cshtml
    │   ├── Error.cshtml
    │   ├── Error.cshtml.cs
    │   ├── Index.cshtml
    │   ├── Index.cshtml.cs
    │   ├── Logout.cshtml
    │   ├── Logout.cshtml.cs
    │   ├── Privacy.cshtml
    │   ├── Privacy.cshtml.cs
    │   ├── Secure.cshtml
    │   └── Secure.cshtml.cs
    │   └── Shared/
    │       ├── _Layout.cshtml
    │       ├── _Layout.cshtml.css
    │       └── _ValidateScriptsPartial.cshtml
    ├── Program.cs
    ├── Properties/
    ├── SetupDotnet.csproj
    ├── SetupDotnet.sln
    ├── Startup.cs
    └── wwwroot/
```

Once you’ve created this directory structure, you can start up the {{page.technology}} application using this command:

```shell
ASPNETCORE_ENVIRONMENT=Development SetupDotnet__ClientSecret='change-this-in-production-to-be-a-real-secret' bin/Debug/net7.0/osx-x64/publish/SetupDotnet
```

The full code is available [here](https://github.com/ritza-co/fusionauth-dotnet-integration).

## Troubleshooting

If you run into an issue with cookies on Chrome or other browsers, you might need to run the ASP.NET application under SSL.

You can follow [this guide](https://learn.microsoft.com/en-us/dotnet/core/additional-tools/self-signed-certificates-guide) to install development SSL certificates for your .NET environment.

Alternatively, you can run the project using [Visual Studio](https://visualstudio.microsoft.com), which will run the project using SSL.

If you do this, make sure to update the <span class="field">Authorized Redirect URL</span> to reflect the `https` protocol. Also note that the project will probably run on a different port when using SSL, so you must update that as well. To do so, log into the administrative user interface, navigate to <span class="breadcrumb">Applications</span>, then click the <span class="uielement">Edit</span> button on your application and navigate to the <span class="breadcrumb">OAuth</span> tab. You can have more than one URL.

This tutorial has example versions built for a few versions of ASP.NET. View the following repos for the full code for various versions:

- [3.1 repo](https://github.com/FusionAuth/fusionauth-example-asp-netcore)

- [5.0 repo](https://github.com/FusionAuth/fusionauth-example-asp-netcore5)

- [7.0 repo](https://github.com/ritza-co/fusionauth-dotnet-integration)
