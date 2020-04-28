---
layout: blog-post
title: 
description: Authenticate using OAuth and ASP.NET Core
author: Dan Moore
image: blogs/whats-new-in-oauth-2-1/whats-new-with-oauth-2-1.png
category: blog
excerpt_separator: "<!--more-->"
---

Previously, we used .NET Core to [build a command line tool](https://fusionauth.io/blog/2020/04/28/dot-net-command-line-client) to add users to a FusionAuth instance. In this tutorial, we'll build out a web application which will have a protected page. We'll use Razor Pages and implement both login and logout.

<!--more-->

## Configuring FusionAuth

You should already have FusionAuth up and running. If you don't, head over to the post [Creating a user in FusionAuth with a .NET Core CLI Client](https://fusionauth.io/blog/2020/04/28/dot-net-command-line-client) and download and install FusionAuth. You'll also need to create the application. If you want to skip building the CLI client, you can just create a user in the UI.

We are going to make a few changes to the configuration to allow the web application to work. 

First, we're going to create a new signing key. There's a list of [supported algorithms](https://github.com/AzureAD/azure-activedirectory-identitymodel-extensions-for-dotnet/wiki/Supported-Algorithms) that work with the Identity Model project we're using, but currently [symmetric algorithms are not supported](https://github.com/IdentityModel/IdentityModel.AspNetCore/issues/102) with the open source .NET Core authentication library we are going to use. Using the default HMAC key resulted in an `SecurityTokenSignatureKeyNotFoundException`. FusionAuth supports [different key types](https://fusionauth.io/docs/v1/tech/apis/keys#generate-a-key), so we can generate an asymmetric key which will work with the library.

To generate the key, go to "Settings" then to "Key Master". In the upper right hand corner, click on the dropdown next to "Import Public Key" and choose "Generate RSA". Use a descriptive name like "For dotnetcore" and leave the rest of defaults alone and click "Submit". 

TBD aspdotnet-add-key-screen

Next, we'll be modifying the 'dotnetcore' application, so go ahead and edit that.  Then go to the OAuth tab. Add an 'Authorized Redirect URL' of `http://localhost:5000/signin-oidc`. Then add a Logout URL of `http://localhost:5000`. The web application we are going to build is going to live there, so we're setting things up so that the Authorization Code grant knows where to send users. 

Note the Client ID, Client Secret and the URL of your FusionAuth server, as we'll need that later.

When you are done, the OAuth tab should look like this:

TBD aspdotnet-oauth-screen.png

Next, go to the JWT tab. Enable JSON Web Token signing. 

Change the "Access token signing key" and "Id token signing key" to the previously created key. You can leave rest of the defaults alone. When you are done, the JWT tab should look like this:

TBD aspdotnet-JWT signgin

Click the blue "Save" icon. We're done configuring FusionAuth, unless you need to add a user, in which case, go to the User's section and add one. Make sure to add them to the "dotnetcore" application by creating the appropriate user registration.

## Set up a basic ASP.NET Razor Pages application

Now let's start building our ASP.NET Core web application. This application will display some information to all users, but will also have a secured area which will only be available to an authenticated user. Good thing we have already added one. As usual, we have the [full source code](https://github.com/FusionAuth/fusionauth-example-asp-net-core) available if you want to download it and take a look.

The first thing to do is create a new web application:

```shell
dotnet new webapp -o SampleApp
cd SampleApp
```

We can publish this application and then run it. There are [other ways of deploying the code](https://docs.microsoft.com/en-us/dotnet/core/deploying/), but I chose this to make sure my deployment process was repeatable.


This code builds a standalone executable I could deploy behind a proxy like NGINX. You can target Linux and macOS, but in this tutorial I'll be building a standalone Windows 64-bit executable.
```shell
dotnet publish -r win-x64
```

Then I start up the executable:

```shell
bin/Debug/netcoreapp3.1/win-x64/publish/SampleApp.exe
```

I can hit `control-C` to exit out of this application at any time. I also like to open up a separate terminal so that I can make edits to the source files (if you aren't using Visual Studio or another editor). I also like to combine the publish and start up commands into one line (I run this is in a bash shell):

```shell
dotnet publish -r win-x64 && bin/Debug/netcoreapp3.1/win-x64/publish/SampleApp.exe
```

If I visit `http://localhost:5000` I'm redirected to an https address and get a warning from my browser. While that would make sense in production (unless we terminated TLS before traffic gets to this application), we don't need that behavior in development. Remove `app.UseHttpsRedirection();` from `Startup.cs`.

We'll also want to add a page to be secured. Add `Secure.cshtml` and `Secure.cshtml.cs` to `SampleApp/Pages` with the following content:

```html
@page
@model SecureModel
@{
    ViewData["Title"] = "I'm full of secure data";
}
<h1>@ViewData["Title"]</h1>

<p>TBD</p>
```

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace SampleApp.Pages
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

And then add a corresponding navigation element to `Pages/Shared/_Layout.cshtml` after the privacy list element:

```html
<li class="nav-item">
<a class="nav-link text-dark" asp-area="" asp-page="/Secure">Secure</a>
</li>
```

Hit `control-C` to exit and then republish and restart. Visit `http://localhost:5000` and view your new pages. Click on "Secure" at the top. 

You can view the code in this state by looking at the `setup-application` branch.

We've added a page, but it sure isn't secure yet. Let's do that next.

## Enable logging in

It's always smart to leverage libraries when you can. We're going to add two new libraries to our application. Make sure you're in the `SampleApp` directory and run these commands.

```shell
dotnet add package Microsoft.AspNetCore.Authentication.OpenIdConnect
dotnet add package IdentityModel.AspNetCore -v 1.0.0-rc.4.1
```

You'll note that unlike the [command line tool](https://fusionauth.io/blog/2020/04/28/dot-net-command-line-client), we aren't using the FusionAuth client packages. This is because we'll be protecting this page using standard OAuth. 

We also specify version `1.0.0-rc.4.1` for the [IdentityModel](https://github.com/IdentityModel/IdentityModel.AspNetCore/) package because it hasn't been released just yet. This package makes integrating with standards based OAuth servers a snap, so we'll overlook it being not quite released.

Then we need to protect our "Secure" page. We do this using the [Authorize filter attribute](https://docs.microsoft.com/en-us/aspnet/core/razor-pages/filter?view=aspnetcore-3.1#authorize-filter-attribute) to the `Secure.cshtml.cs` page:

```csharp
...
namespace SampleApp.Pages
{
    [Authorize]
    public class SecureModel : PageModel
    {
...
```

We could also have added a `AddRazorPagesOptions` to our `Startup.cs` file. This would be a good choice for having everything centralized:

```csharp
services.AddRazorPages().AddRazorPagesOptions(options =>
                 {
                     options.Conventions.AuthorizePage("/Secure");
                 });
```

Depending on the needs and size of your application, one of these choices might be better than the other.

We'll also display the claims in the JWT FusionAuth delivers. This is what the `Secure.cshtml` page looks like:

```html
@page
@using Microsoft.AspNetCore.Authentication
@model SecureModel
@{
    ViewData["Title"] = "I'm full of secure data";
}
<h1>@ViewData["Title"]</h1>

<h2>Claims</h2>

<dl>
    @foreach (var claim in User.Claims)
    {
        <dt>@claim.Type</dt>
        <dd>@claim.Value</dd>
    }
</dl>
```

We also need to set up some services to specify how this page is protected.

Here's the full `Startup.cs` code:

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Logging;

namespace SampleApp
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            JwtSecurityTokenHandler.DefaultMapInboundClaims = false;
            services.AddRazorPages();

            services.AddAuthentication(options =>
            {
                options.DefaultScheme = "cookie";
                options.DefaultChallengeScheme = "oidc";
            })
                .AddCookie("cookie", options =>
                {
                    options.Cookie.Name = "mycookie";

                    options.Events.OnSigningOut = async e =>
                    {
                        await e.HttpContext.RevokeUserRefreshTokenAsync();
                    };
                })
                .AddOpenIdConnect("oidc", options =>
                {
                    options.Authority = Configuration["SampleApp:Authority"];

                    options.ClientId = Configuration["SampleApp:ClientId"];
                    options.ClientSecret = Configuration["SampleApp:ClientSecret"];

                    // code flow + PKCE (PKCE is turned on by default)
                    options.ResponseType = "code";
                    // options.UsePkce = true; // cycles
                    options.RequireHttpsMetadata = false;
                });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapRazorPages();
            });
            IdentityModelEventSource.ShowPII = true;
        }
    }
}
```

Let's go through some of the more interesting parts.

We're setting up our authentication including the scheme and the challenge method. We'll be using cookies to store our authentication information and "oidc" for our authentication provider.
```csharp
...
            services.AddAuthentication(options =>
            {
                options.DefaultScheme = "cookie";
                options.DefaultChallengeScheme = "oidc";
            })
...
```

Here we configure the cookie, including setting the cookie name.
```csharp
...
                .AddCookie("cookie", options =>
                {
                    options.Cookie.Name = "mycookie";

                    options.Events.OnSigningOut = async e =>
                    {
                        await e.HttpContext.RevokeUserRefreshTokenAsync(); //XXX do we need
                    };
                })
...
```

Finally we configure our previously referenced configuration provider. You could have multiple different providers if you liked. 

We pull configuration options from either `appsettings.json` or the environment (for the client secret).  These are values you previously noted when you were setting up FusionAuth. (We'll add them to `appsettings.json` later.)
```csharp
...
                .AddOpenIdConnect("oidc", options =>
                {
                    options.Authority = Configuration["SampleApp:Authority"];

                    options.ClientId = Configuration["SampleApp:ClientId"];
                    options.ClientSecret = Configuration["SampleApp:ClientSecret"];

                    options.ResponseType = "code";
                    options.RequireHttpsMetadata = false;
                });
...
```

```csharp
...

Turn on authentication for our application:

```csharp
...
            app.UseAuthentication();
...
```

For debugging, we add `IdentityModelEventSource.ShowPII = true;`, which you can see at the very end of `Configure` method. This makes it easier to see errors in the OAuth flow. But for production you should remove it.

```csharp
...
            IdentityModelEventSource.ShowPII = true;
...
```

Here's our `appsettings.json` file. The values under the `SampleApp` key are added. 

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  },
  "AllowedHosts": "*",
  "SampleApp" : {
      "Authority" : "http://localhost:9011",
      "ClientId" : "4420013f-bc5e-4d5a-9f94-f4b64ad5107c"
   }
}
```

Note that the client secret is not captured in this version controlled file. Instead, that is provided on the command line, and now the correct way to start the application is:

```shell
dotnet publish -r win-x64 && SampleApp__ClientSecret=H4... bin/Debug/netcoreapp3.1/win-x64/publish/SampleApp.exe
```

Once you've updated these files, you can publish and start the application. You should be able to log in with the user you previously created and see their claims (essentially information known about the user by FusionAuth). 

TBD screencap of login

Note, you can [theme the login screen of FusionAuth](https://fusionauth.io/docs/v1/tech/themes/) should you choose.

You can view the code in this state by looking at the `add-authentication` branch.

## Enable logging out

Awesome, now you can login if you have an user. However, right now there's no way to sign out. The cookie is being stored in a session variable


Go further:
protect more pages



Edit 

* fusionauth should already be configured. point back to prev post.
make a few changes
jwts
generate cert with correct values pic
SecurityTokenSignatureKeyNotFoundException/ certain algos

* create a new ASP.NET Core webapp.
branch setup-application

dotnet new webapp -o SampleApp
cd SampleApp

 dotnet publish -r win-x64

https://docs.microsoft.com/en-us/dotnet/core/deploying/

publish and run
 bin/Debug/netcoreapp3.1/win-x64/publish/SampleApp.exe

* disable https


* add a separate, secure page
* configure login stuff
make sure to update yoru appsettings.json
* show that it works (use newuser2@example.com)

logout
2nd post

Add in 
* the lambda to get favorite color
* and pkce

References

https://github.com/IdentityModel/IdentityModel.AspNetCore
https://github.com/AzureAD/azure-activedirectory-identitymodel-extensions-for-dotnet/wiki/Supported-Algorithms
https://docs.microsoft.com/en-us/dotnet/api/microsoft.identitymodel.logging.identitymodeleventsource?view=azure-dotnet
https://github.com/AzureAD/azure-activedirectory-identitymodel-extensions-for-dotnet/wiki/PII

https://docs.microsoft.com/en-us/aspnet/core/fundamentals/?view=aspnetcore-3.1&tabs=linux
