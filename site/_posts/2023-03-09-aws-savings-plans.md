---
layout: blog-post
title: Save on your AWS bill with this one simple trick
description: A gentle intro to purchasing Compute Savings Plans on AWS.
author: Dan Moore
category: article
image: blogs/aws-savings-plans/ec2-meme.jpg
tags: savings-plans aws money hackfest single-tenant
excerpt_separator: "<!--more-->"
---

With only a few clicks of the mouse, I saved 16% on my company's AWS bill. Pretty sweet, eh?

This article will show you why that matters, and how I did it.

<!--more-->

## FusionAuth Cloud lets you outsource operating your authentication service

FusionAuth Cloud is one of the main ways our customers run FusionAuth for their authentication needs.

Since FusionAuth is [downloadable software](/download), running it is as simple as:

```bash
curl -o docker-compose.yml https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/docker-compose.yml
curl -o .env https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/.env
docker-compose up
```

If you have Docker installed, that's all you have to do to get a FusionAuth instance up and running.

After that, you need to integrate it with your application, typically using a standard OIDC library such as [Passport](https://www.passportjs.org/) or [Spring security](https://docs.spring.io/spring-security/reference/servlet/oauth2/client/index.html). But that's it.

You get a full featured auth server, available on your laptop, for you to build against.

### What about production?

`docker compose` is great for development.

But auth is the front door to your application, so you need it to be highly available in your production environment.

Some of the other considerations when running a FusionAuth production deployment include:

* securing the application and servers
* backups and restores
* upgrades and rollbacks
* responding to DDOS attacks
* monitoring

FusionAuth Cloud takes these tasks off your plate and puts them on to the FusionAuth team's. Now, there are many customers with the team, compliance needs, and desire to run FusionAuth themselves; we're happy to support them in doing so with [documentation](/docs/v1/tech/installation-guide/cluster) and customer support.

But many users want to offload operational burdens and security concerns. In this aspect, FusionAuth Cloud is similar to a typical software as a service (SaaS) provider.

## What's so special about auth?

But.

An authentication service is not like any old SaaS application. Depending on your integration, it is truly embedded in your application. This is why Okta consistently has [negative churn](https://investor.okta.com/static-files/8a461359-83f8-4332-9f41-eb7ee8c65c3b) on the order of 20%. Once you're committed to an auth provider, it's a fairly big project to move away.

When an auth system breaks, your users don't have access to your application. That's bad.

{% include _image.liquid src="/assets/img/blogs/aws-savings-plans/bad-time.jpg" alt="It can be unpleasant when your users cannot log in." class="img-fluid" figure=false %}

Combine these two attributes and you have expectations above and beyond those of a typical SaaS tool.

FusionAuth addresses these challenges in two different ways:

First, it explicitly lets developers control the upgrade process. Of course, when you download and install it, you control version upgrades. But this is true even in FusionAuth Cloud.

You and your engineering team pick the version of software your application integrates with. You also choose how and when to upgrade. You can thoroughly test your integration when a new version comes out, rather than testing in prod or having new features foisted on you.

Second, in FusionAuth Cloud, each customer is running on physically isolated single-tenant systems. Each FusionAuth Cloud deployment runs on separate virtual hardware, using Amazon's best of breed managed services where appropriate.

## Isolation in multi-tenant SaaS

{% include _image.liquid src="/assets/img/blogs/aws-savings-plans/isolation.jpg" alt="True isolation." class="img-fluid" figure=false %}

Let's talk about isolation. When you offer a multi-tenant solution, with different customers using your application, there are multiple approaches to isolating their data and available functionality.

* **Logical isolation** is implemented using a `tenant_id` field on tables (or using proprietary database functionality such as row level security). When a request comes in, the tenant is identified and only that tenant's data is examined by the application. This is the cheapest and easiest multi-tenant solution to run. You have one set of servers and one primary datastore in production. However, if there are any flaws in the code, everyone's data may be accessible. You can scale this system, but you can't scale any individual customer's application.
* **Container level isolation** relies on containers and other software constructs such as Kubernetes namespaces. With this option, you have one set of servers underlying the containers in a cluster, though you can also outsource running it to a public cloud provider. Each customer gets their own set of containers running the code, as well as a separate database schema or server. This is more expensive, but provides a higher level of isolation.
* **Server isolation** is when you stand up separate virtual or physical machines. The application runs on each system. You can configure network layer protections such as firewalls, which increases the level of isolation. There's also a lower chance of a noisy neighbor causing customers issues; the servers are separate. However, the operational cost is higher too.

FusionAuth Cloud is built using virtual machines, with a shared-nothing architecture. Your data is isolated not just within a database using foreign keys, but actually running on physically separate machines.

## FusionAuth Cloud and EC2

As FusionAuth Cloud grows, the FusionAuth team is responsible for more and more virtual machines.

Which brings us back to the original statement. During a [hackfest](/blog/2022/09/27/hackfests-fusionauth) a while ago, I took a look at reserved instances because I was interested in the cost savings opportunities. Most of FusionAuth's AWS spend is in EC2 and RDS. But many of our customers are on month to month contracts, and the minimum AWS reserved instance length is one year (unless you are using the reserved instances marketplace, but that makes things complex).

Our customers also choose one of 15+ AWS regions in which to deploy their FusionAuth servers. This lets them pick the region that makes sense for their performance, compliance and data sovereignty needs, while still outsourcing operations to the FusionAuth team. Reserved instances, however, are tied to an AWS region.

While we could have projected a baseline of region usage and duration and bought reserved instances based on that, it felt like a bigger project than was suitable for a hackfest.

However, after doing more research, I discovered [AWS Compute Savings Plans](https://aws.amazon.com/savingsplans/compute-pricing/). There is an EC2 version that "appl[ies] to EC2 instance usage regardless of instance family, size, AZ, Region, OS or tenancy".

Perfect!

I was able to investigate what savings we'd get using the cost explorer. 

## How much can you save?

FusionAuth Cloud adds new customers regularly, and churn happens, especially when someone tries our [Starter Plan free trial](https://fusionauth.io/pricing?step=plan&hosting=basic-cloud) and determines that FusionAuth isn't the right fit.

I wanted to avoid over optimizing and automating the purchase of these plans, so I began with a manual solution.

The [Savings plan overview](https://us-east-1.console.aws.amazon.com/cost-management/home#/savings-plans/overview) has a "Recommendations" tab. This lets you play with various options and gives you a savings amount. Doing this can help you determine if you have enough spend to make buying a plan worth your time.

For the options, I chose "Compute Savings Plans", a "1-year" term, and "No upfront" as the purchase commitment. You get a deeper discount for prepayment or a longer commitment. 

Here's a table of the discounts available to us at time of writing. Check out the Savings plans section yourself to see your discount options.

|     | No Upfront | All Upfront |
| --- | ---    | --- |
| **1 Year** | 21% | 26% |
| **3 Year** | 45% | 49% |

I could have saved more money, but these choices give us the right mix of savings and flexibility. A 21% discount on EC2 usage we already have? Yes please.

### Buying the Compute Savings plan

Here's the screen where I purchased the plan.

{% include _image.liquid src="/assets/img/blogs/aws-savings-plans/purchase-savings-plan.png" alt="The AWS cost explorer." class="img-fluid" figure=false %}

With Compute Savings plans, you are buying hours of instances, but you are paying in dollars per hour. It's a bit weird. After all, it's an AWS bill, so it can't be too straightforward.

Here's an example to make it a bit clearer.

Let's say you have 20 X1E Extra Large EC2 instances. These bad boys each cost $0.6160 per hour. I don't know what you're doing with that much RAM, but whatever.

You have $12.32/hour of spend (20*0.616). To save money, if you know you will run these servers for a year or so, use a Compute Savings plan and buy down a portion of the $12.32.  You could buy $5 of that hourly spend for $3.95, for instance (a 21% savings).

After you buy the plan, you will be billed for that $3.95 whether you run the instances or don't. Your total hourly bill is now $11.27, a savings of $1.05 or 8.5%.

AWS is thrilled when you commit to spending with them, and is willing to pay you to do it.

## Setting up a system

Because of our growth, I wanted to avoid buying a savings plan as a one and done effort. I wanted a system that was lightweight, but would save us money as more customers came on board and also preserve flexibility if we wanted to shift directions.

Instead of buying the amount recommended by AWS, I bought 50% of it. In the future, we'll do it again: purchase half of the recommended value every few months.

This will allow us to proceed towards having 100% of our usage covered by a savings plan, but we'll never get there. Similar to [Achilles and the tortoise from Zeno's paradox](https://en.wikipedia.org/wiki/Zeno%27s_paradoxes) (image credit wikipedia).

{% include _image.liquid src="/assets/img/blogs/aws-savings-plans/zeno-achilles-paradox.png" alt="Achilles and the turtle, an example of Zeno's paradox. Image credit: wikipedia." class="img-fluid" figure=false %}

After determining that would work, I documented the process so I wouldn't forget it and to allow others to do this if need be, attached it to a recurring event in my calendar, and promptly forgot about it. Every quarter or so, I get a reminder, and log into the AWS console and buy more compute hours at a discount.

This approach doesn't maximize our savings, but it does yield a useful amount of savings (approximately 16% of our bill) and gives us billing flexibility if our needs change. All at the cost of approximately 10 minutes every quarter.

I've spent more time on this blog post than I have buying Compute Savings Plans over the past year. I'll be honest, it's fun to save thousands or tens of thousands of dollars with a single click and essentially zero downside.

That's the kind of clickops I can get behind.

## Downsides of AWS Compute Savings plans

What about that downside? Well, if FusionAuth ever needed to leave AWS, we'd have to plan ahead a year or so. But migrating off any cloud provider, especially when your system is the front door for millions of your customers' customers, isn't a task you begin on a whim. So, that downside is acceptable.

We're also not saving as much as we could be. If we signed up for three years instead of one, we'd save more but lose flexibility. If we optimized, researched reserved instances (especially for RDS servers), and automated the plan purchase, we could save even more. But we've made a conscious decision to focus on growth. Spending too much time optimizing cloud spend doesn't align.

10 minutes a quarter, on the other hand, is pretty easy to find.

## Summing up

If you are running significant numbers of EC2 instances, there's very little risk in investigating and implementing cost savings plans.

Happy saving!
