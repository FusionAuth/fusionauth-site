---
layout: blog-post
title: Using FusionAuth User Actions
description: In this tutorial, we'll create User Actions to coordinate events around a customer purchase.
author: Ritza
category: tutorial
tags: tutorial user-actions
image: blogs/spring-fusionauth/user-actions-blog-image.png
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

FusionAuth should now be running and reachable on your chosen URL or `http://localhost:9011` if you've installed it locally. The first time you visit, you'll be prompted to set up an admin user and password. Once you've done this, you'll be prompted to complete three more set-up steps, as shown below.

{% include _image.liquid src="/assets/img/blogs/spring-fusionauth/fusionauth-setup1.png" alt="FusionAuth prompts us with the setup steps that we need to complete." class="img-fluid" figure=false %}

Sending emails to communicate to the user about their purchase is a vital part of this tutorial, so you'll want to set that up. Read more about setting up [email on FusionAuth here](https://fusionauth.io/docs/v1/tech/email-templates/configure-email)

### Creating an application

Click "Setup" under "Missing Application" and call your new app "Silicon Valley Chronicle" or another name of your choice. 

Click the "Save" button at the top right for your changes to take effect.


### Steps


1. Setup an [email provider on your tenant](https://fusionauth.io/docs/v1/tech/email-templates/configure-email)
1. Create a test user. Record User Id. Record User Id of admin user.
1. Create email templates in FusionAuth:(link)
 	- Save and copy ID from the email list page
 		- signup ID: 5eaf58e7-2e5a-4eea-94b8-74a707724f7b
 		- expired ID: 18490dc2-b3d4-462f-9a8e-882b4fb4e76f
1. Create API Access Key. Allow post and Gets to User Actions 
		- `/api/user-action`
		- `/api/user/action`
	Key: dLPw9kJmBLd4zIegTu4S1N5XoK_G0ZkbzCNjYPU8ZsRKNnYWDiGQ1x1U

1. Create a user [user action definition](https://fusionauth.io/docs/v1/tech/apis/user-actions) with the email ids and POST using `/api/user-action`
	```json
	{
  		"userAction": {
  			"name": "Bought Temporary Access",
  			"startEmailTemplateId": "5eaf58e7-2e5a-4eea-94b8-74a707724f7b",
  			"endEmailTemplateId": "18490dc2-b3d4-462f-9a8e-882b4fb4e76f",
  			"temporal": true,
  			"userEmailingEnabled": false,
  			"sendEndEvent": false
  		}
  	}
	```

	```sh
	curl --location --request POST 'https://fusionauth.ritza.co/api/user-action' \
		--header 'Authorization: dLPw9kJmBLd4zIegTu4S1N5XoK_G0ZkbzCNjYPU8ZsRKNnYWDiGQ1x1U' \
		--header 'Content-Type: application/json' \
		--data-raw '{
			    "userAction": {
			        "name": "Bought Temporary Access",
			        "startEmailTemplateId": "5eaf58e7-2e5a-4eea-94b8-74a707724f7b",
			        "endEmailTemplateId": "18490dc2-b3d4-462f-9a8e-882b4fb4e76f",
			        "modifyEmailTemplateId": "2011460f-bd11-4134-ba8a-9d4c6c4a23ae",
			        "cancelEmailTemplateId": "2011460f-bd11-4134-ba8a-9d4c6c4a23ae",
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
		        "cancelEmailTemplateId": "2011460f-bd11-4134-ba8a-9d4c6c4a23ae",
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

	Record `id: fbff792c-2340-4d72-b4fd-534f94d0a94b`


1. Now you can [apply the action](https://fusionauth.io/docs/v1/tech/apis/actioning-users) to a specific user:
	```json
		{
		  "broadcast": true,
		  "action": {
		    "actioneeUserId": "12e22430-162c-4f7e-bf40-58f7a69a26ce",
		    "actionerUserId": "5ea819ea-6ff1-4b17-943f-eb2d1c246c3b",
		    "comment": "Signed up for 24 hour premium access",
		    "emailUser": true,
		    "expiry": 1674903995472,
		    "notifyUser": true,
		    "reasonId": "00000000-0000-0000-0000-000000000020",
		    "userActionId": "fbff792c-2340-4d72-b4fd-534f94d0a94b"
		  }
		}
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

