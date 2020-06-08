---
layout: blog-post
title: Tenants and whitelabelling
description: You can use tenants to ease your operational burden.
author: Dan Moore
image: blogs/fusionauth-laravel/user-registration-sign-in-laravel-fusionauth.png
category: blog
tags: client-ruby
excerpt_separator: "<!--more-->"
---

All editions of FusionAuth support multiple tenants within the same FusionAuth server. This can help ease operational burdens should you need to have logical separation between your applications.

<!--more-->

## Why would you want to set up multiple tenants?

Let’s imagine you have a SaaS application which lets people manage their todos. It’s a glorious task management application, and you sell individual accounts. 

These basic accounts all live at app.todo.com. You have FusionAuth installed, and you have a few other applications using it as the data store--a forum application, Zendesk and GSuite. 

However, a company approaches you. They want a premium edition, as they have decided that your todo application is too good to live without. They want their todo application to be separate, white labeled, and to live at todo.company1.com. They’re willing to write a big check to you every month for this application.

You realize you can offer this easily by modifying your application to respond to multiple hostnames. The logic is pretty straightforward.

But what about your users? The accounts at todo.company1.com should be entirely separate from the accounts at todo.example.com. And when you land an account at Organization2, users in todo.organization2.org should be entirely separate as well. If someone uses app.todo.com and also works at Organization2, they won’t want their tasks intermingled.

Each standalone application should look different as well. Your clients want their todo apps to match their websites. Oh, and by the way, Company1 wants users to authenticate against their ActiveDirectory database, and Organization2 wants users to be able to login with their Google account. 

_What to do?_

We got ya. You can handle this scenario in two different ways with FusionAuth.

## Separate FusionAuth servers

The first option is running separate FusionAuth server applications, each with their own database. This is a simple configuration to understand. This approach has some strengths. You can scale each server independently and have them be located in different legal jurisdictions. If you want to offer Company1 employees access to the FusionAuth administration UI, you can do so.

Operationally this choice leads to complexity. You’ll need to make sure that admin accounts, login providers, webhooks, API keys and other configuration are synced between each server. When any employee of yours who has access to these servers departs, you’ll need to make sure you remove their all the accounts--you’ll need to have a process for this. You’ll also need to automate your server rollout process so that todo.company1.com doesn’t get left behind when you upgrade your FusionAuth instances. And you’ll need some way to let your customer service folks know which server is associated with which client.

## Tenants to the rescue

An easier way is to use the tenants feature of FusionAuth. Tenants are a first class construct in FusionAuth. When you set up a new instance, there’s one tenant provided--the default tenant. And sometimes that’s enough. 

But you can create as many as you’d like. They behave, from an end user perspective, just like separate servers. Each tenant has its own email templates, themes, application configurations and users. They also have their own scoped API keys, so if you want to offer a subset of functionality, like, say, letting a customer lock a user account from a web UI you can.

When you create the second tenant, the admin UI displays a new column showing you which tenant each application is in.

Image TBD

Normally a user’s email address is unique across all of FusionAuth. But each tenant is a separate user space.

Image TBD

From the administrative perspective, there are significant benefits to using tenants. You get ample separation between each tenant. You can limit API keys and webhooks, allowing for tighter integrations between your todo application and your clients’ systems. Social login providers can be tied to a given application in a tenant. The look and feel of the login, forgot password and other pages can be customized per tenant.

But as a FusionAuth admin, you have one view into all system activity. Operations has one place to go to add new API keys. If your customer service reps need to reset a password, they don’t have to track down which FusionAuth server to sign into. Central user management makes their lives easier. You also only have one FusionAuth application to manage, upgrade and access.

## How to create tenants via API

Even better, tenant creation can be automated. When you create a customer, you can then create a corresponding tenant. When you’re doing this, you’ll want to either pass in the header or use a tenant scoped API key: https://fusionauth.io/docs/v1/tech/apis/authentication#making-an-api-request-using-a-tenant-id 

Here’s some example code which creates a new tenant based on the default tenant:

TBD example of creating tenant

The full code is available https://github.com/FusionAuth/fusionauth-example-ruby-tenant-creation This example is written in ruby, but you can use any of our client libraries TBD to automate this. You can even build in a form to allow for basic theming before the tenant is created.

## In conclusion

With tenants, you get operational simplicity as well as logical separation of data. Your ops and customer success teams will thank you for the former, while you’ll be able to whitelabel and offer premium features based on the latter. 

