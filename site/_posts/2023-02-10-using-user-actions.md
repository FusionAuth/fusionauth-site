---
layout: blog-post
title: Using FusionAuth User Actions
description: In this tutorial, we'll create User Actions to coordinate events around a customer purchase.
author: Ritza
category: tutorial
tags: tutorial user-actions
image: blogs/user-actions/user-actions-blog-image.png
excerpt_separator: "<!--more-->"
---

In this tutorial, we'll create FusionAuth User Actions to automate emails and notifications when a user buys temporary access to a news site.

<!--more-->

The concept itself is a common type of scenario: A user buys temporary access to a news site. You can apply a FusionAuth User Action which broadcasts that to all the sister news sites, which can now try to upsell the user to buy a subscription, as well as send an email to the user thanking them. When the user's access expires, User Actions can send an automatic email thanking them.


## Prerequisites

We'll explain nearly everything that we use, but we expect you to have:
-   Docker and Docker Compose set up as we'll set up FusionAuth using these.
    
It'll also help if you know the basics of OAuth or authentication in general.

## Why FusionAuth User Actions instead of custom code?

<todo>

## Installing and configuring FusionAuth with Docker Compose

There are [various ways](/docs/v1/tech/installation-guide/fusionauth-app) to install FusionAuth depending on your system, but the easiest way is to use Docker and Docker Compose. Instructions are [here](/docs/v1/tech/installation-guide/docker). Currently, if you have Docker installed, you can run the following commands to install and run FusionAuth:

```bash
curl -o docker-compose.yml https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/docker-compose.yml
https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/docker-compose.override.yml
curl -o .env https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/.env
docker-compose up
```

Note that here we use a public `.env` file containing hard-coded database passwords—this is not suitable for production use.


### Configuring FusionAuth

FusionAuth should now be running and reachable on your chosen URL or `http://localhost:9011` if you've installed it locally. The first time you visit, you'll be prompted to set up an admin user and password. 

{% include _image.liquid src="/assets/img/blogs/fusionauth-user-actions/user-actions-initial-setup.png" alt="FusionAuth initial setup user and password" class="img-fluid" figure=false %}

Once you've done this, you'll be prompted to complete three more set-up steps, as shown below.

{% include _image.liquid src="/assets/img/blogs/spring-fusionauth/fusionauth-setup1.png" alt="FusionAuth prompts us with the setup steps that we need to complete." class="img-fluid" figure=false %}

Sending emails to communicate to the user about their purchase is a vital part of this tutorial, so you'll want to set that up. Read more about setting up [email on FusionAuth here](https://fusionauth.io/docs/v1/tech/email-templates/configure-email)

### Creating an application

Click "Setup" under "Missing Application" and call your new app "Silicon Valley Chronicle" or another name of your choice. Select a tenant if you've set more than one up already.
	
{% include _image.liquid src="/assets/img/blogs/fusionauth-user-actions/user-actions-add-application.png" alt="FusionAuth Add Application" class="img-fluid" figure=false %}

Click the "Save" button at the top right for your changes to take effect.

### Creating a user
	
Two users are required for a User Action to take effect: an `actioner` and an `actionee`. The `actioner` will be the admin user that you created when you set up FusionAuth for the first time. The `actionee` will be the user who buys temporary access to our news site.
	
To create a user, navigate to `Users` and click the `Add` button. Then supply an email address. You can untoggle the `Send email to set up password` switch to supply a password straight away. 
	
{% include _image.liquid src="/assets/img/blogs/fusionauth-user-actions/user-actions-create-user.png" alt="Create User" class="img-fluid" figure=false %}
	
### Creating an API Key
	
We will create and execute our User Action through API calls, so we need to set up an API Key. Navigate to `Settings -> API Keys` and click the `Add` button. Make sure `POST` is enabled for both the `/api/user-action` and `/api/user/action` endpoints. We will use the former to create our User Action and the latter to execute it. 
	
{% include _image.liquid src="/assets/img/blogs/fusionauth-user-actions/user-actions-create-api-key.png" alt="Create API Key" class="img-fluid" figure=false %}
	
Record the value of your API Key.
	
{% include _image.liquid src="/assets/img/blogs/fusionauth-user-actions/user-actions-api-key-created.png" alt="API Key Created" class="img-fluid" figure=false %}
	
### Creating email templates
	
Our User Action will send four different emails to the `actionee` upon four different conditions: when they `sign up`, if they `modify` or `cancel` their subscription, and when that subscription `expires`. Create four email templates for each of these conditions and record their IDs. More information on email templates in FusionAuth can be found [<todo>](here).
	
{% include _image.liquid src="/assets/img/blogs/fusionauth-user-actions/user-actions-email-templates.png" alt="Email Templates" class="img-fluid" figure=false %}
	
### Creating the User Action
	
We can now create a [user action definition](https://fusionauth.io/docs/v1/tech/apis/user-actions) with the email ids and POST using `/api/user-action`. The `temporal` attribute allows us to set an `expiry` time when we execute the action.
	
	```sh
	curl --location --request POST 'https://<YOUR_FUSIONAUTH_URL>/api/user-action' \
		--header 'Authorization: <YOUR API KEY>' \
		--header 'Content-Type: application/json' \
		--data-raw '{
      "userAction": {
        "name": "Bought Temporary Access",
        "startEmailTemplateId": "5eaf58e7-2e5a-4eea-94b8-74a707724f7b",
        "endEmailTemplateId": "18490dc2-b3d4-462f-9a8e-882b4fb4e76f",
        "modifyEmailTemplateId": "2011460f-bd11-4134-ba8a-9d4c6c4a23ae",
        "cancelEmailTemplateId": "981a1ecf-4a1d-44b8-8211-3215cb80319f",
        "temporal": true,
        "userEmailingEnabled": true,
        "sendEndEvent": false
	    }
	}'
	```

	Should return:

	```json
		{
		    "userAction": {
		        "active": true,
		        "cancelEmailTemplateId": "981a1ecf-4a1d-44b8-8211-3215cb80319f",
		        "endEmailTemplateId": "18490dc2-b3d4-462f-9a8e-882b4fb4e76f",
		        "id": "6f4115c0-3db9-4734-aeda-b9c3f7dc4269",
		        "includeEmailInEventJSON": false,
		        "insertInstant": 1674937446558,
		        "lastUpdateInstant": 1674937446558,
		        "modifyEmailTemplateId": "2011460f-bd11-4134-ba8a-9d4c6c4a23ae",
		        "name": "Bought Temporary Access",
		        "options": [],
		        "preventLogin": false,
		        "sendEndEvent": false,
		        "startEmailTemplateId": "5eaf58e7-2e5a-4eea-94b8-74a707724f7b",
		        "temporal": true,
		        "transactionType": "None",
		        "userEmailingEnabled": true,
		        "userNotificationsEnabled": false
		    }
		}
	```

Record the `id` value. Here, it is `6f4115c0-3db9-4734-aeda-b9c3f7dc4269`. You can verify that the User Action was created by going to `Settings -> User Actions`.
	
{% include _image.liquid src="/assets/img/blogs/fusionauth-user-actions/user-actions-user-action-created.png" alt="User Action Created" class="img-fluid" figure=false %}

### Executing the User Action
	
Now you can [apply the action](https://fusionauth.io/docs/v1/tech/apis/actioning-users) to a specific user with the `api/user/action` endpoint. The `expiry` time follows the UNIX epoch format in milliseconds. Make sure the `actioneeUserId`, `actionerUserId`, and `userActionId` values match the ones you recorded in the previous steps.
	
	```sh
	curl --location --request POST 'https://<YOUR_FUSIONAUTH_URL>/api/user/action' \
		--header 'Authorization: <YOUR API KEY>' \
		--header 'Content-Type: application/json' \
		--data-raw '{
		  "broadcast": true,
		  "action": {
		    "actioneeUserId": "12e22430-162c-4f7e-bf40-58f7a69a26ce",
		    "actionerUserId": "5ea819ea-6ff1-4b17-943f-eb2d1c246c3b",
		    "comment": "Signed up for 24 hour premium access",
		    "emailUser": true,
		    "expiry": 1674903995472,
		    "notifyUser": true,
		    "userActionId": "fbff792c-2340-4d72-b4fd-534f94d0a94b"
		  }
		}'
	```
	should reply with 200 OK
	```js
		{
		    "action": {
		        "actioneeUserId": "12e22430-162c-4f7e-bf40-58f7a69a26ce",
		        "actionerUserId": "5ea819ea-6ff1-4b17-943f-eb2d1c246c3b",
		        "applicationIds": [],
		        "comment": "Signed up for 24 hour premium access",
		        "emailUserOnEnd": true,
		        "expiry": 1674939392664,
		        "id": "8ed1f910-4e62-4dd1-a88e-e45964b56e21",
		        "insertInstant": 1674938412450,
		        "localizedName": "Bought Temporary Access",
		        "name": "Bought Temporary Access",
		        "notifyUserOnEnd": false,
		        "userActionId": "6f4115c0-3db9-4734-aeda-b9c3f7dc4269"
		    }
		}
	```

Upon executing this action, the `actionee` will receive an email thanking them for their subscription.
