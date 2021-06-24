---
layout: blog-post
title: C# API calls, SMTP configuration and authentication 
description: Top highlights from the FusionAuth forum in March.
author: Dan Moore
image: blogs/mar-2021-forum-highlights/forum-highlights-c-sharp-api-calls-smtp-configuration-and-authentication-header-image.png
category: blog
tags: topic-forum-posts client-netcore
excerpt_separator: "<!--more-->"
---

FusionAuth has an active online forum. The forum discussions vary in topic and depth, but are focused on FusionAuth, how to solve problems with it, and how to integrate auth systems with other software packages.

<!--more-->

If you want to participate, you have to sign up for a free account. Or, you can check out [the forum](/community/forum/) anonymously to see current discussion topics. 

I wanted to highlight and summarize a few of the most active forum posts of the last month.

## Logging a user in with the netcore API

Post: [Problems logging in user through C# API call](https://fusionauth.io/community/forum/topic/867/problems-logging-in-user-through-c-api-call)

In this post, Xan is working through some issues integrating FusionAuth with a C# application using ASP.NET Core BlazorServer. After some back and forth, Xan discovered that FusionAuth worked in their CLI application, but didn't in the BlazorServer app. That was a vital clue.

The root issue ended up being that some variables weren't being correctly configured. Xan was able to look at the [open source netcore client library](https://github.com/FusionAuth/fusionauth-netcore-client/) and resolve the problem.

## Discussion around web and mobile authentication

Post: [Authentication for an Application with Web Client and Mobile front-ends](https://fusionauth.io/community/forum/topic/900/authentication-for-an-application-with-web-client-and-mobile-front-ends)

In this post, Mehamm has questions about how to set up authentication across multiple applications, including a native iOS app and an ASP.NET web application. FusionAuth team member Josh has answers (and some more questions). 

Josh also dropped a link to our [expert advice on authentication flows](https://fusionauth.io/learn/expert-advice/authentication/login-authentication-workflows/). I consult these diagrams regularly when thinking about the right way to architect an application's login flows.

Mehamm and Josh discuss OAuth flows, cookies and FusionAuths' multi-tenant support, among other topics. Looks like there are still some open questions as of post time.

## SMTP credentials

Post: [Where to enter SMTP credentials](https://fusionauth.io/community/forum/842/where-to-enter-smtp-credentials)

FusionAuth can send emails for typical login flows, such as 'forgot password' and 'verify my email'. You customize these emails to match your look and feel, but they are sent by FusionAuth. Sending email requires an SMTP server; often these require a username and password to ensure they are only used by authorized programs. 

In this post, Richb201 gives feedback about the way the [SMTP configuration screen](https://fusionauth.io/docs/v1/tech/core-concepts/tenants/#email) is set up, including how the password field is not shown by default. We love hearing feedback from our users on how to improve FusionAuth.

## Join us in the forum

If you have a question about how to use FusionAuth, a comment on one of the blog posts, or want to chime in with some general feedback, please check out the [FusionAuth forums](https://fusionauth.io/community/forum/).

