---
layout: blog-post
title: Adding additional user information to the ASP.NET Core web application 
description: Extending the ASP.NET Core web application with additional claims in your JWT. 
author: Dan Moore
image: blogs/whats-new-in-oauth-2-1/whats-new-with-oauth-2-1.png
category: blog
excerpt_separator: "<!--more-->"
---

Previously, we used ASP.NET Core to [build a web application](TBD) with a protected page. Now we're going to extend the application using some FusionAuth features. We're going to create a group, assign a role to that group and then place a user in that group. We'll also expose custom user data using a lambda. We'll then see all the claims in the ASP.NET Core web application. 

<!--more-->

If you haven't yet, please set up FusionAuth and the web application as specified in the [previous post](TBD)

## Setting up roles and groups

Let's navigate to the FusionAuth administration console and add a role to the application. Note that instead of the blue button where you edit the application configuration, click on the black button with the person symbol. This is where you can add application roles. As many as you want--they're free!

Here I added an admin and a user role.

TBD image adding roles

Then we want to add a group. We'll call this the "ASP.NET Core User" group. Give it the "User" role.

TBD image adding group

Finally, we need to add our user to our group. Navigate to the "newuser2@example.com" user and go to the "Groups" tab. Add them to the "ASP.NET Core User" group. 

Note that if a user isn't associated with an application, being associated with a group that has a role for an application does nothing.

TBD image adding user to group

Add the user to the role

Let's login and see what we see as this new user on the "Secure" page.

As a reminder, here's how we can start the application (again [full source code](https://github.com/FusionAuth/fusionauth-example-asp-net-core) available here).

```shell
dotnet publish -r win-x64 && SampleApp__ClientSecret=H4... bin/Debug/netcoreapp3.1/win-x64/publish/SampleApp.exe
```

We are passed the role, as you can see below:

{% include _image.html src="/assets/img/blogs/adding-more-claims-asp-net/aspnetextended-roles-only-roles-highlighted.png" alt="The secure page after a user has been associated with a role." class="img-fluid" figure=false %}

These roles are encoded in the JWT stored in the cookie, so if you change a group's roles, you'll need to wait for the JWT to be refreshed for your modifications to be reflected.

## Adding in custom claims

You can add in custom claims based on user data, the time of day or anything else. You do this with a [JWT Populate lambda](https://fusionauth.io/docs/v1/tech/lambdas/jwt-populate). This is a small bit of JavaScript which receives the JWT before it is signed and can modify it. 

Remember way back when we [created the user](https://fusionauth.io/blog/2020/04/28/dot-net-command-line-client) and specified their favorite color? Well, we're going to send that information down to the ASP.NET Core web application so that it can display that valuable data.

You can pull from the user or registration objects. You can modify the JWT within limitations.

Here's our lambda:

```javascript
function populate(jwt, user, registration) {
  jwt.favoriteColor = user.data.favoriteColor;
}
```

To create it, we're going to use the FusionAuth API. 

Create an api key, allowing full access to lambdas management and to patch the appication resource.

TBD Image of creating an API key

Run this curl script which will create the lambda and associate it with the "dotnetcore" application.

```shell
UTH_HEADER=YOUR_API_KEY_HERE
APPLICATION_ID=YOUR_APP_ID_HERE

lambda_output=`curl -s -XPOST -H "Authorization: $AUTH_HEADER" -H"Content-Type: application/json" http://localhost:9011/api/lambda -d '{ "lambda" : {"body" : "function populate(jwt, user, registration) { jwt.favoriteColor = user.data.favoriteColor; }", "name": "exposeColor", "type" : "JWTPopulate" } }'`

lambda_id=`echo $lambda_output|sed -r 's/.*"id":"([^"]*)".*/\1/g'`
application_patch='{"application" : {"lambdaConfiguration" : { "accessTokenPopulateId" : "'$lambda_id'", "idTokenPopulateId" : "'$lambda_id'" } } }'

output=`curl -s -XPATCH -H "Authorization: $AUTH_HEADER" -H"Content-Type: application/json" http://localhost:9011/api/application/$APPLICATION_ID -d "$application_patch"`
```

You can then log in to the admin user interface and see that the lambda has been created.

TBD Screenshot

And that it has been assigned to run when JWTs are created for your application.

TBD Screenshot

Rather than running a script, you could create the lambda using the administration user interface and then assign it in the same way. I think that running it from a script shows the power of the FusionAuth API--everything you can do in the admin interface you can do via the API.

## Looking at custom claims in the web app

Now if you go to `http://localhost:5000` and sign out and sign in, you should see a screen something like this. 

{% include _image.html src="/assets/img/blogs/adding-more-claims-asp-net/aspnetextended-favcolor-highlighted.png" alt="The secure page after a the lambda makes the favoriteColor claim available." class="img-fluid" figure=false %}
TBD Screenshot

Within the application, you could display the user's favorite color. You could also make functionality available or hidden based on the user's role.

## Conclusion

This post is the end of our journey through some of
