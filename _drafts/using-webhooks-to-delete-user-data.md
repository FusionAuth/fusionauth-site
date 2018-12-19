---
layout: blog-post
title: Using Webhooks In FusionAuth To Delete User Data
author: John Philips
excerpt_separator: "<!--more-->"
categories:
- Passport
- Tutorials
- Resources
tags:
- API
- Passport
- user data
- Identity Management
- CIAM
- tutorial
---
<p><img class="aligncenter size-full wp-image-9047" src="" alt="Using webhooks in FusionAuth" width="1200" height="600"></p>
<p>If your inbox looks anything like mine, it’s currently full of messages from companies updating their privacy policies and terms of service. This is mainly due to a newly adopted EU regulation, the <a href="/blog/2018/03/23/white-paper-developers-guide-gdpr/?utm_source=posts&amp;utm_medium=blog&amp;utm_campaign=site" target="_blank" rel="noopener">General Data Protection Regulation</a> or GDPR, which goes into effect on May 25, 2018. The GDPR grants a set of “digital rights” to EU citizens, including a “right to erasure.” Basically, this means a user can request that their data be deleted, and there can be substantial fines if a company is not able to honor these requests.</p>
<p>In this post, we’ll show how to set up webhooks in FusionAuth to delete all of a user’s data when they delete their account. In FusionAuth, webhooks are used to subscribe or listen to events in the system, so we’ll create a webhook that listens to the ```user.delete``` event.</p>
<p><!--more--></p>
<h2>What is a Webhook?</h2>
<p>In case you are not familiar with webhooks in FusionAuth and other platforms, they are an effective component of interactive user experiences on websites and applications. In the most basic terms, webhooks are simple event notifications that send a message to the application that something happened. Upon receiving that message, the application can react. It may trigger a change in the user’s interface, or it can initiate more complex processes within the application. The options are endless and developers are taking advantage of this technique to make more engaging experiences. For more information, there’s a useful <a href="https://webhooks.pbworks.com/w/page/13385124/FrontPage" target="_blank" rel="noopener">introduction to webhooks here</a>.</p>
<h2>Creating Webhooks in FusionAuth</h2>
<p>There are two ways to create webhooks in FusionAuth. The first is to use the FusionAuth Backend UI and it is pretty straight-forward. After logging in, click on <strong>Settings → Webhook</strong>. <a href="https://www.youtube.com/watch?v=WtMDUnOEKAU" target="_blank" rel="noopener">This tutorial video</a> shows exactly how the interface works.</p>
<p><img class="aligncenter size-full wp-image-8991" src="" alt="Using Webhooks In FusionAuth" width="1200" height="972"></p>
<p>The second way to create webhooks in FusionAuth is programmatically by using the API and sending a JSON request. Simply send a POST request to ```/api/webhook```. This will create the ID for the webhook automatically. If you want to specify the ID, post to ```/api/webhook/{webhookId}```.</p>
<p>The fully qualified URL depends on where you are running the FusionAuth Backend. If it is running on your machine, the URL would be ```http://localhost:9011/api/webhook```. If we are hosting FusionAuth, the URL will be shown in your FusionAuth Account.</p>
<h3>Authentication</h3>
<p>The webhook API requires authentication. To access it, you’ll need make the request using an API key sent in an Authorization header. Using curl, the request would look something like this:</p>
<pre class="show-lang:2 lang:js decode:true">curl -H 'Authorization: 2524a832-c1c6-4894-9125-41a9ea84e013’ http://localhost:9011/api/webhook
</pre>
<p>(<a href="/docs/1.x/tech/tutorials/create-an-api-key" target="_blank" rel="noopener">Learn more about creating an API key</a> or <a href="/docs/1.x/tech/apis/authentication" target="_blank" rel="noopener">how authentication works in FusionAuth</a>.)</p>
<h3>JSON Request Example</h3>
<pre class="show-lang:2 lang:js decode:true">{
    "webhook": {
        "applicationIds": [
        "4ed5eb32-0a97-40eb-a6d7-cca1f9fa3a0c"
    ],
    "connectTimeout": 1000,
    "description": “A webhook attached to user.delete”,
    "eventsEnabled": {
        "user.create": false,
        "user.delete": true
    },
    "headers": {
        "Authorization": "4ed5eb32-0a97-40eb-a6d7-cca1f9fa3a0c"
    },
    "global": false,
    "httpAuthenticationPassword": "password",
    "httpAuthenticationUsername": "username",
    "readTimeout": 2000,
    "url": “http://localhost:8080/webhook-user-delete“
   }
}</pre>
<p>There are three required parameters:</p>
<ul>
<li>The parameter ```connectTimeout``` sets the time in milliseconds that FusionAuth will wait when connecting to the webhook.</li>
<li>The parameter ```readTimeout``` sets the time in milliseconds that FusionAuth will wait when reading data from the webhook.</li>
<li>The ```url``` provides the address FusionAuth will connect to when the webhook is called.</li>
</ul>
<p>In addition to the required parameters, you’ll want to add:</p>
<ul>
<li>
<strong>One or more ```applicationIds```</strong>: These specify the applications associated with the webhook. If you’d rather configure the webhook to work for all your applications, set the global flag to true and omit the application IDs. However, if no IDs are specified and global flag is false, the webhook will never get called.</li>
<li>
<strong>The events that trigger the webhook</strong>: In this case, we want to be passed the ```user.delete``` event. (<a href="/docs/1.x/tech/events-webhooks/events" target="_blank" rel="noopener">The full list of events can be found here</a>.)</li>
<li>
<strong>Any credentials needed to access the server hosting the webhook</strong>: The example shows a user name and password, which would be used if the server has HTTP basic authentication enabled. You can also include an SSL Certificate in PEM format, if your server requires an SSL connection.</li>
<li>
<strong>An Authorization header that contains an API key</strong>: This prevents malicious access to the webhook. Without the key, the webhook cannot be executed. In the example, our hook is deleting data so it makes sense to be cautious.</li>
</ul>
<p>(<a href="/docs/1.x/tech/apis/webhooks#create-a-webhook" target="_blank" rel="noopener">The full list of webhook parameters is documented here</a>.)</p>
<h3>API Response</h3>
<p>If the webhook was set up properly, you’ll get a back a response code of ‘200’ and a JSON body that looks similar to the request.</p>
<p>If the request was malformed or invalid, you’ll get back a ‘400’ response code and a JSON object detailing the errors. A ‘401’ response indicates an authorization problem. Either the authorization header was omitted or the API key was invalid.</p>
<h3>Event JSON Example</h3>
<p>Once you have the webhook configured, FusionAuth will post JSON data to the URL when a matching event occurs. Our webhook is subscribed to the ```user.delete``` event. When this occurs, FusionAuth will post a JSON request to the webhook URL. The JSON will look something like this:</p>
<pre class="show-lang:2 lang:js decode:true">{
  "event": {
	"type": "user.delete",
	"createInstant" : 1505762615056,
	"id" : "e502168a-b469-45d9-a079-fd45f83e0406",
	"user": {
	  "active": true,
	  "birthDate": "1986-03-15",
	  "data": {
		"attributes": {
		  "screenName": "Hope15",
		}
	  },
	  "email": "hope15@email.com",
	  "expiry": 1571786483322,
	  "firstName": "Hope",
	  "fullName": "Hope Pierce",
	  "imageUrl": "https://avatars.licdn.com.com/u/1030341?s=40&amp;v=4&amp;t=png",
	  "lastLoginInstant": 1471786483322,
	  "lastName": "Pierce",
	  "middleName": "Julia",
	  "passwordChangeRequired": false,
	  "passwordLastUpdateInstant": 1471786483322,
	  "registrations": [
		{
		  "applicationId": "10000000-0000-0002-0000-000000000001",
		  "data": {
			"attributes": {
			  "displayName": "Hope",
			  "subscribedCategories": [
				"News",
				"Technology",
				"Weather",
				"Entertainment",
				"Sports"
			  ]
			},
			"preferredLanguages": [
			  "en"
			]
		  },
		  "id": "00000000-0000-0002-0000-000000000000",
		  "insertInstant": 1446064706250,
		  "lastLoginInstant": 1456064601291,
		  "username": "Hope15",
		  "usernameStatus": "ACTIVE"
		}
	  ],
	  "timezone": "America/Denver",
	  "twoFactorEnabled": false,
	  "usernameStatus": "ACTIVE",
	  "username": "Hope15",
	  "verified": true
	}
  }
}
</pre>
<h2>An Example Webhook</h2>
<p>For our example, we’re going write our webhook using <a href="https://expressjs.com/" target="_blank" rel="noopener">Express</a>, a simple web framework for Node.js.</p>
<pre class="show-lang:2 lang:js decode:true ">router.route('/webhook-user-delete').post((req, res) =&gt; {
  const authorization = req.header('Authorization');
  if (authorization !== 'config.apiKey') {
	res.status(401).send({
	  'errors': [{
		'code': '[notAuthorized]'
	  }]
	});
	return;
  }

  const request = req.body;
  if (request.event.type === 'user.delete') {
	savedItems.deleteAll(request.event.user.id)
	  .then(() =&gt; {
		res.sendStatus(200);
	  })
	  .catch(function(err) {
		_handleDatabaseError(res, err);
	  });
  }
});
</pre>
<p>This sets up a route to handle the URL for our webhook. The first bit of code checks that the Authorization header contains the correct API key. (This key would be stored in the Express app.)</p>
<p>The line ```savedItems.deleteAll(request.event.user.id)``` is a call to delete the user’s data. Once the data has been deleted, our webhook will respond with a status code of 200. With the webhook attached, FusionAuth will wait to delete the user until it gets a success code back from the webhook. By deleting the user’s saved data in response to the ```user.delete``` event we are in effect keeping our application database in sync with the FusionAuth user database.</p>
<h2>Wrapping Up</h2>
<p>This post shows the power and simplicity of using webhooks in FusionAuth. By subscribing to events, your application can easily respond to changes in user data. This publish and subscribe pattern is a core feature of FusionAuth’s architecture. If you have any questions or problems, <a href="/support?utm_source=post&amp;utm_medium=internal&amp;utm_campaign=site" target="_blank" rel="noopener">send us a message</a> and we’ll be happy to help.</p>
<h2>Learn More About FusionAuth</h2>
<p>FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management (CIAM) solution available on the market. More than a login tool, we provide registration, data search, user segmentation and advanced user management across applications. <a href="/products/identity-user-management?utm_source=post&amp;utm_medium=internal&amp;utm_campaign=site">Find out more</a> about FusionAuth and sign up for a free trial today.</p>
<p style="text-align: center;"><a class="orange-button-material small w-button" href="https://goo.gl/kk4igG">Try FusionAuth</a></p>
