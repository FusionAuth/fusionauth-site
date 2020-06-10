---
layout: blog-post
title: Tenants and private labeling
description: You can use tenants to ease your operational burden.
author: Dan Moore
image: blogs/fusionauth-laravel/user-registration-sign-in-laravel-fusionauth.png
category: blog
tags: client-ruby
excerpt_separator: "<!--more-->"
---

Sometimes you just need some separation, right? Tenants in FusionAuth can provide logical separation of users and applications while letting you manage everything from one FusionAuth installation.

<!--more-->

All editions of FusionAuth support multiple tenants within the same FusionAuth installation. Using this feature eases operational burdens while still maintaining logical divisions.

## Why would you want to set up multi-tenant FusionAuth?

Let's pretend you have a SaaS application which lets people manage their todos. It's a glorious task management application. You started off selling individual accounts, which are supported by an application at app.todo.com. You have FusionAuth installed, and you have a other applications using it as the data store: a [forum application](/blog/2020/05/13/setting-up-single-sign-on-for-nodebb), [Zendesk](/docs/v1/tech/samlv2/zendesk) for customer support and [GSuite](/docs/v1/tech/samlv2/google). 

However, imagine Company1, a large multi national corporation with a big checkbook, approaches you. They want a premium edition; they have decided that your todo application is too good to live without. They want their application to be separate, private labeled, and located at todo.company1.com. They're willing to pay a premium price for this application.

You realize you can offer this easily by modifying your application to respond to multiple hostnames. The logic is pretty straightforward.

But what about your users? The accounts at todo.company1.com should be entirely separate from the accounts at app.todo.com. What if the CEO of Company1 already has an account at app.todo.com and signs up for the corporate account? They  don't want to mix personal and business tasks. Further, suppose you sell Organization2 a premium todo application as well. Users in todo.organization2.org should be entirely separate too. 

Each standalone application's login pages should look different as well. Your clients want their apps customized to match their websites. Oh, and by the way, Company1 wants users to authenticate against their ActiveDirectory database, and Organization2 wants users to be able to login with their Google account. 

_What to do?_

We got ya. You can handle this scenario in two different ways with FusionAuth.

## Separate FusionAuth servers

The first option is running separate FusionAuth installations, each with their own database. This is easy to understand and has some strengths: 

* You can scale each installation independently. 
* The installations can be located in different legal jurisdictions. 
* The FusionAuth admin UI can be made available to clients.

However, operationally this choice leads to complexity. There's the cost of running and maintaining the different servers. You'll need to make sure that admin accounts, login providers, webhooks, API keys and other configuration are synced between each server. When any employee of yours who has access to these servers departs, you'll need to ensure you remove all their accounts. You'll also need to automate your server rollout process so that todo.company1.com doesn't get left behind when you upgrade. And you'll need some way to let your customer service folks know which installation is associated with which client, so that when a request comes in to reset a password, they aren't hunting across different ones.

## Tenants to the rescue

An easier way is to use tenants. Tenants are a first class construct in FusionAuth. When you set up a new instance, there's one tenant provided: the default one. And sometimes that's enough. 

But you can create as many as you'd like. From the perspective of user signing in, each tenant is like a separate installation. Each tenant has its own email templates, themes, application configurations and users. They also have their own scoped API keys, so if you want to offer a subset of functionality to a client, you can. You could, for example, build a simple admin webapp to let a client lock one of their users' accountsi, and be assured that the API key used wouldn't be valid for any other tenant.

When you create the second tenant, the admin UI displays a new column showing you with which tenant each application is associated.

Image TBD

Normally a user's email address is unique across all of FusionAuth. But each tenant is a separate user space, so you can have two different user accounts.

Image TBD

For the administrators of the user management system, there are significant benefits with tenants. You get ample separation between each tenant. You can limit API keys and webhooks, allowing for tighter integrations between your todo application and your clients' systems. Social login providers can be tied to a given application in a tenant. The look and feel of the login, forgot password and other pages can be customized per tenant.

But as an admin, you have one view into all system activity. Operations has one place to go to add new API keys or webhooks. If your customer service reps need to reset a password, they don't have to track down the correct FusionAuth installation. Central user management makes their lives easier. You also only have one FusionAuth instance to manage, secure, and upgrade.

## How to create tenants via API

Even better, tenant creation can be automated. Every time you sell a premium todo app subscription, create a corresponding tenant. Here's some sample code:

```ruby

def create_new_tenant(generic_tenant_client, name)
  # create a new tenant based on the default tenant
  tenants_response = generic_tenant_client.retrieve_tenants
  if tenants_response.status != 200
    puts "Unable to retrieve tenants."
    return
  end

  default_tenant_id = tenants_response.success_response.tenants.select { |t| t.name == 'Default' }[0].id
  default_tenant_theme_id = tenants_response.success_response.tenants.select { |t| t.name == 'Default' }[0].themeId

  new_tenant_request = { "sourceTenantId": default_tenant_id, tenant: {"name": "New client - "+name }}
  new_tenant_response = generic_tenant_client.create_tenant(nil, new_tenant_request)

  if new_tenant_response.status != 200
    puts "Unable to create tenant."
    puts new_tenant_response.error_response
    return false
  end
  new_tenant = new_tenant_response.success_response.tenant
  [default_tenant_theme_id, new_tenant]
end
```

In this code, we find the tenant with the name `Default` and create a new tenant. We also pass back a theme id, which we can use to automatically create a new theme for this tenant. The full [code is available](https://github.com/FusionAuth/fusionauth-example-ruby-tenant-creation) if you want to take a look. This example is written in ruby, but you can use any of our [client libraries](/docs/v1/tech/client-libraries/) to automate this process. 

## Caveats

Once you create a second tenant, all API access needs to [pass in tenant information](/docs/v1/tech/apis/authentication#making-an-api-request-using-a-tenant-id). This isn't too hard, but something to be aware of. 

## In conclusion

With tenants, you get operational simplicity as well as logical separation of data. Your ops and customer success teams will thank you for the former, and you'll be able to private label your offering because of the latter.
