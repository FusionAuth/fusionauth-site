---
layout: advice
title: Making Sure Your Authentication System Can Scale
description: What steps do you need to take to ensure your authentication system can scale?
author: James Hickey
image: advice/due-diligence/authentication-as-a-service-due-diligence-tips-header-image.png
category: Identity Basics
date: 2021-02-24
dateModified: 2021-02-24
---

Have you ever worked on a software system that stored passwords in plain text? I once worked on a product that stored encrypted plain-text passwords. Thankfully, this system was eventually fixed to store hashed passwords!

To make password hashes harder to compute, a standard technique is to hash passwords thousands of times before storing them in a database. But there's a trade-off: you get better security at the cost of a performance hit.

This trade-off lies at the heart of authentication. More robust security often means changes to how scalable your solution is. An increase in web traffic might expose these performance issues. If you've split your system into microservices, then you’ll be faced with other kinds of challenges, like how to authenticate services-to-service HTTP requests and share authentication logic across services. In fact, the second item on both current OWASP [Web Application Security Top Ten Risks](https://www.cloudflare.com/learning/security/threats/owasp-top-10/) and [API Security Top Ten Risks](https://owasp.org/www-project-api-security/) is *broken authentication*. 

To be a responsible and effective software engineer, you need to know how to deal with these scalability concerns while keeping your application's authentication secure. In this article, you'll get some tips on how to scale your authentication functionality and make sure it can meet the demands of your customers.

## Why Scaling Auth Is Hard

There's a push-pull relationship between robust security and scalable solutions. Since security is so critical, and frankly nonnegotiable, you’ll have to grapple with the challenges of scaling your authentication.

Let's look at a few of these challenges, including hashing performance, chattiness, additional security, and uptime.

### Hashing Performance

As mentioned, a standard in securely storing passwords is to iteratively rehash the password_X_ times. The amount of rehashes is often called the _work factor_. 

Having a work factor that's too low ends in hashes that are easier to attack. In the event that an attacker was able to obtain a password hash (via a breached database, SQL injection attack, etc.), it would take significantly longer for an attacker to calculate that hash. This gives more time for your company to inform users to change their passwords. It might even mean that the attackers are only able to “break” (i.e., compute) a smaller number of password hashes altogether.

However, a work factor that's too high can lead to performance degradation. This may alternatively give room for attackers to abuse these CPU-intensive operations and perform denial-of-service attacks by spamming a web application's login feature.

As modern computers quickly increase in power, so must your authentication solution increase its work factor (ie, the number of hashing iterations). Again, this makes sure that password hashes are being generated securely enough. This means you may have to update existing systems and perform a migration of sorts to increase the number of hashing iterations if this hasn't been updated for quite a while.

[OWASP suggests](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#upgrading-the-work-factor) increasing the work factor by one (ie, doubling the number of iterations) every eighteen months:

> “Taking Moore's Law (ie, that computational power at a given price point doubles every eighteen months) as a rough approximation, this means that the work factor should be increased by 1 every eighteen months.” –Upgrading the Work Factor, OWASP

Do you know how well your application is balancing its work factor versus performance?

{% include _image.liquid src="/assets/img/advice/auth-system-scale/work-factor-performance-spectrum.png" alt="The balance between the work factor and system performance." class="img-fluid" figure=false %}

### Chattiness

In distributed systems, I've often seen developers implementing dedicated services that manage authentication functionality. These services are often put behind an HTTP API. What could go wrong?

Well, without having a grasp of the pitfalls of common issues with distributed systems, you can quickly end up with ["chatty" services](https://docs.aws.amazon.com/whitepapers/latest/microservices-on-aws/chattiness.html).

Imagine an HTTP request or asynchronous process where multiple distributed services need to collaborate. Each service needs to make sure the user is authenticated, right?

![Auth microservice used by other services](https://i.imgur.com/wx4yAJO.png)

A system where individual services each send an HTTP request to the auth service means a lot of extra network latency and CPU/memory usage. And don't forget the additional costs that come from needing more powerful hardware to handle the extra load.

### Additional Security

While basic password-based authentication has its challenges, compliance with standards like SOC 2 or ISO certification often require that software systems implement additional security features like two-factor authentication, federation, etc.

In the scenario described earlier, adding some of these extra security features will degrade scalability even further. More network hops are involved, and more external clients are making requests to the authentication service.

![SSO auth with increased traffic](https://i.imgur.com/PpWOezx.png)

Implementing performant systems takes more thought than simply throwing everything into a "microservice."

### Uptime

If your authentication functionality is unavailable for any given time, it inevitably means that your application is unavailable, too.

This makes authentication a difficult problem: not only must it be secure and scalable, _but highly available, too._ Again, this means more hardware, more servers, and more money.

## How Can You Effectively Scale Your Authentication?

Now that you've seen some of the challenges that exist for ensuring secure authentication, let's look at how to attack these challenges. We’ll cover performance testing, modern hashing algorithms, rate limiting, database scaling, caching session data, auth tokens, API gateways, and third-party auth services.

### How Fast Should It Be?

First thing's first: how scalable and performant should your system be? Do you have any SLA agreements with your clients?

[OWASP recommends](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#work-factors) that computing a hash should not take more than one second. Does that make sense for your customers?

> “As a general rule, calculating a hash should take less than one second, although on higher traffic sites it should be significantly less than this.” –Work Factors, OWASP

Whatever you decide, you need to be able to test the performance of your authentication functionality. One specific tool I love is the open-source HTTP benchmarking tool [bombardier](https://github.com/codesenberg/bombardier). This is a great tool since it will enable you to test and benchmark the entire HTTP pipeline of your authentication endpoints. Perform such benchmarks regularly, preferably on each release of your applications, to ensure there are no performance regressions.

### Modern Hashing Algorithms

Most web frameworks have authentication out-of-the-box for you. Modern hashing algorithms are designed to be very secure and performant.

OWASP recommends using an algorithm such as [Argon2](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id), [PBKDF2](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2), or [Bcrypt](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#bcrypt).

.NET, for example, has historically [used PBKDF2 with an increase in iterations over time](https://github.com/dotnet/aspnetcore/blob/60244785aa62dd2a23a82876d26bb0a7aa6f32e8/src/Identity/Extensions.Core/src/PasswordHasher.cs#L29).

### Rate Limiting

So now you're using a modern hashing algorithm to hash user passwords. What happens when an attacker sends in a flood of HTTP traffic to your authentication end points?

Individual HTTP requests seem to work fine, but a flood of hundreds and thousands of HTTP requests over a small window of time can bring a system to its knees. Since computing a hash is CPU intensive, this is often an easy target for attackers. How could you defend against this?

Rate limiting is an effective defense against these kinds of attacks. It also ensures the performance of your application's authentication will be more stable on average.

Rate limiting simply means restricting an IP address so it can only try signing in to your application once every _X_ milliseconds/seconds. This technique can help ensure that individual attackers can’t flood your system with authentication requests. Depending on your authentication system and system architecture, you can rate limit at:

The network layer using an ACL or a CDN
A proxy, such as nginx, in front of your auth system
Inside the auth system itself

### Database Scaling

Perhaps your application has grown to the point where you might need multiple web application processes running behind a load balancer. All of these processes are communicating with the same database.

![Database load](https://i.imgur.com/IP5oyET.png)

When your customers (or attackers) try to log in to your application, every login attempt will need to fetch the password hash from the database. Eventually, this may expose that the database has become a bottleneck in your system.

Typical database scaling techniques, like using read replicas or sharding, can help make your application and its authentication functionality more scalable.

Read replicas are like having dedicated secondary instances of your database available for reads. All writes will go to the primary database instance, and changes will be pushed out to the read replicas behind the scenes. The overall traffic to your database will be spread across all instances/replicas.

![Read replicas reduce load on primary database instance](https://i.imgur.com/yh06JMa.png)

Sharding is another technique where individual records are stored to separate storage locations or database instances based on some algorithm or method of segmenting data.

![Sharding database instances based on username first letter](https://i.imgur.com/LnYHzKX.png)

### Caching Session Data

One of the most common performance optimizations you might be able to make in web applications is to cache your user session data. Almost every HTTP request to a typical web application will need to verify that a valid session for the user exists.

Out-of-the-box web frameworks usually store user session data in a database. While database scalability optimizations will help (like read replicas and sharding), using a dedicated caching technology can significantly increase the performance of fetching user session data on every HTTP request.

[Redis](https://redis.io/) is a fantastic technology that’s often used as a distributed cache for solving issues like this.

![In-memory key-value database used to store user sessions](https://i.imgur.com/qOH4Ogc.png)

By caching user sessions in this way, you can reduce the overall load of the primary database and/or server that houses your authentication data (e.g., password hashes). If your authentication, for example, is housed as a microservice, then this technique could have a large impact on how well your authentication system can scale.

### Auth Tokens

One of the challenges mentioned earlier in this article was around microservices having to ensure that any given request is authorized to perform the requested operation. The same would apply to any type of distributed system that’s using the same distributed authentication/authorization HTTP service.

The main issue is that your authorization service becomes a bottleneck. Everyone needs to send an HTTP request to this service to verify its own external requests coming in. What if there was a way you could verify that the request was authorized without having to make all those extra HTTP requests?

Digitally signed tokens such as [JWTs](https://jwt.io/) can be verified by backend server code without communicating with the auth system. By using a private/public key or a secret, you can enable various services to verify a given token within the same process and avoid those extra network hops.

One way to do this is to create a shared code library that can run in-process and verify incoming JWT tokens.

![Library verifying JWT incoming tokens](https://i.imgur.com/NEXBmnr.png)

### API Gateways

There may be situations where you have dedicated web servers or services that handle incoming HTTP traffic. That service will verify that the requested action is allowed and then delegate work to one or more internal services. 

That is called an API gateway. For large solutions, often a dedicated API gateway service from Amazon, Azure, etc. might be used. You can think of it as a lightweight "bouncer" that makes sure incoming HTTP requests are allowed in and can perform authorization checks once.

If all your internal distributed services are behind a protected network, then they can trust that the API gateway has already vetted the client. This removes the need for a service to communicate with the auth system to ensure the client is authorized, leading to less work for the authentication system and for the service.

![API gateway authenticating HTTP requests up front](https://i.imgur.com/lSzwnPH.png)
     
### Third-Party Services

Many organizations choose to leverage third-party auth services like [FusionAuth](https://fusionauth.io/), [Okta](https://www.okta.com/), [Auth0](https://auth0.com/), etc. Building your own SSO, user role management, two-factor authentication, token signing, performance optimizations, and so on is tedious, time-consuming, and potentially dangerous. By leveraging auth services created by experts, you don't have to worry about many of these scalability issues. You also get the peace of mind knowing that your authentication is done properly.

You can combine some of the scalability techniques covered by this article with third-party services, too. For example, FusionAuth can give you tools to generate JWT tokens and still allow you to [verify tokens in your server code](https://github.com/fusionauth/fusionauth-jwt#verify-and-decode-a-jwt-using-hmac).


## Conclusion

If you think that authentication and authorization are hard, it's because they are! Considering that broken authentication is the No. 2 OWASP security risk for web applications and APIs, you want to make sure that you do authentication well and that it can scale as your application grows. Make sure your engineering team is willing and able to spend the time to ensure that your authentication system doesn’t become a bottleneck; alternatively invest in a third party system which can offload these concerns from your team.






