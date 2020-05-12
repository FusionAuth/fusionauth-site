---
layout: blog-post
title: Setting up single sign-on for nodebb 
description: Using OIDC, we'll set up single sign on for a nodebb forum.
author: Dan Moore
image: blogs/nodebb-single-sign-on/fusionauth-tutorial-sso-nodebb.png
category: blog
excerpt_separator: "<!--more-->"
---

nodebb is a modern well supported forum software package. It has many plugins and provides a great user experience. Unlike hosted forums, you can run this on your own domain, which has UX and SEO benefits. 

In this post, we'll show you how to set up single sign-on (SSO) for your nodebb forum.

<!--more-->

## The dream

Imagine you build out an application. Let's say you are building the world's best todo tracking app. Everyone loves it and it becomes wildly popular. Users are adding tasks and checking them off with abandon. Your customers clamor for a place to share all their task management tips. 

Enter nodebb. You download and install it. The forum works great! Then you notice that every one of your users now must sign up for another username and password. Boo. 

Luckily, you planned ahead and used an identity management system with OpenID Connect (OIDC) support. You realize you can set up nodebb to use this existing system to provide SSO to your users. All your todo app users will be able to log in and post in your forum with the same username and password they use for your app. Ah, the glory of single sign-on. 

Let's see how you can achieve this dream.

## Prerequisites

Before you start, you need a working nodebb server ([installation instructions here](https://docs.nodebb.org/installing/os/)) including a database--I used mongodb. You'll need administrative access to nodebb because you'll be installing a plugin. Note where the nodebb app lives; for me, it is at `http://localhost:4567`.

You'll also need an OIDC server. In this post, I'll be using FusionAuth as my identity provider ([here's the five minute setup guide](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide)), but the nodebb configuration will be much the same with any OIDC server. FusionAuth will live at `http://local.fusionauth.io`.

(Wait, what if you aren't using an OIDC compliant identity management system as your SSO server? Well, FusionAuth is free for unlimited users and here's [migration instructions](https://fusionauth.io/docs/v1/tech/tutorials/migrate-users). Get going!)

## Setting up the SSO server

First, create an application in FusionAuth. I'm going to call mine, creatively, "nodebb". Note that you can create as many applications as you want. If you were really building out "The Dream", you'd also have a 'todo app' FusionAuth application, but for this tutorial we'll only set up the nodebb FusionAuth config. Users will have the same username and password for all applications, but may not be able to access every one of them. (Access is controlled by user registrations, which we'll cover below.)

After you save the application, edit it again, as we'll need to record a couple of configuration variables. Start at the "OAuth" tab. 

The client id and client secret are used by FusionAuth to identify the application asking for user information. These values look like `fe4b813b-e2ec-49c8-b27f-40af5e271792` and and `Qz6PKsagXv13ipiHb4TZ9ii5Q9n_YcFAD-R0D5RKkqo` respectively. Save them off to a text file, as you'll use them later.

We also need to set up an "authorized redirect URL". This will look like `https://HOSTNAME/auth/fusionauth-oidc/callback` where `HOSTNAME` is the location of your nodebb server. Since I'm running nodebb locally, this value is `http://localhost:4567/auth/fusionauth-oidc/callback`.

You want to set up a "logout redirect URL"; when a user logs out, they should be sent back to the nodebb app homepage. I set mine to this: `http://localhost:4567/`

This is what the "OAuth" tab should look like when you've set up FusionAuth.

{% include _image.liquid src="/assets/img/blogs/nodebb-single-sign-on/application-creation.png" alt="The configured application screen." class="img-fluid" figure=false %}

Next, let's create a user. If this weren't a walkthrough, you'd have a way for a user to register in the todo app, but I'm not going to build the entire app for you! Go to "Users" and add a user--I'm going to add "fornodebb@example.com". 

{% include _image.liquid src="/assets/img/blogs/nodebb-single-sign-on/user-creation.png" alt="Creating a user in FusionAuth." class="img-fluid" figure=false %}

Then associate the new user with the nodebb application by creating a FusionAuth user registration. Again, if you had the todo app FusionAuth application set up, you might add a user registration for that application as well. 

When you're done, the user edit screen should look like this:

{% include _image.liquid src="/assets/img/blogs/nodebb-single-sign-on/adding-user-registration.png" alt="Associating a user with the nodebb application." class="img-fluid" figure=false %}

Phew. We're all done with setting up our FusionAuth OIDC server. One final reminder that all these instructions are FusionAuth specific but your user identity management system of choice should have analogous configuration options.

Now, let's set up nodebb. 

## Configuring nodebb for SSO

Now we're ready to allow our todo app users to login with an account from our SSO server. First, log in as the nodebb admin and install the [fusionauth-oidc plugin](https://github.com/FusionAuth/nodebb-plugin-fusionauth-oidc). Even though the name says FusionAuth, it should work with any OpenID Connect compatible identity provider. It's named FusionAuth because we maintain it. 

The [install and configuration instructions](https://github.com/FusionAuth/nodebb-plugin-fusionauth-oidc) on the GitHub project are up to date, so I'm not going to walk you through each step here. 

However, I will say that:
* I had to rebuild and restart the nodebb server when I installed the plugin.
* You need to set the client secret and client id to the values you noted from the FusionAuth application screen.
* You have to set the discovery URL to the FusionAuth discovery URL which is `http://local.fusionauth.io` for me, and you if you installed nodebb locally on that port.

Okay. Just [head over there](https://github.com/FusionAuth/nodebb-plugin-fusionauth-oidc) and come back when you're done.

Welcome back. You should be able to log in with the user you created in FusionAuth, "fornodebb@example.com" in my case. Click on the "login" link on the nodebb home page and then click the icon under "Alternative Logins", as seen below.

{% include _image.liquid src="/assets/img/blogs/nodebb-single-sign-on/twologins.png" alt="The login screen when SSO has first been enabled." class="img-fluid" figure=false %}

Enter the email and password. Success! You should now see the nodebb homepage and be authenticated as that user.

{% include _image.liquid src="/assets/img/blogs/nodebb-single-sign-on/afterlogin.png" alt="The nodebb home page after successful login." class="img-fluid" figure=false %}

## Disallowing local login

Now, should you [turn off local login](https://github.com/FusionAuth/nodebb-plugin-fusionauth-oidc#additional-configuration)? Doing so means that all user authentication operations will be handled by your SSO server. 

It depends on your use case. If you already have a forum with existing users, you might want to allow them to continue to use the username and password they are familiar with to sign in. 

But if you're starting with a fresh nodebb installation, I can't think of any reason to leave local login enabled. If you do leave local login turned on, your users will see both options when they click the "login" link, as shown above.

In either case, you should [turn off local registration](https://github.com/FusionAuth/nodebb-plugin-fusionauth-oidc#additional-configuration) because the whole point of this post is to have all user data stored in your SSO server, not in nodebb.

If you disallow local logins, when you click on the login link, you are sent straight to the SSO server page as seen below (this should look familiar, as you saw it when you signed in above after clicking the image under "Alternate Logins"):

{% include _image.liquid src="/assets/img/blogs/nodebb-single-sign-on/onelogin.png" alt="The login screen after local login has been disabled." class="img-fluid" figure=false %}

This is a better user experience, so turning off local login is what I'd recommend. Note that turning off local login and registration doesn't mean that users can't modify their profile. They absolutely can, as you can see from this nodebb profile edit screen for my example user:

{% include _image.liquid src="/assets/img/blogs/nodebb-single-sign-on/editprofile.png" alt="A user editing their profile." class="img-fluid" figure=false %}

Essentially, customer username and password information are kept in the identity server, and almost everything else is stored in nodebb.

## FusionAuth features

The steps above should work with any compliant SSO identity provider. Now we're going to cover features that aren't entirely part of the OIDC standard but are useful for managing users. If you are using a different identity management server, there should be analogs for the features outlined below.

### User management

If you lock the user account in the SSO server, the user won't be able to log in. This is helpful when managing a forum; if a user is not being a good community member you can disable their account either temporarily or permanently. In FusionAuth, you'd navigate to the list of users and click on the "Lock" icon (you'll be warned that a locked user can't login):

{% include _image.liquid src="/assets/img/blogs/nodebb-single-sign-on/lock-user-from-list.png" alt="The user list screen where you can lock a user account." class="img-fluid" figure=false %}

And here's what the locked out user would see when they tried to log in:

{% include _image.liquid src="/assets/img/blogs/nodebb-single-sign-on/lockedaccount.png" alt="The login screen for a user whose account has been locked." class="img-fluid" figure=false %}

Of course, people can change. So an admin can unlock an account anytime, either using the FusionAuth admin console or with the [FusionAuth API](https://fusionauth.io/docs/v1/tech/apis/users#reactivate-a-user).

### Admin users

If you want your admin users to authenticate with the SSO server, you need to do a bit more configuration. With these settings, you can grant administrative privileges to one or more applications from the SSO server and have a single place to update user information when someone joins or leaves your organization.

We'll need to return to the application screen in FusionAuth. We'll add an admin role for the nodebb application. 

{% include _image.liquid src="/assets/img/blogs/nodebb-single-sign-on/setting-up-admin-role.png" alt="Adding the admin role to the nodebb application." class="img-fluid" figure=false %}

Next, we'll associate the user you previously created with the admin role. We do this on the user edit page. This role will be passed to nodebb. That will allow this user access to the nodebb admin screens. When you are done, the role should be shown on the user's page:

{% include _image.liquid src="/assets/img/blogs/nodebb-single-sign-on/user-with-admin-role.png" alt="The user is associated with the admin role." class="img-fluid" figure=false %}

We also need to update the plugin with the correct "Roles claim". Sign in as an admin to nodebb. (If you disabled local login already, you may need to use a special login path; you can always go directly to the local login screen by adding `/login?local=1` to your nodebb base URL: `http://localhost:4567/login?local=1`.)

Update the plugin configuration; set the "Roles claim" be `roles` and restart nodebb. Now you can log in to nodebb with this user, or any other with the admin role in FusionAuth and view forum admin pages. Admin users will be able to move topics, edit posts and perform all the other tasks needed to keep your todo app forum users happy.

### Self registration

You may want to allow registration with the SSO server as well. This will allow someone who isn't a todo app user to sign up for the forum. There they can ask their task management questions; hopefully the community will be welcoming and enthusiastic enough that they'll sign up for your todo app. 

You can enable registration by going to the "Registration" tab of your application in FusionAuth. Enable "Self service registration", but leave the other fields with the default values. Click the blue save icon.

{% include _image.liquid src="/assets/img/blogs/nodebb-single-sign-on/enabling-self-registration.png" alt="The application screen with self registration enabled." class="img-fluid" figure=false %}

After this change, users will see a registration prompt on the login page: "Don't have an account? Create an account". When they click on it, they'll be prompted to register, with a screen like below:

{% include _image.liquid src="/assets/img/blogs/nodebb-single-sign-on/user-registration.png" alt="The registration screen when self registration has been enabled." class="img-fluid" figure=false %}

After a user creates an account, they'll be logged in. At this point, they'd only have the ability to log in to nodebb.

### Theming the pages

You may have noticed that the login and logout pages didn't look like the nodebb pages. FusionAuth gives you the ability to theme your login, logout, and other authentication pages. This involves changing templates which you can access via the admin screen. 

The [FusionAuth theme documentation](https://fusionauth.io/docs/v1/tech/themes/) outlines the templates and gives an example of customizing the login page.

## Conclusion

nodebb is a powerful piece of forum software. Standing up a forum lets your users communicate with each other and can be a powerful mechanism for knowledge sharing, search engine optimization, and community building.

Using an SSO server such as FusionAuth lets your users minimize the number of usernames and passwords they must manage. It also allows you to control access to your applications from one screen, also known as "The Dream". Using a single sign-on server for centralized user management will make both your life and your users' lives easier.

