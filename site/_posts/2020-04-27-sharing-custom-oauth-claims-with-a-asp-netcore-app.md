---
layout: blog-post
title: Sharing custom OAuth claims with an ASP.NET Core app
description: We'll configure FusionAuth and extend the ASP.NET Core web application to display role and custom claims from a JWT.
author: Dan Moore
image: blogs/whats-new-in-oauth-2-1/whats-new-with-oauth-2-1.png
category: blog
excerpt_separator: "<!--more-->"
---

Previously, we used ASP.NET Core to [build a web application](TBD) with a single protected page. Let's extend the application to display the role of the user in FusionAuth as well as a custom claim. We're going to create a group, assign a role to that group and then place our user in that group. We'll also explore modifying our JavaScript Web Token (JWT) by using a lambda to expose the user's favorite color. Finally, we'll display all the claims on the "Secure" page.

<!--more-->

If you haven't yet, please set up FusionAuth and the web application as specified in the [previous post](TBD).

## Setting up roles and groups

Let's navigate to the FusionAuth administration console and add a role to the application. Note that instead of the blue button where you edit the application configuration, click on the black button with the person symbol. This is where you can add application roles. As many as you want--they're free! I limited myself to adding an admin and a user role.

{% include _image.liquid src="/assets/img/blogs/adding-more-claims-asp-net/aspnetextended-add-roles.png" alt="Adding roles to a FusionAuth application." class="img-fluid" figure=false %}

Then we want to create a group. We'll call this the "ASP.NET Core User" group, and associate the user role with it.
	
{% include _image.liquid src="/assets/img/blogs/adding-more-claims-asp-net/aspnetextended-create-group.png" alt="Creating a group in a FusionAuth application." class="img-fluid" figure=false %}

Finally, we need to add our user to our group. Navigate to the "newuser2@example.com" user (or any other user you've created and associated with the "dotnetcore" application) and go to the "Groups" tab. Add them to the "ASP.NET Core User" group. Warning: if a user isn't associated with an application, being associated with a group that has a role for an application does nothing.

{% include _image.liquid src="/assets/img/blogs/adding-more-claims-asp-net/aspnetextended-add-user-to-group.png" alt="Adding our user to a group in a FusionAuth application." class="img-fluid" figure=false %}

Let's login. As a reminder, here's how we can start the ASP.NET Core application (again [full source code](https://github.com/FusionAuth/fusionauth-example-asp-netcore) available here).

```shell
dotnet publish -r win-x64 && SampleApp__ClientSecret=H4... bin/Debug/netcoreapp3.1/win-x64/publish/SampleApp.exe
```

If you head to `http://localhost:5000` and click on the "Secure" page, you'll see the claims. If you were previously signed in, you may need to sign out and sign in again. The role is present in the JWT, as you can see below:

{% include _image.liquid src="/assets/img/blogs/adding-more-claims-asp-net/aspnetextended-roles-only-roles-highlighted.png" alt="The secure page after a user has been associated with a role." class="img-fluid" figure=false %}

Since the role and other claims are encoded in the JWT, which is stored in a cookie, whenever you change any user data in FusionAuth, you'll need to log out and log in as that user to see the changes reflected in the ASP.NET Core application.

## Adding custom claims

You can add claims based on user data, the time of day or anything else. In FusionAuth, you add this data to a JWT with a [lambda](https://fusionauth.io/docs/v1/tech/lambdas/jwt-populate). This is a JavaScript function that receives the JWT object before it is signed and can modify it. Remember way back when we [created the user](https://fusionauth.io/blog/2020/04/28/dot-net-command-line-client) and specified their favorite color as a command line option? Well, we're going to send that information down to the ASP.NET Core web application so that it can display that very valuable data.

A lambda is flexible and can pull from user or registration data. You can modify the token by removing attributes also, though there are some that are immutable. Here's the lambda:

```javascript
function populate(jwt, user, registration) {
  jwt.favoriteColor = user.data.favoriteColor;
}
```

To create it, we're going to use the FusionAuth API, rather than the administration console. I just felt it had been too long since I `curl`ed something. Create an API key called "Lambda management" allowing full access to the Lambda API. Allow the holder of this key to patch the application resource as well. We'll need the latter to configure our FusionAuth application to use our lambda.

{% include _image.liquid src="/assets/img/blogs/adding-more-claims-asp-net/aspnetextended-lambda-management-api-key.png" alt="The API key with lambda and application permissions." class="img-fluid" figure=false %}

Here's the shell script which creates the lambda and associates it with the "dotnetcore" application. You must update the `AUTH_HEADER` environment variable to the value of the API key we just created. Also, please update `APPLICATION_ID` to the id of the "dotnetcore" application. This script calls one API to create our lambda, and another to configure the application to use it.

```shell
AUTH_HEADER=YOUR_API_KEY_HERE
APPLICATION_ID=YOUR_APP_ID_HERE

lambda_output=`curl -s -XPOST -H "Authorization: $AUTH_HEADER" -H"Content-Type: application/json" http://localhost:9011/api/lambda -d '{ "lambda" : {"body" : "function populate(jwt, user, registration) { jwt.favoriteColor = user.data.favoriteColor; }", "name": "addFavoriteColor", "type" : "JWTPopulate" } }'`

lambda_id=`echo $lambda_output|sed -r 's/.*"id":"([^"]*)".*/\1/g'`
application_patch='{"application" : {"lambdaConfiguration" : { "accessTokenPopulateId" : "'$lambda_id'", "idTokenPopulateId" : "'$lambda_id'" } } }'

output=`curl -s -XPATCH -H "Authorization: $AUTH_HEADER" -H"Content-Type: application/json" http://localhost:9011/api/application/$APPLICATION_ID -d "$application_patch"`
```

After running this shell script, log in to the admin user interface and see that the lambda exists:

{% include _image.liquid src="/assets/img/blogs/adding-more-claims-asp-net/aspnetextended-lambda-created.png" alt="The Lambda created by the API call." class="img-fluid" figure=false %}

And that it has been assigned to run when JWTs are created for your application:

{% include _image.liquid src="/assets/img/blogs/adding-more-claims-asp-net/aspnetextended-application-has-lambda.png" alt="The 'dotnetcore' application now calls the lambda when generating a JWT." class="img-fluid" figure=false %}

Of course, as implied above, rather than running a script, you could create the lambda using the administration user interface. Then you'd associate it with your application. I think that doing this lambda setup via a shell script shows the power of the FusionAuth API. Everything you can do in the admin interface you can automate using the API.

## Viewing custom claims 

Now if you head to `http://localhost:5000`, you should see something like this:

{% include _image.liquid src="/assets/img/blogs/adding-more-claims-asp-net/aspnetextended-favcolor-highlighted.png" alt="The secure page after a the lambda makes the favoriteColor claim available." class="img-fluid" figure=false %}

Of course, this isn't much use. 

In a real-world application you'd do more than display these claims. You might customize a user's display based on their favorite color. A user's role could gate functionality or information.

## Conclusion

This post is the end of our journey integrating FusionAuth and ASP.NET Core. Offloading your user management concerns to an identity management solution such as FusionAuth frees you to focus on the features and business logic of your application.
