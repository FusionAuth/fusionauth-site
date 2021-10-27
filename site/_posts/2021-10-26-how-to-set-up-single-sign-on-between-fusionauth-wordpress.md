---
layout: blog-post
title: How to Set Up Single Sign-On Between FusionAuth and Wordpress
description: In this tutorial, you'll be learning how to implement OAuth SSO for Joomla users.
author: Aniket Bhattacharyea
image: blogs/joomla-sso-fusionauth/how-to-set-up-single-sign-on-sso-between-fusionauth-and-joomla-header-image.png
category: blog
tags: tutorial tutorial-php client-php tutorial-integration
excerpt_separator: "<!--more-->"
---

User authentication is one of the most important parts of building any application, and almost every application features some sort of authentication. However, it quickly gets difficult to manage when you have multiple related but independent applications to maintain.

<!--more-->

Let's say you're building a photo-sharing application that lets a user sign up with a username and password to share their pictures. Your team might later decide to [create a forum using WordPress](https://wordpress.com/go/tutorials/create-a-forum-with-wordpress-com/) to help support your app, but this new project isn't tied to your original application. It uses an entirely different tech stack, database, and hosting setup.

This means your users need to sign up _again_ on this second website and remember another set of usernames and passwords. Giving users two entirely different sets of credentials is not ideal, so that's where Single Sign-On comes in.

Single Sign-On, commonly known as SSO, is an authentication mechanism that enables users to use a single set of credentials to log in to multiple different applications or websites. In a typical SSO setup, you have a service provider—the application the user is trying to log in to—and an identity provider like [FusionAuth](https://fusionauth.io), which handles the authentication. This means your users need only one set of credentials to log into all of your applications.

## Using FusionAuth for SSO

To use SSO, you need to choose an Identity provider which will handle the authentication for you. [FusionAuth](https://fusionauth.io/) is one such identity provider. FusionAuth provides libraries for most major programming languages and frameworks, including PHP, Ruby, Python, Java, Go, and .NET.

FusionAuth is fully customizable and is available as a stand-alone package for Linux, Mac, and Windows, so you can self-host FusionAuth on any server. You can even get started for free, so there's no need to enter your credit card number to follow along with this tutorial.

If you are building a website with WordPress and you need to incorporate user management, you can leverage SSO. It provides a more flexible solution for users and saves them from managing multiple credentials. In this tutorial, you'll learn how to set up Single Sign-On in WordPress using FusionAuth with the help of an [OpenID Connect WordPress plugin](https://wordpress.org/plugins/miniorange-login-with-eve-online-google-facebook/).

## Prerequisites

To integrate FusionAuth with WordPress, you need two things: a WordPress instance with admin permissions and a FusionAuth account. If you'd like to run FusionAuth yourself, you can [download it for free](https://fusionauth.io/download/).

If you want to follow along with this tutorial and do not want to bother about launching a WordPress instance or a FusionAuth instance, you can use the [Docker Compose script here](https://github.com/FusionAuth/fusionauth-example-wordpress-sso) to quickly set up a WordPress and FusionAuth instance. If you already have a WordPress instance and FusionAuth account, you can skip to [Adding FusionAuth to WordPress](#adding-fusionauth-sso-to-wordpress).

Before you get started, be sure to have Docker installed and running on your computer and Docker Compose installed. You can find the installation guides for Docker [here](https://docs.docker.com/engine/install/) and the guides for Docker Compose [here](https://docs.docker.com/compose/install/).

## Configuring WordPress and FusionAuth

Once you have Docker running and a FusionAuth account, run the following commands in your terminal:

```bash
git clone https://github.com/FusionAuth/fusionauth-example-wordpress-sso.git
cd fusionauth-example-wordpress-sso
docker-compose up -d
```

This will start a WordPress instance on port 8030 and a FusionAuth instance on port 9011. Now, finish the installation of WordPress by opening up a browser window and navigating to `localhost:8030`.

You should be greeted with this screen:

{% include _image.liquid src="/assets/img/blogs/wordpress-sso-fusionauth/wordpress-initial-screen.png" alt="Choosing a language for WordPress installation." class="img-fluid box-shadow" figure=false %}

Choose your preferred language and click "Continue.”

On the next page, enter the site title and create an admin account by providing a username, email, and password.

{% include _image.liquid src="/assets/img/blogs/wordpress-sso-fusionauth/wordpress-admin-setup-screen.png" alt="Creating a WordPress administration account." class="img-fluid" figure=false %}

Press "Install WordPress" to finish the installation. Log in with your new username and password when it's finished.

### Configuring FusionAuth

Now let's set up FusionAuth. Navigate to `localhost:9011`. You will see the FusionAuth setup screen.

{% include _image.liquid src="/assets/img/blogs/wordpress-sso-fusionauth/setup-wizard.png" alt="Setting up FusionAuth." class="img-fluid" figure=false %}

Enter your first name, last name, email, and password. Once done, click on "Submit" to finish the installation.

## Adding FusionAuth SSO to WordPress

Once FusionAuth and WordPress have been installed, you can proceed with adding FusionAuth SSO to your WordPress instance. In this section, you will install an OAuth Single Sign-On plugin and configure it to communicate with your local FusionAuth instance.

### Installing the plugin

For this tutorial, you will use the [OAuth Single Sign-On – SSO (OAuth Client)](https://wordpress.org/plugins/miniorange-login-with-eve-online-google-facebook/) by [miniOrange](http://miniorange.com/), but any OpenID compatible plugin should do.

{% include _callout-tip.liquid content="There are certain limitations with the free version of the 'OAuth Single Sign-On – SSO (OAuth Client)' plugin. There are paid versions that offer more flexibility, but this free version should be functional to demonstrate and implement SSO." %}

Go to your WordPress Admin Dashboard at `localhost:8030/wp-admin` and click on the "Plugins" page from the sidebar. Click on the "Add New" button, and on the next page, search for "OAuth Single Sign On – SSO (OAuth Client)".

The plugin should be the first one in the search results. Install and activate the plugin.

{% include _image.liquid src="/assets/img/blogs/wordpress-sso-fusionauth/select-miniorange-plugin.png" alt="Selecting the MiniOrange WordPress OIDC plugin." class="img-fluid" figure=false %}

Once the plugin is activated, you should have an option labeled "miniOrange OAuth" in your left sidebar. This is where you will be able to configure the plugin to work with FusionAuth.


### Configuring FusionAuth

To get started with SSO, you need to create an application in FusionAuth. An application represents the resource where users will log in to, in your case, the WordPress site. Each website, mobile app, or any other application should be created as an application in FusionAuth.

You can click on the "Applications" menu from the sidebar and then the green plus ("+") button in the top-right corner.

{% include _image.liquid src="/assets/img/blogs/wordpress-sso-fusionauth/application-list.png" alt="Applications list." class="img-fluid" figure=false %}

In the "Add Application" screen, provide a name for your app. This is just for display purposes so that you can distinguish your apps.

{% include _image.liquid src="/assets/img/blogs/wordpress-sso-fusionauth/create-application-initial-screen.png" alt="Initial create application screen." class="img-fluid" figure=false %}

Now, click on the OAuth tab. The default settings should suffice. The only thing you need to provide is the "Authorized redirect URLs" value. These are the URLs where users will be redirected after they're authenticated. In this case, the URL is provided and handled by the plugin, and the default value is your WordPress URL. So, enter `http://localhost:8030/`.

{% include _image.liquid src="/assets/img/blogs/wordpress-sso-fusionauth/create-application-oauth-screen.png" alt="Create application OAuth tab." class="img-fluid" figure=false %}

Once you move this application into production, be sure to update the authorized redirect URLs!

By default, FusionAuth will only provide login functionality. You will need to manually create new users through the admin panel. This is useful if you're building an internal site where you do not want users to register themselves, but in this tutorial, we want users to be able to create an account.

To enable user registration, click on the "Registration" tab and turn on "Self service registration." Select the "Login type" as "Username.” Keep the other default settings unchanged.

{% include _image.liquid src="/assets/img/blogs/wordpress-sso-fusionauth/create-application-registration-screen.png" alt="Create application registration tab." class="img-fluid" figure=false %}

When you are done, click on the blue save button in the top right corner:

{% include _image.liquid src="/assets/img/blogs/wordpress-sso-fusionauth/create-application-save-button-outlined.png" alt="Create application save button." class="img-fluid" figure=false %}

You will now be presented with a list of your applications. Click on the view button (the green looking glass) next to the application you just created:

{% include _image.liquid src="/assets/img/blogs/wordpress-sso-fusionauth/list-application-view-button.png" alt="View button on application list." class="img-fluid" figure=false %}

A popup will open with the details about your application.

{% include _image.liquid src="/assets/img/blogs/wordpress-sso-fusionauth/application-view-screen.png" alt="Application details view." class="img-fluid" figure=false %}

 Keep this window open as you'll need to do a bit of copy-pasting from here in the next step.

## Configuring the Plugin

In another tab, navigate to your WordPress admin dashboard and click on the "miniOrange OAuth" option from the sidebar. The plugin comes preconfigured with many Identity Providers. Unfortunately, FusionAuth is not one of them, so scroll down and select the "Custom OAuth 2.0 App" option.

{% include _image.liquid src="/assets/img/blogs/wordpress-sso-fusionauth/miniorange-custom-app-option.png" alt="The custom OAuth 2.0 App option" class="img-fluid" figure=false %}

On the next page, enter "FusionAuth" in the App Name field. This will be shown to your users when logging in.

Go back to the FusionAuth page and copy the "Client Id" and "Client Secret" from the popup window (you might have to scroll down a bit). Paste them in "Client Id" and "Client Secret" fields in the plugin configuration page respectively.

{% include _image.liquid src="/assets/img/blogs/wordpress-sso-fusionauth/application-view-client-id-client-secret.png" alt="Finding the Client Id and Client Secret." class="img-fluid" figure=false %}

Now fill the following fields in the :

1. In the "Authorize Endpoint", put `<your-fusionauth-domain>/oauth2/authorize`. In our case, it will be `http://localhost:9011/oauth2/authorize`.
2. In the "Access Token Endpoint", put `<your-fusionauth-domain>/oauth2/token`. In our case, it should be `http://localhost:9011/oauth2/token`, however since we're running in a Docker container, WordPress can't reach FusionAuth through `localhost`, so the URL should be `http://fusionauth:9011/oauth2/token`. Docker-Compose is taking care of the local DNS resolution.
3. In the "Get User Info Endpoint", put `<your-fusionauth-domain>/oauth2/userinfo`. In our case, for the same reason, it will be `http://fusionauth:9011/oauth2/userinfo`.

Note that the "Authorize Endpoint" need not be changed since that will be opened in the browser. If you're not using Docker, you should keep all the URLs pointed at `localhost`.

Finally, put "openid" in the "Scope" field and click on the "Save settings" button.

{% include _image.liquid src="/assets/img/blogs/wordpress-sso-fusionauth/miniorange-plugin-final-configuration.png" alt="Final miniOrange plugin configuration." class="img-fluid" figure=false %}

The last step is "Attribute mapping." This tells WordPress which attribute in the returned user object is the username so it can create users in WordPress and authenticate them appropriately. You set the "Login Type" to "Username" in the registration form, which means FusionAuth will collect usernames in the registration form.

To enable attribute mapping, you have to test the configuration first. Log out of FusionAuth and click on the "Test Configuration" button. This will open up a new window with the FusionAuth login page.

Click on "Create an account" and enter a username and password to register a new account.

{% include _image.liquid src="/assets/img/blogs/wordpress-sso-fusionauth/user-registration-page.png" alt="Registering a user." class="img-fluid" figure=false %}

Here you can log in with your credentials. On success, it will display a table containing your information. 

Now you can click on "Proceed To Attribute/Role Mapping" in the WordPress admin panel. On the next page, tell WordPress which among these fields is the username by selecting `preferred_username`. This is the OIDC claim that FusionAuth places the username field in. To learn more about the various claims, please review [the FusionAuth token documentation](/docs/v1/tech/oauth/tokens/).

Finally, click on "Save Settings" to complete the configuration process.

## Testing

To test the whole login flow, log out of the WordPress dashboard. Navigate to the WordPress login page (`http://localhost:8030/wp-login.php`) where you should see a "Login with FusionAuth" button below the usual login fields.

{% include _image.liquid src="/assets/img/blogs/wordpress-sso-fusionauth/wordpress-login-screen.png" alt="Wordpress login screen with FusionAuth login enabled." class="img-fluid" figure=false %}

Clicking on that button will take you to the FusionAuth login page, where you can log in with your credentials.

Once successfully authenticated, you will be redirected back to the WordPress site's homepage. You can confirm that this is indeed the user you logged in with by looking at the username, which should be that of your FusionAuth user.

Congratulations, you have successfully implemented SSO with FusionAuth in your WordPress site.

## Conclusion

In this tutorial, you learned how SSO can make the lives of your WordPress users easier by allowing them to use a single set of credentials to log into all your applications. You learned how FusionAuth can serve as your identity provider and how to integrate it with WordPress by leveraging an SSO plugin.


