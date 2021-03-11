---
layout: blog-post
title: Auth specific scaling challenges
description: What are the elements of an authentication system which make it difficult to scale?
author: James Hickey
image: blogs/security-due-diligence/authentication-as-a-service-security-due-diligence-tips-header-image.png
category: blog
excerpt_separator: "<!--more-->"
---

Modern authentication is built on hashing passwords using computationally expensive algorithms. Because of this intense CPU usage, there's a push-pull relationship between robust security and scalable solutions. Since security is so critical, and frankly nonnegotiable, you'll have to grapple with the challenges of scaling your authentication.

<!--more-->

To be a responsible and effective software engineer, you need to know how to deal with these scalability concerns while keeping your application's authentication secure. Let's look at a few of these challenges, including hashing performance, chattiness, additional security, and uptime.

_This blog post is an excerpt from [Making Sure Your Auth System Can Scale](/learn/expert-advice/identity-basics/making-sure-your-auth-system-scales/)._

### Hashing Performance

As mentioned, a standard in securely storing passwords is to iteratively rehash the password _X_ times. The amount of rehashes is often called the _work factor_. 

Having a work factor that's too low ends in hashes that are easier to attack. In the event that an attacker was able to obtain a password hash (via a breached database, SQL injection attack, etc.), it would take significantly longer for an attacker to calculate that hash. This gives more time for your company to inform users to change their passwords. It might even mean that the attackers are only able to "break" (i.e., compute) a smaller number of password hashes altogether.

However, a work factor that's too high can lead to performance degradation. This may alternatively give room for attackers to abuse these CPU-intensive operations and perform denial-of-service attacks by spamming a web application's login.

As modern computers quickly increase in power, so must your authentication solution increase its work factor (i.e., the number of hashing iterations). Again, this makes sure that password hashes are being generated securely enough. This means you may have to update existing systems and perform a migration of sorts to increase the number of hashing iterations if this hasn't been updated for quite a while.

[OWASP suggests](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#upgrading-the-work-factor) increasing the work factor by one (i.e., doubling the number of iterations) every eighteen months:

> "Taking Moore's Law (i.e., that computational power at a given price point doubles every eighteen months) as a rough approximation, this means that the work factor should be increased by 1 every eighteen months." –Upgrading the Work Factor, OWASP

Do you know how well your application is balancing its work factor versus performance?

{% include _image.liquid src="/assets/img/advice/auth-system-scale/work-factor-performance-spectrum.png" alt="The balance between the work factor and system performance." class="img-fluid" figure=false %}

### Chattiness

In distributed systems, I've often seen developers implementing dedicated services that manage authentication functionality. These services are often put behind an HTTP API. What could go wrong?

Well, without having a grasp of the pitfalls of common issues with distributed systems, you can quickly end up with ["chatty" services](https://docs.aws.amazon.com/whitepapers/latest/microservices-on-aws/chattiness.html).

Imagine an HTTP request or asynchronous process where multiple distributed services need to collaborate. Each service needs to make sure the user is authenticated, right?

{% include _image.liquid src="/assets/img/advice/auth-system-scale/auth-chattiness.png" alt="Auth microservice used by other services" class="img-fluid" figure=false %}

A system where individual services each send an HTTP request to the auth service means a lot of extra network latency and CPU/memory usage. And don't forget the additional costs that come from needing more powerful hardware to handle the extra load.

### Additional Security

While basic password-based authentication has its challenges, compliance with standards like SOC 2 or ISO certification often require that software systems implement additional security features like two-factor authentication, federation, etc.

In the scenario described earlier, adding some of these extra security features will degrade scalability even further. More network hops are involved, and more external clients are making requests to the authentication service.

{% include _image.liquid src="/assets/img/advice/auth-system-scale/additional-security.png" alt="SSO auth with increased traffic" class="img-fluid" figure=false %}

Implementing performant systems takes more thought than simply throwing everything into a "microservice".

### Uptime

If your authentication functionality is unavailable for any given time, it inevitably means that your application is unavailable, too.

This makes authentication a difficult problem: not only must it be secure and scalable, _but highly available, too._ Again, this means more hardware, more servers, and more money.

To learn about how you can can effectively scale your auth system, read [Making Sure Your Auth System Can Scale](/learn/expert-advice/identity-basics/making-sure-your-auth-system-scales/).

