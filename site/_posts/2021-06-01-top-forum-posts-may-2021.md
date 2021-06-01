---
layout: blog-post
title: NextAuth, SSO with the Login API, and duplicate key errors
description: Top highlights from the FusionAuth forum in May.
author: Dan Moore
image: blogs/apr-2021-forum-highlights/forum-highlights-additional-jwt-headers-verification-emails-and-disappearing-registrations-header-image.png
category: blog
tags: topic-forum-posts
excerpt_separator: "<!--more-->"
---

The FusionAuth community has an active online forum, and I wanted to highlight some of the recent topics. In general, forum discussions focus on FusionAuth, how to solve problems with it, and how to integrate auth systems with other software and systems.

<!--more-->

If you want to participate, you need a free account. Or, check out [the forum](/community/forum/) to view current discussions. 

Here are some of the active forum posts during May 2021.

## NextAuth and FusionAuth

Post: [FusionAuth + NextAuth refresh tokens](https://fusionauth.io/community/forum/topic/1011/fusionauth-nextauth-refresh-tokens)

In this post, naughtly.keller is sharing how they are building an application with Next.js, NextAuth, FusionAuth and Hasura. In particular they are wondering about refresh tokens and how they would work in this context. They also learned about lambdas, mapping claims, the userinfo and introspect endpoints. FusionAuth team member Joshua also chimed in with some helpful feedback and links.

[Refresh tokens](https://datatracker.ietf.org/doc/html/rfc6749#section-1.5) are a part of the OAuth2 standard and allow you to mint new access tokens without requiring a user to re-authenticate. 

At the end of the day, naughtly.keller shared a few posts with their questions and progress and eventually got the integration working smoothly.

> At the end of the day, the correct implementation was so smooth I doubt it will need a tutorial.

This is the kind of post I love to read. Forums, and learning in public in general, are such great venues to share what you are stuck with, what you've tried, and the progress you've made.

## SSO with the Login API

Post: [Is there an example of how to authorize a user to an app and allow them to access after using the login API?](https://fusionauth.io/community/forum/topic/1002/is-there-an-example-of-how-to-authorize-a-user-to-an-app-and-allow-them-to-access-after-using-the-login-api)

In this post, fred.fred is asking about how to integrate an existing SSO system and FusionAuth. FusionAuth team member Joshua offers some suggestions and clarifying questions as well. The discussion also clarified the difference in functionality (particularly around SSO) between the hosted login pages and the login API.

This discussion covers a lot of ground and includes a great image that fred.fred shared diagramming their desired architecture. That's one of the things I love about working in the CIAM space. There are so many different approaches to problems; this flexibility allows you to create solutions that work for you.

At the end of the day, fred.fred found a solution which involved making "a host portal site protected by FA login, which will issue the cookies and sessions, to allow access into protected, registered content, after successful login."

## Duplicate key errors

Post: [Facing duplicate key errors on high load](https://fusionauth.io/community/forum/topic/1005/facing-duplicate-key-errors-on-high-load)

jm.oliver is using an API Gateway and FusionAuth. The API Gateway, as the name implies, protects some APIs. It does so by extracting credentials from the client request, exchanging them for a JWT from FusionAuth, and using that token for further requests from that same client. (This type of architecture is a common pattern; here's a [blog post about JWT authorization in a microservices gateway](/blog/2020/11/12/jwt-authorization-microservices-gateway/).) This system is also using [Connectors](/docs/v1/tech/connectors/) to verify the presented credentials.

After a bit of back and forth, this forum post ended up resulting in [an issue](https://github.com/FusionAuth/fusionauth-issues/issues/1231) being filed.

This issue illustrates one of the benefits of the FusionAuth community. When people use FusionAuth in different ways, they uncover issues with the software (no software package is perfect, after all). Then bugs get filed and fixed.

## Join us in the forum

If you have a question about how to use FusionAuth, a comment a blog post, or want to share feedback, please check out the [FusionAuth forums](https://fusionauth.io/community/forum/).

