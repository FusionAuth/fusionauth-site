---
layout: blog-post
title: "Using Single Sign-on with Discord and FusionAuth"
description: By configuring an integration between Discord and FusionAuth, you can use FusionAuth in your applications to allow users to log in with their Discord credentials.
author: Cameron Pavey
image: blogs/single-sign-on-drupal/how-to-set-up-single-sign-on-sso-between-fusionauth-and-drupal.png
category: blog
tags: tutorial tutorial-integration 
excerpt_separator: "<!--more-->"
---

Discord is a popular instant messaging and VoIP platform that allows users to form communities around common interests. There are a few reasons you might want to use Discord as your SSO identity provider. Discord is often used by hobby communities ranging from programming, gaming, and electronics to less technical things like finance and cooking. If there’s a community, there’s a good chance they have a Discord server. If you’re building a service aimed at one of these communities, using Discord as your SSO provider can make a lot of sense, allowing your users to log in with an account they already have rather than going through yet another registration process.

<!--more-->

There are other use cases for SSO with Discord, such as building a bot to automatically respond to and interact with members of your server. Using Discord for SSO also allows you to pull details about the user and their servers into your application, which can be useful if you are building something thematically related to Discord or the communities that use it.

## What is SSO with Discord?

Before diving into the tutorial, it’s important to understand what you’ll be doing. Single sign-on (SSO) is using a single set of credentials to authenticate in multiple places. In this case, it’s using your Discord credentials to authenticate with a different service. There’s a lot that goes on behind the scenes to make this possible, but thanks to authentication providers like FusionAuth and standards like OAuth, it doesn’t have to be a complicated task for developers. By configuring an integration between Discord and FusionAuth, you can use FusionAuth in your applications to allow users to log in with their Discord credentials—or credentials for any other SSO providers you want to configure.

## Implementing SSO with Discord and FusionAuth

To get started, you’ll need an account with [Discord](https://discord.com/), a code editor of your choice, and [Docker](https://www.docker.com) for running the FusionAuth server. It’s possible to run FusionAuth without Docker if you’d prefer, but the Docker approach is the cleanest and easiest to set up. Please refer to the [official documentation](https://docs.docker.com/get-started/) to install and configure Docker, and make sure you have a recent version of both Docker and Docker Compose installed.

Once you have these prerequisites in place, you need to log in to Discord and navigate to the [Developer Portal](https://discordapp.com/developers/applications/) to register a new application. Do this by selecting the **New Application** button near the top of the page. You’ll be presented with a dialog asking you to name your application. The name doesn’t matter for this tutorial, so give it any name that makes it easy for you to identify your application in the future.

![Discord Application](https://i.imgur.com/2JbfBwY.png)

After entering a name, you’ll be taken to your new application and presented with details about it. From here, navigate to the **OAuth2** menu in the sidebar. Here you can see further details such as your Discord Client ID and Secret. Make a note of these values, as you’ll need them to configure your FusionAuth Identity Provider. On this page, there is also an option to add redirect URLs. Add `http://localhost:9011/oauth2/callback` as your redirect URL. This address will resolve to the FusionAuth instance that you will set up in the next step.

Next, you need to set up a FusionAuth instance. If you already have a FusionAuth Cloud instance, you can use that, but for the sake of simplicity, this tutorial will assume you are using a locally hosted instance. There are detailed setup guides in the [documentation](https://fusionauth.io/docs/v1/tech/installation-guide/docker/), but the short version is that once you have Docker and Docker Compose set up and installed correctly, you can run the following command in a new directory to download and execute the necessary files.

```
curl -o docker-compose.yml https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/docker-compose.yml
curl -o .env https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/.env
docker-compose up
```

Once this command has finished running, you’ll be able to access FusionAuth at [http://localhost:9011/admin](http://localhost:9011/admin). When you navigate here for the first time, you will be prompted to create your administrator account. Create this user, and make sure to note down the email address and password.

![Administrator account](https://i.imgur.com/Kw87miH.png)

Once you’ve created your administrator account, you need to create a new application. Navigate to **Applications** in the sidebar, and click the Plus button at the top of the screen.

![Application details](https://i.imgur.com/TERhS7q.png)

You can leave the “Id” field blank, and it will generate a new universally unique identifier (UUID) for you. Give the application an appropriate name, and then move to the OAuth tab. For this tutorial, change the Client Authentication field to “Not required when using PKCE,” and the PKCE field to “Not required when using client authentication.”

Add an Authorized Redirect URL with a value of `http://localhost:9000/oauth-callback`, and set the logout URL as `http://localhost:8080`. These two URLs will resolve to the sample application, which you will configure shortly. Save your changes, and note the ID of the newly created application. Select the view icon to go back into your FusionAuth Application, and make a note of the Client ID and Secret. Be sure to label them so you don’t get them mixed up with the Discord Client ID and Secret.

Navigate to **Settings > Identity Providers**. This is where you’ll configure the actual Discord Identity Provider. Click the dropdown menu at the top and select **Add OpenID Connect**.

![Add OpenID Connect](https://i.imgur.com/39Y4b7T.png)

This will take you to another page where you can enter the settings for the Discord application you created previously.

![ID Provider details](https://i.imgur.com/IIXXaKe.png)

Give the Identity Provider a meaningful name (like “Discord”), enter the Client ID and Secret from your Discord application, and set the “Client authentication” to “Request body (client_secret_post).” 

Next, configure endpoints, which tell FusionAuth how to communicate with Discord during the authentication process. It’s important to set all three endpoints here correctly, otherwise the integration will not work properly. These endpoints have been known to change in the past; however, at the time of writing (February 2022), the values are:

- Authorization endpoint: https://discord.com/api/oauth2/authorize
- Token endpoint: https://discord.com/api/oauth2/token
- Userinfo endpoint: https://discord.com/api/users/@me (Note: make sure you use `@me` and not your Discord username here)

If you have trouble with these settings, be sure to refer to the [official Discord documentation](https://discord.com/developers/docs/topics/oauth2). Again, these URLS have changed in the past, and may change again in the future.

You also need to change the value of “Scope” to “identify email,” and update “Button text” to “Log In with Discord” as well. The button text is a cosmetic, not functional, change. Next, make sure this Identity Provider is enabled for the FusionAuth application you created previously. You should be able to see your application listed at the bottom of the screen, alongside the default “FusionAuth” application, and you can enable it here. Finally, go to the “Options” tab, and update the “Unique ID claim” from “sub” to “id.” You can now save your Identity Provider.

The last thing you need to do in the FusionAuth admin panel is to create an API key for the sample application. To do this, navigate to Settings > API Keys, and click the **Plus** button at the top. Leave the ID blank, and make a note of the Key value, then click the save button.

![Add API Key](https://i.imgur.com/VJvfPFk.png)

Your FusionAuth instance is now configured to work with Discord. To see it in action, you can configure a simple application that will allow you to log in using this new Identity Provider.

Rather than building one from scratch, you can make use of an existing public repo by the FusionAuth team, [FusionAuth Example: React](https://github.com/FusionAuth/fusionauth-example-react).

Clone this repo to your machine, and navigate to the `config.js` file located in the root directory of the project. Enter your details from when you set up your FusionAuth instance in the following fields:

- ClientID
- ClientSecret
- ApplicationID
- ApiKey

Once you have entered these details and saved them, do as the repo’s ReadMe prompts you, and navigate to both the `server/` and `client/` directories. In each directory, run `npm install && npm start`. Once both projects are installed and running, head to http://localhost:8080, and you should see the application running.

![Example Application](https://i.imgur.com/OvuFPou.png)

Click the **sign in** button, which will take you to your FusionAuth instance’s login screen, complete with a shiny new **Sign in with Discord**” button. Click this button, and you will be prompted to authorize through Discord.

![Discord authorization prompt](https://i.imgur.com/9YzhUFg.png)

After clicking **Authorize**, you’ll be taken back to the FusionAuth Example Application, where you’ll be presented with a response object containing your user data from Discord. If you see this, you have successfully authenticated with FusionAuth via Discord.

## Wrapping Up

If you’ve followed along, you should now have a FusionAuth instance configured to authenticate with Discord. As you would have seen during the configuration process, there are plenty more identity providers, and even more configuration options to choose from. Embrace the ways of SSO, and never worry about adding authentication to a project again.

