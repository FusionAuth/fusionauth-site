﻿---
layout: blog-post
title: Three tips for handling spiky gameday launches
description: Game launches often result in large traffic spikes. How can you plan for these.
author: Muhammad Yasoob Ullah Khalid
image: blogs/spiky-gameday-launches/3-tips-handling-spiky-gameday-launches.png
category: blog
excerpt_separator: "<!--more-->"
---

Congrats! Your new massively multiplayer online (MMO) game is ready and you’re all set to launch. However, you’re not sure whether your servers can handle the load or whether the registration will fail under extreme load on launch day. If things really go wrong, you might lose users and revenue, which could possibly even lead to the failure of your game.

<!--more-->

But you don’t have to panic. There are steps you can take to make sure your servers can handle any spikes in registration traffic. Most of the tips and best practices listed in this article will focus on user registration for online games, but they can also apply across different aspects of your online platform.

_This blog post is an excerpt from [Best Practices for Handling Spiky Registration Traffic for Game Launches](/learn/expert-advice/gaming-entertainment/best-practices-spiky-registration)._

Here are three tips to help save your launch day from disaster.

## Run Load Testing and Stress Testing

Make sure you have load tested and stress tested your registration form. The former makes sure the server can handle expected user load, while the latter makes sure the system stays reliable and robust under unexpectedly high user load (upper bound).

You can easily run these tests using a host of available open source tools such as [Locust](https://github.com/locustio/locust) and [JMeter](https://jmeter.apache.org/). These tools will help make sure your registration form can handle a high number of concurrent users and does not crash under high load. Try to integrate them into your continuous integration/continuous deployment (CI/CD) cycle and test your forms and core logic before deploying live.

These tools are fairly straightforward to use. For instance, you can create a login test using Locust like this:

```python
from locust import HttpUser, task

class LoginUser(HttpUser):
	@task
	def process_login(self):
		self.client.post("/login", json={"username":"foo", "password":"bar"})
```

The above code will continuously send post requests to the `/login` endpoint. (You’ll want it to stop eventually!) You can explore the [Locust documentation](https://docs.locust.io/en/stable/) for more examples.

Don't just focus on the average time to respond. Also take a look at the 95th percentile, often called p95. This tells you what users with a really slow experience are seeing.

## Cache Resources Liberally

Almost every server framework contains some caching functionality. Make sure you’re using it, and try to cache as many resources as you can. This will make sure your server resources are being used most efficiently and are not being wasted by serving the same content to users.

Multiple open source tools are useful here as well. For example, [Memcached](https://memcached.org/) is an in-memory cache used by Netflix and Facebook, as well as other companies, that offers bindings for multiple languages. [Redis](https://redis.io/) is an in-memory database that is also used as a cache by developers.

You can also explore [Cloudflare](https://www.cloudflare.com/) and [Fastly](https://www.fastly.com/) as external cache proxies. The public clouds have their own options as well. They can save you a lot of money on top of resources by caching static content on the edge. This will also improve the user experience (UX) because users will be served content from the nearest edge server, which is quicker.

## Reduce Form Questions

Try to reduce the number of form fields you ask the user to fill out on initial sign-up. Ask only questions that are crucial for user gameplay. Even then, try to split the form into multiple steps and get the user’s email first.

This tip is just as important for better user experience as it is for preserving server resources. The longer the registration form, the higher the chances of a user giving up before completing it. You can always ask for more details once the user has played the game and is more willing to share extra information. If an error occurs in the later steps of the registration flow, you’ll already have the user’s email and can reach out to invite them back to the game and finish the registration.

To learn more about other best practices, including CAPTCHAs and monitoring, read [Best Practices for Handling Spiky Registration Traffic for Game Launches](/learn/expert-advice/gaming-entertainment/best-practices-spiky-registration).
