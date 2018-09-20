---
layout: blog-post
title: Multi-tenancy in a Single Tenant Architecture
author: Daniel DeGroff
categories: blog
image: multi-tenancy.png
---



While FusionAuth is fundamentally a single tenant solution, we do support multiple tenants within a single tenant instance. In this post I'll outline a few of the common use cases we solve with our tenancy feature.
* [White labeled Identity](#white-label)
* [Dev, Stage and Prod](#dev-stage-prod)

{: .mt-5}

## White labeled Identity        {#white-label}

![white-label](/assets/img/blogs/white-label.png){:style="width: 250px; padding-right: 20px;"}
{: .float-right}


We have several clients that like us, are also software companies. With these clients it is very common for them to be selling Software as a Service (SaaS) which means they have many clients using a single instance of their platform.

Let's assume Acme Corp. sells a marketing communication platform which provides commerce, customer relationship management (CRM) and user management to small companies.  

Jane works for `funnymugs.com` and moonlights as a writer at `chucknorrisjokes.com`. Both of these websites buy their software from Acme Corp.

Jane may be very (unpleasantly) surprised if after getting hired at `chucknorrisjokes.com` she went to register her user and she was notified someone else had already registered with the email address `jane_smith@gmail.com`. This would be a poor user experience and not ideal for Acme Corp. While the other user is also Jane, she will not be aware of this nuance of the way Acme Corp. built their platform.


In most cases we want a user to be considered unique by their email address, think of how your Gmail address works. You have a single Google account, and you can use that set of credentials to gain access to Gmail, Blogger, YouTube, Google Play, (ahem..) Google+, Google Analytics and more. Each of these properties are considered an authenticated resource, and Google simply grants you permission to each of them based upon your credentials. 

This is how FusionAuth views the world as well, we support one to many Applications in FusionAuth which represent different authenticated resources.

However as we just saw with Acme Corp., when the platform is opaque to the end user , it is valuable to allow Acme Corp. to partition each of their clients into their own namespace. This is one of the main reasons we built FusionAuth Tenants. 

A FusionAuth tenant is simply a namespace where Applications, Groups and Users exist. Now Acme Corp. can allow Jane to create her account with a unique email address `jane_smith@gmail.com` in multiple tenants, manage her permissions, password, and user details discretely from each of their clients. 

We still strongly believe that a single tenant solution is the most secure option for our clients, so while we are still a single tenant solution, we do allow our clients to build a multi tenant solution to best suit their requirements. 


## Dev, Stage and Prod      {#dev-stage-prod}

![white-label](/assets/img/blogs/dilbert-project.png){:style="width: 650px; max-width: 650px; padding-right: 20px; padding-top: 5px;"}
{: .float-left}

For this use case, we don't have multiple clients, but instead we have a single production environment using FusionAuth.

 

However, in addition to production, we have development, build and QA. One option is to stand up a separate instance of FusionAuth for each of these use cases to ensure development does not impact the build, and build does not impact QA, and so on. 

Most SaaS based identity offerings do not solve this problem specifically and instead simply allow you to sign up for multiple accounts. That approach works, but now you have multiple accounts that may or may have a subscription fee associated with each of them, and configuration, credentials, and URLs need to be maintained separately for each of these use cases. 

Leveraging Tenants in this scenario is valuable because it allows a single instance of FusionAuth to service one to many use case, which reduces complexity, infrastructure costs, maintenance and more. If you want, each developer can have their own tenant so they can each develop, create and delete users without affecting the rest of their team. 

Here is a specific and common scenario: a customer has completed their integration, written all of their code, written all of their tests and are ready to move into production. If this same customer now wants to use tenants only for build, test and QA, they can do so without any code change. 

This is possible because of how we authenticate an API request for a particular tenant. While there is more than one way to specify a tenant Id on the API request, the simplest perhaps is to create an API key and assign it to a single tenant. This way, none of your API requests change, none of your code changes, you simply pick up your API key from an environment variable or inject it based upon your runtime mode. Locking an API key to a tenant means that only Users, Groups and Applications in that tenant will be visible to that API key.

However you still get the best of both worlds because when you log into the FusionAuth UI you have the option to manage all users across all tenants. You get the visibility and the reporting across the entire system. 

It's not magic, it's just FusionAuth.

## Example Code

To provide you an example of how an API request can be scoped to a single tenant, consider the following code.

You have integrated some code to retrieve a user by email address in FusionAuth. I'm using the API key `5EU_q5unGCCYv6w_FipDBFevXhAxbRGaRYoxK-nP6t0` which is assigned to tenant `funnymugs.com`. You can see that we find Jane successfully.
  
```java
FusionAuthClient client = new FusionAuthClient("5EU_q5unGCCYv6w_FipDBFevXhAxbRGaRYoxK-nP6t0", "http://localhost:9011");
ClientResponse<UserResponse, Errors> response = client.retrieveUserByLoginId("jane_smith@gmail.com");

// API response is 200, success
assertEquals(response.status, 200);
```


Now I have updated my API key to `BwLzGhDTYtswDq9hK-ajohectZjFpMvmLeDT1mfiM54` which is assigned to tenant `rentmycrane.com` and that tenant does not contain a user with the email address `jane_smith@gmail.com`. By simply changing the API key I have scoped every API call I make to FusionAuth to a different tenant.   
```java
FusionAuthClient client = new FusionAuthClient("BwLzGhDTYtswDq9hK-ajohectZjFpMvmLeDT1mfiM54", "http://localhost:9011");
ClientResponse<UserResponse, Errors> response = client.retrieveUserByLoginId("jane_smith@gmail.com");

// API response is 404, not found.
assertEquals(response.status, 404);
```   

We are developers ourselves, we write APIs that we would want to use ourselves. Identity doesn't have to be complicated, and it most certainly doesn't have to be expensive. Use FusionAuth for free and spend your money to hire more devs!  





