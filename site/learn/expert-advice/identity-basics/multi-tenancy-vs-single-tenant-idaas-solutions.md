---
layout: advice
title: Multi-Tenant vs. Single-Tenant IDaaS Solutions
description: Choosing between multi-tenant and single-tenant IDaaS solutions comes down to an organization's business objectives and requirements. Which trade-offs are you willing to make?
author: Daniel DeGroff
header_dark: true
image: advice/multi-in-single-article.png
category: Identity Basics
---

The last few years have brought an explosion of IDaaS (Identity as a Service) solutions giving developers a wide range of choices for how they manage their users' registrations, logins, and identity. It makes sense. Identity and access management are critical components of every application, but building, testing, and maintaining a secure in-house solution can take weeks or months of senior developer hours. You don't build your own database, so why build a custom identity solution? And just like databases, there are many identity solutions to fit the different requirements of every application.

One important factor to consider when comparing identity platforms is whether you need a multi-tenant or single-tenant identity solution. The choice depends on your business model and requirements. Regulatory compliance, security, data management, and upgrade control are important considerations that will ultimately define the most effective solution for your company. Which trade-offs are you willing and able to make? Read some of the most important considerations below and decide which approach fits your business.

## Multi-Tenant

{% include _image.html src="/assets/img/advice/multi-tenant-diagram.png" alt="Multi-tenant solutions" class="float-right img-fluid mb-3" style="width: 308px;" figure=false %}

Simply put, multi-tenant is an architecture where multiple companies store their data within the same infrastructure. The entire system can span multiple servers and data centers, but most commonly data is co-mingled in a single database. The tenants are logically isolated, but physically integrated.

### Benefits
**Cost reduction** - One of the big drivers of multi-tenant IDaaS solutions is cost. The sharing of infrastructure and resources across many companies significantly reduces the overhead of the service provider, and as a result, lowers the costs imposed on customers.

**Automatic upgrades** - Multi-tenant systems ensure that software updates, including security patches, are rolled out to all customers simultaneously. This standardizes software versions utilized by customers and eliminates version control issues.

**Instant on-boarding** - In most cases, new customers can be setup by creating a new logical tenant. No new servers are provisioned and software installation is not required, which makes this process instantaneous.

### Drawbacks
**Performance** - One tenant's heavy use or load spike may impact the quality of service provided to other tenants. In addition, when software or hardware issues are found on a multi-tenant database, it can cause an outage for all customers.

**Security risk** - If a hacker gains access to one tenant's data, they can access data from every tenant because all data resides in a single database. This is an important consideration because every tenant is relying on the security practices of the weakest tenant. According to InfoWorld, "System vulnerabilities have become a bigger problem with the advent of multi-tenancy in cloud computing. Organizations share memory, databases, and other resources in close proximity to one another, creating new attack surfaces."

**Single point of failure** - If the multi-tenant system goes down (and they do regardless of what salespeople will tell you), EVERYONE goes down. Then all tenants sit and wait until the cause is determined and fixed.

**Cross-tenant data leaks** - In a multi-tenant system, simple programming errors can lead to the data from one tenant leaking into other tenants. This is specifically true for APIs. This not only poses a security risk, but it also be a legal issue since many new data privacy regulations specifically state that cross-tenant data leaks should be prohibited.

## Single-Tenant
{% include _image.html src="/assets/img/advice/single-tenant-diagram.png" alt="Single-tenant solutions" class="float-right img-fluid mb-3" style="width: 500px;" figure=false %}

In a single-tenant architecture each company, or tenant, has their own instance, separate from any other customer. With a single-tenant solution the risk of another business accidentally receiving another customer's user data is eliminated.

### Benefits
**Enhanced security** - Single-tenancy delivers true data isolation resulting in maximum privacy and enhanced security. The possibility of data leakage between tenants, whether accidentally or through sabotage, is removed making this architecture a popular choice for large enterprises. To increase security, customers can implement a firewall at any layer to protect data. For example, the identity provider APIs can be located behind a firewall while the OAuth login system resides in the public facing network.

**Regulatory compliance** - Enforcing regulatory requirements is easier due to complete control of the environment. If your company policy does not allow data to be transmitted outside of your country (i.e. German Data Regulations or GDPR regulations) a multi-tenant solution needs to be specifically designed for this. A single-tenant solution makes this as simple as installing the software on a server in Germany. Similarly, compliance with regulations such as PCI, HIPAA and SOC2 is simplified because data is secured, encrypted and protected separately for each tenant.

**Customization** - With a single-tenant architecture, the software environment can be customized to meet customer's business needs; robust plugins can be installed to maximize personalization without limitation.

**Upgrade control** - Customers have decision authority over the upgrade cycle. Customers can choose what updates they want to install and when. This adds flexibility for scheduling maintenance windows and downtime without impacting others.

**Data recovery** - Data extraction is an important consideration that is often overlooked. If a service is acquired or shutdown it's wise to consider how you will retrieve your data in advance; it is easier to export data from an isolated, single-tenant cloud.

### Drawbacks
**Cost** - Since this is not a shared infrastructure, customers have to pay the cost of the entire system (hardware and software). However, with the rise of low-cost hosting providers like AWS and Azure, single-tenant solution platforms can have very affordable [pricing options](/pricing "FusionAuth Pricing"). In light of of these considerations technology advisors TechTarget stated their support of single-tenant solutions: "Concerns over security in multi-tenant environments have led to many organizations choosing to switch to single-tenant infrastructure as a service to mitigate the risks of co-located data. Despite the extra cost, this is a sensible and advisable solution."

**Provisioning** - To set up new customers, servers must be provisioned and the software must be installed on each server. This process has been made simpler through the use of APIs provided by hosting providers and tools such as Docker, Kubernetes, and Chef.

## Multi-Tenant Within a Single-Tenant Solution

The descriptions above outline multi-tenant and single-tenant solutions at the highest level of an implementation: one company, with one set of users. While this is common, there are other use cases to consider. Here are a few use cases where multi-tenant capability WITHIN a single-tenant instance provides additional flexibility to solve additional challenges.

* [White labeled Identity](#white-label)
* [Dev, Stage and Prod](#dev-stage-prod)

## White Labeled Identity        {#white-label}

{% include _image.html src="/assets/img/blogs/white-label.png" alt="white Label Tag" class="float-right" style="width: 250px;" figure=false %}

The proliferation of powerful cloud platforms has made Software as a Service (SaaS) solutions common for all sizes and types of businesses. Functionally, this is simply a multi-tenant architecture: they have many clients using a single instance of their platform.

Let's assume Acme Corp. sells a marketing communication platform that provides commerce, customer relationship management (CRM) and user management to small companies.

Joe uses two different websites, `funnymugs.com` and `chucknorrisjokes.com`. Both of these websites buy their software from Acme Corp., and Acme Corp. provides a single identity backend that stores a single user object for Joe.

Joe will be very (unpleasantly) surprised if he changes his password on `chucknorrisjokes.com` and magically his password is updated on `funnymugs.com`. This diagram illustrates why this unexpected password change occurs when Acme Corp. is storing single user objects.

{% include _image.html src="/assets/img/blogs/password-change-tenants.png" alt="Password Change" class="img-thumbnail img-fluid" figure=false %}

This would be a poor user experience and not ideal for Acme Corp. While both users are technically Joe, he is not aware of this nuance in the method that Acme Corp. built their platform.

In most cases we want a user to be considered unique by their email address. You can think of this the same way that a Gmail address works. There is a single Google account that can use a single set of credentials to gain access to Gmail, Blogger, YouTube, Google Play, (ahem..) Google+, Google Analytics and more. Each of these applications are considered an authenticated resource, and Google simply grants the user permission to each of them based on their credentials.

This is a one to many Applications model. A single user can register or be granted permissions to multiple Applications. This is also where single sign-on comes into play. You login once and then you can access each Application without the need to log into each one separately.

{% include _image.html src="/assets/img/blogs/password-change-multi-tenant.png" alt="Password Change w/ Tenants" class="img-thumbnail img-fluid" figure=false %}

However, as you just saw with Acme Corp., when the platform is opaque to the end user and there is only a single identity for a single email address, surprising side-effects start to occur. In this case, what Acme Corp. needs is a way to partition each of their clients into their own namespace. This is one of the main reasons to use multiple tenants within a single instance.

In this case a tenant is simply a namespace where Applications, Groups and Users exist. Now Acme Corp. can allow Joe to create an account with the same unique email address `joe@example.com` in multiple tenants. They become separate unique identities, one per tenant. Joe can then manage his permissions, passwords, and user details discretely inside each tenant (i.e. each client of Acme Corp.). The second diagram illustrates the new layout of Acme Corp. using multiple tenants.


## Dev, Stage and Prod      {#dev-stage-prod}

{% include _image.html src="/assets/img/blogs/dilbert-project.png" alt="Dilbert Project" class="img-fluid" figure=false %}

For this use case, we don't have multiple clients, but instead we have a single production environment.

In addition to production, we need separate environments for development, staging and QA. One option is to stand up a separate deployment of the identity platform for each of these environments. This ensures that the development environment doesn't impact the staging environment, which doesn't impact the QA environment, and so on.

Most SaaS identity products don't solve this problem directly (or easily). Instead, they force you to sign up for multiple accounts, one for each environment. That approach works, but now you have multiple accounts that may or may have a subscription fee associated with each of them. Plus, each account has separate configuration, credentials, and URLs that need to be maintained separately. And if you need to setup an additional environment, it could take quite a bit of work to get it configured properly.

Leveraging tenants in this scenario is a big win because it allows a single instance to service multiple environments, which reduces complexity, infrastructure costs, maintenance and more. You could go as far as letting each developer have their own tenant so they can each develop, create and delete users without affecting the rest of their team.

Here is a specific and common scenario: a customer has completed their integration, written all of their code, written all of their tests and are ready to move into production. If this same customer now wants to use tenants only for staging, test and QA, they can do so without any code change.

This approach is possible when you can authenticate an API request for a particular tenant with a unique API key. This way, none of your API requests change, none of your code changes, you simply load your API key from an environment variable or inject it based on your runtime mode. Locking an API key to a tenant means that only Users, Groups and Applications in that tenant will be visible to that API key.

To provide you an example of how an API request can be scoped to a tenant, consider the following code that leverages FusionAuth's tenants to illustrate the principle.

This code retrieves a user by email address in FusionAuth. It uses the API key `5EU_q5unGCCYv6w_FipDBFevXhAxbRGaRYoxK-nP6t0`, which is assigned to tenant `funnymugs.com`. As you can see, the API call finds Joe successfully.

```java
FusionAuthClient client = new FusionAuthClient("5EU_q5unGCCYv6w_FipDBFevXhAxbRGaRYoxK-nP6t0", "http://localhost:9011");
ClientResponse<UserResponse, Errors> response = client.retrieveUserByLoginId("joe@example.com");

// API response is 200, success
assertEquals(response.status, 200);
```

Next, we can update the API key to `BwLzGhDTYtswDq9hK-ajohectZjFpMvmLeDT1mfiM54`, which is assigned to tenant `chucknorrisjokes.com` and that tenant doesn't contain a user with the email address `joe@example.com`. By changing the API key, we have scoped every FusionAuth API call to a different tenant. If you use tenants in this way, you get the best of both worlds.

```java
FusionAuthClient client = new FusionAuthClient("BwLzGhDTYtswDq9hK-ajohectZjFpMvmLeDT1mfiM54", "http://localhost:9011");
ClientResponse<UserResponse, Errors> response = client.retrieveUserByLoginId("joe@example.com");

// API response is 404, not found.
assertEquals(response.status, 404);
```

These are just some of the use cases that tenants can help solve, but there are many more. For example, when multiple firms merge or are acquired, they often need to combine multiple legacy user databases into one system. Tenants can be leveraged to do this with very low risk over time while preserving the original data from each firm. 

## Conclusion
There are benefits and drawbacks to both single-tenant and multi-tenant systems. Ultimately, a company must decide what is most important to their business and what can be sacrificed. Is cost a primary driver? Does your industry vertical have unique regulatory constraints? Is security critical for the type of data you are storing? Take the time to explicitly define your specific requirements, and then select the solution that best fits your needs.

If you have additional questions on multi-tenant and single-tenant solutions, please [contact us](https://fusionauth.io/contact "Contact Us").

{% include _advice-get-started.html intro="If you are looking for a single-tenant identity solution that supports multiple logical tenants, FusionAuth has you covered." %}
