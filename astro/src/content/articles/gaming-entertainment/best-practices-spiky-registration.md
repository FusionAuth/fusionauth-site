---
title: Handling Spiky Game Traffic: Registration & Autoscaling Best Practices During Launch | FusionAuth
description: Learn how to manage spiky traffic during game launches or promotions. Explore best practices for autoscaling game servers and handling high registration volumes smoothly.
section: Gaming & Entertainment
author: Muhammad Yasoob Ullah Khalid
icon: /img/icons/registration-traffic-game-launches.svg
darkIcon: /img/icons/registration-traffic-game-launches-dark.svg
# date: 2022-08-24
# dateModified: 2022-08-24
---

Congrats! Your new massively multiplayer online (MMO) game is ready and you’re all set to launch. However, you’re not sure whether your servers can handle the load or whether the registration will fail under extreme load on launch day. If things really go wrong, you might lose users and revenue, which could possibly even lead to the failure of your game.

But you don’t have to panic. There are steps you can take to make sure your servers can handle any spikes in registration traffic. Most of the tips and best practices listed in this article will focus on user registration for online games, but they can also apply across different aspects of your online platform. They can help you save your launch day from disaster.

## Why Do You Need to Manage Launch Day Spikes?

Launch days can be chaotic for games, and even more so for online games. You need to be mindful of the following issues:

* **Capacity planning is difficult:** It’s hard to do capacity planning and make sure that ample server resources are available to cater to spikes in network traffic. You never know how many people are going to show up on launch day. Preregistration and beta launches help, but even they don’t provide you with concrete information about how many people you should expect on final launch.
* **A good registration flow is vital:** If you require users to sign up before they play the game, then you need to pay special importance to the registration flow. This integral part of the whole experience requires a lot of thought and planning. You should request only the crucial information required for gameplay on initial launch. If you ask for too much information upfront, users might be put off and leave without trying the game. You can ask for additional information after users have experienced the gameplay for a bit.
* **Spikes can cause failure:** If the registration form fails and starts throwing errors when an unusually high number of people try to sign up at the same time, you’ll lose precious customers.
* **Lost users won’t return:** If the registration fails on day one, the chances of users returning to try the game again are slim. This is their first experience with your game, and if they don’t leave with a good impression, you’ll permanently lose revenue.

To avoid this worst-case scenario, the following are eight key steps you can take to make your registration form resilient so that users keep coming back.

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

## Cache Resources Liberally

Almost every server framework contains some caching functionality. Make sure you’re using it, and try to cache as many resources as you can. This will make sure your server resources are being used most efficiently and are not being wasted by serving the same content to users.

Multiple open source tools are useful here as well. For example, [Memcached](https://memcached.org/) is an in-memory cache used by Netflix and Facebook, as well as other companies, that offers bindings for multiple languages. [Redis](https://redis.io/) is an in-memory database that is also used as a cache by developers.

You can also explore [Cloudflare](https://www.cloudflare.com/) and [Fastly](https://www.fastly.com/) as external cache proxies. They can save you a lot of money on top of resources by caching static content on the edge. This will also improve the user experience (UX) because users will be served content from the nearest edge server.

## Use Autoscaling

It’s always better to be equipped for unexpected scenarios. If your server code is deployed on a widely available public cloud like AWS, Google Cloud, or Azure, make sure you are using the available autoscaling functionality from your cloud provider and set some sane thresholds. This will ensure that no matter how much traffic you get on launch day, your servers can scale and cater to the increased demand.

If you’re on AWS, you can use [EC2 Auto Scaling](https://aws.amazon.com/ec2/autoscaling/), which relies on machine learning to horizontally scale your EC2 instances. You can configure it based on multiple criteria to make sure the threshold value is optimized for your budget. The picture below (taken from [AWS](https://docs.aws.amazon.com/autoscaling/plans/userguide/gs-configure-scaling-plan.html)) shows the different available threshold options:

![Options for EC2 auto scaling](/img/articles/spiky-game-day-launches/ec2-options.png)

Similar options are available for [Google Cloud Compute Engine](https://cloud.google.com/compute/docs/autoscaler) and [Microsoft Azure](https://azure.microsoft.com/en-us/features/autoscale/).

## Use a Monitoring Service

No matter how much effort you put in, unexpected things happen on launch days. A monitoring service such as [Sentry](https://sentry.io/welcome/), [New Relic](https://newrelic.com/), or [LogRocket](https://logrocket.com/) can help you stay prepared for unexpected runtime errors. Almost all of these services provide SDKs for most major languages. You can use them on your frontend as well as your backend and have alerts in place as soon as errors start popping up. You can’t fix something that you don’t know about, and the sooner you uncover runtime errors, the quicker you can fix them and make your game bug-free.

These services have developer-friendly integration documentation, generally offer a free tier, and require minimal effort to integrate with your code as a middleware in your backend or frontend stack.

Note that if you’re using a multi-step registration form, you should make sure the alerts fire appropriately if an error occurs in the intermediary steps of the registration flow.

## Use a CAPTCHA Service

Launch days also invite attention from bots, which could be random but could also be targeted efforts by your competitors. CAPTCHA stands for Completely Automated Public Turing Test To Tell Computers and Humans Apart. A CAPTCHA service is an easy first line of defense. Implementing one won’t automatically thwart all bot traffic, but it will make sure you execute IO-heavy database tasks only when legitimate users try to sign up.

You must verify a CAPTCHA as the first step on your backend and execute any intensive tasks after successful verification. Otherwise, the CAPTCHA will prevent bots from signing up but will not meaningfully help you in conserving your server resources.

If you’re not a big fan of CAPTCHAs, you can also try adding a hidden field to make sure bots aren’t filling out the form. If that field has a non-default value, then you can safely discard the form submission. I used this technique with the comments system on my blog and effectively cut down automated bot comments by 98 percent. This measure fails when confronted with any decent bot since it’s easy to bypass, but it’s better than nothing, and avoids hassling your users with a CAPTCHA.

## Reduce Form Questions

![Common Categories of Progressive Registration](/img/articles/spiky-game-day-launches/progressive-registration-steps.png)

Try to reduce the number of form fields you ask the user to fill out on initial sign-up. Ask only questions that are crucial for user gameplay. Even then, try to split the form into multiple steps and get the user’s email first.

This tip is just as important for better user experience as it is for preserving server resources. The longer the registration form, the higher the chances of a user giving up before completing it. You can always ask for more details once the user has played the game and is more willing to share extra information. If an error occurs in the later steps of the registration flow, you’ll already have the user’s email and can reach out to invite them back to the game and finish the registration.

## Use an External User Auth Service

Implementing authentication and authorization can be tricky, and if it’s not handled properly, you could face an information leak or full-blown database hack. If you decide to implement your own authentication and authorization service, think carefully about how you store user details. You should also make sure you use appropriate hashing algorithms and that the passwords are effectively salted before being stored in the database. You can read a bit about the underlying math [in this article](/articles/security/math-of-password-hashing-algorithms-entropy).

Explore using a third-party user authentication and authorization service. It helps you focus on what makes your game unique, and it’s especially useful when you want to implement SSO, and social auth. Depending on your platform, you may want to allow a user to log in with a gaming network login, such as the Xbox or PlayStation Network. An auth server can help with this integration.

Using an external auth server ensures that if the gameplay code breaks, the registration continues working, so you can reach out to registered users once the game comes back online. One option for third-party auth is [FusionAuth](/). It keeps your user data secure and provides all the social login integrations your game might need.

## Use Serverless Infrastructure

If your game architecture allows, it’s worthwhile to explore serverless options like [AWS Lambda](https://aws.amazon.com/lambda/), [Azure Functions](https://azure.microsoft.com/en-us/services/functions/), or [similar services](https://www.netlify.com/products/functions/). They ensure you don’t have to worry about over- or under-provisioning server resources; you pay only for the time you’re servicing traffic. Such services can help you manage your site, whether you get no traffic at all (you won't pay a dime) or you get a large amount of unplanned traffic. The underlying resources are automatically managed by the serverless infrastructure provider, so you’re free to focus on your core service. This option is an alternative to the autoscaling mentioned above.

There are [numerous guides](https://www.serverless.com/blog/strategies-implementing-user-authentication-serverless-applications/) to help you implement authentication and authorization in a serverless infrastructure. JWTs are commonly used in such services, and most third-party auth services like [FusionAuth](/articles/tokens/) support them.

## Conclusion

Launch day is the most important day for your game or web app. If it’s handled correctly, you get a big boost for your business, but if overwhelming registration demand sours the experience for would-be users, your business could be damaged instead.

The best practices listed in this article can help improve the user registration experience and handle spikes in registration traffic on launch day. Even though several of these tips—such as caching, autoscaling, and monitoring—don’t take much time to implement, they can offer large dividends. If you’re prepared to handle traffic when your game launches, you’ll be able to reap the benefits for long afterward.

