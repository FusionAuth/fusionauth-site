---
layout: blog-post
title: How to add magic links to your Java Spring application
description: It is easy to add magic links to your Java Spring application. Just integate FusionAuth and then configure magic links.
author: Dan Moore
image: advice/how-complete-auth-provider/expert-advice-how-complete-does-your-authentication-provider-need-to-be-header-image.png
date: 2021-09-14
---

## Intro

Magic links are a great way to make it easier for your users to log in to your application. They work by sending the user a one time code in a link, typically as an email or SMS message. When the user clicks on the link, they are then logged in to the application.

In this tutorial, you are going to learn how to add magic links functionality to your Java Spring application. You'll use FusionAuth to augment your application to easily add magic link login.

## Prequisites

You'll need to have Java and Maven installed. 

You'll also need Docker, since that is how you'll install FusionAuth.

## Download and install FusionAuth

First, make a project directory:

```shell
mkdir java-spring-magic-links && cd java-spring-magic-links
```
Then, install FusionAuth:

```bash
curl -o docker-compose.yml https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/docker-compose.yml
https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/docker-compose.override.yml
curl -o .env https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/.env
docker-compose up
```

TBD do we want to ship with mailcatcher so that email is taken care of?

## Create a user and an API key

Next, [log into your FusionAuth instance](http://localhost:9011). You'll need to sign up with a user and a password.

You're at the FusionAuth admin UI. This lets you configure FusionAuth via clickops. But you're only going to create an API key and then you'll configure FusionAuth using our Java client library. 

Navigate to "Settings" and then "API Keys". Click the + button to add a new API Key. Copy the value of the "Key" field and then save the key. It might be a value like `CY1EUq2oAQrCgE7azl3A2xwG-OEwGPqLryDRBCoz-13IqyFYMn1_Udjt`. This creates an API key that can be used for any FusionAuth API call.

## Install the client library

Nexgt, 

Install the client library
Run a script to set up FusionAuth
Create an application
Set up the redirect URI
Save off client secret and client id
Register user
Set up issuer on tenant
Configure signing keys
Spring stuff
Create new spring boot app
Include oauth-client
Configure application.properties
Set up code configuration
Add logged out page
Add logged in page
Start spring server and FusionAuth
Visit home page
Run a second script
Turn on magic links
Configure email provider
Click on ‘login here’
See magic link button

resources
