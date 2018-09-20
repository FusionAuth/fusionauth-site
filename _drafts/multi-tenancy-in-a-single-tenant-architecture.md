---
layout: blog-post
title: Multi-tenancy in a Single-tenant Architecture
author: Daniel DeGroff
categories: blog
image: multi-tenancy.png
excerpt_separator: <!--more-->
---

While FusionAuth is fundamentally a single-tenant solution, we do support multiple tenants within a single-tenant instance. In this post I'll outline a few of the common use cases we solve with our tenancy feature.
<!--more-->

* [White labeled Identity](#white-label)
* [Dev, Stage and Prod](#dev-stage-prod)

{: .mt-5}


## White labeled Identity        {#white-label}

![white-label](/assets/img/blogs/white-label.png){:style="width: 250px; padding-right: 20px;"}
{: .float-right}

We have several clients that, like us, are also software companies. With these clients, it is very common for them to be selling Software as a Service (SaaS) solutions. This means they have many clients using a single instance of their platform.

Let's assume Acme Corp. sells a marketing communication platform that provides commerce, customer relationship management (CRM) and user management to small companies.  

Jane works for `funnymugs.com` and moonlights as a writer at `chucknorrisjokes.com`. Both of these websites buy their software from Acme Corp.

Jane may be very (unpleasantly) surprised if after getting hired at `chucknorrisjokes.com` she went to register her user and she was notified someone else had already registered with the email address `jane_smith@gmail.com`.
 
*COMMENT: I think we need to explain why this happens and maybe even diagram it out. This is somewhat a complex situation and that's why I put in diagrams in my slides* 

This would be a poor user experience and not ideal for Acme Corp. While both users are technically Jane, she is not aware of this nuance in the method that Acme Corp. built their platform.

In most cases we want a user to be considered unique by their email address. You can think of this the same way that your Gmail address works. You have a single Google account, and you can use that set of credentials to gain access to Gmail, Blogger, YouTube, Google Play, (ahem..) Google+, Google Analytics and more. Each of these applications are considered an authenticated resource, and Google simply grants you permission to each of them based upon your credentials. 

This is how FusionAuth views the world as well, we support one to many Applications in FusionAuth which represent different authenticated resources. A single user can register or be granted permissions to multiple Applications. This is also where our single sign-on comes into play. You login once and then you can access each Application without the need to log into each one separately.  

However as you just saw with Acme Corp., when the platform is opaque to the end user and there is only a single identity for a single email address, surprising side-effects start to occur. In this case, what Acme Corp. needs is a way to partition each of their clients into their own namespace. This is one of the main reasons we built FusionAuth Tenants. 

A FusionAuth tenant is simply a namespace where Applications, Groups and Users exist. Now Acme Corp. can allow Jane to create her account with the same unique email address `jane_smith@gmail.com` in multiple tenants. They become separate unique identities, one per tenant. Jane can then manage her permissions, passwords, and user details discretely inside each tenant (i.e. each client of Acme Corp.). 

We still strongly believe that a single-tenant solution is the most secure option for our clients, so while we are still a single-tenant solution, we do allow our clients to build multi-tenant solutions to better suit their requirements. 


## Dev, Stage and Prod      {#dev-stage-prod}

![white-label](/assets/img/blogs/dilbert-project.png){:style="width: 650px; max-width: 650px; padding-right: 20px; padding-top: 5px;"}
{: .float-left}

For this use case, we don't have multiple clients, but instead we have a single production environment using FusionAuth.

However, in addition to production, we need separate environments for development, build and QA. One option is to stand up a separate instance of FusionAuth for each of these environments. This ensures that the development environment doesn't impact the build environment, which doesn't impact the QA environment, and so on. 

Most SaaS identity products don't solve this problem directly (or easily). Instead, they force you to sign up for multiple accounts, one for each environment. That approach works, but now you have multiple accounts that may or may have a subscription fee associated with each of them. Plus, each account has separate configuration, credentials, and URLs that need to be maintained separately. And if you need to setup an additional environment, it could take quite a bit of work to get it configured properly. 

Leveraging tenants in this scenario is a big win because it allows a single instance of FusionAuth to service one to many environments, which reduces complexity, infrastructure costs, maintenance and more. If you want, each developer can have their own tenant so they can each develop, create and delete users without affecting the rest of their team. 

Here is a specific and common scenario: a customer has completed their integration, written all of their code, written all of their tests and are ready to move into production. If this same customer now wants to use tenants only for build, test and QA, they can do so without any code change. 

This is possible because of how we authenticate an API request for a particular tenant. While there is more than one way to specify a tenant Id on the API request, the simplest is to create an API key and assign it to a tenant. This way, none of your API requests change, none of your code changes, you simply load your API key from an environment variable or inject it based upon your runtime mode. Locking an API key to a tenant means that only Users, Groups and Applications in that tenant will be visible to that API key.

If you use tenants in this way, you still get the best of both worlds. When you log into the FusionAuth UI, you can manage all users across all tenants. Plus, you get full visibility and reporting across your entire system. 

It's not magic, it's just FusionAuth. ;)

## Example Code

To provide you an example of how an API request can be scoped to a tenant, consider the following code.

I have integrated some code to retrieve a user by email address in FusionAuth. I'm using the API key `5EU_q5unGCCYv6w_FipDBFevXhAxbRGaRYoxK-nP6t0`, which is assigned to tenant `funnymugs.com`. As you can see, my API call finds Jane successfully.
  
```java
FusionAuthClient client = new FusionAuthClient("5EU_q5unGCCYv6w_FipDBFevXhAxbRGaRYoxK-nP6t0", "http://localhost:9011");
ClientResponse<UserResponse, Errors> response = client.retrieveUserByLoginId("jane_smith@gmail.com");

// API response is 200, success
assertEquals(response.status, 200);
```

Next, I update my API key to `BwLzGhDTYtswDq9hK-ajohectZjFpMvmLeDT1mfiM54`, which is assigned to tenant `rentmycrane.com` and that tenant doesn't contain a user with the email address `jane_smith@gmail.com`. By changing the API key, I have scoped every API call I make to FusionAuth to a different tenant.
   
```java
FusionAuthClient client = new FusionAuthClient("BwLzGhDTYtswDq9hK-ajohectZjFpMvmLeDT1mfiM54", "http://localhost:9011");
ClientResponse<UserResponse, Errors> response = client.retrieveUserByLoginId("jane_smith@gmail.com");

// API response is 404, not found.
assertEquals(response.status, 404);
``` 

These are just some of the use-cases that the FusionAuth Tenants feature help solve. Tenants are also great for taking multiple legacy backends and unifying the identities over time, with very little risk. If you need help implementing multi-tenants in your application, [contact us directly](https://fusionauth.io/contact).  
