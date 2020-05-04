---
layout: blog-post
title: Setting up single sign on for nodebb 
description: Using OIDC, we'll set up single sign on for a nodebb forum.
author: Dan Moore
image: blogs/dot-net-command-line-client/creating-user-cli-client.png
category: blog
excerpt_separator: "<!--more-->"
---

nodebb is a modern supported forum software package that has many plugins and a great user experience. In this post, we'll show you how to set up single sign on (SSO) for your nodebb forum.

<!--more-->

Imagine you build out an application. Let's say you are building the world's best todo tracking application. Everyone loves it and it grows wildly popular. Users are adding tasks and checking them off with abandon. Your customers clamor for a place to share all their task management tips. 

Enter nodebb. You download and install it. The forum works great! Then you notice that every one of your users now must sign up for another account. Boo. 

Luckily, you planned ahead and used an identity management system with OpenID Connect (OIDC) support. You realize you can set up nodebb to enable SSO with this existing system. All your todo app users will be able to log in and post in your forum with the same username and password they use to log in to your app. Ah, the glory of single sign on. 

Let's see how you can achieve this dream.

## Prerequisites

Before you start, you need a working nodebb server ([installation instructions here](https://docs.nodebb.org/installing/os/)) including a database--I used mongodb. You'll need administrative access to nodebb because you'll be installing a plugin. Note where that lives; for me, it is at `http://localhost:4567`.

You'll also need an OIDC compliant identity server. In this post, I'll be using FusionAuth as my identity provider ([here's the five minute setup guide](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide)), but the nodebb configuration will be much the same with any OIDC compliant server. FusionAuth will live at `http://local.fusionauth.io`.

(Wait, what if you aren't using an OIDC compliant identity management system? Well, FusionAuth is free for unlimited users and here's [migration instructions](https://fusionauth.io/docs/v1/tech/tutorials/migrate-users).)

## Setting up the SSO server

First, create an application in FusionAuth. I'm going to call mine, creatively, "nodebb". We'll need to record a couple of configuration variables.

The client id and client secret are tied to the FusionAuth application. These look like ... and ... . Save them off to a text file, as you'll use them later.

We also need to set up an "authorized redirect URL". This will look like `https://HOSTNAME/auth/fusionauth-oidc/callback` where `HOSTNAME` is the location of your nodebb server. Since I'm running nodebb locally, this value is `http://localhost:4567/auth/fusionauth-oidc/callback`.

You want to set up a "logout redirect URL" so that when a user logs out, they are sent back to the nodebb application. I set mine to the nodebb homepage: `http://localhost:4567/`

This is what it should look like when you've set up your FusionAuth application.

TBD image with application set up
{% include _image.liquid src="/assets/img/blogs/dot-net-command-line-client/create-application.png" alt="The application in FusionAuth after it has been created" class="img-fluid" figure=false %}

Next, let's create a user. If this weren't a walkthrough, you'd have registration built out in your todo app, but I'm not going to build your entire todo app for you!

Go to "Users" and add a user--I'm going to add "fornodebb@example.com". Then associate them with the nodebb application by creating a registration. When you're done, it should look like this:

TBD image with user

Note that each user must have an email address associated with them. Usernames won't work.

Phew. We're all done with setting up our FusionAuth OIDC server. One final reminder that all these instructions are FusionAuth specific but your user identity amanagement service of choice should have analogous configuration.

Now, let's set up nodebb. 

## Configuring nodebb for SSO

First login as the nodebb admin and install the [fusionauth-oidc plugin](https://github.com/FusionAuth/nodebb-plugin-fusionauth-oidc). Again, even though the name says FusionAuth, that's just because we maintain it. (It has a BSD license.) It should work with any OIDC compatible identity management server.

I had to rebuild and restart the nodebb server when I installed the plugin.

The [install and configuration instructions](https://github.com/FusionAuth/nodebb-plugin-fusionauth-oidc) on the GitHub project are good, so I'm not going to walk you through each step. 

However, I will say that you need to:
* set the client secret and id to the values you noted from the FusionAuth application screen.
* set the discovery URL to the FusionAuth location which is `http://local.fusionauth.io` for this post.

Just [head over there](https://github.com/FusionAuth/nodebb-plugin-fusionauth-oidc) and come back when you're done.

You should now be able to log in with the user you created in FusionAuth. Click on the 'login' link from the nodebb home page and then click the icon under "Alternative Logins".

{% include _image.liquid src="/assets/img/blogs/nodebb-single-sign-on/twologins.png" alt="The login screen when SSO has first been enabled." class="img-fluid" figure=false %}

Enter the username and password for the user you created when configuring FusionAuth. Success! You should now see the nodebb homepage.

{% include _image.liquid src="/assets/img/blogs/nodebb-single-sign-on/afterlogin.png" alt="The nodebb home page after successful login." class="img-fluid" figure=false %}

## Disallowing local login

Now, should you [turn off local login](https://github.com/FusionAuth/nodebb-plugin-fusionauth-oidc#additional-configuration)?  Doing so means that all user authentication will be routed through your SSO server. 

It depends on your use case. If you have existing users in your forum, you might want to allow them to continue to use the username and password they are familiar with. But if you're starting with a fresh installation, I can't think of any reason to leave local login enabled. If you do leave local login turned on, your users will see both options when the click the 'login' link, as we did above.

In either case, you should [turn off local registration](https://github.com/FusionAuth/nodebb-plugin-fusionauth-oidc#additional-configuration) as the whole point of this exercise is to keep a master user list in one location.

If, on the other hand, you disallow local logins, when you click on the login link, you are directed straight to the SSO server page as seen below (this should look familiar, as you saw it when you signed in above after clicking the image under "Alternate Logins"):

{% include _image.liquid src="/assets/img/blogs/nodebb-single-sign-on/onelogin.png" alt="The login screen after local login has been disabled." class="img-fluid" figure=false %}

This is a better user experience, so turning off local login is recommended. Note that turning off local login and registration doesn't mean that people can't modify their profile. They absolutely can, as you can see from this nodebb profile edit screen.

{% include _image.liquid src="/assets/img/blogs/nodebb-single-sign-on/editprofile.png" alt="A user editing their profile." class="img-fluid" figure=false %}

Essentially, customer username and password information are kept in the identity server, and everything else is stored in nodebb.

## FusionAuth features

The steps above should work with any compliant SSO identity provider. Now we're going to cover features that aren't entirely part of the OIDC standard, but are needed for managing an application. If you are using a different identity managment server, you should find analogs to the features outlined below.

### User management

If you lock the user account in the the SSO server, they won't be able to login. This is helpful in a forum setting if a user is not being a good community member. In FusionAuth, you'd navigate to the users screen and then click on the "Lock" icon:

TBD admin screen to lock

And here's what the locked user would see when they tried to log in:

{% include _image.liquid src="/assets/img/blogs/nodebb-single-sign-on/lockedaccount.png" alt="The login screen for a user whose account has been locked." class="img-fluid" figure=false %}

Of course, people can change. So you can unlock them at any point, either using the admin console or the [FusionAuth API](https://fusionauth.io/docs/v1/tech/apis/users#reactivate-a-user).

### Admin users

If you want to have your admin users use the SSO server as well, you need to do a bit more configuration. If you do this, you can grant administrative privileges to multiple applications from the SSO server and have one single place to go when someone joins or leaves your organization.

We'll need to go back to the application in FusionAuth. We'll want to add an admin role for this application. Associating this role with a user or a group is how they'll have access to the admin functionality of nodebb.

TBD adding admin role.

Then add the admin role to the user you created. This role will be passed on to nodebb, allowing this user access to the nodebb admin screens.

TBD adding admin role to user.

Then we need to update the plugin with the correct "Roles claim". Sign in as an admin to nodebb. If you disabled local login, you may need to go directly to the local login screen by adding `/login?local=1` to your nodebb base URL, like `http://localhost:4567/login?local=1`.

Update the plugin configuration have the "Roles claim" be `roles` and restart nodebb.

Now you can log in with this user and view and edit the administrative pages.

### Self registration

You may want to allow self registration against the SSO server. This will allow someone who isn't a todo app user to sign up for the forum. There they can ask their task management questions; hopefully the community will be welcoming and enthusiastic enough that they'll buy your todo app. 

You can enable this by going to the "Registration" tab of your application in FusionAuth. 

TBD self registration image of application

Then they'll see a registration prompt on the login page: "Don't have an account? Create an account".

{% include _image.liquid src="/assets/img/blogs/nodebb-single-sign-on/user-registration.png" alt="The registration screen when self registration has been enabled." class="img-fluid" figure=false %}

After they've created the account, they'll be logged in.

## Conclusion

nodebb is a powerful piece of forum software. Standing up a forum lets your users communicate with each other and can be a powerful mechanism for knowledge sharing and community building. 

Using an SSO server such as FusionAuth lets your users have only one set of login credentials. It also allows you to control access to your applications from one screen. Centralized user management will make both your life and your users' lives easier.

